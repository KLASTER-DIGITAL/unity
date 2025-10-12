// Словари переводов для приложения
export type Language = 'ru' | 'en' | 'es' | 'de' | 'fr' | 'zh' | 'ja';

export interface Translations {
  // Приветствие
  greeting: string;
  todayQuestion: string;
  
  // Навигация
  home: string;
  history: string;
  awards: string;
  reviews: string;
  settings: string;
  
  // Плейсхолдеры
  inputPlaceholder: string;
  searchPlaceholder: string;
  
  // Кнопки
  addPhoto: string;
  send: string;
  save: string;
  cancel: string;
  delete: string;
  
  // Категории
  family: string;
  work: string;
  finance: string;
  gratitude: string;
  health: string;
  personalDevelopment: string;
  creativity: string;
  relationships: string;
  
  // Карточки мотивации
  defaultCard1Title: string;
  defaultCard1Description: string;
  defaultCard2Title: string;
  defaultCard2Description: string;
  defaultCard3Title: string;
  defaultCard3Description: string;
  
  // Статусы
  connectedToAI: string;
  aiHelp: string;
  aiHelpDescription: string;
  
  // История
  historyTitle: string;
  foundEntries: string;
  filters: string;
  
  // Настройки
  notifications: string;
  dailyReminders: string;
  weeklyReports: string;
  newAchievements: string;
  motivationalMessages: string;
  themes: string;
  security: string;
  language: string;
  support: string;
  
  // Онбординг
  welcomeTitle: string;
  selectLanguage: string;
  diaryName: string;
  firstEntry: string;
  reminders: string;
}

