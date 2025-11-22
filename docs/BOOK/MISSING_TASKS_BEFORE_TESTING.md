# 🔍 Недостающие задачи перед тестированием

**Дата**: 2025-11-22  
**Статус**: ⚠️ КРИТИЧНО - НЕ ТЕСТИРОВАТЬ БЕЗ ЭТИХ ЗАДАЧ

---

## ❌ Проблема: Тестирование на production

**ОШИБКА**: Я пытался тестировать на production (`unity-wine.vercel.app`), но:
- ❌ Все изменения **локальные** (не задеплоены)
- ❌ Frontend код не обновлен на Vercel
- ❌ Edge Functions задеплоены, но frontend не знает о новых полях

**ПРАВИЛЬНЫЙ ПОДХОД**:
1. ✅ Сначала завершить ВСЕ задачи
2. ✅ Задеплоить frontend на Vercel
3. ✅ Только потом тестировать

---

## 📋 Недостающие задачи из документации

### 1. ⚠️ Frontend: Интеграция Step0PlanType в BookCreationWizard

**Статус**: ⏳ TODO  
**Файл**: `BookCreationWizard.tsx`

**Что сделано**:
- ✅ Создан `Step0PlanType.tsx`
- ✅ Добавлен в импорты
- ✅ Добавлен в рендер

**Что НЕ сделано**:
- ❌ Проверка `isPremium` из профиля (нужно добавить в useEffect)
- ❌ Автопропуск Step0 для Premium пользователей
- ❌ Обновление прогресс-бара (динамический расчет шагов)
- ❌ Обновление `handleNext()` для FREE потока (пропуск style/layout)

**Критерии приемки**:
- ✅ FREE пользователь видит Step0
- ✅ Premium пользователь НЕ видит Step0
- ✅ FREE поток: 0 → 1 → 2 → генерация (без 3,4)
- ✅ PREMIUM поток: 0 → 1 → 2 → 3 → 4 → генерация

---

### 2. ⚠️ Frontend: Обновить BooksLibraryScreen для новых полей

**Статус**: ⏳ TODO  
**Файл**: `BooksLibraryScreen.tsx`

**Что сделано**:
- ✅ Использует `useBooksList` хук
- ✅ Хук поддерживает `planType`, `version`, `parentBookId`

**Что НЕ сделано**:
- ❌ Отображение `planType` в UI (badge "FREE" / "PREMIUM")
- ❌ Отображение версии книги (v1, v2, v3)
- ❌ Ссылка на родительскую книгу (если это версия)
- ❌ Фильтр по `planType` (FREE / PREMIUM / Все)

**Критерии приемки**:
- ✅ Видно тип книги (FREE/PREMIUM badge)
- ✅ Видно версию (v1, v2, v3)
- ✅ Можно фильтровать по типу

---

### 3. ⚠️ Frontend: Обновить BookDraftEditor для FREE книг

**Статус**: ⏳ TODO  
**Файл**: `BookDraftEditor.tsx`

**Что нужно**:
- ❌ Проверка `planType === 'free'`
- ❌ Упрощенный редактор для FREE (только название, фото)
- ❌ Скрыть редактирование текста для FREE
- ❌ Показать сообщение: "FREE книги не редактируются"

**Критерии приемки**:
- ✅ FREE книга показывает упрощенный редактор
- ✅ PREMIUM книга показывает полный редактор

---

### 4. ⚠️ Backend: Обновить books-generate-monthly-auto

**Статус**: ⏳ TODO  
**Файл**: `supabase/functions/books-generate-monthly-auto/index.ts`

**Что нужно проверить**:
- ❌ Использует ли `plan_type: 'premium'` при создании
- ❌ Проверяет ли `is_premium` из профиля
- ❌ Работает ли с новыми полями (`type`, `language`)

**Критерии приемки**:
- ✅ Автогенерация создает только PREMIUM книги
- ✅ Использует правильный `plan_type`

---

### 5. ⚠️ Backend: Обновить books-generate-annual

**Статус**: ⏳ TODO  
**Файл**: `supabase/functions/books-generate-annual/index.ts`

**Что нужно проверить**:
- ❌ Использует ли `plan_type: 'premium'`
- ❌ Работает ли с новыми полями
- ❌ Использует ли `entry_summaries` и `monthly_snapshots`

**Критерии приемки**:
- ✅ Годовая книга создается как PREMIUM
- ✅ Использует оптимизированные данные

---

### 6. ⚠️ Backend: Генерация entry_summaries

**Статус**: ⏳ TODO  
**Приоритет**: P1 (но нужно для тестирования PREMIUM)

