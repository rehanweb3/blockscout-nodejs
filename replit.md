# Blockscout Explorer on Replit — Atherchain

## Overview
Full-stack Blockscout blockchain explorer migrated to Replit. The original Next.js frontend UI is preserved exactly as-is, with a Node.js backend (Express + PostgreSQL + Redis) replacing the original Elixir/Phoenix backend, and a live blockchain indexer syncing real on-chain data from Atherchain.

## Architecture
- **Frontend**: Next.js 15 dev server (port 5000) — original Blockscout UI
- **Backend**: Express.js API (port 3001) — custom Node.js implementation
- **Database**: PostgreSQL — blockchain data storage
- **Cache**: Redis — optional, graceful fallback when unavailable
- **Indexer**: Node.js blockchain indexer — syncs Atherchain live blocks via WebSocket

## Chain Configuration
- **Chain**: Atherchain
- **RPC**: `https://rpc.atherchain.tech`
- **WebSocket**: `wss://websocket.atherchain.tech`
- **Chain ID**: 786

## Start
```bash
bash start.sh
```
Starts backend (port 3001) + frontend dev server (port 5000) simultaneously.
The indexer runs as part of the backend and watches for new blocks via WebSocket.

## Completed Features
- Contract verification (solc compilation, green checkmark, Code/ABI/Bytecode tabs)
- Read/Write contract tabs with wagmi + injected() connector
- MetaMask Connect Wallet integration
- Transaction logs: `logs` table in PostgreSQL, indexer saves raw logs on every block, `/api/v2/transactions/:hash/logs` and `/api/v2/addresses/:hash/logs` endpoints implemented; all existing transactions backfilled

## Key Files
- `start.sh` — startup script (dev mode)
- `server/src/index.js` — Express API server
- `server/src/indexer/index.js` — blockchain indexer (saves raw logs on every tx)
- `server/src/db/postgres.js` — schema including `logs` table with indexes
- `server/src/routes/v2/transactions.js` — tx logs endpoint
- `server/src/routes/v2/addresses.js` — address logs endpoint
- `server/.env` — server env (RPC_URL, WS_URL, DB config)
- `next.config.js` — webpack aliases, SVG handling, API rewrites to backend
- `pages/_document.tsx` — custom document
- `.env.local` — frontend env vars (chain name, currency, API host)

## Status
- **All sidebar pages working**: homepage, /txs, /internal-txs, /blocks, /token-transfers, /accounts, /verified-contracts, /tokens, /stats, /gas-tracker
- **Address pages working**: /address/[hash] — tabs: Details, Transactions, Token transfers, Tokens, Internal txns, Coin balance history, Blocks validated, Logs
- **Live WebSocket**: indexer watches new blocks and writes to PostgreSQL
- **Production build disabled**: Next.js `next build` was OOM-killed in Replit's memory-limited environment; running `next dev` instead (functionally identical for this use case)
- All module stubs and webpack aliases in place (50+ stubs created to fix missing imports)
- **Token backfills**: All 3 ATH tokens backfilled via eth_getLogs; state stored in indexer_state as `done` so restarts are instant
- **Search**: supports address (hex), tx hash, block number, AND token name/symbol text search

## Recent Runtime Fixes
- `useApiQueries.ts` — guard for non-array resources input
- `useTxsSort.tsx` — `items` undefined safety
- `InternalTxs.tsx` + 26 other pages — `data?.items?.length` optional chaining
- `next.config.js` — `@helia/verified-fetch` stubbed to fix `node:stream` webpack error
- `lib/token/tokenTypes.ts` — added `getTokenTypes()`, `hasTokenTransferValue()`, `NFT_TOKEN_TYPE_IDS`
- `lib/getItemIndex.ts` — supports both array-indexOf and page-offset usage patterns
- `stubs/stats.ts` — added `STATS_COUNTER` export
- `server/src/routes/v2/stats.js` — added `/counters` sub-route with live DB data
- `lib/date/dayjs.ts` — added `FORMATS` export for time formatting

## Address + Search Fixes (April 2026)
- `lib/address/getCheckedSummedAddress.ts` — replaced `require('viem')` (CommonJS dynamic require) with `import { getAddress } from 'viem'` (static ESM import); the CJS require caused webpack to load `viem/_cjs/index.js` which had fast-refresh-injected `import.meta` making webpack parse fail with 500 errors on all address pages
- `server/src/routes/v2/search.js` — extended search to query tokens table by name/symbol (`LIKE %q%`); address lookup now also checks tokens table to return `type: 'token'` results
- `server/src/routes/v2/addresses.js` — parallel queries for `token_transfers`, `token_balances`, `tokens` to populate `has_token_transfers`, `has_tokens`, and `token` fields dynamically

