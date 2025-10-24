# 🌍 UNITY-v2 i18n System - Complete Implementation Plan

**Дата создания**: 2025-10-20  
**Статус**: 🔄 В разработке  
**Приоритет**: 🔴 Критический

---

## 📋 Executive Summary

Полная реализация системы интернационализации (i18n) для UNITY-v2 с поддержкой 7 языков (🇷🇺 ru, 🇬🇧 en, 🇪🇸 es, 🇩🇪 de, 🇫🇷 fr, 🇨🇳 zh, 🇯🇵 ja). Система должна обеспечивать:
- ✅ Выбор языка в onboarding (WelcomeScreen)
- ✅ Сохранение языка в профиле пользователя
- ✅ Применение языка во всех экранах (mobile + admin)
- ✅ Кэширование переводов (localStorage/IndexedDB)
- ✅ Fallback на русский при ошибках
- ✅ Автоперевод через OpenAI API (gpt-4o-mini)

---

## 🔍 Анализ текущего состояния

### ✅ Что уже работает:
1. **TranslationProvider** - React context для управления переводами
2. **useTranslation hook** - хук для доступа к переводам
3. **TranslationCacheManager** - кэширование в localStorage с Unicode-safe checksum
4. **TranslationLoader** - загрузка переводов из Supabase с retry логикой
5. **I18nAPI** - клиентский API для translations-api микросервиса
6. **AutoTranslate** - автоперевод через OpenAI API
7. **WelcomeScreen** - выбор языка работает корректно
8. **OnboardingScreen2/3/4** - переводы работают
9. **AuthScreen** - переводы работают

### ❌ Что НЕ работает:
1. **Белый экран в админ-панели** - при переходе по ?view=admin
2. **Дублирующийся код** - 3 копии auto-translate.ts, 2 копии loader.ts
3. **Язык не сохраняется** - после onboarding язык не применяется в AchievementHomeScreen
4. **Хардкодные тексты** - в AchievementHomeScreen, HistoryScreen, AchievementsScreen, ReportsScreen
5. **Админ-панель без i18n** - AdminDashboard, SettingsTab, UsersTab на русском
6. **Нет TypeScript типов** - для translation keys (нет автокомплита)
7. **Нет плюрализации** - (1 запись, 2 записи, 5 записей)
8. **Нет форматирования дат** - хардкодный формат 'ru' в Intl.DateTimeFormat

---

## 🏗️ Архитектура системы i18n

### Принципы управления переводами:

1. **Централизованное управление** - вся логика переводов управляется из админ-панели (super_admin)
2. **Динамическое добавление языков** - super admin может добавлять новые языки без изменения кода
3. **Ручное редактирование** - super admin может редактировать переводы вручную
4. **Автоматический перевод** - система автоперевода через OpenAI API (gpt-4o-mini)
5. **Система оповещений** - детекция пропущенных переводов (missing translation keys)
6. **Автоматическая интеграция** - новые языки автоматически добавляются в:
   - WelcomeScreen (выбор языка при первом запуске)
   - OnboardingScreen (если есть выбор языка)
   - SettingsScreen → Профиль пользователя (переключение языка)

### Компоненты системы:

```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Panel (Super Admin)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Language Manager │  │ Translation      │                │
│  │ - Add language   │  │ Manager          │                │
│  │ - Edit language  │  │ - Edit keys      │                │
│  │ - Delete language│  │ - Add keys       │                │
│  │ - Activate/      │  │ - Auto-translate │                │
│  │   Deactivate     │  │ - Import/Export  │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Missing Keys     │  │ Translation      │                │
│  │ Detector         │  │ History          │                │
│  │ - Scan code      │  │ - Audit log      │                │
│  │ - Email alerts   │  │ - Rollback       │                │
│  │ - Dashboard      │  │ - Compare        │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Database                         │
├─────────────────────────────────────────────────────────────┤
│  languages (id, code, name, flag, is_active, is_rtl)        │
│  translation_keys (id, key, category, description)          │
│  translations (id, key_id, language_id, value, reviewed)    │
│  translation_history (id, key_id, old_value, new_value)     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Client Application                        │
├─────────────────────────────────────────────────────────────┤
│  TranslationProvider → useTranslation hook → t('key')       │
│  Dynamic language loading from DB                            │
│  Automatic UI updates when languages added                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 План реализации (18 задач)

### **Фаза 1: Критические баги** (Приоритет 🔴 - 3.5 часа)

#### Задача 1: Fix Admin Panel White Screen
**Статус**: ⏳ Pending  
**Время**: 30 мин  
**Описание**: Исправить белый экран в супер-админ панели при переходе по ?view=admin

**Проблема**:
- При переходе по `http://localhost:3000/?view=admin` отображается белый экран
- Возможные причины: ошибка импорта, ошибка рендеринга, отсутствие TranslationProvider

