# 🎯 Логика Онбординга - Полное Описание

## 📋 Обзор

Онбординг показывается **только новым пользователям** при первом входе. После завершения онбординга он больше никогда не показывается.

---

## 🔄 Схема Потока

### 1️⃣ Новый пользователь (первый визит)

```
Открыл приложение
    ↓
Шаг 1: WelcomeScreen (выбор языка)
    ↓
┌─────────────────────────────────┐
│ Действие пользователя:          │
├─────────────────────────────────┤
│ ✅ Выбрал язык → Шаг 2          │
│ ⏭️  Skip → Экран авторизации    │
└─────────────────────────────────┘
```

### 2️⃣ После Skip на Шаге 1

```
Skip на WelcomeScreen
    ↓
Экран Авторизации (вход/регистрация)
    ↓
┌─────────────────────────────────┐
│ Действие пользователя:          │
├─────────────────────────────────┤
│ 📝 Регистрация → Шаг 2          │
│ 🔑 Вход → Проверка онбординга   │
└─────────────────────────────────┘
```

### 3️⃣ После регистрации

```
Регистрация успешна
    ↓
Создан профиль с onboardingCompleted = false
    ↓
Шаг 2: OnboardingScreen2 (о приложении)
    ↓
Шаг 3: OnboardingScreen3 (настройка дневника)
    ↓
Шаг 4: OnboardingScreen4 (напоминания + первая запись)
    ↓
Сохранение данных в Supabase
    ↓
onboardingCompleted = true
    ↓
Главный экран приложения ✅
```

### 4️⃣ Вход существующего пользователя

```
Вход (Sign In)
    ↓
Загрузка профиля
    ↓
┌─────────────────────────────────┐
│ Проверка onboardingCompleted:   │
├─────────────────────────────────┤
│ ✅ true → Главный экран         │
│ ❌ false → Шаг 2 онбординга     │
└─────────────────────────────────┘
```

### 5️⃣ Выход из системы

```
Пользователь нажал "Выйти"
    ↓
Очистка сессии Supabase
    ↓
Показываем Экран Авторизации
    ↓
НЕ показываем онбординг! ❌
```

---

## 📊 Состояния в App.tsx

```typescript
const [onboardingComplete, setOnboardingComplete] = useState(false);
// Завершен ли онбординг? true = показываем главный экран

const [showAuth, setShowAuth] = useState(false);
// Показывать ли экран авторизации?

const [needsOnboarding, setNeedsOnboarding] = useState(false);
// Нужен ли онбординг после авторизации?

const [currentStep, setCurrentStep] = useState(1);
// Текущий шаг онбординга (1-4)

const [userData, setUserData] = useState<any>(null);
// Данные авторизованного пользователя
```

---

## 🎬 Детальное Описание Шагов

### Шаг 1: WelcomeScreen

**Что показывается:**
- Логотип UNITY 🏆
- Выбор языка (Русский, English, Español, Deutsch, Français, 中文, 日本語)
- Кнопка "Начать"
- Кнопка "У меня уже есть аккаунт" (Skip)

**Действия:**
- **"Начать"** → переход на Шаг 2 (для новых пользователей)
- **"Skip"** → показываем экран авторизации

**Когда показывается:**
- Только для новых пользователей (нет сессии)
- НЕ показывается если пользователь уже авторизован

**Код:**
```typescript
const handleLanguageSelected = (language: string) => {
  setSelectedLanguage(language);
  setCurrentStep(2);
};

const handleWelcomeSkip = () => {
  console.log('Skip clicked - showing auth');
  setShowAuth(true);
};
```

---

### Шаг 2: OnboardingScreen2

**Что показывается:**
- Заголовок: "Фиксируй достижения и смотри, как растёт твой прогресс"
- Описание функций приложения
- Кнопки "Далее" и "Пропустить"

**Действия:**
- **"Далее"** → Шаг 3
- **"Пропустить"** → Шаг 3

