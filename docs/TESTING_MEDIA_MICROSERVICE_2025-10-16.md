# 🧪 TESTING MEDIA MICROSERVICE - ИНСТРУКЦИЯ

**Date**: 2025-10-16  
**Status**: Ready for testing  
**URL**: http://localhost:3001/

---

## 🎯 ЦЕЛЬ ТЕСТИРОВАНИЯ

Проверить что media микросервис работает в production и фронтенд использует его вместо legacy API.

---

## 📋 ЧТО ТЕСТИРУЕМ

1. ✅ Загрузка изображения через media микросервис
2. ✅ Фоллбэк на legacy API при ошибке
3. ✅ Console logs показывают использование микросервиса
4. ✅ Uploaded media отображается корректно

---

## 🚀 ИНСТРУКЦИЯ ПО ТЕСТИРОВАНИЮ

### **Шаг 1: Открыть приложение**

1. Открыть браузер: http://localhost:3001/
2. Открыть DevTools (F12 или Cmd+Option+I)
3. Перейти на вкладку **Console**

---

### **Шаг 2: Авторизоваться**

1. Если не авторизованы - войти в аккаунт
2. Или зарегистрироваться (пройти onboarding)

---

### **Шаг 3: Найти кнопку загрузки медиа**

**Где находится**:
- На главном экране (AchievementHomeScreen)
- В секции ввода текста (ChatInputSection)
- Кнопка "Добавить фото" с иконкой камеры

**Как найти**:
1. Прокрутить вниз до секции ввода
2. Если нет сообщений - кнопка "Добавить фото" видна сразу
3. Если есть сообщения - нажать на иконку камеры в input bar

---

### **Шаг 4: Загрузить изображение**

1. Нажать кнопку "Добавить фото" или иконку камеры
2. Выбрать изображение (JPG, PNG, WEBP)
3. Подождать загрузки

---

### **Шаг 5: Проверить Console Logs**

**Ожидаемые логи при успешной загрузке через микросервис**:

```
[API] Uploading media: photo.jpg image/jpeg
Compressing image: photo.jpg
Uploading: photo.jpg
[API] 🎯 Attempting media microservice (10s timeout)...
[API] ✅ Microservice success: ca079aae-d83e-495e-95a4-93e4928160e7/1760638852584_photo.jpg
```

**Ожидаемые логи при фоллбэке на legacy API**:

```
[API] Uploading media: photo.jpg image/jpeg
Compressing image: photo.jpg
Uploading: photo.jpg
[API] 🎯 Attempting media microservice (10s timeout)...
[API] ⚠️ Microservice failed: timeout
[API] 🔄 Falling back to legacy monolithic API...
[API] ✅ Legacy API success: ca079aae-d83e-495e-95a4-93e4928160e7/1760638852584_photo.jpg
```

---

### **Шаг 6: Проверить результат**

**Что должно произойти**:

1. ✅ Toast notification: "Медиа загружено!"
2. ✅ Изображение отображается в preview grid
3. ✅ Можно удалить изображение (кнопка X)
4. ✅ Можно открыть lightbox (клик на изображение)

---

## 🔍 ЧТО ПРОВЕРЯТЬ В CONSOLE

### **1. Успешная загрузка через микросервис**

**Ключевые индикаторы**:
- ✅ `[API] 🎯 Attempting media microservice (10s timeout)...`
- ✅ `[API] ✅ Microservice success: ...`
- ❌ НЕТ `[API] ⚠️ Microservice failed`
- ❌ НЕТ `[API] 🔄 Falling back to legacy`

**Это значит**: Микросервис работает! 🎉

---

### **2. Фоллбэк на legacy API**

**Ключевые индикаторы**:
- ✅ `[API] 🎯 Attempting media microservice (10s timeout)...`
- ✅ `[API] ⚠️ Microservice failed: ...`
- ✅ `[API] 🔄 Falling back to legacy monolithic API...`
- ✅ `[API] ✅ Legacy API success: ...`

**Это значит**: Микросервис не работает, но фоллбэк спас ситуацию! ⚠️

---

### **3. Полный провал (оба API не работают)**

**Ключевые индикаторы**:
- ✅ `[API] 🎯 Attempting media microservice (10s timeout)...`
- ✅ `[API] ⚠️ Microservice failed: ...`
- ✅ `[API] 🔄 Falling back to legacy monolithic API...`
- ✅ `[API] ❌ Both microservice and legacy API failed!`
- ❌ Toast error: "Ошибка загрузки медиа"

