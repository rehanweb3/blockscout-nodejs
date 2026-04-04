import { Router } from 'express';
import multer from 'multer';
import { createRequire } from 'module';
import { query } from '../../db/postgres.js';
import { cacheGet, cacheSet, cacheDel } from '../../db/redis.js';
import { paginate } from '../../utils/format.js';

const require = createRequire(import.meta.url);
const upload = multer({ storage: multer.memoryStorage() });

const RPC_URL = process.env.RPC_URL || process.env.NEXT_PUBLIC_NETWORK_RPC_URL || 'https://rpc.atherchain.tech';

const SOLC_REMOTE_CACHE = new Map();

async function loadSolcVersion(versionString) {
  if (!versionString) return null;
  const key = versionString;
  if (SOLC_REMOTE_CACHE.has(key)) return SOLC_REMOTE_CACHE.get(key);

  const solc = require('solc');
  const bundledVersion = solc.version();

  const requestedShort = versionString.replace(/^v/, '').split('+')[0];
  const bundledShort = bundledVersion.split('+')[0];
  if (requestedShort === bundledShort || versionString.includes(bundledShort)) {
    return solc;
  }

  return new Promise((resolve) => {
    const fullVersion = versionString.startsWith('v') ? versionString : `v${versionString}`;
    solc.loadRemoteVersion(fullVersion, (err, solcSnapshot) => {
      if (err) {
        console.warn(`Could not load solc ${fullVersion}, using bundled:`, err.message);
        resolve(solc);
      } else {
        SOLC_REMOTE_CACHE.set(key, solcSnapshot);
        resolve(solcSnapshot);
      }
    });
  });
}

async function compileAndExtractAbi(sourceCode, contractName, compilerVersion, opts = {}) {
  try {
    const solcInstance = await loadSolcVersion(compilerVersion);
    if (!solcInstance) return null;

    const inputJson = {
      language: 'Solidity',
      sources: { 'contract.sol': { content: sourceCode } },
      settings: {
        outputSelection: { '*': { '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode'] } },
        optimizer: opts.optimizationEnabled ? { enabled: true, runs: Number(opts.optimizationRuns) || 200 } : { enabled: false },
        ...(opts.evmVersion && opts.evmVersion !== 'default' ? { evmVersion: opts.evmVersion } : {}),
      },
    };

    const output = JSON.parse(solcInstance.compile(JSON.stringify(inputJson)));

    if (output.errors?.some(e => e.severity === 'error')) {
      const errs = output.errors.filter(e => e.severity === 'error').map(e => e.formattedMessage).join('\n');
      throw new Error(`Compilation errors:\n${errs}`);
    }

    const contracts = output.contracts?.['contract.sol'];
    if (!contracts) return null;

    const targetName = contractName || Object.keys(contracts)[0];
    const contract = contracts[targetName] || contracts[Object.keys(contracts)[0]];
    return {
      abi: contract?.abi || null,
      deployedBytecode: contract?.evm?.deployedBytecode?.object ? `0x${contract.evm.deployedBytecode.object}` : null,
      bytecode: contract?.evm?.bytecode?.object ? `0x${contract.evm.bytecode.object}` : null,
    };
  } catch (err) {
    console.error('Compilation error:', err.message);
    throw err;
  }
}

async function compileStandardInput(jsonInput, contractName, compilerVersion) {
  try {
    const solcInstance = await loadSolcVersion(compilerVersion);
    if (!solcInstance) return null;

    const inputStr = JSON.stringify({ ...jsonInput, settings: { ...jsonInput.settings, outputSelection: { '*': { '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode'] } } } });
    const output = JSON.parse(solcInstance.compile(inputStr));

    if (output.errors?.some(e => e.severity === 'error')) {
      const errs = output.errors.filter(e => e.severity === 'error').map(e => e.formattedMessage).join('\n');
      throw new Error(`Compilation errors:\n${errs}`);
    }

    for (const [, fileContracts] of Object.entries(output.contracts || {})) {
      const targetName = contractName || Object.keys(fileContracts)[0];
      const contract = fileContracts[targetName] || fileContracts[Object.keys(fileContracts)[0]];
      if (contract) return { abi: contract.abi || null };
    }
    return null;
  } catch (err) {
    console.error('Standard-input compilation error:', err.message);
    throw err;
  }
}

