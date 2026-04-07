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

PROD_COMPLETE=false
if [ -f ".next/BUILD_ID" ] && [ -f ".next/routes-manifest.json" ] && [ -f ".next/prerender-manifest.json" ] && [ -d ".next/static" ]; then
  PROD_COMPLETE=true
fi

cleanup() {
  kill $BACKEND_PID $FRONTEND_PID $PLACEHOLDER_PID 2>/dev/null
  if [ "$LOCAL_REDIS" = "true" ]; then
    redis-cli shutdown 2>/dev/null
  fi
  exit
}
trap cleanup SIGTERM SIGINT

if [ "$PROD_COMPLETE" = "true" ]; then
  echo "Complete production build found — starting production server..."
  NODE_OPTIONS="--max-old-space-size=2048" npm run start &
  FRONTEND_PID=$!
  wait $FRONTEND_PID
else
  echo "No complete production build — starting placeholder server on port 5000..."
  # Start a minimal HTTP server to keep the workflow alive while we build
  node -e "
const http = require('http');
const fs = require('fs');
const body = '<html><body><h2>Ather Chain Explorer</h2><p>Starting up... Please wait while the application builds.</p><script>setTimeout(function(){window.location.reload()},15000);</script></body></html>';
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(body);
});
server.listen(5000, '0.0.0.0', () => console.log('Placeholder on 5000'));
// Stop when signal file appears
setInterval(() => { if(fs.existsSync('/tmp/placeholder_stop')) process.exit(0); }, 1000);
" &
  PLACEHOLDER_PID=$!
  sleep 3

  echo "Building production bundle (full memory, no dev server)..."
  NODE_OPTIONS="--max-old-space-size=6144" NEXT_TELEMETRY_DISABLED=1 npm run build > /tmp/build.log 2>&1
  BUILD_STATUS=$?

  if [ $BUILD_STATUS -eq 0 ] && [ -f ".next/BUILD_ID" ] && [ -f ".next/routes-manifest.json" ]; then
    echo "Build succeeded — stopping placeholder and starting production server..."
    touch /tmp/placeholder_stop
    sleep 2
    NODE_OPTIONS="--max-old-space-size=2048" npm run start &
    FRONTEND_PID=$!
    wait $FRONTEND_PID
  else
    echo "Build failed (exit $BUILD_STATUS) — switching to dev mode..."
    cat /tmp/build.log | tail -20
    touch /tmp/placeholder_stop
    sleep 2
    NODE_OPTIONS="--max-old-space-size=4096" npm run dev &
    FRONTEND_PID=$!
    wait $FRONTEND_PID
  fi
fi
