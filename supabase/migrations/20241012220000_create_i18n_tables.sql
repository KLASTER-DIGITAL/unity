-- Создание таблиц для динамической i18n системы
-- Миграция: create_i18n_tables

-- Таблица языков
CREATE TABLE IF NOT EXISTS languages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100) NOT NULL,
    flag VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица переводов
CREATE TABLE IF NOT EXISTS translations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lang_code VARCHAR(10) NOT NULL REFERENCES languages(code) ON DELETE CASCADE,
    translation_key VARCHAR(255) NOT NULL,
    translation_value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(lang_code, translation_key)
);

-- Таблица админских настроек
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_translations_lang_code ON translations(lang_code);
CREATE INDEX IF NOT EXISTS idx_translations_key ON translations(translation_key);
CREATE INDEX IF NOT EXISTS idx_languages_code ON languages(code);
CREATE INDEX IF NOT EXISTS idx_languages_active ON languages(is_active);

-- RLS политики (Row Level Security)
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Политики для языков (все могут читать)
CREATE POLICY "Languages are viewable by everyone" ON languages
    FOR SELECT USING (true);

-- Политики для переводов (все могут читать)
CREATE POLICY "Translations are viewable by everyone" ON translations
    FOR SELECT USING (true);

-- Политики для админских настроек (только супер админы могут читать/писать)
CREATE POLICY "Admin settings are viewable by super admins" ON admin_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN ('diary@leadshunter.biz', 'admin@unity.com')
        )
    );

CREATE POLICY "Admin settings are editable by super admins" ON admin_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN ('diary@leadshunter.biz', 'admin@unity.com')
        )
    );
