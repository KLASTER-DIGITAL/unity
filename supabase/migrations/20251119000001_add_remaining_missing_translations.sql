-- Add remaining missing translations for all 9 languages
-- This migration adds translations that exist in Kazakh but are missing in other languages

-- Part 1: Home screen translations
INSERT INTO translations (lang_code, translation_key, translation_value, is_ai_translated) VALUES
-- Russian (ru)
('ru', 'home.greeting', 'Привет', false),
('ru', 'home.question', 'Какие твои победы сегодня?', false),
('ru', 'home.daysInRow', 'Дня подряд', false),
('ru', 'home.dayInRow', 'День подряд', false),
('ru', 'home.inputQuestion', 'Что сегодня получилось лучше всего?', false),

-- English (en)
('en', 'home.greeting', 'Hello', false),
('en', 'home.question', 'What are your wins today?', false),
('en', 'home.daysInRow', 'Days in a row', false),
('en', 'home.dayInRow', 'Day in a row', false),
('en', 'home.inputQuestion', 'What went best today?', false),

-- Spanish (es)
('es', 'home.greeting', 'Hola', false),
('es', 'home.question', '¿Cuáles son tus logros hoy?', false),
('es', 'home.daysInRow', 'Días seguidos', false),
('es', 'home.dayInRow', 'Día seguido', false),
('es', 'home.inputQuestion', '¿Qué salió mejor hoy?', false),

-- German (de)
('de', 'home.greeting', 'Hallo', false),
('de', 'home.question', 'Was sind deine Erfolge heute?', false),
('de', 'home.daysInRow', 'Tage hintereinander', false),
('de', 'home.dayInRow', 'Tag hintereinander', false),
('de', 'home.inputQuestion', 'Was lief heute am besten?', false),

-- French (fr)
('fr', 'home.greeting', 'Bonjour', false),
('fr', 'home.question', 'Quelles sont tes victoires aujourd''hui?', false),
('fr', 'home.daysInRow', 'Jours d''affilée', false),
('fr', 'home.dayInRow', 'Jour d''affilée', false),
('fr', 'home.inputQuestion', 'Qu''est-ce qui s''est le mieux passé aujourd''hui?', false),

-- Chinese (zh)
('zh', 'home.greeting', '你好', false),
('zh', 'home.question', '今天有什么成就？', false),
('zh', 'home.daysInRow', '连续天数', false),
('zh', 'home.dayInRow', '连续一天', false),
('zh', 'home.inputQuestion', '今天什么进展最好？', false),

-- Japanese (ja)
('ja', 'home.greeting', 'こんにちは', false),
('ja', 'home.question', '今日の成果は何ですか？', false),
('ja', 'home.daysInRow', '連続日数', false),
('ja', 'home.dayInRow', '連続1日', false),
('ja', 'home.inputQuestion', '今日一番うまくいったことは？', false),

-- Georgian (ka)
('ka', 'home.greeting', 'გამარჯობა', false),
('ka', 'home.question', 'რა არის შენი მიღწევები დღეს?', false),
('ka', 'home.daysInRow', 'დღე ზედიზედ', false),
('ka', 'home.dayInRow', 'დღე ზედიზედ', false),
('ka', 'home.inputQuestion', 'რა გამოვიდა საუკეთესოდ დღეს?', false)

ON CONFLICT (lang_code, translation_key) DO NOTHING;

-- Part 2: Category translations
INSERT INTO translations (lang_code, translation_key, translation_value, is_ai_translated) VALUES
-- Russian (ru)
('ru', 'category.family', 'Семья', false),
('ru', 'category.work', 'Работа', false),
('ru', 'category.finance', 'Финансы', false),
('ru', 'category.gratitude', 'Благодарность', false),
('ru', 'category.health', 'Здоровье', false),
('ru', 'category.personal_growth', 'Личное развитие', false),
('ru', 'category.creativity', 'Творчество', false),
('ru', 'category.relationships', 'Отношения', false),
('ru', 'category.other', 'Другое', false),