const translations: Record<Language, Translations> = {
  ru: {
    greeting: 'Привет',
    todayQuestion: 'Какие твои победы сегодня?',
    
    home: 'Главная',
    history: 'История',
    awards: 'Награды',
    reviews: 'Обзоры',
    settings: 'Настройки',
    
    inputPlaceholder: 'Опиши главную мысль, момент, благодарность',
    searchPlaceholder: 'Поиск по записям...',
    
    addPhoto: 'Добавить фото',
    send: 'Отправить',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    
    family: 'Семья',
    work: 'Работа',
    finance: 'Финансы',
    gratitude: 'Благодарность',
    health: 'Здоровье',
    personalDevelopment: 'Личное развитие',
    creativity: 'Творчество',
    relationships: 'Отношения',
    
    defaultCard1Title: 'Сегодня отличное время',
    defaultCard1Description: 'Запиши маленькую победу — это первый шаг к осознанию своих достижений.',
    defaultCard2Title: 'Даже одна мысль делает день осмысленным',
    defaultCard2Description: 'Не обязательно писать много — одна фраза может изменить твой взгляд на прожитый день.',
    defaultCard3Title: 'Запиши момент благодарности',
    defaultCard3Description: 'Почувствуй лёгкость, когда замечаешь хорошее в своей жизни. Это путь к счастью.',
    
    connectedToAI: 'Подключено к AI',
    aiHelp: 'AI подскажет',
    aiHelpDescription: 'Опиши своё достижение, и я помогу структурировать запись, выбрать категорию и отметить прогресс',
    
    historyTitle: 'История записей',
    foundEntries: 'Найдено записей',
    filters: 'Фильтры',
    
    notifications: 'Уведомления',
    dailyReminders: 'Ежедневные напоминания',
    weeklyReports: 'Еженедельные отчёты',
    newAchievements: 'Новые достижения',
    motivationalMessages: 'Мотивационные сообщения',
    themes: 'Темы оформления',
    security: 'Безопасность и приватность',
    language: 'Язык приложения',
    support: 'Поддержка',
    
    welcomeTitle: 'Добро пожаловать',
    selectLanguage: 'Выбери язык',
    diaryName: 'Название дневника',
    firstEntry: 'Первая запись',
    reminders: 'Напоминания',
  },
  
  en: {
    greeting: 'Hello',
    todayQuestion: 'What are your victories today?',
    
    home: 'Home',
    history: 'History',
    awards: 'Awards',
    reviews: 'Reviews',
    settings: 'Settings',
    
    inputPlaceholder: 'Describe your main thought, moment, gratitude',
    searchPlaceholder: 'Search entries...',
    
    addPhoto: 'Add photo',
    send: 'Send',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    
    family: 'Family',
    work: 'Work',
    finance: 'Finance',
    gratitude: 'Gratitude',
    health: 'Health',
    personalDevelopment: 'Personal Development',
    creativity: 'Creativity',
    relationships: 'Relationships',
    
    defaultCard1Title: 'Today is a great time',
    defaultCard1Description: 'Write down a small victory — it\'s the first step to recognizing your achievements.',
    defaultCard2Title: 'Even one thought makes the day meaningful',
    defaultCard2Description: 'You don\'t have to write a lot — one phrase can change your view of the day.',
    defaultCard3Title: 'Write down a moment of gratitude',
    defaultCard3Description: 'Feel the lightness when you notice the good in your life. This is the path to happiness.',
    
    connectedToAI: 'Connected to AI',
    aiHelp: 'AI will help',
    aiHelpDescription: 'Describe your achievement, and I will help structure the entry, choose a category and mark progress',
    
    historyTitle: 'Entry History',
    foundEntries: 'Entries found',
    filters: 'Filters',
    
    notifications: 'Notifications',
    dailyReminders: 'Daily reminders',
    weeklyReports: 'Weekly reports',
    newAchievements: 'New achievements',
    motivationalMessages: 'Motivational messages',
    themes: 'Themes',
    security: 'Security and privacy',
    language: 'App language',
    support: 'Support',
    
    welcomeTitle: 'Welcome',
    selectLanguage: 'Select language',
    diaryName: 'Diary name',
    firstEntry: 'First entry',
    reminders: 'Reminders',
  },
  
  es: {
    greeting: 'Hola',
    todayQuestion: '¿Cuáles son tus victorias hoy?',
    
    home: 'Inicio',
    history: 'Historia',
    awards: 'Premios',
    reviews: 'Reseñas',
    settings: 'Ajustes',
    
    inputPlaceholder: 'Describe tu pensamiento principal, momento, gratitud',
    searchPlaceholder: 'Buscar entradas...',
    
    addPhoto: 'Agregar foto',
    send: 'Enviar',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    
    family: 'Familia',
    work: 'Trabajo',
    finance: 'Finanzas',
    gratitude: 'Gratitud',
    health: 'Salud',
    personalDevelopment: 'Desarrollo personal',
    creativity: 'Creatividad',
    relationships: 'Relaciones',
    
    defaultCard1Title: 'Hoy es un gran momento',
    defaultCard1Description: 'Anota una pequeña victoria: es el primer paso para reconocer tus logros.',
    defaultCard2Title: 'Incluso un pensamiento hace que el día sea significativo',
    defaultCard2Description: 'No tienes que escribir mucho: una frase puede cambiar tu visión del día.',
    defaultCard3Title: 'Anota un momento de gratitud',
    defaultCard3Description: 'Siente la ligereza cuando notes lo bueno en tu vida. Este es el camino a la felicidad.',
    
    connectedToAI: 'Conectado a IA',
    aiHelp: 'IA te ayudará',
    aiHelpDescription: 'Describe tu logro y te ayudaré a estructurar la entrada, elegir una categoría y marcar el progreso',
    
    historyTitle: 'Historial de entradas',
    foundEntries: 'Entradas encontradas',
    filters: 'Filtros',
    
    notifications: 'Notificaciones',
    dailyReminders: 'Recordatorios diarios',
    weeklyReports: 'Informes semanales',
    newAchievements: 'Nuevos logros',
    motivationalMessages: 'Mensajes motivacionales',
    themes: 'Temas',
    security: 'Seguridad y privacidad',
    language: 'Idioma de la aplicación',
    support: 'Soporte',
    
    welcomeTitle: 'Bienvenido',
    selectLanguage: 'Seleccionar idioma',
    diaryName: 'Nombre del diario',
    firstEntry: 'Primera entrada',
    reminders: 'Recordatorios',
  },
  
  de: {
    greeting: 'Hallo',
    todayQuestion: 'Was sind deine Siege heute?',
    
    home: 'Startseite',
    history: 'Geschichte',
    awards: 'Auszeichnungen',
    reviews: 'Bewertungen',
    settings: 'Einstellungen',
    
    inputPlaceholder: 'Beschreibe deinen Hauptgedanken, Moment, Dankbarkeit',
    searchPlaceholder: 'Einträge suchen...',
    
    addPhoto: 'Foto hinzufügen',
    send: 'Senden',
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    
    family: 'Familie',
    work: 'Arbeit',
    finance: 'Finanzen',
    gratitude: 'Dankbarkeit',
    health: 'Gesundheit',
    personalDevelopment: 'Persönliche Entwicklung',
    creativity: 'Kreativität',
    relationships: 'Beziehungen',
    
    defaultCard1Title: 'Heute ist ein großartiger Zeitpunkt',
    defaultCard1Description: 'Schreibe einen kleinen Sieg auf – das ist der erste Schritt, um deine Erfolge zu erkennen.',
    defaultCard2Title: 'Selbst ein Gedanke macht den Tag bedeutungsvoll',
    defaultCard2Description: 'Du musst nicht viel schreiben – ein Satz kann deine Sicht auf den Tag verändern.',
    defaultCard3Title: 'Schreibe einen Moment der Dankbarkeit auf',
    defaultCard3Description: 'Fühle die Leichtigkeit, wenn du das Gute in deinem Leben bemerkst. Das ist der Weg zum Glück.',
    
    connectedToAI: 'Mit KI verbunden',
    aiHelp: 'KI wird helfen',
    aiHelpDescription: 'Beschreibe deine Leistung und ich helfe dir, den Eintrag zu strukturieren, eine Kategorie zu wählen und Fortschritte zu markieren',
    
    historyTitle: 'Eintragshistorie',
    foundEntries: 'Einträge gefunden',
    filters: 'Filter',
    
    notifications: 'Benachrichtigungen',
    dailyReminders: 'Tägliche Erinnerungen',
    weeklyReports: 'Wöchentliche Berichte',
    newAchievements: 'Neue Erfolge',
    motivationalMessages: 'Motivierende Nachrichten',
    themes: 'Themen',
    security: 'Sicherheit und Datenschutz',
    language: 'App-Sprache',
    support: 'Unterstützung',
    
    welcomeTitle: 'Willkommen',
    selectLanguage: 'Sprache auswählen',
    diaryName: 'Tagebuchname',
    firstEntry: 'Erster Eintrag',
    reminders: 'Erinnerungen',
  },
  
  fr: {
    greeting: 'Bonjour',
    todayQuestion: 'Quelles sont tes victoires aujourd\'hui?',
    
    home: 'Accueil',
    history: 'Historique',
    awards: 'Récompenses',
    reviews: 'Avis',
    settings: 'Paramètres',
    
    inputPlaceholder: 'Décris ta pensée principale, moment, gratitude',
    searchPlaceholder: 'Rechercher des entrées...',
    
    addPhoto: 'Ajouter une photo',
    send: 'Envoyer',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    
    family: 'Famille',
    work: 'Travail',
    finance: 'Finances',
    gratitude: 'Gratitude',
    health: 'Santé',
    personalDevelopment: 'Développement personnel',
    creativity: 'Créativité',
    relationships: 'Relations',
    
    defaultCard1Title: 'Aujourd\'hui est un excellent moment',
    defaultCard1Description: 'Note une petite victoire — c\'est le premier pas pour reconnaître tes réalisations.',
    defaultCard2Title: 'Même une pensée rend la journée significative',
    defaultCard2Description: 'Tu n\'as pas besoin d\'écrire beaucoup — une phrase peut changer ta vision de la journée.',
    defaultCard3Title: 'Note un moment de gratitude',
    defaultCard3Description: 'Ressens la légèreté quand tu remarques le bien dans ta vie. C\'est le chemin vers le bonheur.',
    
    connectedToAI: 'Connecté à l\'IA',
    aiHelp: 'L\'IA aidera',
    aiHelpDescription: 'Décris ta réalisation et je t\'aiderai à structurer l\'entrée, choisir une catégorie et marquer les progrès',
    
    historyTitle: 'Historique des entrées',
    foundEntries: 'Entrées trouvées',
    filters: 'Filtres',
    
    notifications: 'Notifications',
    dailyReminders: 'Rappels quotidiens',
    weeklyReports: 'Rapports hebdomadaires',
    newAchievements: 'Nouvelles réalisations',
    motivationalMessages: 'Messages motivants',
    themes: 'Thèmes',
    security: 'Sécurité et confidentialité',
    language: 'Langue de l\'application',
    support: 'Support',
    
    welcomeTitle: 'Bienvenue',
    selectLanguage: 'Sélectionner la langue',
    diaryName: 'Nom du journal',
    firstEntry: 'Première entrée',
    reminders: 'Rappels',
  },
  
  zh: {
    greeting: '你好',
    todayQuestion: '你今天的胜利是什么？',
    
    home: '主页',
    history: '历史',
    awards: '奖励',
    reviews: '评论',
    settings: '设置',
    
    inputPlaceholder: '描述你的主要想法、时刻、感激',
    searchPlaceholder: '搜索条目...',
    
    addPhoto: '添加照片',
    send: '发送',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    
    family: '家庭',
    work: '工作',
    finance: '财务',
    gratitude: '感恩',
    health: '健康',
    personalDevelopment: '个人发展',
    creativity: '创造力',
    relationships: '关系',
    
    defaultCard1Title: '今天是个好时机',
    defaultCard1Description: '记下一个小胜利——这是认识你成就的第一步。',
    defaultCard2Title: '即使一个想法也能让这一天有意义',
    defaultCard2Description: '你不必写很多——一句话就能改变你对这一天的看法。',
    defaultCard3Title: '记下一个感恩的时刻',
    defaultCard3Description: '当你注意到生活中的美好时，感受那份轻松。这是通往幸福的道路。',
    
    connectedToAI: '已连接到AI',
    aiHelp: 'AI会帮助',
    aiHelpDescription: '描述你的成就，我会帮助你组织条目、选择类别并标记进度',
    
    historyTitle: '条目历史',
    foundEntries: '找到的条目',
    filters: '过滤器',
    
    notifications: '通知',
    dailyReminders: '每日提醒',
    weeklyReports: '每周报告',
    newAchievements: '新成就',
    motivationalMessages: '激励信息',
    themes: '主题',
    security: '安全与隐私',
    language: '应用语言',
    support: '支持',
    
    welcomeTitle: '欢迎',
    selectLanguage: '选择语言',
    diaryName: '日记名称',
    firstEntry: '第一条',
    reminders: '提醒',
  },
  
  ja: {
    greeting: 'こんにちは',
    todayQuestion: '今日のあなたの勝利は何ですか？',
    
    home: 'ホーム',
    history: '履歴',
    awards: '賞',
    reviews: 'レビュー',
    settings: '設定',
    
    inputPlaceholder: '主な考え、瞬間、感謝を説明してください',
    searchPlaceholder: 'エントリを検索...',
    
    addPhoto: '写真を追加',
    send: '送信',
    save: '保存',
    cancel: 'キャンセル',
    delete: '削除',
    
    family: '家族',
    work: '仕事',
    finance: '財務',
    gratitude: '感謝',
    health: '健康',
    personalDevelopment: '個人的な成長',
    creativity: '創造性',
    relationships: '関係',
    
    defaultCard1Title: '今日は素晴らしい時間です',
    defaultCard1Description: '小さな勝利を書き留めてください—これはあなたの成果を認識する最初のステップです。',
    defaultCard2Title: '一つの考えでさえ、その日を意味のあるものにします',
    defaultCard2Description: 'たくさん書く必要はありません—一つのフレーズがその日の見方を変えることができます。',
    defaultCard3Title: '感謝の瞬間を書き留めてください',
    defaultCard3Description: 'あなたの人生の中で良いものに気づいたとき、軽さを感じてください。これが幸福への道です。',
    
    connectedToAI: 'AIに接続',
    aiHelp: 'AIが手伝います',
    aiHelpDescription: 'あなたの成果を説明してください。エントリを構造化し、カテゴリを選択し、進捗を示すのを手伝います',
    
    historyTitle: 'エントリ履歴',
    foundEntries: '見つかったエントリ',
    filters: 'フィルター',
    
    notifications: '通知',
    dailyReminders: '毎日のリマインダー',
    weeklyReports: '週次レポート',
    newAchievements: '新しい成果',
    motivationalMessages: 'モチベーションメッセージ',
    themes: 'テーマ',
    security: 'セキュリティとプライバシー',
    language: 'アプリの言語',
    support: 'サポート',
    
    welcomeTitle: 'ようこそ',
    selectLanguage: '言語を選択',
    diaryName: '日記名',
    firstEntry: '最初のエントリ',
    reminders: 'リマインダー',
  },
};

