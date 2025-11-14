# i18n Language Fix - Verification Plan

**Дата**: 2025-11-14  
**Статус**: В процессе проверки  
**Commit**: e687303  
**Деплой**: Автоматический на Vercel (в процессе)

---

## ✅ Что было исправлено

### Проблема
Мотивационные карточки отображались на английском языке даже если профиль пользователя установлен на русский.

### Root Cause
1. `TranslationManager` инициализировался с hardcoded `preloadLanguages={['en']}`
2. `selectedLanguage` state НЕ обновлялся из `session.profile.language` при инициализации

### Решение
1. **MobileApp.tsx** (lines 242, 263, 317, 332):
   - Изменено: `preloadLanguages={['en']}` → `preloadLanguages={[selectedLanguage || 'ru']}`

2. **useAppInitialization.ts** (lines 224-227):
   ```typescript
   if (session.profile?.language) {
     console.log('[App.tsx] Setting language from profile:', session.profile.language);
     setSelectedLanguage(session.profile.language);
   }
   ```

---

## 🔍 План проверки

### Шаг 1: Проверка локального dev server

**URL**: http://localhost:3002

**Действия**:
1. ✅ Открыть браузер
2. ✅ Войти как rustam@leadshunter.biz / demo123
3. ✅ Открыть консоль (F12 → Console)
4. ✅ Проверить лог: `[App.tsx] Setting language from profile: ru`
5. ✅ Проверить что карточки на русском языке
6. ✅ Проверить что заголовок браузера "UNITY"

**Ожидаемый результат**:
- Консоль: `[App.tsx] Setting language from profile: ru`
- Карточки: русские заголовки ("Запиши момент благодарности", "Отметь маленькую победу", etc.)
- Заголовок: "UNITY"

### Шаг 2: Проверка production (Vercel)

**URL**: https://unity-wine.vercel.app

**Действия**:
1. ⏳ Дождаться завершения деплоя (2-3 минуты)
2. ✅ Открыть production URL
3. ✅ Войти как rustam@leadshunter.biz / demo123
4. ✅ Проверить консоль и карточки (как в Шаге 1)

### Шаг 3: Проверка профиля в БД

**Цель**: Убедиться что язык профиля действительно 'ru'

**SQL запрос**:
```sql
SELECT id, email, name, language 
FROM profiles 
WHERE email = 'rustam@leadshunter.biz';
```

**Ожидаемый результат**:
```
language: 'ru'
```

**Если язык 'en'**: Обновить через админ-панель или SQL:
```sql
UPDATE profiles 
SET language = 'ru' 
WHERE email = 'rustam@leadshunter.biz';
```

### Шаг 4: Очистка кэша (если карточки все еще на английском)

**Действия**:
1. Открыть DevTools (F12)
2. Application → Storage → Clear site data
3. Перезагрузить страницу (Ctrl+Shift+R)
4. Войти заново

---

## 🐛 Возможные проблемы

### Проблема 1: Карточки все еще на английском

**Причина**: Язык профиля в БД установлен как 'en'

**Решение**:
1. Проверить профиль в БД (Шаг 3)
2. Обновить язык на 'ru'
3. Очистить кэш карточек
4. Перезагрузить страницу

### Проблема 2: Консоль не показывает лог

**Причина**: Session не загружается или профиль отсутствует

**Решение**:
1. Проверить что пользователь авторизован
2. Проверить что профиль существует в БД
3. Проверить консоль на ошибки

### Проблема 3: selectedLanguage не обновляется

**Причина**: setSelectedLanguage не передан в useAppInitialization

**Решение**:
1. Проверить что setSelectedLanguage в destructuring (line 70)
2. Проверить что setSelectedLanguage в dependencies (line 250)

---

## 📝 Следующие шаги

1. ✅ Проверить локальный dev server
2. ⏳ Дождаться деплоя на Vercel
3. ✅ Проверить production
4. ✅ Проверить профиль в БД
5. ✅ Очистить кэш если нужно
6. ✅ Подтвердить что карточки на русском

---

## 🎯 Критерии успеха

- ✅ Консоль показывает: `[App.tsx] Setting language from profile: ru`
- ✅ Карточки отображаются на русском языке
- ✅ Заголовок браузера "UNITY"
- ✅ Spacing карточек правильный (64px)
- ✅ Blur эффект работает (видны все 3 карточки)
- ✅ 0 ошибок в консоли

