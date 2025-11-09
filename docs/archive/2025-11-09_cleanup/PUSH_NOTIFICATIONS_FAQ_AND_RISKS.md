# ❓ FAQ и потенциальные риски

**Дата**: 2025-11-09  
**Версия**: 1.0

---

## ❓ ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ

### Q1: Почему собственная реализация, а не SendPulse?

**A**: Три основные причины:

1. **Финансовая выгода**: $2,328/год экономии
   - SendPulse: $200/месяц = $2,400/год
   - Supabase: $6/месяц = $72/год

2. **Гибкость**: Полный контроль
   - Кастомное время уведомлений
   - Интеграция с i18n (7 языков)
   - Кастомные типы уведомлений

3. **React Native готовность**: Platform Adapter
   - Миграция Q3 2025 будет проще
   - Нет зависимости от SendPulse API

---

### Q2: Сколько времени займет реализация?

**A**: 7-10 дней в зависимости от параллелизма:

- **Фаза 1** (Критические исправления): 2 дня
- **Фаза 2** (UX улучшения): 2 дня
- **Фаза 3** (React Native): 3 дня
- **Фаза 4** (Аналитика): 3 дня

**Параллельная разработка**: 7 дней (если 2 разработчика)

---

### Q3: Какие риски при реализации?

**A**: Основные риски:

1. **Circular dependencies** (Vite)
   - Решение: Избегать barrel exports, использовать Platform Adapters

2. **React Native несовместимость**
   - Решение: Использовать Universal Components

3. **Производительность при 100K пользователей**
   - Решение: Оптимизировать Edge Functions, добавить индексы БД

4. **Временные зоны**
   - Решение: Хранить timezone в profiles, использовать UTC в БД

---

### Q4: Как тестировать на React Native?

**A**: Два способа:

1. **Expo Go** (быстро, но ограничено)
   ```bash
   npm run start:expo
   # Сканировать QR код в Expo Go app
   ```

2. **Development Build** (полнофункционально)
   ```bash
   eas build --platform android --profile development-device
   # Установить APK на телефон
   npm run start:expo --dev-client
   ```

---

### Q5: Как обработать временные зоны?

**A**: Три подхода:

1. **Хранить в profiles**
   ```typescript
   notification_timezone: 'UTC+3' // или 'Europe/Moscow'
   ```

2. **Использовать expo-localization** (React Native)
   ```typescript
   import * as Localization from 'expo-localization';
   const timezone = Localization.timezone;
   ```

3. **Использовать navigator.language** (Web)
   ```typescript
   const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
   ```

---

### Q6: Как интегрировать с i18n?

**A**: Использовать существующую систему:

```typescript
// Все строки через i18n
const { t } = useTranslation();

// Примеры ключей
t('notifications.modal.title')
t('notifications.types.dailyReminder')
t('notifications.time.morning')
```

---

### Q7: Как обработать ошибки при сохранении?

**A**: Использовать try-catch и toast:

```typescript
try {
  await saveNotificationSettings(userId, settings);
  toast.success('Настройки сохранены');
} catch (error) {
  console.error('Error:', error);
  toast.error('Ошибка сохранения');
  // Retry logic
}
```

---

### Q8: Как отслеживать открытия уведомлений?

**A**: Использовать Service Worker:

```javascript
// public/service-worker.js
self.addEventListener('push', (event) => {
  // Track in analytics
  trackPushEvent(userId, notificationId, 'delivered');
  
  // Show notification
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  // Track click
  trackPushEvent(userId, notificationId, 'clicked');
});
```

---

## ⚠️ ПОТЕНЦИАЛЬНЫЕ РИСКИ

### Риск 1: Circular Dependencies в Vite 🔴 КРИТИЧНО

**Проблема**: Если Platform Adapter импортирует из компонента, который импортирует из Platform Adapter

**Симптом**: `ReferenceError: Cannot access 'X' before initialization`

**Решение**:
- ✅ Избегать barrel exports (index.ts)
- ✅ Импортировать напрямую из файлов
- ✅ Использовать Platform Adapters правильно
- ✅ Проверять build warnings

**Проверка**:
```bash
npm run build
# Ищите: "circular dependency detected"
```

---

### Риск 2: React Native Несовместимость 🔴 КРИТИЧНО

**Проблема**: Использование Radix UI напрямую (не совместим с RN)

**Симптом**: `Error: Radix UI component not available in React Native`

