#!/bin/bash

# Скрипт для проверки битых ссылок в документации
# Автор: Product Team UNITY
# Дата: 21 октября 2025

set -e

echo "🔍 Проверка битых ссылок в документации..."
echo ""

# Счетчики
TOTAL_LINKS=0
BROKEN_LINKS=0
EXTERNAL_LINKS=0

# Временный файл для хранения результатов
TEMP_FILE=$(mktemp)

# Функция для проверки существования файла
check_link() {
    local file="$1"
    local link="$2"
    local dir=$(dirname "$file")
    
    # Пропустить якоря (anchors)
    if [[ $link == \#* ]]; then
        return 0
    fi
    
    # Пропустить внешние ссылки (http/https)
    if [[ $link == http* ]]; then
        ((EXTERNAL_LINKS++))
        return 0
    fi
    
    ((TOTAL_LINKS++))
    
    # Убрать якорь из ссылки, если есть
    link_without_anchor="${link%%\#*}"
    
    # Определить абсолютный путь к целевому файлу
    if [[ $link_without_anchor == /* ]]; then
        # Абсолютная ссылка от корня репозитория
        target="$link_without_anchor"
    else
        # Относительная ссылка
        target="$dir/$link_without_anchor"
    fi
    
    # Нормализовать путь
    target=$(cd "$(dirname "$target")" 2>/dev/null && pwd)/$(basename "$target") 2>/dev/null || echo "$target"
    
    # Проверить существование файла
    if [ ! -f "$target" ] && [ ! -d "$target" ]; then
        echo "❌ Битая ссылка в $file:" >> "$TEMP_FILE"
        echo "   Ссылка: $link" >> "$TEMP_FILE"
        echo "   Целевой файл не найден: $target" >> "$TEMP_FILE"
        echo "" >> "$TEMP_FILE"
        ((BROKEN_LINKS++))
        return 1
    fi
    
    return 0
}

# Найти все .md файлы в docs/
echo "📂 Сканирование файлов в docs/..."
MD_FILES=$(find docs -name "*.md" -type f | sort)
FILE_COUNT=$(echo "$MD_FILES" | wc -l | tr -d ' ')
echo "   Найдено файлов: $FILE_COUNT"
echo ""

# Проверить каждый файл
CURRENT=0
for file in $MD_FILES; do
    ((CURRENT++))
    
    # Прогресс
    if [ $((CURRENT % 10)) -eq 0 ]; then
        echo "   Проверено: $CURRENT / $FILE_COUNT файлов..."
    fi
    
    # Извлечь все markdown ссылки вида [text](link)
    # Используем sed для совместимости с macOS
    links=$(sed -n 's/.*\](\([^)]*\)).*/\1/p' "$file" 2>/dev/null || true)
    
    # Проверить каждую ссылку
    while IFS= read -r link; do
        if [ -n "$link" ]; then
            check_link "$file" "$link" || true
        fi
    done <<< "$links"
done

echo ""
echo "✅ Сканирование завершено"
echo ""

# Вывести результаты
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Статистика проверки ссылок"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📄 Проверено файлов:      $FILE_COUNT"
echo "🔗 Всего внутренних ссылок: $TOTAL_LINKS"
echo "🌐 Внешних ссылок:        $EXTERNAL_LINKS"
echo "❌ Битых ссылок:          $BROKEN_LINKS"
echo ""

if [ $BROKEN_LINKS -gt 0 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ Найдены битые ссылки:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    cat "$TEMP_FILE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "❌ FAILED: Обнаружено $BROKEN_LINKS битых ссылок"
    echo ""
    echo "💡 Рекомендации:"
    echo "   1. Проверьте пути к файлам в указанных документах"
    echo "   2. Убедитесь, что целевые файлы существуют"
    echo "   3. Обновите ссылки на правильные пути"
    echo ""
    rm -f "$TEMP_FILE"
    exit 1
else
    echo "✅ PASSED: Все внутренние ссылки корректны!"
    echo ""
    echo "📈 Качество документации: ОТЛИЧНО"
    echo ""
    rm -f "$TEMP_FILE"
    exit 0
fi