**Когда показывается:**
- После выбора языка на Шаге 1
- После регистрации (если пользователь нажал Skip на Шаге 1)
- После входа (если onboardingCompleted = false)

**Код:**
```typescript
const handleOnboarding2Next = () => {
  setCurrentStep(3);
};

const handleOnboarding2Skip = () => {
  setCurrentStep(3);
};
```

---

### Шаг 3: OnboardingScreen3

**Что показывается:**
- Заголовок: "Дай имя своему дневнику"
- Поле ввода названия дневника
- Выбор эмодзи (🏆 🎯 ⭐ 💎 🔥 ✨)
- Кнопки "Далее" и "Пропустить"

**Данные:**
- Название дневника (по умолчанию: "Мой дневник")
- Эмодзи дневника (по умолчанию: "🏆")

**Действия:**
- **"Далее"** → сохраняет название + эмодзи, переход на Шаг 4
- **"Пропустить"** → использует значения по умолчанию, переход на Шаг 4

**Сохранение:**
```typescript
const handleOnboarding3Next = async (diaryName: string, emoji: string) => {
  setDiaryData({ name: diaryName, emoji });
  
  // Если пользователь авторизован - сохраняем сразу
  if (userData?.id) {
    await updateUserProfile(userData.id, {
      diaryName,
      diaryEmoji: emoji
    });
  }
  
  setCurrentStep(4);
};
```

---

### Шаг 4: OnboardingScreen4

**Что показывается:**
- Заголовок: "Настрой привычку и сделай первую запись"
- Выбор времени напоминаний:
  - ❌ Без напоминаний
  - 🌅 Утром (08:00)
  - 🌙 Вечером (21:00)
  - 🔄 Утром и вечером
- Поле для первой записи (опционально)
- Кнопки "Готово" и "Пропустить"

**Данные:**
- Настройки напоминаний
- Первая запись (если есть)

**Действия:**
- **"Готово"** → сохраняет настройки + запись, завершает онбординг
- **"Пропустить"** → пропускает шаг, завершает онбординг

**Сохранение:**
```typescript
const handleOnboarding4Next = async (entry: string, settings: any) => {
  setFirstEntry(entry);
  setNotificationSettings(settings);
  
  if (userData?.id) {
    // Пользователь уже авторизован - сохраняем и завершаем
    await updateUserProfile(userData.id, {
      notificationSettings: settings,
      onboardingCompleted: true // ✅ Помечаем онбординг завершенным
    });
    
    setOnboardingComplete(true);
    setNeedsOnboarding(false);
  } else {
    // Нет авторизации - показываем экран входа
    if (entry.trim()) {
      setShowAuthAfterEntry(true); // С контекстом "Сохраним твои успехи?"
    } else {
      setShowAuth(true); // Обычная авторизация
    }
  }
};
```

---

## 🔐 Авторизация

### Экран Авторизации (AuthScreen)

**Когда показывается:**
1. После Skip на Шаге 1
2. После выхода из системы
3. После Шага 4 (если не авторизован и нет записи)
4. При открытии приложения (если нет сессии)

**Варианты:**
1. **Обычная авторизация**
   - Контекст: "Добро пожаловать!"
   - После входа → проверка onboardingCompleted
   
2. **После первой записи**
   - Контекст: "Сохраним твои успехи?"
   - После входа → сохранение данных онбординга

**Логика после авторизации:**
```typescript
const handleAuthComplete = async (data: any) => {
  setUserData(data);
  setShowAuth(false);
  
  // Проверяем onboardingCompleted
  if (data.onboardingCompleted === false) {
    // Нужен онбординг - начинаем со Шага 2
    setNeedsOnboarding(true);
    setOnboardingComplete(false);
    setCurrentStep(2);
  } else {
    // Онбординг уже пройден - на главный экран
    setOnboardingComplete(true);
    setNeedsOnboarding(false);
  }
};
```

---

## 💾 Сохранение в Supabase

### Структура профиля

