#!/bin/bash

# UNITY-v2 Pre-Deploy Quality Checks
# Этот скрипт выполняет ВСЕ проверки перед деплоем

set -e  # Остановить при первой ошибке

echo "🚀 UNITY-v2 Pre-Deploy Quality Checks"
echo "======================================"
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Счетчик ошибок
ERRORS=0

# 1. TypeScript проверка
echo "📝 Step 1/4: TypeScript check..."
if npm run type-check; then
  echo -e "${GREEN}✅ TypeScript: OK${NC}"
else
  echo -e "${RED}❌ TypeScript: FAILED${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. Build проверка
echo "🏗️  Step 2/4: Build check..."
if npm run build; then
  echo -e "${GREEN}✅ Build: OK${NC}"
  
  # Проверка размера бандла
  BUNDLE_SIZE=$(du -sh dist 2>/dev/null | cut -f1 || echo "N/A")
  echo "📦 Bundle size: $BUNDLE_SIZE"
else
  echo -e "${RED}❌ Build: FAILED${NC}"
  ERRORS=$((ERRORS + 1))
fi
echo ""

# 3. Supabase Advisors проверка (требует Supabase CLI)
echo "🔒 Step 3/4: Supabase Advisors check..."
echo -e "${YELLOW}⚠️  Manual check required:${NC}"
echo "   Run: get_advisors_supabase({ project_id: 'ecuwuzqlwdkkdncampnc', type: 'security' })"
echo "   Run: get_advisors_supabase({ project_id: 'ecuwuzqlwdkkdncampnc', type: 'performance' })"
echo ""

# 4. Консоль браузера проверка
echo "🌐 Step 4/4: Browser console check..."
echo -e "${YELLOW}⚠️  Manual check required:${NC}"
echo "   1. Start dev server: npm run dev"
echo "   2. Open Chrome DevTools"
echo "   3. Check for errors in console"
echo "   4. Test both /?view=admin and / routes"
echo ""

# Итоговый результат
echo "======================================"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ All automated checks passed!${NC}"
  echo ""
  echo "⚠️  Don't forget manual checks:"
  echo "   - Supabase Advisors"
  echo "   - Browser console"
  echo ""
  echo "Ready to deploy? Run: npm run deploy"
  exit 0
else
  echo -e "${RED}❌ $ERRORS check(s) failed!${NC}"
  echo "Fix errors before deploying."
  exit 1
fi

