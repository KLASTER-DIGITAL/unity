#!/bin/bash

# Скрипт для массовой очистки неактуальной документации
# Дата: 2025-11-09
# Цель: Соблюдение Documentation Ratio Rule (1:1)

echo "🗑️  Начинаем очистку неактуальной документации..."

# Создать архив для удаляемых файлов
ARCHIVE_DIR="docs/archive/2025-11-09_cleanup"
mkdir -p "$ARCHIVE_DIR"

echo "📦 Архивируем файлы в $ARCHIVE_DIR..."

# 1. Архивировать дублирующиеся отчеты из docs/plan/ (2025-11-08)
echo "1️⃣  Архивируем дублирующиеся отчеты 2025-11-08..."
mv docs/plan/*2025-11-08*.md "$ARCHIVE_DIR/" 2>/dev/null || true

# 2. Архивировать устаревшие файлы из docs/archive/2025-10/
echo "2️⃣  Архивируем устаревшие файлы из 2025-10..."
mv docs/archive/2025-10/*.md "$ARCHIVE_DIR/" 2>/dev/null || true

# 3. Архивировать старые handoff отчеты
echo "3️⃣  Архивируем старые handoff отчеты..."
mv docs/handoff/2025-10-*.md "$ARCHIVE_DIR/" 2>/dev/null || true

# 4. Архивировать дублирующиеся Push Notifications анализы
echo "4️⃣  Архивируем дублирующиеся Push Notifications анализы..."
mv docs/analysis/PUSH_NOTIFICATIONS_*.md "$ARCHIVE_DIR/" 2>/dev/null || true
mv docs/plan/PUSH_NOTIFICATIONS_*.md "$ARCHIVE_DIR/" 2>/dev/null || true

# 5. Архивировать устаревшие планы
echo "5️⃣  Архивируем устаревшие планы..."
mv docs/plan/STABILIZATION_PLAN_2025-10-29.md "$ARCHIVE_DIR/" 2>/dev/null || true
mv docs/plan/PRIORITY_TASKS_2025-10-29.md "$ARCHIVE_DIR/" 2>/dev/null || true

# 6. Архивировать старые отчеты из docs/reports/
echo "6️⃣  Архивируем старые отчеты..."
mv docs/reports/*2025-10-*.md "$ARCHIVE_DIR/" 2>/dev/null || true

# 7. Архивировать BACKLOG.md, ROADMAP.md, SPRINT.md (переезжают в Notion)
echo "7️⃣  Архивируем BACKLOG.md, ROADMAP.md, SPRINT.md (переезжают в Notion)..."
mv docs/plan/BACKLOG.md "$ARCHIVE_DIR/BACKLOG_DEPRECATED.md" 2>/dev/null || true
mv docs/plan/ROADMAP.md "$ARCHIVE_DIR/ROADMAP_DEPRECATED.md" 2>/dev/null || true
mv docs/plan/SPRINT.md "$ARCHIVE_DIR/SPRINT_DEPRECATED.md" 2>/dev/null || true

# Подсчитать количество архивированных файлов
ARCHIVED_COUNT=$(find "$ARCHIVE_DIR" -type f | wc -l)

echo ""
echo "✅ Очистка завершена!"
echo "📊 Архивировано файлов: $ARCHIVED_COUNT"
echo "📁 Архив: $ARCHIVE_DIR"

# Проверить новое соотношение
DOCS_COUNT=$(find docs -type f -name "*.md" | wc -l)
SRC_COUNT=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) | wc -l)
RATIO=$((DOCS_COUNT * 100 / SRC_COUNT))

echo ""
echo "📊 Новое соотношение документации:"
echo "   Документация: $DOCS_COUNT файлов"
echo "   Исходный код: $SRC_COUNT файлов"
echo "   Соотношение: $RATIO%"

if [ $RATIO -le 50 ]; then
  echo "   ✅ Соотношение в норме (<= 50%)"
else
  echo "   ⚠️  Соотношение превышает норму (> 50%)"
fi

