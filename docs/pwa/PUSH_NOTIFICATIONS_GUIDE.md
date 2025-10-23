# 🔔 Push Notifications Guide - UNITY-v2

**Дата**: 2025-10-22  
**Версия**: 1.0  
**Статус**: ✅ Тестирование реализовано, Web Push API в планах

---

## 📊 Текущий статус

### ✅ Что готово (100%)

1. **Тестирование Push Notifications**
   - `pushNotificationSupport.ts` - утилиты проверки браузеров
   - `PushNotificationTester.tsx` - компонент в админ-панели
   - Поддержка всех браузеров
   - Превью уведомлений
   - Тестовая отправка

2. **Поддержка браузеров**
   - ✅ Chrome (Desktop & Android) - Полная поддержка
   - ✅ Firefox (Desktop & Android) - Полная поддержка
   - ✅ Edge (Desktop & Android) - Полная поддержка
   - ✅ Opera (Desktop & Android) - Полная поддержка
   - ✅ Samsung Internet - Полная поддержка
   - ⚠️ Safari macOS 16+ - Ограниченная поддержка
   - ❌ Safari iOS - НЕТ поддержки Service Worker Push

### ⏳ Что в планах (P2)

1. **Web Push API интеграция** (8 часов)
   - VAPID keys генерация и хранение
   - Подписка на push через Service Worker
   - Отправка push через backend
   - Хранение подписок в БД

2. **Push Analytics** (4 часа)
   - Отслеживание отправленных push
   - Отслеживание открытых push
   - Отслеживание кликов по push
   - Статистика в админ-панели

---

## 🧪 Тестирование Push Notifications

### Где найти тестер

1. Открыть http://localhost:3001/?view=admin
2. Войти как супер-админ (diary@leadshunter.biz)
3. Settings → PWA Settings
4. Прокрутить вниз → "Тестирование Push Notifications"

### Что показывает тестер

#### 1. Информация о браузере
- Название браузера (Chrome, Firefox, Safari, etc.)
- Версия браузера
- Операционная система (Windows, macOS, Linux, Android, iOS)
- Тип устройства (Desktop, Mobile)

#### 2. Поддержка API
- ✅/❌ Service Worker
- ✅/❌ Push Manager
- ✅/❌ Notifications API
- ✅/❌ Permissions API

#### 3. Рекомендации
- Автоматические рекомендации для текущего браузера
- Что делать если браузер не поддерживает
- Альтернативные решения

#### 4. Тестовая отправка
- Форма для ввода заголовка и текста
- Кнопка "Отправить тестовое уведомление"
- Превью как будет выглядеть уведомление
- Результат отправки (успех/ошибка)

---

## 🌐 Поддержка браузеров

### ✅ Полная поддержка

#### Chrome (Desktop & Android)
- **Версия**: 42+
- **Service Worker**: ✅
- **Push Manager**: ✅
- **Notifications**: ✅
- **Рекомендация**: Лучший выбор для PWA

#### Firefox (Desktop & Android)
- **Версия**: 44+
- **Service Worker**: ✅
- **Push Manager**: ✅
- **Notifications**: ✅
- **Рекомендация**: Отличная поддержка

#### Edge (Desktop & Android)
- **Версия**: 17+
- **Service Worker**: ✅
- **Push Manager**: ✅
- **Notifications**: ✅
- **Рекомендация**: Полная поддержка

#### Opera (Desktop & Android)
- **Версия**: 42+
- **Service Worker**: ✅
- **Push Manager**: ✅
- **Notifications**: ✅
- **Рекомендация**: Полная поддержка

#### Samsung Internet
- **Версия**: 4.0+
- **Service Worker**: ✅
- **Push Manager**: ✅
- **Notifications**: ✅
- **Рекомендация**: Полная поддержка

### ⚠️ Ограниченная поддержка

#### Safari macOS
- **Версия**: 16+ (macOS Ventura)
- **Service Worker**: ✅
- **Push Manager**: ✅ (с версии 16)
- **Notifications**: ✅
- **Ограничения**:
  - Требуется macOS Ventura или новее
  - Более старые версии НЕ поддерживают
- **Рекомендация**: Обновить до Safari 16+ или использовать Chrome

### ❌ НЕТ поддержки

#### Safari iOS
- **Версия**: Все версии
- **Service Worker**: ⚠️ (только для кеширования)
- **Push Manager**: ❌ НЕТ
- **Notifications**: ⚠️ (только Web Push API, НЕ Service Worker Push)
- **Ограничения**:
  - iOS 16.4+ поддерживает Web Push API
  - НО НЕ поддерживает Service Worker Push
  - Требуется нативное приложение для полной поддержки
- **Рекомендация**: 
  - Использовать нативное приложение
  - Или альтернативные методы (email, SMS)

---

## 🛠️ Как использовать тестер

### Шаг 1: Проверить поддержку

1. Открыть PushNotificationTester в админ-панели
2. Посмотреть "Информация о браузере"
3. Проверить "Поддержка API"
4. Прочитать "Рекомендации"

### Шаг 2: Отправить тестовое уведомление

