/**
 * Script to generate TypeScript types from translation keys in Supabase
 *
 * Usage: npm run i18n:generate-types
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_ANON_KEY) {
  console.error('❌ VITE_SUPABASE_ANON_KEY environment variable is required');
  console.error('💡 Make sure .env file exists with VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface TranslationKey {
  translation_key: string;
}

interface Language {
  code: string;
  name: string;
  native_name: string;
}

async function generateTranslationTypes() {
  console.log('🔄 Fetching translation keys from Supabase...');

  // Fetch all unique translation keys (using Russian as base)
  const { data: keys, error: keysError } = await supabase
    .from('translations')
    .select('translation_key')
    .eq('lang_code', 'ru')
    .order('translation_key');

  if (keysError) {
    console.error('❌ Error fetching translation keys:', keysError);
    process.exit(1);
  }

  // Fetch all languages
  const { data: languages, error: langsError } = await supabase
    .from('languages')
    .select('code, name, native_name')
    .eq('is_active', true)
    .order('code');

  if (langsError) {
    console.error('❌ Error fetching languages:', langsError);
    process.exit(1);
  }

  const uniqueKeys = [...new Set(keys?.map(k => k.translation_key) || [])];
  const languageCodes = languages?.map(l => l.code) || [];

  console.log(`✅ Found ${uniqueKeys.length} translation keys`);
  console.log(`✅ Found ${languageCodes.length} languages: ${languageCodes.join(', ')}`);

  // Group keys by category (based on naming convention)
  const categorizedKeys = categorizeKeys(uniqueKeys);

  // Generate TypeScript file content
  const fileContent = generateTypeScriptFile(categorizedKeys, languageCodes);

  // Write to file
  const outputPath = path.join(process.cwd(), 'src/shared/lib/i18n/types/TranslationKeys.ts');
  fs.writeFileSync(outputPath, fileContent, 'utf-8');

  console.log(`✅ Generated TypeScript types at: ${outputPath}`);
  console.log(`📊 Total keys: ${uniqueKeys.length}`);
  console.log(`📊 Categories: ${Object.keys(categorizedKeys).length}`);
}

function categorizeKeys(keys: string[]): Record<string, string[]> {
  const categories: Record<string, string[]> = {
    common: [],
    onboarding: [],
    auth: [],
    navigation: [],
    home: [],
    history: [],
    achievements: [],
    reports: [],
    settings: [],
    admin: [],
    categories: [],
    other: []
  };

  keys.forEach(key => {
    if (key.startsWith('admin_')) {
      categories.admin.push(key);
    } else if (key.includes('onboarding') || key.includes('welcome') || key.includes('diary_')) {
      categories.onboarding.push(key);
    } else if (key.includes('sign_') || key.includes('auth') || key.includes('password') || key.includes('email')) {
      categories.auth.push(key);
    } else if (['home', 'history', 'achievements', 'reports', 'settings'].includes(key)) {
      categories.navigation.push(key);
    } else if (key.includes('achievement') || key.includes('milestone') || key.includes('badge') || key.includes('level')) {
      categories.achievements.push(key);
    } else if (key.includes('report') || key.includes('weekly') || key.includes('monthly') || key.includes('yearly')) {
      categories.reports.push(key);
    } else if (key.includes('setting') || key.includes('profile') || key.includes('language') || key.includes('theme') || key.includes('notification')) {
      categories.settings.push(key);
    } else if (key.includes('entry') || key.includes('entries') || key.includes('filter') || key.includes('search')) {
      categories.history.push(key);
    } else if (key.includes('morning') || key.includes('afternoon') || key.includes('evening') || key.includes('night') || key.includes('motivation') || key.includes('recent')) {
      categories.home.push(key);
    } else if (['family', 'work', 'finance', 'health', 'education', 'hobby', 'travel', 'sport', 'creativity', 'relationships', 'career', 'personal_growth', 'other'].includes(key)) {
      categories.categories.push(key);
    } else if (key.includes('loading') || key.includes('error') || key.includes('success') || key.includes('failed')) {
      categories.common.push(key);
    } else {
      categories.other.push(key);
    }
  });

  // Remove empty categories
  Object.keys(categories).forEach(cat => {
    if (categories[cat].length === 0) {
      delete categories[cat];
    }
  });

  return categories;
}

function generateTypeScriptFile(categorizedKeys: Record<string, string[]>, languageCodes: string[]): string {
  const now = new Date().toISOString().split('T')[0];
  
  let content = `/**
 * Auto-generated TypeScript types for translation keys
 * 
 * This file is generated from the database translation keys.
 * DO NOT EDIT MANUALLY - use the generate-translation-types script instead.
 * 
 * Last updated: ${now}
 * Total keys: ${Object.values(categorizedKeys).flat().length}
 */

/**
 * All available translation keys in the system
 * This provides autocomplete and type safety when using t() function
 */
export type TranslationKey =\n`;

  // Add categorized keys
  Object.entries(categorizedKeys).forEach(([category, keys], categoryIndex) => {
    content += `  // ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
    keys.forEach((key, index) => {
      const isLast = categoryIndex === Object.keys(categorizedKeys).length - 1 && index === keys.length - 1;
      content += `  | '${key}'${isLast ? ';' : ''}\n`;
    });
    content += '\n';
  });

  // Add utility types
  content += `
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
export type LanguageCode = ${languageCodes.map(code => `'${code}'`).join(' | ')};

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
`;

  return content;
}

// Run the script
generateTranslationTypes().catch(error => {
  console.error('❌ Error generating translation types:', error);
  process.exit(1);
});

