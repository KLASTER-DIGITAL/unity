-- ============================================================================
-- Admin Login Rate Limiting
-- ============================================================================
-- Защита от brute-force атак на админ-панель
-- Лимит: 5 попыток за 15 минут
-- Блокировка: 30 минут после превышения лимита
-- ============================================================================

-- 1. Создать таблицу для отслеживания попыток входа
CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Индекс для быстрого поиска по email и времени
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_email_created 
    ON public.admin_login_attempts(email, created_at DESC);

-- 3. Индекс для быстрого поиска по IP и времени
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_ip_created 
    ON public.admin_login_attempts(ip_address, created_at DESC);

-- 4. RLS политики (только super_admin может читать)
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_login_attempts_select_policy" ON public.admin_login_attempts;
CREATE POLICY "admin_login_attempts_select_policy"
    ON public.admin_login_attempts
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = (SELECT auth.uid()) 
            AND profiles.role = 'super_admin'
        )
    );

-- 5. Функция для проверки rate limit
CREATE OR REPLACE FUNCTION public.check_admin_login_rate_limit(
    p_email TEXT,
    p_ip_address TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_failed_attempts INTEGER;
    v_last_attempt_time TIMESTAMPTZ;
    v_is_blocked BOOLEAN;
    v_block_until TIMESTAMPTZ;
    v_attempts_remaining INTEGER;
    v_window_minutes INTEGER := 15;
    v_max_attempts INTEGER := 5;
    v_block_minutes INTEGER := 30;
BEGIN
    -- Подсчитать неудачные попытки за последние 15 минут
    SELECT COUNT(*), MAX(created_at)
    INTO v_failed_attempts, v_last_attempt_time
    FROM public.admin_login_attempts
    WHERE email = p_email
        AND success = false
        AND created_at > NOW() - INTERVAL '15 minutes';
    
    -- Проверить блокировку
    IF v_failed_attempts >= v_max_attempts THEN
        v_block_until := v_last_attempt_time + INTERVAL '30 minutes';
        
        IF NOW() < v_block_until THEN
            v_is_blocked := true;
            v_attempts_remaining := 0;
        ELSE
            -- Блокировка истекла, сбросить счетчик
            v_is_blocked := false;
            v_failed_attempts := 0;
            v_attempts_remaining := v_max_attempts;
        END IF;
    ELSE
        v_is_blocked := false;
        v_attempts_remaining := v_max_attempts - v_failed_attempts;
    END IF;
    
    RETURN jsonb_build_object(
        'is_blocked', v_is_blocked,
        'failed_attempts', v_failed_attempts,
        'attempts_remaining', v_attempts_remaining,
        'block_until', v_block_until,
        'window_minutes', v_window_minutes,
        'max_attempts', v_max_attempts
    );
END;
$$;

-- 6. Функция для записи попытки входа
CREATE OR REPLACE FUNCTION public.record_admin_login_attempt(
    p_email TEXT,
    p_success BOOLEAN,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.admin_login_attempts (email, success, ip_address, user_agent)
    VALUES (p_email, p_success, p_ip_address, p_user_agent);
    
    -- Очистить старые записи (старше 24 часов)
    DELETE FROM public.admin_login_attempts
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- 7. Комментарии
COMMENT ON TABLE public.admin_login_attempts IS 'Отслеживание попыток входа в админ-панель для защиты от brute-force атак';
COMMENT ON FUNCTION public.check_admin_login_rate_limit IS 'Проверка rate limit для админ-панели (5 попыток за 15 минут)';
COMMENT ON FUNCTION public.record_admin_login_attempt IS 'Запись попытки входа в админ-панель';

