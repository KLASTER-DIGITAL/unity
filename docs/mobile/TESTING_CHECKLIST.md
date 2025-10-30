# React Native Testing Checklist - UNITY-v2

**Дата**: 2025-10-30  
**Версия**: 1.0  
**Статус**: In Progress

---

## 🎯 Цель тестирования

Проверить работоспособность всех реализованных фич React Native версии UNITY-v2:
- ✅ Lottie Preloader
- ✅ Custom Tab Bar
- ✅ Screen Transitions
- ✅ Skeleton Loaders
- ✅ API Integration (Supabase)
- ✅ Dark Mode Support
- ✅ Haptic Feedback
- ✅ Pull to Refresh
- ✅ Gesture Handlers

---

## 📱 Платформы для тестирования

### 1. Expo Go (Quick Testing)
- [ ] iOS (iPhone)
- [ ] Android (Physical device)

### 2. Development Build (Full Testing)
- [ ] iOS Development Build
- [ ] Android APK

### 3. Web (Expo Web)
- [ ] Chrome Desktop
- [ ] Safari Desktop

---

## ✅ Тестовые сценарии

### 1. Dark Mode Support

#### 1.1 Переключение темы
- [ ] Открыть Settings Screen
- [ ] Найти переключатель "Темная тема"
- [ ] Переключить на темную тему
- [ ] Проверить что иконка изменилась (moon → sunny)
- [ ] Проверить что описание обновилось
- [ ] Проверить haptic feedback при переключении

#### 1.2 Визуальная проверка Dark Mode
- [ ] **Home Screen**: background, text, cards, tab bar
- [ ] **Diary Screen**: background, text, entry cards, search bar
- [ ] **Achievements Screen**: background, text, achievement cards, progress bars
- [ ] **Settings Screen**: background, text, switches, profile section
- [ ] **Custom Tab Bar**: background, border, active tab, icons

#### 1.3 Контраст текста (WCAG AA)
- [ ] Основной текст читается на фоне
- [ ] Вторичный текст читается на фоне
- [ ] Иконки видны на фоне
- [ ] Borders видны

#### 1.4 Persistence (AsyncStorage)
- [ ] Переключить на темную тему
- [ ] Закрыть приложение (полностью)
- [ ] Открыть приложение снова
- [ ] Проверить что темная тема сохранилась

#### 1.5 System Theme Detection
- [ ] Установить режим "System" (если есть в UI)
- [ ] Изменить системную тему на устройстве
- [ ] Проверить что приложение автоматически переключилось

---

### 2. Lottie Preloader

#### 2.1 Light Theme
- [ ] Установить светлую тему
- [ ] Перезагрузить Home Screen (pull to refresh)
- [ ] Проверить что показывается Black-2.json (черная анимация)
- [ ] Анимация видна на светлом фоне

#### 2.2 Dark Theme
- [ ] Установить темную тему
- [ ] Перезагрузить Home Screen (pull to refresh)
- [ ] Проверить что показывается White-2.json (белая анимация)
- [ ] Анимация видна на темном фоне

#### 2.3 Skeleton Loaders
- [ ] Проверить shimmer эффект
- [ ] Проверить плавность анимации
- [ ] Проверить что skeleton loaders используют theme colors

---

### 3. Custom Tab Bar

#### 3.1 Визуальный дизайн
- [ ] Floating effect (отступ снизу, тень)
- [ ] Скругленные углы
- [ ] Pill-style активная вкладка
- [ ] Label показывается только для активной вкладки

#### 3.2 Анимации
- [ ] Плавное появление/исчезновение label
- [ ] Width анимация при переключении
- [ ] Opacity анимация
- [ ] Scale анимация при нажатии

#### 3.3 Haptic Feedback
- [ ] Haptic feedback при переключении вкладки
- [ ] Легкая вибрация (Light impact)

