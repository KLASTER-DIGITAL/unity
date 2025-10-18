# 🔧 План исправления Onboarding Flow

**Дата**: 2025-10-15  
**Статус**: 🔴 КРИТИЧЕСКИЕ БАГИ - ТРЕБУЕТСЯ ИСПРАВЛЕНИЕ  
**Приоритет**: P0 (БЛОКИРУЕТ ВЕСЬ ФУНКЦИОНАЛ)

---

## 📋 Проблемы (найдено при тестировании)

### 1. 🔴 WelcomeScreen - отсутствует кнопка "У меня уже есть аккаунт"

**Проблема**: Пользователь не может перейти на экран авторизации с WelcomeScreen

**Ожидаемое поведение** (из документации):
- Кнопка "Начать" → OnboardingScreen2
- Кнопка "У меня уже есть аккаунт" → AuthScreen (сразу на авторизацию)

**Текущее поведение**:
- ✅ Кнопка "Начать" работает
- ❌ Кнопка "У меня уже есть аккаунт" ОТСУТСТВУЕТ (была удалена при исправлении)

**Файлы**:
- `src/components/WelcomeScreen.tsx:393-410` - код был удален

---

### 2. 🔴 OnboardingScreen2/3/4 - неправильные интерфейсы

**Проблема**: Кнопки Skip и навигации не работают

**Ожидаемые props** (из старого кода):
```typescript
interface OnboardingScreen2Props {
  selectedLanguage: string;
  onNext: () => void;
  onSkip: () => void;
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
}
```

**Передаваемые props** (текущий код):
```typescript
<OnboardingScreen2 
  onComplete={onOnboarding2Complete} 
  selectedLanguage={selectedLanguage} 
/>
```

**Отсутствует**:
- ❌ Прогресс-бар (Sliedbar) над кнопкой Skip
- ❌ Кнопка Skip (пропустить)
- ❌ Кнопка Next (вперед)
- ❌ Навигация по шагам (currentStep, totalSteps)

---

### 3. 🔴 Логика сохранения данных из онбординга

**Проблема**: Данные из OnboardingScreen3/4 не сохраняются и не передаются при регистрации

**Ожидаемая логика** (из документации):

**OnboardingScreen3** (название дневника):
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

**OnboardingScreen4** (напоминания + первая запись):
```typescript
const handleOnboarding4Next = async (entry: string, settings: any) => {
  setFirstEntry(entry);
  setNotificationSettings(settings);
  
  if (userData?.id) {
    // Пользователь уже авторизован - сохраняем и завершаем
    await updateUserProfile(userData.id, {
      notificationSettings: settings,
      onboardingCompleted: true
    });
    
    setOnboardingComplete(true);
  } else {
    // Нет авторизации - показываем экран входа
    setShowAuth(true);
  }
};
```

**Текущая логика**:
```typescript
// MobileApp.tsx - просто переключает шаги
const onOnboarding2Complete = () => setCurrentStep(3);
const onOnboarding3Complete = () => setCurrentStep(4);
const onOnboarding4Complete = () => setCurrentStep(5); // ???
```

**Отсутствует**:
- ❌ Сохранение `diaryName` и `diaryEmoji` из OnboardingScreen3
- ❌ Сохранение `notificationSettings` из OnboardingScreen4
- ❌ Сохранение `firstEntry` из OnboardingScreen4
- ❌ Передача данных в AuthScreen при регистрации
- ❌ Обновление профиля в Supabase после регистрации

---

### 4. 🔴 Supabase интеграция

**Проблема**: Данные из онбординга не сохраняются в Supabase

**Структура таблицы `profiles`** (готова):
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  language TEXT DEFAULT 'ru',
  diary_name TEXT DEFAULT 'Мой дневник',
  diary_emoji TEXT DEFAULT '📝',
  notification_settings JSONB DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Что должно происходить**:

1. **При регистрации** (signUpWithEmail):
```typescript
const profile = await createUserProfile({
  id: data.user.id,
  email: data.user.email,
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
  onboardingCompleted: false // Новый пользователь
});
```

2. **После завершения онбординга**:
```typescript
await updateUserProfile(userData.id, {
  notificationSettings: settings,
  onboardingCompleted: true
});
```

