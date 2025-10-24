# 🎯 Приоритизированный план действий UNITY-v2

**Дата**: 2025-10-24  
**Основание**: [Аудит проекта 2025-10-24](AUDIT_REPORT_2025-10-24.md)  
**Статус**: ✅ Готов к выполнению

---

## 📊 EXECUTIVE SUMMARY

**Общее состояние**: 85% Production Ready ✅  
**Критичных проблем**: 4 (P0)  
**Важных улучшений**: 8 (P1)  
**Желательных задач**: 2 (P2)

**Общее время выполнения**: ~3 дня (24 часа)

---

## 🔴 P0 - КРИТИЧНО (3 часа, сегодня)

### 1. Включить Leaked Password Protection
**Задача**: [TASK-019](../plan/BACKLOG.md#task-019-включить-leaked-password-protection)  
**Время**: 10 минут  
**Команда**: Backend Team

**Действия**:
1. Зайти в Supabase Dashboard → Authentication → Password Protection
2. Включить "Leaked Password Protection"
3. Проверить через `get_advisors_supabase`

**Результат**: Supabase Security WARN: 1 → 0 ✅

---

### 2. Исправить 401 error translations-api
**Задача**: [TASK-020](../plan/BACKLOG.md#task-020-исправить-401-error-translations-api)  
**Время**: 30 минут  
**Команда**: Backend Team

**Действия**:
1. Добавить публичный endpoint `GET /languages` без авторизации
2. Или добавить fallback в WelcomeScreen
3. Проверить консоль браузера через Chrome MCP

**Результат**: Консоль браузера errors: 1 → 0 ✅

---

### 3. Архивировать устаревшую документацию
**Задача**: [TASK-021](../plan/BACKLOG.md#task-021-архивировать-устаревшую-документацию)
**Время**: 1 час
**Команда**: AI Assistant

**Действия**:
1. Переместить 4 дублирующихся отчета в `docs/archive/2025-10/`
2. Переместить 4 устаревших плана в `docs/archive/2025-10/`
3. Переместить 4 устаревших отчета changelog/ в `docs/archive/2025-10/`
4. Переместить ~38 избыточных файлов по фичам в `docs/archive/2025-10/`
5. Обновить ссылки в актуальных файлах (если есть)

**Результат**: Documentation Ratio: 0.34:1 → 0.23:1 ✅

---

### 4. Обновить RECOMMENDATIONS.md
**Задача**: [TASK-022](../plan/BACKLOG.md#task-022-обновить-recommendationsmd)  
**Время**: 1 час  
**Команда**: AI Assistant

**Действия**:
1. Запустить `codebase-retrieval` для анализа
2. Создать топ-10 рекомендаций
3. Приоритизировать по P0/P1/P2

**Результат**: Актуальные рекомендации на основе аудита ✅

---

## 🟡 P1 - ВАЖНО (19 часов, 1-2 дня)

### 5. Объединить permissive RLS policies
**Задача**: [TASK-023](../plan/BACKLOG.md#task-023-объединить-permissive-rls-policies)  
**Время**: 2 часа  
**Команда**: Backend Team

**Действия**:
1. Объединить `admin_full_access_admin_settings` и `authenticated_read_pwa_settings`
2. Тестировать доступ для super_admin и user
3. Проверить через `get_advisors_supabase`

**Результат**: Supabase Performance WARN: 1 → 0 ✅

---

### 6. Удалить unused indexes
**Задача**: [TASK-024](../plan/BACKLOG.md#task-024-удалить-unused-indexes)  
**Время**: 1 час  
**Команда**: Backend Team

**Действия**:
1. Удалить `idx_media_files_entry_id`
2. Удалить `idx_media_files_user_id`
3. Удалить `idx_push_notifications_history_sent_by`
4. Удалить `idx_usage_user_id_v2`
5. Проверить через `get_advisors_supabase`

**Результат**: Unused indexes: 4 → 0 ✅

---

### 7. Модулизировать index.css
**Задача**: [TASK-025](../plan/BACKLOG.md#task-025-модулизировать-indexcss)  
**Время**: 1 день (8 часов)  
**Команда**: Frontend Team

**Действия**:
1. Создать `src/shared/styles/base/` (reset, typography, colors)
2. Создать `src/shared/styles/components/` (buttons, forms, cards)
3. Создать `src/shared/styles/layout/` (grid, flex, spacing)
4. Создать `src/shared/styles/themes/` (light, dark)
5. Обновить импорты в App.tsx
6. Проверить консоль браузера

**Результат**: index.css 5167 строк → 0, Модулей ~26 ✅

---

### 8. Разбить sidebar.tsx
**Задача**: [TASK-026](../plan/BACKLOG.md#task-026-разбить-sidebartsx)  
**Время**: 4 часа  
**Команда**: Frontend Team

**Действия**:
1. Создать `SidebarHeader.tsx`
2. Создать `SidebarNavigation.tsx`
3. Создать `SidebarFooter.tsx`
4. Обновить импорты
5. Проверить консоль браузера

**Результат**: sidebar.tsx 727 строк → <250 строк ✅

---

### 9. Разбить i18n.ts
**Задача**: [TASK-027](../plan/BACKLOG.md#task-027-разбить-i18nts)  
**Время**: 4 часа  
**Команда**: Backend Team

**Действия**:
1. Создать `i18n-loader.ts` (загрузка переводов)
2. Создать `i18n-cache.ts` (кеширование)
3. Создать `i18n-utils.ts` (утилиты)
4. Обновить импорты
5. Проверить консоль браузера

**Результат**: i18n.ts 709 строк → <300 строк ✅

---

### 10. Разбить admin-api Edge Function
**Задача**: [TASK-028](../plan/BACKLOG.md#task-028-разбить-admin-api-edge-function)  
**Время**: 4 часа  
**Команда**: Backend Team

**Действия**:
1. Создать `admin-users-api` (управление пользователями)
2. Создать `admin-settings-api` (настройки)
3. Создать `admin-stats-api` (статистика)
4. Обновить импорты в админ-панели
5. Деплой через Supabase MCP

**Результат**: admin-api 482 строки → 0 ✅

---

### 11. Разбить media Edge Function
**Задача**: [TASK-029](../plan/BACKLOG.md#task-029-разбить-media-edge-function)  
**Время**: 4 часа  
**Команда**: Backend Team

**Действия**:
1. Создать `media-upload` (загрузка файлов)
2. Создать `media-process` (обработка медиа)
3. Обновить импорты в PWA
4. Деплой через Supabase MCP

**Результат**: media 444 строки → 0 ✅

---

### 12. Разбить motivations Edge Function
**Задача**: [TASK-030](../plan/BACKLOG.md#task-030-разбить-motivations-edge-function)  
**Время**: 4 часа  
**Команда**: Backend Team

**Действия**:
1. Создать `motivations-generate` (генерация карточек)
2. Создать `motivations-schedule` (планирование)
3. Обновить импорты в PWA
4. Деплой через Supabase MCP

**Результат**: motivations 372 строки → 0 ✅

---

## 🟢 P2 - ЖЕЛАТЕЛЬНО (6 часов, 1 неделя)

### 13. Manual Testing PWA + Admin
**Время**: 4 часа  
**Команда**: QA Team

**Действия**:
1. Протестировать 28 функций PWA
2. Протестировать 11 функций Admin
3. Задокументировать баги

**Результат**: Все функции протестированы ✅

---

### 14. Запустить E2E tests локально
**Время**: 2 часа  
**Команда**: QA Team

**Действия**:
1. Настроить GitHub Secrets
2. Запустить Playwright локально
3. Проверить результаты

**Результат**: E2E tests работают локально ✅

---

## 📈 МЕТРИКИ УСПЕХА

| Метрика | Текущее | Целевое | Улучшение |
|---------|---------|---------|-----------|
| **Supabase Security WARN** | 1 | 0 | -100% |
| **Supabase Performance WARN** | 1 | 0 | -100% |
| **Консоль браузера errors** | 1 | 0 | -100% |
| **Documentation Ratio** | 0.34:1 | 0.23:1 | -32% |
| **Edge Functions >300** | 5 | 0 | -100% |
| **CSS файлов >200** | 3 | 0 | -100% |
| **Компонентов >250** | 19 | 10 | -47% |

---

## 🗓️ TIMELINE

### День 1 (2025-10-24) - P0 Критичные исправления
- ✅ Включить Leaked Password Protection (10 мин)
- ✅ Исправить 401 error translations-api (30 мин)
- ✅ Архивировать ~50 файлов документации (1 час)
- ✅ Обновить RECOMMENDATIONS.md (1 час)

**Итого**: 3 часа

---

### День 2-3 (2025-10-25 - 2025-10-26) - P1 Важные улучшения
- ✅ Объединить RLS policies (2 часа)
- ✅ Удалить unused indexes (1 час)
- ✅ Модулизировать index.css (8 часов)
- ✅ Разбить sidebar.tsx (4 часа)
- ✅ Разбить i18n.ts (4 часа)

**Итого**: 19 часов (2 дня)

---

### День 4 (2025-10-27) - P2 Тестирование
- ✅ Manual Testing (4 часа)
- ✅ E2E tests (2 часа)

**Итого**: 6 часов

---

## ✅ КРИТЕРИИ ЗАВЕРШЕНИЯ

**Sprint #14 считается завершенным, когда**:
- [ ] Supabase Advisors: 0 WARN (security + performance)
- [ ] Консоль браузера: 0 ERROR
- [ ] Documentation Ratio: ≤ 1:1
- [ ] Edge Functions: 0 файлов >300 строк
- [ ] CSS файлы: 0 файлов >200 строк
- [ ] Компоненты: <10 файлов >250 строк
- [ ] CHANGELOG.md и FIX.md обновлены

---

**Автор**: AI Assistant  
**Дата создания**: 2025-10-24  
**Следующий обзор**: 2025-10-27

