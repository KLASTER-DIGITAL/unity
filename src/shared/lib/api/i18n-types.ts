/**
 * i18n Type Definitions
 *
 * Type definitions for internationalization system.
 * Defines supported languages and translation interface.
 *
 * @module i18n-types
 */

// Supported languages
export type Language = 'ru' | 'en' | 'es' | 'de' | 'fr' | 'zh' | 'ja';

// Translation keys interface
export type Translations = {
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
};
