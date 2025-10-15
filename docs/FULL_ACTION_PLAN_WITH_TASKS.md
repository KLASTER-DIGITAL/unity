# 🎯 ПОЛНЫЙ ПЛАН ДЕЙСТВИЙ С ТАСКАМИ

**Проект:** UNITY Diary Application  
**Дата:** 15 октября 2025  
**Статус:** НАЧИНАЕМ ИСПРАВЛЕНИЯ

---

## 📋 АНАЛИЗ ТЕКУЩЕЙ СИТУАЦИИ

### ❌ КРИТИЧЕСКИЕ ПРОБЛЕМЫ:

1. **Edge Function слишком большая** (2140 строк > 1800 лимит деплоя)
2. **Таблица `entry_summaries` пустая** - нарушена Token Optimization Strategy
3. **Моковые данные** в ReportsScreen и AchievementsScreen
4. **Отсутствует блок "Лента последних записей"** на главном экране (согласно Figma)
5. **Нет поддержки загрузки фото** в записях

### ✅ ЧТО РАБОТАЕТ:

- ✅ Создание записей с AI анализом
- ✅ Мотивационные карточки (но показывают defaults)
- ✅ История записей
- ✅ Профиль пользователя
- ✅ JWT авторизация

### 📊 РЕАЛЬНЫЕ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ:

```
User: rustam@leadshunter.biz
ID: 726a9369-8c28-4134-b03f-3c29ad1235f4

✅ entries: 5 записей
❌ entry_summaries: 0 записей (КРИТИЧНО!)
```

**Записи:**
1. 13.10 - Работа - "Завершил важный проект"
2. 12.10 - Здоровье - "Утренняя пробежка 5 км"
3. 11.10 - Работа - "Встреча с клиентом"
4. 10.10 - Обучение - "Изучил React Server Components"
5. 09.10 - Работа - "Помог коллеге"

---

## 🎯 ПЛАН ДЕЙСТВИЙ (ПРИОРИТИЗИРОВАННЫЙ)

### 📅 НЕДЕЛЯ 1: КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ (7 дней)

#### **ДЕНЬ 1-2: Исправить entry_summaries** 🔴 КРИТИЧНО

**Таска:** `🔴 КРИТИЧНО: Исправить сохранение entry_summaries`

**Проблема:** При создании записи не сохраняется в `entry_summaries` таблицу

**Решение:**

1. Найти эндпоинт `/api/chat/analyze` в `supabase/functions/make-server-9729c493/index.ts`
2. Добавить INSERT в `entry_summaries` после сохранения `entry`

**Код для добавления:**

```typescript
// После сохранения entry
const { data: entry, error: entryError } = await supabase
  .from('entries')
  .insert({
    user_id: userId,
    text,
    ai_summary: analysis.summary,
    ai_insight: analysis.insight,
    sentiment: analysis.sentiment,
    category: analysis.category,
    tags: analysis.tags,
    mood: analysis.mood,
    is_achievement: analysis.isAchievement,
    ai_reply: analysis.reply
  })
  .select()
  .single();

if (entryError) throw entryError;

// ДОБАВИТЬ: Сохранить entry_summary
const { error: summaryError } = await supabase
  .from('entry_summaries')
  .insert({
    entry_id: entry.id,
    user_id: userId,
    summary_json: {
      text: analysis.summary,
      insight: analysis.insight,
      mood: analysis.mood,
      sentiment: analysis.sentiment,
      contexts: [],
      tags: analysis.tags,
      achievements: analysis.isAchievement ? [{ text: analysis.summary }] : [],
      keywords: text.split(' ').filter(w => w.length > 3).slice(0, 5),
      excerpt: text.substring(0, 200),
      confidence: 0.95
    },
    tokens_used: usage.total_tokens || 0
  });

if (summaryError) {
  console.error('Failed to save entry_summary:', summaryError);
}
```

**Тестирование:**
1. Создать новую запись через UI
2. Проверить что запись появилась в `entries` таблице
3. Проверить что summary появился в `entry_summaries` таблице
4. Проверить что мотивационные карточки теперь показывают реальные данные

**Acceptance Criteria:**
- ✅ При создании записи сохраняется и entry, и entry_summary
- ✅ Мотивационные карточки показывают реальные записи пользователя
- ✅ Нет ошибок в консоли

