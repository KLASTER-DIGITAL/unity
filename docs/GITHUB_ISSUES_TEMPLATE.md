# 📋 GitHub Issues Template для UNITY-v2

**Дата создания**: 2025-10-18  
**Назначение**: Шаблоны для создания задач в GitHub Issues

---

## 🔥 Критический приоритет

### Issue #1: Мобильная оптимизация PWA

**Title**: 📱 Optimize mobile UX/UI for native app experience
**Labels**: `enhancement`, `mobile`, `critical`, `ux`
**Assignee**: Development Team
**Milestone**: Q4 2025

**Description**:
Улучшить мобильный пользовательский опыт PWA для работы как нативное мобильное приложение.

**Acceptance Criteria**:
- [ ] Оптимизированы touch interactions и жесты
- [ ] Улучшена мобильная навигация (свайпы, анимации)
- [ ] Добавлен haptic feedback через Web Vibration API
- [ ] Оптимизированы размеры кнопок для пальцев (минимум 44px)
- [ ] Улучшены loading states и skeleton screens
- [ ] Добавлена pull-to-refresh функциональность
- [ ] Протестировано на реальных мобильных устройствах

**Technical Tasks**:
1. Создать `src/shared/lib/mobile/haptics.ts`
2. Создать `src/shared/lib/mobile/gestures.ts`
3. Обновить `src/app/mobile/MobileApp.tsx`
4. Добавить мобильные компоненты в `src/shared/components/mobile/`
5. Оптимизировать touch targets во всех экранах
6. Добавить swipe navigation между экранами

**Files to modify**:
- `src/app/mobile/MobileApp.tsx`
- `src/shared/lib/mobile/` (new)
- `src/shared/components/mobile/` (new)
- Все мобильные экраны

**Estimated time**: 3-4 дня

---

### Issue #2: Bundle optimization и code splitting

**Title**: ⚡ Optimize bundle size and implement code splitting  
**Labels**: `performance`, `optimization`, `critical`  
**Assignee**: Development Team  
**Milestone**: Q4 2024  

**Description**:
Уменьшить размер бандла на 30% и улучшить время загрузки через code splitting и оптимизацию.

**Current metrics**:
- Bundle size: 2.1MB (504KB gzipped)
- First Load: ~3.2 seconds
- Time to Interactive: ~4.1 seconds

**Target metrics**:
- Bundle size: <1.5MB (<350KB gzipped)
- First Load: <2 seconds
- Time to Interactive: <3 seconds

**Acceptance Criteria**:
- [ ] Реализован code splitting по фичам
- [ ] Добавлен lazy loading для компонентов
- [ ] Оптимизирован tree shaking
- [ ] Сжаты изображения и assets
- [ ] Добавлен prefetch для критических ресурсов
- [ ] Bundle analyzer показывает улучшения
- [ ] Lighthouse score > 90

**Technical Tasks**:
1. Настроить Vite code splitting
2. Добавить React.lazy() для фич
3. Оптимизировать импорты библиотек
4. Сжать изображения (WebP, AVIF)
5. Настроить prefetch/preload
6. Добавить bundle analyzer в CI

**Estimated time**: 3-4 дня

---

### Issue #3: Supabase Push уведомления

**Title**: 🔔 Implement push notifications with Supabase
**Labels**: `notifications`, `supabase`, `critical`, `mobile`
**Assignee**: Development Team
**Milestone**: Q4 2025

**Description**:
Реализовать систему push уведомлений через Supabase Realtime и Web Push API.

**Acceptance Criteria**:
- [ ] Настроен Supabase Realtime для уведомлений
- [ ] Реализован Web Push API для PWA
- [ ] Создан Edge Function для отправки уведомлений
- [ ] Добавлены настройки уведомлений в профиль пользователя
- [ ] Реализованы локальные напоминания через Notification API
- [ ] Интегрировано с Service Worker для background уведомлений
- [ ] Протестировано на мобильных устройствах

