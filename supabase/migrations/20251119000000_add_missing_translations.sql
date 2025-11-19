-- Add missing translations that exist in Kazakh but not in other languages
-- These keys are used in the UI but missing from Russian and other languages

-- Russian (ru) missing translations
INSERT INTO translations (lang_code, translation_key, translation_value, is_ai_translated) VALUES
('ru', 'home.daysInRow', 'Дней подряд', false),
('ru', 'home.greeting', 'Привет', false),
('ru', 'home.inputPlaceholder', 'Опиши главную мысль, момент, благодарность', false),
('ru', 'home.inputQuestion', 'Что было лучшего сегодня?', false),
('ru', 'home.question', 'Что было лучшего сегодня?', false),
('ru', 'welcomeTrial.title', 'Добро пожаловать в UNITY Premium!', false),
('ru', 'welcomeTrial.subtitle', 'Попробуйте все возможности бесплатно 7 дней', false),
('ru', 'welcomeTrial.startUsing', 'Начать использовать', false),
('ru', 'welcomeTrial.feature.aiAnalysis.title', 'AI анализ записей', false),
('ru', 'welcomeTrial.feature.aiAnalysis.description', 'Умный анализ ваших записей с персональными рекомендациями', false),
('ru', 'welcomeTrial.feature.unlimitedEntries.title', 'Неограниченные записи', false),
('ru', 'welcomeTrial.feature.unlimitedEntries.description', 'Создавайте сколько угодно записей без ограничений', false),
('ru', 'welcomeTrial.feature.offline.title', 'Offline режим', false),
('ru', 'welcomeTrial.feature.offline.description', 'Работайте без интернета, синхронизация автоматическая', false),
('ru', 'welcomeTrial.feature.pdfBooks.title', 'PDF-книги', false),
('ru', 'welcomeTrial.feature.pdfBooks.description', 'Генерация красивых PDF-книг из ваших записей', false),
('ru', 'welcomeTrial.feature.premiumThemes.title', 'Премиум-темы', false),
('ru', 'welcomeTrial.feature.premiumThemes.description', 'Эксклюзивные темы оформления для вашего дневника', false),
('ru', 'welcomeTrial.feature.analytics.title', 'Расширенная аналитика', false),
('ru', 'welcomeTrial.feature.analytics.description', 'Детальная статистика и визуализация вашего прогресса', false),
('ru', 'pwa.install.feature1', 'Работает без интернета', false),
('ru', 'category.personalDevelopment', 'Личное развитие', false)
ON CONFLICT (lang_code, translation_key) DO NOTHING;

-- English (en) missing translations
INSERT INTO translations (lang_code, translation_key, translation_value, is_ai_translated) VALUES
('en', 'home.daysInRow', 'Days in a row', false),
('en', 'home.greeting', 'Hello', false),
('en', 'home.inputPlaceholder', 'Describe your main thought, moment, gratitude', false),
('en', 'home.inputQuestion', 'What was the best thing today?', false),
('en', 'home.question', 'What was the best thing today?', false),
('en', 'welcomeTrial.title', 'Welcome to UNITY Premium!', false),
('en', 'welcomeTrial.subtitle', 'Try all features free for 7 days', false),
('en', 'welcomeTrial.startUsing', 'Start using', false),
('en', 'welcomeTrial.feature.aiAnalysis.title', 'AI entry analysis', false),
('en', 'welcomeTrial.feature.aiAnalysis.description', 'Smart analysis of your entries with personal recommendations', false),
('en', 'welcomeTrial.feature.unlimitedEntries.title', 'Unlimited entries', false),
('en', 'welcomeTrial.feature.unlimitedEntries.description', 'Create as many entries as you want without limits', false),
('en', 'welcomeTrial.feature.offline.title', 'Offline mode', false),
('en', 'welcomeTrial.feature.offline.description', 'Work without internet, automatic synchronization', false),
('en', 'welcomeTrial.feature.pdfBooks.title', 'PDF books', false),
('en', 'welcomeTrial.feature.pdfBooks.description', 'Generate beautiful PDF books from your entries', false),
('en', 'welcomeTrial.feature.premiumThemes.title', 'Premium themes', false),
('en', 'welcomeTrial.feature.premiumThemes.description', 'Exclusive design themes for your diary', false),
('en', 'welcomeTrial.feature.analytics.title', 'Advanced analytics', false),
('en', 'welcomeTrial.feature.analytics.description', 'Detailed statistics and visualization of your progress', false),
('en', 'pwa.install.feature1', 'Works offline', false),
('en', 'category.personalDevelopment', 'Personal Development', false)
ON CONFLICT (lang_code, translation_key) DO NOTHING;

