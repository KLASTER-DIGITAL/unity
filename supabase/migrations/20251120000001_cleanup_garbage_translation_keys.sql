-- Migration: Cleanup Garbage Translation Keys
-- Date: 2025-11-20
-- Description: Удаление "мусорных" translation keys из таблицы translations
-- Категории мусорных ключей:
--   1. Пути к файлам (../shadcn-io/*, @/components/*, ./*)
--   2. Символы ( , -, :, *, /, a, T)
--   3. Технические ключи (link, meta, script, ETag, webgl2, id)
--   4. Статусы (syncing, offline, both)

-- ⚠️ ВАЖНО: Создать backup перед выполнением!
-- Команда для backup: pg_dump -t translations > translations_backup_2025-11-20.sql

-- 1. Удаление путей к файлам (LIKE '%/%' OR LIKE '@%' OR LIKE './%')
DELETE FROM translations
WHERE translation_key LIKE '%/%'
   OR translation_key LIKE '@%'
   OR translation_key LIKE './%';

-- 2. Удаление символов (одиночные символы и пробелы)
DELETE FROM translations
WHERE translation_key IN (
    ' ',  -- пробел
    '-',  -- дефис
    ':',  -- двоеточие
    '*',  -- звездочка
    '/',  -- слэш
    'a',  -- одна буква
    'T'   -- одна буква
);

-- 3. Удаление технических ключей
DELETE FROM translations
WHERE translation_key IN (
    'link',
    'meta',
    'script',
    'ETag',
    'webgl2',
    'id'
);

-- 4. Удаление статусов (которые не должны быть в переводах)
DELETE FROM translations
WHERE translation_key IN (
    'syncing',
    'offline',
    'both'
);

-- 5. Удаление ключей длиной <= 2 символа (кроме валидных)
-- Валидные короткие ключи: 'ok', 'no', 'yes' (если есть)
DELETE FROM translations
WHERE LENGTH(translation_key) <= 2
  AND translation_key NOT IN ('ok', 'no');

-- 6. Проверка результата
-- Должно остаться ~580-600 ключей на язык (вместо 633-635)
SELECT 
    lang_code,
    COUNT(*) as total_keys,
    COUNT(CASE WHEN translation_value IS NOT NULL AND translation_value != '' THEN 1 END) as filled_keys,
    ROUND(
        COUNT(CASE WHEN translation_value IS NOT NULL AND translation_value != '' THEN 1 END)::numeric / 
        COUNT(*)::numeric * 100, 
        1
    ) as coverage_percent
FROM translations
GROUP BY lang_code
ORDER BY lang_code;

-- 7. Вывод списка удаленных ключей (для логирования)
-- Эта команда должна быть выполнена ДО удаления для создания лога
-- SELECT DISTINCT translation_key FROM translations WHERE ... (условия выше)

-- 8. Vacuum для очистки места
VACUUM ANALYZE translations;

-- Ожидаемый результат:
-- - Удалено: ~50-80 мусорных ключей
-- - Осталось: ~580-600 валидных ключей на язык
-- - Покрытие: 100% для всех языков