3. **При входе** (signInWithEmail):
```typescript
const profile = await getUserProfile(data.user.id);

if (!profile.onboardingCompleted) {
  // Показываем OnboardingScreen2 (пропускаем WelcomeScreen)
  setCurrentStep(2);
} else {
  // Показываем главный экран
  setOnboardingComplete(true);
}
```

---

## 🎯 План исправления

### Фаза 1: Восстановить кнопку "У меня уже есть аккаунт" (30 мин)

**Задача 1.1**: Добавить кнопку в WelcomeScreen
- Файл: `src/components/WelcomeScreen.tsx`
- Добавить prop `onSkip?: () => void`
- Восстановить кнопку "У меня уже есть аккаунт" (строки 393-410)
- Стилизация: текст-ссылка под кнопкой "Начать"

**Задача 1.2**: Обновить MobileApp.tsx
- Файл: `src/app/mobile/MobileApp.tsx`
- Добавить handler `onWelcomeSkip` → показывает AuthScreen
- Передать `onSkip={onWelcomeSkip}` в WelcomeScreen

**Задача 1.3**: Обновить App.tsx
- Файл: `src/App.tsx`
- Добавить state `showAuth` для показа AuthScreen
- Добавить handler для перехода WelcomeScreen → AuthScreen

---

### Фаза 2: Исправить интерфейсы OnboardingScreen2/3/4 (1 час)

**Задача 2.1**: Упростить интерфейсы onboarding screens
- Файлы: 
  - `src/components/OnboardingScreen2.tsx`
  - `src/components/OnboardingScreen3.tsx`
  - `src/components/OnboardingScreen4.tsx`

**Новый интерфейс**:
```typescript
interface OnboardingScreen2Props {
  selectedLanguage: string;
  onComplete: () => void;
  onSkip: () => void;
  currentStep: number;
  totalSteps: number;
}
```

**Изменения**:
- Убрать `onNext` → заменить на `onComplete`
- Убрать `onStepClick` (навигация по клику на прогресс-бар)
- Оставить `onSkip` для кнопки "Пропустить"
- Оставить `currentStep` и `totalSteps` для прогресс-бара

**Задача 2.2**: Обновить MobileApp.tsx
- Передавать `currentStep` и `totalSteps` в каждый onboarding screen
- Добавить handlers для `onSkip` (пропустить онбординг)

---

### Фаза 3: Реализовать сохранение данных (1.5 часа)

**Задача 3.1**: Добавить state для данных онбординга в App.tsx
```typescript
const [onboardingData, setOnboardingData] = useState({
  language: 'ru',
  diaryName: 'Мой дневник',
  diaryEmoji: '🏆',
  notificationSettings: {
    selectedTime: 'none',
    morningTime: '08:00',
    eveningTime: '21:00',
    permissionGranted: false
  },
  firstEntry: ''
});
```

**Задача 3.2**: Обновить OnboardingScreen3
- Изменить интерфейс:
```typescript
interface OnboardingScreen3Props {
  selectedLanguage: string;
  onComplete: (diaryName: string, emoji: string) => void;
  onSkip: () => void;
  currentStep: number;
  totalSteps: number;
}
```
- Передавать `diaryName` и `emoji` в `onComplete`

**Задача 3.3**: Обновить OnboardingScreen4
- Изменить интерфейс:
```typescript
interface OnboardingScreen4Props {
  selectedLanguage: string;
  onComplete: (firstEntry: string, settings: NotificationSettings) => void;
  onSkip: () => void;
  currentStep: number;
  totalSteps: number;
}
```
- Передавать `firstEntry` и `settings` в `onComplete`

**Задача 3.4**: Обновить handlers в App.tsx
```typescript
const onOnboarding3Complete = (diaryName: string, emoji: string) => {
  setOnboardingData(prev => ({
    ...prev,
    diaryName,
    diaryEmoji: emoji
  }));
  setCurrentStep(4);
};

const onOnboarding4Complete = (entry: string, settings: any) => {
  setOnboardingData(prev => ({
    ...prev,
    firstEntry: entry,
    notificationSettings: settings
  }));
  
  // Показываем AuthScreen с сохраненными данными
  setShowAuth(true);
};
```

---

### Фаза 4: Интеграция с Supabase (1 час)

**Задача 4.1**: Обновить AuthScreen
- Файл: `src/components/AuthScreen.tsx`
- Добавить prop `onboardingData?: OnboardingData`
- При регистрации передавать данные в `signUpWithEmail`

