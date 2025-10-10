# 🔧 PWA Troubleshooting - Решение проблем с установкой

## ❓ Проблема: Не показывается InstallPrompt

### Возможные причины:

#### 1. 🔍 **PWA выключена в админ-панели**

**Проверка:**
```javascript
// Откройте консоль браузера (F12)
console.log(localStorage.getItem('pwa-enabled'));
// Должно быть: "true" или null
```

**Решение:**
1. Откройте `https://your-app.com/?view=admin`
2. Войдите как супер-админ (diary@leadshunter.biz)
3. Перейдите: Настройки → PWA
4. Включите переключатель "Активировать PWA приложение"
5. Нажмите "Сохранить настройки PWA"
6. Обновите страницу (F5)

#### 2. 📱 **Браузер не поддерживает `beforeinstallprompt`**

**iOS Safari НЕ поддерживает** событие `beforeinstallprompt`!

**Поддерживаемые браузеры:**
- ✅ Chrome (Android, Desktop)
- ✅ Edge (Desktop)
- ✅ Samsung Internet (Android)
- ✅ Opera (Android, Desktop)
- ❌ Safari (iOS) - использует свой механизм

**Проверка поддержки:**
```javascript
// Откройте консоль
console.log('beforeinstallprompt' in window);
// true = поддерживается
// false = не поддерживается (например, iOS Safari)
```

**Решение для iOS:**
1. Используйте встроенную функцию Safari
2. Нажмите кнопку "Поделиться" внизу экрана
3. Прокрутите вниз
4. Выберите "На экран Домой"
5. Нажмите "Добавить"

**Альтернатива:**
- Перейдите в Настройки приложения
- Нажмите кнопку "Установить приложение"
- Следуйте инструкциям

#### 3. 🚫 **Приложение уже установлено**

**Проверка:**
```javascript
// Откройте консоль
window.matchMedia('(display-mode: standalone)').matches;
// true = приложение установлено
// false = открыто в браузере
```

**Что делать:**
- Если приложение уже установлено, InstallPrompt не показывается
- Используйте установленную версию приложения

#### 4. ⏱️ **Уже показывалось ранее**

**Проверка:**
```javascript
// Откройте консоль
console.log(localStorage.getItem('installPromptShown'));
// "true" = уже показывалось
// null = еще не показывалось
```

**Решение:**
```javascript
// Сбросить флаг
localStorage.removeItem('installPromptShown');
// Обновить страницу
location.reload();
```

#### 5. 🌐 **Проблемы с HTTPS**

PWA требует HTTPS (или localhost).

**Проверка:**
```javascript
// Откройте консоль
console.log(location.protocol);
// Должно быть: "https:" или "http:" (только для localhost)
```

**Решение:**
- Убедитесь что открываете через HTTPS
- На localhost должно работать без HTTPS

#### 6. 📄 **Проблемы с manifest.json**

**Проверка:**
1. Откройте DevTools (F12)
2. Перейдите на вкладку "Application" (или "Приложение")
3. В левом меню выберите "Manifest"
4. Проверьте что manifest загружен без ошибок

**Типичные ошибки:**
- Manifest не найден (404)
- Неправильный MIME type (должен быть `application/json`)
- Ошибки в JSON синтаксисе
- Отсутствуют обязательные поля

**Обязательные поля в manifest.json:**
```json
{
  "name": "Название приложения",
  "short_name": "Короткое",
  "start_url": "/",
  "display": "standalone",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

#### 7. 🔧 **Service Worker не зарегистрирован**

**Проверка:**
```javascript
// Откройте консоль
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs);
});
// Должен быть хотя бы один зарегистрированный SW
```

**Решение:**
1. Проверьте что файл `/service-worker.js` существует
2. Проверьте что SW регистрируется в App.tsx
3. Откройте DevTools → Application → Service Workers
4. Проверьте статус SW (должен быть "activated")

#### 8. 🔄 **Задержка перед показом**

По умолчанию InstallPrompt показывается через **3 секунды** после загрузки.

**Проверка логов:**
```javascript
// Откройте консоль и найдите:
"🎉 Will show install prompt in 3 seconds..."
"📱 Showing InstallPrompt now!"
```

**Решение:**
- Просто подождите 3-5 секунд после загрузки страницы

---

## 🐛 Отладка PWA

### 1. Проверка статуса PWA

Откройте консоль браузера (F12) и посмотрите логи:

```javascript
// Автоматически логируется при загрузке:
🔍 PWA Debug Information
  PWA Support:
    - serviceWorker: true/false
    - pushManager: true/false
    - beforeInstallPrompt: true/false
  
  Installation Status:
    - isPWAInstalled: true/false
    - displayMode: standalone/browser
    - wasPromptShown: true/false
  
  PWA Settings:
    - isPWAEnabled: true/false
    - pwaEnabledValue: "true"/"false"
  
  Browser Info:
    - userAgent: "..."
    - isIOSSafari: true/false
    - platform: iOS Safari / Android Chrome / etc
```

### 2. Ручная проверка

```javascript
// В консоли браузера:

// 1. Проверить PWA включена
localStorage.getItem('pwa-enabled')  // должно быть "true" или null

