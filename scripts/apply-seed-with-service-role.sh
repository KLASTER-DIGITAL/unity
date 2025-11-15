#!/bin/bash

# Apply AI Operations Seed Data using psql
# This script applies the seed migration directly to production database

echo "🌱 Applying AI Operations seed data to production..."

# Get database connection string from Supabase
# Format: postgresql://postgres:[PASSWORD]@db.ecuwuzqlwdkkdncampnc.supabase.co:5432/postgres

# You need to set SUPABASE_DB_PASSWORD environment variable
# Get it from: https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc/settings/database

if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo "❌ Error: SUPABASE_DB_PASSWORD environment variable not set"
    echo ""
    echo "Get the password from:"
    echo "https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc/settings/database"
    echo ""
    echo "Then run:"
    echo "export SUPABASE_DB_PASSWORD='your-password-here'"
    echo "bash scripts/apply-seed-with-service-role.sh"
    exit 1
fi

DB_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.ecuwuzqlwdkkdncampnc.supabase.co:5432/postgres"

# Apply the seed migration
psql "$DB_URL" -f supabase/migrations/20251115000003_seed_ai_operations.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Seed data applied successfully!"
    echo ""
    echo "🔍 Verifying data..."

    # Verify the data was inserted
    psql "$DB_URL" -c "SELECT id, group_name, display_name, is_enabled FROM ai_operations ORDER BY group_name, id;"

    echo ""
    echo "✅ AI Operations seed data is ready!"
else
    echo "❌ Failed to apply seed data"
    exit 1
fi

