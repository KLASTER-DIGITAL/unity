/**
 * Examples of pluralization usage in UNITY-v2
 * 
 * This file demonstrates how to use the pluralization system
 * in different scenarios.
 */

import { useTranslation } from '../useTranslation';

/**
 * Example 1: Simple pluralization (English)
 */
export function ExampleSimplePlural() {
  const { t } = useTranslation();
  
  // Database should have:
  // - achievements_one: "{{count}} achievement"
  // - achievements_other: "{{count}} achievements"
  
  return (
    <div>
      <p>{t.plural('achievements', 1)}</p>  {/* → "1 achievement" */}
      <p>{t.plural('achievements', 5)}</p>  {/* → "5 achievements" */}
    </div>
  );
}

/**
 * Example 2: Complex pluralization (Russian)
 */
export function ExampleComplexPlural() {
  const { t } = useTranslation();
  
  // Database should have:
  // - days_one: "{{count}} день"
  // - days_few: "{{count}} дня"
  // - days_many: "{{count}} дней"
  
  return (
    <div>
      <p>{t.plural('days', 1)}</p>   {/* → "1 день" */}
      <p>{t.plural('days', 2)}</p>   {/* → "2 дня" */}
      <p>{t.plural('days', 5)}</p>   {/* → "5 дней" */}
      <p>{t.plural('days', 21)}</p>  {/* → "21 день" */}
      <p>{t.plural('days', 22)}</p>  {/* → "22 дня" */}
      <p>{t.plural('days', 25)}</p>  {/* → "25 дней" */}
    </div>
  );
}

/**
 * Example 3: Entries count in HistoryScreen
 */
export function ExampleEntriesCount({ count }: { count: number }) {
  const { t } = useTranslation();
  
  // Database should have:
  // English:
  // - entries_one: "{{count}} entry"
  // - entries_other: "{{count}} entries"
  // 
  // Russian:
  // - entries_one: "{{count}} запись"
  // - entries_few: "{{count}} записи"
  // - entries_many: "{{count}} записей"
  
  return (
    <div className="text-sm text-gray-500">
      {t.plural('entries', count)}
    </div>
  );
}

/**
 * Example 4: Time ago (minutes, hours, days)
 */
export function ExampleTimeAgo({ minutes }: { minutes: number }) {
  const { t } = useTranslation();
  
  if (minutes < 60) {
    // Database should have:
    // - minutes_one: "{{count}} minute ago"
    // - minutes_other: "{{count}} minutes ago"
    return <span>{t.plural('minutes', minutes)}</span>;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    // Database should have:
    // - hours_one: "{{count}} hour ago"
    // - hours_other: "{{count}} hours ago"
    return <span>{t.plural('hours', hours)}</span>;
  }
  
  const days = Math.floor(hours / 24);
  // Database should have:
  // - days_one: "{{count}} day ago"
  // - days_other: "{{count}} days ago"
  return <span>{t.plural('days', days)}</span>;
}

/**
 * Example 5: Achievement milestones
 */
export function ExampleAchievementMilestones({ count }: { count: number }) {
  const { t } = useTranslation();
  
  // Database should have:
  // English:
  // - milestones_one: "{{count}} milestone reached"
  // - milestones_other: "{{count}} milestones reached"
  // 
  // Russian:
  // - milestones_one: "Достигнута {{count}} веха"
  // - milestones_few: "Достигнуты {{count}} вехи"
  // - milestones_many: "Достигнуто {{count}} вех"
  
  return (
    <div className="text-lg font-semibold">
      {t.plural('milestones', count)}
    </div>
  );
}

/**
 * Example 6: Items in list with fallback
 */
export function ExampleItemsWithFallback({ count }: { count: number }) {
  const { t } = useTranslation();
  
  // If translation not found, use fallback
  return (
    <div>
      {t.plural('items', count, `${count} items`)}
    </div>
  );
}

/**
 * Example 7: Zero items special case
 */
