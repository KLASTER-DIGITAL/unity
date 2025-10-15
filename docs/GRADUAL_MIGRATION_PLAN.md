# 🔄 План постепенной миграции UNITY-v2

**Дата создания**: 2025-10-15  
**Версия**: 1.0  
**Статус**: Ready for execution  
**Предыдущая попытка**: См. `docs/ROLLBACK_REPORT.md`

---

## 📋 Краткое описание

После неудачной попытки полной реструктуризации (см. ROLLBACK_REPORT.md), был разработан новый подход - **постепенная миграция по одной фиче за раз** с сохранением работоспособности приложения на каждом шаге.

---

## 🎯 Принципы новой миграции

### 1. Параллельная работа
- ✅ Старая структура остается рабочей
- ✅ Новая структура создается параллельно
- ✅ Переключение через feature flags
- ✅ Удаление старого кода только после полной проверки

### 2. Пошаговое тестирование
- ✅ Тесты пишутся ДО миграции
- ✅ Каждый шаг проверяется отдельно
- ✅ Git commit после каждого успешного шага
- ✅ Возможность отката на любом этапе

### 3. Минимальный риск
- ✅ Одна фича за раз
- ✅ Изолированные изменения
- ✅ Автоматические проверки
- ✅ Ручное тестирование критических путей

---

## 📊 Фазы миграции

### Фаза 1: Подготовка инфраструктуры (1 день)

#### 1.1 Создать структуру папок (без перемещения файлов)
```bash
mkdir -p src/shared/components/{layout,modals,pwa,ui}
mkdir -p src/shared/lib/{api,auth,i18n,pwa,media,stats}
mkdir -p src/shared/hooks
mkdir -p src/shared/types
mkdir -p src/features/mobile/{home,history,achievements,reports,settings,auth,media}
mkdir -p src/features/admin/{dashboard,users,subscriptions,settings,auth}
mkdir -p src/app/{mobile,admin}
```

#### 1.2 Настроить path aliases (tsconfig.json, vite.config.ts)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/features/*": ["./src/features/*"],
      "@/app/*": ["./src/app/*"],
      "@/components/*": ["./src/components/*"],  // Старые пути остаются!
      "@/utils/*": ["./src/utils/*"]              // Старые пути остаются!
    }
  }
}
```

#### 1.3 Создать index.ts файлы с re-exports
```typescript
// src/shared/lib/auth/index.ts
export * from '../../utils/auth';  // Re-export из старого места

// src/shared/lib/api/index.ts
export * from '../../utils/api';   // Re-export из старого места
```

**Проверка**:
- [ ] Проект собирается без ошибок
- [ ] Все импорты работают
- [ ] Dev сервер запускается

---

### Фаза 2: Миграция PWA компонентов (1 день)

**Почему PWA первым?**
- ✅ Изолированные компоненты
- ✅ Минимум зависимостей
- ✅ Легко тестировать
- ✅ Не критично для основного функционала

#### 2.1 Скопировать PWA компоненты
```bash
cp src/components/PWAHead.tsx src/shared/components/pwa/
cp src/components/PWASplash.tsx src/shared/components/pwa/
cp src/components/PWAStatus.tsx src/shared/components/pwa/
cp src/components/PWAUpdatePrompt.tsx src/shared/components/pwa/
cp src/components/InstallPrompt.tsx src/shared/components/pwa/
```

#### 2.2 Создать index.ts
```typescript
// src/shared/components/pwa/index.ts
export { PWAHead } from './PWAHead';
export { PWASplash } from './PWASplash';
export { PWAStatus } from './PWAStatus';
export { PWAUpdatePrompt } from './PWAUpdatePrompt';
export { InstallPrompt } from './InstallPrompt';
```

#### 2.3 Обновить импорты в PWA компонентах
```typescript
// Было:
import { Button } from "../ui/button";

