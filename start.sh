#!/bin/bash

# Use external Redis if REDIS_URL is set, otherwise start local Redis
if [ -z "$REDIS_URL" ]; then
  echo "Starting local Redis..."
  redis-server --daemonize yes --loglevel warning --save ""
  sleep 1
  if redis-cli ping > /dev/null 2>&1; then
    echo "Redis is running"
  else
    echo "Redis failed to start, continuing without it"
  fi
  LOCAL_REDIS=true
else
  echo "Using external Redis: $REDIS_URL"
  LOCAL_REDIS=false
fi

echo "Starting Blockscout backend server..."
cd /home/runner/workspace/server && node src/index.js &
BACKEND_PID=$!

sleep 2

cd /home/runner/workspace

if [ ! -d ".next" ] || [ ! -f ".next/BUILD_ID" ]; then
  echo "No production build found — running next build..."
  NODE_OPTIONS="--max-old-space-size=6144" npm run build
  BUILD_STATUS=$?
  if [ $BUILD_STATUS -ne 0 ]; then
    echo "Build failed (exit $BUILD_STATUS) — falling back to dev mode"
    NODE_OPTIONS="--max-old-space-size=4096" npm run dev &
    FRONTEND_PID=$!
  else
    echo "Build succeeded — starting production server..."
    NODE_OPTIONS="--max-old-space-size=2048" npm run start &
    FRONTEND_PID=$!
  fi
else
  echo "Production build found — starting production server..."
  NODE_OPTIONS="--max-old-space-size=2048" npm run start &
  FRONTEND_PID=$!
fi

sleep 12

echo "Pre-warming key pages for fast navigation..."
for path in / /txs /blocks /token-transfers /tokens /stats; do
  curl -s --max-time 60 "http://localhost:5000${path}" -o /dev/null
done
echo "Pre-warming complete."

cleanup() {
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  if [ "$LOCAL_REDIS" = "true" ]; then
    redis-cli shutdown 2>/dev/null
  fi
  exit
}
trap cleanup SIGTERM SIGINT

wait $FRONTEND_PID