-- Spanish (es) missing translations
INSERT INTO translations (lang_code, translation_key, translation_value, is_ai_translated) VALUES
('es', 'home.daysInRow', 'Días seguidos', true),
('es', 'home.greeting', 'Hola', true),
('es', 'home.inputPlaceholder', 'Describe tu pensamiento principal, momento, gratitud', true),
('es', 'home.inputQuestion', '¿Qué fue lo mejor de hoy?', true),
('es', 'home.question', '¿Qué fue lo mejor de hoy?', true),
('es', 'welcomeTrial.title', '¡Bienvenido a UNITY Premium!', true),
('es', 'welcomeTrial.subtitle', 'Prueba todas las funciones gratis durante 7 días', true),
('es', 'welcomeTrial.startUsing', 'Empezar a usar', true),
('es', 'welcomeTrial.feature.aiAnalysis.title', 'Análisis AI de entradas', true),
('es', 'welcomeTrial.feature.aiAnalysis.description', 'Análisis inteligente de tus entradas con recomendaciones personales', true),
('es', 'welcomeTrial.feature.unlimitedEntries.title', 'Entradas ilimitadas', true),
('es', 'welcomeTrial.feature.unlimitedEntries.description', 'Crea tantas entradas como quieras sin límites', true),
('es', 'welcomeTrial.feature.offline.title', 'Modo offline', true),
('es', 'welcomeTrial.feature.offline.description', 'Trabaja sin internet, sincronización automática', true),
('es', 'welcomeTrial.feature.pdfBooks.title', 'Libros PDF', true),
('es', 'welcomeTrial.feature.pdfBooks.description', 'Genera hermosos libros PDF de tus entradas', true),
('es', 'welcomeTrial.feature.premiumThemes.title', 'Temas premium', true),
('es', 'welcomeTrial.feature.premiumThemes.description', 'Temas de diseño exclusivos para tu diario', true),
('es', 'welcomeTrial.feature.analytics.title', 'Análisis avanzado', true),
('es', 'welcomeTrial.feature.analytics.description', 'Estadísticas detalladas y visualización de tu progreso', true),
('es', 'pwa.install.feature1', 'Funciona sin conexión', true),
('es', 'category.personalDevelopment', 'Desarrollo Personal', true)
ON CONFLICT (lang_code, translation_key) DO NOTHING;

-- German (de) missing translations
INSERT INTO translations (lang_code, translation_key, translation_value, is_ai_translated) VALUES
('de', 'home.daysInRow', 'Tage in Folge', true),
('de', 'home.greeting', 'Hallo', true),
('de', 'home.inputPlaceholder', 'Beschreibe deinen Hauptgedanken, Moment, Dankbarkeit', true),
('de', 'home.inputQuestion', 'Was war heute am besten?', true),
('de', 'home.question', 'Was war heute am besten?', true),
('de', 'welcomeTrial.title', 'Willkommen bei UNITY Premium!', true),
('de', 'welcomeTrial.subtitle', 'Teste alle Funktionen 7 Tage kostenlos', true),
('de', 'welcomeTrial.startUsing', 'Jetzt starten', true),
('de', 'welcomeTrial.feature.aiAnalysis.title', 'KI-Eintragsanalyse', true),
('de', 'welcomeTrial.feature.aiAnalysis.description', 'Intelligente Analyse deiner Einträge mit persönlichen Empfehlungen', true),
('de', 'welcomeTrial.feature.unlimitedEntries.title', 'Unbegrenzte Einträge', true),
('de', 'welcomeTrial.feature.unlimitedEntries.description', 'Erstelle so viele Einträge wie du möchtest ohne Limits', true),
('de', 'welcomeTrial.feature.offline.title', 'Offline-Modus', true),
('de', 'welcomeTrial.feature.offline.description', 'Arbeite ohne Internet, automatische Synchronisation', true),
('de', 'welcomeTrial.feature.pdfBooks.title', 'PDF-Bücher', true),
('de', 'welcomeTrial.feature.pdfBooks.description', 'Generiere schöne PDF-Bücher aus deinen Einträgen', true),
('de', 'welcomeTrial.feature.premiumThemes.title', 'Premium-Themes', true),
('de', 'welcomeTrial.feature.premiumThemes.description', 'Exklusive Design-Themes für dein Tagebuch', true),
('de', 'welcomeTrial.feature.analytics.title', 'Erweiterte Analytik', true),
('de', 'welcomeTrial.feature.analytics.description', 'Detaillierte Statistiken und Visualisierung deines Fortschritts', true),
('de', 'pwa.install.feature1', 'Funktioniert offline', true),
('de', 'category.personalDevelopment', 'Persönliche Entwicklung', true)
ON CONFLICT (lang_code, translation_key) DO NOTHING;