**Technical Tasks**:
1. Создать Edge Function `send-notification`
2. Настроить Web Push API в PWA
3. Добавить push subscription в регистрацию
4. Создать настройки уведомлений в UI
5. Реализовать локальные напоминания
6. Обновить Service Worker для background notifications
7. Добавить таблицу `push_subscriptions` в Supabase

**Files to modify**:
- `supabase/functions/send-notification/` (new)
- `src/shared/lib/notifications/` (new)
- `public/sw.js`
- `src/features/mobile/settings/`

**Estimated time**: 4-5 дней

---

## 🚀 Высокий приоритет

### Issue #4: React Native Expo подготовка

**Title**: 📱 Prepare codebase for React Native Expo migration  
**Labels**: `react-native`, `expo`, `architecture`, `high-priority`  
**Assignee**: Development Team  
**Milestone**: Q1 2025  

**Description**:
Подготовить кодовую базу к миграции на React Native Expo с monorepo структурой.

**Acceptance Criteria**:
- [ ] Создана monorepo структура (apps/web, apps/mobile)
- [ ] Выделена platform-agnostic логика в shared/
- [ ] Заменены веб-специфичные компоненты
- [ ] Настроен NativeWind для Tailwind CSS
- [ ] Созданы platform adapters для API
- [ ] Подготовлена Expo конфигурация
- [ ] Документация по миграции создана

**Technical Tasks**:
1. Создать monorepo с Yarn Workspaces
2. Выделить shared логику
3. Создать platform adapters
4. Настроить NativeWind
5. Подготовить Expo app.json
6. Создать migration guide

**Estimated time**: 7-10 дней

---

### Issue #5: Push уведомления

**Title**: 🔔 Implement push notifications system  
**Labels**: `notifications`, `firebase`, `high-priority`, `mobile`  
**Assignee**: Development Team  
**Milestone**: Q1 2025  

**Description**:
Добавить систему push уведомлений для достижений и напоминаний.

**Acceptance Criteria**:
- [ ] Настроен Firebase Cloud Messaging
- [ ] Создан Edge Function для отправки уведомлений
- [ ] Добавлены настройки уведомлений в профиль
- [ ] Реализованы локальные напоминания
- [ ] Уведомления работают на всех устройствах
- [ ] Добавлена аналитика уведомлений

**Technical Tasks**:
1. Настроить Firebase проект
2. Создать notifications Edge Function
3. Добавить FCM в PWA
4. Создать notification settings UI
5. Реализовать локальные напоминания
6. Добавить аналитику

**Estimated time**: 3-4 дня

---

### Issue #6: Расширенная аналитика и отчеты

**Title**: 📊 Implement advanced analytics and reporting  
**Labels**: `analytics`, `charts`, `high-priority`, `ai`  
**Assignee**: Development Team  
**Milestone**: Q1 2025  

**Description**:
Создать детальную систему аналитики с графиками и AI-инсайтами.

**Acceptance Criteria**:
- [ ] Добавлены графики прогресса (Recharts)
- [ ] Созданы еженедельные отчеты
- [ ] Реализовано сравнение периодов
- [ ] Добавлен экспорт данных (PDF, CSV)
- [ ] Созданы персональные инсайты с AI
- [ ] Добавлены предиктивные модели

**Technical Tasks**:
1. Создать analytics компоненты
2. Добавить Recharts графики
3. Реализовать export функции
4. Создать AI insights Edge Function
5. Добавить predictive analytics
6. Создать reporting UI

**Estimated time**: 4-5 дней

---

## 📈 Средний приоритет

### Issue #7: Социальные функции

**Title**: 👥 Implement social features (friends, feed, challenges)  
**Labels**: `social`, `medium-priority`, `community`  
**Assignee**: Development Team  
**Milestone**: Q2 2025  

**Description**:
Добавить социальные функции для создания сообщества пользователей.

**Acceptance Criteria**:
- [ ] Система друзей и подписок
- [ ] Лента достижений друзей
- [ ] Совместные челленджи
- [ ] Настройки приватности
- [ ] Комментарии и реакции
- [ ] Модерация контента

**Estimated time**: 10-14 дней

---

### Issue #8: Кастомизация и темы

