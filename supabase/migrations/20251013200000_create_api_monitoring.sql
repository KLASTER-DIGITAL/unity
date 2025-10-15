-- Миграция для системы мониторинга OpenAI API
-- Дата: 2025-10-13

-- 1. Таблица для учета использования OpenAI API
CREATE TABLE IF NOT EXISTS openai_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('ai_card', 'translation', 'pdf_export', 'transcription', 'other')),
    model VARCHAR(50) NOT NULL,
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    completion_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    estimated_cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
    request_data JSONB,
    response_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_usage_user_id ON openai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_created_at ON openai_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_operation_type ON openai_usage(operation_type);
CREATE INDEX IF NOT EXISTS idx_usage_user_date ON openai_usage(user_id, created_at);

-- 2. Таблица агрегированной статистики
CREATE TABLE IF NOT EXISTS openai_usage_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    operation_type VARCHAR(50),
    total_requests INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10, 4) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, period_start, period_end, operation_type)
);

CREATE INDEX IF NOT EXISTS idx_stats_user_period ON openai_usage_stats(user_id, period_start, period_end);

-- 3. Расширение таблицы admin_settings
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 4. Таблица для хранения ключей переводов
CREATE TABLE IF NOT EXISTS translation_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key_name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100),
    context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_translation_keys_name ON translation_keys(key_name);
CREATE INDEX IF NOT EXISTS idx_translation_keys_category ON translation_keys(category);

-- 5. Обновление таблицы translations
ALTER TABLE translations ADD COLUMN IF NOT EXISTS key_id UUID REFERENCES translation_keys(id);
ALTER TABLE translations ADD COLUMN IF NOT EXISTS is_ai_translated BOOLEAN DEFAULT false;
ALTER TABLE translations ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1);
ALTER TABLE translations ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false;

-- 6. RLS политики для openai_usage
ALTER TABLE openai_usage ENABLE ROW LEVEL SECURITY;

-- Пользователи видят только свою статистику
CREATE POLICY "Users can view own usage" ON openai_usage
    FOR SELECT USING (auth.uid() = user_id);

-- Супер админы видят всё
CREATE POLICY "Super admins can view all usage" ON openai_usage
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN ('diary@leadshunter.biz', 'admin@unity.com')
        )
    );

-- Только система может вставлять записи
CREATE POLICY "System can insert usage" ON openai_usage
    FOR INSERT WITH CHECK (true);

-- 7. RLS политики для openai_usage_stats
ALTER TABLE openai_usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats" ON openai_usage_stats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all stats" ON openai_usage_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN ('diary@leadshunter.biz', 'admin@unity.com')
        )
    );

CREATE POLICY "System can manage stats" ON openai_usage_stats
    FOR ALL WITH CHECK (true);

-- 8. RLS политики для translation_keys
ALTER TABLE translation_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read translation keys" ON translation_keys
    FOR SELECT USING (true);

CREATE POLICY "Super admins can manage translation keys" ON translation_keys
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN ('diary@leadshunter.biz', 'admin@unity.com')
        )
    );

-- 9. Функция для агрегации статистики
CREATE OR REPLACE FUNCTION upsert_usage_stats(
    p_user_id UUID,
    p_period_start DATE,
    p_period_end DATE,
    p_operation_type VARCHAR,
    p_tokens INTEGER,
    p_cost DECIMAL
)
RETURNS void AS $$
BEGIN
    INSERT INTO openai_usage_stats (
        user_id, 
        period_start, 
        period_end, 
        operation_type, 
        total_requests, 
        total_tokens, 
        total_cost
    )
    VALUES (
        p_user_id,
        p_period_start,
        p_period_end,
        p_operation_type,
        1,
        p_tokens,
        p_cost
    )
    ON CONFLICT (user_id, period_start, period_end, operation_type)
    DO UPDATE SET
        total_requests = openai_usage_stats.total_requests + 1,
        total_tokens = openai_usage_stats.total_tokens + p_tokens,
        total_cost = openai_usage_stats.total_cost + p_cost,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Функция для получения сводки по пользователю
CREATE OR REPLACE FUNCTION get_user_usage_summary(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    operation_type VARCHAR,
    total_requests BIGINT,
    total_tokens BIGINT,
    total_cost NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.operation_type,
        COUNT(*)::BIGINT as total_requests,
        SUM(u.total_tokens)::BIGINT as total_tokens,
        SUM(u.estimated_cost)::NUMERIC as total_cost
    FROM openai_usage u
    WHERE u.user_id = p_user_id
      AND u.created_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY u.operation_type
    ORDER BY total_cost DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Вставка базовых ключей переводов
INSERT INTO translation_keys (key_name, category, context) VALUES
    ('welcome_title', 'onboarding', 'Main welcome screen title'),
    ('start_button', 'ui', 'Button to start using the app'),
    ('home', 'navigation', 'Home tab label'),
    ('history', 'navigation', 'History tab label'),
    ('achievements', 'navigation', 'Achievements tab label'),
    ('settings', 'navigation', 'Settings tab label'),
    ('greeting', 'home', 'Daily greeting message'),
    ('today_question', 'home', 'Question about today'),
    ('ai_help', 'features', 'AI assistant help text')
ON CONFLICT (key_name) DO NOTHING;

-- 12. Комментарии к таблицам
COMMENT ON TABLE openai_usage IS 'Детальный лог всех вызовов OpenAI API';
COMMENT ON TABLE openai_usage_stats IS 'Агрегированная статистика использования API по периодам';
COMMENT ON TABLE translation_keys IS 'Справочник ключей переводов с контекстом';
COMMENT ON COLUMN openai_usage.operation_type IS 'Тип операции: ai_card, translation, pdf_export, transcription';
COMMENT ON COLUMN openai_usage.estimated_cost IS 'Расчетная стоимость в USD';
COMMENT ON COLUMN translations.is_ai_translated IS 'Был ли перевод выполнен автоматически через AI';
COMMENT ON COLUMN translations.confidence_score IS 'Уверенность в качестве перевода (0-1)';
COMMENT ON COLUMN translations.needs_review IS 'Требуется ли ручная проверка перевода';
