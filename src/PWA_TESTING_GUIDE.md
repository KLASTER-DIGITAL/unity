# 🧪 PWA Testing Guide - Инструкция по тестированию

## 📱 Как проверить что PWA работает

### Шаг 1: Откройте консоль браузера

1. Нажмите **F12** (или Cmd+Option+I на Mac)
2. Перейдите на вкладку **Console**
3. Обновите страницу (F5)

### Шаг 2: Проверьте логи

Вы должны увидеть:

```
✅ PWA initialized as enabled (default)
🎧 Starting to listen for beforeinstallprompt event...

🔍 PWA Debug Information
  PWA Support:
    serviceWorker: true
    pushManager: true
    beforeInstallPrompt: true (или false на iOS)
    notification: true
  
  Installation Status:
    isPWAInstalled: false
    displayMode: browser
    standalone: undefined
    wasPromptShown: null
  
  PWA Settings:
    isPWAEnabled: true
    pwaEnabledValue: "true"
  
  Browser Info:
    userAgent: "Mozilla/5.0..."
    isIOSSafari: false
    platform: "MacIntel"
```

### Шаг 3: Ждите InstallPrompt

**Через 3 секунды после загрузки** вы должны увидеть:

```
🎉 Will show install prompt in 3 seconds...
📱 Showing InstallPrompt now!
```

И на экране появится **красивое модальное окно** с предложением установить приложение.

---

## ✅ Тест-кейсы

### Test Case 1: Первое открытие (PWA включена)

**Шаги:**
1. Очистите localStorage: `localStorage.clear()`
2. Обновите страницу: `location.reload()`
3. Подождите 3 секунды

**Ожидаемый результат:**
- ✅ В консоли: `✅ PWA initialized as enabled (default)`
- ✅ В консоли: `🎉 Will show install prompt in 3 seconds...`
- ✅ Через 3 сек появляется InstallPrompt

### Test Case 2: PWA выключена в админке

**Шаги:**
1. Откройте `?view=admin`
2. Войдите как супер-админ (diary@leadshunter.biz)
3. Настройки → PWA
4. Выключите переключатель "Активировать PWA"
5. Сохраните
6. Откройте основное приложение (без `?view=admin`)
7. Подождите 3 секунды

**Ожидаемый результат:**
- ✅ В консоли: `ℹ️ PWA status from localStorage: "false"`
- ✅ В консоли: `❌ PWA disabled by admin - not showing install prompt`
- ❌ InstallPrompt НЕ появляется

### Test Case 3: Включение PWA в админке

**Шаги:**
1. PWA выключена (Test Case 2)
2. Откройте `?view=admin` → Настройки → PWA
3. Включите переключатель
4. Сохраните
5. Откройте основное приложение
6. Подождите 3 секунды

**Ожидаемый результат:**
- ✅ В консоли: `ℹ️ PWA status from localStorage: "true"`
- ✅ В консоли: `✅ PWA enabled - preparing to show install prompt`
- ✅ Через 3 сек появляется InstallPrompt

### Test Case 4: InstallPrompt уже показывался

**Шаги:**
1. Закройте InstallPrompt (нажмите X или "Может быть позже")
2. Обновите страницу
3. Подождите 3 секунды

**Ожидаемый результат:**
- ✅ В консоли: `Install prompt shown before: "true"`
- ✅ В консоли: `ℹ️ Not showing prompt: { alreadyShown: true, ... }`
- ❌ InstallPrompt НЕ появляется

### Test Case 5: Сброс и повторный показ

**Шаги:**
1. InstallPrompt уже показывался (Test Case 4)
2. В консоли выполните:
   ```javascript
   localStorage.removeItem('installPromptShown');
   location.reload();
   ```
3. Подождите 3 секунды

**Ожидаемый результат:**
- ✅ В консоли: `Install prompt shown before: null`
- ✅ В консоли: `🎉 Will show install prompt in 3 seconds...`
- ✅ Через 3 сек появляется InstallPrompt

### Test Case 6: Установка через prompt

**Шаги:**
1. Дождитесь появления InstallPrompt
2. Нажмите кнопку "Установить приложение"
3. Подтвердите установку в браузерном диалоге

**Ожидаемый результат:**
- ✅ В консоли: `✅ User accepted the install prompt`
- ✅ Приложение устанавливается
- ✅ Появляется на главном экране / в меню приложений

### Test Case 7: iOS Safari (ручная установка)

**Шаги:**
1. Откройте приложение в Safari на iOS
2. Подождите 3 секунды

**Ожидаемый результат:**
- ✅ В консоли: `beforeInstallPrompt: false` (iOS не поддерживает)
- ✅ InstallPrompt показывается с инструкциями:
  - "Нажмите Поделиться внизу экрана"
  - "Затем выберите На экран Домой"

### Test Case 8: Кнопка установки в настройках

**Шаги:**
1. Откройте вкладку "Настройки" (нижняя навигация)
2. Найдите секцию "Приложение"
3. Найдите кнопку "Установить приложение"

**Ожидаемый результат:**
- ✅ Кнопка видна (если приложение не установлено)
- ✅ При нажатии:
  - На Android/Desktop: показывается браузерный диалог установки
  - На iOS: показывается toast с инструкциями

### Test Case 9: Приложение уже установлено

**Шаги:**
1. Установите приложение (Test Case 6)
2. Откройте установленное приложение
3. Подождите 3 секунды