// Хук для получения переводов
export function useTranslations(language: Language = 'ru'): Translations {
  return translations[language] || translations.ru;
}

// Функция для получения перевода категории
export function getCategoryTranslation(category: string, language: Language = 'ru'): string {
  const t = translations[language] || translations.ru;
  const categoryMap: Record<string, string> = {
    'Семья': t.family,
    'Family': t.family,
    'Familia': t.family,
    'Familie': t.family,
    'Famille': t.family,
    '家庭': t.family,
    '家族': t.family,
    
    'Работа': t.work,
    'Work': t.work,
    'Trabajo': t.work,
    'Arbeit': t.work,
    'Travail': t.work,
    '工作': t.work,
    '仕事': t.work,
    
    'Финансы': t.finance,
    'Finance': t.finance,
    'Finanzas': t.finance,
    'Finanzen': t.finance,
    'Finances': t.finance,
    '财务': t.finance,
    '財務': t.finance,
    
    'Благодарность': t.gratitude,
    'Gratitude': t.gratitude,
    'Gratitud': t.gratitude,
    'Dankbarkeit': t.gratitude,
    '感恩': t.gratitude,
    '感謝': t.gratitude,
    
    'Здоровье': t.health,
    'Health': t.health,
    'Salud': t.health,
    'Gesundheit': t.health,
    'Santé': t.health,
    '健康': t.health,
    
    'Личное развитие': t.personalDevelopment,
    'Personal Development': t.personalDevelopment,
    'Desarrollo personal': t.personalDevelopment,
    'Persönliche Entwicklung': t.personalDevelopment,
    'Développement personnel': t.personalDevelopment,
    '个人发展': t.personalDevelopment,
    '個人的な成長': t.personalDevelopment,
    
    'Творчество': t.creativity,
    'Creativity': t.creativity,
    'Creatividad': t.creativity,
    'Kreativität': t.creativity,
    'Créativité': t.creativity,
    '创造力': t.creativity,
    '創造性': t.creativity,
    
    'Отношения': t.relationships,
    'Relationships': t.relationships,
    'Relaciones': t.relationships,
    'Beziehungen': t.relationships,
    'Relations': t.relationships,
    '关系': t.relationships,
    '関係': t.relationships,
  };
  
  return categoryMap[category] || category;
}

