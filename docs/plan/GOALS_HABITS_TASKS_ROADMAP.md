# Goals, Habits & Tasks - Implementation Roadmap

**Статус**: 📅 Planned  
**Приоритет**: P1 (High)  
**Срок**: Q1 2026 (Январь - Март)  
**Команда**: Frontend Team  
**Последнее обновление**: 2025-11-01  

---

## 📊 Executive Summary

### Текущее состояние:
- ❌ **Goals (Цели)**: Не реализовано
- ❌ **Habits (Привычки)**: Не реализовано
- ❌ **Tasks (Задачи)**: Не реализовано

### Планируемое состояние (Q1 2026):
- ✅ **Goals**: Создание, отслеживание, аналитика целей
- ✅ **Habits**: Habit tracking с streak counter и gamification
- ✅ **Tasks**: Task management с приоритетами и дедлайнами

### Ожидаемые результаты:
- **User Retention**: +20% (с 40% до 60%)
- **Daily Active Users**: +30%
- **Session Duration**: +50% (с 5 до 7.5 минут)
- **Habit Completion Rate**: 70%+

---

## 🎯 Почему это важно?

### Проблема:
Текущая версия UNITY фокусируется на **ретроспективе** (дневник достижений), но не помогает пользователям:
- Планировать будущее (Goals)
- Формировать привычки (Habits)
- Управлять задачами (Tasks)

### Решение:
Добавить **проактивные** инструменты для достижения целей:
1. **Goals** - долгосрочное планирование
2. **Habits** - ежедневные привычки
3. **Tasks** - краткосрочные задачи

### Ценность для пользователя:
- **Полный цикл**: от планирования до достижения
- **Мотивация**: streak counter, badges, achievements
- **Аналитика**: прогресс по целям и привычкам
- **Интеграция**: связь дневника с целями и привычками

---

## 📅 Roadmap

### Phase 1: Goals (Цели) - 3 недели
**Срок**: Январь 2026  
**Приоритет**: P1  

#### Функционал:
- Создание целей (название, описание, дедлайн)
- Категории целей (здоровье, карьера, финансы, etc.)
- Прогресс-бар (0-100%)
- Подцели (sub-goals)
- Связь с дневником (записи → прогресс цели)

#### Технические задачи:
1. **БД миграция**: таблица `goals`
2. **API**: CRUD операции для целей
3. **UI компоненты**: GoalCard, GoalForm, GoalProgress
4. **Навигация**: добавить в MobileBottomNav
5. **Аналитика**: Goals Analytics screen

#### Метрики успеха:
- Goal creation rate: 60%+ пользователей создают хотя бы 1 цель
- Goal completion rate: 40%+ целей достигаются
- User retention: +10%

---

### Phase 2: Habits (Привычки) - 3 недели
**Срок**: Февраль 2026  
**Приоритет**: P1  

#### Функционал:
- Создание привычек (название, частота, время)
- Streak counter (дни подряд)
- Check-in система (отметка выполнения)
- Напоминания (push notifications)
- Gamification (badges за streaks)

#### Технические задачи:
1. **БД миграция**: таблица `habits`, `habit_check_ins`
2. **API**: CRUD + check-in endpoint
3. **UI компоненты**: HabitCard, HabitCheckIn, StreakCounter
4. **Навигация**: добавить в MobileBottomNav
5. **Push Notifications**: напоминания о привычках

#### Метрики успеха:
- Habit creation rate: 70%+ пользователей создают хотя бы 1 привычку
- Habit completion rate: 70%+ check-ins выполняются
- Average streak: 7+ дней
- User retention: +20%

---

### Phase 3: Tasks (Задачи) - 2 недели
**Срок**: Март 2026  
**Приоритет**: P2  

#### Функционал:
- Создание задач (название, описание, дедлайн)
- Приоритеты (low, medium, high, urgent)
- Статусы (todo, in_progress, done)
- Связь с целями (задача → цель)
- Фильтры и сортировка

#### Технические задачи:
1. **БД миграция**: таблица `tasks`
2. **API**: CRUD операции для задач
3. **UI компоненты**: TaskCard, TaskForm, TaskFilters
4. **Навигация**: добавить в MobileBottomNav
5. **Интеграция**: связь Tasks ↔ Goals

#### Метрики успеха:
- Task creation rate: 50%+ пользователей создают задачи
- Task completion rate: 60%+ задач выполняются
- User retention: +5%

---

## 🗄️ Database Schema

### Goals Table
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- health, career, finance, etc.
  target_value INTEGER, -- для количественных целей
  current_value INTEGER DEFAULT 0,
  deadline DATE,
  status TEXT DEFAULT 'active', -- active, completed, paused, cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
