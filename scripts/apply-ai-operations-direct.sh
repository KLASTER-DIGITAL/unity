#!/bin/bash

# Apply AI Operations Migrations Directly via SQL
# Применяет 3 миграции для AI Control Center через прямое выполнение SQL

set -e

echo "🚀 Applying AI Operations migrations via direct SQL execution..."
echo ""

# Supabase credentials
PROJECT_ID="ecuwuzqlwdkkdncampnc"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTg2OTQsImV4cCI6MjA3NTYzNDY5NH0.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88"

# Read migration files
MIGRATION_1=$(cat supabase/migrations/20251115000001_create_ai_operations.sql)
MIGRATION_2=$(cat supabase/migrations/20251115000002_create_ai_operations_history.sql)
MIGRATION_3=$(cat supabase/migrations/20251115000003_seed_ai_operations.sql)

echo "📋 Step 1/3: Creating ai_operations table..."
echo "$MIGRATION_1" | curl -X POST \
  "https://${PROJECT_ID}.supabase.co/rest/v1/rpc/exec_sql" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$MIGRATION_1" | jq -Rs .)}"

echo "✅ ai_operations table created"
echo ""

echo "📋 Step 2/3: Creating ai_operations_history table..."
echo "$MIGRATION_2" | curl -X POST \
  "https://${PROJECT_ID}.supabase.co/rest/v1/rpc/exec_sql" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$MIGRATION_2" | jq -Rs .)}"

echo "✅ ai_operations_history table created"
echo ""

echo "📋 Step 3/3: Seeding ai_operations data..."
echo "$MIGRATION_3" | curl -X POST \
  "https://${PROJECT_ID}.supabase.co/rest/v1/rpc/exec_sql" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$MIGRATION_3" | jq -Rs .)}"

echo "✅ ai_operations data seeded"
echo ""

echo "🎉 All migrations applied successfully!"
echo ""
echo "📊 Verifying..."
curl -X GET \
  "https://${PROJECT_ID}.supabase.co/rest/v1/ai_operations?select=id,display_name,model&order=group_name,id" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" | jq .

echo ""
echo "✅ Done! Check the output above to verify 6 operations were created."

