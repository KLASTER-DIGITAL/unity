# 🎨 Новые компоненты настроек админ панели

## 📁 Структура

```
src/components/screens/admin/
├── SettingsTab.tsx          # Главный компонент с табами
└── settings/
    ├── APISettingsTab.tsx   # API настройки с графиками
    ├── LanguagesTab.tsx     # Управление языками
    ├── PWASettingsTab.tsx   # PWA настройки
    ├── PushNotificationsTab.tsx # Push уведомления
    ├── GeneralSettingsTab.tsx   # Общие настройки
    └── SystemSettingsTab.tsx    # Системный мониторинг
```

## 🎯 Особенности

### ✨ Визуальные эффекты
- **3D карточки** с hover эффектами
- **Градиентные фоны** и backdrop-blur
- **Анимированные заголовки** с shimmering-text
- **Particle эффекты** для визуального улучшения

### 📊 Интерактивные графики
- **LineChart** - тренды использования API
- **BarChart** - статистика языков и уведомлений
- **PieChart** - распределение по платформам
- **Progress** - прогресс переводов

### 🔧 Функциональность
- **Real-time мониторинг** системы
- **Live preview** PWA и уведомлений
- **Валидация** с визуальным feedback
- **Интерактивные счетчики** для статистики

## 🚀 Использование

```tsx
import { SettingsTab } from './components/screens/admin/SettingsTab';

// В админ панели
<SettingsTab />
```

## 🎨 Shadcn компоненты

Все компоненты используют современные shadcn/ui элементы:
- `BackgroundGradient` - фоны
- `MagneticButton` - кнопки
- `Counter` - счетчики
- `Status` - индикаторы
- `SparklesCore` - эффекты
- `Terminal` - логи

## 📱 Адаптивность

- ✅ Desktop с hover эффектами
- ✅ Tablet оптимизация
- ✅ Mobile поддержка
- ✅ Keyboard navigation

## 🔧 Технические детали

- **TypeScript** - полная типизация
- **Framer Motion** - анимации
- **Recharts** - графики
- **Tailwind CSS** - стилизация

---

*Создано с использованием shadcn/ui и современных практик UI/UX* 🎨✨
