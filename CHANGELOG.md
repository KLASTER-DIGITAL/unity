# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-11-15

### ✨ Новые возможности

#### **AI Control Center** - Централизованное управление AI операциями
- **Админ-панель**: Новая секция "AI Operations & Prompts" в Settings → AI
  - 4 таба по группам: Карточки (3), Push (1), Отчеты (2), Coach (0)
  - Accordion для каждой AI операции с полным CRUD
  - Редактирование System Prompt и User Prompt Template
  - Управление моделями (model, max_tokens, temperature)
  - Включение/выключение операций (is_enabled switch)
  - Кнопки "Сохранить" и "Сбросить" для каждой операции
  - Toast notifications при сохранении
  
- **6 AI операций** в базе данных:
  - `entry_analysis` - Анализ записи пользователя (cards)
  - `card_from_entry` - Генерация карточки из записи (cards)
  - `progress_card` - Карточка прогресса (cards)
  - `push_text` - Текст push-уведомления (push)
  - `weekly_report` - Недельный отчет (reports)
  - `monthly_report` - Месячный отчет (reports)

- **Преимущества**:
  - Изменение промптов БЕЗ редеплоя кода
  - Версионирование промптов (через `ai_operations_history`)
  - A/B тестирование разных промптов (будущее)
  - Централизованное управление всеми AI операциями

### 🐛 Исправления

#### **Motivation Cards** - Исправлена логика временного окна
- Изменено временное окно с 48 часов на 24 часа
- Карточки теперь показываются только за последние 24 часа
- Обновлен Edge Function `motivations`
- Автоматический деплой на production через Vercel

#### **Real-time Updates** - Исправлен баг с обновлением данных
- Добавлена Supabase Realtime подписка в `useHomeScreenData` hook
- Данные обновляются автоматически при изменениях в БД
- Улучшен UX - пользователь видит изменения мгновенно

### 🗄️ База данных

#### **AI Operations Tables** - Уже созданы в production
- `ai_operations` - хранение конфигурации AI операций
  - id, group_name, display_name, description
  - model, max_tokens, temperature
  - system_prompt, user_prompt_template
  - is_enabled, extra_config, updated_at, updated_by
  
- `ai_operations_history` - версионирование изменений
  - Автоматическое сохранение истории через триггер
  - Отслеживание кто и когда изменил промпт

### 📚 Документация

#### **AI Control Center**
- `docs/new/ai-control-center-implementation.md` - отчет о реализации
- `docs/new/ai-control-center-integration-plan.md` - план интеграции с Edge Functions
- `scripts/test-ai-operations-ui.js` - тестовый скрипт для проверки API

---

## [2.0.1] - 2025-11-14

### 🐛 Исправления
- Исправлены критические баги в PWA
- Улучшена производительность загрузки

### 📚 Документация
- Обновлена документация проекта
- Добавлены новые гайды для разработчиков

---

## [2.0.0] - 2025-11-01

### ✨ Новые возможности
- Полный редизайн PWA интерфейса
- Новая система авторизации
- Улучшенная система мотивационных карточек

### 🗄️ База данных
- Миграция на новую схему БД
- Оптимизация индексов

### ⚡ Производительность
- Улучшена скорость загрузки на 40%
- Оптимизирован bundle size

---

## Архив

Детальные отчеты о предыдущих изменениях находятся в `docs/changelog/archive/`.

