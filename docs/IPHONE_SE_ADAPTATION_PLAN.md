# 📱 iPhone SE Adaptation Plan

**Дата создания:** 2025-10-19  
**Статус:** В процессе  
**Приоритет:** Высокий

---

## 🎯 Цель

Обеспечить корректное отображение UNITY-v2 на всех мобильных устройствах с адаптивной типографикой, модальными окнами и компонентами.

---

## 📱 Целевые устройства и viewport размеры

| Устройство | Viewport (portrait) | Viewport (landscape) | Приоритет |
|------------|---------------------|----------------------|-----------|
| **iPhone SE (2020)** | 375 x 667 | 667 x 375 | 🔴 Высокий |
| **iPhone 12/13 Mini** | 375 x 812 | 812 x 375 | 🟡 Средний |
| **iPhone 12/13/14** | 390 x 844 | 844 x 390 | 🟡 Средний |
| **iPhone 14 Pro Max** | 430 x 932 | 932 x 430 | 🟢 Низкий |
| **Samsung Galaxy S20** | 360 x 800 | 800 x 360 | 🟡 Средний |
| **Samsung Galaxy S21+** | 384 x 854 | 854 x 384 | 🟢 Низкий |

**Минимальный поддерживаемый размер:** 320px (iPhone 5/SE 1st gen)  
**Максимальный размер:** 430px (iPhone 14 Pro Max)

---

## 🐛 Выявленные проблемы

### **1. Responsive Typography**

**Проблема:**
- Шрифты не адаптируются к малым экранам (320px-375px)
- Large Title (34px) слишком большой для iPhone SE
- Недостаточно media queries для адаптивности

**Текущие размеры (из ios_font_guidelines.md):**
- Large Title: 34px
- Title 1: 28px
- Title 2: 22px
- Title 3: 20px
- Body: 17px
- Footnote: 13px

**Рекомендуемые размеры для iPhone SE (375px):**
- Large Title: 28px (-18%)
- Title 1: 24px (-14%)
- Title 2: 20px (-9%)
- Title 3: 18px (-10%)
- Body: 16px (-6%)
- Footnote: 12px (-8%)

---

### **2. Bottom Sheet Modals**

**Проблема:**
- `max-h-[85vh]` может быть слишком высоким для iPhone SE (667px)
- Padding не адаптируется к малым экранам
- Контент может не помещаться на экране

**Текущие стили (SettingsScreen.tsx):**
```css
className="fixed bottom-20 left-0 right-0 z-50 bg-card rounded-t-[24px] p-6 max-w-md mx-auto max-h-[85vh] overflow-y-auto"
```

**Проблемы:**
- `bottom-20` (80px) - слишком много для малых экранов
- `p-6` (24px) - можно уменьшить до `p-4` (16px)
- `max-h-[85vh]` - на iPhone SE (667px) = 567px, может быть слишком много

**Рекомендуемые изменения:**
```css
className="fixed bottom-16 sm:bottom-20 left-0 right-0 z-50 bg-card rounded-t-[24px] p-4 sm:p-6 max-w-md mx-auto max-h-[80vh] sm:max-h-[85vh] overflow-y-auto"
```

---

### **3. Component Spacing**

**Проблема:**
- Gap, padding, margin не адаптируются к малым экранам
- Компоненты слишком плотно расположены или слишком разрежены

**Текущие spacing (примеры):**
- SettingsSection: `px-4 pt-6 pb-2`
- SettingsRow: `p-4`
- Modal content: `p-6`

**Рекомендуемые изменения:**
- Использовать responsive spacing: `p-3 sm:p-4 md:p-6`
- Уменьшить gap между элементами на малых экранах

---

## 🔧 План исправлений

### **Фаза 1: Создание адаптивных CSS переменных**

**Файл:** `src/shared/styles/responsive-typography.css`

