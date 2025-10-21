/**
 * Pluralization helper for translations
 * 
 * Usage:
 * ```typescript
 * const t = useTranslation();
 * 
 * // Simple pluralization
 * t.plural('items', 5) // → "5 items"
 * t.plural('items', 1) // → "1 item"
 * 
 * // With custom template
 * t.plural('items', 5, '{{count}} элементов') // → "5 элементов"
 * 
 * // Complex pluralization (Russian)
 * t.plural('days', 1) // → "1 день"
 * t.plural('days', 2) // → "2 дня"
 * t.plural('days', 5) // → "5 дней"
 * ```
 */

import { getPluralForm, formatPluralKey, type PluralForm } from './PluralRules';

export interface PluralTranslations {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

export interface PluralizationOptions {
  count: number;
  language: string;
  translations: Record<string, string>;
  baseKey: string;
  fallback?: string;
}

/**
 * Get pluralized translation
 */
export function pluralize(options: PluralizationOptions): string {
  const { count, language, translations, baseKey, fallback } = options;
  
  // Get the appropriate plural form for this count and language
  const form = getPluralForm(language, count);
  
  // Try to get translation for this form
  const key = formatPluralKey(baseKey, form);
  let translation = translations[key];
  
  // Fallback to 'other' form if specific form not found
  if (!translation && form !== 'other') {
    const otherKey = formatPluralKey(baseKey, 'other');
    translation = translations[otherKey];
  }
  
  // Fallback to base key (for backwards compatibility)
  if (!translation) {
    translation = translations[baseKey];
  }
  
  // Use provided fallback or return key
  if (!translation) {
    translation = fallback || baseKey;
  }
  
  // Replace {{count}} placeholder with actual count
  return translation.replace(/\{\{count\}\}/g, count.toString());
}

/**
 * Create plural translations object from a template
 * 
 * Example:
 * ```typescript
 * const plurals = createPluralTranslations('ru', {
 *   one: '{{count}} день',
 *   few: '{{count}} дня',
 *   many: '{{count}} дней'
 * });
 * // → { one: '{{count}} день', few: '{{count}} дня', many: '{{count}} дней', other: '{{count}} дней' }
 * ```
 */
export function createPluralTranslations(
  language: string,
  forms: Partial<PluralTranslations>
): PluralTranslations {
  // Ensure 'other' form exists (fallback to 'many' or 'one')
  const other = forms.other || forms.many || forms.one || '{{count}} items';
  
  return {
    zero: forms.zero,
    one: forms.one,
    two: forms.two,
    few: forms.few,
    many: forms.many,
    other
  };
}

/**
 * Validate plural translations for a language
 * 
 * Returns missing forms that should be provided
 */
export function validatePluralTranslations(
  language: string,
  forms: Partial<PluralTranslations>
): PluralForm[] {
  const missing: PluralForm[] = [];
  
  // Check required forms based on language
  switch (language) {
    case 'ru':
    case 'pl':
      if (!forms.one) missing.push('one');
      if (!forms.few) missing.push('few');
      if (!forms.many) missing.push('many');
      break;
    case 'ar':
      if (!forms.zero) missing.push('zero');
      if (!forms.one) missing.push('one');
      if (!forms.two) missing.push('two');
      if (!forms.few) missing.push('few');
      if (!forms.many) missing.push('many');
      if (!forms.other) missing.push('other');
      break;
    case 'zh':
    case 'ja':
      if (!forms.other) missing.push('other');
      break;
    default:
      if (!forms.one) missing.push('one');
      if (!forms.other) missing.push('other');
      break;
  }
  
  return missing;
}

/**
 * Generate plural translations from a single template
 * 
 * Automatically creates all required forms for a language
 * 
 * Example:
 * ```typescript
 * const plurals = generatePluralTranslations('ru', 'день', 'дня', 'дней');
 * // → { one: '{{count}} день', few: '{{count}} дня', many: '{{count}} дней' }
 * ```
 */
export function generatePluralTranslations(
  language: string,
  ...templates: string[]
): PluralTranslations {
  switch (language) {
    case 'ru':
    case 'pl':
      return {
        one: templates[0] ? `{{count}} ${templates[0]}` : undefined,
        few: templates[1] ? `{{count}} ${templates[1]}` : undefined,
        many: templates[2] ? `{{count}} ${templates[2]}` : undefined,
        other: templates[2] ? `{{count}} ${templates[2]}` : `{{count}} items`
      };
    case 'ar':
      return {
        zero: templates[0] ? templates[0] : undefined,
        one: templates[1] ? `{{count}} ${templates[1]}` : undefined,
        two: templates[2] ? `{{count}} ${templates[2]}` : undefined,
        few: templates[3] ? `{{count}} ${templates[3]}` : undefined,
        many: templates[4] ? `{{count}} ${templates[4]}` : undefined,
        other: templates[5] ? `{{count}} ${templates[5]}` : `{{count}} items`
      };
    default:
      return {
        one: templates[0] ? `{{count}} ${templates[0]}` : undefined,
        other: templates[1] ? `{{count}} ${templates[1]}` : `{{count}} items`
      };
  }
}

/**
 * Format number with plural translation
 * 
 * Example:
 * ```typescript
 * formatPlural(5, 'items', translations, 'en')
 * // → "5 items"
 * 
 * formatPlural(1, 'items', translations, 'en')
 * // → "1 item"
 * ```
 */
export function formatPlural(
  count: number,
  baseKey: string,
  translations: Record<string, string>,
  language: string,
  fallback?: string
): string {
  return pluralize({
    count,
    language,
    translations,
    baseKey,
    fallback
  });
}

/**
 * Common plural templates for different languages
 */
export const COMMON_PLURALS = {
  // English
  en: {
    items: { one: '{{count}} item', other: '{{count}} items' },
    days: { one: '{{count}} day', other: '{{count}} days' },
    hours: { one: '{{count}} hour', other: '{{count}} hours' },
    minutes: { one: '{{count}} minute', other: '{{count}} minutes' },
    seconds: { one: '{{count}} second', other: '{{count}} seconds' },
    achievements: { one: '{{count}} achievement', other: '{{count}} achievements' },
    entries: { one: '{{count}} entry', other: '{{count}} entries' }
  },
  
  // Russian
  ru: {
    items: { one: '{{count}} элемент', few: '{{count}} элемента', many: '{{count}} элементов' },
    days: { one: '{{count}} день', few: '{{count}} дня', many: '{{count}} дней' },
    hours: { one: '{{count}} час', few: '{{count}} часа', many: '{{count}} часов' },
    minutes: { one: '{{count}} минута', few: '{{count}} минуты', many: '{{count}} минут' },
    seconds: { one: '{{count}} секунда', few: '{{count}} секунды', many: '{{count}} секунд' },
    achievements: { one: '{{count}} достижение', few: '{{count}} достижения', many: '{{count}} достижений' },
    entries: { one: '{{count}} запись', few: '{{count}} записи', many: '{{count}} записей' }
  },
  
  // Spanish
  es: {
    items: { one: '{{count}} elemento', other: '{{count}} elementos' },
    days: { one: '{{count}} día', other: '{{count}} días' },
    hours: { one: '{{count}} hora', other: '{{count}} horas' },
    minutes: { one: '{{count}} minuto', other: '{{count}} minutos' },
    seconds: { one: '{{count}} segundo', other: '{{count}} segundos' },
    achievements: { one: '{{count}} logro', other: '{{count}} logros' },
    entries: { one: '{{count}} entrada', other: '{{count}} entradas' }
  },
  
  // German
  de: {
    items: { one: '{{count}} Element', other: '{{count}} Elemente' },
    days: { one: '{{count}} Tag', other: '{{count}} Tage' },
    hours: { one: '{{count}} Stunde', other: '{{count}} Stunden' },
    minutes: { one: '{{count}} Minute', other: '{{count}} Minuten' },
    seconds: { one: '{{count}} Sekunde', other: '{{count}} Sekunden' },
    achievements: { one: '{{count}} Erfolg', other: '{{count}} Erfolge' },
    entries: { one: '{{count}} Eintrag', other: '{{count}} Einträge' }
  }
};

