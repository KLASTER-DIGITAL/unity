# 🎨 Achievements UI/UX Recommendations

**Дата**: 2025-11-16  
**Статус**: Рекомендации для улучшения раздела достижений  
**Вдохновение**: iOS Things 3 Awards Screen (скриншот предоставлен)

---

## 🎯 Цели улучшения

1. **Современный дизайн** - соответствие iOS Human Interface Guidelines
2. **Визуальная привлекательность** - 3D иконки, градиенты, анимации
3. **Геймификация** - мотивация пользователя через визуальные награды
4. **Темная/светлая тема** - идеальная поддержка обоих режимов
5. **Производительность** - плавные анимации, оптимизация рендеринга

---

## 📱 Референс: Things 3 Awards Screen

### Что нравится:
- ✅ **3D Badge Design** - объемные значки с тенями и бликами
- ✅ **Grid Layout** - 3 колонки, компактное размещение
- ✅ **Earned vs Locked** - четкое визуальное разделение (цветные vs серые)
- ✅ **Subtle Animations** - плавное появление при скролле
- ✅ **Stats Cards** - карточки с метриками вверху экрана
- ✅ **Dark Mode Excellence** - идеальная поддержка темной темы

### Что адаптировать для UNITY:
- 🎨 3D иконки вместо плоских эмодзи
- 📊 Прогресс-бар для незаработанных достижений
- 🏆 Rarity indicators (common/rare/epic/legendary)
- ✨ Particle effects при получении достижения
- 🎭 Категоризация достижений (Entries, Streaks, Categories, etc.)

---

## 🎨 Дизайн-система

### Цветовая палитра (Rarity-based)

```typescript
const RARITY_COLORS = {
  common: {
    light: {
      gradient: ['#E8F5E9', '#C8E6C9'], // Зеленый
      shadow: 'rgba(76, 175, 80, 0.3)',
      glow: 'rgba(76, 175, 80, 0.2)',
    },
    dark: {
      gradient: ['#2E7D32', '#1B5E20'],
      shadow: 'rgba(76, 175, 80, 0.5)',
      glow: 'rgba(76, 175, 80, 0.3)',
    },
  },
  rare: {
    light: {
      gradient: ['#E3F2FD', '#BBDEFB'], // Синий
      shadow: 'rgba(33, 150, 243, 0.3)',
      glow: 'rgba(33, 150, 243, 0.2)',
    },
    dark: {
      gradient: ['#1976D2', '#0D47A1'],
      shadow: 'rgba(33, 150, 243, 0.5)',
      glow: 'rgba(33, 150, 243, 0.3)',
    },
  },
  epic: {
    light: {
      gradient: ['#F3E5F5', '#E1BEE7'], // Фиолетовый
      shadow: 'rgba(156, 39, 176, 0.3)',
      glow: 'rgba(156, 39, 176, 0.2)',
    },
    dark: {
      gradient: ['#7B1FA2', '#4A148C'],
      shadow: 'rgba(156, 39, 176, 0.5)',
      glow: 'rgba(156, 39, 176, 0.3)',
    },
  },
  legendary: {
    light: {
      gradient: ['#FFF9C4', '#FFF59D'], // Золотой
      shadow: 'rgba(255, 193, 7, 0.4)',
      glow: 'rgba(255, 193, 7, 0.3)',
    },
    dark: {
      gradient: ['#F57F17', '#F57C00'],
      shadow: 'rgba(255, 193, 7, 0.6)',
      glow: 'rgba(255, 193, 7, 0.4)',
    },
  },
};
```

### Typography

```css
/* Заголовок секции */
.achievement-section-title {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  opacity: 0.6;
}

/* Название достижения */
.achievement-name {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
}

/* Описание */
.achievement-description {
  font-size: 13px;
  font-weight: 400;
  opacity: 0.7;
  line-height: 1.3;
}

/* Прогресс */
.achievement-progress {
  font-size: 12px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
```

