#!/bin/bash

# Script to fix hardcoded 'ru-RU' and 'ru' locales in date formatting
# Replaces with dynamic language from useTranslation hook

echo "🔧 Fixing hardcoded locales in date formatting..."

# Files to fix
FILES=(
  "src/features/mobile/achievements/components/AchievementsScreen.tsx"
  "src/features/mobile/reports/components/ReportsScreen.tsx"
  "src/features/mobile/reports/components/ReportsArchiveScreen.tsx"
  "app/(tabs)/achievements.tsx"
  "app-shared/components/screens/history/EntryCard.native.tsx"
  "app-shared/components/screens/home/RecentEntriesFeed.native.tsx"
  "src/features/mobile/reports/components/BooksLibraryScreen.native.tsx"
)

# Backup directory
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Processing: $file"
    
    # Create backup
    cp "$file" "$BACKUP_DIR/$(basename $file).bak"
    
    # Replace 'ru-RU' with currentLanguage (but keep in comments)
    sed -i.tmp "s/toLocaleDateString('ru-RU'/toLocaleDateString(currentLanguage/g" "$file"
    sed -i.tmp "s/toLocaleDateString(\"ru-RU\"/toLocaleDateString(currentLanguage/g" "$file"
    
    # Replace standalone 'ru' locale
    sed -i.tmp "s/DateTimeFormat('ru'/DateTimeFormat(currentLanguage/g" "$file"
    sed -i.tmp "s/DateTimeFormat(\"ru\"/DateTimeFormat(currentLanguage/g" "$file"
    
    # Clean up temp files
    rm -f "$file.tmp"
    
    echo "✅ Fixed: $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "✨ Done! Backups saved to: $BACKUP_DIR"
echo ""
echo "⚠️  IMPORTANT: You need to add 'const { currentLanguage } = useTranslation();' to components that don't have it yet!"