-- French (fr) missing translations
INSERT INTO translations (lang_code, translation_key, translation_value, is_ai_translated) VALUES
('fr', 'home.daysInRow', 'Jours consécutifs', true),
('fr', 'home.greeting', 'Bonjour', true),
('fr', 'home.inputPlaceholder', 'Décrivez votre pensée principale, moment, gratitude', true),
('fr', 'home.inputQuestion', 'Quelle a été la meilleure chose aujourd''hui?', true),
('fr', 'home.question', 'Quelle a été la meilleure chose aujourd''hui?', true),
('fr', 'welcomeTrial.title', 'Bienvenue dans UNITY Premium!', true),
('fr', 'welcomeTrial.subtitle', 'Essayez toutes les fonctionnalités gratuitement pendant 7 jours', true),
('fr', 'welcomeTrial.startUsing', 'Commencer à utiliser', true),
('fr', 'welcomeTrial.feature.aiAnalysis.title', 'Analyse IA des entrées', true),
('fr', 'welcomeTrial.feature.aiAnalysis.description', 'Analyse intelligente de vos entrées avec des recommandations personnelles', true),
('fr', 'welcomeTrial.feature.unlimitedEntries.title', 'Entrées illimitées', true),
('fr', 'welcomeTrial.feature.unlimitedEntries.description', 'Créez autant d''entrées que vous le souhaitez sans limites', true),
('fr', 'welcomeTrial.feature.offline.title', 'Mode hors ligne', true),
('fr', 'welcomeTrial.feature.offline.description', 'Travaillez sans internet, synchronisation automatique', true),
('fr', 'welcomeTrial.feature.pdfBooks.title', 'Livres PDF', true),
('fr', 'welcomeTrial.feature.pdfBooks.description', 'Générez de beaux livres PDF à partir de vos entrées', true),
('fr', 'welcomeTrial.feature.premiumThemes.title', 'Thèmes premium', true),
('fr', 'welcomeTrial.feature.premiumThemes.description', 'Thèmes de design exclusifs pour votre journal', true),
('fr', 'welcomeTrial.feature.analytics.title', 'Analytique avancée', true),
('fr', 'welcomeTrial.feature.analytics.description', 'Statistiques détaillées et visualisation de vos progrès', true),
('fr', 'pwa.install.feature1', 'Fonctionne hors ligne', true),
('fr', 'category.personalDevelopment', 'Développement Personnel', true)
ON CONFLICT (lang_code, translation_key) DO NOTHING;

-- Chinese (zh) missing translations
INSERT INTO translations (lang_code, translation_key, translation_value, is_ai_translated) VALUES
('zh', 'home.daysInRow', '连续天数', true),
('zh', 'home.greeting', '你好', true),
('zh', 'home.inputPlaceholder', '描述你的主要想法、时刻、感恩', true),
('zh', 'home.inputQuestion', '今天最好的事情是什么？', true),
('zh', 'home.question', '今天最好的事情是什么？', true),
('zh', 'welcomeTrial.title', '欢迎使用UNITY Premium！', true),
('zh', 'welcomeTrial.subtitle', '免费试用所有功能7天', true),
('zh', 'welcomeTrial.startUsing', '开始使用', true),
('zh', 'welcomeTrial.feature.aiAnalysis.title', 'AI条目分析', true),
('zh', 'welcomeTrial.feature.aiAnalysis.description', '智能分析您的条目并提供个性化建议', true),
('zh', 'welcomeTrial.feature.unlimitedEntries.title', '无限条目', true),
('zh', 'welcomeTrial.feature.unlimitedEntries.description', '创建任意数量的条目，无限制', true),
('zh', 'welcomeTrial.feature.offline.title', '离线模式', true),
('zh', 'welcomeTrial.feature.offline.description', '无需互联网即可工作，自动同步', true),
('zh', 'welcomeTrial.feature.pdfBooks.title', 'PDF书籍', true),
('zh', 'welcomeTrial.feature.pdfBooks.description', '从您的条目生成精美的PDF书籍', true),
('zh', 'welcomeTrial.feature.premiumThemes.title', '高级主题', true),
('zh', 'welcomeTrial.feature.premiumThemes.description', '为您的日记提供独家设计主题', true),
('zh', 'welcomeTrial.feature.analytics.title', '高级分析', true),
('zh', 'welcomeTrial.feature.analytics.description', '详细的统计数据和进度可视化', true),
('zh', 'pwa.install.feature1', '离线工作', true),
('zh', 'category.personalDevelopment', '个人发展', true)
ON CONFLICT (lang_code, translation_key) DO NOTHING;

