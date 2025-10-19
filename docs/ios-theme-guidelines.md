# 🍎 iOS Theme Guidelines  
### UIKit Light / Dark Adaptation for Web & React Native

---

## 🎯 Цель  
Создать визуально согласованную систему светлой и тёмной тем, которая повторяет нативное поведение интерфейсов iOS при применении в Web и React Native проектах.  
Основная идея — использовать системные принципы **UIKit** и **Dynamic Colors**, обеспечивая плавное переключение тем через CSS или React Native Appearance API.

---

## 🌞 Светлая тема (Light Mode)

| Контекст / Элемент | UIKit Token | HEX | Применение |
|--------------------|-------------|------|-------------|
| Основной фон | `systemBackground` | `#FFFFFF` | Главный фон страниц, экранов, вью |
| Вторичный фон | `secondarySystemBackground` | `#F2F2F7` | Карточки, списки, контейнеры |
| Третичный фон | `tertiarySystemBackground` | `#FFFFFF` | Внутренние секции, nested-элементы |
| Фон grouped списков | `systemGroupedBackground` | `#F2F2F7` | Списки в стиле “Settings” |
| Вторичный grouped фон | `secondarySystemGroupedBackground` | `#FFFFFF` | Ячейки внутри grouped списков |
| Основной текст | `label` | `#000000` | Заголовки, основной контент |
| Вторичный текст | `secondaryLabel` | `rgba(60,60,67,0.6)` | Подзаголовки, вспомогательные надписи |
| Третичный текст | `tertiaryLabel` | `rgba(60,60,67,0.3)` | Подписи, placeholders |
| Разделители | `separator` | `#C6C6C8` | Бордеры, линии в таблицах |
| Системный Tint | `systemBlue` | `#007AFF` | Акцентный цвет ссылок, кнопок |

---

## 🌙 Тёмная тема (Dark Mode)

| Контекст / Элемент | UIKit Token | HEX | Применение |
|--------------------|-------------|------|-------------|
| Основной фон | `systemBackground` | `#000000` | Главный фон экранов |
| Вторичный фон | `secondarySystemBackground` | `#1C1C1E` | Карточки, контейнеры |
| Третичный фон | `tertiarySystemBackground` | `#2C2C2E` | Вложенные панели |
| Фон grouped списков | `systemGroupedBackground` | `#000000` | Общий фон экранов с таблицами |
| Вторичный grouped фон | `secondarySystemGroupedBackground` | `#1C1C1E` | Ячейки внутри grouped списков |
| Основной текст | `label` | `#FFFFFF` | Основной контент |
| Вторичный текст | `secondaryLabel` | `rgba(235,235,245,0.6)` | Подписи, описания |
| Третичный текст | `tertiaryLabel` | `rgba(235,235,245,0.3)` | Менее важные тексты |
| Разделители | `separator` | `#38383A` | Линии, бордеры |
| Системный Tint | `systemBlue` | `#0A84FF` | Акцент для ссылок, CTA |

---

## 🧱 Цветовые токены для Web / React Native

Рекомендуется использовать **CSS custom properties** (Web) или **theme object** (React Native).  
Эти токены адаптируются под `prefers-color-scheme` или `Appearance.getColorScheme()`.

```css
:root {
  /* Light */
  --color-bg: #ffffff;
  --color-bg-secondary: #f2f2f7;
  --color-text: #000000;
  --color-text-secondary: rgba(60,60,67,0.6);
  --color-border: #c6c6c8;
  --color-accent: #007aff;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #000000;
    --color-bg-secondary: #1c1c1e;
    --color-text: #ffffff;
    --color-text-secondary: rgba(235,235,245,0.6);
    --color-border: #38383a;
    --color-accent: #0a84ff;
  }
}
```

---

### 🧩 React Native пример (Styled Components / ThemeProvider)

```tsx
export const lightTheme = {
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  text: '#000000',
  textSecondary: 'rgba(60,60,67,0.6)',
  border: '#C6C6C8',
  accent: '#007AFF',
};

export const darkTheme = {
  background: '#000000',
  backgroundSecondary: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: 'rgba(235,235,245,0.6)',
  border: '#38383A',
  accent: '#0A84FF',
};
```

---

## ⚙️ Поведение тем

- **Web**: тема переключается автоматически через `prefers-color-scheme`, или вручную (через toggle).
- **React Native**: использовать `useColorScheme()` из `react-native`:
  ```tsx
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  ```
- **Анимация переключения**: рекомендуется использовать `opacity transition (0.3s)` при смене темы.

---

## 🧭 Визуальные принципы iOS

- Использовать **мягкие тени**, минимальный контраст, сглаженные углы (`border-radius: 12–16px`).
- Прозрачные слои (`backdrop-filter: blur(20px)`) для эффекта стекла.
- Пространство и иерархия важнее цвета — фон должен быть “воздушным”.
- Цвета текста адаптируются под контрастность (избегать чисто белого на чёрном).

---

## ✅ Использование в Design System

Рекомендуется интегрировать эти токены как основу темы в UI-библиотеку (например, Shadcn/UI, NativeBase, или собственную).  
Они обеспечат единый стиль между мобильными и web-интерфейсами, близкий к **нативному iOS-опыту**.
