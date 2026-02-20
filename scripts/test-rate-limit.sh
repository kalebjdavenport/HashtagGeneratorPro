#!/bin/bash
# Sends sequential requests to /api/generate to demonstrate rate limiting.
# The first few requests succeed, then the provider starts returning 429s.
#
# Usage: ./scripts/test-rate-limit.sh [url] [method] [count]
#   url     — base URL (default: http://localhost:3000)
#   method  — claude | openai | gemini (default: claude)
#   count   — number of requests (default: 10)

URL="${1:-http://localhost:3000}"
METHOD="${2:-claude}"
COUNT="${3:-10}"

# Check the server is reachable before starting
if ! curl -s --max-time 3 "$URL" > /dev/null 2>&1; then
  echo ""
  echo "  ERROR: Cannot connect to $URL"
  echo "  Make sure the dev server is running (npm run dev)"
  echo ""
  exit 1
fi

echo ""
echo "  Rate limit test — $METHOD"
echo "  $URL/api/generate"
echo "  Sending $COUNT requests sequentially"
echo "  ---"

for i in $(seq 1 "$COUNT"); do
  response=$(curl -s --max-time 30 -w "\n%{http_code}" -X POST "$URL/api/generate" \
    -H 'Content-Type: application/json' \
    -d "{\"method\":\"$METHOD\",\"text\":\"Rate limit test number $i at $(date +%s)\"}")

  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" = "200" ]; then
    count=$(echo "$body" | grep -o '"#[^"]*"' | wc -l | tr -d ' ')
    echo "  #$i  ✓  OK — $count hashtags"
  elif [ "$http_code" = "429" ]; then
    error=$(echo "$body" | grep -o '"error":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "  #$i  ✗  RATE LIMITED — $error"
  elif [ "$http_code" = "000" ]; then
    echo "  #$i  ✗  CONNECTION FAILED — server not responding"
  else
    error=$(echo "$body" | grep -o '"error":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "  #$i  ✗  HTTP $http_code — $error"
  fi
done

echo "  ---"
echo "  Done."
echo ""
