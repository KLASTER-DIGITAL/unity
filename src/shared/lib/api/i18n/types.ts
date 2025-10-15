// TypeScript типы для i18n системы

export type Language = 'ru' | 'en' | 'es' | 'de' | 'fr' | 'zh' | 'ja';

export interface LanguageConfig {
  code: string;
  name: string;
  native_name: string;
  flag: string;
  is_active: boolean;
  is_rtl?: boolean;
}

export interface TranslationCache {
  language: string;
  translations: Record<string, string>;
  version: string;
  lastUpdated: string;
  etag?: string;
  checksum?: string;
}

export interface CacheConfig {
  maxAge: number; // Время жизни кэша в мс
  maxSize: number; // Максимальный размер кэша в байтах
  compressionEnabled: boolean;
}

export interface I18nState {
  currentLanguage: string;
  isLoading: boolean;
  error: string | null;
  cache: Map<string, TranslationCache>;
  fallbackLanguage: string;
  isLoaded: boolean;
}

export interface LoadTranslationsOptions {
  language: string;
  fallbackLanguage?: string;
  forceRefresh?: boolean;
  timeout?: number;
  retryCount?: number;
}

export interface TranslationResult {
  translations: Record<string, string>;
  language: string;
  usedFallback: boolean;
  fromCache: boolean;
}

export interface AutoTranslateOptions {
  sourceLanguage: string;
  targetLanguages: string[];
  batchSize: number;
  context: string;
  preserveFormatting: boolean;
}

export interface AutoTranslationResult {
  key: string;
  originalText: string;
  translatedText: string;
  confidence: number;
  needsReview: boolean;
}

export interface MissingTranslationReport {
  key: string;
  language: string;
  context?: string;
  userAgent: string;
  timestamp: string;
}

export interface TranslationAnalytics {
  languageUsage: Record<string, number>;
  missingKeys: Array<{
    key: string;
    language: string;
    frequency: number;
  }>;
  loadTimes: Array<{
    language: string;
    duration: number;
    source: 'cache' | 'api' | 'fallback';
  }>;
}

export interface TranslationError {
  type: 'api' | 'cache' | 'parsing' | 'network';
  language: string;
  key?: string;
  context: string;
  userAgent: string;
  timestamp: string;
  stack?: string;
}

// Интерфейс для переводов (для совместимости с текущей системой)
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
  start_button: string;
  
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
  
  // Новые ключи для улучшенной системы
  select_language: string;
  app_language_description: string;
  loading_translations: string;
  translation_error: string;
  retry: string;
  cancel_button: string;
  auto_translate: string;
  translation_progress: string;
  untranslated_keys: string;
  translation_complete: string;
  translation_failed: string;
}