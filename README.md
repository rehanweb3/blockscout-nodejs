# Ather Chain Explorer — BlockScout (Node.js Stack)

> A customized BlockScout version using Elixir, integrated with Node.js, PostgreSQL, Redis, and MongoDB. Designed for easy hosting, scalability, and high performance with a clean and modular architecture.

---

## Overview

This is a fully functional blockchain explorer for the **Ather Chain** network, built on the [Blockscout](https://blockscout.com) open-source explorer frontend. The original Elixir/Phoenix backend has been replaced with a **Node.js + Express** backend, making it simpler to deploy and customize without requiring an Elixir runtime.

### Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (Blockscout UI, production build) |
| Backend API | Node.js + Express.js |
| Primary Database | PostgreSQL |
| Cache Layer | Redis (optional, graceful fallback) |
| Document Store | MongoDB (indexer state & metadata) |
| Blockchain Indexer | Custom Node.js indexer (WebSocket + RPC) |
| Native Currency | ATH (Ather) |

---

## Features

- Live block and transaction indexing via WebSocket
- Full address pages: transactions, token transfers, internal txs, logs, coin balance history
- Token support (ERC-20, ERC-721, ERC-1155)
- Smart contract verification (Solidity, solc compiler)
- Read/Write contract tabs with MetaMask wallet integration
- Gas tracker, stats charts, advanced search
- REST API documentation page (Swagger UI)
- Admin panel (JWT-secured)
- Production-optimized `next build` + `next start` flow with 6 GB heap

---

## Prerequisites

- **Node.js** >= 20
- **npm** >= 10
- **PostgreSQL** >= 14
- **Redis** >= 6 (optional but recommended)
- **MongoDB** >= 6
- A running EVM-compatible blockchain node (RPC + WebSocket endpoints)

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/rehanweb3/blockscout-nodejs.git
cd blockscout-nodejs
```

### 2. Install dependencies

```bash
npm install
cd server && npm install && cd ..
```

### 3. Configure environment variables

Copy the example files and fill in your values:

```bash
cp .env.example .env.local
cp server/.env.example server/.env
```

See [Environment Variables](#environment-variables) for full reference.

### 4. Start the application

```bash
bash start.sh
```

This script will:
1. Start Redis locally (if `REDIS_URL` is not set)
2. Start the Express backend on port 3001
3. Detect if a production Next.js build exists:
   - **Build exists** → immediately start `next start` on port 5000
   - **No build** → run a placeholder server, build with 6 GB heap, then switch to `next start`

The explorer will be available at **http://localhost:5000**

---

## Environment Variables

### Frontend (`.env.local`)

```dotenv
# ── Network Identity ────────────────────────────────────────────────────────
NEXT_PUBLIC_NETWORK_NAME=Ather Chain          # Full name shown in the UI
NEXT_PUBLIC_NETWORK_SHORT_NAME=ATHER          # Short name / ticker label
NEXT_PUBLIC_NETWORK_ID=786                    # Chain ID (EIP-155)

# ── Native Currency ──────────────────────────────────────────────────────────
NEXT_PUBLIC_NETWORK_CURRENCY_NAME=ATH         # Currency full name
NEXT_PUBLIC_NETWORK_CURRENCY_SYMBOL=ATH       # Currency symbol shown everywhere
NEXT_PUBLIC_NETWORK_CURRENCY_DECIMALS=18      # Decimal places (usually 18)

# ── RPC / WebSocket ──────────────────────────────────────────────────────────
NEXT_PUBLIC_NETWORK_RPC_URL=https://rpc.atherchain.tech
NEXT_PUBLIC_NETWORK_WS_URL=wss://websocket.atherchain.tech

# ── API Routing ───────────────────────────────────────────────────────────────
NEXT_PUBLIC_API_HOST=                         # Leave empty to use relative URLs (recommended)
BACKEND_URL=http://localhost:3001             # Internal URL Next.js proxies /api/v2/* to
RPC_URL=https://rpc.atherchain.tech           # Used by server-side Next.js pages
WS_URL=wss://websocket.atherchain.tech

# ── Optional Integrations (set to 'xxx' or leave blank to disable) ───────────
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=xxx
NEXT_PUBLIC_RE_CAPTCHA_APP_SITE_KEY=xxx
NEXT_PUBLIC_ROLLBAR_CLIENT_TOKEN=xxx
NEXT_PUBLIC_GOOGLE_ANALYTICS_PROPERTY_ID=xxx
NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN=xxx
NEXT_PUBLIC_GROWTH_BOOK_CLIENT_KEY=xxx
NEXT_PUBLIC_ACCOUNT_DYNAMIC_ENVIRONMENT_ID=xxx
```

### Backend (`server/.env`)

```dotenv
# ── Server ────────────────────────────────────────────────────────────────────
PORT=3001                                     # Express server port
BACKEND_PORT=3001                             # Alias used by start.sh

# ── PostgreSQL ────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/blockscout
# Example (local):   postgresql://postgres:postgres@localhost:5432/blockscout
# Example (Railway): postgresql://postgres:secret@containers-us-west-xx.railway.app:7890/railway

# ── MongoDB ───────────────────────────────────────────────────────────────────
MONGODB_URL=mongodb://localhost:27017/blockscout
# Used for: indexer state persistence, token metadata cache

# ── Redis ─────────────────────────────────────────────────────────────────────
REDIS_URL=                                    # Leave empty to use a local Redis instance
# Example: redis://default:password@redis.example.com:6379
# If unset, start.sh launches a local redis-server automatically

# ── Blockchain Node ───────────────────────────────────────────────────────────
RPC_URL=https://rpc.atherchain.tech           # JSON-RPC endpoint
WS_URL=wss://websocket.atherchain.tech        # WebSocket endpoint for live events
CHAIN_ID=786

# ── Indexer ───────────────────────────────────────────────────────────────────
ENABLE_INDEXER=true                           # Set to false to disable the indexer
LOG_LEVEL=info                                # debug | info | warn | error

# ── Admin Panel ───────────────────────────────────────────────────────────────
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme                       # Change before deploying to production
ADMIN_JWT_SECRET=change_this_to_a_long_random_secret
```

---

## Architecture

```
                    ┌─────────────────────────────────────┐
                    │           User's Browser            │
                    └──────────────┬──────────────────────┘
                                   │  HTTP / WS
                    ┌──────────────▼──────────────────────┐
                    │        Next.js 15 (port 5000)        │
                    │  Blockscout frontend (production)    │
                    │  /api/v2/* → rewrites to backend    │
                    └──────────────┬──────────────────────┘
                                   │  HTTP  localhost:3001
                    ┌──────────────▼──────────────────────┐
                    │     Express.js Backend (port 3001)   │
                    │  REST API  ·  Admin  ·  Indexer      │
                    └───┬──────────┬──────────┬───────────┘
                        │          │          │
              ┌─────────▼──┐  ┌────▼────┐  ┌─▼───────┐
              │ PostgreSQL  │  │  Redis  │  │ MongoDB  │
              │  (blocks,   │  │ (cache) │  │ (state,  │
              │  txs, logs) │  │         │  │ metadata)│
              └─────────────┘  └─────────┘  └─────────┘
```

### API Proxy

All `/api/v2/*` requests from the browser hit Next.js, which proxies them to the Express backend via the `rewrites` rule in `next.config.js`. This means only **port 5000** needs to be exposed publicly.

---

## Directory Structure

```
blockscout-nodejs/
├── server/                  # Node.js Express backend
│   ├── src/
│   │   ├── index.js         # Entry point, middleware, route mounting
│   │   ├── routes/
│   │   │   ├── v2/          # Public API (blocks, txs, addresses, tokens…)
│   │   │   └── admin.js     # Admin endpoints (JWT-protected)
│   │   ├── indexer/
│   │   │   └── index.js     # Blockchain indexer (WebSocket listener)
│   │   ├── db/
│   │   │   ├── postgres.js  # PostgreSQL pool + schema init
│   │   │   ├── redis.js     # Redis client with fallback
│   │   │   └── mongo.js     # MongoDB connection
│   │   └── utils/
│   │       └── logger.js    # Winston logger
│   └── .env                 # Backend secrets (not committed)
│
├── pages/                   # Next.js pages (Blockscout UI)
├── ui/                      # UI components
├── lib/                     # Shared utilities, API client
├── configs/                 # Feature flags, chain config
├── stubs/                   # Webpack module stubs
├── next.config.js           # Webpack aliases, API rewrites
├── start.sh                 # Production start script
└── .env.local               # Frontend env vars (not committed)
```

---

## Database Setup

The schema is created automatically on first start via `initSchema()` in `server/src/db/postgres.js`.

Tables created:
- `blocks` — block headers, timestamps, validator info
- `transactions` — all transactions with status, gas, value
- `addresses` — address metadata and balance cache
- `token_transfers` — ERC-20/721/1155 transfer events
- `tokens` — token contract metadata
- `logs` — raw transaction logs
- `smart_contracts` — verified contract source/ABI
- `internal_transactions` — trace-level internal calls
- `indexer_state` — key/value store for indexer progress

---

## Production Deployment

### Environment checklist

1. Set strong values for `ADMIN_PASSWORD` and `ADMIN_JWT_SECRET`
2. Use a managed PostgreSQL (e.g. Railway, Supabase, RDS)
3. Use a managed Redis (e.g. Railway, Upstash)
4. Use a managed MongoDB (e.g. MongoDB Atlas)
5. Set `REDIS_URL`, `DATABASE_URL`, `MONGODB_URL` as secrets (never commit)

### Build manually (optional)

```bash
NODE_OPTIONS="--max-old-space-size=6144" npm run build
```

### Start

```bash
bash start.sh
```

The script detects the completed build and jumps straight to `next start`.

---

## API Endpoints

The backend exposes the full Blockscout v2 REST API:

| Method | Path | Description |
|---|---|---|
| GET | `/api/v2/stats` | Network stats (blocks, txs, gas price…) |
| GET | `/api/v2/blocks` | Latest blocks |
| GET | `/api/v2/blocks/:hash` | Block detail |
| GET | `/api/v2/transactions` | Latest transactions |
| GET | `/api/v2/transactions/:hash` | Transaction detail |
| GET | `/api/v2/transactions/:hash/logs` | Tx logs |
| GET | `/api/v2/addresses/:hash` | Address detail |
| GET | `/api/v2/addresses/:hash/transactions` | Address txs |
| GET | `/api/v2/addresses/:hash/token-transfers` | Token transfers |
| GET | `/api/v2/addresses/:hash/logs` | Address logs |
| GET | `/api/v2/tokens` | Token list |
| GET | `/api/v2/tokens/:hash` | Token detail |
| GET | `/api/v2/smart-contracts/:hash` | Contract detail |
| POST | `/api/v2/smart-contracts/:hash/verification-via/flattened-code` | Verify contract |
| GET | `/api/v2/search` | Full-text search |
| GET | `/api/v2/config` | Backend config (chain ID, currency…) |
| GET | `/api/v2/config/backend-version` | Backend version |
| GET | `/api/v2/gas-tracker` | Current gas prices |
| GET | `/api/v2/stats/charts/transactions` | Transaction chart data |
| GET | `/api/v2/stats/charts/market` | Market chart data |

Full interactive docs available at `/api-docs` in the UI.

---

## License

This project is based on [Blockscout](https://github.com/blockscout/blockscout) and follows its open-source license. Custom Node.js backend code is released under the MIT License.
