# 📋 Product Backlog UNITY-v2

**Последнее обновление**: 2025-10-21
**Всего задач**: 9 | **В работе**: 0 | **Готово к старту**: 6 | **Завершено**: 2 | **Идеи**: 2

> **Единый источник истины** для всех задач проекта с приоритетами и статусами

---

## 🔥 Критический приоритет (P0)

### [TASK-001] PWA Push Notifications
**Статус**: 📅 Готово к старту
**Приоритет**: 🔴 P0 - Критический
**Оценка**: 2 недели
**Команда**: Frontend Team
**Зависимости**: Supabase Realtime setup
**Детали**: → [tasks/planned/pwa-enhancements.md](tasks/planned/pwa-enhancements.md)

**Описание**:
Реализовать push-уведомления через Supabase Realtime для мотивационных карточек и напоминаний.

**Ключевые метрики**:
- Push delivery rate: 80%+
- Notification open rate: 30%+
- User engagement: +25%

**Прогресс**:
- [ ] Supabase Realtime интеграция
- [ ] Service Worker настройка
- [ ] UI для управления подписками
- [ ] Тестирование на iOS/Android

---

### [TASK-002] Offline Mode для критических функций
**Статус**: 📅 Готово к старту
**Приоритет**: 🔴 P0 - Критический
**Оценка**: 3 недели
**Команда**: Frontend Team
**Зависимости**: Service Worker optimization
**Детали**: → [tasks/planned/pwa-enhancements.md](tasks/planned/pwa-enhancements.md)

**Описание**:
Реализовать полноценный offline-режим для создания записей, просмотра истории и достижений.

**Ключевые метрики**:
- Offline functionality: 100% критических функций
- Sync success rate: 95%+
- User satisfaction: +30%

**Прогресс**:
- [ ] IndexedDB для локального хранения
- [ ] Sync queue для отложенных операций
- [ ] Conflict resolution
- [ ] UI индикаторы offline/online

---

## ⚡ Высокий приоритет (P1)

### [TASK-003] AI PDF Books Migration
**Статус**: 📅 Готово к старту
**Приоритет**: 🟡 P1 - Высокий
**Оценка**: 2 недели
**Команда**: AI Team
**Зависимости**: Нет
**Детали**: → [tasks/planned/ai-pdf-books.md](tasks/planned/ai-pdf-books.md)

**Описание**:
Мигрировать компоненты PDF-книг из /old в новую архитектуру, обновить UI под shadcn/ui.

**Ключевые метрики**:
- PDF generation time: < 10s
- User satisfaction: 90%+
- Monthly PDF downloads: 1000+

**Прогресс**:
- [ ] Миграция компонентов из /old
- [ ] UI обновление под shadcn/ui
- [ ] Мобильная оптимизация
- [ ] Тестирование PDF генерации

---

### [TASK-004] Advanced Analytics Dashboard
**Статус**: 📅 Готово к старту
**Приоритет**: 🟡 P1 - Высокий
**Оценка**: 4 недели
**Команда**: Frontend + Backend Team
**Зависимости**: Нет
**Детали**: → [tasks/planned/advanced-analytics.md](tasks/planned/advanced-analytics.md)

**Описание**:
Создать расширенную аналитику с графиками прогресса, трендами эмоций, статистикой привычек.

**Ключевые метрики**:
- User engagement: +40%
- Session duration: +50%
- Feature adoption: 70%+

**Прогресс**:
- [ ] Дизайн dashboard
- [ ] Графики прогресса (recharts)
- [ ] Тренды эмоций
- [ ] Статистика привычек
- [ ] Экспорт данных

---

## 📊 Средний приоритет (P2)

### [TASK-005] React Native Expo Migration
**Статус**: 📅 Готово к старту
**Приоритет**: 🟢 P2 - Средний
**Оценка**: 3-5 дней
**Команда**: Mobile Team
**Зависимости**: React Native подготовка (90% готово)
**Детали**: → [tasks/planned/react-native-expo-migration.md](tasks/planned/react-native-expo-migration.md)