// Стало:
import { Button } from "@/components/ui/button";  // Используем старый путь!
```

#### 2.4 Создать feature flag в App.tsx
```typescript
const USE_NEW_PWA = process.env.VITE_USE_NEW_PWA === 'true';

// Импорты
import { PWAHead as OldPWAHead } from "./components/PWAHead";
import { PWAHead as NewPWAHead } from "@/shared/components/pwa";

// Использование
const PWAHead = USE_NEW_PWA ? NewPWAHead : OldPWAHead;
```

#### 2.5 Тестирование
```bash
# Тест со старыми компонентами
npm run dev

# Тест с новыми компонентами
VITE_USE_NEW_PWA=true npm run dev
```

**Проверка**:
- [ ] PWA компоненты работают со старыми импортами
- [ ] PWA компоненты работают с новыми импортами
- [ ] Нет визуальных отличий
- [ ] Нет ошибок в консоли

**Git commit**: `feat: migrate PWA components to shared/components/pwa`

---

### Фаза 3: Миграция i18n системы (2 дня)

**Почему i18n вторым?**
- ✅ Самодостаточная система
- ✅ Используется везде, но изолирована
- ✅ Хорошо протестирована

#### 3.1 Скопировать i18n компоненты
```bash
cp -r src/components/i18n/* src/shared/lib/i18n/
cp -r src/utils/i18n/* src/shared/lib/i18n/
```

#### 3.2 Объединить дубликаты
- Проверить что все .ts файлы скопированы
- Объединить TranslationProvider из components и utils
- Создать единый index.ts

#### 3.3 Обновить импорты внутри i18n
```typescript
// Было:
import { cache } from './cache';

// Стало:
import { cache } from './cache';  // Относительный путь внутри shared/lib/i18n
```

#### 3.4 Feature flag в App.tsx
```typescript
const USE_NEW_I18N = process.env.VITE_USE_NEW_I18N === 'true';

import { TranslationProvider as OldProvider } from "./components/i18n";
import { TranslationProvider as NewProvider } from "@/shared/lib/i18n";

const TranslationProvider = USE_NEW_I18N ? NewProvider : OldProvider;
```

**Проверка**:
- [ ] Переводы загружаются
- [ ] Смена языка работает
- [ ] Fallback работает
- [ ] Кэширование работает

**Git commit**: `feat: migrate i18n system to shared/lib/i18n`

---

### Фаза 4: Миграция UI компонентов (1 день)

#### 4.1 Скопировать shadcn/ui компоненты
```bash
cp -r src/components/ui/* src/shared/components/ui/
```

#### 4.2 Создать index.ts с re-exports
```typescript
// src/shared/components/ui/index.ts
export * from './button';
export * from './card';
export * from './dialog';
// ... все компоненты
```

#### 4.3 Feature flag
```typescript
const USE_NEW_UI = process.env.VITE_USE_NEW_UI === 'true';
```

**Проверка**:
- [ ] Все UI компоненты работают
- [ ] Стили применяются корректно
- [ ] Нет визуальных отличий

**Git commit**: `feat: migrate UI components to shared/components/ui`

---

### Фаза 5: Миграция одной мобильной фичи (2 дня)

**Начнем с Settings - самая простая фича**

#### 5.1 Создать структуру
```bash
mkdir -p src/features/mobile/settings/{components,hooks,api,types}
```

#### 5.2 Скопировать компоненты
```bash
cp src/components/screens/SettingsScreen.tsx src/features/mobile/settings/components/
```

#### 5.3 Обновить импорты
```typescript
// Было:
import { Button } from "../../ui/button";

// Стало:
import { Button } from "@/shared/components/ui/button";
```

#### 5.4 Создать index.ts
```typescript
// src/features/mobile/settings/index.ts
export { SettingsScreen } from './components/SettingsScreen';
```

#### 5.5 Feature flag в App.tsx
```typescript
const USE_NEW_SETTINGS = process.env.VITE_USE_NEW_SETTINGS === 'true';

import { SettingsScreen as OldSettings } from "./components/screens/SettingsScreen";
import { SettingsScreen as NewSettings } from "@/features/mobile/settings";

const SettingsScreen = USE_NEW_SETTINGS ? NewSettings : OldSettings;
```

**Проверка**:
- [ ] Settings экран открывается
- [ ] Все функции работают
- [ ] Logout работает
- [ ] Смена языка работает

**Git commit**: `feat: migrate Settings feature to features/mobile/settings`

---

### Фаза 6-10: Миграция остальных мобильных фич (по 1-2 дня каждая)

Повторить процесс для:
1. **Reports** (простая, только отображение)
2. **Achievements** (средняя сложность)
3. **History** (средняя сложность)
4. **Home** (сложная, много зависимостей)
5. **Auth** (сложная, критичная)
6. **Media** (сложная, работа с файлами)

---

### Фаза 11-15: Миграция админ фич (по 1-2 дня каждая)

1. **Admin Auth** (простая)
2. **Admin Settings** (простая)
3. **Admin Subscriptions** (средняя)
4. **Admin Users** (средняя)
5. **Admin Dashboard** (сложная)

---

### Фаза 16: Финальное переключение (1 день)

#### 16.1 Включить все feature flags по умолчанию
```typescript
// Удалить все feature flags, использовать только новые компоненты
import { PWAHead } from "@/shared/components/pwa";
import { TranslationProvider } from "@/shared/lib/i18n";
import { SettingsScreen } from "@/features/mobile/settings";
// ... и т.д.
```

#### 16.2 Удалить старые файлы
```bash
# Только после полной проверки!
rm -rf src/components/PWA*.tsx
rm -rf src/components/i18n/
rm -rf src/components/screens/SettingsScreen.tsx
# ... и т.д.
```

#### 16.3 Очистить path aliases
```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/shared/*": ["./src/shared/*"],
    "@/features/*": ["./src/features/*"],
    "@/app/*": ["./src/app/*"]
    // Удалить @/components и @/utils
  }
}
```

**Git commit**: `feat: complete migration to new architecture`

---

## ✅ Чеклист для каждой фазы

### Перед началом
- [ ] Создать git branch для фазы
- [ ] Написать тесты для текущей функциональности
- [ ] Зафиксировать baseline метрики

### Во время миграции
- [ ] Скопировать файлы (не перемещать!)
- [ ] Обновить импорты на @/ aliases
- [ ] Создать index.ts с exports
- [ ] Добавить feature flag
- [ ] Протестировать со старым кодом
- [ ] Протестировать с новым кодом

### После миграции
- [ ] Все тесты проходят
- [ ] Нет TypeScript ошибок
- [ ] Нет console errors
- [ ] Визуально идентично
- [ ] Git commit с описанием
- [ ] Merge в main

---

## 🚀 Преимущества нового подхода

1. **Безопасность**: Старый код работает всегда
2. **Гибкость**: Можно откатить любую фичу
3. **Тестируемость**: Легко сравнить старое и новое
4. **Постепенность**: Не нужно мигрировать всё сразу
5. **Обучение**: Команда привыкает к новой структуре постепенно

---

## 📊 Ожидаемые результаты

- **Время**: 20-25 рабочих дней (вместо 15)
- **Риск**: Минимальный (vs Высокий в оригинальном плане)
- **Качество**: Высокое (тестирование на каждом шаге)
- **Откаты**: Легкие (feature flags)
- **Обучение**: Постепенное

---

## 📚 Связанные документы

- `docs/ROLLBACK_REPORT.md` - Отчет о предыдущей попытке
- `docs/MASTER_PLAN.md` - Оригинальный план (для справки)
- `docs/BASELINE_METRICS.md` - Базовые метрики

---

**Автор**: Augment Agent  
**Дата**: 2025-10-15  
**Версия**: 1.0