**Решение**:
- ✅ ТОЛЬКО Universal Components
- ✅ ТОЛЬКО Platform Adapters
- ✅ Тестировать на обеих платформах

**Проверка**:
```bash
npm run start:expo
# Проверить консоль Metro bundler
```

---

### Риск 3: Производительность при 100K пользователей 🟠 ВАЖНО

**Проблема**: Edge Functions медленные при большом количестве пользователей

**Симптом**: Timeout при отправке уведомлений

**Решение**:
- ✅ Оптимизировать Edge Functions (< 300 строк)
- ✅ Добавить индексы в БД
- ✅ Использовать batch operations
- ✅ Добавить кэширование

**Проверка**:
```bash
# Supabase Dashboard → Edge Functions → Logs
# Ищите: duration > 5000ms
```

---

### Риск 4: Временные зоны 🟠 ВАЖНО

**Проблема**: Уведомления приходят в неправильное время

**Симптом**: Пользователь в UTC+3, но уведомление в UTC

**Решение**:
- ✅ Хранить timezone в profiles
- ✅ Использовать UTC в БД
- ✅ Конвертировать при отправке
- ✅ Тестировать с разными timezone

**Проверка**:
```typescript
// Проверить что время конвертируется правильно
const userTime = convertToUserTimezone(utcTime, userTimezone);
```

---

### Риск 5: Утечка данных 🔴 КРИТИЧНО

**Проблема**: Пользователь видит чужие уведомления

**Симптом**: Пользователь A видит уведомления пользователя B

**Решение**:
- ✅ Правильные RLS policies
- ✅ Проверка auth.uid() в запросах
- ✅ Тестирование с разными пользователями

**Проверка**:
```sql
-- Проверить RLS policies
SELECT * FROM pg_policies WHERE tablename = 'push_subscriptions';
```

---

### Риск 6: Service Worker Кэширование 🟡 МОЖНО ОТЛОЖИТЬ

**Проблема**: Старая версия Service Worker кэшируется

**Симптом**: Изменения не применяются

**Решение**:
- ✅ Добавить версию в Service Worker
- ✅ Использовать skipWaiting()
- ✅ Тестировать с Ctrl+Shift+Delete (очистить кэш)

**Проверка**:
```javascript
// public/service-worker.js
const CACHE_VERSION = 'v1.0.0';
```

---

## 🛡️ MITIGATION STRATEGIES

### Для каждого риска

| Риск | Вероятность | Влияние | Mitigation |
|------|-------------|--------|-----------|
| Circular deps | Средняя | Высокое | Code review, testing |
| React Native | Высокая | Высокое | Platform Adapters, testing |
| Производительность | Низкая | Высокое | Оптимизация, мониторинг |
| Временные зоны | Средняя | Среднее | Тестирование, документация |
| Утечка данных | Низкая | Критичное | RLS policies, тестирование |
| SW кэширование | Средняя | Среднее | Версионирование, тестирование |

---

## ✅ ПРОВЕРКИ ПЕРЕД РЕЛИЗОМ

### Безопасность
- [ ] RLS policies настроены
- [ ] VAPID keys в secrets
- [ ] Нет утечек данных
- [ ] Supabase Advisors = 0 issues

### Производительность
- [ ] Edge Functions < 5 сек
- [ ] БД индексы добавлены
- [ ] Нет N+1 проблем
- [ ] Batch operations используются

### Совместимость
- [ ] PWA работает (Chrome)
- [ ] React Native работает (Expo Go)
- [ ] Временные зоны правильные
- [ ] i18n работает на всех языках

### Качество кода
- [ ] 0 errors в консоли
- [ ] 0 errors в Metro bundler
- [ ] Lint проходит
- [ ] TypeScript errors = 0

---

## 📞 КОНТАКТЫ ДЛЯ ПОМОЩИ

**Проблемы с реализацией**:
- Проверьте консоль браузера (F12)
- Проверьте Metro bundler (React Native)
- Проверьте Supabase logs
- Используйте Sentry для отслеживания

**Вопросы по архитектуре**:
- Обратитесь к документам анализа
- Используйте Context7 MCP для документации
- Используйте codebase-retrieval для поиска кода

---

**Статус**: ✅ Готово к реализации  
**Сложность**: Средняя  
**Время**: 7-10 дней  
**Риск**: Средний (с mitigation strategies)

