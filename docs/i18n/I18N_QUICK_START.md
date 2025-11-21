# i18n Quick Start Guide

**Для новых разработчиков** - быстрый старт работы с системой переводов UNITY-v2

---

## 🚀 Быстрый старт

### 1. Базовое использование

```typescript
import { useTranslation } from '@/shared/lib/i18n';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('welcome.title', 'Welcome to UNITY')}</h1>
      <p>{t('welcome.description', 'Track your achievements')}</p>
    </div>
  );
}
```

### 2. Смена языка

```typescript
function LanguageSwitcher() {
  const { t, changeLanguage, currentLanguage } = useTranslation();
  
  return (
    <select 
      value={currentLanguage} 
      onChange={(e) => changeLanguage(e.target.value)}
    >
      <option value="ru">Русский</option>
      <option value="en">English</option>
      <option value="kk">Қазақша</option>
      {/* ... другие языки */}
    </select>
  );
}
```

### 3. Форматирование дат

```typescript
function EntryCard({ entry }) {
  const { t } = useTranslation();
  
  return (
    <div>
      <p>{t.formatRelativeTime(entry.created_at)}</p>
      {/* → "5 минут назад" (ru) / "5 minutes ago" (en) */}
    </div>
  );
}
```

---

## 📚 Основные концепции

### TranslationProvider

Оберните ваше приложение в `TranslationProvider`:

```typescript
import { TranslationProvider } from '@/shared/lib/i18n';

function App() {
  return (
    <TranslationProvider>
      <YourApp />
    </TranslationProvider>
  );
}
```

### useTranslation Hook

Основной хук для работы с переводами:

```typescript
const {
  t,                    // Функция перевода
  changeLanguage,       // Смена языка
  currentLanguage,      // Текущий язык
  isLoading,            // Состояние загрузки
  isLoaded,             // Загружены ли переводы
  error,                // Ошибка загрузки
} = useTranslation();
```

### Перевод ключа

**ВАЖНО**: Всегда предоставляйте fallback текст!

```typescript
// ✅ ПРАВИЛЬНО
t('welcome.title', 'Welcome')

// ❌ НЕПРАВИЛЬНО
t('welcome.title')  // Нет fallback
```

---

## 🌍 Поддерживаемые языки

| Код | Язык | Флаг |
|-----|------|------|
| `ru` | Русский | 🇷🇺 |
| `en` | English | 🇬🇧 |
| `es` | Español | 🇪🇸 |
| `de` | Deutsch | 🇩🇪 |
| `fr` | Français | 🇫🇷 |
| `zh` | 中文 | 🇨🇳 |
| `ja` | 日本語 | 🇯🇵 |
| `kk` | Қазақша | 🇰🇿 |
| `ka` | ქართული | 🇬🇪 |

---

## 🔧 Добавление нового перевода

### Шаг 1: Добавить ключ в БД

Через админ-панель или SQL:

```sql
INSERT INTO translations (translation_key, lang_code, value)
VALUES ('my.new.key', 'ru', 'Мой новый текст');
```

### Шаг 2: Использовать в коде

```typescript
const { t } = useTranslation();
<p>{t('my.new.key', 'Мой новый текст')}</p>
```

### Шаг 3: Автоперевод для других языков

Через админ-панель:
1. Настройки → Переводы → Языки
2. Выбрать язык → Автоперевод
3. Источник: `ru`, Цель: нужный язык

---

## ⚠️ Частые ошибки

### Ошибка 1: Нет fallback текста

```typescript
// ❌ НЕПРАВИЛЬНО
t('key.without.fallback')

// ✅ ПРАВИЛЬНО
t('key.with.fallback', 'Fallback text')
```

### Ошибка 2: Hardcoded тексты

```typescript
// ❌ НЕПРАВИЛЬНО
<h1>Добро пожаловать</h1>

// ✅ ПРАВИЛЬНО
const { t } = useTranslation();
<h1>{t('welcome.title', 'Добро пожаловать')}</h1>
```

### Ошибка 3: Использование в админ-панели

```typescript
// ❌ НЕПРАВИЛЬНО (в админ-панели)
const { t } = useTranslation();

// ✅ ПРАВИЛЬНО (в админ-панели)
// Админ-панель ВСЕГДА на русском, используйте hardcoded тексты
<h1>Панель управления</h1>
```

---

## 📖 Дополнительная документация

- **[Полная документация](./I18N_SYSTEM_DOCUMENTATION.md)** - Архитектура и детали
- **[API Reference](./I18N_API_REFERENCE.md)** - Полный API референс
- **[Текущий статус](./I18N_CURRENT_STATUS.md)** - Статус системы
- **[Тестирование казахского](./KAZAKH_LANGUAGE_TESTING_GUIDE.md)** - Руководство по тестированию

---

## 🆘 Поддержка

Если возникли проблемы:

1. Проверьте консоль браузера на ошибки
2. Убедитесь что ключ существует в БД
3. Проверьте что fallback текст предоставлен
4. Обратитесь к [Troubleshooting](./I18N_SYSTEM_DOCUMENTATION.md#troubleshooting)

---

**Последнее обновление**: 2025-11-21

