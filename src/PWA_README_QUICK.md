# 🚀 PWA Quick Start - Быстрый старт

## ✅ Все работает из коробки!

При открытии приложения:
1. ⏱️ Подождите **3 секунды**
2. 📱 Увидите красивое модальное окно
3. 🎉 Нажмите "Установить приложение"
4. ✅ Готово!

---

## 📱 Как установить на телефоне?

### iPhone (iOS Safari)

1. Откройте приложение в Safari
2. Нажмите **"Поделиться"** (внизу экрана)
3. Прокрутите вниз → **"На экран Домой"**
4. Нажмите **"Добавить"**

### Android (Chrome)

1. Дождитесь модального окна (3 секунды)
2. Нажмите **"Установить приложение"**

Или:
1. Меню (⋮) → **"Установить приложение"**

---

## ⚙️ Управление через админ-панель

### Включить/Выключить PWA:

1. Откройте `?view=admin`
2. Войдите как супер-админ
3. **Настройки → PWA**
4. Переключатель **"Активировать PWA"**
5. Сохраните

**Включено** = InstallPrompt показывается  
**Выключено** = InstallPrompt скрыт

---

## 🔍 Отладка (если не работает)

### Откройте консоль (F12):

```javascript
// Проверить статус
localStorage.getItem('pwa-enabled')  // должно быть "true" или null

// Сбросить и протестировать
localStorage.removeItem('installPromptShown');
location.reload();
```

### Проверьте логи:

Вы должны увидеть:
```
✅ PWA initialized as enabled
🎧 Starting to listen for beforeinstallprompt...
🎉 Will show install prompt in 3 seconds...
📱 Showing InstallPrompt now!
```

---

## ❓ Почему не показывается?

**8 частых причин:**

1. ❌ **PWA выключена в админке** → Включите в настройках
2. ❌ **iOS Safari** → Используйте ручную установку
3. ❌ **Уже установлено** → Откройте установленное приложение
4. ❌ **Уже показывалось** → Сбросьте: `localStorage.removeItem('installPromptShown')`
5. ❌ **Не HTTPS** → Откройте через https:// или localhost
6. ❌ **Manifest ошибка** → DevTools → Application → Manifest
7. ❌ **Service Worker не работает** → DevTools → Application → Service Workers
8. ⏱️ **Слишком быстро** → Подождите 3 секунды

---

## 📚 Документация

- **[PWA_TROUBLESHOOTING.md](./PWA_TROUBLESHOOTING.md)** - Подробное решение проблем
- **[PWA_TESTING_GUIDE.md](./PWA_TESTING_GUIDE.md)** - Тест-кейсы и проверки
- **[ADMIN_PWA_PUSH_FINAL.md](./ADMIN_PWA_PUSH_FINAL.md)** - Админ-панель
- **[PWA_SETUP.md](./PWA_SETUP.md)** - Полная техническая документация

---

## 🎯 Ключевые возможности

✅ **Автоматический показ** через 3 секунды  
✅ **Управление из админки** (включить/выключить)  
✅ **iOS инструкции** для ручной установки  
✅ **Кнопка в настройках** для повторной установки  
✅ **Детальное логирование** для отладки  
✅ **Работает оффлайн** после установки  
✅ **Push-уведомления** (настраиваются в админке)  

---

## ⚡ Быстрые команды

```javascript
// Сброс для тестирования
localStorage.clear(); location.reload();

// Принудительный показ
localStorage.removeItem('installPromptShown'); location.reload();

// Проверка статуса
console.log({
  enabled: localStorage.getItem('pwa-enabled'),
  shown: localStorage.getItem('installPromptShown'),
  installed: window.matchMedia('(display-mode: standalone)').matches
});
```

---

**Все работает! Если есть проблемы - откройте [PWA_TROUBLESHOOTING.md](./PWA_TROUBLESHOOTING.md) 🔧**