```

### Habits Table
```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'daily', -- daily, weekly, custom
  reminder_time TIME,
  streak_count INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, paused, archived
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE habit_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  completed BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(habit_id, check_in_date)
);

CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_check_ins_habit_id ON habit_check_ins(habit_id);
CREATE INDEX idx_habit_check_ins_date ON habit_check_ins(check_in_date);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL, -- optional link to goal
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  status TEXT DEFAULT 'todo', -- todo, in_progress, done, cancelled
  deadline DATE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_goal_id ON tasks(goal_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
```

---

## 🎨 UI/UX Design

### Navigation Update
```typescript
// src/shared/components/layout/MobileBottomNav.tsx
const tabs = [
  { id: 'home', label: 'Главная', icon: Home },
  { id: 'goals', label: 'Цели', icon: Target },      // NEW
  { id: 'habits', label: 'Привычки', icon: Repeat }, // NEW
  { id: 'tasks', label: 'Задачи', icon: CheckSquare }, // NEW
  { id: 'history', label: 'История', icon: History },
  { id: 'settings', label: 'Настройки', icon: Settings },
];
```

### Screen Hierarchy
```
Goals Screen
├── GoalsList (active goals)
├── GoalCard (progress, deadline, actions)
├── CreateGoalButton (FAB)
└── GoalDetailsModal
    ├── GoalProgress
    ├── SubGoals
    ├── LinkedEntries (from diary)
    └── GoalActions (edit, delete, complete)

Habits Screen
├── HabitsList (active habits)
├── HabitCard (streak, check-in button)
├── CreateHabitButton (FAB)
└── HabitDetailsModal
    ├── StreakCounter
    ├── CheckInHistory (calendar view)
    ├── HabitStats
    └── HabitActions (edit, delete, pause)

Tasks Screen
├── TaskFilters (status, priority, deadline)
├── TasksList (grouped by status)
├── TaskCard (priority, deadline, actions)
├── CreateTaskButton (FAB)
└── TaskDetailsModal
    ├── TaskInfo
    ├── LinkedGoal (if any)
    └── TaskActions (edit, delete, complete)
```

---

## 🔗 Integration with Existing Features

### Diary ↔ Goals
- При создании записи в дневнике → опция связать с целью
- Прогресс цели автоматически обновляется при добавлении связанных записей
- В GoalDetails показываются все связанные записи

### Diary ↔ Habits
- При check-in привычки → опция создать запись в дневнике
- В дневнике показываются выполненные привычки за день
- Streak counter учитывает записи в дневнике

### Tasks ↔ Goals
- Задачи могут быть связаны с целями
- Выполнение задач влияет на прогресс цели
- В GoalDetails показываются все связанные задачи

---

## 📊 Analytics & Gamification

### Goals Analytics
- Goal completion rate (% достигнутых целей)
- Average time to complete goal
- Most popular goal categories
- Goals vs Diary entries correlation

### Habits Analytics
- Habit completion rate (% выполненных check-ins)
- Average streak length
- Best performing habits
- Habit consistency score

### Gamification
- **Badges**: "7-day streak", "30-day streak", "Goal achiever", etc.
- **Achievements**: "First goal completed", "10 habits tracked", etc.
- **Leaderboard**: Top streaks among friends (optional social feature)

---

## ⚠️ Risks & Mitigation

### Risk 1: Feature Overload
**Проблема**: Слишком много функций → сложный UX  
**Решение**: Постепенный rollout (Goals → Habits → Tasks), A/B testing

### Risk 2: Low Adoption
**Проблема**: Пользователи не используют новые фичи  
**Решение**: Onboarding tutorial, push notifications, gamification

### Risk 3: Performance Issues
**Проблема**: Дополнительные запросы к БД → медленная загрузка  
**Решение**: Оптимизация запросов, кэширование, индексы

---

## ✅ Definition of Done

### Goals Feature:
- [ ] БД миграция выполнена
- [ ] API endpoints работают
- [ ] UI компоненты созданы
- [ ] Навигация обновлена
- [ ] E2E тесты написаны
- [ ] Документация обновлена
- [ ] Deployed to production

### Habits Feature:
- [ ] БД миграция выполнена
- [ ] API endpoints работают
- [ ] UI компоненты созданы
- [ ] Push notifications настроены
- [ ] Streak counter работает
- [ ] E2E тесты написаны
- [ ] Deployed to production

### Tasks Feature:
- [ ] БД миграция выполнена
- [ ] API endpoints работают
- [ ] UI компоненты созданы
- [ ] Интеграция с Goals работает
- [ ] E2E тесты написаны
- [ ] Deployed to production

---

**Автор**: Product Team UNITY  
**Дата создания**: 2025-11-01  
**Следующий review**: 2025-12-01  