**Если браузер поддерживает**:

1. Ввести заголовок (например: "🎉 UNITY Diary")
2. Ввести текст (например: "Это тестовое уведомление!")
3. Нажать "Отправить тестовое уведомление"
4. Разрешить уведомления в браузере (если спросит)
5. Увидеть уведомление!

**Если браузер НЕ поддерживает**:

1. Увидите красное сообщение с причиной
2. Получите рекомендации что делать
3. Попробуйте другой браузер или устройство

### Шаг 3: Проверить превью

1. Посмотреть "Превью уведомления"
2. Увидеть как будет выглядеть уведомление
3. Проверить иконку, заголовок, текст

---

## 📝 Примеры использования

### Пример 1: Тестирование на Chrome Desktop

```
1. Открыть Chrome
2. Перейти на http://localhost:3001/?view=admin
3. Войти как супер-админ
4. Settings → PWA Settings → Тестирование Push Notifications
5. Увидеть:
   - Браузер: Chrome 120
   - ОС: macOS
   - Тип: Десктоп
   - Поддержка: ✅ Поддерживается
6. Ввести заголовок: "Тест"
7. Ввести текст: "Это работает!"
8. Нажать "Отправить"
9. Разрешить уведомления
10. ✅ Увидеть уведомление!
```

### Пример 2: Тестирование на Safari iOS

```
1. Открыть Safari на iPhone
2. Перейти на https://unity-diary-app.netlify.app/?view=admin
3. Войти как супер-админ
4. Settings → PWA Settings → Тестирование Push Notifications
5. Увидеть:
   - Браузер: Safari 17
   - ОС: iOS
   - Тип: Мобильный
   - Поддержка: ❌ Не поддерживается
6. Увидеть причину: "iOS Safari не поддерживает Push Notifications через Service Worker"
7. Получить рекомендации:
   - Использовать нативное приложение
   - Или альтернативные методы (email, SMS)
```

### Пример 3: Тестирование на Firefox Android

```
1. Открыть Firefox на Android
2. Перейти на https://unity-diary-app.netlify.app/?view=admin
3. Войти как супер-админ
4. Settings → PWA Settings → Тестирование Push Notifications
5. Увидеть:
   - Браузер: Firefox 121
   - ОС: Android
   - Тип: Мобильный
   - Поддержка: ✅ Поддерживается
6. Ввести заголовок: "Мобильный тест"
7. Ввести текст: "Работает на Android!"
8. Нажать "Отправить"
9. Разрешить уведомления
10. ✅ Увидеть уведомление!
```

---

## 🔧 Технические детали

### Файлы

#### `src/shared/lib/pwa/pushNotificationSupport.ts`
Утилиты для работы с Push Notifications:

- `getBrowserInfo()` - определяет браузер, версию, ОС
- `checkPushSupport()` - проверяет поддержку Push API
- `requestPushPermission()` - запрашивает разрешение
- `sendTestNotification()` - отправляет тестовое уведомление
- `getPushRecommendations()` - даёт рекомендации

#### `src/components/screens/admin/settings/PushNotificationTester.tsx`
Компонент для тестирования в админ-панели:

- Автоматическая проверка при монтировании
- UI для отображения информации о браузере
- Форма для отправки тестовых уведомлений
- Превью уведомлений
- Обработка ошибок

### API

#### `checkPushSupport(): PushSupportInfo`
Проверяет поддержку Push Notifications в текущем браузере.

**Возвращает**:
```typescript
{
  isSupported: boolean;
  reason?: string;
  browserInfo: {
    name: string;
    version: string;
    os: string;
    isMobile: boolean;
  };
  features: {
    serviceWorker: boolean;
    pushManager: boolean;
    notifications: boolean;
    permissions: boolean;
  };
}
```

#### `sendTestNotification(title: string, body: string, icon?: string): Promise<void>`
Отправляет тестовое уведомление.

**Параметры**:
- `title` - заголовок уведомления
- `body` - текст уведомления
- `icon` - путь к иконке (опционально)

**Throws**: Ошибка если браузер не поддерживает или разрешение не получено

---

## 🚀 Следующие шаги (P2)

### 1. Web Push API интеграция (8 часов)

**Задачи**:
1. Генерация VAPID keys
2. Хранение VAPID keys в admin_settings
3. Подписка на push через Service Worker
4. Хранение подписок в БД (таблица `push_subscriptions`)
5. Отправка push через backend (Edge Function)
6. Обработка push в Service Worker

### 2. Push Analytics (4 часа)

**Задачи**:
1. Отслеживание отправленных push
2. Отслеживание открытых push
3. Отслеживание кликов по push
4. Статистика в админ-панели

### 3. Мультиязычные push (2 часа)

**Задачи**:
1. Шаблоны push на 7 языках
2. Автоматический выбор языка по профилю пользователя
3. Fallback на английский если язык не поддерживается

---

## 📚 Полезные ссылки

- [Web Push API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Notifications API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Service Worker API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Can I Use - Push API](https://caniuse.com/push-api)
- [Safari Push Notifications](https://webkit.org/blog/12945/meet-web-push/)

