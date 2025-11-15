# 🏆 Система достижений UNITY-v2

**Версия**: 1.0  
**Дата**: 2025-11-15  
**Автор**: UNITY Team

---

## 📋 Содержание

1. [Обзор системы](#обзор-системы)
2. [Архитектура](#архитектура)
3. [Типы достижений](#типы-достижений)
4. [Логика расчета](#логика-расчета)
5. [Сценарии использования](#сценарии-использования)
6. [UI компоненты](#ui-компоненты)
7. [API и данные](#api-и-данные)

---

## 🎯 Обзор системы

### Назначение

Система достижений (Achievements) - это **gamification механизм** для мотивации пользователей к регулярному ведению дневника. Система отслеживает прогресс пользователя и награждает за различные активности.

### Ключевые функции

1. **Отслеживание прогресса** - автоматический расчет достижений на основе записей
2. **Визуализация** - красивые карточки с градиентами и иконками
3. **Мотивация** - система уровней, серий (streaks) и наград
4. **Персонализация** - достижения адаптируются под активность пользователя

### Основные метрики

- **Серия (Streak)** - количество дней подряд с записями
- **Уровень (Level)** - прогресс пользователя (1 запись = 10 XP, уровень каждые 100 XP)
- **Достижения (Achievements)** - бейджи за выполнение определенных условий
- **Вехи (Milestones)** - крупные цели с наградами

---

## 🏗️ Архитектура

### Структура файлов

```
UNITY-v2/
├── src/features/mobile/achievements/
│   └── components/
│       └── AchievementsScreen.tsx          # PWA экран достижений
├── app/(tabs)/
│   └── achievements.tsx                     # React Native экран
├── app-shared/components/screens/achievements/
│   ├── AchievementCard.native.tsx          # RN карточка достижения
│   └── MilestoneCard.native.tsx            # RN карточка вехи
├── src/shared/lib/api/
│   └── statsCalculator.ts                   # Логика расчета
└── docs/features/
    └── ACHIEVEMENTS_SYSTEM.md               # Эта документация
```

### Компоненты системы

```mermaid
graph TD
    A[AchievementsScreen] --> B[statsCalculator]
    B --> C[calculateAchievements]
    B --> D[calculateStreak]
    B --> E[calculateUserStats]
    A --> F[AchievementCard]
    A --> G[MilestoneCard]
    C --> H[DiaryEntry[]]
    D --> H
    E --> H
```

---

## 🎖️ Типы достижений

### 1. Базовые достижения (Achievements)

**Структура данных**:
```typescript
type Achievement = {
  id: number;
  name: string;              // Название достижения
  description: string;       // Описание условия
  icon: string;              // Иконка (Star, Flame, Trophy, etc.)
  earned: boolean;           // Получено или нет
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  earnedDate: string | null; // Дата получения
  progress: number;          // Прогресс 0-100%
};
```

**Список достижений**:

| ID | Название | Описание | Условие | Редкость |
|----|----------|----------|---------|----------|
| 1 | Первые шаги | Создать первую запись | entries.length >= 1 | common |
| 2 | Неделя силы | 7 дней записей подряд | streak.current >= 7 | rare |
| 3 | Спортивный дух | 10 записей о спорте | category === 'Спорт' (10x) | common |
| 4 | Книжный червь | Прочитать 5 книг | category === 'Чтение' (5x) | uncommon |
| 5 | Месяц достижений | 30 дней записей подряд | streak.longest >= 30 | legendary |
| 6 | Продуктивный | 50 записей всего | entries.length >= 50 | uncommon |

**Редкость (Rarity)**:
- `common` - Обычное (зеленый градиент)
- `uncommon` - Необычное (синий градиент)
- `rare` - Редкое (фиолетовый градиент)
- `legendary` - Легендарное (золотой градиент)

### 2. Вехи (Milestones)

**Структура данных**:
```typescript
type Milestone = {
  id: number;
  title: string;           // Название вехи
  completed: boolean;      // Выполнено или нет
  reward: string;          // Награда за выполнение
  progress?: number;       // Текущий прогресс
  total?: number;          // Требуемое количество
};
```

**Список вех**:

| ID | Название | Условие | Награда |
|----|----------|---------|---------|
| 1 | 10 записей | totalEntries >= 10 | Бейдж "Начинающий" |
| 2 | Неделя подряд | currentStreak >= 7 | Бейдж "Постоянство" |
| 3 | 50 записей | totalEntries >= 50 | Премиум тема |
| 4 | Месяц подряд | longestStreak >= 30 | Бейдж "Легенда" |

---

## 🧮 Логика расчета

### 1. Расчет серии (Streak)

**Функция**: `calculateStreak(entries: DiaryEntry[])`

**Алгоритм**:

```typescript
// 1. Сортировка записей по дате (новые первые)
const sorted = entries.sort((a, b) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);

// 2. Проверка текущей серии
const today = new Date();
const lastEntryDate = new Date(sorted[0].createdAt);
const daysDiff = Math.floor((today - lastEntryDate) / (1000 * 60 * 60 * 24));

// Если последняя запись была сегодня или вчера - серия активна
if (daysDiff <= 1) {
  currentStreak = 1;

  // Подсчет дней подряд назад
  for (let i = 1; i < sorted.length; i++) {
    const diff = daysBetween(sorted[i-1], sorted[i]);
    if (diff === 1) currentStreak++;
    else break;
  }
}

// 3. Поиск самой длинной серии в истории
longestStreak = findLongestConsecutiveStreak(sorted);
```

**Примеры**:

| Записи | Current Streak | Longest Streak |
|--------|----------------|----------------|
| Сегодня, Вчера, 2 дня назад | 3 | 3 |
| Сегодня, 3 дня назад, 4 дня назад | 1 | 2 |
| 5 дней назад, 6 дней назад, 7 дней назад | 0 | 3 |

### 2. Расчет уровня (Level)

**Формула**:
```typescript
const totalXP = entries.length * 10;  // 1 запись = 10 XP
const level = Math.floor(totalXP / 100) + 1;  // Уровень каждые 100 XP
const nextLevelProgress = totalXP % 100;  // Прогресс до следующего уровня
```

**Примеры**:

| Записей | XP | Уровень | Прогресс |
|---------|----|---------| ---------|
| 5 | 50 | 1 | 50% |
| 10 | 100 | 2 | 0% |
| 15 | 150 | 2 | 50% |
| 50 | 500 | 6 | 0% |

### 3. Расчет достижений

**Функция**: `calculateAchievements(entries: DiaryEntry[])`

**Логика для каждого достижения**:

```typescript
// Пример: "Неделя силы" (7 дней подряд)
{
  id: 2,
  name: 'Неделя силы',
  description: '7 дней записей подряд',
  icon: 'Flame',
  earned: streak.current >= 7,  // Условие выполнения
  rarity: 'rare',
  earnedDate: streak.current >= 7 ? 'Получено' : null,
  progress: Math.min(100, (streak.current / 7) * 100)  // Прогресс
}

// Пример: "Книжный червь" (5 записей о чтении)
{
  id: 4,
  name: 'Книжный червь',
  description: 'Прочитать 5 книг',
  icon: 'BookOpen',
  earned: entries.filter(e =>
    e.category === 'Чтение' || e.category === 'Обучение'
  ).length >= 5,
  rarity: 'uncommon',
  earnedDate: /* ... */,
  progress: Math.min(100, (readingEntries / 5) * 100)
}
```

### 4. Расчет статистики настроения

**Функция**: `calculateMoodDistribution(entries: DiaryEntry[])`

**Алгоритм**:
```typescript
// 1. Подсчет количества каждого настроения
const moodCounts = {};
entries.forEach(entry => {
  const mood = entry.mood || 'хорошее';
  moodCounts[mood] = (moodCounts[mood] || 0) + 1;
});

// 2. Расчет процентов и сортировка
return Object.entries(moodCounts)
  .map(([mood, count]) => ({
    mood: getMoodEmoji(mood),  // 😊, 😍, 💪, etc.
    label: mood,
    count,
    percentage: Math.round((count / total) * 100)
  }))
  .sort((a, b) => b.count - a.count);  // От большего к меньшему
```

**Маппинг эмодзи**:
```typescript
const emojiMap = {
  'радость': '😊',
  'восторг': '😍',
  'уверенность': '💪',
  'благодарность': '🙏',
  'энтузиазм': '🤓',
  'спокойствие': '😌',
  'мотивация': '🔥',
  'гордость': '🏆',
  'вдохновение': '✨',
  'энергия': '⚡'
};
```

### 5. Генерация персональных инсайтов

**Функция**: `generatePersonalInsights(entries: DiaryEntry[])`

**Типы инсайтов**:

1. **Активность**:
   ```typescript
   if (thisWeekEntries > 5) {
     insights.push('Вы очень активны на этой неделе! Продолжайте в том же духе.');
   }
   ```

2. **Настроение**:
   ```typescript
   if (moodDist[0].percentage > 50) {
     insights.push(`Ваше преобладающее настроение - ${moodDist[0].label}. Это отлично!`);
   }
   ```

3. **Категории**:
   ```typescript
   if (topCats.length > 0) {
     insights.push(`Вы больше всего фокусируетесь на категории "${topCats[0].name}".`);
   }
   ```

4. **Серия**:
   ```typescript
   if (streak.current > 3) {
     insights.push(`Отличная серия! ${streak.current} дней подряд.`);
   }
   ```

---

## 📱 Сценарии использования

### Сценарий 1: Новый пользователь

**Шаги**:
1. Пользователь создает первую запись
2. Система автоматически присваивает достижение "Первые шаги" (common)
3. Уровень = 1, XP = 10, прогресс = 10%
4. Серия = 1 день
5. Веха "10 записей" показывает прогресс 1/10

**UI**:
- ✅ Зеленая карточка "Первые шаги" (earned)
- 🔒 Серые карточки остальных достижений (locked)
- Прогресс-бар вех показывает 10%

### Сценарий 2: Активный пользователь (7 дней подряд)

**Шаги**:
1. Пользователь пишет 7 дней подряд
2. Система присваивает "Неделя силы" (rare)
3. Веха "Неделя подряд" выполнена → награда "Бейдж Постоянство"
4. Серия = 7 дней, уровень = 1, XP = 70

**UI**:
- ✅ Фиолетовая карточка "Неделя силы" с датой получения
- ✅ Зеленая галочка на вехе "Неделя подряд"
- 🎁 Показывается награда "Бейдж Постоянство"

### Сценарий 3: Прогресс к достижению

**Шаги**:
1. Пользователь написал 3 записи о спорте (нужно 10)
2. Достижение "Спортивный дух" показывает прогресс 30%
3. Карточка серая (locked) с прогресс-баром

**UI**:
- 🔒 Серая карточка с замочком
- Прогресс-бар: 30% (3/10)
- Текст: "30%" в правом нижнем углу

### Сценарий 4: Легендарное достижение

**Шаги**:
1. Пользователь пишет 30 дней подряд
2. Система присваивает "Месяц достижений" (legendary)
3. Веха "Месяц подряд" выполнена → награда "Бейдж Легенда"
4. Уровень = 4, XP = 300

**UI**:
- ✨ Золотая карточка с анимацией
- 🏆 Иконка трофея
- Дата получения
- Бейдж "Легендарное"

---

## 🎨 UI компоненты

### 1. AchievementCard (PWA)

**Расположение**: `src/features/mobile/achievements/components/AchievementsScreen.tsx`

**Структура**:
```tsx
<Card className="achievement-card">
  {/* Иконка с градиентом */}
  <div className="icon-container" style={{ background: rarityGradient }}>
    <Icon name={achievement.icon} />
    {!earned && <LockIcon />}
  </div>

  {/* Контент */}
  <div className="content">
    <h3>{achievement.name}</h3>
    <p>{achievement.description}</p>

    {/* Footer */}
    <div className="footer">
      <Badge color={rarityColor}>{rarityLabel}</Badge>
      {earned && <span>{earnedDate}</span>}
      {!earned && <span>{progress}%</span>}
    </div>
  </div>
</Card>
```

**Градиенты по редкости**:
```typescript
const RARITY_COLORS = {
  common: {
    gradient: ['#10B981', '#059669'],  // Зеленый
    border: '#10B981',
    bg: '#F0FDF4',
    text: '#065F46'
  },
  uncommon: {
    gradient: ['#3B82F6', '#2563EB'],  // Синий
    border: '#3B82F6',
    bg: '#EFF6FF',
    text: '#1E40AF'
  },
  rare: {
    gradient: ['#8B5CF6', '#7C3AED'],  // Фиолетовый
    border: '#8B5CF6',
    bg: '#F5F3FF',
    text: '#5B21B6'
  },
  legendary: {
    gradient: ['#F59E0B', '#D97706'],  // Золотой
    border: '#F59E0B',
    bg: '#FFFBEB',
    text: '#92400E'
  }
};
```

### 2. MilestoneCard (React Native)

**Расположение**: `app-shared/components/screens/achievements/MilestoneCard.native.tsx`

**Структура**:
```tsx
<View style={[styles.card, completed && styles.cardCompleted]}>
  {/* Header */}
  <View style={styles.header}>
    <View style={styles.iconContainer}>
      <Text style={styles.icon}>{completed ? '✅' : '🎯'}</Text>
    </View>
    <View style={styles.content}>
      <Text style={styles.title}>{milestone.title}</Text>
      <Text style={styles.reward}>🎁 {milestone.reward}</Text>
    </View>
  </View>

  {/* Progress Bar */}
  {!completed && progress && (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.progressText}>{progress} / {total}</Text>
    </View>
  )}

  {/* Completed Badge */}
  {completed && (
    <View style={styles.completedBadge}>
      <Text style={styles.completedText}>Выполнено!</Text>
    </View>
  )}
</View>
```

**Цвета**:
- Обычная карточка: белый фон, серая рамка
- Выполненная карточка: зеленый фон (#F0FDF4), зеленая рамка (#10B981)

### 3. Skeleton Loading

**Компоненты**:
- `SkeletonAchievementCard` - заглушка для карточки достижения
- `SkeletonMilestoneCard` - заглушка для карточки вехи
- `SkeletonCircle` - заглушка для иконки
- `SkeletonText` - заглушка для текста

**Использование**:
```tsx
{isLoading ? (
  <>
    <SkeletonAchievementCard />
    <SkeletonAchievementCard />
    <SkeletonMilestoneCard />
  </>
) : (
  achievements.map(a => <AchievementCard achievement={a} />)
)}
```

---

## 🔌 API и данные

### 1. Источники данных

**Таблицы Supabase**:
- `entries` - записи дневника
  - `id`, `user_id`, `text`, `category`, `mood`, `is_achievement`, `created_at`
- `profiles` - профили пользователей
  - `id`, `level`, `xp`, `current_streak`, `longest_streak`

**Функции**:
- `getEntries(userId, limit)` - получение записей пользователя
- `calculateUserStats(entries)` - расчет статистики
- `calculateAchievements(entries)` - расчет достижений
- `calculateStreak(entries)` - расчет серии

### 2. Workflow загрузки данных

```typescript
// 1. Загрузка записей
const entries = await getEntries(userId, 100);

// 2. Расчет статистики
const stats = calculateUserStats(entries);
// Возвращает: {
//   totalEntries, currentStreak, longestStreak, level,
//   nextLevelProgress, moodDistribution, topCategories,
//   keyAchievements, personalInsights
// }

// 3. Расчет достижений
const achievements = calculateAchievements(entries);
// Возвращает: Achievement[]

// 4. Создание вех
const milestones = [
  {
    id: 1,
    title: '10 записей',
    completed: stats.totalEntries >= 10,
    reward: 'Бейдж "Начинающий"'
  },
  // ...
];
```

### 3. Кэширование

**НЕТ кэширования** - данные всегда актуальные:
- Каждый раз при открытии экрана загружаются свежие записи
- Расчет происходит на клиенте (быстро, <100ms)
- Refresh control для ручного обновления

### 4. Оптимизация

**Производительность**:
- Лимит 100 последних записей (достаточно для расчета)
- Сортировка на клиенте (не нагружает БД)
- Мемоизация расчетов через `useMemo`

**Пример**:
```typescript
const achievements = useMemo(() =>
  calculateAchievements(entries),
  [entries]
);

const stats = useMemo(() =>
  calculateUserStats(entries),
  [entries]
);
```

---

## 🎯 Будущие улучшения

### Планируемые фичи

1. **Push уведомления о достижениях**
   - Уведомление при получении нового достижения
   - Напоминание о близости к цели (90% прогресса)

2. **Социальные фичи**
   - Сравнение с друзьями
   - Таблица лидеров
   - Шаринг достижений

3. **Больше достижений**
   - Достижения по категориям (10 записей о спорте, 20 о работе, etc.)
   - Временные достижения (написать в 6 утра, в полночь)
   - Достижения по настроению (10 записей с радостью)

4. **Награды**
   - Разблокировка премиум тем
   - Эксклюзивные иконки
   - Бонусы к XP

5. **Анимации**
   - Конфетти при получении достижения
   - Анимация прогресс-бара
   - Плавное появление карточек

---

## 📊 Метрики успеха

### KPI системы достижений

1. **Engagement**:
   - % пользователей с хотя бы 1 достижением: >80%
   - Средний streak: >3 дня
   - % пользователей с streak >7 дней: >30%

2. **Retention**:
   - Day 7 retention: >50% (с достижениями vs без)
   - Day 30 retention: >30%

3. **Activity**:
   - Среднее количество записей в неделю: >5
   - % пользователей с уровнем >5: >20%

---

## 🐛 Известные проблемы

### Исправленные

1. ✅ **Прогресс переполнение** (30/20)
   - Проблема: `milestone.progress` мог превышать `milestone.total`
   - Решение: `Math.min(milestone.progress, milestone.total)`
   - Коммит: `f824a59`

2. ✅ **Streak calculation edge case**
   - Проблема: Неправильный расчет при записях в один день
   - Решение: Нормализация дат (setHours(0,0,0,0))

### Текущие

1. ⏳ **Нет персистентности достижений**
   - Проблема: Достижения пересчитываются каждый раз
   - Решение: Сохранять в БД таблицу `user_achievements`

2. ⏳ **Нет уведомлений**
   - Проблема: Пользователь не знает о новых достижениях
   - Решение: Push notifications при получении

---

## 📚 Связанные документы

- [REPORTS_SYSTEM.md](./REPORTS_SYSTEM.md) - Система отчетов
- [GAMIFICATION.md](./GAMIFICATION.md) - Общая система геймификации
- [PUSH_SYSTEM.md](../architecture/PUSH_SYSTEM.md) - Push уведомления

---

**Конец документа**