**Решение**:
1. Проверить `src/app/admin/AdminApp.tsx` на ошибки импорта
2. Проверить `src/features/admin/dashboard/components/AdminDashboard.tsx`
3. Добавить TranslationProvider в AdminApp (если отсутствует)
4. Проверить консоль браузера на ошибки
5. Проверить роутинг в `src/App.tsx`

**Файлы**:
- `src/app/admin/AdminApp.tsx`
- `src/App.tsx`
- `src/features/admin/dashboard/components/AdminDashboard.tsx`

---

#### Задача 2: Remove Duplicate i18n Code
**Статус**: ⏳ Pending  
**Время**: 1 час  
**Описание**: Удалить дублирующийся код в системе i18n

**Дубли**:
1. **auto-translate.ts** (3 копии):
   - `src/utils/i18n/auto-translate.ts` ❌ УДАЛИТЬ
   - `src/shared/lib/i18n/auto-translate.ts` ✅ ОСТАВИТЬ
   - `src/shared/lib/api/i18n/auto-translate.ts` ❌ УДАЛИТЬ

2. **loader.ts** (2 копии):
   - `src/utils/i18n/loader.ts` ❌ УДАЛИТЬ
   - `src/shared/lib/i18n/loader.ts` ✅ ОСТАВИТЬ

3. **fallback.ts** (дублирующиеся переводы):
   - `src/utils/i18n.ts` (fallbackTranslations) ❌ УДАЛИТЬ
   - `src/shared/lib/i18n/fallback.ts` ✅ ОСТАВИТЬ

**Решение**:
1. Удалить файлы из `src/utils/i18n/` и `src/shared/lib/api/i18n/`
2. Обновить импорты во всех компонентах
3. Проверить, что ничего не сломалось

**Файлы для удаления**:
- `src/utils/i18n/auto-translate.ts`
- `src/shared/lib/api/i18n/auto-translate.ts`
- `src/shared/lib/api/i18n/loader.ts`
- `src/utils/i18n/loader.ts`
- `src/utils/i18n.ts` (fallbackTranslations объект)

---

#### Задача 3: Implement Language Persistence
**Статус**: ⏳ Pending  
**Время**: 2 часа  
**Описание**: Реализовать сохранение выбранного языка в профиле пользователя

**Проблема**:
- Пользователь выбирает английский в WelcomeScreen
- Проходит onboarding на английском
- После входа в AchievementHomeScreen видит русский язык

**Решение**:
1. Сохранять язык в `profiles.language` при регистрации
2. Загружать язык из профиля при входе
3. Применять язык через `changeLanguage()` в App.tsx
4. Обновить все экраны для использования `userData.language`

**Изменения**:
```typescript
// src/App.tsx
useEffect(() => {
  if (userData?.language) {
    changeLanguage(userData.language);
  }
}, [userData]);

// src/features/mobile/home/components/AchievementHomeScreen.tsx
const { t, currentLanguage } = useTranslation();
const userLanguage = userData?.language || currentLanguage;
```

**Файлы**:
- `src/App.tsx`
- `src/features/mobile/auth/components/AuthScreenNew.tsx`
- `src/features/mobile/home/components/AchievementHomeScreen.tsx`
- `src/features/mobile/history/components/HistoryScreen.tsx`
- `src/features/mobile/achievements/components/AchievementsScreen.tsx`
- `src/features/mobile/reports/components/ReportsScreen.tsx`
- `src/features/mobile/settings/components/SettingsScreen.tsx`

---

### **Фаза 2: Замена хардкодных текстов** (Приоритет 🟡 - 7 часов)

#### Задача 4: Replace Hardcoded Texts in Mobile Screens
**Статус**: ⏳ Pending  
**Время**: 4 часа  
**Описание**: Заменить все хардкодные тексты на переводы через систему i18n

**Хардкодные тексты**:

