/**
 * Pluralization rules for different languages
 * 
 * Based on Unicode CLDR plural rules:
 * https://cldr.unicode.org/index/cldr-spec/plural-rules
 * 
 * Plural forms:
 * - zero: 0 items (Arabic, Welsh)
 * - one: 1 item (most languages)
 * - two: 2 items (Arabic, Welsh)
 * - few: 2-4 items (Russian, Polish, Czech)
 * - many: 5+ items (Russian, Polish, Arabic)
 * - other: default form
 */

export type PluralForm = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

export type PluralRule = (count: number) => PluralForm;

/**
 * English plural rules (simple: one/other)
 */
const englishRule: PluralRule = (count: number): PluralForm => {
  if (count === 1) return 'one';
  return 'other';
};

/**
 * Russian plural rules (complex: one/few/many)
 * 
 * Examples:
 * - 1, 21, 31... → one (1 день)
 * - 2-4, 22-24, 32-34... → few (2 дня)
 * - 5-20, 25-30, 35-40... → many (5 дней)
 */
const russianRule: PluralRule = (count: number): PluralForm => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  
  if (mod10 === 1 && mod100 !== 11) return 'one';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'few';
  return 'many';
};

/**
 * Spanish plural rules (simple: one/other)
 */
const spanishRule: PluralRule = (count: number): PluralForm => {
  if (count === 1) return 'one';
  return 'other';
};

/**
 * German plural rules (simple: one/other)
 */
const germanRule: PluralRule = (count: number): PluralForm => {
  if (count === 1) return 'one';
  return 'other';
};

/**
 * French plural rules (one for 0 and 1, other for rest)
 */
const frenchRule: PluralRule = (count: number): PluralForm => {
  if (count === 0 || count === 1) return 'one';
  return 'other';
};

/**
 * Chinese plural rules (no plurals, always other)
 */
const chineseRule: PluralRule = (_count: number): PluralForm => {
  return 'other';
};

/**
 * Japanese plural rules (no plurals, always other)
 */
const japaneseRule: PluralRule = (_count: number): PluralForm => {
  return 'other';
};

/**
 * Georgian plural rules (simple: one/other)
 */
const georgianRule: PluralRule = (count: number): PluralForm => {
  if (count === 1) return 'one';
  return 'other';
};

/**
 * Arabic plural rules (complex: zero/one/two/few/many/other)
 * 
 * Examples:
 * - 0 → zero
 * - 1 → one
 * - 2 → two
 * - 3-10 → few
 * - 11-99 → many
 * - 100+ → other
 */
const arabicRule: PluralRule = (count: number): PluralForm => {
  if (count === 0) return 'zero';
  if (count === 1) return 'one';
  if (count === 2) return 'two';
  if (count >= 3 && count <= 10) return 'few';
  if (count >= 11 && count <= 99) return 'many';
  return 'other';
};

/**
 * Polish plural rules (complex: one/few/many)
 */
const polishRule: PluralRule = (count: number): PluralForm => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  
  if (count === 1) return 'one';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'few';
  return 'many';
};

/**
 * Map of language codes to plural rules
 */
const PLURAL_RULES: Record<string, PluralRule> = {
  // English
  'en': englishRule,
  
  // Russian
  'ru': russianRule,
  
  // Spanish
  'es': spanishRule,
  
  // German
  'de': germanRule,
  
  // French
  'fr': frenchRule,
  
  // Chinese
  'zh': chineseRule,
  
  // Japanese
  'ja': japaneseRule,
  
  // Georgian
  'ka': georgianRule,
  
  // Arabic
  'ar': arabicRule,
  
  // Polish
  'pl': polishRule
};

/**
 * Get plural form for a count in a specific language
 */
export function getPluralForm(language: string, count: number): PluralForm {
  const rule = PLURAL_RULES[language] || englishRule;
  return rule(count);
}

/**
 * Get all possible plural forms for a language
 */
export function getPluralForms(language: string): PluralForm[] {
  switch (language) {
    case 'ar':
      return ['zero', 'one', 'two', 'few', 'many', 'other'];
    case 'ru':
    case 'pl':
      return ['one', 'few', 'many'];
    case 'zh':
    case 'ja':
      return ['other'];
    default:
      return ['one', 'other'];
  }
}

/**
 * Check if a language has complex plural rules
 */
export function hasComplexPlurals(language: string): boolean {
  const forms = getPluralForms(language);
  return forms.length > 2;
}

/**
 * Get example counts for each plural form in a language
 */
export function getPluralExamples(language: string): Record<PluralForm, number[]> {
  switch (language) {
    case 'ru':
    case 'pl':
      return {
        one: [1, 21, 31, 41],
        few: [2, 3, 4, 22, 23, 24],
        many: [5, 6, 10, 11, 20, 25, 100],
        zero: [],
        two: [],
        other: []
      };
    case 'ar':
      return {
        zero: [0],
        one: [1],
        two: [2],
        few: [3, 4, 5, 10],
        many: [11, 20, 50, 99],
        other: [100, 200, 1000]
      };
    case 'zh':
    case 'ja':
      return {
        other: [0, 1, 2, 5, 10, 100],
        zero: [],
        one: [],
        two: [],
        few: [],
        many: []
      };
    default:
      return {
        one: [1],
        other: [0, 2, 5, 10, 100],
        zero: [],
        two: [],
        few: [],
        many: []
      };
  }
}

/**
 * Format a plural translation key
 * 
 * Examples:
 * - formatPluralKey('items', 'one') → 'items_one'
 * - formatPluralKey('items', 'few') → 'items_few'
 */
export function formatPluralKey(baseKey: string, form: PluralForm): string {
  return `${baseKey}_${form}`;
}

/**
 * Parse a plural translation key
 * 
 * Examples:
 * - parsePluralKey('items_one') → { baseKey: 'items', form: 'one' }
 * - parsePluralKey('items_few') → { baseKey: 'items', form: 'few' }
 */
export function parsePluralKey(key: string): { baseKey: string; form: PluralForm | null } {
  const forms: PluralForm[] = ['zero', 'one', 'two', 'few', 'many', 'other'];
  
  for (const form of forms) {
    if (key.endsWith(`_${form}`)) {
      return {
        baseKey: key.slice(0, -form.length - 1),
        form
      };
    }
  }
  
  return { baseKey: key, form: null };
}

/**
 * Check if a key is a plural key
 */
export function isPluralKey(key: string): boolean {
  const { form } = parsePluralKey(key);
  return form !== null;
}

