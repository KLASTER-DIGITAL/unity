# PWA Push Notifications - Testing Tasks

**Дата создания**: 2025-10-28  
**Статус**: ⏸️ ОТЛОЖЕНО  
**Приоритет**: P1 (после основных P0 задач)

---

## 📋 Задачи для тестирования

### 1. Тестирование на iOS (Safari PWA) - 1 час

**Описание**: Протестировать PWA Push Notifications на реальном iPhone

**Шаги**:
1. Установить PWA на Home Screen (iPhone с iOS 16.4+)
2. Войти в аккаунт: rustam@leadshunter.biz / demo123
3. Включить Push Notifications в Settings
4. Создать новую запись → проверить realtime push
5. Создать достижение (is_achievement = true) → проверить push
6. Отправить test push из админ-панели
7. Проверить notification click actions
8. Заполнить отчет о тестировании

**Ожидаемый результат**:
- ✅ Push приходят на iPhone
- ✅ Notification click открывает PWA
- ✅ Нет ошибок в console

**Документация**: `docs/guides/PWA_PUSH_TESTING.md`

---

### 2. Тестирование на Android (Chrome) - 1 час

**Описание**: Протестировать PWA Push Notifications на реальном Android устройстве

**Шаги**:
1. Открыть Chrome на Android
2. Перейти на https://unity-wine.vercel.app
3. Войти в аккаунт: rustam@leadshunter.biz / demo123
4. Включить Push Notifications в Settings
5. Создать новую запись → проверить realtime push
6. Создать достижение → проверить push
7. Отправить test push из админ-панели
8. Проверить notification click actions
9. Заполнить отчет о тестировании

**Ожидаемый результат**:
- ✅ Push приходят на Android
- ✅ Notification click открывает Chrome/PWA
- ✅ Нет ошибок в console

**Документация**: `docs/guides/PWA_PUSH_TESTING.md`

---

### 3. Мониторинг метрик - ongoing

**Описание**: Проверять метрики push уведомлений в production

**Что проверять**:
1. **Админ-панель** (https://unity-wine.vercel.app/?view=admin):
   - Settings → Push Notifications
   - Total Subscriptions (должно расти)
   - Total Sent, Total Delivered, Total Opened
   - Delivery Rate (>= 95%)
   - Open Rate (>= 10%)

2. **Supabase Dashboard**:
   - Edge Functions → push-sender logs
   - Edge Functions → push-realtime-trigger logs
   - Edge Functions → push-scheduled logs
   - Database → cron.job_run_details (проверка cron jobs)

3. **Database**:
   - `push_subscriptions` (активные подписки)
   - `push_notifications_history` (история отправленных push)

**Частота**: Ежедневно первую неделю, потом еженедельно

---

## 📊 Метрики успеха

### Критерии успешного тестирования

- ✅ Push работают на iOS (Safari PWA)
- ✅ Push работают на Android (Chrome)
- ✅ Permission flow работает корректно
- ✅ Notification click actions работают
- ✅ Realtime push работают (при создании записи/достижения)
- ✅ Scheduled push работают (ежедневные напоминания)
- ✅ Manual push работают (из админ-панели)
- ✅ Статистика в админ-панели обновляется
- ✅ Нет ошибок в console logs

### Ожидаемые показатели

- **Delivery rate**: >= 95% (total_delivered / total_sent)
- **Open rate**: >= 10% (total_opened / total_delivered)
- **Error rate**: <= 5% (failed / total)
- **Subscription growth**: +10-20% в неделю

---

## 🐛 Известные проблемы

### iOS

1. **Push работают ТОЛЬКО в PWA режиме** (установленное приложение)
   - НЕ работают в Safari браузере
   - Требуется iOS 16.4+

2. **Разрешения могут сбрасываться**
   - При переустановке PWA
   - При очистке данных Safari

### Android

1. **Push работают и в браузере, и в PWA**
   - Более гибкая система разрешений
   - Лучшая поддержка Web Push API

2. **Battery optimization может блокировать push**
   - Нужно добавить приложение в исключения

---

## 📝 Шаблон отчета о тестировании

```markdown
# PWA Push Notifications Testing Report

**Дата**: YYYY-MM-DD  
**Тестировщик**: [Имя]  
**Устройства**: [iOS/Android версии]

## iOS Testing

- [ ] PWA установлено на Home Screen
- [ ] Push permissions granted
- [ ] Realtime push работают (обычная запись)
- [ ] Realtime push работают (достижение)
- [ ] Manual push работают
- [ ] Notification click работает
- [ ] Нет ошибок в console

**Проблемы**: [Описание проблем, если есть]

## Android Testing

- [ ] PWA установлено (опционально)
- [ ] Push permissions granted
- [ ] Realtime push работают (обычная запись)
- [ ] Realtime push работают (достижение)
- [ ] Manual push работают
- [ ] Notification click работает
- [ ] Нет ошибок в console

**Проблемы**: [Описание проблем, если есть]

## Метрики (из админ-панели)

- Total Subscriptions: [число]
- Total Sent: [число]
- Total Delivered: [число]
- Total Opened: [число]
- Delivery Rate: [%]
- Open Rate: [%]

## Выводы

[Общие выводы и рекомендации]
```

---

## 🔗 Связанные документы

- **Гайд по тестированию**: `docs/guides/PWA_PUSH_TESTING.md`
- **Edge Functions**:
  - `supabase/functions/push-sender/index.ts`
  - `supabase/functions/push-realtime-trigger/index.ts`
  - `supabase/functions/push-scheduled/index.ts`
- **Миграция**: `supabase/migrations/20251028_setup_push_notifications_automation.sql`
- **Admin Panel**: `src/components/screens/admin/settings/PushNotificationManager.tsx`

---

## ⏭️ Следующие шаги после тестирования

1. ✅ Собрать feedback от пользователей
2. ✅ Оптимизировать notification content на основе open rate
3. ✅ Добавить A/B тестирование для разных типов уведомлений
4. ✅ Настроить персонализацию (время отправки, частота)
5. ✅ Добавить rich notifications (изображения, actions)

