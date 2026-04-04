import { ethers } from 'ethers';
import { getPool, query, initSchema } from '../db/postgres.js';
import { Log, InternalTx, connectMongo } from '../db/mongo.js';
import { getRedis, cacheSet, cacheDel } from '../db/redis.js';
import { logger } from '../utils/logger.js';

const RPC_URL = process.env.RPC_URL || process.env.NEXT_PUBLIC_NETWORK_RPC_URL;
const WS_URL = process.env.WS_URL || process.env.NEXT_PUBLIC_NETWORK_WS_URL;
const DEBUG_RPC_URL = process.env.DEBUG_RPC_URL || RPC_URL;

// ERC-20/721 Transfer event signature
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
// ERC-20 ABI for decoding
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
];

const BATCH_SIZE = 5;
const CONFIRMATIONS = 2;
const BALANCE_UPDATE_INTERVAL = 50;

let provider;
let wsProvider;
let running = false;
let blocksSinceBalanceUpdate = 0;

async function getProvider() {
  if (provider) return provider;
  if (!RPC_URL) {
    logger.warn('No RPC_URL configured. Indexer will not sync blocks.');
    return null;
  }
  try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    await provider.getBlockNumber();
    logger.info(`Connected to RPC: ${RPC_URL}`);
    return provider;
  } catch (err) {
    logger.error('Failed to connect to RPC:', err.message);
    return null;
  }
}

async function getWsProvider() {
  if (!WS_URL) return null;
  if (wsProvider) return wsProvider;
  try {
    wsProvider = new ethers.WebSocketProvider(WS_URL);
    logger.info(`Connected to WS: ${WS_URL}`);
    return wsProvider;
  } catch (err) {
    logger.warn('WS connection failed, using polling:', err.message);
    return null;
  }
}

async function getIndexerState(key) {
  const res = await query('SELECT value FROM indexer_state WHERE key = $1', [key]);
  return res.rows[0]?.value || null;
}

async function setIndexerState(key, value) {
  await query(
    `INSERT INTO indexer_state(key, value, updated_at)
     VALUES($1, $2, NOW())
     ON CONFLICT(key) DO UPDATE SET value = $2, updated_at = NOW()`,
    [key, value.toString()],
  );
}

// Try to fetch token metadata and upsert into tokens table
async function ensureToken(p, tokenAddress, tokenType) {
  try {
    const existing = await query('SELECT address FROM tokens WHERE LOWER(address) = LOWER($1)', [tokenAddress]);
    if (existing.rows.length) {
      // Trigger backfill if not done yet (runs in background)
      setImmediate(() => backfillTokenTransfers(p, tokenAddress).catch(() => {}));
      return;
    }

    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, p);
    const [name, symbol, decimals, totalSupply] = await Promise.allSettled([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
      contract.totalSupply(),
    ]);

    await query(
      `INSERT INTO tokens(address, name, symbol, decimals, total_supply, token_type)
       VALUES($1, $2, $3, $4, $5, $6)
       ON CONFLICT(address) DO UPDATE SET
         name = COALESCE(EXCLUDED.name, tokens.name),
         symbol = COALESCE(EXCLUDED.symbol, tokens.symbol),
         total_supply = COALESCE(EXCLUDED.total_supply, tokens.total_supply)`,
      [
        tokenAddress.toLowerCase(),
        name.status === 'fulfilled' ? name.value : null,
        symbol.status === 'fulfilled' ? symbol.value : null,
        decimals.status === 'fulfilled' ? Number(decimals.value) : 18,
        totalSupply.status === 'fulfilled' ? totalSupply.value.toString() : null,
        tokenType || 'ERC-20',
      ],
    );
  } catch {
    // If we can't get token metadata, insert minimal record
    try {
      await query(
        `INSERT INTO tokens(address, token_type) VALUES($1, $2) ON CONFLICT DO NOTHING`,
        [tokenAddress.toLowerCase(), tokenType || 'ERC-20'],
      );
    } catch { /* ignore */ }
  }
}

