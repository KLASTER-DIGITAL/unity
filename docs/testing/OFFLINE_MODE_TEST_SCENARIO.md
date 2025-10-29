# Offline Mode - Тестовый сценарий

**Дата**: 2025-10-28  
**Версия**: 1.0  
**Цель**: Проверка всех функций Offline Mode для Premium пользователей

---

## 🎯 Предварительные требования

### Тестовые аккаунты
1. **Premium пользователь**: rustam@leadshunter.biz (demo123)
2. **Free пользователь**: an@leadshunter.biz (demo123)

### Окружение
- ✅ PWA: https://unity-wine.vercel.app
- ✅ React Native: Expo Go на Android/iOS

---

## 📋 Тест-кейсы

### TC-1: Premium Access Control

**Цель**: Проверить что Offline Mode доступен только для Premium

**Шаги**:
1. Войти как Free пользователь (an@leadshunter.biz)
2. Перейти в Settings → Offline режим
3. Попытаться включить toggle "Включить offline режим"

**Ожидаемый результат**:
- ❌ Toggle disabled (серый)
- ✅ Показывается PremiumModal
- ✅ Toast: "Offline режим доступен только для Premium подписчиков"

---

### TC-2: Enable Offline Mode (Premium)

**Цель**: Включить Offline Mode для Premium пользователя

**Шаги**:
1. Войти как Premium пользователь (rustam@leadshunter.biz)
2. Перейти в Settings → Offline режим
3. Включить toggle "Включить offline режим"
4. Проверить что настройка сохранилась в БД

**Ожидаемый результат**:
- ✅ Toggle включается (зеленый)
- ✅ Появляется кнопка "Настройки offline"
- ✅ В БД profiles.offline_enabled = true
- ✅ Description: "Работает в фоновом режиме"

---

### TC-3: Network Status Indicator

**Цель**: Проверить динамический индикатор статуса в аватаре

**Шаги**:
1. Войти как Premium с включенным Offline Mode
2. Проверить индикатор в аватаре (правый верхний угол)
3. Отключить интернет (DevTools → Network → Offline)
4. Проверить индикатор снова
5. Включить интернет обратно

**Ожидаемый результат**:
- ✅ Online: 🟢 зеленый индикатор
- ✅ Offline: 🔴 красный индикатор
- ✅ Syncing: 🟡 желтый индикатор с пульсацией
- ✅ Белая обводка для видимости

---

### TC-4: Save Entry Offline

**Цель**: Сохранить запись в offline режиме

**Шаги**:
1. Войти как Premium с включенным Offline Mode
2. Отключить интернет (DevTools → Network → Offline)
3. Написать текст: "Тестовая запись offline"
4. Нажать кнопку отправки
5. Проверить IndexedDB (DevTools → Application → IndexedDB → unity-diary-offline)

**Ожидаемый результат**:
- ✅ Toast: "Сохранено offline" с иконкой 📴
- ✅ Description: "Запись будет синхронизирована когда появится интернет"
- ✅ В IndexedDB pending_entries появилась запись
- ✅ syncStatus = "pending"

---

### TC-5: Offline Mode Badge

**Цель**: Проверить badge "Offline Mode" с pending count

**Шаги**:
1. Войти как Premium с включенным Offline Mode
2. Отключить интернет
3. Создать 3 записи offline
4. Проверить badge в верхней части экрана

**Ожидаемый результат**:
- ✅ Badge появляется: "📴 Offline Mode (3)"
- ✅ Компактный дизайн (серый фон, белый текст)
- ✅ Pill с числом pending записей
- ✅ Fixed position top center

---

### TC-6: Auto Sync When Online

**Цель**: Проверить автоматическую синхронизацию при появлении интернета

**Шаги**:
1. Войти как Premium с включенным Offline Mode
2. Отключить интернет
3. Создать 2 записи offline
4. Включить интернет обратно
5. Дождаться синхронизации (до 30 сек)

**Ожидаемый результат**:
- ✅ Индикатор меняется: 🔴 → 🟡 (syncing) → 🟢 (online)
- ✅ Показывается SyncCompletionModal: "✅ Синхронизация завершена"
- ✅ Modal автозакрывается через 2 секунды
- ✅ Записи появляются в Supabase БД
- ✅ IndexedDB pending_entries очищается

---

### TC-7: Offline Settings Modal

**Цель**: Проверить настройки offline режима

**Шаги**:
1. Войти как Premium с включенным Offline Mode
2. Перейти в Settings → Offline режим
3. Нажать "Настройки offline"
4. Проверить доступные опции