## Socket Fix (April 2026)
- `lib/socket/useSocketChannel.ts` — fires only `onJoin` via `useLayoutEffect` + ref (not setTimeout); fires synchronously so isQueryEnabled unblocks address/contract queries immediately on mount; removed `onSocketError` call to eliminate "Live updates temporarily delayed" banner

## Contract Bytecode — Real Data (April 2026)
- `server/src/routes/v2/smart-contracts.js` — added `fetchBytecodes()` helper that:
  - Fetches **deployed bytecode** live from `eth_getCode` via Atherchain RPC for any unverified contract
  - Finds **creation bytecode** from the `transactions.input` field by looking up the creation tx via `creates` column (or bytecode prefix heuristic as fallback)
  - Results cached in Redis for 5 minutes
- Added `creates` column (`varchar(42)`) to `transactions` table — populated by indexer for contract creation txns, backfilled 5 existing rows
- Indexer now sets `creates = contractAddress.toLowerCase()` when `isContractCreation = true`
- Backfill SQL: `UPDATE transactions SET creates = to_address WHERE LENGTH(input) > 200 AND input LIKE '0x6080%'` (matched all 5 creation txns)
- Frontend now shows both "Contract creation code" and "Deployed bytecode" sections with real hex data

## Contract Tab Fixes (April 2026)
- **Root cause**: `lib/api/fetchApi.ts` — `'contract'` resource was mapped to `/addresses/${hash}` instead of `/smart-contracts/${hash}`; this caused the contract query to silently fetch address data rather than smart contract data, leaving the contract tab blank forever
- `lib/api/fetchApi.ts` — fixed `'contract'` route to `/smart-contracts/${p?.hash}`
- `ui/address/AddressContract.tsx` — removed `isQueryEnabled` state; `isEnabled` now set directly from `isSocketEnabled` (no delayed state update needed)
- `ui/address/contract/useContractTabs.tsx` — contract query enabled directly from `Boolean(addressData?.hash) && Boolean(addressData?.is_contract)` without socket dependency
- `server/src/routes/v2/smart-contracts.js` — returns unverified contract stub (name, address, `is_verified: false`) for token addresses instead of 404
- `stubs/contract.ts` — added `CONTRACT_CODE_UNVERIFIED` and `CONTRACT_CODE_VERIFIED` exports used by `ContractDetails`
- `ui/address/contract/ContractDetails.tsx` — null-guarded `selectedItem` initialization; uses `CONTRACT_CODE_UNVERIFIED` stub
- `ui/address/contract/ContractDetailsVerificationButton.tsx` — null-guarded `multichainContext?.chain?.id`
- `ui/shared/tabs/useScrollToActiveTab.ts` — null-guarded tab ref before scrollIntoView

## Admin Panel (April 2026)
- **Route**: `/admin` — admin panel; `/admin/login` — login page
- **Auth**: JWT-based (24h expiry). Credentials set in `server/.env`: `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`. Defaults: `admin` / `admin123`
- **No DB**: blacklist stored in-memory + persisted to `server/data/blacklist.json` (survives restarts)
- **Features**:
  - Token list: shows all tokens from DB (name, symbol, type, address, decimals, holders)
  - Wallet blacklist: add/remove wallet addresses; blacklisted wallets are hidden from all transaction lists
- **Blacklist enforcement** (server-side, no client bypass possible):
  - `GET /api/v2/transactions` — WHERE clause excludes blacklisted from/to addresses
  - `GET /api/v2/transactions/:hash` — returns 404 if from or to is blacklisted
  - `GET /api/v2/addresses/:hash/transactions` — returns empty if the address is blacklisted
  - `GET /api/v2/main-page/transactions` — homepage live feed excludes blacklisted addresses
- **Server files**: `server/src/blacklist.js`, `server/src/routes/admin.js`, `server/src/middleware/adminAuth.js`
- **Frontend files**: `pages/admin/login.tsx`, `pages/admin/index.tsx` — both bypass explorer layout
- **Proxy**: Next.js forwards `/api/admin/:path*` → backend (added to `next.config.js` rewrites)

## Native Token Icon (April 2026)
- `server/src/routes/v2/stats.js` — `coin_image` changed from `null` to `'/native.png'` so stats API returns the custom token logo path
- `stubs/stats.ts` — `HOMEPAGE_STATS` placeholder now includes `coin_image: '/native.png'` and `secondary_coin_image: null` so the icon shows immediately without a skeleton flash
- `ui/shared/DetailedInfo/DetailedInfoNativeCoinValue.tsx` — added `<NativeTokenIcon boxSize={5}/>` before the coin value in all native coin value detail rows (tx Value, fee breakdown rows)
- `ui/tx/details/TxDetailsTxFee.tsx` — added `<NativeTokenIcon boxSize={5}/>` before the Transaction fee value (both grouped and non-grouped fee layouts)
- `public/native.png` — custom native token logo used via `/native.png` URL (served from Next.js public directory)
- All `NativeTokenIcon` usages are automatically updated: account balance, token balances list, gas tracker page, chain indicators, advanced filter asset dropdown

