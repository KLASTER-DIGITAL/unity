# Настройка локальных шрифтов для рендера книг

## Проблема

Google Fonts может быть медленным или недоступным в некоторых регионах, что приводит к проблемам с отображением текста в PDF. Локальные шрифты из Supabase Storage решают эту проблему.

## Шаг 1: Скачать шрифты WOFF2

Необходимо скачать шрифты Noto для всех 9 языков:

### Базовые шрифты (для ru, en, es, de, fr, kk, ka):
- **Noto Sans**: `NotoSans-Regular.woff2`, `NotoSans-Medium.woff2`, `NotoSans-SemiBold.woff2`, `NotoSans-Bold.woff2`
- **Noto Serif**: `NotoSerif-Regular.woff2`, `NotoSerif-SemiBold.woff2`

### Китайский (zh-CN):
- **Noto Sans SC**: `NotoSansSC-Regular.woff2`, `NotoSansSC-Medium.woff2`, `NotoSansSC-SemiBold.woff2`, `NotoSansSC-Bold.woff2`
- **Noto Serif SC**: `NotoSerifSC-Regular.woff2`, `NotoSerifSC-SemiBold.woff2`

### Японский (ja):
- **Noto Sans JP**: `NotoSansJP-Regular.woff2`, `NotoSansJP-Medium.woff2`, `NotoSansJP-SemiBold.woff2`, `NotoSansJP-Bold.woff2`
- **Noto Serif JP**: `NotoSerifJP-Regular.woff2`, `NotoSerifJP-SemiBold.woff2`

### Источники:
1. **Google Fonts API**: https://fonts.google.com/noto
2. **GitHub Noto Fonts**: https://github.com/google/fonts/tree/main/ofl/notosans
3. **CDN для прямого скачивания**: https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700

## Шаг 2: Загрузить в Supabase Storage

### 2.1. Создать bucket (если не существует)

В Supabase Dashboard:
1. Перейти в **Storage** → **Buckets**
2. Создать bucket `assets` (если не существует)
3. Настроить права: **Public** (для чтения шрифтов)

### 2.2. Создать структуру папок

```
assets/
└── fonts/
    ├── noto-sans/
    │   ├── NotoSans-Regular.woff2
    │   ├── NotoSans-Medium.woff2
    │   ├── NotoSans-SemiBold.woff2
    │   └── NotoSans-Bold.woff2
    ├── noto-serif/
    │   ├── NotoSerif-Regular.woff2
    │   └── NotoSerif-SemiBold.woff2
    ├── noto-sans-sc/
    │   ├── NotoSansSC-Regular.woff2
    │   ├── NotoSansSC-Medium.woff2
    │   ├── NotoSansSC-SemiBold.woff2
    │   └── NotoSansSC-Bold.woff2
    ├── noto-serif-sc/
    │   ├── NotoSerifSC-Regular.woff2
    │   └── NotoSerifSC-SemiBold.woff2
    ├── noto-sans-jp/
    │   ├── NotoSansJP-Regular.woff2
    │   ├── NotoSansJP-Medium.woff2
    │   ├── NotoSansJP-SemiBold.woff2
    │   └── NotoSansJP-Bold.woff2
    └── noto-serif-jp/
        ├── NotoSerifJP-Regular.woff2
        └── NotoSerifJP-SemiBold.woff2
```

### 2.3. Загрузить файлы

**Способ 1: Через Supabase Dashboard**
1. Перейти в **Storage** → **Buckets** → `assets`
2. Создать папку `fonts/noto-sans/`
3. Загрузить файлы через UI

**Способ 2: Через Supabase CLI**
```bash
# Установить Supabase CLI (если не установлен)
npm install -g supabase

# Войти в аккаунт
supabase login

# Загрузить файлы
supabase storage upload assets/fonts/noto-sans/NotoSans-Regular.woff2 fonts/noto-sans/NotoSans-Regular.woff2 --bucket assets
```

**Способ 3: Через API (программно)**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Читаем файл
const file = await Deno.readFile('./fonts/NotoSans-Regular.woff2');

// Загружаем в Storage
await supabase.storage
  .from('assets')
  .upload('fonts/noto-sans/NotoSans-Regular.woff2', file, {
    contentType: 'font/woff2',
    upsert: true,
  });
```

## Шаг 3: Обновить Edge Function

После загрузки шрифтов нужно обновить `books-render-puppeteer/index.ts`:

### 3.1. Получить публичные URL шрифтов

```typescript
// Получить публичный URL из Storage
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const fontBaseUrl = `${supabaseUrl}/storage/v1/object/public/assets/fonts`;
```

### 3.2. Заменить Google Fonts на локальные

В функции `generateBookHTML` заменить:

```typescript
// ❌ БЫЛО:
@import url('https://fonts.googleapis.com/css2?${fonts}&display=swap');

