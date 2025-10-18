# 📋 РУЧНОЕ ТЕСТИРОВАНИЕ - Media Upload Microservice

**Date**: 2025-10-16  
**Status**: 🔴 ТРЕБУЕТСЯ РУЧНОЕ ТЕСТИРОВАНИЕ  
**Приоритет**: КРИТИЧНО  
**URL**: http://localhost:3001/ (УЖЕ ОТКРЫТО В БРАУЗЕРЕ)

---

## 🎯 ЦЕЛЬ

Протестировать media микросервис в браузере и убедиться что он работает вместо legacy API.

---

## ✅ ЧТО УЖЕ СДЕЛАНО

1. ✅ Media микросервис v1-pure-deno создан (339 строк)
2. ✅ Задеплоен через Supabase MCP
3. ✅ Протестирован с curl - health check работает (200 OK)
4. ✅ Фронтенд API обновлен с hybrid approach
5. ✅ **Приложение открыто в браузере: http://localhost:3001/**
6. ✅ **Motivations микросервис работает в production!** 🎉

---

## 🧪 БЫСТРАЯ ИНСТРУКЦИЯ (2 МИНУТЫ)

### **1. Откройте DevTools** ⌨️
Нажмите `F12` или `Cmd+Option+I` (Mac)

### **2. Перейдите на вкладку Console** 📊
Кликните "Console" в DevTools

### **3. Авторизуйтесь** 🔐
- Email: `test8@leadshunter.biz`
- Password: `admin123`

(Если уже авторизованы - пропустите)

### **4. Нажмите "Добавить фото"** 📸
Кнопка внизу главного экрана

### **5. Выберите изображение** 🖼️
Любое изображение < 10 MB

### **6. ПРОВЕРЬТЕ CONSOLE LOGS** 🔍
**ЭТО САМОЕ ВАЖНОЕ!**

---

## 📊 ЧТО ИСКАТЬ В CONSOLE

### **✅ УСПЕХ (Микросервис работает)**
```javascript
[API] Uploading media: photo.jpg image/jpeg
[API] 🎯 Attempting media microservice (10s timeout)...
[API] ✅ Microservice success: ca079aae.../1760638852584_photo.jpg
```

**Результат**: 🎉 **ТЕСТ ПРОЙДЕН!**

---

### **⚠️ ФОЛЛБЭК (Legacy API используется)**
```javascript
[API] Uploading media: photo.jpg image/jpeg
[API] 🎯 Attempting media microservice (10s timeout)...
[API] ⚠️ Microservice failed: [причина]
[API] 🔄 Falling back to legacy monolithic API...
[API] ✅ Legacy API success: ca079aae.../1760638852584_photo.jpg
```

**Результат**: ⚠️ Работает, но нужно исправить микросервис

---

### **❌ ОШИБКА (Ничего не работает)**
```javascript
[API] Uploading media: photo.jpg image/jpeg
[API] 🎯 Attempting media microservice (10s timeout)...
[API] ❌ Both microservice and legacy API failed!
```

**Результат**: ❌ Критическая ошибка

---

## 📝 ОТЧЕТ О ТЕСТИРОВАНИИ

**После тестирования, пожалуйста, сообщите**:

1. **Какой сценарий произошел?**
   - [ ] ✅ Успех (микросервис работает)
   - [ ] ⚠️ Фоллбэк (legacy API)
   - [ ] ❌ Ошибка

2. **Console Logs** (скопируйте все логи начиная с `[API] Uploading media:`)

3. **Изображение отображается?** Да / Нет

4. **Toast notification появился?** Да / Нет

---

## 🎉 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ

**Если всё работает правильно**:

1. ✅ Console покажет `[API] ✅ Microservice success: ...`
2. ✅ Изображение отобразится в preview grid
3. ✅ Toast "Медиа загружено!" появится
4. ✅ НЕТ ошибок в Console

**Это значит что media микросервис работает в production!** 🎉

---

## 📚 ДОПОЛНИТЕЛЬНАЯ ДОКУМЕНТАЦИЯ

- `docs/TESTING_MEDIA_MICROSERVICE_2025-10-16.md` - Детальная инструкция
- `docs/MEDIA_MICROSERVICE_COMPLETE_2025-10-16.md` - Технические детали
- `docs/BROWSER_TESTING_REPORT_2025-10-16.md` - Автоматизированное тестирование

---

## 🚀 НАЧНИТЕ ПРЯМО СЕЙЧАС!

**Приложение уже открыто в браузере!**

1. Переключитесь на окно браузера
2. Откройте DevTools (F12)
3. Следуйте инструкции выше
4. Сообщите результаты

**Время**: ~2 минуты

---

**Удачи!** 🚀

