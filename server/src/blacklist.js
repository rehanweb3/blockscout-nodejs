import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE = path.join(DATA_DIR, 'blacklist.json');

let _set = new Set();

function load() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(FILE)) {
      const arr = JSON.parse(fs.readFileSync(FILE, 'utf8'));
      _set = new Set(arr.map((a) => a.toLowerCase()));
    }
  } catch (_) {
    _set = new Set();
  }
}

function save() {
  try {
    fs.writeFileSync(FILE, JSON.stringify([..._set]), 'utf8');
  } catch (_) {}
}

load();

export function getBlacklist() {
  return [..._set];
}

export function isBlacklisted(addr) {
  if (!addr) return false;
  return _set.has(addr.toLowerCase());
}

export function addToBlacklist(addr) {
  _set.add(addr.toLowerCase());
  save();
}

export function removeFromBlacklist(addr) {
  _set.delete(addr.toLowerCase());
  save();
}

export function blacklistWhereClause(fromCol, toCol, startIdx) {
  const list = [..._set];
  if (list.length === 0) return { clause: '', params: [] };
  const placeholders = list.map((_, i) => `$${startIdx + i}`).join(', ');
  const clause = ` AND LOWER(${fromCol}) NOT IN (${placeholders}) AND LOWER(${toCol}) NOT IN (${placeholders})`;
  return { clause, params: list };
}
