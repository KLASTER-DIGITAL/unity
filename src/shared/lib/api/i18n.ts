import { useState, useEffect } from 'react';

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
  back: string;
  next: string;
  skip: string;
  
  // WelcomeScreen
  alreadyHaveAccount: string;
  
  // AuthScreen
  signIn: string;
  signUp: string;
  signInWith: string;
  signUpWith: string;
  yourEmail: string;
  yourName: string;
  password: string;
  welcomeBack: string;
  createAccount: string;
  notRegisteredYet: string;
  alreadyHaveAccountAuth: string;
  
  // SettingsScreen
  notifications: string;
  dailyReminders: string;
  weeklyReports: string;
  newAchievements: string;
  motivationalMessages: string;
  themes: string;
  security: string;
  language: string;
  support: string;
  appLanguage: string;
  currentLanguage: string;
  changeLanguage: string;
  firstDayOfWeek: string;
  monday: string;
  importData: string;
  contactSupport: string;
  rateApp: string;
  faq: string;
  dangerousZone: string;
  logout: string;
  deleteAllData: string;
  appVersion: string;
  appSubtitle: string;
  
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
  
  // Онбординг
  welcomeTitle: string;
  selectLanguage: string;
  diaryName: string;
  firstEntry: string;
  reminders: string;
}