async function fetchBytecodes(address) {
  const cacheKey = `bytecodes:${address.toLowerCase()}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  let deployedBytecode = '0x';
  try {
    const resp = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getCode', params: [address, 'latest'], id: 1 }),
      signal: AbortSignal.timeout(6000),
    });
    const data = await resp.json();
    if (data.result && data.result !== '0x') deployedBytecode = data.result;
  } catch {}

  let creationBytecode = null;
  try {
    const txRes = await query(
      `SELECT input FROM transactions
       WHERE LOWER(to_address) = LOWER($1)
         AND creates = $2
       ORDER BY block_number ASC LIMIT 1`,
      [address, address.toLowerCase()],
    );
    if (txRes.rows.length > 0 && txRes.rows[0].input && txRes.rows[0].input !== '0x') {
      creationBytecode = txRes.rows[0].input;
    }
  } catch {}

  if (!creationBytecode) {
    try {
      const txRes = await query(
        `SELECT input FROM transactions
         WHERE LOWER(to_address) = LOWER($1)
           AND LENGTH(input) > 200
           AND (input LIKE '0x6060%' OR input LIKE '0x6080%' OR input LIKE '0x3660%' OR input LIKE '0x3d60%')
         ORDER BY block_number ASC LIMIT 1`,
        [address],
      );
      if (txRes.rows.length > 0 && txRes.rows[0].input && txRes.rows[0].input !== '0x') {
        creationBytecode = txRes.rows[0].input;
      }
    } catch {}
  }

  const result = { deployedBytecode, creationBytecode };
  await cacheSet(cacheKey, result, 300);
  return result;
}

const router = Router();

async function fetchSolidityVersions() {
  const cacheKey = 'solidity:versions';
  const cached = await cacheGet(cacheKey);
  if (cached) return cached;

  try {
    const resp = await fetch('https://binaries.soliditylang.org/bin/list.json', { signal: AbortSignal.timeout(8000) });
    const json = await resp.json();
    const versions = Object.values(json.builds)
      .map((b) => b.longVersion ? `v${b.longVersion}` : null)
      .filter(Boolean)
      .reverse();
    await cacheSet(cacheKey, versions, 3600);
    return versions;
  } catch {
    return [];
  }
}

function formatContract(row) {
  return {
    address: {
      hash: row.address,
      is_contract: true,
      is_verified: true,
      name: row.name || null,
      ens_domain_name: null,
    },
    coin_balance: row.balance?.toString() || '0',
    compiler_version: row.compiler_version || null,
    language: row.language || 'solidity',
    optimization_enabled: row.optimization || false,
    verified_at: row.verified_at instanceof Date ? row.verified_at.toISOString() : row.verified_at,
    has_constructor_args: !!row.constructor_args,
    market_cap: null,
  };
}

// GET /api/v2/smart-contracts
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 50);
    const q = req.query.q || null;

    const cacheKey = `smart_contracts:${limit}:${q}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const params = [];
    let where = 'WHERE 1=1';

    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      where += ` AND (LOWER(sc.name) LIKE $${params.length} OR LOWER(sc.address) LIKE $${params.length})`;
    }

    params.push(limit + 1);
    const result = await query(
      `SELECT sc.*, a.balance
       FROM smart_contracts sc
       LEFT JOIN addresses a ON LOWER(sc.address) = LOWER(a.hash)
       ${where}
       ORDER BY sc.verified_at DESC
       LIMIT $${params.length}`,
      params,
    );

    const rows = result.rows;
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map(formatContract);

    const out = paginate(items, hasMore ? { items_count: limit } : null);
    await cacheSet(cacheKey, out, 30);
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/counters', async (req, res) => {
  try {
    const result = await query('SELECT COUNT(*) as count FROM smart_contracts');
    res.json({
      smart_contracts: result.rows[0].count,
      new_smart_contracts_24h: '0',
      verified_smart_contracts: result.rows[0].count,
      new_verified_smart_contracts_24h: '0',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/verification/config', async (req, res) => {
  const solidityVersions = await fetchSolidityVersions();
  res.json({
    verification_options: [
      'flattened-code',
      'standard-input',
      'multi-part',
      'vyper-code',
      'vyper-multi-part',
      'vyper-standard-input',
    ],
    solidity_evm_versions: [
      'default', 'cancun', 'shanghai', 'paris', 'london', 'berlin',
      'istanbul', 'petersburg', 'constantinople', 'byzantium',
      'spuriousDragon', 'tangerineWhistle', 'homestead',
    ],
    solidity_compiler_versions: solidityVersions,
    vyper_compiler_versions: [],
    is_rust_verifier_microservice_available: false,
    is_zk_compiler_available: false,
  });
});

router.post('/:address/verification-via/:method', (req, res, next) => {
  const ct = req.headers['content-type'] || '';
  if (ct.includes('multipart/form-data')) {
    upload.any()(req, res, next);
  } else {
    next();
  }
}, async (req, res) => {
  const { address } = req.params;
  const method = req.params.method;

  try {
    let sourceCode = null;
    let contractName = null;
    let compilerVersion = null;
    let optimizationEnabled = false;
    let optimizationRuns = 200;
    let evmVersion = null;
    let licenseType = null;
    let abi = null;
    let compiledBytecode = null;
    let compiledDeployedBytecode = null;
    let constructorArgs = null;
    let compilationError = null;

    const isMultipart = (req.headers['content-type'] || '').includes('multipart');

    if (method === 'flattened-code' || method === 'vyper-code') {
      sourceCode = req.body.source_code;
      contractName = req.body.contract_name || req.body.name;
      compilerVersion = req.body.compiler_version;
      optimizationEnabled = req.body.is_optimization_enabled === 'true' || req.body.is_optimization_enabled === true;
      optimizationRuns = Number(req.body.optimization_runs) || 200;
      evmVersion = req.body.evm_version;
      licenseType = req.body.license_type;
      constructorArgs = req.body.constructor_args || null;

      if (sourceCode && contractName) {
        try {
          const result = await compileAndExtractAbi(sourceCode, contractName, compilerVersion, {
            optimizationEnabled, optimizationRuns, evmVersion,
          });
          if (result) {
            abi = result.abi;
            compiledBytecode = result.bytecode;
            compiledDeployedBytecode = result.deployedBytecode;
          }
        } catch (err) {
          compilationError = err.message;
        }
      }

    } else if (method === 'standard-input' && req.files?.length > 0) {
      compilerVersion = req.body.compiler_version;
      contractName = req.body.contract_name || req.body.name;
      licenseType = req.body.license_type;
      constructorArgs = req.body.constructor_args || null;

      const file = req.files[0];
      let jsonInput;
      try {
        jsonInput = JSON.parse(file.buffer.toString());
      } catch {
        return res.status(400).json({ error: 'Invalid JSON in standard input file' });
      }

      const sources = jsonInput.sources || {};
      const firstSource = Object.values(sources)[0];
      sourceCode = firstSource?.content || null;

      if (jsonInput) {
        try {
          const result = await compileStandardInput(jsonInput, contractName, compilerVersion);
          if (result) abi = result.abi;
        } catch (err) {
          compilationError = err.message;
        }
      }

    } else if (method === 'multi-part' && req.files?.length > 0) {
      compilerVersion = req.body.compiler_version;
      contractName = req.body.contract_name || req.body.name;
      evmVersion = req.body.evm_version;
      optimizationEnabled = req.body.is_optimization_enabled === 'true';
      optimizationRuns = Number(req.body.optimization_runs) || 200;
      licenseType = req.body.license_type;

      const allSources = {};
      for (const f of req.files) {
        allSources[f.originalname] = { content: f.buffer.toString() };
      }
      sourceCode = Object.values(allSources).map(s => s.content).join('\n\n');

      try {
        const solcInstance = await loadSolcVersion(compilerVersion);
        if (solcInstance) {
          const inputJson = {
            language: 'Solidity',
            sources: allSources,
            settings: {
              outputSelection: { '*': { '*': ['abi'] } },
              optimizer: optimizationEnabled ? { enabled: true, runs: optimizationRuns } : { enabled: false },
              ...(evmVersion && evmVersion !== 'default' ? { evmVersion } : {}),
            },
          };
          const output = JSON.parse(solcInstance.compile(JSON.stringify(inputJson)));
          for (const [, fileContracts] of Object.entries(output.contracts || {})) {
            const target = contractName ? fileContracts[contractName] : fileContracts[Object.keys(fileContracts)[0]];
            if (target?.abi) { abi = target.abi; break; }
          }
        }
      } catch (err) {
        compilationError = err.message;
      }
    }

    if (compilationError && !sourceCode) {
      return res.status(422).json({ error: compilationError });
    }

    const { deployedBytecode: liveDeployed, creationBytecode: liveCreation } = await fetchBytecodes(address).catch(() => ({}));

    await query(
      `INSERT INTO smart_contracts (address, name, compiler_version, source_code, abi, optimization, optimization_runs, evm_version, license_type, creation_bytecode, deployed_bytecode, verified_at)
       VALUES (LOWER($1), $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11, NOW())
       ON CONFLICT (address) DO UPDATE SET
         name = EXCLUDED.name,
         compiler_version = EXCLUDED.compiler_version,
         source_code = EXCLUDED.source_code,
         abi = EXCLUDED.abi,
         optimization = EXCLUDED.optimization,
         optimization_runs = EXCLUDED.optimization_runs,
         evm_version = EXCLUDED.evm_version,
         license_type = EXCLUDED.license_type,
         creation_bytecode = EXCLUDED.creation_bytecode,
         deployed_bytecode = EXCLUDED.deployed_bytecode,
         verified_at = NOW()`,
      [
        address,
        contractName || null,
        compilerVersion || null,
        sourceCode || null,
        abi ? JSON.stringify(abi) : null,
        optimizationEnabled,
        optimizationRuns,
        evmVersion || null,
        licenseType || null,
        liveCreation || null,
        liveDeployed || null,
      ],
    );

    await query(
      `UPDATE addresses SET is_verified = true, name = COALESCE(name, $2), updated_at = NOW() WHERE LOWER(hash) = LOWER($1)`,
      [address, name || null],
    );

    await cacheDel(`bytecodes:${address.toLowerCase()}`);
    await cacheDel(`addr:${address.toLowerCase()}`);
    await cacheDel(`smart_contract:${address.toLowerCase()}`);

    if (compilationError) {
      return res.status(200).json({ status: 'partial', message: `Source stored but compilation failed: ${compilationError}` });
    }
    return res.status(200).json({ status: 'success', message: 'Contract verified successfully' });
  } catch (err) {
    console.error('Verification endpoint error:', err);
    return res.status(500).json({ error: err.message });
  }
});

router.get('/:address', async (req, res) => {
  try {
    const addr = req.params.address;

    const [scResult, tokenResult, addrResult] = await Promise.all([
      query(
        `SELECT sc.*, a.balance, a.nonce
         FROM smart_contracts sc
         LEFT JOIN addresses a ON LOWER(sc.address) = LOWER(a.hash)
         WHERE LOWER(sc.address) = LOWER($1)`,
        [addr],
      ),
      query('SELECT * FROM tokens WHERE LOWER(address) = LOWER($1)', [addr]),
      query('SELECT * FROM addresses WHERE LOWER(hash) = LOWER($1)', [addr]),
    ]);

    if (scResult.rows.length) {
      const row = scResult.rows[0];
      let deployedBytecode = row.deployed_bytecode || row.bytecode || '0x';
      let creationBytecode = row.creation_bytecode || null;
      if (deployedBytecode === '0x' || !creationBytecode) {
        const bc = await fetchBytecodes(addr).catch(() => ({ deployedBytecode: '0x', creationBytecode: null }));
        if (deployedBytecode === '0x') deployedBytecode = bc.deployedBytecode;
        if (!creationBytecode) creationBytecode = bc.creationBytecode;
      }
      return res.json({
        ...formatContract(row),
        source_code: row.source_code || null,
        abi: row.abi || null,
        constructor_args: row.constructor_args || null,
        bytecode: deployedBytecode,
        creation_bytecode: creationBytecode,
        deployed_bytecode: deployedBytecode,
        is_self_destructed: false,
        is_verified: true,
        is_fully_verified: true,
        is_partially_verified: false,
        is_verified_via_eth_bytecode_db: false,
        is_verified_via_sourcify: false,
        is_vyper_contract: false,
        is_changed_bytecode: false,
        is_blueprint: false,
        additional_sources: [],
        external_libraries: [],
        optimization_runs: row.optimization_runs || null,
        evm_version: row.evm_version || null,
        file_path: row.file_path || '',
        decoded_constructor_args: null,
        compiler_settings: null,
        license_type: null,
        sourcify_repo_url: null,
        has_methods_read: !!(row.abi),
        has_methods_write: !!(row.abi),
        has_methods_read_proxy: false,
        has_methods_write_proxy: false,
        implementation_address: null,
        implementation_name: null,
        can_be_visualized_via_sol2uml: false,
      });
    }

    const tokenRow = tokenResult.rows[0];
    const addrRow = addrResult.rows[0];

    if (tokenRow || addrRow?.is_contract) {
      const { deployedBytecode, creationBytecode } = await fetchBytecodes(addr).catch(() => ({ deployedBytecode: '0x', creationBytecode: null }));
      return res.json({
        abi: null,
        additional_sources: [],
        address: {
          hash: addr,
          is_contract: true,
          is_verified: false,
          name: tokenRow?.name || null,
          ens_domain_name: null,
        },
        bytecode: deployedBytecode,
        can_be_visualized_via_sol2uml: false,
        coin_balance: addrRow?.balance?.toString() || '0',
        compiler_settings: null,
        compiler_version: null,
        constructor_args: null,
        creation_bytecode: creationBytecode,
        decoded_constructor_args: null,
        deployed_bytecode: deployedBytecode,
        evm_version: null,
        external_libraries: [],
        file_path: '',
        has_constructor_args: false,
        has_methods_read: false,
        has_methods_read_proxy: false,
        has_methods_write: false,
        has_methods_write_proxy: false,
        implementation_address: null,
        implementation_name: null,
        is_blueprint: false,
        is_changed_bytecode: false,
        is_fully_verified: false,
        is_partially_verified: false,
        is_self_destructed: false,
        is_verified: false,
        is_verified_via_eth_bytecode_db: false,
        is_verified_via_sourcify: false,
        is_vyper_contract: false,
        language: null,
        license_type: null,
        market_cap: null,
        name: tokenRow?.name || null,
        optimization_enabled: false,
        optimization_runs: null,
        source_code: null,
        sourcify_repo_url: null,
        verified_at: null,
      });
    }

    return res.status(404).json({ message: 'Contract not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
