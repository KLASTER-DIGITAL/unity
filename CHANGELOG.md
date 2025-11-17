# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-11-17

### ✨ Новые возможности

#### **Achievements - React Native адаптация** (НОВОЕ!)
- **React Native версия экрана достижений**:
  - Полная адаптация PWA версии для React Native
  - 5 категорий достижений: Постоянство, Вовлечённость, Осознанность и эмоции, Категории, Специальные
  - Real-time обновления через Supabase channels
  - Haptic feedback при взаимодействии с достижениями
  - Pull-to-refresh функционал

- **Новые компоненты**:
  - `useAchievements` hook - загрузка достижений из БД с real-time подпиской
  - `AchievementCategory.native.tsx` - категория с grid layout (2 columns)
  - `AchievementBadge3D.native.tsx` - 3D бейдж с rarity градиентами и progress bar
  - `AchievementDetailsModal.native.tsx` - модальное окно с анимацией и motivation messages

- **Особенности**:
  - Visual parity с PWA версией (цвета, spacing, typography)
  - Emoji иконки вместо lucide-react (React Native совместимость)
  - Animated API для плавных анимаций
  - ThemeContext для dark/light mode
  - Rarity система: legendary (purple), epic (orange), rare (blue), common (gray)

#### **Achievements - Оптимизация каталога** (НОВОЕ!)
- **Удалены избыточные достижения** (7 шт):
  - entries_5, entries_25, entries_250 (дублируют entries_10, entries_50, entries_100)
  - streak_60, streak_90 (слишком близко к streak_30 и streak_100)
  - achievements_25, achievements_250 (дублируют achievements_10, achievements_50, achievements_100)

- **Добавлены новые достижения** (8 шт):
  - Финансы: category_finance_5, category_finance_10, category_finance_25
  - Личностный рост: category_growth_5, category_growth_10, category_growth_25
  - Творчество: category_creativity_5, category_creativity_10

- **Результат**: 47 достижений с лучшим балансом и полным покрытием категорий

#### **Achievements - Emotional Balance Ladder** (НОВОЕ!)
- **Промежуточные шаги** для emotional_balance достижения:
  - emotional_balance_3 (3 записи) - "Первые шаги к балансу"
  - emotional_balance_5 (5 записей) - "Путь к гармонии"
  - emotional_balance_7 (7 записей) - "Мастер баланса"
  - emotional_balance_10 (10 записей) - "Эмоциональная гармония" (legendary)

- **Преимущества**:
  - Более плавная прогрессия (3 → 5 → 7 → 10 вместо сразу 10)
  - Мотивация пользователей промежуточными наградами
  - Лучший UX для новых пользователей

#### **Push Notifications - Achievement Unlocked** (НОВОЕ!)
- **Новые типы уведомлений**:
  - `achievement_unlocked` - при получении достижения
  - `achievement_near` - когда близко к получению (90%+ прогресса)

- **Edge Function**: `push-on-achievement`
  - Триггер на INSERT в `user_achievements` (progress >= 100)
  - Отправка push через `push-send` Edge Function
  - Персонализированный текст с названием достижения

- **Database Trigger**: `on_achievement_unlocked_push`
  - Автоматический вызов Edge Function при разблокировке
  - Асинхронная отправка (не блокирует основной поток)

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

#### **AI Control Center - Edge Functions Integration** (НОВОЕ!)
- **Edge Functions** теперь используют промпты из БД:
  - `ai-analysis` - анализ записей (операция `entry_analysis`)
  - `push-ai-personalize` - персонализированные push (операция `push_text`)

- **Как это работает**:
  1. Super admin изменяет промпт в админ-панели
  2. Промпт сохраняется в БД (`ai_operations` таблица)
  3. Edge Function загружает промпт из БД при следующем вызове
  4. Изменения применяются МГНОВЕННО без редеплоя!

- **Технические детали**:
  - Новый helper: `getAiOperationConfig()` для загрузки конфигурации
  - Placeholder замена: `{{user_name}}`, `{{user_language}}`, `{{entry_text}}`
  - Проверка доступности: `isOperationAvailable()` (is_enabled check)
  - Логирование конфигурации для отладки

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