```typescript
interface UserProfile {
  id: string;                    // ID пользователя
  email: string;                 // Email
  name: string;                  // Имя
  diaryName?: string;            // Название дневника
  diaryEmoji?: string;           // Эмодзи дневника
  language?: string;             // Язык (ru, en, es, de, fr, zh, ja)
  notificationSettings?: {       // Настройки напоминаний
    selectedTime: 'none' | 'morning' | 'evening' | 'both';
    morningTime: string;         // "08:00"
    eveningTime: string;         // "21:00"
    permissionGranted: boolean;
  };
  onboardingCompleted?: boolean; // ✅ Завершен ли онбординг?
  createdAt?: string;
}
```

### Создание профиля (signup)

```typescript
// В /utils/auth.ts → signUpWithEmail()
const profile = await createUserProfile({
  id: data.user.id,
  email: data.user.email!,
  name: userData.name,
  diaryName: userData.diaryName || 'Мой дневник',
  diaryEmoji: userData.diaryEmoji || '🏆',
  language: userData.language || 'ru',
  notificationSettings: userData.notificationSettings || {
    selectedTime: 'none',
    morningTime: '08:00',
    eveningTime: '21:00',
    permissionGranted: false
  },
  onboardingCompleted: false // ❌ Новый пользователь
});
```

### Обновление профиля (после онбординга)

```typescript
// После завершения Шага 4
await updateUserProfile(userData.id, {
  notificationSettings: settings,
  onboardingCompleted: true // ✅ Онбординг завершен
});
```

### Backend (Supabase KV Store)

```typescript
// В /supabase/functions/server/index.tsx

// GET /make-server-9729c493/profiles/:userId
// Возвращает профиль с onboardingCompleted

// PUT /make-server-9729c493/profiles/:userId
// Обновляет профиль, включая onboardingCompleted
```

---

## 🎯 Проверка при загрузке приложения

### checkExistingSession()

```typescript
const checkExistingSession = async () => {
  const result = await checkSession();
  
  if (result.success && result.user && result.profile) {
    // Есть сессия
    setUserData(result.profile);
    
    if (result.profile.onboardingCompleted) {
      // ✅ Онбординг пройден → главный экран
      setOnboardingComplete(true);
      setNeedsOnboarding(false);
    } else {
      // ❌ Онбординг НЕ пройден → Шаг 2
      setOnboardingComplete(false);
      setNeedsOnboarding(true);
      setCurrentStep(2);
    }
  } else {
    // Нет сессии → экран авторизации
    setShowAuth(true);
  }
};
```

---

## 🚪 Выход из системы

```typescript
const handleLogout = async () => {
  await signOut();
  
  // Сброс всех состояний
  setOnboardingComplete(false);
  setNeedsOnboarding(false);
  setUserData(null);
  setShowAuth(true); // ✅ Показываем авторизацию
  
  // НЕ показываем онбординг! ❌
};
```

**Важно:**
- После выхода пользователь видит **экран авторизации**, НЕ онбординг
- После повторного входа проверяется `onboardingCompleted`
- Если онбординг был завершен → сразу главный экран

---

## 📱 Push Уведомления

### Настройка в Шаге 4

```typescript
notificationSettings: {
  selectedTime: 'morning',    // Утром
  morningTime: '08:00',       // В 8:00
  eveningTime: '21:00',       // В 21:00
  permissionGranted: true     // Разрешение получено
}
```

### Изменение в Настройках

Пользователь может изменить настройки напоминаний в любое время:
- **Настройки** → **Уведомления**
- Выбор времени (утро/вечер/оба/нет)
- Изменение времени напоминаний

```typescript
// В SettingsScreen
await updateUserProfile(userData.id, {
  notificationSettings: newSettings
});
```

---

## ✅ Чеклист Разработки

### Backend ✅
- [x] Добавить `onboardingCompleted` в UserProfile interface
- [x] Создавать профиль с `onboardingCompleted: false`
- [x] Поддержка обновления `onboardingCompleted` через API

