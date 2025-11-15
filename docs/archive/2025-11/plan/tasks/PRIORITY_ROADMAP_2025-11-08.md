# 🎯 ПРИОРИТИЗАЦИЯ ЗАДАЧ - UNITY-v2

**Дата**: 2025-11-08  
**Статус**: Глубокое тестирование завершено  
**Всего задач**: 25 (после удаления дубликатов)  
**Общее время**: ~33 часа (4-5 рабочих дней)

---

## 📊 EXECUTIVE SUMMARY

### Распределение по приоритетам

| Приоритет | Количество | Время | Процент |
|-----------|------------|-------|---------|
| **P0 (Критический)** | 1 | 30 мин | 1.5% |
| **P1 (Высокий)** | 18 | ~28 часов | 84.8% |
| **P2 (Средний)** | 6 | ~4.5 часа | 13.6% |

### Распределение по категориям

| Категория | Количество | Время | Приоритет |
|-----------|------------|-------|-----------|
| 🔒 **Security** | 3 | 8.5 часов | P0-P1 |
| ⚡ **Performance** | 7 | 12.5 часов | P1 |
| 💡 **UX** | 10 | 14 часов | P1-P2 |
| 🐛 **Bugs** | 5 | 5.5 часов | P1-P2 |

---

## 🔴 КРИТИЧЕСКИЙ ПРИОРИТЕТ (P0) - 30 минут

### 1. Удалить hardcoded SUPER_ADMIN_EMAIL

**UUID**: g5pJCxxVt1StypexLwAUyH  
**Категория**: 🔒 Security  
**Время**: 30 минут  
**Приоритет**: P0 - КРИТИЧЕСКИЙ

**Почему это критично**:
1. ❌ **Нарушение Single Source of Truth** - email хранится в БД И в коде
2. ❌ **Риск поломки** - если email изменится в БД, код сломается
3. ❌ **Невозможность масштабирования** - нельзя добавить второго super_admin
4. ❌ **Hardcoded credentials** - плохая практика безопасности

**Бизнес-риски**:
- 🔴 Критический баг при смене email админа
- 🔴 Блокировка доступа к админ-панели
- 🔴 Невозможность делегировать админские права

**Решение**:
```typescript
// ❌ УДАЛИТЬ:
export const SUPER_ADMIN_EMAIL = 'diary@leadshunter.biz';

// ✅ ИСПОЛЬЗОВАТЬ ВЕЗДЕ:
if (profile.role === 'super_admin') {
  // ...
}
```

**Файлы для изменения**:
1. `src/features/admin/dashboard/components/admin-dashboard/constants.ts` - удалить константу
2. Найти все использования: `grep -r "SUPER_ADMIN_EMAIL" src/`
3. Заменить на проверку роли

**Метрики успеха**:
- ✅ 0 упоминаний `SUPER_ADMIN_EMAIL` в коде
- ✅ Все проверки используют `profile.role`
- ✅ Unit tests для проверки роли

**Зависимости**: Нет  
**Блокирует**: Нет  
**Риски**: Минимальные (простая замена)

---

## ⚠️ ВЫСОКИЙ ПРИОРИТЕТ (P1) - 28 часов

### 🔒 SECURITY (8.5 часов)

#### 2. Rate Limiting для Admin Login

**UUID**: nRuvA7ySyw2Ftv1sTHzx5H  
**Время**: 3 часа  
**Приоритет**: P1 - Security

**Почему это важно**:
- ❌ **Нет защиты от brute-force** - можно подбирать пароль бесконечно
- ❌ **Админ панель - критическая точка** - полный доступ к системе
- ❌ **Нет мониторинга попыток** - не видим атаки

**Бизнес-риски**:
- 🔴 Взлом админ-панели → полная компрометация системы
- 🔴 Утечка данных всех пользователей
- 🔴 Репутационные потери

**Решение**:
1. **Supabase Auth Rate Limiting** (рекомендуется):
```typescript
// В Supabase Dashboard → Authentication → Rate Limits
{
  "login": {
    "limit": 5,
    "window": "15m"
  }
}
```

2. **Custom Edge Function** (альтернатива):
```typescript
// supabase/functions/admin-login-rate-limit/index.ts
const attempts = await redis.get(`login_attempts:${email}`);
if (attempts >= 5) {
  return new Response('Too many attempts', { status: 429 });
}
```

