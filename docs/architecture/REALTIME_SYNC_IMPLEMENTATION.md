# Real-time Синхронизация Данных - Реализация

**Дата**: 21 ноября 2025  
**Статус**: ✅ Реализовано  
**Цель**: Решение проблемы рассинхронизации данных между экранами (главная vs достижения)

---

## 🎯 Проблема

Пользователь видит разные данные на разных экранах:
- **Главная страница**: 12 дней подряд (локальный расчет)
- **Страница достижений**: 0 дней подряд (серверный кэш, требует обновления страницы)

### Причина
1. Главная использует `useUserData` → прямой запрос к `entries` → локальный расчет streak
2. Достижения используют Edge Function `achievements-calculate` → серверный кэш
3. Нет real-time синхронизации при изменении `entries`

---

## ✅ Решение

### 1. Real-time подписки на изменения `entries`

#### React Native (`app-shared/hooks/useUserData.ts`)
```typescript
// ✅ НОВОЕ: Real-time subscription для entries - пересчет статистики
useEffect(() => {
    if (!userId) return;

    const channel = supabase
        .channel(`user-stats:${userId}`)
        .on('postgres_changes', {
            event: '*', // INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'entries',
            filter: `user_id=eq.${userId}`,
        }, (payload) => {
            // Перезагружаем данные для пересчета streak
            fetchUserData();
        })
        .subscribe();

    return () => supabase.removeChannel(channel);
}, [userId, fetchUserData]);
```

#### PWA (`src/features/mobile/achievements/components/AchievementsScreen.tsx`)
```typescript
// ✅ НОВОЕ: Real-time подписка на изменения entries для автообновления статистики
useEffect(() => {
    const userId = userData?.user?.id || userData?.id;
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
        .channel(`achievements-stats:${userId}`)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'entries',
            filter: `user_id=eq.${userId}`,
        }, () => {
            loadData(); // Перезагружаем статистику
        })
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'user_achievements',
            filter: `user_id=eq.${userId}`,
        }, () => {
            loadData(); // Обновляем earnedCount
        })
        .subscribe();

    return () => supabase.removeChannel(channel);
}, [userId, loadData]);
```

---

### 2. Глобальный Store для Статистики

**Файл**: `src/shared/stores/useStatsStore.ts`

#### Возможности:
- 🎯 **Единый источник истины** - все экраны используют одни данные
- ⚡ **Умный кэш** - TTL 30 секунд, снижает нагрузку на сервер
- 🔄 **Auto-refresh** - real-time подписка инвалидирует кэш при изменениях
- 🧹 **Cleanup** - автоматическая отписка при размонтировании

#### API:
```typescript
import { useUserStats } from '@/shared/stores/useStatsStore';

function MyComponent({ userId }: { userId: string }) {
    const { stats, isLoading, fetchStats, subscribeToUpdates } = useUserStats(userId);
    
    useEffect(() => {
        fetchStats(userId); // Загрузка
    }, [userId, fetchStats]);
    
    useEffect(() => {
        const unsubscribe = subscribeToUpdates(userId); // Real-time
        return unsubscribe;
    }, [userId, subscribeToUpdates]);
    
    return <div>Streak: {stats.currentStreak}</div>;
}
```

---

### 3. Архитектура Синхронизации

```
┌─────────────────────────────────────────────────────────────┐
│                      Пользователь                            │
│                    (создает запись)                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase PostgreSQL                         │
│                   (таблица entries)                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ INSERT event
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ useUserData  │ │ AchieveScreen│ │  StatsStore  │
│   (Home)     │ │ (Achievements│ │   (Global)   │
│              │ │     Page)    │ │              │
│ Real-time ✅ │ │ Real-time ✅ │ │ Real-time ✅ │
└──────────────┘ └──────────────┘ └──────────────┘
        │               │               │
        │  fetchData()  │  loadData()   │  fetchStats()
        │               │               │
        └───────────────┴───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Edge Function:               │
        │  achievements-calculate       │
        │  (пересчет статистики)        │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  UI обновляется автоматически │
        │  БЕЗ перезагрузки страницы    │
        └───────────────────────────────┘
```

---

## 📊 Результаты

### До:
- ❌ Рассинхронизация данных между экранами
- ❌ Требуется обновление страницы (F5)
- ❌ Множественные запросы к одним данным
- ❌ Плохой UX

### После:
- ✅ **Мгновенная синхронизация** - все экраны видят одинаковые данные
- ✅ **Автообновление** - UI обновляется без перезагрузок
- ✅ **Оптимизация** - кэш снижает нагрузку на сервер
- ✅ **Отличный UX** - данные всегда актуальны

---

## 🔧 Технические Детали

### Используемые технологии:
- **Supabase Realtime** - PostgreSQL Change Data Capture (CDC)
- **Zustand** - State management для глобального store
- **React Hooks** - useEffect, useCallback для подписок

### Real-time события:
- `INSERT` - новая запись создана
- `UPDATE` - запись обновлена
- `DELETE` - запись удалена

### Таблицы с подписками:
1. `entries` - записи дневника (триггер пересчета статистики)
2. `user_achievements` - достижения пользователя (обновление earnedCount)

---

## 🧪 Тестирование

### Ручное тестирование:
1. Открыть главную страницу → увидеть текущий streak
2. Открыть страницу достижений → увидеть тот же streak
3. Создать новую запись на главной
4. **Без перезагрузки** проверить:
   - ✅ Главная: streak обновился
   - ✅ Достижения: streak обновился
   - ✅ Оба экрана показывают одинаковые данные

### Автоматическое тестирование:
```bash
# Проверка подписок в консоли браузера
# Должны увидеть логи:
# [useUserData RN] 🔔 Entry changed, recalculating stats
# [AchievementsScreen] 🔔 Entry changed, reloading stats
# [StatsStore] 🔔 Entry changed, invalidating cache
```

---

## 📝 Следующие шаги

### Опционально (для дальнейшей оптимизации):
1. **Оптимистичные обновления** - обновлять UI до ответа сервера
2. **Batch updates** - группировать множественные изменения
3. **Selective invalidation** - инвалидировать только изменившиеся данные
4. **Offline support** - кэш для работы без интернета

---

## 🐛 Известные ограничения

1. **Latency** - небольшая задержка ~100-500ms для real-time событий
2. **Network** - требуется стабильное соединение для подписок
3. **Cache TTL** - данные могут быть устаревшими до 30 сек (если нет изменений)

---

## 📚 Связанные файлы

### Hooks:
- `app-shared/hooks/useUserData.ts` - RN версия с real-time
- `src/shared/hooks/useHomeScreenData.ts` - PWA версия (уже была)
- `src/shared/hooks/useAchievements.ts` - достижения с real-time
- `src/shared/hooks/useEntries.ts` - записи с real-time

### Stores:
- `src/shared/stores/useStatsStore.ts` - **НОВЫЙ** глобальный store

### Screens:
- `src/features/mobile/achievements/components/AchievementsScreen.tsx` - PWA
- `app/(tabs)/achievements.tsx` - React Native

### Edge Functions:
- `supabase/functions/achievements-calculate/index.ts` - расчет статистики

---

## 👥 Авторы
- Реализация: AI Assistant
- Тестирование: Rustam Karimov
- Дата: 21 ноября 2025