-- English (en)
('en', 'category.family', 'Family', false),
('en', 'category.work', 'Work', false),
('en', 'category.finance', 'Finance', false),
('en', 'category.gratitude', 'Gratitude', false),
('en', 'category.health', 'Health', false),
('en', 'category.personal_growth', 'Personal Growth', false),
('en', 'category.creativity', 'Creativity', false),
('en', 'category.relationships', 'Relationships', false),
('en', 'category.other', 'Other', false),

-- Spanish (es)
('es', 'category.family', 'Familia', false),
('es', 'category.work', 'Trabajo', false),
('es', 'category.finance', 'Finanzas', false),
('es', 'category.gratitude', 'Gratitud', false),
('es', 'category.health', 'Salud', false),
('es', 'category.personal_growth', 'Crecimiento Personal', false),
('es', 'category.creativity', 'Creatividad', false),
('es', 'category.relationships', 'Relaciones', false),
('es', 'category.other', 'Otro', false),

-- German (de)
('de', 'category.family', 'Familie', false),
('de', 'category.work', 'Arbeit', false),
('de', 'category.finance', 'Finanzen', false),
('de', 'category.gratitude', 'Dankbarkeit', false),
('de', 'category.health', 'Gesundheit', false),
('de', 'category.personal_growth', 'Persönliche Entwicklung', false),
('de', 'category.creativity', 'Kreativität', false),
('de', 'category.relationships', 'Beziehungen', false),
('de', 'category.other', 'Andere', false),

-- French (fr)
('fr', 'category.family', 'Famille', false),
('fr', 'category.work', 'Travail', false),
('fr', 'category.finance', 'Finances', false),
('fr', 'category.gratitude', 'Gratitude', false),
('fr', 'category.health', 'Santé', false),
('fr', 'category.personal_growth', 'Développement Personnel', false),
('fr', 'category.creativity', 'Créativité', false),
('fr', 'category.relationships', 'Relations', false),
('fr', 'category.other', 'Autre', false),

-- Chinese (zh)
('zh', 'category.family', '家庭', false),
('zh', 'category.work', '工作', false),
('zh', 'category.finance', '财务', false),
('zh', 'category.gratitude', '感恩', false),
('zh', 'category.health', '健康', false),
('zh', 'category.personal_growth', '个人成长', false),
('zh', 'category.creativity', '创造力', false),
('zh', 'category.relationships', '关系', false),
('zh', 'category.other', '其他', false),

-- Japanese (ja)
('ja', 'category.family', '家族', false),
('ja', 'category.work', '仕事', false),
('ja', 'category.finance', '財務', false),
('ja', 'category.gratitude', '感謝', false),
('ja', 'category.health', '健康', false),
('ja', 'category.personal_growth', '自己成長', false),
('ja', 'category.creativity', '創造性', false),
('ja', 'category.relationships', '人間関係', false),
('ja', 'category.other', 'その他', false),

-- Georgian (ka)
('ka', 'category.family', 'ოჯახი', false),
('ka', 'category.work', 'სამუშაო', false),
('ka', 'category.finance', 'ფინანსები', false),
('ka', 'category.gratitude', 'მადლიერება', false),
('ka', 'category.health', 'ჯანმრთელობა', false),
('ka', 'category.personal_growth', 'პირადი განვითარება', false),
('ka', 'category.creativity', 'შემოქმედება', false),
('ka', 'category.relationships', 'ურთიერთობები', false),
('ka', 'category.other', 'სხვა', false)

ON CONFLICT (lang_code, translation_key) DO NOTHING;

-- Part 3: Motivation cards translations
INSERT INTO translations (lang_code, translation_key, translation_value, is_ai_translated) VALUES
-- Russian (ru)
('ru', 'motivation.card1.date', 'Начни сегодня', false),
('ru', 'motivation.card1.title', 'Сегодня отличное время', false),
('ru', 'motivation.card1.description', 'Запиши маленькую победу — это первый шаг к большим изменениям.', false),
('ru', 'motivation.card2.date', 'Совет дня', false),
('ru', 'motivation.card2.title', 'Даже одна мысль делает день осмысленным', false),
('ru', 'motivation.card2.description', 'Не обязательно писать много — одна фраза может изменить твой взгляд на прожитый день.', false),
('ru', 'motivation.card3.date', 'Мотивация', false),
('ru', 'motivation.card3.title', 'Запиши момент благодарности', false),
('ru', 'motivation.card3.description', 'Почувствуй лёгкость, когда замечаешь хорошее в своей жизни. Это путь к счастью.', false),

