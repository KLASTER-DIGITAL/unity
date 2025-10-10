# 🧠 Unity Diary App - Полная информация для разработки и деплоя

## 📋 **ОСНОВНАЯ ИНФОРМАЦИЯ**

### 🏗️ **Проект**
- **Название**: Дневник Достижений (Unity Diary App)
- **Технологии**: React + Vite + TypeScript + Supabase + Tailwind CSS
- **Рабочая директория**: `/Users/rustamkarimov/DEV/UNITY`

### 🌐 **URLs**
- **Локальная разработка**: `http://localhost:3001` (или 3000)
- **Продакшн**: `https://unity-diary-app.netlify.app`
- **Админ-панель**: `https://unity-diary-app.netlify.app/?view=admin`
- **GitHub**: `https://github.com/KLASTER-DIGITAL/unity`
- **Netlify Dashboard**: `https://app.netlify.com/projects/unity-diary-app`

## 🚀 **РАЗРАБОТКА**

### 📝 **Основные команды**
```bash
# Запуск локального сервера
npm run dev

# Сборка для продакшна
npm run build

# Предпросмотр сборки
npm run preview

# Очистка папок сборки
npm run clean

# Ручной деплой на Netlify
npm run deploy
```

### 🔧 **Локальная разработка**
1. **Запуск**: `npm run dev`
2. **URL**: `http://localhost:3001`
3. **Hot reload**: Автоматически
4. **Отладка**: Полный доступ к исходному коду

## 🎯 **ДЕПЛОЙ**

### 🔑 **Netlify конфигурация**
- **Site ID**: `e1ad1205-eab6-44dc-b329-3f4ed87d9b9a`
- **Account ID**: `68e911991825da0c21a20993`
- **CLI**: Настроен и авторизован

### 🤖 **GitHub Actions**
- **Файл**: `.github/workflows/deploy.yml`
- **Триггер**: Push в ветку `main`
- **Секреты**:
  - `NETLIFY_AUTH_TOKEN`: `68e911991825da0c21a20993`
  - `NETLIFY_SITE_ID`: `e1ad1205-eab6-44dc-b329-3f4ed87d9b9a`

### 📊 **Workflow деплоя**
1. **Разработка**: `npm run dev` → `localhost:3001`
2. **Коммит**: `git add . && git commit -m "message" && git push`
3. **Автодеплой**: GitHub Actions → Netlify
4. **Продакшн**: `unity-diary-app.netlify.app`

## 👥 **ТЕСТОВЫЕ ДАННЫЕ**

### 🔐 **Учетные записи**
- **Супер-админ**: `diary@leadshunter.biz` / `admin123`
- **Пользователь**: `rustam@leadshunter.biz` / `demo123`
- **Пользователь**: `an@leadshunter.biz` / `demo123`

### 🎯 **Тестирование**
- **Админ-панель**: `/?view=admin`
- **Пользовательский интерфейс**: Основная страница
- **PWA функции**: Установка, уведомления, оффлайн

## 📁 **СТРУКТУРА ПРОЕКТА**

```
src/
├── components/          # React компоненты
│   ├── screens/         # Экраны приложения
│   ├── ui/             # UI компоненты
│   └── hooks/          # Custom hooks
├── utils/              # Утилиты и API
├── supabase/           # Supabase функции
└── assets/             # Статические ресурсы

build/                  # Собранное приложение
docs/                   # Документация
.github/workflows/      # GitHub Actions
```

## 🛠️ **ПОЛЕЗНЫЕ КОМАНДЫ**

### 🔍 **Проверка статуса**
```bash
# Статус Git
git status

# Статус Netlify
netlify status

# Проверка портов
lsof -i :3000
lsof -i :3001
```

### 🚀 **Деплой**
```bash
# Автоматический (через GitHub)
git push origin main

# Ручной (через CLI)
netlify deploy --prod --dir=build
```

### 🧹 **Очистка**
```bash
# Очистка сборки
npm run clean

# Очистка node_modules
rm -rf node_modules && npm install
```

## 🆘 **УСТРАНЕНИЕ ПРОБЛЕМ**

### ❌ **Локальный сервер не запускается**
- Проверьте порты: `lsof -i :3000`
- Убейте процесс: `kill -9 <PID>`
- Перезапустите: `npm run dev`

### ❌ **GitHub Actions не работает**
- Проверьте секреты в GitHub Settings
- Проверьте файл `.github/workflows/deploy.yml`
- Проверьте логи в Actions вкладке

### ❌ **Netlify деплой не работает**
- Проверьте статус: `netlify status`
- Проверьте логи: `netlify logs`
- Проверьте сборку: `npm run build`

## 📚 **ДОКУМЕНТАЦИЯ**

- **DEVELOPMENT.md** - Руководство по разработке
- **NETLIFY_SETUP.md** - Настройка Netlify
- **GITHUB_ACTIONS_SETUP.md** - Настройка GitHub Actions
- **docs/** - Дополнительная документация

## 🎯 **БЫСТРЫЙ СТАРТ**

1. **Разработка**: `npm run dev`
2. **Тестирование**: Откройте `http://localhost:3001`
3. **Коммит**: `git add . && git commit -m "message" && git push`
4. **Деплой**: Автоматически через GitHub Actions
5. **Продакшн**: `https://unity-diary-app.netlify.app`

---

**Последнее обновление**: 10 января 2025
**Статус**: ✅ Полностью настроен и работает
