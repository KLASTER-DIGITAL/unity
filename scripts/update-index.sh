#!/bin/bash

# 📝 Автоматическое обновление INDEX.md
# Автор: AI Assistant (Augment Agent)
# Дата создания: 21 октября 2025
# Рекомендация: REC-007 из DOCS_RECOMMENDATIONS_2025-10-21.md

set -e

# Цвета для вывода
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📝 Автоматическое обновление INDEX.md${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

DOCS_DIR="docs"
INDEX_FILE="$DOCS_DIR/INDEX.md"
BACKUP_FILE="$INDEX_FILE.backup"

# Создать резервную копию
if [ -f "$INDEX_FILE" ]; then
    cp "$INDEX_FILE" "$BACKUP_FILE"
    echo -e "${GREEN}✅ Создана резервная копия: $BACKUP_FILE${NC}"
fi

# Начать новый INDEX.md
cat > "$INDEX_FILE" << 'EOF'
# 📚 UNITY-v2 Documentation Index

**Последнее обновление**: $(date +%Y-%m-%d)  
**Автоматически сгенерировано**: scripts/update-index.sh

> Быстрый индекс всех ключевых документов проекта UNITY-v2

---

## 🎯 Главные документы

EOF

# Добавить главные документы
echo "### 📋 Планирование и стратегия" >> "$INDEX_FILE"
echo "" >> "$INDEX_FILE"

find "$DOCS_DIR" -maxdepth 1 -name "*.md" \
    ! -name "INDEX.md" \
    ! -name "README.md" \
    -type f | sort | while read -r file; do
    filename=$(basename "$file")
    title=$(head -1 "$file" | sed 's/^# //' || echo "$filename")
    echo "- [$filename]($filename) - $title" >> "$INDEX_FILE"
done

echo "" >> "$INDEX_FILE"

# Добавить разделы по категориям
CATEGORIES=(
    "architecture:🏗️ Архитектура"
    "design:🎨 Дизайн система"
    "i18n:🌐 Интернационализация"
    "performance:⚡ Производительность"
    "testing:✅ Тестирование"
    "mobile:📱 Мобильная разработка"
    "admin:👨‍💼 Админ-панель"
    "features:✨ Функциональность"
    "reports:📊 Отчеты"
    "guides:📖 Руководства"
    "plan:📅 Планирование"
    "changelog:📝 История изменений"
)

for category in "${CATEGORIES[@]}"; do
    dir="${category%%:*}"
    title="${category##*:}"
    
    if [ ! -d "$DOCS_DIR/$dir" ]; then
        continue
    fi
    
    echo "### $title" >> "$INDEX_FILE"
    echo "" >> "$INDEX_FILE"
    
    # Найти все .md файлы в категории
    find "$DOCS_DIR/$dir" -name "*.md" \
        ! -path "*/archive/*" \
        ! -name "README.md" \
        -type f | sort | while read -r file; do
        rel_path="${file#$DOCS_DIR/}"
        filename=$(basename "$file")
        title=$(head -1 "$file" | sed 's/^# //' 2>/dev/null || echo "$filename")
        echo "- [$filename]($rel_path) - $title" >> "$INDEX_FILE"
    done
    
    echo "" >> "$INDEX_FILE"
done

# Добавить архив
echo "### 📦 Архив" >> "$INDEX_FILE"
echo "" >> "$INDEX_FILE"
echo "- [archive/completed/](archive/completed/) - Завершенные документы" >> "$INDEX_FILE"
echo "- [archive/deprecated/](archive/deprecated/) - Устаревшие документы" >> "$INDEX_FILE"
echo "- [archive/partial/](archive/partial/) - Частично выполненные задачи" >> "$INDEX_FILE"
echo "" >> "$INDEX_FILE"

# Добавить футер
cat >> "$INDEX_FILE" << 'EOF'

---

## 🔍 Быстрый поиск

### По ключевым словам

**Архитектура**:
- Главный план → [MASTER_PLAN.md](architecture/MASTER_PLAN.md)
- Стратегия 2025 → [UNITY_MASTER_PLAN_2025.md](architecture/UNITY_MASTER_PLAN_2025.md)
- Edge Functions → [EDGE_FUNCTIONS_REFACTORING_PLAN.md](architecture/EDGE_FUNCTIONS_REFACTORING_PLAN.md)

**Дизайн**:
- Дизайн система → [DESIGN_SYSTEM.md](design/DESIGN_SYSTEM.md)
- Цвета → [COLORS.md](design/COLORS.md)
- Типографика → [TYPOGRAPHY.md](design/TYPOGRAPHY.md)

**Производительность**:
- Оптимизация → [performance/](performance/)

**Тестирование**:
- Тестовые аккаунты → [TEST_ACCOUNTS.md](testing/TEST_ACCOUNTS.md)
- Отчеты → [testing/](testing/)

**React Native**:
- План миграции → [REACT_NATIVE_MIGRATION_PLAN.md](mobile/REACT_NATIVE_MIGRATION_PLAN.md)

**i18n**:
- Система переводов → [i18n/](i18n/)

---

**Автоматически сгенерировано**: $(date +%Y-%m-%d %H:%M:%S)  
**Скрипт**: scripts/update-index.sh
EOF

echo ""
echo -e "${GREEN}✅ INDEX.md успешно обновлен${NC}"
echo ""
echo -e "${YELLOW}Проверьте изменения:${NC}"
echo -e "  git diff $INDEX_FILE"
echo ""
echo -e "${YELLOW}Восстановить из резервной копии:${NC}"
echo -e "  mv $BACKUP_FILE $INDEX_FILE"
echo ""

exit 0

