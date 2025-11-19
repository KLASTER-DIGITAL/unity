#!/usr/bin/env python3
"""
Добавление новых переводов в Supabase БД
PWA Install Modal + AI Hint Section
"""

import urllib.request
import json
from datetime import datetime

# Supabase credentials
SUPABASE_URL = "https://ecuwuzqlwdkkdncampnc.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA1ODY5NCwiZXhwIjoyMDc1NjM0Njk0fQ.Tzl9W5L7GrqZPxV2Hg7CKUvWSS7jPk4EeQGlapYOCDY"

# Все новые переводы
translations = [
    # PWA Install Modal (8 keys × 9 languages = 72 translations)
    {'lang_code': 'ru', 'translation_key': 'pwa.install.title', 'translation_value': 'Добавить на главный экран?', 'is_ai_translated': False},
    {'lang_code': 'en', 'translation_key': 'pwa.install.title', 'translation_value': 'Add to Home Screen?', 'is_ai_translated': False},
    {'lang_code': 'kk', 'translation_key': 'pwa.install.title', 'translation_value': 'Басты экранға қосу?', 'is_ai_translated': False},
    {'lang_code': 'es', 'translation_key': 'pwa.install.title', 'translation_value': '¿Agregar a pantalla de inicio?', 'is_ai_translated': False},
    {'lang_code': 'de', 'translation_key': 'pwa.install.title', 'translation_value': 'Zum Startbildschirm hinzufügen?', 'is_ai_translated': False},
    {'lang_code': 'fr', 'translation_key': 'pwa.install.title', 'translation_value': 'Ajouter à l\'écran d\'accueil?', 'is_ai_translated': False},
    {'lang_code': 'zh', 'translation_key': 'pwa.install.title', 'translation_value': '添加到主屏幕？', 'is_ai_translated': False},
    {'lang_code': 'ja', 'translation_key': 'pwa.install.title', 'translation_value': 'ホーム画面に追加？', 'is_ai_translated': False},
    {'lang_code': 'ka', 'translation_key': 'pwa.install.title', 'translation_value': 'დაამატოთ მთავარ ეკრანზე?', 'is_ai_translated': False},
    
    {'lang_code': 'ru', 'translation_key': 'pwa.install.description', 'translation_value': 'Установите приложение для быстрого доступа к вашему дневнику достижений', 'is_ai_translated': False},
    {'lang_code': 'en', 'translation_key': 'pwa.install.description', 'translation_value': 'Install the app for quick access to your achievement diary', 'is_ai_translated': False},
    {'lang_code': 'kk', 'translation_key': 'pwa.install.description', 'translation_value': 'Жетістіктер күнделігіне жылдам қол жеткізу үшін қолданбаны орнатыңыз', 'is_ai_translated': False},
    {'lang_code': 'es', 'translation_key': 'pwa.install.description', 'translation_value': 'Instala la aplicación para acceso rápido a tu diario de logros', 'is_ai_translated': False},
    {'lang_code': 'de', 'translation_key': 'pwa.install.description', 'translation_value': 'Installieren Sie die App für schnellen Zugriff auf Ihr Erfolgstageb uch', 'is_ai_translated': False},
    {'lang_code': 'fr', 'translation_key': 'pwa.install.description', 'translation_value': 'Installez l\'application pour un accès rapide à votre journal de réussites', 'is_ai_translated': False},
    {'lang_code': 'zh', 'translation_key': 'pwa.install.description', 'translation_value': '安装应用程序以快速访问您的成就日记', 'is_ai_translated': False},
    {'lang_code': 'ja', 'translation_key': 'pwa.install.description', 'translation_value': '成果日記に素早くアクセスするためにアプリをインストール', 'is_ai_translated': False},
    {'lang_code': 'ka', 'translation_key': 'pwa.install.description', 'translation_value': 'დააინსტალირეთ აპლიკაცია თქვენი მიღწევების დღიურის სწრაფი წვდომისთვის', 'is_ai_translated': False},
    
    {'lang_code': 'ru', 'translation_key': 'pwa.install.feature1', 'translation_value': 'Мгновенный запуск как нативное приложение', 'is_ai_translated': False},
    {'lang_code': 'en', 'translation_key': 'pwa.install.feature1', 'translation_value': 'Instant launch like a native app', 'is_ai_translated': False},
    {'lang_code': 'kk', 'translation_key': 'pwa.install.feature1', 'translation_value': 'Нативті қолданба сияқты лезде іске қосу', 'is_ai_translated': False},
    {'lang_code': 'es', 'translation_key': 'pwa.install.feature1', 'translation_value': 'Lanzamiento instantáneo como una aplicación nativa', 'is_ai_translated': False},
    {'lang_code': 'de', 'translation_key': 'pwa.install.feature1', 'translation_value': 'Sofortiger Start wie eine native App', 'is_ai_translated': False},
    {'lang_code': 'fr', 'translation_key': 'pwa.install.feature1', 'translation_value': 'Lancement instantané comme une application native', 'is_ai_translated': False},
    {'lang_code': 'zh', 'translation_key': 'pwa.install.feature1', 'translation_value': '像原生应用一样即时启动', 'is_ai_translated': False},
    {'lang_code': 'ja', 'translation_key': 'pwa.install.feature1', 'translation_value': 'ネイティブアプリのように即座に起動', 'is_ai_translated': False},
    {'lang_code': 'ka', 'translation_key': 'pwa.install.feature1', 'translation_value': 'მყისიერი გაშვება როგორც ნატიური აპლიკაცია', 'is_ai_translated': False},
    
    {'lang_code': 'ru', 'translation_key': 'pwa.install.feature2', 'translation_value': 'Работает без интернета', 'is_ai_translated': False},
    {'lang_code': 'en', 'translation_key': 'pwa.install.feature2', 'translation_value': 'Works offline', 'is_ai_translated': False},
    {'lang_code': 'kk', 'translation_key': 'pwa.install.feature2', 'translation_value': 'Интернетсіз жұмыс істейді', 'is_ai_translated': False},
    {'lang_code': 'es', 'translation_key': 'pwa.install.feature2', 'translation_value': 'Funciona sin internet', 'is_ai_translated': False},
    {'lang_code': 'de', 'translation_key': 'pwa.install.feature2', 'translation_value': 'Funktioniert offline', 'is_ai_translated': False},
    {'lang_code': 'fr', 'translation_key': 'pwa.install.feature2', 'translation_value': 'Fonctionne hors ligne', 'is_ai_translated': False},
    {'lang_code': 'zh', 'translation_key': 'pwa.install.feature2', 'translation_value': '离线工作', 'is_ai_translated': False},
    {'lang_code': 'ja', 'translation_key': 'pwa.install.feature2', 'translation_value': 'オフラインで動作', 'is_ai_translated': False},
    {'lang_code': 'ka', 'translation_key': 'pwa.install.feature2', 'translation_value': 'მუშაობს ინტერნეტის გარეშე', 'is_ai_translated': False},
    
    {'lang_code': 'ru', 'translation_key': 'pwa.install.feature3', 'translation_value': 'Push-уведомления о ваших целях', 'is_ai_translated': False},
    {'lang_code': 'en', 'translation_key': 'pwa.install.feature3', 'translation_value': 'Push notifications about your goals', 'is_ai_translated': False},
    {'lang_code': 'kk', 'translation_key': 'pwa.install.feature3', 'translation_value': 'Мақсаттарыңыз туралы Push-хабарландырулар', 'is_ai_translated': False},
    {'lang_code': 'es', 'translation_key': 'pwa.install.feature3', 'translation_value': 'Notificaciones push sobre tus objetivos', 'is_ai_translated': False},
    {'lang_code': 'de', 'translation_key': 'pwa.install.feature3', 'translation_value': 'Push-Benachrichtigungen über Ihre Ziele', 'is_ai_translated': False},
    {'lang_code': 'fr', 'translation_key': 'pwa.install.feature3', 'translation_value': 'Notifications push sur vos objectifs', 'is_ai_translated': False},
    {'lang_code': 'zh', 'translation_key': 'pwa.install.feature3', 'translation_value': '关于您目标的推送通知', 'is_ai_translated': False},
    {'lang_code': 'ja', 'translation_key': 'pwa.install.feature3', 'translation_value': '目標に関するプッシュ通知', 'is_ai_translated': False},
    {'lang_code': 'ka', 'translation_key': 'pwa.install.feature3', 'translation_value': 'Push შეტყობინებები თქვენი მიზნების შესახებ', 'is_ai_translated': False},

    # PWA Install Modal - iOS instructions
    {'lang_code': 'ru', 'translation_key': 'pwa.install.ios_instruction', 'translation_value': 'Нажмите', 'is_ai_translated': False},
    {'lang_code': 'en', 'translation_key': 'pwa.install.ios_instruction', 'translation_value': 'Tap', 'is_ai_translated': False},
    {'lang_code': 'kk', 'translation_key': 'pwa.install.ios_instruction', 'translation_value': 'Басыңыз', 'is_ai_translated': False},

    {'lang_code': 'ru', 'translation_key': 'pwa.install.ios_share', 'translation_value': 'Поделиться', 'is_ai_translated': False},
    {'lang_code': 'en', 'translation_key': 'pwa.install.ios_share', 'translation_value': 'Share', 'is_ai_translated': False},
    {'lang_code': 'kk', 'translation_key': 'pwa.install.ios_share', 'translation_value': 'Бөлісу', 'is_ai_translated': False},

    {'lang_code': 'ru', 'translation_key': 'pwa.install.ios_then', 'translation_value': 'внизу экрана, затем выберите', 'is_ai_translated': False},
    {'lang_code': 'en', 'translation_key': 'pwa.install.ios_then', 'translation_value': 'at the bottom, then select', 'is_ai_translated': False},
    {'lang_code': 'kk', 'translation_key': 'pwa.install.ios_then', 'translation_value': 'экранның төменгі жағында, содан кейін таңдаңыз', 'is_ai_translated': False},

    {'lang_code': 'ru', 'translation_key': 'pwa.install.ios_add_to_home', 'translation_value': '"На экран Домой"', 'is_ai_translated': False},
    {'lang_code': 'en', 'translation_key': 'pwa.install.ios_add_to_home', 'translation_value': '"Add to Home Screen"', 'is_ai_translated': False},
    {'lang_code': 'kk', 'translation_key': 'pwa.install.ios_add_to_home', 'translation_value': '"Басты экранға қосу"', 'is_ai_translated': False},

    {'lang_code': 'ru', 'translation_key': 'pwa.install.install_button', 'translation_value': 'Установить приложение', 'is_ai_translated': False},
    {'lang_code': 'en', 'translation_key': 'pwa.install.install_button', 'translation_value': 'Install app', 'is_ai_translated': False},
    {'lang_code': 'kk', 'translation_key': 'pwa.install.install_button', 'translation_value': 'Қолданбаны орнату', 'is_ai_translated': False},

    {'lang_code': 'ru', 'translation_key': 'pwa.install.maybe_later', 'translation_value': 'Может быть позже', 'is_ai_translated': False},
    {'lang_code': 'en', 'translation_key': 'pwa.install.maybe_later', 'translation_value': 'Maybe later', 'is_ai_translated': False},
    {'lang_code': 'kk', 'translation_key': 'pwa.install.maybe_later', 'translation_value': 'Кейінірек', 'is_ai_translated': False},

    # AI Hint Section (3 keys × 9 languages = 27 translations)
    {'lang_code': 'ru', 'translation_key': 'home.ai_hint.title', 'translation_value': 'AI подскажет', 'is_ai_translated': False},
    {'lang_code': 'en', 'translation_key': 'home.ai_hint.title', 'translation_value': 'AI will help', 'is_ai_translated': False},
    {'lang_code': 'kk', 'translation_key': 'home.ai_hint.title', 'translation_value': 'AI көмектеседі', 'is_ai_translated': False},
    {'lang_code': 'es', 'translation_key': 'home.ai_hint.title', 'translation_value': 'AI te ayudará', 'is_ai_translated': False},
    {'lang_code': 'de', 'translation_key': 'home.ai_hint.title', 'translation_value': 'AI wird helfen', 'is_ai_translated': False},
    {'lang_code': 'fr', 'translation_key': 'home.ai_hint.title', 'translation_value': 'L\'IA vous aidera', 'is_ai_translated': False},
    {'lang_code': 'zh', 'translation_key': 'home.ai_hint.title', 'translation_value': 'AI将帮助', 'is_ai_translated': False},
    {'lang_code': 'ja', 'translation_key': 'home.ai_hint.title', 'translation_value': 'AIがサポート', 'is_ai_translated': False},
    {'lang_code': 'ka', 'translation_key': 'home.ai_hint.title', 'translation_value': 'AI დაგეხმარებათ', 'is_ai_translated': False},

    {'lang_code': 'ru', 'translation_key': 'home.ai_hint.description', 'translation_value': 'Опиши своё достижение, и я помогу структурировать запись, выбрать категорию и отметить прогресс', 'is_ai_translated': False},
    {'lang_code': 'en', 'translation_key': 'home.ai_hint.description', 'translation_value': 'Describe your achievement, and I\'ll help structure the entry, choose a category, and track progress', 'is_ai_translated': False},
    {'lang_code': 'kk', 'translation_key': 'home.ai_hint.description', 'translation_value': 'Жетістігіңізді сипаттаңыз, мен жазбаны құрылымдауға, санатты таңдауға және прогрессті белгілеуге көмектесемін', 'is_ai_translated': False},
    {'lang_code': 'es', 'translation_key': 'home.ai_hint.description', 'translation_value': 'Describe tu logro y te ayudaré a estructurar la entrada, elegir categoría y marcar progreso', 'is_ai_translated': False},
    {'lang_code': 'de', 'translation_key': 'home.ai_hint.description', 'translation_value': 'Beschreibe deine Leistung und ich helfe dir, den Eintrag zu strukturieren, eine Kategorie zu wählen und Fortschritte zu markieren', 'is_ai_translated': False},
    {'lang_code': 'fr', 'translation_key': 'home.ai_hint.description', 'translation_value': 'Décrivez votre réussite et je vous aiderai à structurer l\'entrée, choisir une catégorie et suivre les progrès', 'is_ai_translated': False},
    {'lang_code': 'zh', 'translation_key': 'home.ai_hint.description', 'translation_value': '描述您的成就，我将帮助您构建条目、选择类别并跟踪进度', 'is_ai_translated': False},
    {'lang_code': 'ja', 'translation_key': 'home.ai_hint.description', 'translation_value': '成果を説明してください。エントリーの構造化、カテゴリー選択、進捗の追跡をサポートします', 'is_ai_translated': False},
    {'lang_code': 'ka', 'translation_key': 'home.ai_hint.description', 'translation_value': 'აღწერეთ თქვენი მიღწევა და მე დაგეხმარებით ჩანაწერის სტრუქტურირებაში, კატეგორიის არჩევაში და პროგრესის აღნიშვნაში', 'is_ai_translated': False},

    # Common translations
    {'lang_code': 'ru', 'translation_key': 'common.close', 'translation_value': 'Закрыть', 'is_ai_translated': False},
    {'lang_code': 'en', 'translation_key': 'common.close', 'translation_value': 'Close', 'is_ai_translated': False},
    {'lang_code': 'kk', 'translation_key': 'common.close', 'translation_value': 'Жабу', 'is_ai_translated': False},
    {'lang_code': 'es', 'translation_key': 'common.close', 'translation_value': 'Cerrar', 'is_ai_translated': False},
    {'lang_code': 'de', 'translation_key': 'common.close', 'translation_value': 'Schließen', 'is_ai_translated': False},
    {'lang_code': 'fr', 'translation_key': 'common.close', 'translation_value': 'Fermer', 'is_ai_translated': False},
    {'lang_code': 'zh', 'translation_key': 'common.close', 'translation_value': '关闭', 'is_ai_translated': False},
    {'lang_code': 'ja', 'translation_key': 'common.close', 'translation_value': '閉じる', 'is_ai_translated': False},
    {'lang_code': 'ka', 'translation_key': 'common.close', 'translation_value': 'დახურვა', 'is_ai_translated': False},
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