-- English (en)
('en', 'motivation.card1.date', 'Start Today', false),
('en', 'motivation.card1.title', 'Today is a great time', false),
('en', 'motivation.card1.description', 'Write down a small win — it''s the first step to big changes.', false),
('en', 'motivation.card2.date', 'Tip of the Day', false),
('en', 'motivation.card2.title', 'Even one thought makes the day meaningful', false),
('en', 'motivation.card2.description', 'You don''t have to write a lot — one phrase can change your view of the day.', false),
('en', 'motivation.card3.date', 'Motivation', false),
('en', 'motivation.card3.title', 'Write down a moment of gratitude', false),
('en', 'motivation.card3.description', 'Feel the lightness when you notice the good in your life. This is the path to happiness.', false),

-- Spanish (es)
('es', 'motivation.card1.date', 'Empieza Hoy', false),
('es', 'motivation.card1.title', 'Hoy es un gran momento', false),
('es', 'motivation.card1.description', 'Escribe un pequeño logro: es el primer paso hacia grandes cambios.', false),
('es', 'motivation.card2.date', 'Consejo del Día', false),
('es', 'motivation.card2.title', 'Incluso un pensamiento hace que el día sea significativo', false),
('es', 'motivation.card2.description', 'No tienes que escribir mucho: una frase puede cambiar tu visión del día.', false),
('es', 'motivation.card3.date', 'Motivación', false),
('es', 'motivation.card3.title', 'Escribe un momento de gratitud', false),
('es', 'motivation.card3.description', 'Siente la ligereza cuando notas lo bueno en tu vida. Este es el camino a la felicidad.', false),

-- German (de)
('de', 'motivation.card1.date', 'Heute Beginnen', false),
('de', 'motivation.card1.title', 'Heute ist eine großartige Zeit', false),
('de', 'motivation.card1.description', 'Schreibe einen kleinen Erfolg auf — das ist der erste Schritt zu großen Veränderungen.', false),
('de', 'motivation.card2.date', 'Tipp des Tages', false),
('de', 'motivation.card2.title', 'Selbst ein Gedanke macht den Tag bedeutungsvoll', false),
('de', 'motivation.card2.description', 'Du musst nicht viel schreiben — ein Satz kann deine Sicht auf den Tag verändern.', false),
('de', 'motivation.card3.date', 'Motivation', false),
('de', 'motivation.card3.title', 'Schreibe einen Moment der Dankbarkeit auf', false),
('de', 'motivation.card3.description', 'Fühle die Leichtigkeit, wenn du das Gute in deinem Leben bemerkst. Das ist der Weg zum Glück.', false),

-- French (fr)
('fr', 'motivation.card1.date', 'Commencez Aujourd''hui', false),
('fr', 'motivation.card1.title', 'Aujourd''hui est un moment idéal', false),
('fr', 'motivation.card1.description', 'Notez une petite victoire — c''est le premier pas vers de grands changements.', false),
('fr', 'motivation.card2.date', 'Conseil du Jour', false),
('fr', 'motivation.card2.title', 'Même une pensée rend la journée significative', false),
('fr', 'motivation.card2.description', 'Vous n''avez pas besoin d''écrire beaucoup — une phrase peut changer votre vision de la journée.', false),
('fr', 'motivation.card3.date', 'Motivation', false),
('fr', 'motivation.card3.title', 'Notez un moment de gratitude', false),
('fr', 'motivation.card3.description', 'Ressentez la légèreté lorsque vous remarquez le bien dans votre vie. C''est le chemin vers le bonheur.', false),

