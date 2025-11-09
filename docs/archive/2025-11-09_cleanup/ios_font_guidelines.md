# 📘 iOS Typography & Font Guidelines for React (Vite) & React Native

## 🎯 Цель

Создать унифицированную систему шрифтов, которая полностью повторяет эстетику iOS (Human Interface Guidelines) и подходит для:

- Web-приложений на **React + Vite**
- Мобильных приложений на **React Native**
- Общей дизайн-системы с лёгкой адаптацией между платформами

## 🔤 Основной системный шрифт iOS

### 1. San Francisco (SF Pro / SF Compact)

- Официальный системный шрифт Apple.
- Для web и desktop используется **SF Pro Text** и **SF Pro Display**.
- Для React Native системный шрифт автоматически подхватывается.
- Скачать официально можно через Apple Developer Fonts: [https://developer.apple.com/fonts/](https://developer.apple.com/fonts/)
  > ✅ Установка через терминал не требуется, просто скачайте и установите шрифты на вашу систему.

**Web:**

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
```

**React Native:**

```js
fontFamily: 'System'
```

> `fontFamily: 'System'` автоматически использует San Francisco на iOS и Roboto на Android, обеспечивая кроссплатформенную гармонию.

## 📏 Типографическая шкала iOS

| Назначение  | UIKit стиль | Размер | Толщина | Web пример                         |
| ----------- | ----------- | ------ | ------- | ---------------------------------- |
| Large Title | largeTitle  | 34px   | 700     | text-4xl font-bold                 |
| Title 1     | title1      | 28px   | 600     | text-3xl font-semibold             |
| Title 2     | title2      | 22px   | 600     | text-2xl font-semibold             |
| Title 3     | title3      | 20px   | 600     | text-xl font-semibold              |
| Headline    | headline    | 17px   | 600     | text-base font-semibold            |
| Body        | body        | 17px   | 400     | text-base font-normal              |
| Callout     | callout     | 16px   | 400     | text-[16px] font-normal            |
| Subhead     | subheadline | 15px   | 400     | text-[15px] font-normal opacity-85 |
| Footnote    | footnote    | 13px   | 400     | text-sm font-normal opacity-70     |
| Caption 1   | caption1    | 12px   | 400     | text-xs font-normal opacity-60     |
| Caption 2   | caption2    | 11px   | 400     | text-[11px] font-normal opacity-60 |

## 🌞 Светлая и 🌙 Тёмная тема

| Элемент         | Светлая тема       | Тёмная тема           |
| --------------- | ------------------ | --------------------- |
| Основной текст  | #000000            | #FFFFFF               |
| Вторичный текст | rgba(60,60,67,0.6) | rgba(235,235,245,0.6) |
| Неактивный      | rgba(60,60,67,0.3) | rgba(235,235,245,0.3) |

**CSS для Web:**

```css
:root {
  --text-primary-light: #000;
  --text-secondary-light: rgba(60, 60, 67, 0.6);
  --text-primary-dark: #fff;
  --text-secondary-dark: rgba(235, 235, 245, 0.6);
}

@media (prefers-color-scheme: dark) {
  body {
    color: var(--text-primary-dark);
  }
}
```

**React Native:**

```js
import { useColorScheme } from 'react-native';
const colors = {
  light: { text: '#000', secondary: 'rgba(60,60,67,0.6)' },
  dark: { text: '#fff', secondary: 'rgba(235,235,245,0.6)' }
};
const colorScheme = useColorScheme();
const currentColors = colors[colorScheme];
```

## 📱 Адаптивная типографика и UI

- Используйте относительные единицы:
  - Web: rem, %, vw/vh, clamp()
  - React Native: dp + библиотеки типа react-native-size-matters
- SafeAreaView и useWindowDimensions помогают адаптировать компоненты под разные экраны.
- Dynamic Type для масштабирования текста.

Пример React Native:

```js
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
const styles = {
  title: { fontSize: moderateScale(28) },
  modal: { width: scale(300), height: verticalScale(400) },
};
```

Пример SafeAreaView:

```js
import { useWindowDimensions, SafeAreaView } from 'react-native';
const { width, height } = useWindowDimensions();
const modalWidth = width * 0.9;
const modalHeight = height * 0.6;
```

## 🧩 Tailwind-конфиг под стиль iOS

```js
export default {
  theme: {
    extend: {
      fontFamily: {
        ios: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Helvetica Neue"', 'sans-serif'],
      },
      fontSize: {
        'large-title': ['34px', { fontWeight: '700' }],
        'title-1': ['28px', { fontWeight: '600' }],
        'title-2': ['22px', { fontWeight: '600' }],
        'title-3': ['20px', { fontWeight: '600' }],
        'headline': ['17px', { fontWeight: '600' }],
        'body': ['17px', { fontWeight: '400' }],
        'callout': ['16px', { fontWeight: '400' }],
        'subhead': ['15px', { fontWeight: '400' }],
        'footnote': ['13px', { fontWeight: '400', opacity: 0.7 }],
        'caption-1': ['12px', { fontWeight: '400', opacity: 0.6 }],
      },
    },
  },
};
```

## 🧠 Лучшие практики

1. Минимум 2–3 уровня иерархии текста.
2. Использовать относительные единицы для всех размеров.
3. Общие токены для Web и React Native.
4. Поддержка динамической темы и Dynamic Type.
5. Использовать официальные SF Pro шрифты через Apple Developer.
6. Модальные окна, карточки и кнопки адаптировать под размеры экрана.

## 🧭 Пример использования (React + Vite)

```jsx
<h1 className="font-ios text-large-title text-primary">Добро пожаловать</h1>
<p className="font-ios text-body text-secondary">
  Это пример типографики iOS для вашего Web App.
</p>
```

## 📱 Пример для React Native

```jsx
import { Text, useColorScheme } from 'react-native';
export default function Example() {
  const theme = useColorScheme();
  const color = theme === 'dark' ? '#fff' : '#000';
  return (
    <Text style={{ fontSize: 28, fontWeight: '600', color }}>Добро пожаловать</Text>
  );
}
```

## ✅ Резюме

- Используйте официальные SF Pro шрифты.
- Проектируйте интерфейс адаптивно (iPhone SE → iPhone 17 Pro).
- Применяйте динамическую тему и Dynamic Type.
- Сохраняйте единый стиль между Web и React Native.

Готово ✅ Вот ссылка для скачивания предыдущего документа: [📄 ios-theme-guidelines.md](sandbox:/mnt/data/ios-theme-guidelines.md)