// Historical backfill of token transfers for a single token using eth_getLogs
async function backfillTokenTransfers(p, tokenAddress) {
  const key = `token_backfill:${tokenAddress.toLowerCase()}`;
  const done = await getIndexerState(key);
  if (done === 'done') return;

  try {
    const latestBlock = await p.getBlockNumber();
    const LOG_CHUNK = 2000;
    const blockTimestamps = new Map();

    for (let from = 0; from <= latestBlock; from += LOG_CHUNK) {
      if (!running) break;
      const to = Math.min(from + LOG_CHUNK - 1, latestBlock);
      let logs;
      try {
        logs = await p.getLogs({
          fromBlock: from,
          toBlock: to,
          address: tokenAddress,
          topics: [TRANSFER_TOPIC],
        });
      } catch {
        logs = [];
      }

      if (!logs.length) continue;

      // Fetch unique block timestamps
      const uniqueBlocks = [...new Set(logs.map((l) => l.blockNumber))];
      await Promise.allSettled(
        uniqueBlocks.map(async (bn) => {
          if (!blockTimestamps.has(bn)) {
            const blk = await p.getBlock(bn).catch(() => null);
            if (blk) blockTimestamps.set(bn, new Date(Number(blk.timestamp) * 1000).toISOString());
          }
        }),
      );

      for (const log of logs) {
        const isERC721 = log.topics.length === 4;
        const tokenType = isERC721 ? 'ERC-721' : 'ERC-20';
        const fromAddr = log.topics[1] ? ('0x' + log.topics[1].slice(26)).toLowerCase() : null;
        const toAddr = log.topics[2] ? ('0x' + log.topics[2].slice(26)).toLowerCase() : null;
        let amount = null;
        let tokenId = null;
        if (isERC721) {
          tokenId = log.topics[3] ? BigInt(log.topics[3]).toString() : null;
        } else if (log.data && log.data !== '0x') {
          try { amount = BigInt(log.data).toString(); } catch { /* skip */ }
        }
        const ts = blockTimestamps.get(log.blockNumber) || null;
        const logIdx = log.index ?? log.logIndex ?? 0;

        try {
          await query(
            `INSERT INTO token_transfers(transaction_hash, block_number, log_index, token_address, from_address, to_address, amount, token_id, token_type, timestamp)
             VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
             ON CONFLICT(transaction_hash, log_index) DO NOTHING`,
            [log.transactionHash, log.blockNumber, logIdx, tokenAddress.toLowerCase(), fromAddr, toAddr, amount, tokenId, tokenType, ts],
          );

          await query(
            `INSERT INTO tokens(address, token_type, transfer_count) VALUES($1,$2,1)
             ON CONFLICT(address) DO UPDATE SET transfer_count = tokens.transfer_count + 1`,
            [tokenAddress.toLowerCase(), tokenType],
          );

          if (amount) {
            if (fromAddr && fromAddr !== ZERO_ADDRESS) {
              await query(
                `INSERT INTO token_balances(token_address, address, balance, updated_at) VALUES($1,$2,-$3::numeric,NOW())
                 ON CONFLICT(token_address, address) DO UPDATE SET balance = token_balances.balance - $3::numeric, updated_at = NOW()`,
                [tokenAddress.toLowerCase(), fromAddr, amount],
              );
            }
            if (toAddr && toAddr !== ZERO_ADDRESS) {
              await query(
                `INSERT INTO token_balances(token_address, address, balance, updated_at) VALUES($1,$2,$3::numeric,NOW())
                 ON CONFLICT(token_address, address) DO UPDATE SET balance = token_balances.balance + $3::numeric, updated_at = NOW()`,
                [tokenAddress.toLowerCase(), toAddr, amount],
              );
            }
          }
        } catch { /* ignore */ }
      }

      await new Promise((r) => setTimeout(r, 50));
    }

    // Recompute holders count
    await query(
      `UPDATE tokens SET holders_count = (
         SELECT COUNT(*) FROM token_balances WHERE token_address = $1 AND balance > 0
       ), transfer_count = (
         SELECT COUNT(*) FROM token_transfers WHERE token_address = $1
       ) WHERE address = $1`,
      [tokenAddress.toLowerCase()],
    );

    await setIndexerState(key, 'done');
    logger.info(`Historical backfill complete for ${tokenAddress}`);
  } catch (err) {
    logger.warn(`Token backfill failed for ${tokenAddress}: ${err.message}`);
  }
}