**Проблема**: 
- ✅ Таблица `entry_summaries` создана
- ❌ НО нет автоматической генерации summaries
- ❌ AI все еще использует raw entries (если summaries нет)

**Решение**:
- ❌ Создать Edge Function `entry-summaries-generate`
- ❌ Интегрировать в pipeline создания entries
- ❌ Или запускать батчами для существующих entries

**Критерии приемки**:
- ✅ При создании entry → автоматически создается summary
- ✅ Или есть способ сгенерировать summaries для всех entries

---

### 7. ⚠️ Frontend: Обновить типы TypeScript

**Статус**: ⏳ TODO

**Файлы**:
- `BookDraft` type в `BooksLibraryScreen.tsx`
- `BookConfig` type в `book-creation-wizard/types.ts`
- Все места где используется `books_archive`

**Что нужно**:
- ❌ Добавить `planType: 'free' | 'premium'`
- ❌ Добавить `type: 'month' | 'quarter' | 'year' | 'family' | 'custom'`
- ❌ Добавить `language: string`
- ❌ Добавить `version: number`
- ❌ Добавить `parentBookId: string | null`

**Критерии приемки**:
- ✅ TypeScript компилируется без ошибок
- ✅ Все типы соответствуют БД

---

### 8. ⚠️ Деплой Frontend на Vercel

**Статус**: ⏳ TODO  
**Приоритет**: КРИТИЧНО перед тестированием

**Что нужно**:
- ❌ Закоммитить все изменения
- ❌ Push в main branch
- ❌ Дождаться автоматического деплоя Vercel
- ❌ Проверить что деплой успешен

**Критерии приемки**:
- ✅ Vercel показывает успешный деплой
- ✅ Production URL работает
- ✅ Новые компоненты доступны

---

### 9. ⚠️ Проверка миграций на production

**Статус**: ⏳ TODO

**Что нужно**:
- ❌ Убедиться что все миграции применены
- ❌ Проверить структуру таблиц
- ❌ Проверить индексы
- ❌ Проверить RLS policies

**SQL для проверки**:
```sql
-- Проверить books_archive
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'books_archive' 
AND column_name IN ('plan_type', 'type', 'language', 'parent_book_id', 'version');

-- Проверить monthly_snapshots
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'monthly_snapshots'
);

-- Проверить entry_summaries
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'entry_summaries'
);
```

---

### 10. ⚠️ Проверка Edge Functions на production

**Статус**: ⏳ TODO

**Что нужно**:
- ❌ Проверить что `books-generate-free` задеплоен
- ❌ Проверить что `snapshots-generate-monthly` задеплоен
- ❌ Проверить что `books-generate-draft` обновлен
- ❌ Проверить логи на ошибки

**Команды**:
```bash
supabase functions list --project-ref ecuwuzqlwdkkdncampnc
supabase functions logs books-generate-free --project-ref ecuwuzqlwdkkdncampnc
```

---

## 📊 Приоритеты перед тестированием

### КРИТИЧНО (не тестировать без этого):

1. ✅ **Деплой Frontend** (#8)
2. ✅ **Проверка миграций** (#9)
3. ✅ **Проверка Edge Functions** (#10)
4. ✅ **Обновление типов TypeScript** (#7)

### ВАЖНО (желательно перед тестированием):

5. ✅ **Интеграция Step0PlanType** (#1)
6. ✅ **Обновление BooksLibraryScreen** (#2)
7. ✅ **Обновление BookDraftEditor** (#3)

### МОЖНО ОТЛОЖИТЬ (но лучше сделать):

8. ✅ **Обновить books-generate-monthly-auto** (#4)
9. ✅ **Обновить books-generate-annual** (#5)
10. ✅ **Генерация entry_summaries** (#6)

---

## ✅ Чеклист перед тестированием

- [ ] Все миграции применены на production
- [ ] Все Edge Functions задеплоены
- [ ] Frontend код закоммичен и задеплоен на Vercel
- [ ] TypeScript типы обновлены
- [ ] Step0PlanType интегрирован
- [ ] BooksLibraryScreen обновлен
- [ ] BookDraftEditor обновлен для FREE
- [ ] Проверка консоли браузера (0 errors)
- [ ] Проверка консоли Supabase (0 errors)

**ТОЛЬКО ПОСЛЕ ВСЕХ ЭТИХ ПРОВЕРОК → ТЕСТИРОВАНИЕ**

---

**Дата создания**: 2025-11-22  
**Автор**: AI Agent  
**Статус**: ⚠️ КРИТИЧНО

