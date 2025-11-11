#!/bin/bash

# Setup Telegram Bot Webhook
# This script registers the webhook URL with Telegram Bot API

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🤖 Setting up Telegram Bot Webhook...${NC}\n"

# Webhook URL
WEBHOOK_URL="https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/telegram-bot-webhook"

echo -e "${YELLOW}📝 Instructions:${NC}"
echo "1. Get your TELEGRAM_BOT_TOKEN from Supabase Dashboard"
echo "2. Go to: https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc/settings/functions"
echo "3. Find TELEGRAM_BOT_TOKEN in Secrets"
echo "4. Copy the token value"
echo ""
echo -e "${YELLOW}Enter your TELEGRAM_BOT_TOKEN:${NC}"
read -s BOT_TOKEN

if [ -z "$BOT_TOKEN" ]; then
  echo -e "${RED}❌ Error: BOT_TOKEN is empty${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}🔗 Setting webhook URL: ${WEBHOOK_URL}${NC}"

# Set webhook
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${WEBHOOK_URL}\"}")

# Check if successful
if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo -e "${GREEN}✅ Webhook set successfully!${NC}"
  echo ""
  echo -e "${GREEN}Response:${NC}"
  echo "$RESPONSE" | jq '.'
  echo ""
  echo -e "${GREEN}🎉 Telegram Bot is now ready to receive notifications!${NC}"
  echo ""
  echo -e "${YELLOW}Next steps:${NC}"
  echo "1. Open Telegram and find @diary_bookai_bot"
  echo "2. Send /start command"
  echo "3. Link your account through UNITY app Settings → Telegram"
  echo "4. Test notifications!"
else
  echo -e "${RED}❌ Failed to set webhook${NC}"
  echo ""
  echo -e "${RED}Response:${NC}"
  echo "$RESPONSE" | jq '.'
  exit 1
fi

