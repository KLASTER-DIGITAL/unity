/**
 * Types for Translations Management
 */

export type Translation = {
	translation_key: string;
	lang_code: string;
	translation_value: string;
	category?: string;
	created_at?: string;
	updated_at?: string;
};

export type Language = {
	code: string;
	name: string;
	native_name: string;
	enabled: boolean;
};

export type MissingTranslation = {
	key: string;
	languages: string[];
};

export type TranslationsManagementTabProps = {
	initialLanguage?: string;
};

export type TranslationStats = {
	totalKeys: number;
	totalTranslations: number;
	missingCount: number;
	completeness: number;
};
