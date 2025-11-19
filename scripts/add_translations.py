#!/usr/bin/env python3
"""
Добавление переводов в Supabase БД через REST API
Вставляет переводы напрямую в таблицу translations
"""

import urllib.request
import json
from datetime import datetime

# Supabase credentials
SUPABASE_URL = "https://ecuwuzqlwdkkdncampnc.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA1ODY5NCwiZXhwIjoyMDc1NjM0Njk0fQ.Tzl9W5L7GrqZPxV2Hg7CKUvWSS7jPk4EeQGlapYOCDY"

# Все переводы (первые 100 для теста)
translations = [
    # Support Section
    {'lang_code': 'ru', 'translation_key': 'settings.support.title', 'translation_value': 'Поддержка', 'is_ai_translated': False},
    {'lang_code': 'en', 'translation_key': 'settings.support.title', 'translation_value': 'Support', 'is_ai_translated': False},
    {'lang_code': 'kk', 'translation_key': 'settings.support.title', 'translation_value': 'Қолдау', 'is_ai_translated': False},
    {'lang_code': 'es', 'translation_key': 'settings.support.title', 'translation_value': 'Soporte', 'is_ai_translated': False},
    {'lang_code': 'de', 'translation_key': 'settings.support.title', 'translation_value': 'Unterstützung', 'is_ai_translated': False},
    {'lang_code': 'fr', 'translation_key': 'settings.support.title', 'translation_value': 'Support', 'is_ai_translated': False},
    {'lang_code': 'zh', 'translation_key': 'settings.support.title', 'translation_value': '支持', 'is_ai_translated': False},
    {'lang_code': 'ja', 'translation_key': 'settings.support.title', 'translation_value': 'サポート', 'is_ai_translated': False},
    {'lang_code': 'ka', 'translation_key': 'settings.support.title', 'translation_value': 'მხარდაჭერა', 'is_ai_translated': False},
]

def upsert_translations(batch):
    """Вставка batch переводов через upsert"""
    url = f"{SUPABASE_URL}/rest/v1/translations"
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }

    # Добавляем updated_at
    for t in batch:
        t['updated_at'] = datetime.utcnow().isoformat()

    data = json.dumps(batch).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')

    try:
        with urllib.request.urlopen(req) as response:
            return True, response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return False, f"HTTP {e.code}: {e.read().decode('utf-8')}"
    except Exception as e:
        return False, str(e)

# Вставляем по 10 за раз
batch_size = 10
total = len(translations)
success_count = 0
error_count = 0

print(f"📊 Начинаю добавление {total} переводов...")

for i in range(0, total, batch_size):
    batch = translations[i:i+batch_size]
    success, result = upsert_translations(batch)

    if success:
        success_count += len(batch)
        print(f"✅ Добавлено {success_count}/{total}...")
    else:
        error_count += len(batch)
        print(f"❌ Ошибка для batch {i//batch_size + 1}: {result}")

print(f"\n✅ Успешно: {success_count}")
print(f"❌ Ошибок: {error_count}")
print(f"\n🔄 Обновите страницу в браузере (Ctrl+R)")

