-- Включение Realtime публикации для таблицы entries
-- Это необходимо для работы real-time подписок на изменения записей

-- Проверяем существование таблицы entries
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'entries'
    ) THEN
        RAISE EXCEPTION 'Table entries does not exist';
    END IF;
END $$;

-- Добавляем таблицу entries в публикацию supabase_realtime
-- Если таблица уже в публикации, команда будет проигнорирована
ALTER PUBLICATION supabase_realtime ADD TABLE entries;

-- Проверяем, что таблица добавлена в публикацию
DO $$
DECLARE
    is_published BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'entries'
    ) INTO is_published;
    
    IF is_published THEN
        RAISE NOTICE '✅ Table entries is now published for realtime';
    ELSE
        RAISE WARNING '⚠️ Table entries is NOT published for realtime';
    END IF;
END $$;