**Ожидаемый результат:**
- ✅ В консоли: `Is app in standalone mode: true`
- ✅ В консоли: `ℹ️ Not showing prompt: { isStandalone: true }`
- ❌ InstallPrompt НЕ появляется
- ❌ Кнопка "Установить" в настройках скрыта

### Test Case 10: Service Worker регистрация

**Шаги:**
1. Откройте DevTools → Application → Service Workers
2. Проверьте статус SW

**Ожидаемый результат:**
- ✅ Service Worker зарегистрирован
- ✅ Статус: "activated"
- ✅ Scope: "/"

---

## 🔍 Команды для отладки

### Проверка статуса PWA

```javascript
// В консоли браузера

// 1. PWA включена?
console.log('PWA Enabled:', localStorage.getItem('pwa-enabled'));
// Ожидаемо: "true" или null

// 2. InstallPrompt показывался?
console.log('Prompt Shown:', localStorage.getItem('installPromptShown'));
// Ожидаемо: null (если еще не показывался)

// 3. Приложение установлено?
console.log('Is Installed:', window.matchMedia('(display-mode: standalone)').matches);
// Ожидаемо: false (если в браузере)

// 4. Service Worker активен?
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs);
});
// Ожидаемо: массив с минимум 1 SW

// 5. Поддержка beforeinstallprompt?
console.log('beforeinstallprompt support:', 'onbeforeinstallprompt' in window);
// Ожидаемо: true (кроме iOS Safari)
```

### Сброс для тестирования

```javascript
// Полный сброс
localStorage.clear();
location.reload();

// Только PWA настройки
localStorage.removeItem('installPromptShown');
localStorage.setItem('pwa-enabled', 'true');
location.reload();

// Только prompt флаг
localStorage.removeItem('installPromptShown');
location.reload();
```

### Принудительный показ (если не срабатывает)

```javascript
// Сброс всех ограничений
localStorage.removeItem('installPromptShown');
localStorage.setItem('pwa-enabled', 'true');

// Перезагрузка
location.reload();

// Ждите 3 секунды - prompt должен появиться
```

---

## 🐛 Частые проблемы и решения

### Проблема: "beforeinstallprompt event fired!" не появляется

**Причины:**
1. iOS Safari (не поддерживает событие)
2. Приложение уже установлено
3. Открыто не через HTTPS
4. Manifest.json недоступен
5. Service Worker не зарегистрирован

**Решение:**
1. Проверьте логи PWA Debug Information
2. Проверьте DevTools → Application → Manifest
3. Проверьте DevTools → Application → Service Workers
4. На iOS используйте ручную установку

### Проблема: "🎉 Will show..." появляется, но модалка не показывается

**Причины:**
1. React state не обновляется
2. Z-index проблемы (модалка под другими элементами)
3. CSS проблемы

**Решение:**
```javascript
// Проверьте в консоли через 3 секунды:
console.log('Modal visible:', document.querySelector('[class*="InstallPrompt"]'));
// Должен быть найден элемент
```

### Проблема: PWA включена в админке, но не работает

**Причины:**
1. Настройки не сохранились
2. localStorage не синхронизирован
3. Другая вкладка/окно

**Решение:**
```javascript
// Проверьте значение после сохранения
localStorage.getItem('pwa-enabled')  // должно быть "true"

// Если нет - сохраните вручную
localStorage.setItem('pwa-enabled', 'true');
location.reload();
```

---

## ✅ Чеклист перед релизом

### Проверки:

- [ ] PWA включена по умолчанию (`pwa-enabled` = null или "true")
- [ ] InstallPrompt появляется через 3 секунды
- [ ] InstallPrompt НЕ появляется если PWA выключена
- [ ] InstallPrompt НЕ появляется если уже показывался
- [ ] InstallPrompt НЕ появляется если приложение установлено
- [ ] Кнопка в настройках работает
- [ ] iOS инструкции показываются
- [ ] Service Worker регистрируется
- [ ] Manifest.json доступен
- [ ] Логи PWA Debug показываются
- [ ] Все toast уведомления работают

### Браузеры:

- [ ] Chrome Desktop (Windows/Mac)
- [ ] Chrome Android
- [ ] Edge Desktop
- [ ] Safari iOS
- [ ] Safari macOS
- [ ] Firefox (Android)

### Платформы:

- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile (414x896)

---

## 📊 Метрики успеха

### Ожидаемые показатели:

- **Показы InstallPrompt:** 100% новых пользователей (кроме iOS)
- **Конверсия в установку:** 15-25%
- **Время до показа:** 3 секунды
- **Повторные показы:** 0% (показываем 1 раз)

### Как измерить:

```javascript
// Счетчик показов
if (showInstallPrompt) {
  console.log('InstallPrompt shown');
  // Отправить в аналитику
}

// Счетчик установок
if (outcome === 'accepted') {
  console.log('PWA installed');
  // Отправить в аналитику
}

// Счетчик отказов
if (outcome === 'dismissed') {
  console.log('PWA dismissed');
  // Отправить в аналитику
}
```

---

## 🎓 Полезные ссылки

- [PWA_TROUBLESHOOTING.md](/PWA_TROUBLESHOOTING.md) - Решение проблем
- [PWA_SETUP.md](/PWA_SETUP.md) - Полная документация
- [ADMIN_PWA_PUSH_FINAL.md](/ADMIN_PWA_PUSH_FINAL.md) - Админ-панель
- [Chrome PWA Documentation](https://web.dev/progressive-web-apps/)
- [iOS PWA Support](https://web.dev/ios-pwa/)

---

**Happy Testing! 🎉**