**Описание**:
Мигрировать PWA на React Native Expo для нативных iOS/Android приложений.

**Ключевые метрики**:
- Migration time: 3-5 дней (вместо 7-10)
- Code reuse: 90%+
- Performance: нативная

**Прогресс**:
- [x] Platform adapters созданы (90%)
- [ ] Создание монорепо структуры
- [ ] Портирование UI компонентов
- [ ] Тестирование на iOS/Android
- [ ] Публикация в App Store/Google Play

---

### [TASK-006] Monetization System
**Статус**: 📅 Готово к старту
**Приоритет**: 🟢 P2 - Средний
**Оценка**: 4 недели
**Команда**: Full Stack Team
**Зависимости**: Нет
**Детали**: → [tasks/planned/monetization-system.md](tasks/planned/monetization-system.md)

**Описание**:
Реализовать систему монетизации с Premium подпиской, Family планом и Lifetime доступом.

**Ключевые метрики**:
- Conversion rate: 5%+
- MRR: $10K+
- Churn rate: < 5%

**Прогресс**:
- [ ] Stripe интеграция
- [ ] Premium features
- [ ] Paywall UI
- [ ] Subscription management
- [ ] Analytics

---

## 🎯 Низкий приоритет (P3)

### [TASK-007] Ecosystem Expansion
**Статус**: 💡 Идея
**Приоритет**: 🔵 P3 - Низкий
**Оценка**: 8 недель
**Команда**: Full Stack Team
**Зависимости**: React Native Migration
**Детали**: → [tasks/planned/ecosystem-expansion.md](tasks/planned/ecosystem-expansion.md)

**Описание**:
Расширить экосистему UNITY: Telegram Mini App, Desktop приложение, Browser Extension.

**Ключевые метрики**:
- Platform coverage: 5+ платформ
- User base: +50%
- Cross-platform sync: 100%

**Прогресс**:
- [ ] Telegram Mini App
- [ ] Desktop приложение (Electron)
- [ ] Browser Extension
- [ ] API для интеграций

---

### [TASK-008] Voice AI Coach
**Статус**: 💡 Идея
**Приоритет**: 🔵 P3 - Низкий
**Оценка**: 6 недель
**Команда**: AI Team
**Зависимости**: Advanced Analytics
**Детали**: Нет детального плана

**Описание**:
Создать голосового AI-коуча для персональных рекомендаций и мотивации.

**Ключевые метрики**:
- User engagement: +60%
- Session duration: +80%
- Premium conversion: +20%

**Прогресс**:
- [ ] Концепция и дизайн
- [ ] OpenAI Whisper интеграция
- [ ] Voice synthesis
- [ ] Персонализация
- [ ] Тестирование

---

### [TASK-009] Организация структуры документации
**Статус**: ✅ Завершено
**Приоритет**: 🟢 P2 - Средний
**Оценка**: 4 часа
**Команда**: Documentation Team
**Зависимости**: Нет
**Детали**: → [tasks/planned/organize-docs-structure.md](tasks/planned/organize-docs-structure.md)
**Отчет**: → [changelog/2025-10-21_docs_structure_reorganization.md](../changelog/2025-10-21_docs_structure_reorganization.md)

**Описание**:
Организовать 69 файлов из корня `/docs` в логические подпапки для улучшения навигации.

**Ключевые метрики**:
- Files organized: 69 → 3 (в корне) ✅
- Folder structure: 12 категорий ✅
- Broken links: TBD (TASK-010)

**Прогресс**:
- [x] Создание структуры папок
- [x] Перемещение файлов
- [ ] Обновление ссылок (TASK-010)
- [ ] Проверка и тестирование (TASK-010)

---