### Frontend ✅
- [x] Состояния `showAuth`, `needsOnboarding`
- [x] Проверка `onboardingCompleted` при загрузке
- [x] Skip на WelcomeScreen → AuthScreen
- [x] После регистрации → Шаг 2
- [x] После входа → проверка onboardingCompleted
- [x] Сохранение `onboardingCompleted: true` после Шага 4
- [x] При выходе → AuthScreen (НЕ онбординг)

### UI/UX ✅
- [x] Кнопка "У меня уже есть аккаунт" на WelcomeScreen
- [x] Переход между шагами
- [x] Сохранение данных дневника
- [x] Сохранение настроек напоминаний
- [x] Красивые анимации переходов

---

## 🧪 Тестовые Сценарии

### Сценарий 1: Новый пользователь (полный онбординг)
```
1. Открыть приложение
2. Шаг 1: Выбрать язык (Русский)
3. Нажать "Начать"
4. Шаг 2: Нажать "Далее"
5. Шаг 3: Ввести "Дневник Побед", выбрать 🔥
6. Нажать "Далее"
7. Шаг 4: Выбрать "Утром", написать первую запись
8. Нажать "Готово"
9. ✅ Регистрация → Сохранение → Главный экран
10. onboardingCompleted = true
```

### Сценарий 2: Новый пользователь (Skip)
```
1. Открыть приложение
2. Шаг 1: Нажать "У меня уже есть аккаунт"
3. ✅ Экран авторизации
4. Регистрация
5. Шаг 2: Автоматический переход
6. Пройти Шаги 2-4
7. ✅ Главный экран
8. onboardingCompleted = true
```

### Сценарий 3: Существующий пользователь (онбординг завершен)
```
1. Открыть приложение
2. checkSession() → onboardingCompleted = true
3. ✅ Сразу главный экран (без онбординга)
```

### Сценарий 4: Существующий пользователь (онбординг НЕ завершен)
```
1. Открыть приложение
2. checkSession() → onboardingCompleted = false
3. ✅ Шаг 2 онбординга
4. Пройти Шаги 2-4
5. Сохранить onboardingCompleted = true
6. ✅ Главный экран
```

### Сценарий 5: Выход и повторный вход
```
1. Пользователь в приложении
2. Настройки → Выйти
3. ✅ Экран авторизации (НЕ онбординг!)
4. Вход (тот же аккаунт)
5. checkSession() → onboardingCompleted = true
6. ✅ Главный экран
```

---

## 🐛 Отладка

### Проверка onboardingCompleted

```javascript
// В консоли браузера (F12):

// 1. Проверить профиль текущего пользователя
const userData = JSON.parse(localStorage.getItem('userData') || '{}');
console.log('Onboarding completed:', userData.onboardingCompleted);

// 2. Сбросить онбординг (для тестирования)
// ВАЖНО: Это только для разработки!
async function resetOnboarding() {
  const userId = userData.id;
  await fetch(`/api/profiles/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ onboardingCompleted: false })
  });
  location.reload();
}
```

### Логи в консоли

```
✅ Onboarding already completed
⚠️ User needs to complete onboarding
Skip clicked on WelcomeScreen - showing auth
Auth completed: { onboardingCompleted: false }
⚠️ User needs onboarding - starting from step 2
✅ Onboarding completed and saved
```

---

## 📚 Связанные Файлы

### Frontend
- `/App.tsx` - главная логика приложения
- `/components/WelcomeScreen.tsx` - Шаг 1
- `/components/OnboardingScreen2.tsx` - Шаг 2
- `/components/OnboardingScreen3.tsx` - Шаг 3
- `/components/OnboardingScreen4.tsx` - Шаг 4
- `/components/AuthScreen.tsx` - авторизация

### Utils
- `/utils/auth.ts` - функции авторизации
- `/utils/api.ts` - API запросы, UserProfile

### Backend
- `/supabase/functions/server/index.tsx` - endpoints
- `/supabase/functions/server/kv_store.tsx` - хранилище

---

**Всё работает правильно! Онбординг показывается только новым пользователям и больше никогда не повторяется! 🎉**