-- Chinese (zh)
('zh', 'motivation.card1.date', '今天开始', false),
('zh', 'motivation.card1.title', '今天是个好时机', false),
('zh', 'motivation.card1.description', '记录一个小胜利——这是迈向大变化的第一步。', false),
('zh', 'motivation.card2.date', '每日提示', false),
('zh', 'motivation.card2.title', '即使一个想法也能让这一天有意义', false),
('zh', 'motivation.card2.description', '你不必写很多——一句话就能改变你对这一天的看法。', false),
('zh', 'motivation.card3.date', '动力', false),
('zh', 'motivation.card3.title', '记录一个感恩的时刻', false),
('zh', 'motivation.card3.description', '当你注意到生活中的美好时，感受那份轻松。这是通往幸福的道路。', false),

-- Japanese (ja)
('ja', 'motivation.card1.date', '今日から始める', false),
('ja', 'motivation.card1.title', '今日は素晴らしい時間です', false),
('ja', 'motivation.card1.description', '小さな勝利を書き留めましょう——それは大きな変化への第一歩です。', false),
('ja', 'motivation.card2.date', '今日のヒント', false),
('ja', 'motivation.card2.title', '一つの考えでも一日を意味のあるものにします', false),
('ja', 'motivation.card2.description', 'たくさん書く必要はありません——一つのフレーズがあなたの一日の見方を変えることができます。', false),
('ja', 'motivation.card3.date', 'モチベーション', false),
('ja', 'motivation.card3.title', '感謝の瞬間を書き留める', false),
('ja', 'motivation.card3.description', '人生の良いことに気づいたとき、軽さを感じてください。これが幸せへの道です。', false),

-- Georgian (ka)
('ka', 'motivation.card1.date', 'დაიწყე დღეს', false),
('ka', 'motivation.card1.title', 'დღეს შესანიშნავი დროა', false),
('ka', 'motivation.card1.description', 'ჩაწერე პატარა გამარჯვება — ეს არის პირველი ნაბიჯი დიდი ცვლილებებისკენ.', false),
('ka', 'motivation.card2.date', 'დღის რჩევა', false),
('ka', 'motivation.card2.title', 'ერთი აზრიც კი დღეს მნიშვნელოვანს ხდის', false),
('ka', 'motivation.card2.description', 'არ არის საჭირო ბევრი დაწერა — ერთი ფრაზა შეიძლება შეცვალოს შენი ხედვა დღეზე.', false),
('ka', 'motivation.card3.date', 'მოტივაცია', false),
('ka', 'motivation.card3.title', 'ჩაწერე მადლიერების მომენტი', false),
('ka', 'motivation.card3.description', 'იგრძენი სიმსუბუქე, როდესაც შენს ცხოვრებაში კარგს ამჩნევ. ეს არის გზა ბედნიერებისკენ.', false)

ON CONFLICT (lang_code, translation_key) DO NOTHING;

-- Part 4: Navigation and other translations
INSERT INTO translations (lang_code, translation_key, translation_value, is_ai_translated) VALUES
-- Russian (ru)
('ru', 'achievements', 'Достижения', false),
('ru', 'reports', 'Отчеты', false),

-- English (en)
('en', 'achievements', 'Achievements', false),
('en', 'reports', 'Reports', false),

-- Spanish (es)
('es', 'achievements', 'Logros', false),
('es', 'reports', 'Informes', false),

-- German (de)
('de', 'achievements', 'Erfolge', false),
('de', 'reports', 'Berichte', false),

-- French (fr)
('fr', 'achievements', 'Réalisations', false),
('fr', 'reports', 'Rapports', false),

-- Chinese (zh)
('zh', 'achievements', '成就', false),
('zh', 'reports', '报告', false),

-- Japanese (ja)
('ja', 'achievements', '達成', false),
('ja', 'reports', 'レポート', false),

-- Georgian (ka)
('ka', 'achievements', 'მიღწევები', false),
('ka', 'reports', 'ანგარიშები', false)

ON CONFLICT (lang_code, translation_key) DO NOTHING;

