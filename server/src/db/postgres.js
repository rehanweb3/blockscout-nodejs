import pg from 'pg';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

let pool;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/blockscout',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      logger.error('PostgreSQL pool error:', err);
    });
  }
  return pool;
}

export async function query(text, params) {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function initSchema() {
  const db = getPool();

  // Step 1: Create tables
  await db.query(`
    CREATE TABLE IF NOT EXISTS blocks (
      number BIGINT PRIMARY KEY,
      hash VARCHAR(66) UNIQUE NOT NULL,
      parent_hash VARCHAR(66),
      timestamp TIMESTAMPTZ NOT NULL,
      miner VARCHAR(42),
      gas_used NUMERIC,
      gas_limit NUMERIC,
      base_fee_per_gas NUMERIC,
      transaction_count INTEGER DEFAULT 0,
      size INTEGER,
      extra_data TEXT,
      nonce VARCHAR(20),
      difficulty NUMERIC,
      total_difficulty NUMERIC,
      state_root VARCHAR(66),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS transactions (
      hash VARCHAR(66) PRIMARY KEY,
      block_number BIGINT REFERENCES blocks(number) ON DELETE CASCADE,
      block_hash VARCHAR(66),
      position INTEGER,
      from_address VARCHAR(42),
      to_address VARCHAR(42),
      value NUMERIC,
      gas NUMERIC,
      gas_used NUMERIC,
      gas_price NUMERIC,
      max_fee_per_gas NUMERIC,
      max_priority_fee_per_gas NUMERIC,
      nonce INTEGER,
      input TEXT,
      status SMALLINT,
      type SMALLINT DEFAULT 0,
      timestamp TIMESTAMPTZ,
      creates VARCHAR(42),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS addresses (
      hash VARCHAR(42) PRIMARY KEY,
      balance NUMERIC DEFAULT 0,
      nonce INTEGER DEFAULT 0,
      is_contract BOOLEAN DEFAULT FALSE,
      is_verified BOOLEAN DEFAULT FALSE,
      bytecode_hash VARCHAR(66),
      name VARCHAR(255),
      tx_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tokens (
      address VARCHAR(42) PRIMARY KEY,
      name VARCHAR(255),
      symbol VARCHAR(50),
      decimals SMALLINT,
      total_supply NUMERIC,
      token_type VARCHAR(20) DEFAULT 'ERC-20',
      holders_count INTEGER DEFAULT 0,
      transfer_count INTEGER DEFAULT 0,
      icon_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS token_transfers (
      id BIGSERIAL PRIMARY KEY,
      transaction_hash VARCHAR(66) NOT NULL,
      block_number BIGINT,
      log_index INTEGER,
      token_address VARCHAR(42),
      from_address VARCHAR(42),
      to_address VARCHAR(42),
      amount NUMERIC,
      token_id NUMERIC,
      token_type VARCHAR(20) DEFAULT 'ERC-20',
      timestamp TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(transaction_hash, log_index)
    );

    CREATE TABLE IF NOT EXISTS internal_transactions (
      id BIGSERIAL PRIMARY KEY,
      transaction_hash VARCHAR(66) NOT NULL,
      block_number BIGINT,
      index INTEGER DEFAULT 0,
      type VARCHAR(20) DEFAULT 'call',
      from_address VARCHAR(42),
      to_address VARCHAR(42),
      value NUMERIC DEFAULT 0,
      gas NUMERIC,
      gas_used NUMERIC,
      input TEXT,
      output TEXT,
      error TEXT,
      success BOOLEAN DEFAULT TRUE,
      depth INTEGER DEFAULT 0,
      timestamp TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(transaction_hash, index)
    );

    CREATE TABLE IF NOT EXISTS smart_contracts (
      address VARCHAR(42) PRIMARY KEY,
      name VARCHAR(255),
      compiler_version VARCHAR(100),
      source_code TEXT,
      abi JSONB,
      constructor_args TEXT,
      optimization BOOLEAN DEFAULT FALSE,
      language VARCHAR(50) DEFAULT 'solidity',
      verified_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS token_balances (
      token_address VARCHAR(42) NOT NULL,
      address VARCHAR(42) NOT NULL,
      balance NUMERIC DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      PRIMARY KEY (token_address, address)
    );

    CREATE TABLE IF NOT EXISTS indexer_state (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS logs (
      id BIGSERIAL PRIMARY KEY,
      transaction_hash VARCHAR(66) NOT NULL,
      block_number BIGINT NOT NULL,
      log_index INTEGER NOT NULL,
      address VARCHAR(42),
      topic0 VARCHAR(66),
      topic1 VARCHAR(66),
      topic2 VARCHAR(66),
      topic3 VARCHAR(66),
      data TEXT,
      timestamp TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(transaction_hash, log_index)
    );

  `);

  // Step 2: Migrate existing tables — add columns that may not exist yet
  const alterations = [
    `ALTER TABLE addresses ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE addresses ADD COLUMN IF NOT EXISTS tx_count INTEGER DEFAULT 0`,
    `ALTER TABLE addresses ADD COLUMN IF NOT EXISTS nonce INTEGER DEFAULT 0`,
    `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS creates VARCHAR(42)`,
  ];
  for (const sql of alterations) {
    await db.query(sql).catch(() => {});
  }

  // Step 3: Create indexes (after all columns exist)
  await db.query(`
    -- Core indexes for fast lookups
    CREATE INDEX IF NOT EXISTS idx_transactions_block ON transactions(block_number);
    CREATE INDEX IF NOT EXISTS idx_transactions_from ON transactions(from_address);
    CREATE INDEX IF NOT EXISTS idx_transactions_to ON transactions(to_address);
    CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_blocks_timestamp ON blocks(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_blocks_miner ON blocks(miner);

    -- Token transfer indexes
    CREATE INDEX IF NOT EXISTS idx_token_transfers_tx ON token_transfers(transaction_hash);
    CREATE INDEX IF NOT EXISTS idx_token_transfers_block ON token_transfers(block_number);
    CREATE INDEX IF NOT EXISTS idx_token_transfers_token ON token_transfers(token_address);
    CREATE INDEX IF NOT EXISTS idx_token_transfers_from ON token_transfers(from_address);
    CREATE INDEX IF NOT EXISTS idx_token_transfers_to ON token_transfers(to_address);
    CREATE INDEX IF NOT EXISTS idx_token_transfers_timestamp ON token_transfers(timestamp DESC);

    -- Internal transaction indexes
    CREATE INDEX IF NOT EXISTS idx_internal_txs_tx ON internal_transactions(transaction_hash);
    CREATE INDEX IF NOT EXISTS idx_internal_txs_block ON internal_transactions(block_number);
    CREATE INDEX IF NOT EXISTS idx_internal_txs_from ON internal_transactions(from_address);
    CREATE INDEX IF NOT EXISTS idx_internal_txs_to ON internal_transactions(to_address);
    CREATE INDEX IF NOT EXISTS idx_internal_txs_timestamp ON internal_transactions(timestamp DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_internal_txs_tx_idx ON internal_transactions(transaction_hash, index);

    -- Address indexes
    CREATE INDEX IF NOT EXISTS idx_addresses_balance ON addresses(balance DESC NULLS LAST);
    CREATE INDEX IF NOT EXISTS idx_addresses_is_contract ON addresses(is_contract);
    CREATE INDEX IF NOT EXISTS idx_addresses_tx_count ON addresses(tx_count DESC);

    -- Token indexes
    CREATE INDEX IF NOT EXISTS idx_tokens_transfer_count ON tokens(transfer_count DESC);
    CREATE INDEX IF NOT EXISTS idx_tokens_type ON tokens(token_type);

    -- Smart contract indexes
    CREATE INDEX IF NOT EXISTS idx_smart_contracts_verified ON smart_contracts(verified_at DESC);

    -- Token balance indexes
    CREATE INDEX IF NOT EXISTS idx_token_balances_token ON token_balances(token_address);
    CREATE INDEX IF NOT EXISTS idx_token_balances_balance ON token_balances(token_address, balance DESC);
    CREATE INDEX IF NOT EXISTS idx_token_balances_address ON token_balances(address);

    -- Log indexes
    CREATE INDEX IF NOT EXISTS idx_logs_tx ON logs(transaction_hash);
    CREATE INDEX IF NOT EXISTS idx_logs_block ON logs(block_number DESC);
    CREATE INDEX IF NOT EXISTS idx_logs_address ON logs(address);
    CREATE INDEX IF NOT EXISTS idx_logs_topic0 ON logs(topic0);

    -- Raw call traces (callTracer output stored per transaction)
    CREATE TABLE IF NOT EXISTS transaction_traces (
      transaction_hash VARCHAR(66) PRIMARY KEY,
      trace JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  logger.info('PostgreSQL schema initialized');
}

export async function testConnection() {
  try {
    const result = await query('SELECT 1 AS connected');
    return result.rows[0].connected === 1;
  } catch (err) {
    return false;
  }
}