```css
/* Base typography (mobile-first) */
:root {
  /* iPhone SE and smaller (320px-374px) */
  --text-large-title: 28px;
  --text-title-1: 24px;
  --text-title-2: 20px;
  --text-title-3: 18px;
  --text-headline: 16px;
  --text-body: 16px;
  --text-callout: 15px;
  --text-subhead: 14px;
  --text-footnote: 12px;
  --text-caption-1: 11px;
  --text-caption-2: 10px;
  
  /* Spacing */
  --spacing-modal-padding: 16px;
  --spacing-section-padding: 12px;
  --spacing-row-padding: 12px;
  --spacing-gap: 12px;
}

/* iPhone 12/13 Mini and larger (375px+) */
@media (min-width: 375px) {
  :root {
    --text-large-title: 30px;
    --text-title-1: 26px;
    --text-title-2: 21px;
    --text-title-3: 19px;
    --text-headline: 17px;
    --text-body: 17px;
    --text-callout: 16px;
    --text-subhead: 15px;
    --text-footnote: 13px;
    --text-caption-1: 12px;
    --text-caption-2: 11px;
    
    --spacing-modal-padding: 20px;
    --spacing-section-padding: 16px;
    --spacing-row-padding: 16px;
    --spacing-gap: 16px;
  }
}

/* iPhone 12/13/14 and larger (390px+) */
@media (min-width: 390px) {
  :root {
    --text-large-title: 34px;
    --text-title-1: 28px;
    --text-title-2: 22px;
    --text-title-3: 20px;
    --text-headline: 17px;
    --text-body: 17px;
    --text-callout: 16px;
    --text-subhead: 15px;
    --text-footnote: 13px;
    --text-caption-1: 12px;
    --text-caption-2: 11px;
    
    --spacing-modal-padding: 24px;
    --spacing-section-padding: 16px;
    --spacing-row-padding: 16px;
    --spacing-gap: 16px;
  }
}
```

---

### **Фаза 2: Обновление Tailwind конфигурации**

**Файл:** `tailwind.config.js`

```js
export default {
  theme: {
    extend: {
      fontSize: {
        'large-title': 'var(--text-large-title)',
        'title-1': 'var(--text-title-1)',
        'title-2': 'var(--text-title-2)',
        'title-3': 'var(--text-title-3)',
        'headline': 'var(--text-headline)',
        'body': 'var(--text-body)',
        'callout': 'var(--text-callout)',
        'subhead': 'var(--text-subhead)',
        'footnote': 'var(--text-footnote)',
        'caption-1': 'var(--text-caption-1)',
        'caption-2': 'var(--text-caption-2)',
      },
      spacing: {
        'modal-padding': 'var(--spacing-modal-padding)',
        'section-padding': 'var(--spacing-section-padding)',
        'row-padding': 'var(--spacing-row-padding)',
      },
      gap: {
        'responsive': 'var(--spacing-gap)',
      },
    },
  },
};
```

---

### **Фаза 3: Обновление компонентов**

#### **3.1. SettingsScreen.tsx - Bottom Sheet Modals**

**Изменения:**
- Заменить `p-6` на `p-modal-padding`
- Заменить `max-h-[85vh]` на `max-h-[80vh] sm:max-h-[85vh]`
- Заменить `bottom-20` на `bottom-16 sm:bottom-20`

**Файлы для обновления:**
- Rate App Modal (lines 549-620)
- FAQ Modal (lines 622-693)
- Premium Modal (lines 695-753)

---

#### **3.2. SettingsRow.tsx - Component Spacing**

**Изменения:**
- Заменить `p-4` на `p-row-padding`
- Добавить responsive gap

---

#### **3.3. AchievementHomeScreen.tsx - Typography**

**Изменения:**
- Заменить `text-4xl` на `text-large-title`
- Заменить `text-3xl` на `text-title-1`
- Заменить `text-2xl` на `text-title-2`
- Заменить `text-xl` на `text-title-3`

---

### **Фаза 4: Тестирование на всех устройствах**

**Чек-лист:**
- [ ] iPhone SE (375x667) - portrait
- [ ] iPhone SE (667x375) - landscape
- [ ] iPhone 12 Mini (375x812) - portrait
- [ ] iPhone 12 (390x844) - portrait
- [ ] iPhone 14 Pro Max (430x932) - portrait
- [ ] Samsung Galaxy S20 (360x800) - portrait

**Экраны для тестирования:**
- [ ] AchievementHomeScreen
- [ ] SettingsScreen
- [ ] Rate App Modal
- [ ] FAQ Modal
- [ ] Premium Modal
- [ ] Support Modal
- [ ] HistoryScreen
- [ ] AchievementsScreen
- [ ] ReportsScreen

---

## 📊 Метрики успеха

| Метрика | Текущее | Целевое |
|---------|---------|---------|
| **Минимальный поддерживаемый размер** | 375px | 320px |
| **Читаемость текста на iPhone SE** | 60% | 95% |
| **Модальные окна помещаются на экране** | 70% | 100% |
| **Responsive breakpoints** | 0 | 3+ |
| **CSS переменных для адаптивности** | 0 | 20+ |

---

## 🚀 Следующие шаги

1. ✅ Создать `responsive-typography.css`
2. ⏳ Обновить `tailwind.config.js`
3. ⏳ Обновить SettingsScreen.tsx (3 модальных окна)
4. ⏳ Обновить SettingsRow.tsx
5. ⏳ Обновить AchievementHomeScreen.tsx
6. ⏳ Протестировать на всех устройствах
7. ⏳ Создать отчет с скриншотами

---

**Статус:** 🟡 В процессе (Фаза 1)