3. **Логирование**:
```typescript
await supabase.from('admin_login_attempts').insert({
  email,
  success: false,
  ip_address: request.headers.get('x-forwarded-for'),
  timestamp: new Date()
});
```

**Альтернативы**:
- Cloudflare Rate Limiting (если используется)
- Custom middleware с Redis
- Supabase Auth Hooks

**Метрики успеха**:
- ✅ 0 успешных brute-force атак
- ✅ <1% false positives (блокировка легитимных пользователей)
- ✅ Email уведомления при 3+ попытках

**Зависимости**: Нет  
**Блокирует**: 2FA (лучше сначала Rate Limiting)  
**Риски**: False positives (блокировка легитимных пользователей)

#### 3. 2FA для super_admin

**UUID**: 71buVwkW2b5LZ487ZvXHVb  
**Время**: 4 часа  
**Приоритет**: P1 - Security

**Почему это важно**:
- ❌ **Супер-админ = полный доступ** - компрометация пароля = компрометация системы
- ❌ **Нет второго фактора** - только пароль
- ❌ **Высокая ценность цели** - админ-панель - привлекательная цель для атак

**Бизнес-риски**:
- 🔴 Взлом админ-панели через украденный пароль
- 🔴 Инсайдерские угрозы
- 🔴 Несоответствие стандартам безопасности

**Решение**:
1. **Supabase MFA (TOTP)** - встроенная поддержка:
```typescript
// Включение MFA
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp'
});

// QR код для Google Authenticator
const qrCode = data.totp.qr_code;
```

2. **Обязательная настройка** при первом входе:
```typescript
useEffect(() => {
  if (profile.role === 'super_admin' && !profile.mfa_enabled) {
    setShowMFASetup(true);
  }
}, [profile]);
```

3. **Backup codes** (10 кодов):
```typescript
const backupCodes = generateBackupCodes(10);
await supabase.from('mfa_backup_codes').insert(
  backupCodes.map(code => ({ user_id, code }))
);
```

**Альтернативы**:
- WebAuthn (YubiKey, Touch ID) - более безопасно, но сложнее
- SMS OTP - менее безопасно, но проще
- Email OTP - для backup

**Метрики успеха**:
- ✅ 100% super_admin с включенным 2FA
- ✅ 0 компрометаций аккаунтов
- ✅ <5% обращений в поддержку по восстановлению доступа

**Зависимости**: Rate Limiting (желательно сначала)  
**Блокирует**: Нет  
**Риски**: Lockout (потеря доступа при потере устройства)

#### 4. Подтверждение для опасных действий

**UUID**: fiLsNz7p15pdhLp2mhvhp3  
**Время**: 1.5 часа  
**Приоритет**: P1 - Security + UX

**Почему это важно**:
- ❌ **"Удалить все данные" без подтверждения** - риск случайного удаления
- ❌ **Необратимое действие** - нельзя восстановить
- ❌ **Плохой UX** - нет защиты от ошибок

**Бизнес-риски**:
- 🔴 Потеря всех данных пользователя
- 🔴 Негативные отзывы
- 🔴 Потеря доверия

**Решение**:
```typescript
<ConfirmDialog
  title="⚠️ Удалить все данные?"
  description="Это действие необратимо. Все ваши записи, достижения и настройки будут удалены навсегда."
  confirmText="DELETE" // Требование ввода
  isDangerous={true}
  onConfirm={handleDeleteAllData}
/>
```

**Рекомендации**:
- ✅ Countdown 5 секунд перед удалением
- ✅ Показывать что будет удалено (количество записей, достижений)
- ✅ Возможность отмены в течение 30 секунд (soft delete)
- ✅ Email уведомление после удаления

**Метрики успеха**:
- ✅ 0 случайных удалений
- ✅ <1% отмен после подтверждения

**Зависимости**: Нет  
**Блокирует**: Нет  
**Риски**: Минимальные

---

### ⚡ PERFORMANCE (12.5 часов)

#### 5. Оптимизировать API запросы на HomeScreen

**UUID**: 4EAGNPRCagqjN9DT2xj6EP  
**Время**: 3 часа  
**Приоритет**: P1 - Performance (HIGHEST IMPACT)