// Fallback переводы на случай, если Supabase недоступен
const fallbackTranslations: Record<Language, Translations> = {
  ru: {
    greeting: 'Привет!',
    todayQuestion: 'Как прошёл день?',
    home: 'Главная',
    history: 'История',
    awards: 'Награды',
    reviews: 'Отчёты',
    settings: 'Настройки',
    inputPlaceholder: 'Расскажите о своём дне...',
    searchPlaceholder: 'Поиск записей...',
    addPhoto: 'Добавить фото',
    send: 'Отправить',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    back: 'Назад',
    next: 'Далее',
    skip: 'Пропустить',
    alreadyHaveAccount: 'У меня уже есть аккаунт',
    signIn: 'Войти',
    signUp: 'Регистрация',
    signInWith: 'Войти через',
    signUpWith: 'Регистрация через',
    yourEmail: 'Ваш email',
    yourName: 'Ваше имя',
    password: 'Пароль',
    welcomeBack: 'Добро пожаловать!',
    createAccount: 'Создать аккаунт',
    notRegisteredYet: 'Еще не зарегистрированы?',
    alreadyHaveAccountAuth: 'Уже есть аккаунт?',
    notifications: 'Уведомления',
    dailyReminders: 'Ежедневные напоминания',
    weeklyReports: 'Еженедельные отчёты',
    newAchievements: 'Новые достижения',
    motivationalMessages: 'Мотивационные сообщения',
    themes: 'Темы',
    security: 'Безопасность',
    language: 'Язык',
    support: 'Поддержка',
    appLanguage: 'Язык приложения',
    currentLanguage: 'Текущий язык',
    changeLanguage: 'Изменить язык',
    firstDayOfWeek: 'Первый день недели',
    monday: 'Понедельник',
    importData: 'Импорт данных',
    contactSupport: 'Связаться с поддержкой',
    rateApp: 'Оценить приложение',
    faq: 'Часто задаваемые вопросы',
    dangerousZone: 'Опасная зона',
    logout: 'Выйти',
    deleteAllData: 'Удалить все данные',
    appVersion: 'Версия приложения',
    appSubtitle: 'Дневник Достижений',
    family: 'Семья',
    work: 'Работа',
    finance: 'Финансы',
    gratitude: 'Благодарность',
    health: 'Здоровье',
    personalDevelopment: 'Личное развитие',
    creativity: 'Творчество',
    relationships: 'Отношения',
    defaultCard1Title: 'Отличный день!',
    defaultCard1Description: 'Вы сделали важный шаг к своим целям',
    defaultCard2Title: 'Продолжайте!',
    defaultCard2Description: 'Каждый день приближает вас к успеху',
    defaultCard3Title: 'Вы молодец!',
    defaultCard3Description: 'Ваши усилия не останутся незамеченными',
    connectedToAI: 'Подключено к ИИ',
    aiHelp: 'Помощь ИИ',
    aiHelpDescription: 'ИИ поможет проанализировать ваши записи',
    historyTitle: 'История записей',
    foundEntries: 'Найдено записей',
    filters: 'Фильтры',
    welcomeTitle: 'Создавай дневник побед',
    selectLanguage: 'Выберите язык',
    diaryName: 'Название дневника',
    firstEntry: 'Первая запись',
    reminders: 'Напоминания'
  },
  en: {
    greeting: 'Hello!',
    todayQuestion: 'How was your day?',
    home: 'Home',
    history: 'History',
    awards: 'Awards',
    reviews: 'Reports',
    settings: 'Settings',
    inputPlaceholder: 'Tell us about your day...',
    searchPlaceholder: 'Search entries...',
    addPhoto: 'Add Photo',
    send: 'Send',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    back: 'Back',
    next: 'Next',
    skip: 'Skip',
    alreadyHaveAccount: 'I already have an account',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signInWith: 'Sign in with',
    signUpWith: 'Sign up with',
    yourEmail: 'Your email',
    yourName: 'Your name',
    password: 'Password',
    welcomeBack: 'Welcome back!',
    createAccount: 'Create account',
    notRegisteredYet: 'Not registered yet?',
    alreadyHaveAccountAuth: 'Already have an account?',
    notifications: 'Notifications',
    dailyReminders: 'Daily reminders',
    weeklyReports: 'Weekly reports',
    newAchievements: 'New achievements',
    motivationalMessages: 'Motivational messages',
    themes: 'Themes',
    security: 'Security',
    language: 'Language',
    support: 'Support',
    appLanguage: 'App language',
    currentLanguage: 'Current language',
    changeLanguage: 'Change language',
    firstDayOfWeek: 'First day of week',
    monday: 'Monday',
    importData: 'Import data',
    contactSupport: 'Contact support',
    rateApp: 'Rate app',
    faq: 'FAQ',
    dangerousZone: 'Dangerous zone',
    logout: 'Logout',
    deleteAllData: 'Delete all data',
    appVersion: 'App version',
    appSubtitle: 'Achievement Diary',
    family: 'Family',
    work: 'Work',
    finance: 'Finance',
    gratitude: 'Gratitude',
    health: 'Health',
    personalDevelopment: 'Personal Development',
    creativity: 'Creativity',
    relationships: 'Relationships',
    defaultCard1Title: 'Great day!',
    defaultCard1Description: 'You made an important step towards your goals',
    defaultCard2Title: 'Keep going!',
    defaultCard2Description: 'Every day brings you closer to success',
    defaultCard3Title: 'You are great!',
    defaultCard3Description: 'Your efforts will not go unnoticed',
    connectedToAI: 'Connected to AI',
    aiHelp: 'AI Help',
    aiHelpDescription: 'AI will help analyze your entries',
    historyTitle: 'Entry History',
    foundEntries: 'Found entries',
    filters: 'Filters',
    welcomeTitle: 'Create a victory diary',
    selectLanguage: 'Select language',
    diaryName: 'Diary name',
    firstEntry: 'First entry',
    reminders: 'Reminders'
  },
  es: {
    greeting: '¡Hola!',
    todayQuestion: '¿Cómo fue tu día?',
    home: 'Inicio',
    history: 'Historial',
    awards: 'Premios',
    reviews: 'Informes',
    settings: 'Configuración',
    inputPlaceholder: 'Cuéntanos sobre tu día...',
    searchPlaceholder: 'Buscar entradas...',
    addPhoto: 'Agregar foto',
    send: 'Enviar',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    back: 'Atrás',
    next: 'Siguiente',
    skip: 'Omitir',
    alreadyHaveAccount: 'Ya tengo una cuenta',
    signIn: 'Iniciar sesión',
    signUp: 'Registrarse',
    signInWith: 'Iniciar sesión con',
    signUpWith: 'Registrarse con',
    yourEmail: 'Tu email',
    yourName: 'Tu nombre',
    password: 'Contraseña',
    welcomeBack: '¡Bienvenido!',
    createAccount: 'Crear cuenta',
    notRegisteredYet: '¿Aún no estás registrado?',
    alreadyHaveAccountAuth: '¿Ya tienes una cuenta?',
    notifications: 'Notificaciones',
    dailyReminders: 'Recordatorios diarios',
    weeklyReports: 'Informes semanales',
    newAchievements: 'Nuevos logros',
    motivationalMessages: 'Mensajes motivacionales',
    themes: 'Temas',
    security: 'Seguridad',
    language: 'Idioma',
    support: 'Soporte',
    appLanguage: 'Idioma de la app',
    currentLanguage: 'Idioma actual',
    changeLanguage: 'Cambiar idioma',
    firstDayOfWeek: 'Primer día de la semana',
    monday: 'Lunes',
    importData: 'Importar datos',
    contactSupport: 'Contactar soporte',
    rateApp: 'Calificar app',
    faq: 'Preguntas frecuentes',
    dangerousZone: 'Zona peligrosa',
    logout: 'Cerrar sesión',
    deleteAllData: 'Eliminar todos los datos',
    appVersion: 'Versión de la app',
    appSubtitle: 'Diario de Logros',
    family: 'Familia',
    work: 'Trabajo',
    finance: 'Finanzas',
    gratitude: 'Gratitud',
    health: 'Salud',
    personalDevelopment: 'Desarrollo personal',
    creativity: 'Creatividad',
    relationships: 'Relaciones',
    defaultCard1Title: '¡Excelente día!',
    defaultCard1Description: 'Diste un paso importante hacia tus objetivos',
    defaultCard2Title: '¡Continúa!',
    defaultCard2Description: 'Cada día te acerca más al éxito',
    defaultCard3Title: '¡Eres genial!',
    defaultCard3Description: 'Tus esfuerzos no pasarán desapercibidos',
    connectedToAI: 'Conectado a IA',
    aiHelp: 'Ayuda de IA',
    aiHelpDescription: 'La IA te ayudará a analizar tus entradas',
    historyTitle: 'Historial de entradas',
    foundEntries: 'Entradas encontradas',
    filters: 'Filtros',
    welcomeTitle: 'Crea un diario de victorias',
    selectLanguage: 'Seleccionar idioma',
    diaryName: 'Nombre del diario',
    firstEntry: 'Primera entrada',
    reminders: 'Recordatorios'
  },
  de: {
    greeting: 'Hallo!',
    todayQuestion: 'Wie war dein Tag?',
    home: 'Startseite',
    history: 'Verlauf',
    awards: 'Auszeichnungen',
    reviews: 'Berichte',
    settings: 'Einstellungen',
    inputPlaceholder: 'Erzähl uns von deinem Tag...',
    searchPlaceholder: 'Einträge suchen...',
    addPhoto: 'Foto hinzufügen',
    send: 'Senden',
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    back: 'Zurück',
    next: 'Weiter',
    skip: 'Überspringen',
    alreadyHaveAccount: 'Ich habe bereits ein Konto',
    signIn: 'Anmelden',
    signUp: 'Registrieren',
    signInWith: 'Anmelden mit',
    signUpWith: 'Registrieren mit',
    yourEmail: 'Deine E-Mail',
    yourName: 'Dein Name',
    password: 'Passwort',
    welcomeBack: 'Willkommen zurück!',
    createAccount: 'Konto erstellen',
    notRegisteredYet: 'Noch nicht registriert?',
    alreadyHaveAccountAuth: 'Hast du bereits ein Konto?',
    notifications: 'Benachrichtigungen',
    dailyReminders: 'Tägliche Erinnerungen',
    weeklyReports: 'Wöchentliche Berichte',
    newAchievements: 'Neue Erfolge',
    motivationalMessages: 'Motivationsnachrichten',
    themes: 'Themen',
    security: 'Sicherheit',
    language: 'Sprache',
    support: 'Support',
    appLanguage: 'App-Sprache',
    currentLanguage: 'Aktuelle Sprache',
    changeLanguage: 'Sprache ändern',
    firstDayOfWeek: 'Erster Tag der Woche',
    monday: 'Montag',
    importData: 'Daten importieren',
    contactSupport: 'Support kontaktieren',
    rateApp: 'App bewerten',
    faq: 'Häufige Fragen',
    dangerousZone: 'Gefahrenzone',
    logout: 'Abmelden',
    deleteAllData: 'Alle Daten löschen',
    appVersion: 'App-Version',
    appSubtitle: 'Erfolgs-Tagebuch',
    family: 'Familie',
    work: 'Arbeit',
    finance: 'Finanzen',
    gratitude: 'Dankbarkeit',
    health: 'Gesundheit',
    personalDevelopment: 'Persönliche Entwicklung',
    creativity: 'Kreativität',
    relationships: 'Beziehungen',
    defaultCard1Title: 'Großartiger Tag!',
    defaultCard1Description: 'Du hast einen wichtigen Schritt zu deinen Zielen gemacht',
    defaultCard2Title: 'Weiter so!',
    defaultCard2Description: 'Jeder Tag bringt dich dem Erfolg näher',
    defaultCard3Title: 'Du bist großartig!',
    defaultCard3Description: 'Deine Anstrengungen werden nicht unbemerkt bleiben',
    connectedToAI: 'Mit KI verbunden',
    aiHelp: 'KI-Hilfe',
    aiHelpDescription: 'KI hilft dir beim Analysieren deiner Einträge',
    historyTitle: 'Einträge-Verlauf',
    foundEntries: 'Gefundene Einträge',
    filters: 'Filter',
    welcomeTitle: 'Erstelle ein Sieges-Tagebuch',
    selectLanguage: 'Sprache auswählen',
    diaryName: 'Tagebuch-Name',
    firstEntry: 'Erster Eintrag',
    reminders: 'Erinnerungen'
  },
  fr: {
    greeting: 'Bonjour!',
    todayQuestion: 'Comment s\'est passé votre journée?',
    home: 'Accueil',
    history: 'Historique',
    awards: 'Récompenses',
    reviews: 'Rapports',
    settings: 'Paramètres',
    inputPlaceholder: 'Parlez-nous de votre journée...',
    searchPlaceholder: 'Rechercher des entrées...',
    addPhoto: 'Ajouter une photo',
    send: 'Envoyer',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    back: 'Retour',
    next: 'Suivant',
    skip: 'Ignorer',
    alreadyHaveAccount: 'J\'ai déjà un compte',
    signIn: 'Se connecter',
    signUp: 'S\'inscrire',
    signInWith: 'Se connecter avec',
    signUpWith: 'S\'inscrire avec',
    yourEmail: 'Votre email',
    yourName: 'Votre nom',
    password: 'Mot de passe',
    welcomeBack: 'Bon retour!',
    createAccount: 'Créer un compte',
    notRegisteredYet: 'Pas encore inscrit?',
    alreadyHaveAccountAuth: 'Vous avez déjà un compte?',
    notifications: 'Notifications',
    dailyReminders: 'Rappels quotidiens',
    weeklyReports: 'Rapports hebdomadaires',
    newAchievements: 'Nouveaux succès',
    motivationalMessages: 'Messages motivationnels',
    themes: 'Thèmes',
    security: 'Sécurité',
    language: 'Langue',
    support: 'Support',
    appLanguage: 'Langue de l\'app',
    currentLanguage: 'Langue actuelle',
    changeLanguage: 'Changer de langue',
    firstDayOfWeek: 'Premier jour de la semaine',
    monday: 'Lundi',
    importData: 'Importer des données',
    contactSupport: 'Contacter le support',
    rateApp: 'Noter l\'app',
    faq: 'FAQ',
    dangerousZone: 'Zone dangereuse',
    logout: 'Se déconnecter',
    deleteAllData: 'Supprimer toutes les données',
    appVersion: 'Version de l\'app',
    appSubtitle: 'Journal des Succès',
    family: 'Famille',
    work: 'Travail',
    finance: 'Finances',
    gratitude: 'Gratitude',
    health: 'Santé',
    personalDevelopment: 'Développement personnel',
    creativity: 'Créativité',
    relationships: 'Relations',
    defaultCard1Title: 'Excellente journée!',
    defaultCard1Description: 'Vous avez fait un pas important vers vos objectifs',
    defaultCard2Title: 'Continuez!',
    defaultCard2Description: 'Chaque jour vous rapproche du succès',
    defaultCard3Title: 'Vous êtes formidable!',
    defaultCard3Description: 'Vos efforts ne passeront pas inaperçus',
    connectedToAI: 'Connecté à l\'IA',
    aiHelp: 'Aide IA',
    aiHelpDescription: 'L\'IA vous aidera à analyser vos entrées',
    historyTitle: 'Historique des entrées',
    foundEntries: 'Entrées trouvées',
    filters: 'Filtres',
    welcomeTitle: 'Créez un journal de victoires',
    selectLanguage: 'Sélectionner la langue',
    diaryName: 'Nom du journal',
    firstEntry: 'Première entrée',
    reminders: 'Rappels'
  },
  zh: {
    greeting: '你好！',
    todayQuestion: '今天过得怎么样？',
    home: '首页',
    history: '历史',
    awards: '奖项',
    reviews: '报告',
    settings: '设置',
    inputPlaceholder: '告诉我们你的一天...',
    searchPlaceholder: '搜索条目...',
    addPhoto: '添加照片',
    send: '发送',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    back: '返回',
    next: '下一步',
    skip: '跳过',
    alreadyHaveAccount: '我已有账户',
    signIn: '登录',
    signUp: '注册',
    signInWith: '使用以下方式登录',
    signUpWith: '使用以下方式注册',
    yourEmail: '您的邮箱',
    yourName: '您的姓名',
    password: '密码',
    welcomeBack: '欢迎回来！',
    createAccount: '创建账户',
    notRegisteredYet: '还没有注册？',
    alreadyHaveAccountAuth: '已有账户？',
    notifications: '通知',
    dailyReminders: '每日提醒',
    weeklyReports: '周报',
    newAchievements: '新成就',
    motivationalMessages: '励志消息',
    themes: '主题',
    security: '安全',
    language: '语言',
    support: '支持',
    appLanguage: '应用语言',
    currentLanguage: '当前语言',
    changeLanguage: '更改语言',
    firstDayOfWeek: '一周的第一天',
    monday: '星期一',
    importData: '导入数据',
    contactSupport: '联系支持',
    rateApp: '评价应用',
    faq: '常见问题',
    dangerousZone: '危险区域',
    logout: '退出登录',
    deleteAllData: '删除所有数据',
    appVersion: '应用版本',
    appSubtitle: '成就日记',
    family: '家庭',
    work: '工作',
    finance: '财务',
    gratitude: '感恩',
    health: '健康',
    personalDevelopment: '个人发展',
    creativity: '创造力',
    relationships: '关系',
    defaultCard1Title: '美好的一天！',
    defaultCard1Description: '您朝着目标迈出了重要一步',
    defaultCard2Title: '继续加油！',
    defaultCard2Description: '每一天都让您更接近成功',
    defaultCard3Title: '您很棒！',
    defaultCard3Description: '您的努力不会被忽视',
    connectedToAI: '已连接AI',
    aiHelp: 'AI帮助',
    aiHelpDescription: 'AI将帮助分析您的条目',
    historyTitle: '条目历史',
    foundEntries: '找到的条目',
    filters: '过滤器',
    welcomeTitle: '创建胜利日记',
    selectLanguage: '选择语言',
    diaryName: '日记名称',
    firstEntry: '第一条记录',
    reminders: '提醒'
  },
  ja: {
    greeting: 'こんにちは！',
    todayQuestion: '今日はどうでしたか？',
    home: 'ホーム',
    history: '履歴',
    awards: '受賞',
    reviews: 'レポート',
    settings: '設定',
    inputPlaceholder: '今日のことを教えてください...',
    searchPlaceholder: 'エントリを検索...',
    addPhoto: '写真を追加',
    send: '送信',
    save: '保存',
    cancel: 'キャンセル',
    delete: '削除',
    back: '戻る',
    next: '次へ',
    skip: 'スキップ',
    alreadyHaveAccount: 'アカウントをお持ちです',
    signIn: 'サインイン',
    signUp: 'サインアップ',
    signInWith: 'でサインイン',
    signUpWith: 'でサインアップ',
    yourEmail: 'あなたのメール',
    yourName: 'あなたの名前',
    password: 'パスワード',
    welcomeBack: 'おかえりなさい！',
    createAccount: 'アカウントを作成',
    notRegisteredYet: 'まだ登録していませんか？',
    alreadyHaveAccountAuth: 'すでにアカウントをお持ちですか？',
    notifications: '通知',
    dailyReminders: '日次リマインダー',
    weeklyReports: '週次レポート',
    newAchievements: '新しい成果',
    motivationalMessages: 'モチベーションメッセージ',
    themes: 'テーマ',
    security: 'セキュリティ',
    language: '言語',
    support: 'サポート',
    appLanguage: 'アプリ言語',
    currentLanguage: '現在の言語',
    changeLanguage: '言語を変更',
    firstDayOfWeek: '週の最初の日',
    monday: '月曜日',
    importData: 'データをインポート',
    contactSupport: 'サポートに連絡',
    rateApp: 'アプリを評価',
    faq: 'よくある質問',
    dangerousZone: '危険ゾーン',
    logout: 'ログアウト',
    deleteAllData: 'すべてのデータを削除',
    appVersion: 'アプリバージョン',
    appSubtitle: '成果日記',
    family: '家族',
    work: '仕事',
    finance: '財務',
    gratitude: '感謝',
    health: '健康',
    personalDevelopment: '個人の成長',
    creativity: '創造性',
    relationships: '人間関係',
    defaultCard1Title: '素晴らしい日！',
    defaultCard1Description: '目標に向けて重要な一歩を踏み出しました',
    defaultCard2Title: '続けてください！',
    defaultCard2Description: '毎日が成功に近づきます',
    defaultCard3Title: 'あなたは素晴らしい！',
    defaultCard3Description: 'あなたの努力は見過ごされません',
    connectedToAI: 'AIに接続済み',
    aiHelp: 'AIヘルプ',
    aiHelpDescription: 'AIがエントリの分析をサポートします',
    historyTitle: 'エントリ履歴',
    foundEntries: '見つかったエントリ',
    filters: 'フィルター',
    welcomeTitle: '勝利の日記を作成',
    selectLanguage: '言語を選択',
    diaryName: '日記の名前',
    firstEntry: '最初のエントリ',
    reminders: 'リマインダー'
  }
};

// Хук для получения переводов
export function useTranslations(language: Language = 'ru'): Translations {
  const [translations, setTranslations] = useState<Translations>(fallbackTranslations[language]);
  const [_isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoading(true);
        // const dynamicTranslations = await translationsApi.getTranslations(language);
        // Заглушка - будет заменено на работу с Edge Function
        
        // Используем fallback переводы пока не реализован Edge Function
        setTranslations(fallbackTranslations[language]);
      } catch (error) {
        console.error('Error loading translations:', error);
        // Используем fallback переводы в случае ошибки
        setTranslations(fallbackTranslations[language]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  return translations;
}

// Функция для получения перевода категории
export function getCategoryTranslation(category: string, language: Language = 'ru'): string {
  const translations = fallbackTranslations[language];
  
  switch (category) {
    case 'family': return translations.family;
    case 'work': return translations.work;
    case 'finance': return translations.finance;
    case 'gratitude': return translations.gratitude;
    case 'health': return translations.health;
    case 'personalDevelopment': return translations.personalDevelopment;
    case 'creativity': return translations.creativity;
    case 'relationships': return translations.relationships;
    default: return category;
  }
}