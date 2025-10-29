#!/bin/bash
# Script to replace hardcoded Tailwind colors with CSS variables
# This ensures proper dark theme support

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🎨 Fixing hardcoded colors...${NC}"

# Find all TypeScript/TSX files with hardcoded colors
FILES=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "bg-white\|bg-gray-\|text-gray-\|border-gray-" | grep -v ".test." | grep -v "node_modules")

COUNT=0

for FILE in $FILES; do
  echo "Processing: $FILE"
  
  # Backup original file
  cp "$FILE" "$FILE.bak"
  
  # Replace common patterns
  sed -i '' \
    -e 's/bg-white\([^/]\)/bg-card\1/g' \
    -e 's/bg-gray-50/bg-muted/g' \
    -e 's/bg-gray-100/bg-muted/g' \
    -e 's/bg-gray-200/bg-muted/g' \
    -e 's/bg-gray-300/bg-muted/g' \
    -e 's/bg-gray-600/bg-muted/g' \
    -e 's/bg-gray-700/bg-muted/g' \
    -e 's/bg-gray-800/bg-card/g' \
    -e 's/bg-gray-900/bg-card/g' \
    -e 's/text-gray-400/text-muted-foreground/g' \
    -e 's/text-gray-500/text-muted-foreground/g' \
    -e 's/text-gray-600/text-muted-foreground/g' \
    -e 's/text-gray-700/text-foreground/g' \
    -e 's/text-gray-800/text-foreground/g' \
    -e 's/text-gray-900/text-foreground/g' \
    -e 's/border-gray-200/border-border/g' \
    -e 's/border-gray-300/border-border/g' \
    -e 's/border-gray-700/border-border/g' \
    "$FILE"
  
  # Check if file changed
  if ! diff -q "$FILE" "$FILE.bak" > /dev/null 2>&1; then
    COUNT=$((COUNT + 1))
    rm "$FILE.bak"
  else
    # Restore if no changes
    mv "$FILE.bak" "$FILE"
  fi
done

echo -e "${GREEN}✅ Fixed $COUNT files!${NC}"