// ✅ СТАНЕТ:
@font-face {
  font-family: 'Noto Sans';
  src: url('${fontBaseUrl}/noto-sans/NotoSans-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Noto Sans';
  src: url('${fontBaseUrl}/noto-sans/NotoSans-Medium.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Noto Sans';
  src: url('${fontBaseUrl}/noto-sans/NotoSans-SemiBold.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Noto Sans';
  src: url('${fontBaseUrl}/noto-sans/NotoSans-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
// ... аналогично для Noto Serif, Noto Sans SC, Noto Serif SC, Noto Sans JP, Noto Serif JP
```

### 3.3. Функция для генерации @font-face по языку

```typescript
function getFontFacesForLanguage(language: string, fontBaseUrl: string): string {
  const fontMap: Record<string, { sans: string; serif: string }> = {
    ru: { sans: 'noto-sans', serif: 'noto-serif' },
    en: { sans: 'noto-sans', serif: 'noto-serif' },
    es: { sans: 'noto-sans', serif: 'noto-serif' },
    de: { sans: 'noto-sans', serif: 'noto-serif' },
    fr: { sans: 'noto-sans', serif: 'noto-serif' },
    kk: { sans: 'noto-sans', serif: 'noto-serif' },
    ka: { sans: 'noto-sans', serif: 'noto-serif' },
    'zh-CN': { sans: 'noto-sans-sc', serif: 'noto-serif-sc' },
    ja: { sans: 'noto-sans-jp', serif: 'noto-serif-jp' },
  };

  const fonts = fontMap[language] || fontMap.ru;
  
  return `
    @font-face {
      font-family: 'Noto Sans';
      src: url('${fontBaseUrl}/${fonts.sans}/NotoSans-Regular.woff2') format('woff2');
      font-weight: 400;
      font-display: swap;
    }
    @font-face {
      font-family: 'Noto Sans';
      src: url('${fontBaseUrl}/${fonts.sans}/NotoSans-Medium.woff2') format('woff2');
      font-weight: 500;
      font-display: swap;
    }
    @font-face {
      font-family: 'Noto Sans';
      src: url('${fontBaseUrl}/${fonts.sans}/NotoSans-SemiBold.woff2') format('woff2');
      font-weight: 600;
      font-display: swap;
    }
    @font-face {
      font-family: 'Noto Sans';
      src: url('${fontBaseUrl}/${fonts.sans}/NotoSans-Bold.woff2') format('woff2');
      font-weight: 700;
      font-display: swap;
    }
    @font-face {
      font-family: 'Noto Serif';
      src: url('${fontBaseUrl}/${fonts.serif}/NotoSerif-Regular.woff2') format('woff2');
      font-weight: 400;
      font-display: swap;
    }
    @font-face {
      font-family: 'Noto Serif';
      src: url('${fontBaseUrl}/${fonts.serif}/NotoSerif-SemiBold.woff2') format('woff2');
      font-weight: 600;
      font-display: swap;
    }
  `;
}
```

## Шаг 4: Проверка

После обновления Edge Function:

1. **Задеплоить функцию**:
   ```bash
   npx supabase functions deploy books-render-puppeteer --project-ref ecuwuzqlwdkkdncampnc
   ```

2. **Протестировать рендер**:
   - Создать тестовую книгу
   - Нажать "Просмотр" или "Скачать"
   - Проверить что шрифты загружаются из Storage (Network tab в DevTools)
   - Проверить что текст отображается корректно для всех языков

3. **Проверить логи**:
   - Supabase Dashboard → Functions → books-render-puppeteer → Logs
   - Убедиться что нет ошибок загрузки шрифтов

## Альтернатива: Использовать CDN

Если загрузка в Storage сложна, можно использовать CDN:

```typescript
const fontBaseUrl = 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/notosans';
// или
const fontBaseUrl = 'https://fonts.gstatic.com/s/notosans/v36';
```

Но локальные шрифты из Storage предпочтительнее для:
- ✅ Стабильности (не зависит от внешних сервисов)
- ✅ Скорости (ближе к серверу)
- ✅ Контроля версий

## Примечания

- **Размер файлов**: WOFF2 файлы занимают ~100-300KB каждый, общий размер ~2-3MB для всех языков
- **Кэширование**: Supabase Storage автоматически кэширует файлы через CDN
- **Права доступа**: Bucket `assets` должен быть **Public** для чтения шрифтов
- **Обновление**: При обновлении шрифтов нужно перезагрузить файлы в Storage и перезадеплоить Edge Function