export function ExampleZeroItems({ count }: { count: number }) {
  const { t } = useTranslation();
  
  // Database should have:
  // English:
  // - items_zero: "No items"  (optional)
  // - items_one: "{{count}} item"
  // - items_other: "{{count}} items"
  // 
  // Arabic:
  // - items_zero: "لا توجد عناصر"
  // - items_one: "عنصر واحد"
  // - items_two: "عنصران"
  // - items_few: "{{count}} عناصر"
  // - items_many: "{{count}} عنصرًا"
  // - items_other: "{{count}} عنصر"
  
  if (count === 0) {
    return <div>{t.plural('items', 0)}</div>;  // → "No items" or "0 items"
  }
  
  return <div>{t.plural('items', count)}</div>;
}

/**
 * SQL migrations to add plural translations
 */
export const PLURAL_MIGRATIONS = {
  // English plurals
  en: `
    -- Achievements
    INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
    ('achievements_one', 'en', '{{count}} achievement'),
    ('achievements_other', 'en', '{{count}} achievements');
    
    -- Entries
    INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
    ('entries_one', 'en', '{{count}} entry'),
    ('entries_other', 'en', '{{count}} entries');
    
    -- Days
    INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
    ('days_one', 'en', '{{count}} day'),
    ('days_other', 'en', '{{count}} days');
    
    -- Hours
    INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
    ('hours_one', 'en', '{{count}} hour'),
    ('hours_other', 'en', '{{count}} hours');
    
    -- Minutes
    INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
    ('minutes_one', 'en', '{{count}} minute'),
    ('minutes_other', 'en', '{{count}} minutes');
    
    -- Milestones
    INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
    ('milestones_one', 'en', '{{count}} milestone reached'),
    ('milestones_other', 'en', '{{count}} milestones reached');
  `,
  
  // Russian plurals
  ru: `
    -- Achievements
    INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
    ('achievements_one', 'ru', '{{count}} достижение'),
    ('achievements_few', 'ru', '{{count}} достижения'),
    ('achievements_many', 'ru', '{{count}} достижений');
    
    -- Entries
    INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
    ('entries_one', 'ru', '{{count}} запись'),
    ('entries_few', 'ru', '{{count}} записи'),
    ('entries_many', 'ru', '{{count}} записей');
    
    -- Days
    INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
    ('days_one', 'ru', '{{count}} день'),
    ('days_few', 'ru', '{{count}} дня'),
    ('days_many', 'ru', '{{count}} дней');
    
    -- Hours
    INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
    ('hours_one', 'ru', '{{count}} час'),
    ('hours_few', 'ru', '{{count}} часа'),
    ('hours_many', 'ru', '{{count}} часов');
    
    -- Minutes
    INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
    ('minutes_one', 'ru', '{{count}} минута'),
    ('minutes_few', 'ru', '{{count}} минуты'),
    ('minutes_many', 'ru', '{{count}} минут');
    
    -- Milestones
    INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
    ('milestones_one', 'ru', 'Достигнута {{count}} веха'),
    ('milestones_few', 'ru', 'Достигнуты {{count}} вехи'),
    ('milestones_many', 'ru', 'Достигнуто {{count}} вех');
  `
};

/**
 * TypeScript types for plural keys
 * 
 * Add these to TranslationKeys.ts:
 */
export type PluralKeys = 
  | 'achievements_one' | 'achievements_few' | 'achievements_many' | 'achievements_other'
  | 'entries_one' | 'entries_few' | 'entries_many' | 'entries_other'
  | 'days_one' | 'days_few' | 'days_many' | 'days_other'
  | 'hours_one' | 'hours_few' | 'hours_many' | 'hours_other'
  | 'minutes_one' | 'minutes_few' | 'minutes_many' | 'minutes_other'
  | 'milestones_one' | 'milestones_few' | 'milestones_many' | 'milestones_other';