-- Japanese (ja) missing translations
INSERT INTO translations (lang_code, translation_key, translation_value, is_ai_translated) VALUES
('ja', 'home.daysInRow', '連続日数', true),
('ja', 'home.greeting', 'こんにちは', true),
('ja', 'home.inputPlaceholder', '主な考え、瞬間、感謝を説明してください', true),
('ja', 'home.inputQuestion', '今日一番良かったことは何ですか？', true),
('ja', 'home.question', '今日一番良かったことは何ですか？', true),
('ja', 'welcomeTrial.title', 'UNITY Premiumへようこそ！', true),
('ja', 'welcomeTrial.subtitle', 'すべての機能を7日間無料でお試しください', true),
('ja', 'welcomeTrial.startUsing', '使い始める', true),
('ja', 'welcomeTrial.feature.aiAnalysis.title', 'AIエントリー分析', true),
('ja', 'welcomeTrial.feature.aiAnalysis.description', 'エントリーのスマート分析と個人的な推奨事項', true),
('ja', 'welcomeTrial.feature.unlimitedEntries.title', '無制限のエントリー', true),
('ja', 'welcomeTrial.feature.unlimitedEntries.description', '制限なく好きなだけエントリーを作成', true),
('ja', 'welcomeTrial.feature.offline.title', 'オフラインモード', true),
('ja', 'welcomeTrial.feature.offline.description', 'インターネットなしで作業、自動同期', true),
('ja', 'welcomeTrial.feature.pdfBooks.title', 'PDF書籍', true),
('ja', 'welcomeTrial.feature.pdfBooks.description', 'エントリーから美しいPDF書籍を生成', true),
('ja', 'welcomeTrial.feature.premiumThemes.title', 'プレミアムテーマ', true),
('ja', 'welcomeTrial.feature.premiumThemes.description', '日記用の独占デザインテーマ', true),
('ja', 'welcomeTrial.feature.analytics.title', '高度な分析', true),
('ja', 'welcomeTrial.feature.analytics.description', '詳細な統計と進捗の可視化', true),
('ja', 'pwa.install.feature1', 'オフラインで動作', true),
('ja', 'category.personalDevelopment', '個人の成長', true)
ON CONFLICT (lang_code, translation_key) DO NOTHING;

-- Georgian (ka) missing translations
INSERT INTO translations (lang_code, translation_key, translation_value, is_ai_translated) VALUES
('ka', 'home.daysInRow', 'დღეები ზედიზედ', true),
('ka', 'home.greeting', 'გამარჯობა', true),
('ka', 'home.inputPlaceholder', 'აღწერეთ თქვენი მთავარი აზრი, მომენტი, მადლიერება', true),
('ka', 'home.inputQuestion', 'რა იყო დღეს საუკეთესო?', true),
('ka', 'home.question', 'რა იყო დღეს საუკეთესო?', true),
('ka', 'welcomeTrial.title', 'კეთილი იყოს თქვენი მობრძანება UNITY Premium-ში!', true),
('ka', 'welcomeTrial.subtitle', 'გამოსცადეთ ყველა ფუნქცია უფასოდ 7 დღის განმავლობაში', true),
('ka', 'welcomeTrial.startUsing', 'გამოყენების დაწყება', true),
('ka', 'welcomeTrial.feature.aiAnalysis.title', 'AI ჩანაწერების ანალიზი', true),
('ka', 'welcomeTrial.feature.aiAnalysis.description', 'თქვენი ჩანაწერების ჭკვიანური ანალიზი პერსონალური რეკომენდაციებით', true),
('ka', 'welcomeTrial.feature.unlimitedEntries.title', 'შეუზღუდავი ჩანაწერები', true),
('ka', 'welcomeTrial.feature.unlimitedEntries.description', 'შექმენით რამდენიც გინდათ ჩანაწერი შეზღუდვების გარეშე', true),
('ka', 'welcomeTrial.feature.offline.title', 'ოფლაინ რეჟიმი', true),
('ka', 'welcomeTrial.feature.offline.description', 'იმუშავეთ ინტერნეტის გარეშე, ავტომატური სინქრონიზაცია', true),
('ka', 'welcomeTrial.feature.pdfBooks.title', 'PDF წიგნები', true),
('ka', 'welcomeTrial.feature.pdfBooks.description', 'შექმენით ლამაზი PDF წიგნები თქვენი ჩანაწერებიდან', true),
('ka', 'welcomeTrial.feature.premiumThemes.title', 'პრემიუმ თემები', true),
('ka', 'welcomeTrial.feature.premiumThemes.description', 'ექსკლუზიური დიზაინის თემები თქვენი დღიურისთვის', true),
('ka', 'welcomeTrial.feature.analytics.title', 'გაფართოებული ანალიტიკა', true),
('ka', 'welcomeTrial.feature.analytics.description', 'დეტალური სტატისტიკა და თქვენი პროგრესის ვიზუალიზაცია', true),
('ka', 'pwa.install.feature1', 'მუშაობს ოფლაინ რეჟიმში', true),
('ka', 'category.personalDevelopment', 'პირადი განვითარება', true)
ON CONFLICT (lang_code, translation_key) DO NOTHING;
