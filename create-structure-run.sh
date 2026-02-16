#!/bin/bash

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Check required environment variables
if [ -z "$HM_ACCESS_KEY" ]; then
  echo "Error: HM_ACCESS_KEY is not set"
  exit 1
fi
echo "HM_ACCESS_KEY: $HM_ACCESS_KEY"

if [ -z "$GENAI_BASE_URL" ]; then
  echo "Error: GENAI_BASE_URL is not set"
  exit 1
fi
echo "GENAI_BASE_URL: $GENAI_BASE_URL"

if [ -z "$GENAI_STRUCTURE_ID" ]; then
  echo "Error: GENAI_STRUCTURE_ID is not set"
  exit 1
fi

if [ -z "$GENAI_KB_ID" ]; then
  echo "Error: GENAI_KB_ID is not set"
  exit 1
fi

# Set prompt (can be passed as first argument or use default)
PROMPT="${1:-Hello, what can you help me with?}"

# Build the URL with query parameters
STRUCTURE_ID="$GENAI_STRUCTURE_ID"
# URL encode the path parameter
PATH_JSON="{\"structure_id\":\"$STRUCTURE_ID\"}"
ENCODED_PATH=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$PATH_JSON'))")
URL="${GENAI_BASE_URL}/api/structures/${STRUCTURE_ID}/runs?path=${ENCODED_PATH}"

# Build the request body
REQUEST_BODY=$(cat <<EOF
{
  "args": [
    "-p", "$PROMPT",
    "-k", "$GENAI_KB_ID"
  ]
}
EOF
)

echo "Calling createStructureRun API..."
echo "URL: $URL"
echo ""

# Make the API call
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$URL" \
  -H "Authorization: Bearer ${HM_ACCESS_KEY}" \
  -H "Content-Type: application/json" \
  -d "$REQUEST_BODY")

# Extract HTTP status code and response body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response:"
echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"

# Exit with error if request failed
if [ "$HTTP_CODE" -ge 400 ]; then
  exit 1
fi