**Почему это важно**:
- ⚠️ **5 параллельных API запросов** - медленная загрузка
- ⚠️ **FCP=1500ms, LCP=2000ms** - Needs Improvement
- ⚠️ **Лишняя нагрузка на сервер** - 5x больше запросов

**Бизнес-риски**:
- 🟡 Плохой UX → отток пользователей
- 🟡 Высокие затраты на Supabase (больше API calls)
- 🟡 Медленная загрузка на медленном интернете

**Текущая ситуация**:
```typescript
// 5 отдельных запросов:
1. /rest/v1/entries (все записи)
2. /rest/v1/user_categories (категории)
3. /rest/v1/entries?limit=3 (последние 3)
4. /functions/v1/motivations/cards (мотивационные карточки)
5. /functions/v1/profiles (профиль)
```

**Решение**:
1. **Unified Edge Function** `/functions/v1/home-screen-data`:
```typescript
export default async function handler(req: Request) {
  const userId = await getUserId(req);
  
  const [profile, categories, recentEntries, motivations, stats] = await Promise.all([
    getProfile(userId),
    getCategories(userId),
    getRecentEntries(userId, 3),
    getMotivations(userId),
    getStats(userId)
  ]);
  
  return new Response(JSON.stringify({
    profile,
    categories,
    recentEntries,
    motivations,
    stats
  }));
}
```

2. **Кэширование** (localStorage):
```typescript
const cached = localStorage.getItem('home_data_cache');
if (cached) {
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp < 3600000) { // 1 hour
    setData(data);
    // Обновляем в фоне
    fetchFreshData().then(updateCache);
    return;
  }
}
```

**Ожидаемый результат**:
- FCP: 1500ms → 900-1050ms (↓30-40%)
- LCP: 2000ms → 1200-1400ms (↓30-40%)
- API requests: 5 → 1 (↓80%)
- Supabase costs: ↓80%

**Альтернативы**:
- GraphQL (более гибко, но сложнее)
- Supabase RPC (проще, но менее гибко)
- HTTP/2 Server Push

**Метрики успеха**:
- ✅ FCP <1800ms (Good)
- ✅ LCP <2500ms (Good)
- ✅ 1 API request вместо 5

**Зависимости**: Нет
**Блокирует**: Skeleton loaders (лучше сначала оптимизация)
**Риски**: Сложность Edge Function

#### 6-10. Skeleton Loaders (5.5 часов)

**Задачи**:
- UUID:o6U2hLLw7xddLLozZpqDyu - Admin Dashboard (2 часа)
- UUID:5QirrzfEHsfxJ1yhJSe9DR - Мотивационные карточки (1 час)
- UUID:bdYKExAwwJDAqSU1i4FUXA - HistoryScreen (30 мин)
- UUID:fSvdQM9AAQ4k2si25bVSrX - ReportsScreen (1.5 часа)

**Приоритет**: P1 - Performance
**Общее время**: 5 часов

**Почему это важно**:
- ⚠️ **Пустые экраны при загрузке** - плохой perceived performance
- ⚠️ **Layout shift (CLS)** - элементы прыгают при загрузке
- ⚠️ **Нет feedback** - пользователь не знает что происходит

**Решение (универсальный подход)**:
```typescript
{isLoading ? (
  <Skeleton className="h-24 w-full" />
) : (
  <ActualContent />
)}
```

**Ожидаемый результат**:
- CLS: ↓50-70% (меньше layout shift)
- Perceived performance: +30-40%
- Профессиональный вид

**Рекомендации**:
- ✅ Точные размеры skeleton = реальным компонентам
- ✅ Fade-in анимация при появлении данных
- ✅ Stagger animation для списков
- ✅ Использовать shadcn/ui Skeleton компонент

**Метрики успеха**:
- ✅ CLS <0.1 (Good) на всех экранах
- ✅ 0 пустых экранов при загрузке

**Зависимости**: API оптимизация (желательно сначала)
**Блокирует**: Нет
**Риски**: Минимальные

#### 11. Кэширование мотивационных карточек

**UUID**: wdDqWRjtfcFVdBnp8JEB9b
**Время**: 1 час
**Приоритет**: P1 - Performance

**Почему это важно**:
- ⚠️ **Карточки загружаются каждый раз** - лишние API запросы
- ⚠️ **Медленная загрузка** - 500-1000ms задержка
- ⚠️ **Лишняя нагрузка на сервер**