---

#### **ДЕНЬ 3-4: Создать Stats Edge Function** 📊

**Таска:** `📊 Создать Stats Edge Function`

**Цель:** Создать отдельную Edge Function для статистики

**Шаги:**

1. **Создать новую функцию:**
```bash
cd "/Users/rustamkarimov/DEV/UNITY — v 2"
supabase functions new stats
```

2. **Создать файл `supabase/functions/stats/index.ts`:**

```typescript
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /stats/user/:userId
app.get('/stats/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    const { data: entries, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Вычислить серию (streak)
    const streak = calculateStreak(entries);
    
    // Распределение настроений
    const moodDistribution = calculateMoodDistribution(entries);
    
    // Топ категории
    const topCategories = calculateTopCategories(entries);

    // Уровень (1 запись = 10 XP, уровень каждые 100 XP)
    const totalXP = entries.length * 10;
    const level = Math.floor(totalXP / 100) + 1;
    const nextLevelProgress = (totalXP % 100);

    return c.json({
      success: true,
      stats: {
        totalEntries: entries.length,
        currentStreak: streak.current,
        longestStreak: streak.longest,
        level,
        nextLevelProgress,
        moodDistribution,
        topCategories,
        lastEntryDate: entries[0]?.created_at,
        thisWeekEntries: entries.filter(e => 
          new Date(e.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length
      }
    });
  } catch (error) {
    console.error('Error in /stats/user:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /stats/achievements/:userId
app.get('/stats/achievements/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    const { data: entries } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId);

    const achievements = calculateAchievements(entries);

    return c.json({
      success: true,
      achievements,
      totalBadges: achievements.filter(a => a.earned).length
    });
  } catch (error) {
    console.error('Error in /stats/achievements:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Утилиты (см. MIGRATION_PLAN_STEP_BY_STEP.md)
function calculateStreak(entries) { /* ... */ }
function calculateMoodDistribution(entries) { /* ... */ }
function calculateTopCategories(entries) { /* ... */ }
function calculateAchievements(entries) { /* ... */ }

Deno.serve(app.fetch);
```

3. **Задеплоить функцию:**
```bash
supabase functions deploy stats
```

**Acceptance Criteria:**
- ✅ Функция деплоится без ошибок
- ✅ Эндпоинт `/stats/user/:userId` возвращает реальную статистику
- ✅ Эндпоинт `/stats/achievements/:userId` возвращает реальные достижения

---

#### **ДЕНЬ 5: Обновить ReportsScreen** 🎯

**Таска:** `🎯 Обновить ReportsScreen на реальные данные`

**Файл:** `src/components/screens/ReportsScreen.tsx`

**Изменения:**

```typescript
// Заменить моковые данные на API запросы
const [monthlyReport, setMonthlyReport] = useState<any>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function loadReport() {
    try {
      setLoading(true);
      const response = await apiRequest(
        `/stats/user/${userData.id}`,
        'GET'
      );
      
      if (response.success) {
        setMonthlyReport({
          period: new Date().toLocaleDateString('ru-RU', { 
            month: 'long', 
            year: 'numeric' 
          }),
          totalEntries: response.stats.totalEntries,
          streakDays: response.stats.currentStreak,
          topMood: response.stats.moodDistribution[0]?.mood || "😊",
          moodDistribution: response.stats.moodDistribution,
          topCategories: response.stats.topCategories,
          keyAchievements: [] // TODO: получить из AI
        });
      }
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  }

  if (userData?.id) {
    loadReport();
  }
}, [userData?.id]);
```

**Acceptance Criteria:**
- ✅ ReportsScreen показывает реальную статистику пользователя
- ✅ Нет моковых данных
- ✅ Данные обновляются при создании новой записи

---

#### **ДЕНЬ 6: Обновить AchievementsScreen** 🏆

**Таска:** `🏆 Обновить AchievementsScreen на реальные данные`

**Файл:** `src/components/screens/AchievementsScreen.tsx`

**Изменения:** (аналогично ReportsScreen)

**Acceptance Criteria:**
- ✅ AchievementsScreen показывает реальные достижения
- ✅ Прогресс вычисляется на основе реальных записей
- ✅ Уровень и XP корректны