1. **AchievementHomeScreen**:
   - `DEFAULT_MOTIVATIONS` (ru, en, es, de, fr, zh, ja) - 21 карточка
   - Toast messages: "Не удалось загрузить карточки", "Проверьте подключение к интернету"

2. **HistoryScreen**:
   - "Загрузка..."
   - "Записей не найдено"
   - "Попробуйте изменить фильтры"
   - "Создайте первую запись"
   - "Текст записи"
   - "Опишите ваше достижение..."

3. **AchievementsScreen**:
   - "Уровень {level}"
   - "Мастер достижений"
   - Milestones: "10 записей", "Неделя подряд", "50 записей", "Месяц подряд"
   - Rewards: "Бейдж 'Начинающий'", "Бейдж 'Постоянство'", "Премиум тема", "Бейдж 'Легенда'"

4. **ReportsScreen**:
   - "AI Обзоры"
   - "Анализ твоих достижений"
   - aiQuotes (3 цитаты)
   - weeklyStats labels

**Решение**:
1. Добавить недостающие ключи в `translation_keys` таблицу
2. Заменить хардкодные тексты на `t('key')`
3. Удалить локальные объекты `translations`

**Новые ключи** (всего ~50 ключей):
```
loading, no_entries_found, try_change_filters, create_first_entry,
entry_text, describe_achievement, level, achievement_master,
milestone_10_entries, milestone_week_streak, milestone_50_entries,
milestone_month_streak, badge_beginner, badge_consistency,
premium_theme, badge_legend, ai_reviews, analysis_achievements,
week, entries_count, mood, ai_quote_1, ai_quote_2, ai_quote_3,
default_motivation_1_title, default_motivation_1_desc, ...
```

---

#### Задача 5: Implement Admin Panel i18n
**Статус**: ⏳ Pending  
**Время**: 3 часа  
**Описание**: Реализовать систему переводов для админ-панели

**Требования**:
- Админ-панель должна поддерживать ru/en языки
- Переключатель языка в header админ-панели
- Все тексты через систему i18n

**Компоненты для перевода**:
1. **AdminDashboard** - меню, заголовки
2. **SettingsTab** - табы, описания
3. **UsersTab** - таблица, фильтры
4. **AIAnalyticsTab** - графики, карточки
5. **AISettingsTab** - формы, рекомендации

**Новые ключи** (~30 ключей):
```
admin_dashboard, users, subscriptions, settings, ai_analytics,
overview, total_users, active_users, premium_users,
monthly_budget, alert_threshold, current_spend, test_mode,
model_assignment, operation_type, model, max_tokens,
temperature, cost, recommendations, ...
```

---

### **Фаза 3: Admin Panel Translation Management** (Приоритет 🟠 - 12 часов)

#### Задача 6: Admin Translation Management UI
**Статус**: ⏳ Pending
**Время**: 4 часа
**Описание**: Создать UI для управления переводами в админ-панели

**Функции**:
1. **Таблица переводов** - все ключи с фильтрацией по языку/категории/статусу
2. **Inline редактирование** - двойной клик для редактирования перевода
3. **Добавление ключей** - форма для создания нового ключа с переводами
4. **Удаление ключей** - с подтверждением и каскадным удалением
5. **Поиск** - по ключам и переводам (fuzzy search)
6. **Экспорт/Импорт** - JSON/CSV формат для массового редактирования
7. **История изменений** - audit log с rollback функцией

**Компонент**: `src/features/admin/translations/components/TranslationManagementTab.tsx`

**UI элементы**:
- DataTable с сортировкой и пагинацией
- Фильтры: язык, категория, статус (translated/missing/needs_review)
- Кнопки: Add Key, Export, Import, Bulk Actions
- Modal для редактирования ключа
- History sidebar для просмотра изменений

---

#### Задача 7: Admin Language Management UI
**Статус**: ⏳ Pending
**Время**: 3 часа
**Описание**: Создать UI для управления языками в админ-панели

**Функции**:
1. **Список языков** - карточки с флагами, названиями, статусом
2. **Добавление языка** - форма (code, name, flag emoji, isRTL, isActive)
3. **Активация/Деактивация** - toggle switch для включения/выключения языка
4. **Удаление языка** - с подтверждением (только если нет переводов)
5. **Статистика покрытия** - progress bar с % переведенных ключей
6. **Автоматическая интеграция** - язык сразу появляется в WelcomeScreen/SettingsScreen

