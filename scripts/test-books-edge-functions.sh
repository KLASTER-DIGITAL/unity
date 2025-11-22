#!/bin/bash

# Edge Functions Testing Script
# Tests all book-related Edge Functions

set -e

PROJECT_ID="ecuwuzqlwdkkdncampnc"
BASE_URL="https://${PROJECT_ID}.supabase.co/functions/v1"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing Books Edge Functions..."
echo ""

# Check if token is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Access token required${NC}"
    echo "Usage: $0 <ACCESS_TOKEN>"
    exit 1
fi

TOKEN=$1
USER_ID="726a9369-8c28-4134-b03f-3c29ad1235f4"

# Test 1: books-generate-free
echo -e "${YELLOW}📋 Test 1: books-generate-free${NC}"
START_TIME=$(date +%s)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/books-generate-free" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${USER_ID}\",
    \"periodStart\": \"2025-11-01\",
    \"periodEnd\": \"2025-11-22\",
    \"contexts\": []
  }")
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Success (${DURATION}s)${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Failed (HTTP ${HTTP_CODE})${NC}"
    echo "$BODY"
fi
echo ""

# Test 2: books-generate-draft (PREMIUM)
echo -e "${YELLOW}📋 Test 2: books-generate-draft (PREMIUM)${NC}"
START_TIME=$(date +%s)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/books-generate-draft" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${USER_ID}\",
    \"periodStart\": \"2025-11-01\",
    \"periodEnd\": \"2025-11-22\",
    \"plan_type\": \"premium\",
    \"type\": \"month\",
    \"style\": \"warm_family\",
    \"layout\": \"photo_text\",
    \"theme\": \"light\"
  }")
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Success (${DURATION}s)${NC}"
    DRAFT_ID=$(echo "$BODY" | jq -r '.draftId' 2>/dev/null || echo "")
    echo "Draft ID: $DRAFT_ID"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Failed (HTTP ${HTTP_CODE})${NC}"
    echo "$BODY"
fi
echo ""

# Test 3: books-generate-quarter
echo -e "${YELLOW}📋 Test 3: books-generate-quarter${NC}"
START_TIME=$(date +%s)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/books-generate-quarter" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${USER_ID}\",
    \"periodStart\": \"2025-09-01\",
    \"periodEnd\": \"2025-11-22\",
    \"style\": \"warm_family\",
    \"layout\": \"photo_text\",
    \"theme\": \"light\"
  }")
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Success (${DURATION}s)${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Failed (HTTP ${HTTP_CODE})${NC}"
    echo "$BODY"
fi
echo ""

# Test 4: entry-summaries-generate
echo -e "${YELLOW}📋 Test 4: entry-summaries-generate${NC}"
START_TIME=$(date +%s)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/entry-summaries-generate" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"${USER_ID}\",
    \"periodStart\": \"2025-11-01\",
    \"periodEnd\": \"2025-11-22\"
  }")
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Success (${DURATION}s)${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Failed (HTTP ${HTTP_CODE})${NC}"
    echo "$BODY"
fi
echo ""

echo -e "${GREEN}🎉 All tests completed!${NC}"

