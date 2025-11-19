/**
 * Script to find missing translations across all languages
 * Compares each language with Russian (base language) to find missing keys
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTg2OTQsImV4cCI6MjA3NTYzNDY5NH0.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Translation {
  lang_code: string;
  translation_key: string;
  translation_value: string;
}

interface Language {
  code: string;
  name: string;
  native_name: string;
}

async function findMissingTranslations() {
  console.log('🔍 Finding missing translations...\n');

  // 1. Fetch all languages
  const { data: languages, error: langError } = await supabase
    .from('languages')
    .select('code, name, native_name')
    .eq('is_active', true)
    .order('code');

  if (langError) {
    console.error('❌ Error fetching languages:', langError);
    return;
  }

  console.log(`📚 Found ${languages.length} active languages:\n`);
  languages.forEach((lang: Language) => {
    console.log(`  - ${lang.code}: ${lang.native_name} (${lang.name})`);
  });
  console.log('');

  // 2. Fetch all translations
  const { data: translations, error: transError } = await supabase
    .from('translations')
    .select('lang_code, translation_key, translation_value')
    .order('lang_code, translation_key');

  if (transError) {
    console.error('❌ Error fetching translations:', transError);
    return;
  }

  console.log(`📝 Total translations in database: ${translations.length}\n`);

  // 3. Group translations by language
  const translationsByLang: Record<string, Set<string>> = {};
  languages.forEach((lang: Language) => {
    translationsByLang[lang.code] = new Set();
  });

  translations.forEach((t: Translation) => {
    if (translationsByLang[t.lang_code]) {
      translationsByLang[t.lang_code].add(t.translation_key);
    }
  });

  // 4. Get Russian keys as base
  const russianKeys = translationsByLang['ru'];
  console.log(`🇷🇺 Russian (base language): ${russianKeys.size} keys\n`);

  // 5. Find missing keys for each language
  console.log('📊 MISSING TRANSLATIONS REPORT:\n');
  console.log('='.repeat(80));
  console.log('');

  const allMissingKeys: Record<string, string[]> = {};

  languages.forEach((lang: Language) => {
    if (lang.code === 'ru') return; // Skip Russian (base language)

    const langKeys = translationsByLang[lang.code];
    const missingKeys: string[] = [];

    russianKeys.forEach((key) => {
      if (!langKeys.has(key)) {
        missingKeys.push(key);
      }
    });

    allMissingKeys[lang.code] = missingKeys;

    const coverage = ((langKeys.size / russianKeys.size) * 100).toFixed(1);
    const emoji = lang.code === 'kk' ? '🇰🇿' : 
                  lang.code === 'en' ? '🇬🇧' :
                  lang.code === 'es' ? '🇪🇸' :
                  lang.code === 'de' ? '🇩🇪' :
                  lang.code === 'fr' ? '🇫🇷' :
                  lang.code === 'zh' ? '🇨🇳' :
                  lang.code === 'ja' ? '🇯🇵' :
                  lang.code === 'ka' ? '🇬🇪' : '🏳️';

    console.log(`${emoji} ${lang.native_name} (${lang.code})`);
    console.log(`   Total keys: ${langKeys.size}/${russianKeys.size} (${coverage}% coverage)`);
    console.log(`   Missing: ${missingKeys.length} keys`);
    
    if (missingKeys.length > 0) {
      console.log(`   Missing keys:`);
      missingKeys.slice(0, 10).forEach((key) => {
        console.log(`     - ${key}`);
      });
      if (missingKeys.length > 10) {
        console.log(`     ... and ${missingKeys.length - 10} more`);
      }
    }
    console.log('');
  });

  console.log('='.repeat(80));
  console.log('');

  // 6. Summary
  const totalMissing = Object.values(allMissingKeys).reduce((sum, keys) => sum + keys.length, 0);
  console.log(`📈 SUMMARY:`);
  console.log(`   Total missing translations: ${totalMissing}`);
  console.log(`   Languages with missing translations: ${Object.keys(allMissingKeys).filter(k => allMissingKeys[k].length > 0).length}`);
  console.log('');

  // 7. Most common missing keys
  const keyFrequency: Record<string, number> = {};
  Object.values(allMissingKeys).forEach((keys) => {
    keys.forEach((key) => {
      keyFrequency[key] = (keyFrequency[key] || 0) + 1;
    });
  });

  const sortedKeys = Object.entries(keyFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  console.log(`🔥 TOP 20 MOST COMMON MISSING KEYS:`);
  sortedKeys.forEach(([key, count]) => {
    console.log(`   ${count}/${languages.length - 1} languages missing: ${key}`);
  });
}

findMissingTranslations().catch(console.error);