**Компонент**: `src/features/admin/translations/components/LanguageManagementTab.tsx`

**UI элементы**:
- Grid карточек языков (3 колонки)
- Кнопка "Add Language"
- Badge с процентом покрытия
- Switch для активации
- Delete button с confirmation dialog

---

#### Задача 8: Missing Translation Detection System
**Статус**: ⏳ Pending
**Время**: 3 часа
**Описание**: Реализовать систему оповещений о пропущенных переводах

**Функции**:
1. **Сканирование кода** - поиск всех вызовов `t('key')` в codebase
2. **Детекция missing keys** - сравнение с базой данных
3. **Email уведомления** - для super_admin о новых missing keys
4. **Dashboard widget** - карточка с количеством missing translations
5. **Auto-placeholder** - автоматическое создание ключа с placeholder значением

**Компонент**: `src/features/admin/translations/components/MissingKeysWidget.tsx`

**Алгоритм**:
```typescript
// 1. Scan codebase for t('key') calls
const usedKeys = scanCodebase();

// 2. Get all keys from database
const dbKeys = await getTranslationKeys();

// 3. Find missing keys
const missingKeys = usedKeys.filter(key => !dbKeys.includes(key));

// 4. Create placeholders
for (const key of missingKeys) {
  await createTranslationKey(key, { placeholder: true });
}

// 5. Send email notification
if (missingKeys.length > 0) {
  await sendEmailToSuperAdmin(missingKeys);
}
```

---

#### Задача 9: Auto-Translation via OpenAI Integration
**Статус**: ⏳ Pending
**Время**: 2 часа
**Описание**: Интеграция автоперевода через OpenAI API (gpt-4o-mini)

**Функции**:
1. **Auto-translate button** - для каждого missing ключа
2. **Batch translation** - перевод всех missing ключей для языка
3. **Custom prompt** - настройка промпта для качественного перевода
4. **Cost tracking** - логирование использования OpenAI (стоимость, токены)
5. **Review queue** - проверка автопереводов перед публикацией

**Компонент**: `src/features/admin/translations/components/AutoTranslateButton.tsx`

**Промпт**:
```
You are a professional translator for a mobile achievement diary app called UNITY.
Translate the following text from {sourceLanguage} to {targetLanguage}.
Keep the tone motivational and friendly.
Preserve any placeholders like {name}, {count}, etc.

Source text: "{sourceText}"

Return only the translated text without any explanations.
```

---

#### Задача 10: Dynamic Language Injection
**Статус**: ⏳ Pending
**Время**: 2 часа
**Описание**: Автоматическое добавление новых языков в UI

**Функции**:
1. **Dynamic loading** - загрузка списка языков из таблицы `languages`
2. **Auto-update WelcomeScreen** - новый язык сразу появляется в селекторе
3. **Auto-update SettingsScreen** - новый язык в переключателе
4. **Caching** - кэширование списка языков (TTL 1 час)
5. **Real-time updates** - WebSocket для мгновенного обновления

**Изменения**:
```typescript
// src/features/mobile/auth/components/WelcomeScreen.tsx
const { data: languages } = useQuery({
  queryKey: ['languages'],
  queryFn: async () => {
    const { data } = await supabase
      .from('languages')
      .select('*')
      .eq('is_active', true)
      .order('name');
    return data;
  },
  staleTime: 60 * 60 * 1000, // 1 hour
});
```

---

### **Фаза 4: Профессиональные улучшения** (Приоритет 🟢 - 14 часов)

#### Задача 11: Add Missing Translation Keys to Database
**Статус**: ⏳ Pending
**Время**: 2 часа

#### Задача 12: Implement TypeScript Types for Translation Keys
**Статус**: ⏳ Pending
**Время**: 2 часа

#### Задача 13: Optimize Translation Loading
**Статус**: ⏳ Pending
**Время**: 3 часа

#### Задача 14: Add Pluralization Support
**Статус**: ⏳ Pending
**Время**: 3 часа

#### Задача 15: Implement Date/Number Formatting
**Статус**: ⏳ Pending
**Время**: 2 часа

#### Задача 16: Add RTL Support Preparation
**Статус**: ⏳ Pending
**Время**: 2 часа

#### Задача 17: Create i18n Documentation
**Статус**: ⏳ Pending
**Время**: 2 часа