**Title**: 🎨 Implement customization and theming system  
**Labels**: `ui`, `theming`, `medium-priority`, `customization`  
**Assignee**: Development Team  
**Milestone**: Q2 2025  

**Description**:
Добавить возможности персонализации интерфейса.

**Acceptance Criteria**:
- [ ] Кастомные темы оформления
- [ ] Персональные аватары
- [ ] Настройка виджетов на главном экране
- [ ] Кастомные категории достижений
- [ ] Импорт/экспорт настроек

**Estimated time**: 5-7 дней

---

### Issue #9: PDF книги и контент

**Title**: 📚 Implement PDF books and motivational content system
**Labels**: `content`, `pdf`, `medium-priority`, `motivation`
**Assignee**: Development Team
**Milestone**: Q1 2026

**Description**:
Создать систему мотивационных PDF книг и контента для поддержки личностного роста.

**Acceptance Criteria**:
- [ ] Библиотека PDF книг по личностному росту
- [ ] Система рекомендаций книг на основе записей пользователя
- [ ] Интеграция с записями - связь книг с достижениями
- [ ] Прогресс чтения и заметки к книгам
- [ ] AI-генерация персональных мини-книг на основе записей
- [ ] Офлайн доступ к скачанным книгам

**Technical Tasks**:
1. Создать таблицы `books`, `user_books`, `reading_progress`
2. Добавить PDF viewer компонент
3. Реализовать систему рекомендаций
4. Создать AI Edge Function для генерации контента
5. Добавить offline storage для PDF файлов

**Estimated time**: 7-10 дней

---

## 🔧 Техническая задолженность

### Issue #10: TypeScript ошибки

**Title**: 🔧 Fix TypeScript errors and improve type safety  
**Labels**: `typescript`, `tech-debt`, `low-priority`  
**Assignee**: Development Team  
**Milestone**: Q2 2025  

**Description**:
Исправить 36 существующих TypeScript ошибок и улучшить типизацию.

**Current issues**:
- App.tsx, MobileApp.tsx - несоответствие типов props
- AuthScreenNew.tsx - неиспользуемые импорты
- OnboardingScreen2/3/4.tsx - figma assets
- MobileBottomNav.tsx - отсутствующие ключи переводов

**Estimated time**: 2-3 дня

---

### Issue #11: Тестирование

**Title**: 🧪 Implement comprehensive testing suite  
**Labels**: `testing`, `quality`, `tech-debt`  
**Assignee**: Development Team  
**Milestone**: Q2 2025  

**Description**:
Создать полноценную систему тестирования.

**Acceptance Criteria**:
- [ ] Unit тесты для критических компонентов
- [ ] Integration тесты для API
- [ ] E2E тесты для пользовательских сценариев
- [ ] Performance тесты для мобильных устройств
- [ ] CI/CD с автоматическими тестами

**Estimated time**: 5-7 дней

---

### Issue #12: Документация

**Title**: 📚 Update and improve project documentation  
**Labels**: `documentation`, `tech-debt`, `low-priority`  
**Assignee**: Development Team  
**Milestone**: Q2 2025  

**Description**:
Обновить и улучшить документацию проекта.

**Acceptance Criteria**:
- [ ] Обновлена API документация
- [ ] Создан Component Storybook
- [ ] Написан Contributing Guide
- [ ] Обновлен Deployment Guide
- [ ] Создан Troubleshooting Guide

**Estimated time**: 2-3 дня

---

## 📝 Инструкции по использованию

1. **Скопируйте** нужный шаблон в GitHub Issues
2. **Адаптируйте** под конкретную задачу
3. **Назначьте** исполнителя и milestone
4. **Добавьте** соответствующие labels
5. **Свяжите** с Project Board для трекинга

**Приоритеты labels**:
- `critical` - критический приоритет (1-2 недели)
- `high-priority` - высокий приоритет (2-4 недели)  
- `medium-priority` - средний приоритет (1-2 месяца)
- `low-priority` - низкий приоритет (по возможности)
- `tech-debt` - техническая задолженность
