# 🔔 PWA улучшения - Детальный план задачи

**Дата обновления**: 2025-01-18  
**Версия**: 1.0  
**Статус**: Фаза 1 - Q1 2025  
**Автор**: Команда UNITY

> **Связь с мастер-планом**: Эта задача детализирует **Задачу 3** из [UNITY_MASTER_PLAN_2025.md](../UNITY_MASTER_PLAN_2025.md)

---

## 🎯 Цель задачи

Превратить PWA в приложение с нативным UX через push уведомления, offline-режим и улучшенные мобильные взаимодействия.

### Ключевые метрики
- **PWA Score**: > 95 баллов в Lighthouse
- **Offline функциональность**: 100% критических функций
- **Push уведомления**: 80% delivery rate
- **Touch interactions**: < 100ms response time

---

## 📋 Детальные задачи

### Неделя 1: Push уведомления

#### 1.1 Supabase Realtime Integration
**Файлы для создания/изменения**:
- `src/shared/lib/notifications/supabase-realtime.ts`
- `src/shared/lib/notifications/push-manager.ts`
- `src/shared/hooks/useNotifications.ts`

**Реализация**:
```typescript
// supabase-realtime.ts
export class SupabaseNotificationManager {
  private supabase: SupabaseClient;
  
  async subscribeToUserNotifications(userId: string) {
    return this.supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        this.showNotification(payload.new);
      })
      .subscribe();
  }
}
```

#### 1.2 Web Push API
**Service Worker обновления**:
- `public/sw.js` - обработка push событий
- `src/shared/lib/notifications/web-push.ts` - регистрация и управление

**Типы уведомлений**:
1. **Напоминания о записях** - ежедневно в 21:00
2. **AI-анализ готов** - когда завершен анализ записи
3. **Мотивационные карточки** - еженедельно
4. **Достижения** - при достижении целей

### Неделя 2: Offline-first архитектура

#### 2.1 Supabase Local Storage
**Файлы для создания**:
- `src/shared/lib/offline/sync-manager.ts`
- `src/shared/lib/offline/conflict-resolver.ts`
- `src/shared/hooks/useOfflineSync.ts`

**Стратегия синхронизации**:
```typescript
// sync-manager.ts
export class OfflineSyncManager {
  async syncWhenOnline() {
    // 1. Отправить локальные изменения
    await this.uploadPendingChanges();
    
    // 2. Получить обновления с сервера
    await this.downloadServerChanges();
    
    // 3. Разрешить конфликты
    await this.resolveConflicts();
  }
}
```

#### 2.2 Offline UI Components
**Компоненты для создания**:
- `src/shared/components/offline/OfflineIndicator.tsx`
- `src/shared/components/offline/SyncStatus.tsx`
- `src/shared/components/offline/ConflictResolver.tsx`

**Offline функциональность**:
- ✅ Создание записей
- ✅ Просмотр истории
- ✅ Базовая навигация
- ❌ AI-анализ (требует интернет)
- ❌ Синхронизация медиафайлов

---

## 📱 Мобильные улучшения

### Touch Interactions

#### Haptic Feedback
**Файл**: `src/shared/lib/mobile/haptics.ts`
```typescript
export class HapticManager {
  static vibrate(pattern: 'light' | 'medium' | 'heavy') {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[pattern]);
    }
  }
}
```

#### Gesture Support
**Компоненты для улучшения**:
- `src/features/mobile/home/components/AchievementHomeScreen.tsx`
- `src/features/mobile/history/components/HistoryScreen.tsx`

**Жесты для добавления**:
- **Pull-to-refresh** - обновление данных
- **Swipe-to-delete** - удаление записей
- **Long-press** - контекстное меню
- **Pinch-to-zoom** - для изображений

### Performance Optimizations

#### Touch Response
```typescript
// Оптимизация touch events
const handleTouchStart = useCallback((e: TouchEvent) => {
  // Предотвращение 300ms delay
  e.preventDefault();
  
  // Haptic feedback
  HapticManager.vibrate('light');
  
  // Immediate visual feedback
  setPressed(true);
}, []);
```

---

## 🧪 Тестирование

### PWA Testing
1. **Lighthouse PWA Audit** - автоматическая проверка
2. **Offline Testing** - симуляция отключения сети
3. **Push Notification Testing** - различные браузеры
4. **Mobile Device Testing** - реальные устройства

### Test Scenarios
1. **Install Flow** - установка PWA на устройство
2. **Offline Usage** - работа без интернета
3. **Background Sync** - синхронизация при восстановлении сети
4. **Push Delivery** - получение уведомлений

---

## 🔧 Техническая реализация

### Service Worker Updates
**Файл**: `public/sw.js`
```javascript
// Background Sync
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncData());
  }
});

// Push Notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png'
    })
  );
});
```

### Manifest Updates
**Файл**: `public/manifest.json`
```json
{
  "name": "UNITY - Дневник достижений",
  "short_name": "UNITY",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#007AFF",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

---

## 📊 Мониторинг и аналитика

### Метрики для отслеживания
- **PWA Install Rate** - процент установок
- **Offline Usage** - время работы без сети
- **Push Open Rate** - процент открытых уведомлений
- **Touch Response Time** - скорость реакции на касания

### Инструменты
- **Google Analytics** - PWA события
- **Sentry** - ошибки offline режима
- **Custom Analytics** - метрики уведомлений

---

## ✅ Критерии готовности

### Definition of Done
- [ ] Push уведомления работают во всех браузерах
- [ ] Offline режим покрывает 100% критических функций
- [ ] PWA устанавливается на все устройства
- [ ] Touch interactions < 100ms response time
- [ ] Haptic feedback работает где поддерживается
- [ ] Background sync восстанавливает данные

### Риски и митигация
1. **Браузерная совместимость** → Тестирование на всех платформах
2. **Сложность offline логики** → Поэтапная реализация
3. **Push notification permissions** → UX для запроса разрешений

---

## 🔗 Связанные документы

- [UNITY_MASTER_PLAN_2025.md](../UNITY_MASTER_PLAN_2025.md) - общая стратегия
- [performance-optimization.md](./performance-optimization.md) - оптимизация производительности
- [ai-usage-system.md](../ai-usage-system.md) - AI система

---

**🎯 Результат**: PWA с нативным UX, полноценной offline работой и умными уведомлениями.
