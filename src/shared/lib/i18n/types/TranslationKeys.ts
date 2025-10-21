/**
 * Auto-generated TypeScript types for translation keys
 * 
 * This file is generated from the database translation keys.
 * DO NOT EDIT MANUALLY - use the generate-translation-types script instead.
 * 
 * Last updated: 2025-10-20
 * Total keys: 165
 */

/**
 * All available translation keys in the system
 * This provides autocomplete and type safety when using t() function
 */
export type TranslationKey =
  // Common
  | 'error_loading_stats'
  | 'failed_load_cards'
  | 'loading'

  // Onboarding
  | 'auth.welcomeBack'
  | 'welcome.alreadyHaveAccount'
  | 'welcome.start'
  | 'welcome.subtitle'
  | 'welcome.title'
  | 'welcomeBack'
  | 'welcomeTitle'

  // Auth
  | 'auth.alreadyHaveAccount'
  | 'auth.back'
  | 'auth.createAccount'
  | 'auth.email'
  | 'auth.name'
  | 'auth.notRegisteredYet'
  | 'auth.password'
  | 'auth.signIn'
  | 'auth.signUp'
  | 'password'

  // Navigation
  | 'history'
  | 'home'
  | 'settings'

  // Home
  | 'motivationalMessages'

  // History
  | 'create_first_entry'
  | 'entries_count'
  | 'entry_text'
  | 'entry_text_required'
  | 'filters'
  | 'no_entries_found'
  | 'searchPlaceholder'
  | 'total_entries'
  | 'try_change_filters'

  // Achievements
  | 'achievement_master'
  | 'achievement_saved_desc'
  | 'achievement_saved_title'
  | 'analysis_achievements'
  | 'badge_beginner'
  | 'badge_consistency'
  | 'badge_legend'
  | 'describe_achievement'
  | 'level'
  | 'milestone_10_entries'
  | 'milestone_50_entries'
  | 'milestone_month_streak'
  | 'milestone_week_streak'

  // Reports
  | 'weeklyReports'

  // Settings
  | 'admin.languages'
  | 'admin.settings'
  | 'language'
  | 'language_description'
  | 'loading_languages'
  | 'notifications'
  | 'premium_theme'
  | 'push_notifications'
  | 'push_notifications_desc'
  | 'pwa_settings'
  | 'pwa_settings_desc'
  | 'select_language'
  | 'settings.language'
  | 'settings.logout'
  | 'settings.notifications'
  | 'settings.security'
  | 'settings.support'
  | 'settings.theme'
  | 'settings.title'
  | 'themes'

  // Admin
  | 'admin_ai_analytics'
  | 'admin_overview'
  | 'admin_panel'
  | 'admin_settings'
  | 'admin_subscriptions'
  | 'admin_users'

  // Categories
  | 'creativity'
  | 'family'
  | 'finance'
  | 'health'
  | 'relationships'
  | 'work'

  // Other
  | 'active_users'
  | 'addPhoto'
  | 'admin.overview'
  | 'admin.users'
  | 'ai_reviews'
  | 'aiHelp'
  | 'aiHelpDescription'
  | 'alreadyHaveAccount'
  | 'alreadyHaveAccountAuth'
  | 'appLanguage'
  | 'appSubtitle'
  | 'appVersion'
  | 'awards'
  | 'back'
  | 'cancel'
  | 'changeLanguage'
  | 'check_internet_connection'
  | 'connectedToAI'
  | 'contactSupport'
  | 'conversion'
  | 'createAccount'
  | 'currentLanguage'
  | 'dailyReminders'
  | 'dangerousZone'
  | 'database_backup'
  | 'database_backup_desc'
  | 'defaultCard1Description'
  | 'defaultCard1Title'
  | 'defaultCard2Description'
  | 'defaultCard2Title'
  | 'defaultCard3Description'
  | 'defaultCard3Title'
  | 'delete'
  | 'deleteAllData'
  | 'diaryName'
  | 'faq'
  | 'firstDayOfWeek'
  | 'firstEntry'
  | 'foundEntries'
  | 'gratitude'
  | 'greeting'
  | 'historyTitle'
  | 'importData'
  | 'inputPlaceholder'
  | 'logout'
  | 'monday'
  | 'month'
  | 'mood'
  | 'new_today'
  | 'newAchievements'
  | 'next'
  | 'notRegisteredYet'
  | 'of_all'
  | 'of_all_users'
  | 'per_active_user'
  | 'personalDevelopment'
  | 'premium_subscriptions'
  | 'pwa_installs'
  | 'quarter'
  | 'quick_actions'
  | 'quick_actions_desc'
  | 'rateApp'
  | 'reminders'
  | 'reviews'
  | 'save'
  | 'security'
  | 'selectLanguage'
  | 'send'
  | 'signIn'
  | 'signInWith'
  | 'signUp'
  | 'signUpWith'
  | 'skip'
  | 'startButton'
  | 'subscription_management'
  | 'subscription_management_desc'
  | 'subtitle'
  | 'support'
  | 'todayQuestion'
  | 'total_revenue'
  | 'total_users'
  | 'user_management'
  | 'user_management_desc'
  | 'week'
  | 'yourEmail'
  | 'yourName';


/**
 * Translation function type with autocomplete support
 */
export type TranslationFunction = (key: TranslationKey, fallback?: string) => string;

/**
 * Translations object type (key-value pairs)
 */
export type Translations = Partial<Record<TranslationKey, string>>;

/**
 * Language code type
 */
export type LanguageCode = 'de' | 'en' | 'es' | 'fr' | 'ja' | 'ka' | 'ru' | 'zh';

/**
 * Language object type
 */
export interface Language {
  id?: string;
  code: LanguageCode;
  name: string;
  native_name: string;
  flag: string;
  is_active?: boolean;
  enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Translation entry in database
 */
export interface TranslationEntry {
  id?: string;
  translation_key: TranslationKey;
  lang_code: LanguageCode;
  translation_value: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Translation cache entry
 */
export interface TranslationCacheEntry {
  translations: Translations;
  timestamp: number;
  checksum: string;
}

/**
 * Translation context for provider
 */
export interface TranslationContextValue {
  t: TranslationFunction;
  currentLanguage: LanguageCode;
  changeLanguage: (language: LanguageCode) => Promise<void>;
  isLoaded: boolean;
  availableLanguages: Language[];
}
