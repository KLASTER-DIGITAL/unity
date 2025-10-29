# PWA Push Notifications Testing Guide

**Дата**: 2025-10-28  
**Версия**: 1.0  
**Статус**: ✅ ГОТОВО К ТЕСТИРОВАНИЮ

---

## 📋 Обзор

Этот гайд описывает процесс тестирования PWA Push Notifications на реальных устройствах iOS и Android.

---

## 🎯 Цели тестирования

1. ✅ Проверить работу push уведомлений на iOS (Safari)
2. ✅ Проверить работу push уведомлений на Android (Chrome)
3. ✅ Проверить permission flow (запрос разрешений)
4. ✅ Проверить notification click actions (переход по URL)
5. ✅ Проверить realtime push (при создании записи/достижения)
6. ✅ Проверить scheduled push (ежедневные напоминания)

---

## 🔧 Предварительные требования

### Для iOS (Safari)
- iPhone с iOS 16.4+ (Web Push поддерживается с iOS 16.4)
- Safari браузер
- Добавление PWA на Home Screen (обязательно!)
- Интернет соединение

### Для Android (Chrome)
- Android устройство с Android 5.0+
- Chrome браузер (последняя версия)
- Интернет соединение

### Для обоих платформ
- Доступ к production URL: https://unity-wine.vercel.app
- Тестовый аккаунт: rustam@leadshunter.biz / demo123
- Доступ к админ-панели: diary@leadshunter.biz / admin123

---

## 📱 Тестирование на iOS (Safari)

### Шаг 1: Установка PWA

1. Откройте Safari на iPhone
2. Перейдите на https://unity-wine.vercel.app
3. Войдите в аккаунт: rustam@leadshunter.biz / demo123
4. Нажмите кнопку "Share" (квадрат со стрелкой вверх)
5. Выберите "Add to Home Screen"
6. Нажмите "Add"

**Важно**: Web Push на iOS работает ТОЛЬКО в PWA режиме (установленное приложение), НЕ в Safari браузере!

### Шаг 2: Включение Push Notifications

1. Откройте установленное PWA приложение с Home Screen
2. Перейдите в Settings (⚙️)
3. Найдите секцию "Push Notifications"
4. Нажмите "Enable Push Notifications"
5. Разрешите уведомления в системном диалоге iOS

**Ожидаемый результат**:
- ✅ Системный диалог iOS с запросом разрешения
- ✅ После разрешения - зеленая галочка "Push Notifications Enabled"
- ✅ Subscription сохранена в БД (проверить в админ-панели)

### Шаг 3: Тестирование Realtime Push

1. Создайте новую запись в дневнике
2. Нажмите "Save"
3. Закройте PWA приложение (свернуть в фон)
4. Подождите 2-3 секунды

**Ожидаемый результат**:
- ✅ Push уведомление "✅ Запись сохранена!"
- ✅ Текст: "Ваша запись успешно добавлена в дневник"
- ✅ Иконка приложения
- ✅ При клике - открывается PWA с записью

### Шаг 4: Тестирование Manual Push (из админ-панели)

1. Откройте админ-панель на компьютере: https://unity-wine.vercel.app/?view=admin
2. Войдите: diary@leadshunter.biz / admin123
3. Перейдите в Settings → Push Notifications
4. Нажмите "Send Test Push"
5. Проверьте iPhone

**Ожидаемый результат**:
- ✅ Push уведомление на iPhone
- ✅ Статистика в админ-панели обновилась (Total Sent +1)

### Шаг 5: Тестирование Notification Click

1. Получите push уведомление
2. Кликните на уведомление
3. Проверьте что PWA открылось

**Ожидаемый результат**:
- ✅ PWA открывается
- ✅ Переход на правильный URL (например, /?view=history&entry=xxx)
- ✅ Notification close event отправлен в analytics

---

## 🤖 Тестирование на Android (Chrome)

### Шаг 1: Установка PWA (опционально)

1. Откройте Chrome на Android
2. Перейдите на https://unity-wine.vercel.app
3. Войдите в аккаунт: rustam@leadshunter.biz / demo123
4. Chrome предложит "Add to Home screen" - нажмите "Add"

**Примечание**: На Android push работает и в браузере, и в PWA режиме.

### Шаг 2: Включение Push Notifications

1. Перейдите в Settings (⚙️)
2. Найдите секцию "Push Notifications"
3. Нажмите "Enable Push Notifications"
4. Разрешите уведомления в системном диалоге Android

**Ожидаемый результат**:
- ✅ Системный диалог Android с запросом разрешения
- ✅ После разрешения - зеленая галочка "Push Notifications Enabled"
- ✅ Subscription сохранена в БД

### Шаг 3: Тестирование Realtime Push

