# UNITY-v2 i18n Cleanup Plan

**Дата**: 2025-11-20  
**Статус**: Ready to Execute  
**Приоритет**: P0 (КРИТИЧНО)

---

## 🎯 Цель

Исправить все hardcoded тексты в пользовательском интерфейсе и очистить БД от мусорных translation keys.

---

## 📋 Checklist

### P0 (КРИТИЧНО) - Выполнить НЕМЕДЛЕННО:

- [ ] **1. Backup БД** (5 минут)
  - Создать backup таблицы `translations`
  - Команда: `pg_dump -t translations > translations_backup_2025-11-20.sql`

- [ ] **2. Очистка БД** (5 минут)
  - Выполнить SQL скрипт: `supabase/migrations/20251120000001_cleanup_garbage_translation_keys.sql`
  - Проверить результат: должно остаться ~580-600 ключей на язык

- [ ] **3. Исправление RecentEntriesFeed.tsx** (15 минут)
  - Заменить 6 hardcoded текстов на `t()` вызовы
  - Файл: `src/features/mobile/home/components/RecentEntriesFeed.tsx`
  - Строки: 115, 146, 149, 185, 196, 214

- [ ] **4. Тестирование** (10 минут)
  - Запустить `npm run dev`
  - Открыть https://unity-wine.vercel.app
  - Войти как robert@leadshunter.biz (язык: kk)
  - Проверить что все тексты на казахском
  - Проверить консоль браузера (0 errors)

- [ ] **5. Коммит изменений** (5 минут)
  - `git add .`
  - `git commit -m "fix(i18n): replace hardcoded texts with translation keys"`
  - `git push origin main`

---

## 🔧 Детальные инструкции

### 1. Backup БД

```bash
# Через Supabase MCP
supabase({
  summary: "Create backup of translations table",
  method: "POST",
  path: "/v1/projects/ecuwuzqlwdkkdncampnc/database/query",
  data: {
    query: "COPY translations TO '/tmp/translations_backup_2025-11-20.csv' WITH CSV HEADER"
  }
})
```

### 2. Очистка БД

```bash
# Через Supabase MCP
supabase({
  summary: "Execute cleanup migration",
  method: "POST",
  path: "/v1/projects/ecuwuzqlwdkkdncampnc/database/query",
  data: {
    query: "-- содержимое файла 20251120000001_cleanup_garbage_translation_keys.sql"
  }
})
```

### 3. Исправление RecentEntriesFeed.tsx

**Изменения**:

```typescript
// Добавить в начало компонента
const { t } = useTranslation();

// Строка 115 (loading state)
- <h2 className="font-bold text-foreground text-xl">Лента последних записей</h2>
+ <h2 className="font-bold text-foreground text-xl">{t('home.recent_entries', 'Лента последних записей')}</h2>

// Строка 146 (main heading)
- Лента последних записей
+ {t('home.recent_entries', 'Лента последних записей')}

// Строка 149 (aria-label)
- aria-label="Смотреть все"
+ aria-label={t('home.view_all', 'Смотреть все')}

// Строка 185 (no text fallback)
- {entry.text || 'Нет текста'}
+ {entry.text || t('home.no_text', 'Нет текста')}

// Строка 196 (no text fallback)
- {entry.text || 'Нет текста'}
+ {entry.text || t('home.no_text', 'Нет текста')}

// Строка 214 (view all button)
- <p className="text-center text-sm font-medium text-accent">Смотреть все</p>
+ <p className="text-center text-sm font-medium text-accent">{t('home.view_all', 'Смотреть все')}</p>
```

### 4. Тестирование

**Шаги**:
1. Запустить dev server: `npm run dev`
2. Открыть браузер: http://localhost:5173
3. Войти как robert@leadshunter.biz (пароль: demo123)
4. Проверить язык: должен быть казахский (kk)
5. Проверить тексты:
   - ✅ "Соңғы жазбалар лентасы" (вместо "Лента последних записей")
   - ✅ "Барлығын көру" (вместо "Смотреть все")
   - ✅ "Мәтін жоқ" (вместо "Нет текста")
6. Проверить консоль: 0 errors, 0 warnings

---

## 📊 Ожидаемый результат

### До исправления:
- ❌ "Лента последних записей" (русский текст на казахском интерфейсе)
- ❌ "Смотреть все" (русский текст на казахском интерфейсе)
- ❌ 50+ мусорных ключей в БД

### После исправления:
- ✅ "Соңғы жазбалар лентасы" (казахский текст)
- ✅ "Барлығын көру" (казахский текст)
- ✅ ~580-600 валидных ключей в БД
- ✅ 100% покрытие переводов для всех языков

---

## 🚨 Риски и митигация

### Риск 1: Удаление нужных ключей
**Вероятность**: Низкая  
**Митигация**: Backup БД перед удалением  
**Восстановление**: `psql < translations_backup_2025-11-20.sql`

### Риск 2: Сломанный UI после замены текстов
**Вероятность**: Низкая  
**Митигация**: Тестирование на всех языках  
**Восстановление**: `git revert HEAD`

### Риск 3: Ключи не найдены в БД
**Вероятность**: Очень низкая  
**Митигация**: Ключи уже добавлены миграцией `20251119000002_add_user_cabinet_translations_part1.sql`  
**Восстановление**: Добавить ключи вручную через админ-панель

---

## ✅ Критерии успеха

1. ✅ БД очищена от мусорных ключей (~50 ключей удалено)
2. ✅ Все hardcoded тексты заменены на `t()` вызовы
3. ✅ Тестирование на казахском языке прошло успешно
4. ✅ 0 errors в консоли браузера
5. ✅ Изменения закоммичены и запушены

---

**Время выполнения**: ~40 минут  
**Сложность**: Низкая  
**Приоритет**: P0 (КРИТИЧНО)

