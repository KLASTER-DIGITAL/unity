#!/bin/bash

# 📊 Еженедельный аудит документации UNITY-v2
# Автор: AI Assistant (Augment Agent)
# Дата создания: 21 октября 2025
# Рекомендация: REC-002 из DOCS_RECOMMENDATIONS_2025-10-21.md

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Заголовок
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Еженедельный аудит документации UNITY-v2${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Дата: $(date +%Y-%m-%d)"
echo ""

# Переменные
REPORT_DIR="docs/reports"
REPORT_FILE="$REPORT_DIR/weekly-audit-$(date +%Y-%m-%d).md"
DOCS_DIR="docs"

# Создать папку для отчетов, если не существует
mkdir -p "$REPORT_DIR"

# Начать отчет
cat > "$REPORT_FILE" << 'EOF'
# 📊 Еженедельный аудит документации

**Дата**: $(date +%Y-%m-%d)  
**Автор**: Автоматический скрипт weekly-docs-audit.sh  
**Статус**: ✅ Завершено

---

## 📈 Итоговая статистика

EOF

# 1. Documentation Ratio
echo -e "${YELLOW}1️⃣ Проверка documentation ratio...${NC}"
echo ""

if [ -f "scripts/check-docs-ratio.sh" ]; then
    RATIO_OUTPUT=$(bash scripts/check-docs-ratio.sh 2>&1)
    echo "$RATIO_OUTPUT"
    echo ""
    
    # Добавить в отчет
    echo "### 1. Documentation Ratio" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    echo "$RATIO_OUTPUT" >> "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
else
    echo -e "${RED}❌ Скрипт check-docs-ratio.sh не найден${NC}"
    echo ""
fi

# 2. Завершенные документы
echo -e "${YELLOW}2️⃣ Поиск завершенных документов для архивации...${NC}"
echo ""

COMPLETED_DOCS=$(find "$DOCS_DIR" -type f -name "*.md" \
    ! -path "*/archive/completed/*" \
    ! -path "*/node_modules/*" \
    -exec grep -l "✅.*ЗАВЕРШЕНО\|✅.*COMPLETE\|✅.*УСПЕШНО" {} \; 2>/dev/null || true)

if [ -n "$COMPLETED_DOCS" ]; then
    COMPLETED_COUNT=$(echo "$COMPLETED_DOCS" | wc -l | tr -d ' ')
    echo -e "${YELLOW}Найдено завершенных документов: $COMPLETED_COUNT${NC}"
    echo ""
    echo "$COMPLETED_DOCS" | while read -r file; do
        echo "  - $file"
    done
    echo ""
    
    # Добавить в отчет
    echo "### 2. Завершенные документы для архивации" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "**Найдено**: $COMPLETED_COUNT документов" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "$COMPLETED_DOCS" | while read -r file; do
        echo "- \`$file\`" >> "$REPORT_FILE"
    done
    echo "" >> "$REPORT_FILE"
else
    echo -e "${GREEN}✅ Нет завершенных документов для архивации${NC}"
    echo ""
    
    echo "### 2. Завершенные документы для архивации" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "✅ Нет завершенных документов для архивации" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

# 3. Битые ссылки
echo -e "${YELLOW}3️⃣ Проверка битых ссылок...${NC}"
echo ""

if [ -f "scripts/check-broken-links.sh" ]; then
    BROKEN_LINKS_OUTPUT=$(bash scripts/check-broken-links.sh 2>&1 | grep -E "^(❌ Битых ссылок:|✅ Битых ссылок:)" || echo "Проверка завершена")
    echo "$BROKEN_LINKS_OUTPUT"
    echo ""
    
    # Добавить в отчет
    echo "### 3. Битые ссылки" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    echo "$BROKEN_LINKS_OUTPUT" >> "$REPORT_FILE"
    echo '```' >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
else
    echo -e "${RED}❌ Скрипт check-broken-links.sh не найден${NC}"
    echo ""
fi

# 4. Документы без статусов
echo -e "${YELLOW}4️⃣ Поиск документов без статусов...${NC}"
echo ""

NO_STATUS_DOCS=$(find "$DOCS_DIR" -type f -name "*.md" \
    ! -path "*/archive/*" \
    ! -path "*/node_modules/*" \
    ! -name "README.md" \
    ! -name "INDEX.md" \
    ! -name "CHANGELOG.md" \
    ! -name "FIX.md" \
    -exec grep -L "Статус:\|Status:\|✅\|🔄\|📅\|💡\|⏸️" {} \; 2>/dev/null || true)

if [ -n "$NO_STATUS_DOCS" ]; then
    NO_STATUS_COUNT=$(echo "$NO_STATUS_DOCS" | wc -l | tr -d ' ')
    echo -e "${YELLOW}Найдено документов без статусов: $NO_STATUS_COUNT${NC}"
    echo ""
    echo "$NO_STATUS_DOCS" | head -10 | while read -r file; do
        echo "  - $file"
    done
    if [ "$NO_STATUS_COUNT" -gt 10 ]; then
        echo "  ... и еще $((NO_STATUS_COUNT - 10)) файлов"
    fi
    echo ""
    
    # Добавить в отчет
    echo "### 4. Документы без статусов" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "**Найдено**: $NO_STATUS_COUNT документов" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "$NO_STATUS_DOCS" | head -20 | while read -r file; do
        echo "- \`$file\`" >> "$REPORT_FILE"
    done
    if [ "$NO_STATUS_COUNT" -gt 20 ]; then
        echo "" >> "$REPORT_FILE"
        echo "_... и еще $((NO_STATUS_COUNT - 20)) файлов_" >> "$REPORT_FILE"
    fi
    echo "" >> "$REPORT_FILE"
else
    echo -e "${GREEN}✅ Все документы имеют статусы${NC}"
    echo ""
    
    echo "### 4. Документы без статусов" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "✅ Все документы имеют статусы" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

# 5. Naming conventions
echo -e "${YELLOW}5️⃣ Проверка naming conventions...${NC}"
echo ""

# Проверка changelog
WRONG_CHANGELOG=$(find "$DOCS_DIR/changelog" -name "*.md" \
    ! -path "*/archive/*" \
    ! -name "README.md" \
    ! -name "CHANGELOG.md" \
    ! -name "FIX.md" \
    -type f 2>/dev/null | while read -r f; do
        basename "$f" | grep -E "^[0-9]{4}-[0-9]{2}-[0-9]{2}_[a-z_]+\.md$" > /dev/null || echo "$f"
    done)

# Проверка tasks
WRONG_TASKS=$(find "$DOCS_DIR/plan/tasks" -name "*.md" \
    ! -name "README.md" \
    -type f 2>/dev/null | while read -r f; do
        basename "$f" | grep -E "^[a-z-]+\.md$" > /dev/null || echo "$f"
    done)

# Проверка architecture
WRONG_ARCH=$(find "$DOCS_DIR/architecture" -name "*.md" \
    -type f 2>/dev/null | while read -r f; do
        basename "$f" | grep -E "^[A-Z_]+\.md$" > /dev/null || echo "$f"
    done)

NAMING_VIOLATIONS=""
if [ -n "$WRONG_CHANGELOG" ]; then
    NAMING_VIOLATIONS="$NAMING_VIOLATIONS$WRONG_CHANGELOG"$'\n'
fi
if [ -n "$WRONG_TASKS" ]; then
    NAMING_VIOLATIONS="$NAMING_VIOLATIONS$WRONG_TASKS"$'\n'
fi
if [ -n "$WRONG_ARCH" ]; then
    NAMING_VIOLATIONS="$NAMING_VIOLATIONS$WRONG_ARCH"$'\n'
fi

if [ -n "$NAMING_VIOLATIONS" ]; then
    VIOLATIONS_COUNT=$(echo "$NAMING_VIOLATIONS" | grep -v "^$" | wc -l | tr -d ' ')
    echo -e "${YELLOW}Найдено нарушений naming conventions: $VIOLATIONS_COUNT${NC}"
    echo ""
    echo "$NAMING_VIOLATIONS" | grep -v "^$" | while read -r file; do
        echo "  - $file"
    done
    echo ""
    
    # Добавить в отчет
    echo "### 5. Naming Conventions" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "**Найдено нарушений**: $VIOLATIONS_COUNT" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "$NAMING_VIOLATIONS" | grep -v "^$" | while read -r file; do
        echo "- \`$file\`" >> "$REPORT_FILE"
    done
    echo "" >> "$REPORT_FILE"
else
    echo -e "${GREEN}✅ Все файлы соответствуют naming conventions${NC}"
    echo ""
    
    echo "### 5. Naming Conventions" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "✅ Все файлы соответствуют naming conventions" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
fi

# Завершение отчета
cat >> "$REPORT_FILE" << 'EOF'

---

## 🎯 Рекомендации

### Немедленные действия (P1)
- Архивировать завершенные документы (если найдены)
- Исправить критичные битые ссылки

### Плановые действия (P2)
- Добавить статусы в документы без них
- Исправить naming conventions

---

**Автор**: Автоматический скрипт weekly-docs-audit.sh  
**Следующий аудит**: $(date -v+7d +%Y-%m-%d 2>/dev/null || date -d "+7 days" +%Y-%m-%d 2>/dev/null || echo "через 7 дней")
EOF

# Итоговое сообщение
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Аудит завершен${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Отчет сохранен: ${GREEN}$REPORT_FILE${NC}"
echo ""

# Показать краткую статистику
echo -e "${BLUE}📊 Краткая статистика:${NC}"
if [ -n "$COMPLETED_DOCS" ]; then
    echo -e "  ${YELLOW}⚠️  Завершенных документов для архивации: $COMPLETED_COUNT${NC}"
fi
if [ -n "$NO_STATUS_DOCS" ]; then
    echo -e "  ${YELLOW}⚠️  Документов без статусов: $NO_STATUS_COUNT${NC}"
fi
if [ -n "$NAMING_VIOLATIONS" ]; then
    echo -e "  ${YELLOW}⚠️  Нарушений naming conventions: $VIOLATIONS_COUNT${NC}"
fi
echo ""

exit 0

