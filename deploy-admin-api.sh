#!/bin/bash
# Deploy admin-api v7 with settings endpoints

echo "Deploying admin-api v7..."

# Use Supabase CLI to deploy
cd /Users/rustamkarimov/DEV/UNITY-v2

# Start Docker if not running
if ! docker info > /dev/null 2>&1; then
    echo "Starting Docker..."
    open -a Docker
    sleep 10
fi

# Deploy function
supabase functions deploy admin-api --project-ref ecuwuzqlwdkkdncampnc --no-verify-jwt

echo "Deployment complete!"