#### 3.4 Keyboard Aware
- [ ] Открыть клавиатуру (например, в Diary Screen search)
- [ ] Проверить что tab bar скрывается
- [ ] Закрыть клавиатуру
- [ ] Проверить что tab bar появляется снова

#### 3.5 Dark Mode
- [ ] Tab bar background меняется на темный
- [ ] Border color меняется
- [ ] Active tab background меняется
- [ ] Icon colors меняются

---

### 4. Screen Transitions

#### 4.1 iOS-style Transitions
- [ ] Переход Home → Diary (slide from right)
- [ ] Переход Diary → Achievements (slide from right)
- [ ] Переход Achievements → Settings (slide from right)
- [ ] Gesture swipe back работает

#### 4.2 Плавность
- [ ] 300ms duration
- [ ] Нет лагов
- [ ] 60 FPS

---

### 5. API Integration (Supabase)

#### 5.1 Home Screen
- [ ] Загружаются реальные данные пользователя
- [ ] Показывается имя пользователя
- [ ] Показывается уровень
- [ ] Показывается streak
- [ ] Показываются последние записи

#### 5.2 Diary Screen
- [ ] Загружаются все записи
- [ ] Записи отсортированы по дате (новые сверху)
- [ ] Swipe to delete работает
- [ ] Haptic feedback при удалении

#### 5.3 Achievements Screen
- [ ] Загружаются статистика
- [ ] Показывается прогресс
- [ ] Показываются достижения

#### 5.4 Real-time Updates
- [ ] Открыть приложение на двух устройствах
- [ ] Создать запись на одном устройстве
- [ ] Проверить что запись появилась на втором устройстве

---

### 6. Pull to Refresh

#### 6.1 Функциональность
- [ ] Home Screen: pull to refresh обновляет данные
- [ ] Diary Screen: pull to refresh обновляет записи
- [ ] Achievements Screen: pull to refresh обновляет статистику

#### 6.2 Визуал
- [ ] Spinner цвет соответствует theme (primary color)
- [ ] Haptic feedback при refresh

---

### 7. Gesture Handlers

#### 7.1 Swipe to Delete (Diary Screen)
- [ ] Swipe left на entry card
- [ ] Появляется красная кнопка "Удалить"
- [ ] Haptic feedback при достижении threshold
- [ ] Haptic feedback при удалении
- [ ] Запись удаляется из списка

---

### 8. Performance

#### 8.1 Анимации
- [ ] Все анимации 60 FPS
- [ ] Нет лагов при переключении вкладок
- [ ] Нет лагов при scroll

#### 8.2 Загрузка данных
- [ ] Skeleton loaders показываются мгновенно
- [ ] Данные загружаются быстро (< 2 сек)
- [ ] Нет "белого экрана"

---

## 🐛 Найденные баги

### Критические
- [ ] Нет критических багов

### Средние
- [ ] Нет средних багов

### Минорные
- [ ] Нет минорных багов

---

## 📊 Результаты тестирования

### Expo Go (iOS)
- **Статус**: ⏳ Pending
- **Дата**: -
- **Результат**: -

### Expo Go (Android)
- **Статус**: ⏳ Pending
- **Дата**: -
- **Результат**: -

### Development Build (iOS)
- **Статус**: ⏳ Pending
- **Дата**: -
- **Результат**: -

### Development Build (Android)
- **Статус**: ⏳ Pending
- **Дата**: -
- **Результат**: -

---

## 🎯 Следующие шаги

1. [ ] Протестировать в Expo Go (iOS/Android)
2. [ ] Создать EAS Development Build
3. [ ] Протестировать Development Build
4. [ ] Исправить найденные баги
5. [ ] Финальное тестирование
6. [ ] Обновить документацию с результатами

---

## 📝 Примечания

- Тестирование проводится на реальных устройствах
- Используется тестовый аккаунт: rustam@leadshunter.biz / demo123
- Supabase Project ID: ecuwuzqlwdkkdncampnc