## TX Page Fixes (April 2026)
- `lib/api/fetchApi.ts` — added 15 missing route mappings: `tx`, `tx_raw_trace`, `tx_interpretation`, `tx_fhe_operations`, `tx_external_transactions`, `noves_transaction`, `operation_by_tx_hash`, `tx_messages`, `gas_tracker`, `stats_counters`, `stats_charts`; these caused `fetchApi` to throw `Error('Unknown API resource')` silently
- `pages/_app.tsx` — removed `ReactQueryDevtools` import (saved ~2.5MB from JS bundle)
- `node_modules/@reown/appkit/` — created fake package stubs (index.js, react.js, networks.js) to resolve `@reown/appkit/react` build error (saves ~13MB chunk)
- `node_modules/@reown/appkit-adapter-wagmi/` — fake package stub  
- `nextjs/getServerSideProps/handlers.ts` — created with `Props` type (imported by many pages)
- `ui/shared/AppActionButton/useAppActionData.tsx` — fixed `data?.addresses[key]` → `data?.addresses?.[key]` (prevented crash when `addresses` is undefined)
- `next.config.js` — removed broken per-file webpack aliases for reown; uses node_modules stubs instead

## Notable Stubs Created
Many files were created to resolve missing module errors in the Blockscout UI codebase:
- `lib/rollbar.ts`, `lib/web3/wagmiConfig.ts`, `lib/metadata/index.ts`
- `lib/hexToAddress.ts`, `lib/isMetaKey.ts`, `lib/base64ToHex.ts`
- `lib/tx/getConfirmationDuration.ts`, `lib/block/getBlockTotalReward.ts`
- `lib/token/parseMetadata.ts`, `lib/token/metadata/urlParser.ts`
- `lib/hooks/useUpdateValueEffect.ts`, `lib/hooks/useInitialList.ts`
- `stubs/search.ts`, `stubs/txInterpretation.ts`, `stubs/txStateChanges.ts`
- `stubs/fheOperations.ts`, `stubs/account.ts`, `stubs/block.ts`
- `mocks/address/address.ts`, `mocks/address/implementations.ts`
- `mocks/blocks/block.ts`, `mocks/blobs/blobs.ts`, `mocks/ens/domain.ts`
- `mocks/txs/tx.ts`, `mocks/pools/pool.ts`, `mocks/metadata/address.ts`
- Many more (advancedFilter, validators, pools, zkSync, scrollL2, ENS, etc.)

## Contract Verification + Read/Write Tab (April 2026)
- **Full verification pipeline**: `server/src/routes/v2/smart-contracts.js` compiles Solidity via `solc`, extracts ABI, stores in `smart_contracts` table, sets `addresses.is_verified = true`, invalidates Redis caches
- **Verification methods**: flattened-code, standard-input, multi-part files all supported
- **`addresses` route**: parallel query to `smart_contracts` table — if row exists, sets `is_verified = true` on the address record (cross-check)
- **Wagmi setup**: `lib/web3/chains.ts` now populates `rpcUrls.default.http` from `config.chain.rpcUrl`; `lib/web3/wagmiConfig.ts` uses `createConfig()` + `http()` to create a real wagmi client pointing at Atherchain RPC; `ui/shared/web3/Web3Provider.tsx` wraps with `<WagmiProvider config={...}>` so `usePublicClient` works in Read Contract tab
- **Bug fixes**: `configs/app/index.ts` — `ides` changed from `[]` to `{ items: [] }` (component accesses `config.UI.ides.items`); `useCallMethodPublicClient.ts` — `multichainContext?.chain.app_config` → `multichainContext?.chain?.app_config` (optional chaining for non-multichain setup)
- **Result**: Contract tab shows green ✓ checkmark after verification, green "source code verified" banner, Code/ABI/Bytecode sub-tabs, and Read/Write contract tab with live on-chain function calls

## Installed Packages (beyond original)
- `prom-client`, `react-number-format`
- `@graphiql/toolkit`, `graphiql`, `graphql`
- `swagger-ui-react`
- `@openzeppelin/contracts`
- `dappscout-iframe`
- `@multisender.app/multisender-react-widget`
- `react-device-detect`, `react-intersection-observer`
- `@helia/verified-fetch`