// Update address balance from chain
async function updateAddressBalance(p, address) {
  try {
    const balance = await p.getBalance(address);
    await query(
      `UPDATE addresses SET balance = $1, updated_at = NOW() WHERE LOWER(hash) = LOWER($2)`,
      [balance.toString(), address],
    );
  } catch { /* ignore */ }
}

// Fetch address balances in batches (for recently active addresses)
async function refreshActiveBalances(p) {
  try {
    const result = await query(
      `SELECT hash FROM addresses WHERE updated_at > NOW() - INTERVAL '10 minutes' ORDER BY updated_at DESC LIMIT 50`,
    );
    const updates = result.rows.map((row) => updateAddressBalance(p, row.hash));
    await Promise.allSettled(updates);
  } catch { /* ignore */ }
}

// ─── Trace / internal transaction support ────────────────────────────────────

async function fetchTrace(txHash) {
  if (!DEBUG_RPC_URL) return null;
  try {
    const res = await fetch(DEBUG_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'debug_traceTransaction',
        params: [txHash, { tracer: 'callTracer' }],
        id: 1,
      }),
      signal: AbortSignal.timeout(15000),
    });
    const json = await res.json();
    if (json.error || !json.result) return null;
    return json.result;
  } catch {
    return null;
  }
}

// Convert hex value (0x...) to decimal string; returns '0' on failure
function hexToDec(hex) {
  if (!hex || hex === '0x' || hex === '0x0') return '0';
  try { return BigInt(hex).toString(); } catch { return '0'; }
}

// Recursively flatten call tree; depth 0 = root (skipped as it IS the tx itself)
function flattenCalls(node, txHash, blockNumber, timestamp, counter = { n: 0 }, depth = 0) {
  const rows = [];
  const calls = node.calls || [];
  for (const call of calls) {
    const idx = counter.n++;
    rows.push({
      transaction_hash: txHash,
      block_number: blockNumber,
      index: idx,
      type: (call.type || 'CALL').toLowerCase(),
      from_address: call.from?.toLowerCase() || null,
      to_address: call.to?.toLowerCase() || null,
      value: hexToDec(call.value),
      gas: hexToDec(call.gas),
      gas_used: hexToDec(call.gasUsed),
      input: call.input || '0x',
      output: call.output || null,
      error: call.error || null,
      success: !call.error,
      depth: depth + 1,
      timestamp,
    });
    // Recurse into sub-calls
    rows.push(...flattenCalls(call, txHash, blockNumber, timestamp, counter, depth + 1));
  }
  return rows;
}

async function saveTrace(client, txHash, blockNumber, timestamp, trace) {
  // Store raw trace
  await client.query(
    `INSERT INTO transaction_traces(transaction_hash, trace)
     VALUES($1, $2)
     ON CONFLICT(transaction_hash) DO UPDATE SET trace = EXCLUDED.trace`,
    [txHash.toLowerCase(), JSON.stringify(trace)],
  );

  // Flatten and save internal transactions
  const rows = flattenCalls(trace, txHash, blockNumber, timestamp);
  if (!rows.length) return;

  // Delete stale rows first (re-indexing)
  await client.query(
    'DELETE FROM internal_transactions WHERE transaction_hash = $1',
    [txHash.toLowerCase()],
  );

  for (const r of rows) {
    await client.query(
      `INSERT INTO internal_transactions(
         transaction_hash, block_number, index, type,
         from_address, to_address, value, gas, gas_used,
         input, output, error, success, depth, timestamp
       ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT DO NOTHING`,
      [
        r.transaction_hash, r.block_number, r.index, r.type,
        r.from_address, r.to_address, r.value, r.gas, r.gas_used,
        r.input, r.output, r.error, r.success, r.depth, r.timestamp,
      ],
    );
  }
}