---

## 🏗️ Структура компонентов

### 1. AchievementsHeader
```tsx
<AchievementsHeader>
  <UserLevel level={11} title="Мастер достижений" />
  <StatsGrid>
    <StatCard icon="📝" value={123} label="Записей" />
    <StatCard icon="🏆" value={9} label="Наград" />
    <StatCard icon="🔥" value={7} label="Дней подряд" />
    <StatCard icon="⭐" value={7} label="Рекорд" />
  </StatsGrid>
</AchievementsHeader>
```

### 2. AchievementBadge (3D Design)
```tsx
<AchievementBadge
  achievement={achievement}
  isEarned={achievement.isEarned}
  progress={achievement.progress}
  rarity={achievement.rarity}
  onClick={() => showDetails(achievement)}
/>
```

**Визуальные состояния**:
- **Earned** (100%): Цветной градиент, glow effect, 3D тень
- **In Progress** (1-99%): Полупрозрачный, прогресс-бар снизу
- **Locked** (0%): Серый, силуэт, без деталей

### 3. AchievementDetailsModal
```tsx
<AchievementDetailsModal achievement={achievement}>
  <BadgePreview size="large" animated />
  <AchievementInfo>
    <RarityBadge rarity={achievement.rarity} />
    <Title>{achievement.name}</Title>
    <Description>{achievement.description}</Description>
    <ProgressBar progress={achievement.progress} />
    <EarnedDate date={achievement.earnedAt} />
  </AchievementInfo>
  <ShareButton />
</AchievementDetailsModal>
```

---

## ✨ Анимации

### Scroll Animations (Framer Motion)
```tsx
const badgeVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

<motion.div
  custom={index}
  initial="hidden"
  animate="visible"
  variants={badgeVariants}
>
  <AchievementBadge />
</motion.div>
```

### Earned Animation (Confetti + Glow)
```tsx
const earnedAnimation = {
  scale: [1, 1.2, 1],
  rotate: [0, 10, -10, 0],
  boxShadow: [
    '0 0 0 rgba(255, 193, 7, 0)',
    '0 0 30px rgba(255, 193, 7, 0.6)',
    '0 0 0 rgba(255, 193, 7, 0)',
  ],
  transition: { duration: 1, ease: 'easeInOut' },
};
```

---

## 📐 Layout

### Grid System
```css
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px;
}

@media (max-width: 375px) {
  .achievements-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}
```

### Badge Dimensions
```css
.achievement-badge {
  aspect-ratio: 1;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
```

---

## 🎭 Категоризация

```typescript
const ACHIEVEMENT_CATEGORIES = [
  {
    id: 'milestones',
    name: 'Основные этапы',
    icon: '🎯',
    achievements: ['entries_1', 'entries_10', 'entries_50', 'entries_100'],
  },
  {
    id: 'streaks',
    name: 'Постоянство',
    icon: '🔥',
    achievements: ['streak_3', 'streak_7', 'streak_14', 'streak_30'],
  },
  {
    id: 'categories',
    name: 'Категории',
    icon: '📂',
    achievements: ['family_5', 'health_5', 'work_5'],
  },
  {
    id: 'special',
    name: 'Особые',
    icon: '✨',
    achievements: ['comeback_7', 'comeback_30', 'year_with_unity'],
  },
];
```

---

## 🚀 Следующие шаги

1. ✅ Создать компонент `AchievementBadge3D` с CSS 3D transforms
2. ✅ Добавить Framer Motion анимации для scroll reveal
3. ✅ Реализовать `AchievementDetailsModal` с share функцией
4. ✅ Добавить confetti effect при получении достижения
5. ✅ Оптимизировать рендеринг (React.memo, useMemo)
6. ✅ Добавить skeleton loading для первой загрузки
7. ✅ Тестирование на iPhone SE (320px) и iPhone Pro Max (430px)

