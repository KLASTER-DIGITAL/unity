#!/bin/bash

# ============================================================================
# Deploy Edge Function to Supabase (NO DOCKER)
# ============================================================================
# 
# UNITY-v2 правила:
# - НИКОГДА не использовать Docker для Edge Functions
# - ВСЕГДА использовать Supabase CLI напрямую
# - Деплой через Supabase MCP команду deploy_edge_function_supabase
#
# Usage:
#   ./deploy-edge-function.sh <function-name>
#
# Examples:
#   ./deploy-edge-function.sh admin-api
#   ./deploy-edge-function.sh motivations
#   ./deploy-edge-function.sh translations-api
#
# ============================================================================

set -e

# Configuration
PROJECT_REF="ecuwuzqlwdkkdncampnc"
FUNCTION_NAME=$1

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Validation
# ============================================================================

if [ -z "$FUNCTION_NAME" ]; then
    echo -e "${RED}❌ Error: Function name is required${NC}"
    echo ""
    echo "Usage: $0 <function-name>"
    echo ""
    echo "Available functions:"
    echo "  - admin-api"
    echo "  - motivations"
    echo "  - translations-api"
    echo "  - ai-analysis"
    echo "  - push-realtime-trigger"
    echo ""
    exit 1
fi

# Check if function directory exists
if [ ! -d "supabase/functions/$FUNCTION_NAME" ]; then
    echo -e "${RED}❌ Error: Function directory not found${NC}"
    echo "   Path: supabase/functions/$FUNCTION_NAME"
    echo ""
    echo "Available functions:"
    ls -1 supabase/functions/ | grep -v "^_" || echo "  (none)"
    echo ""
    exit 1
fi

# ============================================================================
# Pre-deployment checks
# ============================================================================

echo -e "${BLUE}🔍 Pre-deployment checks...${NC}"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo ""
    echo "Install it with:"
    echo "  brew install supabase/tap/supabase"
    echo ""
    exit 1
fi

# Check Supabase CLI version
echo -e "${BLUE}📋 Supabase CLI version:${NC}"
supabase --version
echo ""

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Supabase${NC}"
    echo ""
    echo "Login with:"
    echo "  supabase login"
    echo ""
    exit 1
fi

# Verify function syntax (if Deno is available)
if command -v deno &> /dev/null; then
    echo -e "${BLUE}🔍 Checking TypeScript syntax...${NC}"
    if deno check supabase/functions/$FUNCTION_NAME/index.ts; then
        echo -e "${GREEN}✅ Syntax check passed${NC}"
    else
        echo -e "${RED}❌ Syntax check failed${NC}"
        echo ""
        echo "Fix TypeScript errors before deploying"
        exit 1
    fi
    echo ""
fi

# ============================================================================
# Deployment
# ============================================================================

echo -e "${BLUE}🚀 Deploying Edge Function...${NC}"
echo ""
echo "  Function: $FUNCTION_NAME"
echo "  Project:  $PROJECT_REF"
echo ""

# Deploy the function (NO DOCKER - direct Supabase CLI)
supabase functions deploy $FUNCTION_NAME \
  --project-ref $PROJECT_REF \
  --no-verify-jwt

# Check deployment status
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Edge Function deployed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📊 Function details:${NC}"
    echo "   Name: $FUNCTION_NAME"
    echo "   URL:  https://$PROJECT_REF.supabase.co/functions/v1/$FUNCTION_NAME"
    echo ""
    echo -e "${BLUE}🔍 Next steps:${NC}"
    echo "   1. Test the function endpoint"
    echo "   2. Check Supabase logs for errors"
    echo "   3. Verify function behavior in production"
    echo ""
    echo -e "${BLUE}📝 View logs:${NC}"
    echo "   supabase functions logs $FUNCTION_NAME --project-ref $PROJECT_REF"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo ""
    echo -e "${YELLOW}💡 Troubleshooting:${NC}"
    echo "   1. Check if you're logged in: supabase login"
    echo "   2. Verify function syntax: deno check supabase/functions/$FUNCTION_NAME/index.ts"
    echo "   3. Check function size: must be < 300 lines (standalone pattern)"
    echo "   4. Review Supabase logs for errors"
    echo ""
    exit 1
fi

# ============================================================================
# Post-deployment verification
# ============================================================================

echo -e "${BLUE}🔍 Post-deployment verification...${NC}"
echo ""

# Test function endpoint (basic health check)
echo "Testing function endpoint..."
FUNCTION_URL="https://$PROJECT_REF.supabase.co/functions/v1/$FUNCTION_NAME"

# Simple curl test (will fail if function requires auth, but that's OK)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$FUNCTION_URL" || echo "000")

if [ "$HTTP_CODE" = "000" ]; then
    echo -e "${YELLOW}⚠️  Could not reach function endpoint${NC}"
    echo "   This might be normal if function requires authentication"
elif [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo -e "${GREEN}✅ Function is live (requires authentication)${NC}"
elif [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Function is live and responding${NC}"
else
    echo -e "${YELLOW}⚠️  Function returned HTTP $HTTP_CODE${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""