// Backfill traces for transactions that haven't been traced yet
async function backfillMissingTraces() {
  try {
    // Find up to 200 transactions without a trace entry
    const res = await query(
      `SELECT t.hash, t.block_number, t.timestamp
       FROM transactions t
       WHERE t.input != '0x' AND t.input IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM transaction_traces tt
           WHERE tt.transaction_hash = t.hash
         )
       ORDER BY t.block_number DESC
       LIMIT 200`,
    );

    if (!res.rows.length) return;
    logger.info(`Backfilling traces for ${res.rows.length} transactions...`);

    const pool = getPool();
    let done = 0;
    for (const row of res.rows) {
      if (!running) break;
      const trace = await fetchTrace(row.hash);
      if (trace) {
        const client = await pool.connect();
        try {
          await saveTrace(client, row.hash, row.block_number, row.timestamp, trace);
        } finally {
          client.release();
        }
        done++;
      }
      await new Promise((r) => setTimeout(r, 100));
    }
    logger.info(`Trace backfill: ${done}/${res.rows.length} succeeded`);
  } catch (err) {
    logger.warn('Trace backfill error:', err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

async function processBlock(p, blockNumber) {
  const block = await p.getBlock(blockNumber, true);
  if (!block) return;

  const pool = getPool();
  const client = await pool.connect();
  const timestamp = new Date(Number(block.timestamp) * 1000).toISOString();

  try {
    await client.query('BEGIN');

    // Upsert block
    await client.query(
      `INSERT INTO blocks(
        number, hash, parent_hash, timestamp, miner,
        gas_used, gas_limit, base_fee_per_gas, transaction_count,
        size, extra_data, nonce, difficulty, total_difficulty, state_root
      ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      ON CONFLICT(number) DO UPDATE SET
        hash = EXCLUDED.hash,
        transaction_count = EXCLUDED.transaction_count,
        gas_used = EXCLUDED.gas_used`,
      [
        block.number,
        block.hash,
        block.parentHash,
        timestamp,
        block.miner,
        block.gasUsed?.toString(),
        block.gasLimit?.toString(),
        block.baseFeePerGas?.toString() || null,
        block.transactions?.length || 0,
        null,
        block.extraData || null,
        block.nonce || '0x0000000000000000',
        block.difficulty?.toString() || '0',
        null,
        null,
      ],
    );

    const txs = block.prefetchedTransactions || block.transactions || [];

    for (let i = 0; i < txs.length; i++) {
      let tx = txs[i];
      if (typeof tx === 'string') {
        tx = await p.getTransaction(tx);
        if (!tx) continue;
      }

      let receipt = null;
      try {
        receipt = await p.getTransactionReceipt(tx.hash);
      } catch (e) {
        logger.warn(`Failed to get receipt for ${tx.hash}`);
      }

      const isContractCreation = !tx.to;
      const contractAddress = receipt?.contractAddress || null;
      const toAddress = tx.to || contractAddress;

      const createsAddr = isContractCreation && contractAddress ? contractAddress.toLowerCase() : null;

      // Upsert transaction
      await client.query(
        `INSERT INTO transactions(
          hash, block_number, block_hash, position, from_address, to_address,
          value, gas, gas_used, gas_price, max_fee_per_gas, max_priority_fee_per_gas,
          nonce, input, status, type, timestamp, creates
        ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
        ON CONFLICT(hash) DO UPDATE SET
          gas_used = EXCLUDED.gas_used,
          status = EXCLUDED.status,
          creates = COALESCE(EXCLUDED.creates, transactions.creates)`,
        [
          tx.hash,
          block.number,
          block.hash,
          i,
          tx.from?.toLowerCase(),
          toAddress?.toLowerCase() || null,
          tx.value?.toString() || '0',
          tx.gasLimit?.toString() || tx.gas?.toString() || '0',
          receipt?.gasUsed?.toString() || null,
          tx.gasPrice?.toString() || null,
          tx.maxFeePerGas?.toString() || null,
          tx.maxPriorityFeePerGas?.toString() || null,
          tx.nonce,
          tx.data || tx.input || '0x',
          receipt ? (receipt.status === 1 ? 1 : 0) : null,
          tx.type || 0,
          timestamp,
          createsAddr,
        ],
      );

      // Upsert addresses with tx_count increment
      await client.query(
        `INSERT INTO addresses(hash, tx_count, updated_at)
         VALUES($1, 1, NOW())
         ON CONFLICT(hash) DO UPDATE SET
           tx_count = addresses.tx_count + 1,
           updated_at = NOW()`,
        [tx.from?.toLowerCase()],
      );

      if (toAddress) {
        const code = await p.getCode(toAddress).catch(() => null);
        const isContract = isContractCreation || ((code?.length ?? 0) > 2);
        await client.query(
          `INSERT INTO addresses(hash, is_contract, updated_at)
           VALUES($1, $2, NOW())
           ON CONFLICT(hash) DO UPDATE SET
             is_contract = EXCLUDED.is_contract OR addresses.is_contract,
             updated_at = NOW()`,
          [toAddress.toLowerCase(), isContract],
        );
      }

      // Save all raw logs for this transaction
      if (receipt?.logs && receipt.logs.length > 0) {
        for (const log of receipt.logs) {
          const li = log.index ?? log.logIndex ?? 0;
          await client.query(
            `INSERT INTO logs(transaction_hash, block_number, log_index, address, topic0, topic1, topic2, topic3, data, timestamp)
             VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
             ON CONFLICT(transaction_hash, log_index) DO NOTHING`,
            [
              tx.hash,
              block.number,
              li,
              log.address?.toLowerCase() || null,
              log.topics?.[0] || null,
              log.topics?.[1] || null,
              log.topics?.[2] || null,
              log.topics?.[3] || null,
              log.data || '0x',
              timestamp,
            ],
          );
        }
      }

      // Fetch internal transactions via debug_traceTransaction (async, non-blocking)
      if (tx.data && tx.data !== '0x' && tx.to) {
        const txHash = tx.hash;
        const txBlockNumber = block.number;
        const txTimestamp = timestamp;
        setImmediate(async () => {
          const trace = await fetchTrace(txHash);
          if (trace && (trace.calls?.length > 0)) {
            const traceClient = await getPool().connect();
            try {
              await saveTrace(traceClient, txHash, txBlockNumber, txTimestamp, trace);
            } catch { /* ignore */ } finally {
              traceClient.release();
            }
          }
        });
      }

      // Process logs for token transfers
      if (receipt?.logs && receipt.logs.length > 0) {
        for (const log of receipt.logs) {
          if (log.topics[0] === TRANSFER_TOPIC) {
            const isERC721 = log.topics.length === 4;
            const tokenType = isERC721 ? 'ERC-721' : 'ERC-20';
            const fromAddr = log.topics[1]
              ? '0x' + log.topics[1].slice(26)
              : null;
            const toAddr = log.topics[2]
              ? '0x' + log.topics[2].slice(26)
              : null;

            let amount = null;
            let tokenId = null;

            if (isERC721) {
              tokenId = log.topics[3] ? BigInt(log.topics[3]).toString() : null;
            } else if (log.data && log.data !== '0x') {
              try {
                amount = BigInt(log.data).toString();
              } catch { /* ignore */ }
            }

            const tokenAddr = log.address?.toLowerCase();
            const fromAddrLc = fromAddr?.toLowerCase();
            const toAddrLc = toAddr?.toLowerCase();

            try {
              await client.query(
                `INSERT INTO token_transfers(
                  transaction_hash, block_number, log_index,
                  token_address, from_address, to_address,
                  amount, token_id, token_type, timestamp
                ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
                ON CONFLICT(transaction_hash, log_index) DO NOTHING`,
                [
                  tx.hash,
                  block.number,
                  log.index ?? log.logIndex ?? 0,
                  tokenAddr,
                  fromAddrLc,
                  toAddrLc,
                  amount,
                  tokenId,
                  tokenType,
                  timestamp,
                ],
              );

              // Increment token transfer count
              await client.query(
                `INSERT INTO tokens(address, token_type, transfer_count)
                 VALUES($1, $2, 1)
                 ON CONFLICT(address) DO UPDATE SET
                   transfer_count = tokens.transfer_count + 1`,
                [tokenAddr, tokenType],
              );

              // Update token balances for ERC-20 amounts
              if (amount) {
                if (fromAddrLc && fromAddrLc !== ZERO_ADDRESS) {
                  await client.query(
                    `INSERT INTO token_balances(token_address, address, balance, updated_at)
                     VALUES($1, $2, -$3::numeric, NOW())
                     ON CONFLICT(token_address, address) DO UPDATE SET
                       balance = token_balances.balance - $3::numeric,
                       updated_at = NOW()`,
                    [tokenAddr, fromAddrLc, amount],
                  );
                }
                if (toAddrLc && toAddrLc !== ZERO_ADDRESS) {
                  await client.query(
                    `INSERT INTO token_balances(token_address, address, balance, updated_at)
                     VALUES($1, $2, $3::numeric, NOW())
                     ON CONFLICT(token_address, address) DO UPDATE SET
                       balance = token_balances.balance + $3::numeric,
                       updated_at = NOW()`,
                    [tokenAddr, toAddrLc, amount],
                  );
                }
              }
            } catch { /* ignore duplicate */ }

            // Async: update holders_count and fetch token metadata
            setImmediate(() => {
              Promise.allSettled([
                query(
                  `UPDATE tokens SET holders_count = (
                     SELECT COUNT(*) FROM token_balances
                     WHERE token_address = $1 AND balance > 0
                   ) WHERE address = $1`,
                  [tokenAddr],
                ),
                ensureToken(p, log.address, tokenType),
              ]).catch(() => {});
            });
          }
        }
      }
    }

    await client.query('COMMIT');
    logger.debug(`Indexed block ${block.number} with ${txs.length} txs`);
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error(`Error processing block ${blockNumber}: ${err?.message || err?.toString() || 'unknown error'}`);
    throw err;
  } finally {
    client.release();
  }

  // Periodically refresh address balances
  blocksSinceBalanceUpdate++;
  if (blocksSinceBalanceUpdate >= BALANCE_UPDATE_INTERVAL) {
    blocksSinceBalanceUpdate = 0;
    setImmediate(() => refreshActiveBalances(p).catch(() => {}));
  }
}

async function syncHistorical(p) {
  const latestChain = await p.getBlockNumber();
  await setIndexerState('latest_chain_block', latestChain);

  const lastIndexed = await getIndexerState('last_indexed_block');
  const startBlock = lastIndexed ? Number(lastIndexed) + 1 : Math.max(0, latestChain - 200);

  if (startBlock > latestChain - CONFIRMATIONS) {
    logger.info('Historical sync: already up to date');
    return;
  }

  logger.info(`Starting historical sync from block ${startBlock} to ${latestChain}`);

  for (let i = startBlock; i <= latestChain - CONFIRMATIONS; i += BATCH_SIZE) {
    if (!running) break;

    const end = Math.min(i + BATCH_SIZE - 1, latestChain - CONFIRMATIONS);
    const promises = [];

    for (let j = i; j <= end; j++) {
      promises.push(processBlock(p, j).catch((err) => {
        logger.error(`Failed block ${j}:`, err.message);
      }));
    }

    await Promise.all(promises);
    await setIndexerState('last_indexed_block', end);

    // Invalidate caches after each batch
    await Promise.allSettled([
      cacheSet('stats:home', null, 1),
      cacheSet('main_page_blocks', null, 1),
      cacheSet('main_page_txs', null, 1),
    ]);

    if ((i - startBlock) % 50 === 0) {
      logger.info(`Synced up to block ${end} / ${latestChain}`);
    }

    await new Promise((r) => setTimeout(r, 50));
  }

  logger.info('Historical sync complete');
}

async function watchNewBlocks(p) {
  logger.info('Watching for new blocks...');
  const wsP = await getWsProvider();

  if (wsP) {
    wsP.on('block', async (blockNumber) => {
      try {
        await new Promise((r) => setTimeout(r, 1000));
        await processBlock(p, blockNumber);
        await setIndexerState('last_indexed_block', blockNumber);
        await setIndexerState('latest_chain_block', blockNumber);
        // Invalidate all relevant caches
        await Promise.allSettled([
          cacheSet('stats:home', null, 1),
          cacheSet('main_page_blocks', null, 1),
          cacheSet('main_page_txs', null, 1),
          cacheSet('gas_tracker', null, 1),
        ]);
      } catch (err) {
        logger.error(`Failed to process new block ${blockNumber}:`, err.message);
      }
    });
  } else {
    let lastBlock = await p.getBlockNumber();

    const poll = async () => {
      if (!running) return;
      try {
        const current = await p.getBlockNumber();
        if (current > lastBlock) {
          for (let i = lastBlock + 1; i <= current; i++) {
            await processBlock(p, i).catch(() => {});
          }
          await setIndexerState('last_indexed_block', current);
          await setIndexerState('latest_chain_block', current);
          lastBlock = current;
        }
      } catch (err) {
        logger.warn('Poll error:', err.message);
      }
      setTimeout(poll, 10000);
    };

    setTimeout(poll, 10000);
  }
}

async function backfillExistingTokens(p) {
  try {
    const result = await query('SELECT address FROM tokens ORDER BY transfer_count DESC');
    const tokens = result.rows.map((r) => r.address);
    if (!tokens.length) return;

    logger.info(`Backfilling ${tokens.length} existing token(s)...`);
    for (const tokenAddress of tokens) {
      if (!running) break;
      await backfillTokenTransfers(p, tokenAddress).catch(() => {});
    }
    logger.info('Token backfill pass complete');
  } catch (err) {
    logger.warn('Token backfill startup failed:', err.message);
  }
}

// Re-index blocks that have transactions on-chain but none in our DB
async function backfillMissingTransactions(p) {
  try {
    const result = await query(`
      SELECT b.number
      FROM blocks b
      WHERE b.transaction_count > 0
        AND NOT EXISTS (
          SELECT 1 FROM transactions t WHERE t.block_number = b.number
        )
      ORDER BY b.number DESC
      LIMIT 500
    `);
    if (!result.rows.length) return;
    logger.info(`Re-indexing ${result.rows.length} blocks with missing transactions...`);
    for (const row of result.rows) {
      if (!running) break;
      await processBlock(p, Number(row.number)).catch((err) => {
        logger.warn(`Re-index failed for block ${row.number}: ${err?.message || err}`);
      });
      await new Promise((r) => setTimeout(r, 100));
    }
    logger.info('Missing transaction backfill complete');
  } catch (err) {
    logger.warn(`Missing transaction backfill error: ${err?.message || err}`);
  }
}

export async function startIndexer() {
  const p = await getProvider();
  if (!p) {
    logger.warn('Indexer disabled - no RPC available');
    return;
  }

  running = true;
  await connectMongo();

  logger.info('Starting blockchain indexer...');

  try {
    await syncHistorical(p);
    // Backfill blocks that have transactions but were never indexed (e.g. due to missing column)
    setImmediate(() => backfillMissingTransactions(p).catch(() => {}));
    // Backfill historical token transfers and traces in the background
    setImmediate(() => backfillExistingTokens(p).catch(() => {}));
    setImmediate(() => backfillMissingTraces().catch(() => {}));
    await watchNewBlocks(p);
  } catch (err) {
    logger.error('Indexer error:', err);
  }
}

export function stopIndexer() {
  running = false;
}