**Решение**:
```typescript
const loadMotivations = async () => {
  // 1. Проверяем кэш
  const cached = localStorage.getItem('motivations_cache');
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < 3600000) { // 1 hour TTL
      setMotivations(data);
      return; // Используем кэш
    }
  }

  // 2. Загружаем новые
  const response = await fetch('/functions/v1/motivations/cards');
  const data = await response.json();

  // 3. Сохраняем в кэш
  localStorage.setItem('motivations_cache', JSON.stringify({
    data,
    timestamp: Date.now()
  }));

  setMotivations(data);
};
```

**Стратегия**: Stale-while-revalidate
```typescript
// Показываем кэш сразу
setMotivations(cachedData);

// Обновляем в фоне
fetchFreshData().then(newData => {
  setMotivations(newData);
  updateCache(newData);
});
```

**Ожидаемый результат**:
- Мгновенное отображение (0ms вместо 500-1000ms)
- API requests: ↓90%
- Лучший UX

**Метрики успеха**:
- ✅ <100ms время отображения карточек
- ✅ 90% запросов из кэша

**Зависимости**: Нет
**Блокирует**: Нет
**Риски**: Stale data (решается через TTL)

#### 12. Оптимизировать список настроений

**UUID**: gwsEcAzXpYT22YxkJsm5ap
**Время**: 2 часа
**Приоритет**: P1 - Performance + UX

**Почему это важно**:
- ⚠️ **32 настроения в одном списке** - очень длинный скролл
- ⚠️ **Плохой UX** - сложно найти нужное
- ⚠️ **Медленный рендеринг** - много DOM элементов

**Решение**:
1. **Показывать топ-10** по умолчанию:
```typescript
const [showAllMoods, setShowAllMoods] = useState(false);
const sortedMoods = allMoods.sort((a, b) => b.count - a.count);
const displayedMoods = showAllMoods ? sortedMoods : sortedMoods.slice(0, 10);
```

2. **Группировка по категориям**:
```typescript
const groupedMoods = {
  positive: moods.filter(m => m.sentiment === 'positive'),
  neutral: moods.filter(m => m.sentiment === 'neutral'),
  negative: moods.filter(m => m.sentiment === 'negative')
};
```

3. **Кнопка "Показать все"**:
```typescript
<button onClick={() => setShowAllMoods(!showAllMoods)}>
  {showAllMoods ? 'Скрыть' : `Показать все (${allMoods.length - 10})`}
</button>
```

**Ожидаемый результат**:
- Scroll height: ↓70%
- Render time: ↓60%
- UX: +50%

**Метрики успеха**:
- ✅ <10 элементов по умолчанию
- ✅ <500ms время рендеринга

**Зависимости**: Нет
**Блокирует**: Нет
**Риски**: Минимальные

---

### 💡 UX IMPROVEMENTS (14 часов)

#### 13. Auto-refresh Admin Dashboard

**UUID**: 1DQuntTokaZBTA5cJvPGkU
**Время**: 1 час
**Приоритет**: P1 - UX

**Почему это важно**:
- ❌ **Stale data** - админ видит устаревшие данные
- ❌ **Нужно вручную обновлять** - плохой UX

