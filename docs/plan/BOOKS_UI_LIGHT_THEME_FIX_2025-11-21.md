# 🔧 Исправление проблемы с видимостью текста в светлой теме

**Дата**: 2025-11-21  
**Время**: 20:25 UTC  
**Статус**: ✅ ИСПРАВЛЕНО

---

## 🐛 Проблема

В светлой теме UI текст на кнопках и некоторых элементах был невидим из-за использования `text-white` на светлом фоне `bg-card/20`.

**Причина**:
- Кнопки использовали класс `text-white` на фоне `bg-card/20`
- В светлой теме `bg-card/20` - это почти белый фон с прозрачностью
- Белый текст на белом фоне = невидимый текст ❌

---

## ✅ Исправления

### 1. Замена `text-white` на `text-foreground`

**Файлы**:
- `src/features/mobile/reports/components/ReportsScreen.tsx`
- `src/features/mobile/reports/components/ReportsArchiveScreen.tsx`

**Изменения**:
- Строка 794: Кнопки периода (`text-white` → `text-foreground`)
- Строка 813: Кнопка "Обновить AI-обзор" (`text-white` → `text-foreground`)
- Строка 825: Кнопка "Скачать PDF" (`text-white` → `text-foreground`)
- Строка 835: Кнопка "Экспорт PDF" (`text-white` → `text-foreground`)
- Строка 850: Кнопка "Открыть отчёты" (`text-white` → `text-foreground`)
- `ReportsArchiveScreen.tsx` строка 167: Кнопка назад (`text-white` → `text-foreground`)

### 2. Улучшение контрастности `text-muted-foreground`

**Файлы**:
- `src/features/mobile/reports/components/ReportsScreen.tsx`
- `src/features/mobile/reports/components/BooksLibraryScreen.tsx`

**Изменения**:
- Убрана `opacity-90` из `text-muted-foreground` для улучшения контрастности
- Строка 781: Подзаголовок "Анализ твоих достижений"
- `BooksLibraryScreen.tsx` строка 341: Подзаголовок "Твои персональные истории"

---

## 📋 Проверка

**Проверено**:
- ✅ Все использования `text-white` на светлом фоне заменены на `text-foreground`
- ✅ Улучшена контрастность `text-muted-foreground`
- ✅ Линтер не нашел ошибок в измененных файлах

**Оставшиеся использования `text-white`** (корректные):
- На фиолетовом фоне (`bg-[--ios-purple]`) - ✅ правильно
- На красном фоне (`bg-red-500`) - ✅ правильно
- На темном фоне - ✅ правильно

---

## 🎯 Результат

Теперь в светлой теме:
- ✅ Все кнопки с `bg-card/20` имеют видимый текст (`text-foreground`)
- ✅ Улучшена контрастность вторичного текста
- ✅ Текст адаптируется к теме автоматически через CSS переменные

**Готовность**: ✅ Исправлено и готово к тестированию