---

#### **ДЕНЬ 7: Добавить блок "Лента последних записей"** 📝

**Таска:** `📝 Добавить блок 'Лента последних записей' на главный экран`

**Согласно Figma дизайну:**
- Блок под мотивационными карточками
- До 3 последних записей
- Каждая запись: дата, заголовок, превью текста, категория, лайки

**Создать компонент:** `src/components/RecentEntriesFeed.tsx`

```typescript
interface RecentEntriesFeedProps {
  userId: string;
}

export function RecentEntriesFeed({ userId }: RecentEntriesFeedProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    async function loadEntries() {
      const response = await apiRequest(`/entries/recent/${userId}?limit=3`, 'GET');
      setEntries(response.entries);
    }
    loadEntries();
  }, [userId]);

  return (
    <div className="recent-entries-feed">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Лента последних записей</h2>
        <button className="text-blue-600">→</button>
      </div>

      {entries.map(entry => (
        <div key={entry.id} className="entry-card bg-white border rounded-2xl p-4 mb-3">
          <p className="text-xs text-gray-500">{formatDate(entry.created_at)}</p>
          <h3 className="font-bold text-sm mt-1">{entry.ai_summary}</h3>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{entry.text}</p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full">
              {entry.category}
            </span>
            <div className="flex items-center gap-2">
              <button className="text-gray-400">👍</button>
              <button className="text-gray-400">👎</button>
              <button className="text-gray-400">⋮</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Добавить в AchievementHomeScreen.tsx:**

```typescript
<RecentEntriesFeed userId={userData.id} />
```

**Acceptance Criteria:**
- ✅ Блок отображается под карточками
- ✅ Показывает до 3 последних записей
- ✅ Дизайн соответствует Figma

---

### 📅 НЕДЕЛЯ 2: ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ (7 дней)

#### **ДЕНЬ 8-9: Добавить поддержку загрузки фото** 📸

**Таска:** `📸 Добавить поддержку загрузки фото в записи`

**Шаги:**

1. Добавить поле `media_urls` в таблицу `entries`
2. Создать UI для загрузки фото в ChatInputSection
3. Загружать фото в Supabase Storage bucket `diary-media`
4. Сохранять URL в `media_urls` массив

**Acceptance Criteria:**
- ✅ Пользователь может загрузить до 5 фото
- ✅ Фото отображаются в записи
- ✅ Фото сохраняются в Supabase Storage

---

### 📅 НЕДЕЛЯ 3: ОПТИМИЗАЦИЯ (7 дней)

#### **ДЕНЬ 15-21: Разделить Edge Function** 🔧

**Таска:** `🔧 Разделить Edge Function на микросервисы`

**План:**
1. Создать 6 новых функций: profiles, entries, motivations, stats, books, admin
2. Перенести код из index.ts
3. Обновить frontend API URLs
4. Протестировать каждую функцию
5. Удалить старую make-server-9729c493

**Acceptance Criteria:**
- ✅ Каждая функция < 500 строк
- ✅ Все функции деплоятся успешно
- ✅ Frontend работает с новыми URL

---

## ✅ ФИНАЛЬНОЕ ТЕСТИРОВАНИЕ

**Таска:** `✅ Тестирование всех изменений`

**Чеклист:**
- [ ] Создание записи сохраняет entry_summaries
- [ ] Мотивационные карточки показывают реальные данные
- [ ] ReportsScreen показывает реальную статистику
- [ ] AchievementsScreen показывает реальные достижения
- [ ] Блок "Лента последних записей" работает
- [ ] Загрузка фото работает
- [ ] Все Edge Functions задеплоены
- [ ] Нет моковых данных

---

## 📊 МЕТРИКИ УСПЕХА

**До оптимизации:**
- Edge Function: 2140 строк (не деплоится)
- Моковые данные: 100%
- entry_summaries: 0 записей
- Стоимость: ~$300/месяц

**После оптимизации:**
- Edge Functions: 6 функций по ~300 строк
- Реальные данные: 100%
- entry_summaries: заполняется автоматически
- Стоимость: ~$50/месяц

**ЭКОНОМИЯ: $250/месяц = $3000/год** 💰

---

**Готовы начать? Начинаем с Таски #1: Исправить entry_summaries!** 🚀

