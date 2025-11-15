# 🎯 ПЛАН РЕАЛИЗАЦИИ SETTINGSSCREEN - UNITY-v2

**Дата создания:** 2025-10-18
**Статус:** ✅ ФАЗА 1 ЗАВЕРШЕНА (100%) - МИГРАЦИЯ БД ПРИМЕНЕНА
**Приоритет:** 🔴 CRITICAL (Bug #10, #11, #12)
**Текущий прогресс:** Фаза 1: 100% ✅ | Фаза 2: 0% ⏳ | Фаза 3: 0% | Фаза 4: 0%

---

## 📊 EXECUTIVE SUMMARY

**Проблема:** SettingsScreen имеет критические проблемы - UI элементы отображаются, но функциональность НЕ реализована (30% работает, 70% НЕ работает).

**Решение:** Полная реализация функциональности всех разделов настроек с сохранением в БД, модальными окнами, темами и премиум-функциями.

**Результат:** SettingsScreen работает на 100%, все критические баги (#10, #11, #12) исправлены, приложение готово к production.

---

## 🎯 АНАЛИЗ ТЕКУЩЕГО СОСТОЯНИЯ

### ✅ Что УЖЕ работает:
1. ✅ UI элементы отображаются корректно
2. ✅ Переключатели визуально работают (меняют состояние)
3. ✅ Модальное окно выбора языка работает
4. ✅ Кнопка "Выйти" работает
5. ✅ PWA установка частично работает (показывает toast с инструкциями)

### ❌ Что НЕ работает (КРИТИЧЕСКИЕ БАГИ):

**Bug #10 (CRITICAL):** Изменения уведомлений НЕ сохраняются в БД
- Переключатели обновляют только локальное состояние React
- Нет useEffect для сохранения в profiles.notification_settings
- После перезагрузки страницы изменения теряются

**Bug #11 (CRITICAL):** Выбор темы НЕ работает
- Темы отображаются как `<div>` с `cursor-pointer`
- НЕТ onClick обработчиков
- Тема приложения НЕ меняется

**Bug #12 (HIGH):** Кнопки поддержки НЕ работают
- "Связаться с поддержкой" - нет onClick
- "Оценить приложение" - нет onClick
- "FAQ" - нет onClick

### 📋 Дополнительные проблемы:
- Биометрическая защита - переключатель есть, но функциональность НЕ реализована
- Автоматическое резервирование - переключатель есть, но функциональность НЕ реализована
- Аналитика использования - должна быть удалена из пользовательских настроек
- "Импорт данных" - кнопка есть, но функциональность НЕ реализована
- "Первый день недели" - кнопка есть, но функциональность НЕ реализована
- "Удалить все данные" - кнопка есть, но нет подтверждения

---

## 🗂️ СТРУКТУРА БД (ТЕКУЩАЯ)

### Таблица `profiles`:
```sql
- id: uuid (PK)
- name: text
- email: text
- language: text (default: 'ru')
- diary_name: text (default: 'Мой дневник')
- diary_emoji: text (default: '📝')
- notification_settings: jsonb (default: '{}')
- onboarding_completed: boolean (default: false)
- created_at: timestamp
- updated_at: timestamp
- role: text (default: 'user')
- telegram_id: text
- telegram_username: text
- telegram_avatar: text
```

### Структура `notification_settings` (ТЕКУЩАЯ):
```json
{
  "selectedTime": "none" | "morning" | "evening" | "both",
  "morningTime": "08:00",
  "eveningTime": "21:00",
  "permissionGranted": false
}
```

### 🔧 НЕОБХОДИМЫЕ ИЗМЕНЕНИЯ БД:

**Новые поля для `profiles`:**
```sql
- theme: text (default: 'default') -- 'default', 'dark', 'light', 'sunset', 'ocean', 'forest'
- is_premium: boolean (default: false)
- biometric_enabled: boolean (default: false)
- backup_enabled: boolean (default: false)
- first_day_of_week: text (default: 'monday') -- 'monday' | 'sunday'
- privacy_settings: jsonb (default: '{}')
```

**Новая структура `notification_settings`:**
```json
{
  "dailyReminder": boolean,
  "weeklyReport": boolean,
  "achievements": boolean,
  "motivational": boolean,
  "selectedTime": "none" | "morning" | "evening" | "both",
  "morningTime": "08:00",
  "eveningTime": "21:00",
  "permissionGranted": false
}
```

**Новая структура `privacy_settings`:**
```json
{
  "biometric": boolean,
  "autoBackup": boolean
}
```

---

## 📋 ПЛАН РЕАЛИЗАЦИИ (4 ФАЗЫ)

### 🔍 ФАЗА 1: Анализ и планирование (2-3 часа)

**Статус:** ✅ ЗАВЕРШЕНА (100%)

**Задачи:**
- [x] 1.1 Проверить схему БД profiles через Supabase MCP
- [x] 1.2 Изучить OnboardingScreen4 notification settings UI/UX
- [x] 1.3 Найти shadcn компоненты для модальных окон (Dialog, Accordion, Form)
- [x] 1.4 Проверить текущую реализацию тем в проекте
- [x] 1.5 Создать миграцию БД для новых полей
- [x] 1.6 Создать файл миграции supabase/migrations/20251018_add_settings_fields.sql

**Результаты:**
- ✅ **Миграция БД создана:** `supabase/migrations/20251018_add_settings_fields.sql`
- ✅ **shadcn компоненты найдены:** Dialog, Accordion, Form, Rating уже установлены
- ✅ **Архитектура тем изучена:** CSS variables в globals.css, useUniversalTheme hook
- ✅ **Структура БД определена:** 6 новых полей + обновление notification_settings

**Следующий шаг:** Применить миграцию вручную через Supabase Dashboard или CLI

---

### 🔨 ФАЗА 2: Реализация критических функций (8-10 часов)

**Статус:** ⏳ NOT STARTED

**2.1 Сохранение уведомлений в БД (Bug #10) - 2 часа**

**Файл:** `src/features/mobile/settings/components/SettingsScreen.tsx`

**Изменения:**
```typescript
// Добавить useEffect для автосохранения
useEffect(() => {
  const saveNotifications = async () => {
    if (!userData?.id) return;
    
    try {
      await updateUserProfile(userData.id, {
        notification_settings: {
          ...userData.notificationSettings,
          dailyReminder: notifications.dailyReminder,
          weeklyReport: notifications.weeklyReport,
          achievements: notifications.achievements,
          motivational: notifications.motivational
        }
      });
      
      toast.success("Настройки уведомлений сохранены");
    } catch (error) {
      console.error('Error saving notifications:', error);
      toast.error("Ошибка сохранения настроек");
    }
  };
  
  // Debounce для оптимизации
  const timeoutId = setTimeout(saveNotifications, 1000);
  return () => clearTimeout(timeoutId);
}, [notifications, userData?.id]);
```

**Тестирование:**
- Переключить все 4 переключателя
- Проверить через Supabase MCP что данные сохранились
- Перезагрузить страницу - проверить что настройки восстановились

---

**2.2 Переключение тем (Bug #11) - 3 часа**

**Файлы:**
- `src/features/mobile/settings/components/SettingsScreen.tsx`
- `src/shared/lib/theme.ts` (новый файл)
- `src/App.tsx` (добавить ThemeProvider)

**Изменения:**

1. Создать `src/shared/lib/theme.ts`:
```typescript
export const themes = {
  default: {
    name: "По умолчанию",
    premium: false,
    colors: {
      primary: "#756ef3",
      background: "#ffffff",
      text: "#000000"
    }
  },
  dark: {
    name: "Тёмная",
    premium: false,
    colors: {
      primary: "#756ef3",
      background: "#1a1a1a",
      text: "#ffffff"
    }
  },
  sunset: {
    name: "Закат",
    premium: true,
    colors: {
      primary: "#ff6b6b",
      background: "#fff5f5",
      text: "#2d2d2d"
    }
  }
};

export const applyTheme = (themeName: string) => {
  const theme = themes[themeName];
  if (!theme) return;
  
  document.documentElement.style.setProperty('--color-primary', theme.colors.primary);
  document.documentElement.style.setProperty('--color-background', theme.colors.background);
  document.documentElement.style.setProperty('--color-text', theme.colors.text);
};
```

2. Добавить onClick обработчики в SettingsScreen:
```typescript
const [selectedTheme, setSelectedTheme] = useState(userData?.theme || 'default');
const [showPremiumModal, setShowPremiumModal] = useState(false);

const handleThemeChange = async (themeId: string) => {
  const theme = themes.find(t => t.id === themeId);
  
  // Проверка премиум-статуса
  if (theme?.premium && !userData?.isPremium) {
    setShowPremiumModal(true);
    return;
  }
  
  setSelectedTheme(themeId);
  applyTheme(themeId);
  
  try {
    await updateUserProfile(userData.id, { theme: themeId });
    toast.success("Тема изменена");
  } catch (error) {
    toast.error("Ошибка изменения темы");
  }
};
```

**Тестирование:**
- Переключить светлую/темную тему
- Проверить что цвета приложения изменились
- Кликнуть на премиум-тему без премиум-статуса - проверить модальное окно
- Проверить через Supabase MCP сохранение в БД

---

**2.3 Биометрическая защита - 2 часа**

**Изменения:**
```typescript
const [biometricAvailable, setBiometricAvailable] = useState(false);

useEffect(() => {
  // Проверка поддержки WebAuthn
  const checkBiometric = async () => {
    if (window.PublicKeyCredential) {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setBiometricAvailable(available);
    }
  };
  checkBiometric();
}, []);

const handleBiometricToggle = async (checked: boolean) => {
  if (!biometricAvailable) {
    toast.info("Биометрическая защита доступна только в нативном приложении");
    return;
  }
  
  // TODO: Реализовать WebAuthn регистрацию
  setPrivacy(prev => ({...prev, biometric: checked}));
  await updateUserProfile(userData.id, { biometric_enabled: checked });
};
```

---

**2.4 Авторезервное копирование (премиум) - 3 часа**

**Новый Edge Function:** `supabase/functions/export-data/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(/* ... */);
  const { userId, format } = await req.json();
  
  // Получить все данные пользователя
  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId);
  
  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId);
  
  // Форматировать в JSON/CSV/ZIP
  const exportData = { entries, achievements };
  
  return new Response(JSON.stringify(exportData), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

**Кнопка в SettingsScreen:**
```typescript
const handleExportData = async (format: 'json' | 'csv' | 'zip') => {
  if (!userData?.isPremium) {
    toast.info("Экспорт данных доступен только в премиум-версии");
    return;
  }
  
  try {
    const response = await fetch('/functions/v1/export-data', {
      method: 'POST',
      body: JSON.stringify({ userId: userData.id, format })
    });
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unity-backup-${Date.now()}.${format}`;
    a.click();
    
    toast.success("Данные экспортированы");
  } catch (error) {
    toast.error("Ошибка экспорта данных");
  }
};
```

---

**2.5 Удалить аналитику из пользовательских настроек - 30 минут**

**Изменения:**
- Удалить UI элемент "Аналитика использования" из SettingsScreen (lines 339-348)
- Убедиться что аналитика собирается автоматически для админа в админ-панели

---

### 🎨 ФАЗА 3: Реализация дополнительных функций (6-8 часов)

**Статус:** ⏳ NOT STARTED

**3.1 Модальное окно PWA установки - 1.5 часа**

**Новый компонент:** `src/features/mobile/settings/components/PWAInstallModal.tsx`

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";

export function PWAInstallModal({ open, onClose }) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Установить приложение</DialogTitle>
        </DialogHeader>
        
        {isIOS && (
          <div>
            <p>1. Нажмите кнопку "Поделиться" (квадрат со стрелкой вверх)</p>
            <p>2. Выберите "На экран Домой"</p>
            <p>3. Нажмите "Добавить"</p>
          </div>
        )}
        
        {isAndroid && (
          <div>
            <p>1. Нажмите меню (три точки)</p>
            <p>2. Выберите "Установить приложение"</p>
            <p>3. Нажмите "Установить"</p>
          </div>
        )}
        
        {!isIOS && !isAndroid && (
          <div>
            <p>1. Нажмите иконку установки в адресной строке</p>
            <p>2. Нажмите "Установить"</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

**3.2-3.4 Модальные окна поддержки - 3 часа**

**Компоненты:**
- `ContactSupportModal.tsx` - форма обратной связи
- `RateAppModal.tsx` - 5-звездочный рейтинг
- `FAQModal.tsx` - аккордеон с вопросами

**Использовать shadcn компоненты:**
- Dialog для модальных окон
- Form для формы обратной связи
- Accordion для FAQ
- Rating component (создать кастомный)

---

**3.5 Модальное окно премиум-темы - 1 час**

```typescript
<Dialog open={showPremiumModal} onOpenChange={setShowPremiumModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Премиум тема</DialogTitle>
    </DialogHeader>
    <p>Эта тема доступна только в премиум-версии</p>
    <Button onClick={() => {/* TODO: Navigate to premium page */}}>
      Получить премиум
    </Button>
  </DialogContent>
</Dialog>
```

---

### ✅ ФАЗА 4: Тестирование и отчет (3-4 часа)

**Статус:** ⏳ NOT STARTED

**4.1-4.5 Функциональное тестирование - 2.5 часа**
- Протестировать сохранение уведомлений через Supabase MCP
- Протестировать переключение тем
- Протестировать премиум-темы (модальное окно)
- Протестировать все модальные окна поддержки
- Протестировать экспорт данных

**4.6 Создать финальный отчет - 1 час**
- Обновить `COMPREHENSIVE_TESTING_REPORT_2025-10-18.md`
- Изменить статус SettingsScreen с 30% на 100%
- Добавить скриншоты всех модальных окон
- Документировать все исправленные баги

---

## 📊 ОЖИДАЕМЫЕ РЕЗУЛЬТАТЫ

### ✅ После завершения всех фаз:

1. ✅ **Bug #10 FIXED:** Уведомления сохраняются в БД
2. ✅ **Bug #11 FIXED:** Темы переключаются корректно
3. ✅ **Bug #12 FIXED:** Все кнопки поддержки работают
4. ✅ **SettingsScreen:** 100% функциональность
5. ✅ **Production Ready:** Приложение готово к деплою

### 📈 Метрики:
- **Функциональность:** 30% → 100%
- **Критические баги:** 3 → 0
- **Модальные окна:** 1 → 6
- **Сохранение в БД:** 0% → 100%

---

## 🚀 СЛЕДУЮЩИЕ ШАГИ

1. **Начать с Фазы 1:** Завершить анализ и создать миграцию БД
2. **Перейти к Фазе 2:** Реализовать критические функции (Bug #10, #11)
3. **Фаза 3:** Добавить модальные окна поддержки
4. **Фаза 4:** Протестировать и создать отчет

**Общее время:** 19-25 часов (2-3 дня разработки)

---

**Документ создан:** 2025-10-18  
**Автор:** Augment Agent  
**Статус:** 📋 READY TO START