**Решение**:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    handleLoadStats();
  }, 30000); // 30 секунд

  return () => clearInterval(interval);
}, [handleLoadStats]);
```

**Рекомендации**:
- ✅ Индикатор "Обновлено X секунд назад"
- ✅ Кнопка "Pause auto-refresh"
- ✅ Анимация при обновлении

**Метрики успеха**:
- ✅ Данные всегда актуальные (<30 сек)
- ✅ 0 жалоб на stale data

**Зависимости**: Нет
**Блокирует**: Realtime (можно делать параллельно)
**Риски**: Лишняя нагрузка на сервер

#### 14. Supabase Realtime

**UUID**: cJpEYWuNRiJHykNNEPLsmc
**Время**: 2 часа
**Приоритет**: P1 - UX

**Почему это важно**:
- ❌ **Нет real-time updates** - задержка до 30 секунд
- ❌ **Polling** - лишняя нагрузка на сервер

**Решение**:
```typescript
useEffect(() => {
  const channel = supabase
    .channel('admin-stats')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'profiles'
    }, () => {
      handleLoadStats();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

**Преимущества**:
- ✅ Real-time updates (0 задержка)
- ✅ Меньше нагрузки на сервер (нет polling)
- ✅ Актуальные данные всегда

**Метрики успеха**:
- ✅ <1 сек задержка обновления
- ✅ 0 polling запросов

**Зависимости**: Auto-refresh (можно делать параллельно)
**Блокирует**: Нет
**Риски**: Realtime может быть недоступен

#### 15. Draft Auto-save

**UUID**: jCUufao9dtPgXMUA3Sqakk
**Время**: 2 часа
**Приоритет**: P1 - UX

**Почему это важно**:
- ❌ **Потеря текста** при случайном закрытии
- ❌ **Плохой UX** - нужно писать заново

**Решение**:
```typescript
// Автосохранение каждые 5 секунд
useEffect(() => {
  const interval = setInterval(() => {
    if (entryText.trim()) {
      localStorage.setItem('draft_entry', JSON.stringify({
        text: entryText,
        category: selectedCategory,
        timestamp: Date.now()
      }));
    }
  }, 5000);

  return () => clearInterval(interval);
}, [entryText, selectedCategory]);

// Восстановление при загрузке
useEffect(() => {
  const draft = localStorage.getItem('draft_entry');
  if (draft) {
    const { text, category, timestamp } = JSON.parse(draft);
    // Показать toast: "Восстановить черновик?"
  }
}, []);
```

**Рекомендации**:
- ✅ Индикатор "Черновик сохранен"
- ✅ Очистка после отправки
- ✅ Expiry 24 часа

**Метрики успеха**:
- ✅ 0 потерь текста
- ✅ 90%+ восстановлений черновиков

**Зависимости**: Нет
**Блокирует**: Нет
**Риски**: Минимальные

#### 16-20. UX Improvements (8 часов)

**Задачи**:
- UUID:q6yjj8RUGyUaWnegvesNP5 - EmptyState HistoryScreen (1 час)
- UUID:3t1hfw3Z4XvebUJyoAkamy - Визуальное различие достижений (1 час)
- UUID:jnFvPRfwtWuJG73yEhaRBs - Графики ReportsScreen (4 часа)
- UUID:pA61Wr1i1vYcvjTYDyGWQu - Премиум модальное окно (2 часа)

**Общее время**: 8 часов
**Приоритет**: P1 - UX

**Детали см. в TASK_ANALYSIS_2025-11-08.md**

---

### 🐛 BUG FIXES (5.5 часов)

#### 21. Исправить activeToday calculation

**UUID**: vmgekvSsVzyx7tSQFYvKme
**Время**: 1 час
**Приоритет**: P1 - Bug

**Решение**:
```sql
SELECT COUNT(DISTINCT user_id)
FROM user_activity
WHERE DATE(created_at) = CURRENT_DATE;
```

#### 22. Прогресс переполнение 30/20

**UUID**: gDpbfsEFok8Vmh1U766B1K
**Время**: 30 минут
**Приоритет**: P1 - Bug

**Решение**:
```typescript
const displayProgress = Math.min(achievement.current, achievement.target);
```

#### 23. Кнопки периодов не работают

**UUID**: jzgET6Man5bYGE7MS139uz
**Время**: 2 часа
**Приоритет**: P1 - Bug

**Решение**: Добавить state + onClick handler + обновить Edge Function

---

## 📋 СРЕДНИЙ ПРИОРИТЕТ (P2) - 4.5 часа

#### 24. Translation warnings

**UUID**: 4dPGcfUeWPbjw17mtDpjj5
**Время**: 30 минут
**Приоритет**: P2 - Bug

#### 25. Hint для фильтров

**UUID**: hzN7957nCC2tmqFkppR7es
**Время**: 1 час
**Приоритет**: P2 - UX

#### 26. Анимация прогресса

**UUID**: 66j4bwvCT2MYAyb9obQpBV
**Время**: 2 часа
**Приоритет**: P2 - UX

---

## 🎯 РЕКОМЕНДУЕМЫЙ ПОРЯДОК ВЫПОЛНЕНИЯ

### Неделя 1 (День 1-2): Критические + Security

**День 1 (4 часа)**:
1. ✅ P0: Удалить hardcoded SUPER_ADMIN_EMAIL (30 мин)
2. ✅ P1: Rate Limiting для Admin Login (3 часа)
3. ✅ P1: Подтверждение для опасных действий (30 мин)

**День 2 (4 часа)**:
4. ✅ P1: 2FA для super_admin (4 часа)

**Итого**: 8.5 часов

### Неделя 1 (День 3-4): Performance

**День 3 (4 часа)**:
5. ✅ P1: Оптимизировать API запросы HomeScreen (3 часа)
6. ✅ P1: Кэширование мотивационных карточек (1 час)

**День 4 (4 часа)**:
7. ✅ P1: Skeleton loaders Admin Dashboard (2 часа)
8. ✅ P1: Skeleton loaders мотивационные карточки (1 час)
9. ✅ P1: Skeleton loaders HistoryScreen (30 мин)
10. ✅ P1: Skeleton loaders ReportsScreen (30 мин - начало)

**Итого**: 8 часов

### Неделя 1 (День 5): Performance + UX

**День 5 (4 часа)**:
11. ✅ P1: Skeleton loaders ReportsScreen (1 час - завершение)
12. ✅ P1: Оптимизировать список настроений (2 часа)
13. ✅ P1: Auto-refresh Admin Dashboard (1 час)

**Итого**: 4 часа

### Неделя 2 (День 1-2): UX Improvements

**День 1 (4 часа)**:
14. ✅ P1: Supabase Realtime (2 часа)
15. ✅ P1: Draft Auto-save (2 часа)

**День 2 (4 часа)**:
16. ✅ P1: EmptyState HistoryScreen (1 час)
17. ✅ P1: Визуальное различие достижений (1 час)
18. ✅ P1: Премиум модальное окно (2 часа)

**Итого**: 8 часов

### Неделя 2 (День 3): Графики + Bug Fixes

**День 3 (4 часа)**:
19. ✅ P1: Графики ReportsScreen (4 часа)

**Итого**: 4 часа

### Неделя 2 (День 4): Bug Fixes

**День 4 (3.5 часа)**:
20. ✅ P1: Исправить activeToday (1 час)
21. ✅ P1: Прогресс переполнение (30 мин)
22. ✅ P1: Кнопки периодов (2 часа)

**Итого**: 3.5 часа

### Неделя 2 (День 5): P2 Tasks

**День 5 (3.5 часа)**:
23. ✅ P2: Translation warnings (30 мин)
24. ✅ P2: Hint для фильтров (1 час)
25. ✅ P2: Анимация прогресса (2 часа)

**Итого**: 3.5 часа

---

## 📊 МЕТРИКИ УСПЕХА

### Performance
- ✅ FCP <1800ms (Good) на всех экранах
- ✅ LCP <2500ms (Good) на всех экранах
- ✅ INP <200ms (Good) на всех экранах
- ✅ CLS <0.1 (Good) на всех экранах

### Security
- ✅ 100% super_admin с 2FA
- ✅ 0 успешных brute-force атак
- ✅ 0 случайных удалений данных

### UX
- ✅ 0 пустых экранов при загрузке
- ✅ 100% экранов с skeleton loaders
- ✅ 90%+ пользователей понимают как использовать фильтры
- ✅ 0 потерь текста (draft auto-save)

### Bugs
- ✅ 0 критических багов
- ✅ 0 warnings в консоли
- ✅ 100% функционал работает корректно

---

## 💰 БИЗНЕС-ЦЕННОСТЬ

### Высокая ценность (P0-P1 Security)
- **Rate Limiting + 2FA** → Защита от взлома → Сохранение репутации
- **Подтверждение удаления** → Предотвращение потери данных → Удержание пользователей

### Средняя ценность (P1 Performance)
- **API оптимизация** → Быстрая загрузка → Лучший UX → Больше активных пользователей
- **Skeleton loaders** → Профессиональный вид → Доверие пользователей

### Средняя ценность (P1 UX)
- **Графики** → Лучшая аналитика → Больше insights → Больше ценности для пользователей
- **Draft Auto-save** → Нет потери текста → Меньше фрустрации → Удержание пользователей
- **Премиум модальное окно** → Монетизация → Доход

### Низкая ценность (P2)
- **Translation warnings** → Чистая консоль → Меньше шума в Sentry
- **Анимации** → Красивый UI → Wow-эффект

---

**ИТОГО**: 33 часа работы, 4-5 рабочих дней, значительное улучшение качества проекта! 🎉