// 2. Проверить показывалось ли приглашение
localStorage.getItem('installPromptShown')  // должно быть null

// 3. Проверить установлено ли приложение
window.matchMedia('(display-mode: standalone)').matches  // должно быть false

// 4. Проверить Service Worker
navigator.serviceWorker.controller  // должен существовать

// 5. Сбросить все флаги
localStorage.removeItem('installPromptShown');
localStorage.setItem('pwa-enabled', 'true');
location.reload();
```

### 3. Принудительный показ InstallPrompt

Для отладки можно принудительно показать InstallPrompt:

```javascript
// В консоли браузера:
localStorage.removeItem('installPromptShown');
localStorage.setItem('pwa-enabled', 'true');

// Перезагрузить страницу
location.reload();

// InstallPrompt должен показаться через 3 секунды
```

---

## 📱 Инструкции по установке для разных платформ

### iOS Safari (iPhone/iPad)

**PWA устанавливается вручную:**

1. Откройте приложение в Safari
2. Нажмите кнопку **"Поделиться"** (квадрат со стрелкой вверх) внизу экрана
3. Прокрутите вниз и нажмите **"На экран Домой"**
4. Нажмите **"Добавить"**
5. Приложение появится на главном экране

**Альтернатива:**
- Перейдите в Настройки → нажмите "Установить приложение"
- Следуйте инструкциям на экране

### Android Chrome

**Автоматическое приглашение:**
- При первом открытии через 3 секунды появится красивое модальное окно
- Нажмите "Установить приложение"

**Ручная установка:**
1. Откройте меню (три точки) в правом верхнем углу
2. Выберите **"Установить приложение"** или **"Добавить на главный экран"**
3. Подтвердите установку

**Альтернатива:**
- В адресной строке появится иконка установки (⊕)
- Нажмите на неё и подтвердите

### Desktop (Chrome/Edge)

**Автоматическое приглашение:**
- При первом открытии через 3 секунды появится модальное окно
- Нажмите "Установить приложение"

**Ручная установка:**
1. Нажмите иконку **⊕ Установить** в адресной строке
2. Или откройте меню → "Установить Дневник Достижений"
3. Подтвердите установку

### Android Firefox

1. Откройте меню (три точки) в правом верхнем углу
2. Выберите **"Установить"**
3. Подтвердите установку

---

## ✅ Чеклист для успешной установки

### Требования:

- [ ] Приложение открыто через HTTPS (или localhost)
- [ ] manifest.json доступен и корректный
- [ ] Service Worker зарегистрирован
- [ ] PWA включена в админ-панели (`localStorage.getItem('pwa-enabled') !== 'false'`)
- [ ] Приложение еще не установлено
- [ ] InstallPrompt еще не показывался
- [ ] Прошло 3+ секунд после загрузки страницы

### Для iOS Safari:

- [ ] Используется Safari (не Chrome, не Firefox)
- [ ] Инструкции показаны пользователю
- [ ] Доступна кнопка "Поделиться"

### Для Android Chrome:

- [ ] Браузер поддерживает `beforeinstallprompt`
- [ ] Нет блокировки всплывающих окон
- [ ] Достаточно свободного места на устройстве

---

## 🔗 Полезные ссылки

### Документация:
- [PWA_SETUP.md](/PWA_SETUP.md) - Полная документация по PWA
- [PWA_INSTALL_GUIDE.md](/PWA_INSTALL_GUIDE.md) - Инструкции для пользователей
- [ADMIN_PWA_PUSH_FINAL.md](/ADMIN_PWA_PUSH_FINAL.md) - Админ-панель и настройки

### Chrome DevTools:
1. F12 → Application → Manifest
2. F12 → Application → Service Workers
3. F12 → Lighthouse → PWA Audit

### Тестирование PWA:
```bash
# Lighthouse audit
lighthouse https://your-app.com --view

# Chrome DevTools
# Application → Manifest → "Add to homescreen"
```

---

## 💡 FAQ

**Q: Почему InstallPrompt не показывается на iOS?**  
A: iOS Safari не поддерживает событие `beforeinstallprompt`. Используйте ручную установку через кнопку "Поделиться".

**Q: Можно ли протестировать PWA локально?**  
A: Да, PWA работает на `localhost` без HTTPS. Откройте `http://localhost:5173` (или ваш порт).

**Q: Как сбросить все настройки PWA?**  
A: Выполните в консоли:
```javascript
localStorage.clear();
location.reload();
```

**Q: InstallPrompt показался но ничего не происходит при нажатии?**  
A: Проверьте консоль на ошибки. Возможно проблема с `deferredPrompt`. Попробуйте обновить страницу.

**Q: Как протестировать что PWA выключена?**  
A: 
1. Откройте админ-панель
2. Выключите PWA
3. Сохраните
4. Обновите основное приложение
5. InstallPrompt не должен показаться

**Q: Где посмотреть логи PWA?**  
A: Откройте DevTools (F12) → Console. Ищите эмодзи: 🎧 🎉 📱 ✅ ❌

---

**Если проблема не решена, откройте консоль браузера и отправьте логи разработчику!** 🐛
