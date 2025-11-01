-- Add missing navigation translations for achievements and reports
-- Migration: 20251101_add_navigation_translations.sql
-- Description: Fix 4718 warnings about missing translations for 'achievements' and 'reports' keys

-- Insert translation keys if they don't exist
INSERT INTO translation_keys (key_name, category, context) VALUES
    ('achievements', 'navigation', 'Achievements tab label in bottom navigation'),
    ('reports', 'navigation', 'Reports tab label in bottom navigation')
ON CONFLICT (key_name) DO NOTHING;

-- Insert translations for all active languages
INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
-- Russian
('achievements', 'ru', 'Достижения'),
('reports', 'ru', 'Отчеты'),

-- English
('achievements', 'en', 'Achievements'),
('reports', 'en', 'Reports'),

-- Spanish
('achievements', 'es', 'Logros'),
('reports', 'es', 'Informes'),

-- German
('achievements', 'de', 'Erfolge'),
('reports', 'de', 'Berichte'),

-- French
('achievements', 'fr', 'Réalisations'),
('reports', 'fr', 'Rapports'),

-- Chinese
('achievements', 'zh', '成就'),
('reports', 'zh', '报告'),

-- Japanese
('achievements', 'ja', '実績'),
('reports', 'ja', 'レポート')

ON CONFLICT (translation_key, lang_code) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();

