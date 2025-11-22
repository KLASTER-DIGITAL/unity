-- Migration: Add FREE book translations
-- Created: 2025-11-22
-- Purpose: Add translation keys for FREE books

-- Insert translation keys for FREE books (Russian)
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at)
VALUES
  ('ru', 'books_free_title', 'Моя книга', NOW(), NOW()),
  ('ru', 'books_free_subtitle', 'Дневник', NOW(), NOW()),
  ('ru', 'books_free_intro', 'Эта книга содержит записи из вашего дневника. Каждая запись — это момент вашей жизни.', NOW(), NOW()),
  ('ru', 'books_my_entries', 'Мои записи', NOW(), NOW()),
  ('ru', 'books_statistics', 'Статистика', NOW(), NOW()),
  ('ru', 'books_total_entries', 'Всего записей', NOW(), NOW()),
  ('ru', 'books_achievements_count', 'Достижений', NOW(), NOW())
ON CONFLICT (lang_code, translation_key) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();

-- Insert translation keys for FREE books (English)
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at)
VALUES
  ('en', 'books_free_title', 'My Book', NOW(), NOW()),
  ('en', 'books_free_subtitle', 'Diary', NOW(), NOW()),
  ('en', 'books_free_intro', 'This book contains entries from your diary. Each entry is a moment of your life.', NOW(), NOW()),
  ('en', 'books_my_entries', 'My Entries', NOW(), NOW()),
  ('en', 'books_statistics', 'Statistics', NOW(), NOW()),
  ('en', 'books_total_entries', 'Total Entries', NOW(), NOW()),
  ('en', 'books_achievements_count', 'Achievements', NOW(), NOW())
ON CONFLICT (lang_code, translation_key) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();

