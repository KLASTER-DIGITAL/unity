#!/bin/bash

# Deploy Edge Function to Supabase
# This script deploys the make-server-9729c493 Edge Function

set -e

PROJECT_REF="ecuwuzqlwdkkdncampnc"
FUNCTION_NAME="make-server-9729c493"

echo "🚀 Deploying Edge Function: $FUNCTION_NAME"
echo "📦 Project: $PROJECT_REF"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

# Check Supabase CLI version
echo "📋 Supabase CLI version:"
supabase --version
echo ""

# Deploy the function
echo "🔄 Deploying function..."
cd /Users/rustamkarimov/DEV/UNITY-v2

supabase functions deploy $FUNCTION_NAME \
  --project-ref $PROJECT_REF \
  --no-verify-jwt=false

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Edge Function deployed successfully!"
    echo ""
    echo "📊 Function details:"
    echo "   Name: $FUNCTION_NAME"
    echo "   URL: https://$PROJECT_REF.supabase.co/functions/v1/$FUNCTION_NAME"
    echo ""
    echo "🔍 Next steps:"
    echo "   1. Test the /analyze endpoint"
    echo "   2. Create a new user and check AI analysis"
    echo "   3. Verify motivation cards are generated"
else
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "💡 Troubleshooting:"
    echo "   1. Check if Docker is running"
    echo "   2. Verify Supabase CLI is logged in: supabase login"
    echo "   3. Check function syntax: deno check supabase/functions/$FUNCTION_NAME/index.ts"
    exit 1
fi

