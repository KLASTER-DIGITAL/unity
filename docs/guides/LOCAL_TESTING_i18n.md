# Локальное тестирование i18n (Internationalization)

**Дата**: 2025-11-20  
**Версия**: 1.0  
**Цель**: Быстрое тестирование переводов локально без кеширования PWA

---

## 🎯 Проблема

PWA кеширует файлы на телефоне/браузере, из-за чего изменения в переводах не видны сразу после деплоя на Vercel. Это замедляет процесс тестирования.

**Решение**: Тестировать все изменения локально с автоматическим сбросом кеша PWA.

---

## 🚀 Быстрый старт

### 1. **Запуск локального сервера с очисткой кеша**

```bash
# Вариант 1: Автоматическая очистка кеша + запуск dev сервера
npm run test:local

# Вариант 2: Только очистка кеша (если сервер уже запущен)
npm run clear:cache

# Вариант 3: Запуск dev сервера с очисткой кеша
npm run dev:fresh
```

### 2. **Открыть браузер**

```
http://localhost:5173
```

### 3. **Жесткая перезагрузка (Hard Refresh)**

- **Mac**: `Cmd + Shift + R`
- **Windows/Linux**: `Ctrl + Shift + R`

### 4. **Проверить Service Worker (опционально)**

1. Открыть DevTools: `F12`
2. Перейти в **Application** → **Service Workers**
3. Нажать **Unregister** (если нужно полностью удалить SW)
4. Перезагрузить страницу

---

## 📋 Workflow для тестирования i18n

### **Шаг 1: Внести изменения в код**

Например, заменить hardcoded текст на `t()` вызов:

```tsx
// БЫЛО:
<h1>Библиотека книг</h1>

// СТАЛО:
<h1>{t('books.library_title', 'Библиотека книг')}</h1>
```

### **Шаг 2: Запустить Translation Keys Scanner**

```bash
npm run scan:translations
```

Это автоматически:
- Найдет все `t()` вызовы в коде
- Добавит новые ключи в БД Supabase
- Автоматически переведет на 9 языков через AI

### **Шаг 3: Запустить локальный сервер**

```bash
npm run test:local
```

Это автоматически:
- Очистит PWA кеш (инкрементирует версию)
- Запустит dev сервер на `http://localhost:5173`

### **Шаг 4: Открыть браузер и протестировать**

1. Открыть `http://localhost:5173`
2. Войти под тестовым аккаунтом:
   - **Казахский**: `ahmedjan@kazakh.kz` / `demo123`
   - **Русский**: `rustam@leadshunter.biz` / `demo123`
3. Проверить что текст переведен
4. Проверить консоль браузера (F12) на ошибки

### **Шаг 5: Если изменения не видны**

```bash
# 1. Остановить dev сервер (Ctrl+C)
# 2. Очистить кеш
npm run clear:cache

# 3. Запустить снова
npm run dev

# 4. В браузере: Hard Refresh (Cmd+Shift+R)
# 5. Если не помогло: Application → Service Workers → Unregister
```

---

## 🔧 Команды

| Команда | Описание |
|---------|----------|
| `npm run test:local` | Очистка кеша + запуск dev сервера |
| `npm run dev:fresh` | То же что `test:local` |
| `npm run clear:cache` | Только очистка кеша PWA |
| `npm run dev` | Обычный запуск dev сервера |
| `npm run scan:translations` | Сканирование и добавление ключей в БД |

---

## 📱 Тестирование на телефоне

### **Вариант 1: Через локальную сеть**

1. Узнать IP адрес компьютера:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. Запустить dev сервер:
   ```bash
   npm run test:local
   ```

3. На телефоне открыть:
   ```
   http://192.168.X.X:5173
   ```
   (замените `192.168.X.X` на ваш IP)

### **Вариант 2: Через Vercel Preview**

1. Закоммитить изменения
2. Запушить на GitHub
3. Vercel автоматически создаст preview deployment
4. Открыть preview URL на телефоне

---

## ⚠️ Важные замечания

### **1. Всегда проверять консоль браузера**

```
F12 → Console tab → 0 ошибок
```

Если есть ошибки → исправить НЕМЕДЛЕННО перед коммитом.

### **2. Тестировать на ОБОИХ языках**

- ✅ Казахский: `ahmedjan@kazakh.kz`
- ✅ Русский: `rustam@leadshunter.biz`

### **3. Проверять ВСЕ функции**

Не только ту функцию которую изменили, но и:
- Соседние компоненты
- Модальные окна
- Формы
- Даты
- Категории
- Теги

### **4. Коммитить только после полного тестирования**

```bash
# 1. Тестирование локально
npm run test:local

# 2. Проверка консоли (0 ошибок)
# 3. Проверка на казахском языке
# 4. Проверка на русском языке

# 5. ТОЛЬКО ПОТОМ коммит
git add -A
git commit -m "fix(i18n): описание изменений"
git push origin main
```

---

## 🎓 Примеры

### **Пример 1: Исправление hardcoded текста**

```bash
# 1. Изменить код
# src/features/mobile/books/BooksScreen.tsx
# "Библиотека книг" → t('books.library_title', 'Библиотека книг')

# 2. Добавить ключ в БД
npm run scan:translations

# 3. Тестировать локально
npm run test:local

# 4. Открыть http://localhost:5173
# 5. Войти под ahmedjan@kazakh.kz
# 6. Проверить что "Библиотека книг" → "Кітаптар кітапханасы"

# 7. Коммит
git add -A
git commit -m "fix(i18n): translate Books Library title"
git push origin main
```

### **Пример 2: Исправление форматирования дат**

```bash
# 1. Изменить код
# src/utils/formatDate.ts
# Добавить locale conversion: 'kk' → 'kk-KZ'

# 2. Тестировать локально
npm run test:local

# 3. Открыть http://localhost:5173
# 4. Войти под ahmedjan@kazakh.kz
# 5. Проверить что "20 ноября" → "20 қараша"

# 6. Коммит
git add -A
git commit -m "fix(i18n): fix date formatting for Kazakh locale"
git push origin main
```

---

## 🐛 Troubleshooting

### **Проблема**: Изменения не видны после `npm run test:local`

**Решение**:
1. Hard Refresh: `Cmd+Shift+R`
2. Unregister Service Worker: `Application → Service Workers → Unregister`
3. Очистить кеш браузера: `Application → Storage → Clear site data`
4. Перезапустить dev сервер

### **Проблема**: Ключи не добавляются в БД

**Решение**:
1. Проверить `.env` файл (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
2. Проверить интернет соединение
3. Проверить Supabase статус: https://status.supabase.com

### **Проблема**: Переводы не появляются

**Решение**:
1. Проверить что ключ добавлен в БД: `npm run scan:translations`
2. Проверить что AI перевел ключ (проверить в Supabase таблице `translations`)
3. Проверить что `useTranslation()` hook используется правильно
4. Проверить консоль на ошибки

---

**Следуйте этому workflow для быстрого и эффективного тестирования i18n!** 🚀