#### Задача 18: Test i18n System End-to-End
**Статус**: ⏳ Pending
**Время**: 3 часа

---

## 📊 Общая оценка времени

- **Фаза 1** (Критические баги): 3.5 часа
- **Фаза 2** (Замена хардкодных текстов): 7 часов
- **Фаза 3** (Admin Panel Translation Management): 14 часов
- **Фаза 4** (Профессиональные улучшения): 19 часов

**Итого**: ~43.5 часов (5-6 рабочих дней)

### Приоритизация по срочности:

**Неделя 1** (Критические задачи):
- ✅ Задача 1: Fix Admin Panel White Screen (30 мин)
- ✅ Задача 2: Remove Duplicate i18n Code (1 час)
- ✅ Задача 3: Implement Language Persistence (2 часа)
- ✅ Задача 4: Replace Hardcoded Texts in Mobile Screens (4 часа)
- ✅ Задача 5: Implement Admin Panel i18n (3 часа)

**Неделя 2** (Admin Management):
- ⏳ Задача 6: Admin Translation Management UI (4 часа)
- ⏳ Задача 7: Admin Language Management UI (3 часа)
- ⏳ Задача 8: Missing Translation Detection System (3 часа)
- ⏳ Задача 9: Auto-Translation via OpenAI Integration (2 часа)
- ⏳ Задача 10: Dynamic Language Injection (2 часа)

**Неделя 3** (Профессиональные улучшения):
- ⏳ Задача 11-18: TypeScript types, Optimization, Pluralization, Formatting, RTL, Documentation, Testing

---

## 🎓 Профессиональные рекомендации

### 1. React i18n: Custom Solution vs react-i18next

**Текущее решение** (Custom):
- ✅ Полный контроль над логикой
- ✅ Интеграция с Supabase
- ✅ Автоперевод через OpenAI
- ❌ Нет плюрализации out-of-the-box
- ❌ Нет форматирования дат/чисел

**react-i18next**:
- ✅ Плюрализация, форматирование, интерполяция
- ✅ Большое сообщество, документация
- ❌ Сложная интеграция с Supabase
- ❌ Нет автоперевода

**Рекомендация**: Оставить custom solution, добавить недостающие функции (плюрализация, форматирование).

---

### 2. Оптимизация загрузки переводов

**Текущая проблема**:
- Все переводы загружаются сразу при старте приложения
- Размер кэша может достигать 100+ KB для 7 языков

**Решение**:
1. **Lazy loading** - загружать только текущий язык
2. **Code splitting** - разделить переводы по экранам
3. **Preloading** - предзагружать переводы для следующего экрана
4. **IndexedDB** - использовать вместо localStorage для больших объемов

```typescript
// Пример lazy loading
const loadTranslationsForScreen = async (screen: string, language: string) => {
  const translations = await import(`./translations/${language}/${screen}.json`);
  return translations.default;
};
```

---

### 3. Кэширование стратегия

**Текущая реализация**:
- localStorage с TTL 24 часа
- Unicode-safe checksum для валидации
- Автоочистка при превышении лимита

**Улучшения**:
1. **React Query** - для управления кэшем и синхронизацией
2. **Service Worker** - для offline режима
3. **Stale-While-Revalidate** - показывать старые данные, обновлять в фоне

```typescript
// Пример с React Query
const { data: translations } = useQuery({
  queryKey: ['translations', language],
  queryFn: () => I18nAPI.getTranslations(language),
  staleTime: 24 * 60 * 60 * 1000, // 24 hours
  cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

---

### 4. TypeScript типизация

**Проблема**: Нет автокомплита для ключей переводов

**Решение**: Генерировать TypeScript типы из базы данных

```typescript
// scripts/generate-i18n-types.ts
type TranslationKeys = 
  | 'welcome_title'
  | 'start_button'
  | 'greeting'
  | 'today_question'
  // ... auto-generated from DB

// useTranslation.ts
const t = (key: TranslationKeys, fallback?: string): string => {
  // ...
};
```

---

## 🚀 Следующие шаги

1. ✅ Создать таски в task list
2. ⏳ Исправить белый экран админ-панели
3. ⏳ Удалить дублирующийся код
4. ⏳ Реализовать сохранение языка
5. ⏳ Заменить хардкодные тексты
6. ⏳ Добавить i18n в админ-панель

---

**Автор**: AI Agent  
**Дата последнего обновления**: 2025-10-20