### [TASK-010] Обновление ссылок в документации
**Статус**: ✅ Завершено
**Приоритет**: 🟢 P2 - Средний
**Оценка**: 2 часа
**Фактически**: 1.5 часа
**Команда**: Documentation Team
**Зависимости**: TASK-009 (завершена)
**Детали**: → [tasks/archive/2025-10/update-documentation-links.md](tasks/archive/2025-10/update-documentation-links.md)
**Отчет**: → [changelog/archive/2025-10-21_documentation_links_cleanup.md](../changelog/archive/2025-10-21_documentation_links_cleanup.md)

**Описание**:
Обновить все внутренние ссылки в документации после реорганизации структуры (TASK-009).

**Ключевые метрики**:
- Битых ссылок: 76 → 53 (-30%) ✅
- Критичные файлы: 0 битых ссылок ✅
- Исправлено ссылок: 23 ✅

**Прогресс**:
- [x] Создать скрипт check-broken-links.sh
- [x] Запустить скрипт и найти все битые ссылки (76 шт.)
- [x] Исправить битые ссылки в docs/README.md (4 ссылки)
- [x] Исправить битые ссылки в docs/INDEX.md (16 ссылок)
- [x] Исправить битые ссылки в docs/plan/ (1 ссылка)
- [x] Исправить битые ссылки в docs/architecture/ (3 ссылки)
- [x] Проверить финальный результат (53 битых ссылки, некритичные)
- [x] Создать отчет в changelog/archive/

---

### [TASK-011] Улучшение тестовых данных для демо-аккаунта
**Статус**: 📅 Готово к старту
**Приоритет**: 🟢 P2 - Средний
**Оценка**: 1 неделя
**Команда**: Backend + QA Team
**Зависимости**: Нет
**Детали**: → [testing/TEST_ACCOUNTS.md](../testing/TEST_ACCOUNTS.md)

**Описание**:
Создать реалистичные демо-данные для аккаунта Anna (an@leadshunter.biz) для демонстраций и UI/UX тестирования.

**Ключевые метрики**:
- Demo entries: 30+ за последний месяц
- Achievements: 10+ разных категорий
- Media files: 5+ фото/аудио
- AI analysis: 100% записей проанализировано

**Прогресс**:
- [ ] Создать демо-данные для Anna:
  - [ ] Заполнить 30+ записей за последний месяц
  - [ ] Создать 10+ достижений разных категорий
  - [ ] Добавить медиафайлы (фото, аудио)
  - [ ] Сгенерировать AI-анализ для всех записей
- [ ] Добавить скриншоты в документацию:
  - [ ] Скриншот входа в мобильное приложение
  - [ ] Скриншот админ-панели
  - [ ] Скриншот демо-данных Anna
- [ ] Создать скрипт для сброса демо-данных:
  - [ ] `scripts/reset-demo-account.sh`
  - [ ] Автоматическое заполнение данных для Anna
  - [ ] Документация по использованию скрипта

---

## 📊 Статистика

### По приоритетам
- 🔴 P0 (Критические): 2 задачи
- 🟡 P1 (Высокие): 2 задачи
- 🟢 P2 (Средние): 4 задачи
- 🔵 P3 (Низкие): 2 задачи

### По статусам
- ✅ Завершено: 2 задачи
- 🔄 В работе: 0 задач
- 📅 Готово к старту: 7 задач
- 💡 Идея: 2 задачи

### По командам
- Frontend Team: 2 задачи
- AI Team: 2 задачи
- Mobile Team: 1 задача
- Full Stack Team: 2 задачи
- Frontend + Backend Team: 1 задача
- Backend + QA Team: 1 задача
- Documentation Team: 2 задачи (2 завершены)

---

## 🔄 Правила обновления

### Ежедневно
- Обновлять статусы задач
- Обновлять прогресс (чекбоксы)
- Добавлять новые задачи из спринтов

### Еженедельно
- Удалять завершенные задачи (переносить в changelog)
- Пересматривать приоритеты
- Обновлять оценки

### Ежемесячно
- Архивировать старые задачи
- Обновлять статистику
- Review backlog с командой

---

**Автор**: Product Team UNITY
**Дата создания**: 21 октября 2025
**Последнее обновление**: 21 октября 2025

