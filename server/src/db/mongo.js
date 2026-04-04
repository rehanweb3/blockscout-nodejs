import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const logSchema = new mongoose.Schema({
  transactionHash: { type: String, index: true },
  blockNumber: { type: Number, index: true },
  address: { type: String, index: true },
  topics: [String],
  data: String,
  logIndex: Number,
  timestamp: { type: Date, index: true },
}, { timestamps: true });

const internalTxSchema = new mongoose.Schema({
  transactionHash: { type: String, index: true },
  blockNumber: { type: Number, index: true },
  type: String,
  from: { type: String, index: true },
  to: { type: String, index: true },
  value: String,
  gas: String,
  gasUsed: String,
  input: String,
  output: String,
  success: Boolean,
  error: String,
  depth: Number,
  timestamp: Date,
}, { timestamps: true });

export const Log = mongoose.model('Log', logSchema);
export const InternalTx = mongoose.model('InternalTx', internalTxSchema);

export async function connectMongo() {
  const uri = process.env.MONGODB_URL || 'mongodb://localhost:27017/blockscout';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    logger.info('MongoDB connected');
    return true;
  } catch (err) {
    logger.warn('MongoDB unavailable, logs/traces disabled:', err.message);
    return false;
  }
}

export async function testConnection() {
  return mongoose.connection.readyState === 1;
}