1. Создайте новую запись в дневнике
2. Нажмите "Save"
3. Закройте Chrome (свернуть в фон)
4. Подождите 2-3 секунды

**Ожидаемый результат**:
- ✅ Push уведомление "✅ Запись сохранена!"
- ✅ Текст: "Ваша запись успешно добавлена в дневник"
- ✅ Иконка приложения
- ✅ При клике - открывается Chrome с записью

### Шаг 4: Тестирование Manual Push

Аналогично iOS (см. выше).

### Шаг 5: Тестирование Notification Click

Аналогично iOS (см. выше).

---

## 🔍 Проверка в админ-панели

### Просмотр активных subscriptions

1. Откройте админ-панель: https://unity-wine.vercel.app/?view=admin
2. Войдите: diary@leadshunter.biz / admin123
3. Перейдите в Settings → Push Notifications
4. Проверьте статистику:
   - Total Subscriptions: должно быть >= 1
   - Active Subscriptions: должно быть >= 1

### Просмотр истории отправленных push

1. В админ-панели перейдите в Database → push_notifications_history
2. Проверьте последние записи:
   - title, body
   - total_sent, total_delivered, total_opened
   - status (sent/failed)
   - metadata (errors, если есть)

---

## 🐛 Troubleshooting

### iOS: Push не приходят

**Проблема**: Push уведомления не приходят на iPhone.

**Решения**:
1. ✅ Убедитесь что PWA установлено на Home Screen (НЕ Safari браузер!)
2. ✅ Проверьте что разрешения даны в Settings → Notifications → [App Name]
3. ✅ Проверьте что iPhone подключен к интернету
4. ✅ Проверьте что iOS версия >= 16.4
5. ✅ Перезапустите PWA приложение

### Android: Push не приходят

**Проблема**: Push уведомления не приходят на Android.

**Решения**:
1. ✅ Проверьте что разрешения даны в Chrome Settings → Site Settings → Notifications
2. ✅ Проверьте что Android подключен к интернету
3. ✅ Проверьте что Chrome обновлен до последней версии
4. ✅ Очистите кэш Chrome и попробуйте снова

### Push приходят, но не открываются

**Проблема**: При клике на push ничего не происходит.

**Решения**:
1. ✅ Проверьте Service Worker в DevTools → Application → Service Workers
2. ✅ Проверьте console logs в DevTools
3. ✅ Проверьте что URL в notification data корректный
4. ✅ Перезапустите приложение

### VAPID keys не работают

**Проблема**: Push отправляются, но не доставляются (HTTP 401/403).

**Решения**:
1. ✅ Перегенерируйте VAPID keys в админ-панели
2. ✅ Проверьте что VAPID keys сохранены в admin_settings
3. ✅ Проверьте Edge Function logs в Supabase Dashboard
4. ✅ Проверьте что используется правильный VAPID public key при subscription

---

## 📊 Метрики успеха

### Критерии успешного тестирования

- ✅ Push работают на iOS (Safari PWA)
- ✅ Push работают на Android (Chrome)
- ✅ Permission flow работает корректно
- ✅ Notification click actions работают
- ✅ Realtime push работают (при создании записи)
- ✅ Manual push работают (из админ-панели)
- ✅ Статистика в админ-панели обновляется
- ✅ Нет ошибок в console logs

### Ожидаемые показатели

- **Delivery rate**: >= 95% (total_delivered / total_sent)
- **Open rate**: >= 10% (total_opened / total_delivered)
- **Error rate**: <= 5% (failed / total)

---

## 📝 Отчет о тестировании

### Шаблон отчета

```markdown
# PWA Push Notifications Testing Report

**Дата**: YYYY-MM-DD  
**Тестировщик**: [Имя]  
**Устройства**: [iOS/Android версии]

## iOS Testing

- [ ] PWA установлено на Home Screen
- [ ] Push permissions granted
- [ ] Realtime push работают
- [ ] Manual push работают
- [ ] Notification click работает
- [ ] Нет ошибок в console

**Проблемы**: [Описание проблем, если есть]

## Android Testing

- [ ] PWA установлено (опционально)
- [ ] Push permissions granted
- [ ] Realtime push работают
- [ ] Manual push работают
- [ ] Notification click работает
- [ ] Нет ошибок в console

**Проблемы**: [Описание проблем, если есть]

## Метрики

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

## 🚀 Следующие шаги

После успешного тестирования:

1. ✅ Включить scheduled push (ежедневные напоминания в 21:00)
2. ✅ Настроить Database Webhooks для realtime push
3. ✅ Мониторить метрики в production
4. ✅ Собрать feedback от пользователей
5. ✅ Оптимизировать notification content на основе open rate

---

## 📚 Дополнительные ресурсы

- [Web Push API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [iOS Web Push Support](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [VAPID Protocol](https://datatracker.ietf.org/doc/html/rfc8292)