**Ожидаемый результат**:
- ✅ Modal открывается
- ✅ Опции:
  - Auto-sync toggle
  - Conflict resolution strategy (server-wins, client-wins, merge, manual)
  - Manual sync button
  - Clear offline data button
- ✅ Pending syncs indicator
- ✅ Настройки сохраняются в localStorage

---

### TC-8: Manual Sync

**Цель**: Проверить ручную синхронизацию

**Шаги**:
1. Войти как Premium с включенным Offline Mode
2. Отключить интернет
3. Создать 1 запись offline
4. Включить интернет
5. Открыть Offline Settings Modal
6. Нажать "Синхронизировать сейчас"

**Ожидаемый результат**:
- ✅ Кнопка показывает "Синхронизация..."
- ✅ Индикатор: 🟡 (syncing)
- ✅ Toast: "Синхронизация завершена"
- ✅ Pending count обновляется
- ✅ Записи появляются в БД

---

### TC-9: Clear Offline Data

**Цель**: Очистить все offline данные

**Шаги**:
1. Войти как Premium с включенным Offline Mode
2. Отключить интернет
3. Создать 2 записи offline
4. Открыть Offline Settings Modal
5. Нажать "Очистить offline данные"
6. Подтвердить действие

**Ожидаемый результат**:
- ✅ Confirmation dialog
- ✅ IndexedDB pending_entries очищается
- ✅ Toast: "Offline данные очищены"
- ✅ Pending count = 0
- ✅ Badge исчезает

---

### TC-10: Non-Premium User Attempt

**Цель**: Проверить что non-premium пользователь не может использовать offline

**Шаги**:
1. Войти как Free пользователь (an@leadshunter.biz)
2. Отключить интернет
3. Попытаться создать запись

**Ожидаемый результат**:
- ✅ Показывается PremiumModal
- ✅ Toast error: "Offline режим доступен только для Premium"
- ✅ Запись НЕ сохраняется в IndexedDB
- ✅ Action button в toast: "Узнать больше"

---

## 🧪 React Native Testing (Expo Go)

### Подготовка
```bash
# Запустить Expo dev server
npm run android

# Сканировать QR код в Expo Go
```

### Тест-кейсы для RN

**TC-RN-1: SQLite Initialization**
- ✅ Проверить что SQLite БД создается
- ✅ Проверить что таблицы создаются (pending_entries, cached_entries)
- ✅ Проверить индексы

**TC-RN-2: Save Entry Offline (SQLite)**
- ✅ Отключить WiFi на телефоне
- ✅ Создать запись
- ✅ Проверить что запись сохранилась в SQLite (через логи)

**TC-RN-3: NetInfo Integration**
- ✅ Проверить что NetInfo определяет статус сети
- ✅ Отключить WiFi → индикатор 🔴
- ✅ Включить WiFi → индикатор 🟢

**TC-RN-4: File System Media**
- ✅ Создать запись с фото offline
- ✅ Проверить что фото сохранилось в File System
- ✅ Проверить что фото синхронизировалось при появлении интернета

---

## 📊 Критерии успеха

### Must Have (100% готовность)
- ✅ Premium-only access control
- ✅ Save entries offline (IndexedDB для PWA, SQLite для RN)
- ✅ Auto-sync when online
- ✅ Network status indicator (🟢🟡🔴)
- ✅ Offline Mode Badge
- ✅ Sync Completion Modal

### Nice to Have (опционально)
- ⚠️ Conflict resolution UI
- ⚠️ Media files offline (фото, видео)
- ⚠️ Voice notes offline

---

## 🐛 Known Issues

1. **Browser MCP занят**: Не удалось протестировать через Chrome MCP (браузер занят другим процессом)
2. **Tailwind v4 warnings**: 60+ warnings о старом синтаксисе (не критично, работает)

---

## 📝 Чеклист перед релизом

- [ ] Все TC-1 до TC-10 пройдены успешно
- [ ] React Native тесты пройдены (TC-RN-1 до TC-RN-4)
- [ ] Supabase Advisors проверены (security + performance)
- [ ] Production build протестирован (`npm run build` → `npm run preview`)
- [ ] Консоль браузера без ошибок
- [ ] Vercel deployment успешен
- [ ] Документация обновлена (CHANGELOG.md + FIX.md)

---

## 🎉 Готово к тестированию!

Используй этот сценарий для полной проверки Offline Mode перед релизом.