**Это значит**: Оба API не работают! ❌

---

## 📊 ТЕСТОВЫЕ СЦЕНАРИИ

### **Сценарий 1: Загрузка одного изображения**

1. Нажать "Добавить фото"
2. Выбрать 1 изображение (< 10MB)
3. Проверить console logs
4. Проверить что изображение отображается

**Ожидаемый результат**: ✅ Успешная загрузка через микросервис

---

### **Сценарий 2: Загрузка нескольких изображений**

1. Нажать "Добавить фото"
2. Выбрать 3-5 изображений (< 10MB каждое)
3. Проверить console logs
4. Проверить что все изображения отображаются

**Ожидаемый результат**: ✅ Все изображения загружены через микросервис

---

### **Сценарий 3: Загрузка большого файла**

1. Нажать "Добавить фото"
2. Выбрать изображение > 10MB
3. Проверить console logs

**Ожидаемый результат**: ❌ Ошибка "Файл слишком большой (макс 10MB)"

---

### **Сценарий 4: Загрузка неподдерживаемого формата**

1. Нажать "Добавить фото"
2. Выбрать файл .txt или .pdf
3. Проверить console logs

**Ожидаемый результат**: ❌ Ошибка "Неподдерживаемый формат файла"

---

## 🎯 КРИТЕРИИ УСПЕХА

### **✅ Тест пройден если**:

1. ✅ Console показывает `[API] 🎯 Attempting media microservice`
2. ✅ Console показывает `[API] ✅ Microservice success`
3. ✅ Изображение загружается и отображается
4. ✅ Toast notification показывается
5. ✅ Можно удалить изображение
6. ✅ Можно открыть lightbox

### **⚠️ Тест пройден с предупреждением если**:

1. ✅ Console показывает `[API] ⚠️ Microservice failed`
2. ✅ Console показывает `[API] 🔄 Falling back to legacy`
3. ✅ Console показывает `[API] ✅ Legacy API success`
4. ✅ Изображение загружается и отображается

**Действие**: Проверить почему микросервис не работает

### **❌ Тест провален если**:

1. ❌ Console показывает `[API] ❌ Both microservice and legacy API failed!`
2. ❌ Изображение не загружается
3. ❌ Toast error показывается

**Действие**: Проверить оба API (микросервис и legacy)

---

## 🔧 TROUBLESHOOTING

### **Проблема 1: Микросервис не работает (фоллбэк на legacy)**

**Симптомы**:
```
[API] ⚠️ Microservice failed: timeout
[API] 🔄 Falling back to legacy monolithic API...
```

**Решение**:
1. Проверить что микросервис задеплоен:
   ```bash
   curl -H "Authorization: Bearer TOKEN" \
     https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/media/health
   ```
2. Проверить Edge Function logs в Supabase Dashboard
3. Проверить CORS headers (OPTIONS должен возвращать 204)

---

### **Проблема 2: Оба API не работают**

**Симптомы**:
```
[API] ❌ Both microservice and legacy API failed!
```

**Решение**:
1. Проверить что dev server запущен
2. Проверить что пользователь авторизован
3. Проверить network tab в DevTools
4. Проверить Supabase project status

---

### **Проблема 3: Изображение не отображается**

**Симптомы**:
- Загрузка успешна, но изображение не видно

**Решение**:
1. Проверить signed URL в response
2. Проверить что Supabase Storage bucket существует
3. Проверить permissions на bucket

---

## 📝 ОТЧЕТ О ТЕСТИРОВАНИИ

После тестирования заполните:

**Дата**: ___________  
**Тестировщик**: ___________

**Результаты**:

- [ ] Сценарий 1: Загрузка одного изображения - ✅ / ⚠️ / ❌
- [ ] Сценарий 2: Загрузка нескольких изображений - ✅ / ⚠️ / ❌
- [ ] Сценарий 3: Загрузка большого файла - ✅ / ⚠️ / ❌
- [ ] Сценарий 4: Загрузка неподдерживаемого формата - ✅ / ⚠️ / ❌

**Console Logs** (скопировать сюда):
```
...
```

**Скриншоты** (если есть проблемы):
- ...

**Выводы**:
- ...

---

**Готово к тестированию!** 🚀

