# Admin Test Lab - Тестирование адаптивности и UI компонентов

**Статус**: Planned  
**Приоритет**: P1  
**Срок**: 1-2 недели  
**Дата создания**: 2025-10-26

---

## 🎯 Цель

Создать отдельный раздел в админ-панели (`/?view=admin&section=test-lab`) для тестирования адаптивности и UI компонентов PWA кабинета пользователя.

---

## 📋 Описание

Admin Test Lab - это инструмент для разработчиков и дизайнеров, позволяющий:
- Тестировать PWA кабинет на различных устройствах (iPhone, Android, Desktop)
- Переключаться между Web и React Native режимами (симуляция)
- Проверять responsive breakpoints (320px, 375px, 390px, 430px)
- Инспектировать компоненты и их props/state
- Переключать темы (светлая/тёмная) в реальном времени

---

## 🎨 Функциональность

### 1. Device Mocks
Использовать shadcn/ui Device Mocks компоненты:
- **iPhone 15 Pro mock** - https://www.shadcn.io/components/device-mocks/iphone-15-pro
- **Android mock** - https://www.shadcn.io/components/device-mocks/android
- **Safari browser mock** - https://www.shadcn.io/components/device-mocks/safari

### 2. Основные возможности
- **Device Selector**: Переключение между iPhone / Android / Safari (desktop)
- **Live Preview**: Показывать реальный PWA кабинет пользователя внутри device mock
- **Platform Toggle**: Переключение между Web и React Native режимами (симуляция)
- **Responsive Testing**: Проверка breakpoints (320px, 375px, 390px, 430px)
- **Theme Toggle**: Переключение светлой/тёмной темы в реальном времени
- **Component Inspector**: Возможность выбрать компонент и увидеть его props/state

### 3. Технические детали
- Использовать `<iframe>` для отображения PWA кабинета внутри device mock
- URL iframe: `https://unity-wine.vercel.app` (production) или `http://localhost:5173` (dev)
- Добавить postMessage API для коммуникации между admin и iframe
- Сохранять выбранное устройство в localStorage

---

## 🏗️ Структура компонентов

```
src/
  features/
    admin/
      components/
        TestLab/
          TestLab.tsx           # Главный компонент
          DeviceSelector.tsx    # Выбор устройства
          PlatformToggle.tsx    # Web/Native переключатель
          LivePreview.tsx       # iframe с PWA кабинетом
          ComponentInspector.tsx # Инспектор компонентов
          types.ts              # TypeScript типы
          index.ts              # Экспорты
```

---

## 🔐 Доступ

- **Роль**: Только `super_admin`
- **Маршрут**: `/?view=admin&section=test-lab`
- **Навигация**: Добавить пункт "Test Lab" в меню админ-панели

---

## 📝 Задачи

### Этап 1: Подготовка (1-2 дня)
- [ ] Установить shadcn/ui Device Mocks компоненты
- [ ] Создать структуру папок и файлов
- [ ] Настроить TypeScript типы

### Этап 2: Базовые компоненты (2-3 дня)
- [ ] Реализовать DeviceSelector компонент
- [ ] Реализовать PlatformToggle компонент
- [ ] Реализовать LivePreview компонент с iframe
- [ ] Настроить postMessage API для коммуникации

### Этап 3: Дополнительные возможности (2-3 дня)
- [ ] Реализовать ComponentInspector компонент
- [ ] Добавить Theme Toggle
- [ ] Добавить Responsive Testing (breakpoints)
- [ ] Сохранение настроек в localStorage

### Этап 4: Интеграция (1-2 дня)
- [ ] Интегрировать TestLab в AdminDashboard
- [ ] Добавить маршрут `/?view=admin&section=test-lab`
- [ ] Добавить пункт в навигацию админ-панели
- [ ] Проверка доступа (только super_admin)

### Этап 5: Тестирование (1 день)
- [ ] Проверить работу на всех device mocks
- [ ] Проверить postMessage API
- [ ] Проверить Theme Toggle
- [ ] Проверить Responsive Testing
- [ ] Проверить Supabase Advisors
- [ ] Проверить консоль браузера

---

## 🎯 Метрики успеха

- ✅ Рабочий Admin Test Lab с device mocks (iPhone, Android, Safari)
- ✅ Возможность тестировать PWA кабинет в реальном времени
- ✅ Симуляция Web и React Native режимов
- ✅ Theme Toggle работает корректно
- ✅ Responsive Testing показывает все breakpoints
- ✅ 0 ошибок в консоли браузера
- ✅ 0 WARN в Supabase Advisors

---

## 🔗 Связанные документы

- **ROADMAP.md**: Среднесрочные задачи (1-3 месяца)
- **STATUS.md**: Текущий статус проекта
- **FINAL_REPORT_2025-10-26.md**: Финальный отчёт v2.0

---

## 📚 Ресурсы

- shadcn/ui Device Mocks: https://www.shadcn.io/components/device-mocks
- iPhone 15 Pro mock: https://www.shadcn.io/components/device-mocks/iphone-15-pro
- Android mock: https://www.shadcn.io/components/device-mocks/android
- Safari browser mock: https://www.shadcn.io/components/device-mocks/safari
- postMessage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage

---

**Автор**: Augment Agent  
**Дата создания**: 2025-10-26  
**Версия**: 1.0

