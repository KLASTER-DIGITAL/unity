#!/bin/bash

# Apply Books System Migrations
# Применяет 4 миграции для системы книг

set -e

echo "🚀 Applying Books System migrations..."
echo ""

# Database connection string
DB_URL="postgresql://postgres.ecuwuzqlwdkkdncampnc:Qqq111www222!@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# Migration 1: Add plan_type, type, language to books_archive
echo "📋 Step 1/4: Adding plan_type, type, language to books_archive..."
psql "$DB_URL" -f supabase/migrations/20251122000001_add_books_plan_type_and_versioning.sql
echo "✅ books_archive updated"
echo ""

# Migration 2: Create monthly_snapshots table
echo "📋 Step 2/4: Creating monthly_snapshots table..."
psql "$DB_URL" -f supabase/migrations/20251122000002_create_monthly_snapshots.sql
echo "✅ monthly_snapshots table created"
echo ""

# Migration 3: Create entry_summaries table
echo "📋 Step 3/4: Creating entry_summaries table..."
psql "$DB_URL" -f supabase/migrations/20251122000003_create_entry_summaries.sql
echo "✅ entry_summaries table created"
echo ""

# Migration 4: Add person_tags to entries
echo "📋 Step 4/4: Adding person_tags to entries..."
psql "$DB_URL" -f supabase/migrations/20251122000004_add_person_tags_to_entries.sql
echo "✅ person_tags added to entries"
echo ""

echo "🎉 All migrations applied successfully!"
echo ""
echo "📊 Verifying..."
psql "$DB_URL" -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'books_archive' AND column_name IN ('plan_type', 'type', 'language', 'parent_book_id', 'version');"
echo ""
psql "$DB_URL" -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('monthly_snapshots', 'entry_summaries');"
echo ""
echo "✅ Verification complete!"

