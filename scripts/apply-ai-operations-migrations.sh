#!/bin/bash

# Apply AI Operations Migrations Manually
# Применяет 3 миграции для AI Control Center напрямую в Supabase

set -e

echo "🚀 Applying AI Operations migrations..."
echo ""

# Database connection string
DB_URL="postgresql://postgres.ecuwuzqlwdkkdncampnc:Qqq111www222!@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# Migration 1: Create ai_operations table
echo "📋 Step 1/3: Creating ai_operations table..."
psql "$DB_URL" -f supabase/migrations/20251115000001_create_ai_operations.sql
echo "✅ ai_operations table created"
echo ""

# Migration 2: Create ai_operations_history table
echo "📋 Step 2/3: Creating ai_operations_history table..."
psql "$DB_URL" -f supabase/migrations/20251115000002_create_ai_operations_history.sql
echo "✅ ai_operations_history table created"
echo ""

# Migration 3: Seed ai_operations data
echo "📋 Step 3/3: Seeding ai_operations data..."
psql "$DB_URL" -f supabase/migrations/20251115000003_seed_ai_operations.sql
echo "✅ ai_operations data seeded"
echo ""

echo "🎉 All migrations applied successfully!"
echo ""
echo "📊 Verifying..."
psql "$DB_URL" -c "SELECT id, group_name, display_name, model FROM ai_operations ORDER BY group_name, id;"

