/**
 * Types for Translations Management
 */

export interface Translation {
  translation_key: string;
  lang_code: string;
  translation_value: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Language {
  code: string;
  name: string;
  native_name: string;
  enabled: boolean;
}

export interface MissingTranslation {
  key: string;
  languages: string[];
}

export interface TranslationsManagementTabProps {
  initialLanguage?: string;
}

export interface TranslationStats {
  totalKeys: number;
  totalTranslations: number;
  missingCount: number;
  completeness: number;
}