**Задача 4.2**: Обновить signUpWithEmail
- Файл: `src/utils/auth.ts` или `src/shared/lib/api/auth.ts`
- Принимать `onboardingData` в параметрах
- Создавать профиль с данными из онбординга:
```typescript
const profile = await createUserProfile({
  id: data.user.id,
  email: data.user.email,
  name: userData.name,
  diaryName: onboardingData.diaryName,
  diaryEmoji: onboardingData.diaryEmoji,
  language: onboardingData.language,
  notificationSettings: onboardingData.notificationSettings,
  onboardingCompleted: false
});
```

**Задача 4.3**: Создать первую запись (если есть)
- После регистрации, если `onboardingData.firstEntry` не пустой:
```typescript
if (onboardingData.firstEntry.trim()) {
  await createEntry({
    user_id: data.user.id,
    text: onboardingData.firstEntry,
    created_at: new Date().toISOString()
  });
}
```

**Задача 4.4**: Обновить профиль после завершения онбординга
- После успешной регистрации и создания записи:
```typescript
await updateUserProfile(data.user.id, {
  onboardingCompleted: true
});
```

**Задача 4.5**: Проверка при входе
- В `signInWithEmail` загружать профиль:
```typescript
const profile = await getUserProfile(data.user.id);

if (!profile.onboardingCompleted) {
  // Показываем OnboardingScreen2 (пропускаем WelcomeScreen)
  return {
    success: true,
    user: data.user,
    profile,
    needsOnboarding: true
  };
}
```

---

### Фаза 5: Тестирование (1 час)

**Задача 5.1**: Тест нового пользователя (полный flow)
1. Открыть приложение
2. Выбрать язык → "Начать"
3. OnboardingScreen2 → "Далее" или "Пропустить"
4. OnboardingScreen3 → ввести название "Дневник Побед" + эмодзи 🔥
5. OnboardingScreen4 → ввести первую запись + настроить напоминания
6. Регистрация → email + пароль
7. Проверить в Supabase:
   - `profiles.diary_name` = "Дневник Побед"
   - `profiles.diary_emoji` = "🔥"
   - `profiles.notification_settings` = {...}
   - `profiles.onboarding_completed` = true
   - `entries` содержит первую запись

**Задача 5.2**: Тест существующего пользователя
1. Выйти из системы
2. Нажать "У меня уже есть аккаунт"
3. Войти с существующими данными
4. Проверить, что онбординг НЕ показывается
5. Проверить, что данные профиля загружены

**Задача 5.3**: Тест пропуска онбординга
1. Открыть приложение
2. Нажать "У меня уже есть аккаунт"
3. Регистрация
4. Проверить, что используются значения по умолчанию

---

## 📊 Оценка времени

| Фаза | Задачи | Время |
|------|--------|-------|
| Фаза 1 | Кнопка "У меня уже есть аккаунт" | 30 мин |
| Фаза 2 | Интерфейсы OnboardingScreen2/3/4 | 1 час |
| Фаза 3 | Сохранение данных | 1.5 часа |
| Фаза 4 | Supabase интеграция | 1 час |
| Фаза 5 | Тестирование | 1 час |
| **ИТОГО** | | **5 часов** |

---

## 🎯 Приоритеты

**P0 (КРИТИЧНО - сегодня)**:
- Фаза 1: Кнопка "У меня уже есть аккаунт"
- Фаза 2: Интерфейсы OnboardingScreen2/3/4

**P1 (ВЫСОКИЙ - сегодня)**:
- Фаза 3: Сохранение данных
- Фаза 4: Supabase интеграция

**P2 (СРЕДНИЙ - завтра)**:
- Фаза 5: Полное тестирование

---

## ✅ Критерии успеха

1. ✅ Кнопка "У меня уже есть аккаунт" работает
2. ✅ Прогресс-бар показывается на всех onboarding screens
3. ✅ Кнопки Skip и Next работают
4. ✅ Данные из OnboardingScreen3/4 сохраняются
5. ✅ Данные передаются при регистрации
6. ✅ Профиль создается с правильными данными в Supabase
7. ✅ Первая запись создается (если введена)
8. ✅ При входе проверяется `onboarding_completed`
9. ✅ Существующие пользователи не видят онбординг

---

**Следующий шаг**: Начать с Фазы 1 - восстановить кнопку "У меня уже есть аккаунт"

