#!/bin/bash

# 📊 Documentation Ratio Checker for UNITY-v2
# Проверяет соотношение документации к исходному коду (1:1 правило)
# Автор: Product Team UNITY
# Дата: 21 октября 2025

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 Checking Documentation Ratio...${NC}"
echo ""

# Count source files (excluding node_modules, dist, build)
SOURCE_FILES=$(find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | wc -l | tr -d ' ')

# Count documentation files (excluding README.md in root)
DOCS_FILES=$(find docs -type f -name "*.md" | wc -l | tr -d ' ')

# Calculate ratio
RATIO=$(echo "scale=2; $DOCS_FILES / $SOURCE_FILES * 100" | bc)

echo -e "${BLUE}Source Files:${NC} $SOURCE_FILES"
echo -e "${BLUE}Documentation Files:${NC} $DOCS_FILES"
echo -e "${BLUE}Ratio:${NC} ${RATIO}%"
echo ""

# Check if ratio exceeds 100%
if (( $(echo "$DOCS_FILES > $SOURCE_FILES" | bc -l) )); then
  echo -e "${RED}❌ FAILED: Documentation ratio exceeds 100%!${NC}"
  echo -e "${YELLOW}Documentation files should not exceed source files.${NC}"
  echo -e "${YELLOW}Current: $DOCS_FILES docs vs $SOURCE_FILES source files${NC}"
  echo ""
  echo -e "${YELLOW}Recommendations:${NC}"
  echo "  1. Archive old documentation to docs/changelog/archive/"
  echo "  2. Remove duplicate or outdated documentation"
  echo "  3. Consolidate related documentation into single files"
  echo ""
  exit 1
elif (( $(echo "$RATIO > 80" | bc -l) )); then
  echo -e "${YELLOW}⚠️  WARNING: Documentation ratio is high (${RATIO}%)${NC}"
  echo -e "${YELLOW}Consider archiving old documentation.${NC}"
  echo ""
  exit 0
else
  echo -e "${GREEN}✅ PASSED: Documentation ratio is healthy (${RATIO}%)${NC}"
  echo ""
  exit 0
fi

