<!-- 70474d32-4fd5-45fc-ac03-fab43007edfb 76a51ad4-0602-4ddf-a506-b850ad21aae4 -->
# План реализации системы AI-карточек мотивации

## Текущее состояние

**Проблемы:**

- Карточки формируются из всех записей, без фильтрации по дате (вчера/сегодня)
- Отсутствуют поля `ai_summary` и `ai_insight` в структуре DiaryEntry
- Нет кэширования карточек и отслеживания просмотренных
- AI-промпт не генерирует краткие инсайты для карточек (только reply)
- Нет дефолтных мотиваций, когда записей за вчера/сегодня нет
- Отсутствует функционал monthly_insights для экономии токенов

**Текущая структура:**

- `src/utils/api.ts`: DiaryEntry без ai_summary/ai_insight
- `src/supabase/functions/server/index.tsx`: AI-анализ генерирует только reply, sentiment, category, tags
- `src/components/screens/AchievementHomeScreen.tsx`: Загружает все записи и конвертирует их в карточки
- `src/components/ChatInputSection.tsx`: Вызывает analyzeTextWithAI при создании записи

## Этапы реализации

### 1. Расширение схемы данных DiaryEntry

**Файлы:** `src/utils/api.ts`, `src/supabase/functions/server/index.tsx`

Добавить новые поля в интерфейс DiaryEntry:

```typescript
export interface DiaryEntry {
  // ... существующие поля
  aiSummary?: string;        // Краткое резюме (до 200 символов)
  aiInsight?: string;        // Позитивный вывод (до 200 символов)
  isAchievement?: boolean;   // Флаг достижения
  mood?: string;             // Эмоция/настроение
}
```

Обновить API-эндпоинт `/entries/create` для сохранения этих полей в KV-store.

### 2. Улучшение AI-промпта для генерации инсайтов

**Файл:** `src/supabase/functions/server/index.tsx` (строки 414-428)

Обновить системный промпт для `/chat/analyze`:

```
Ты - мотивирующий AI-помощник в приложении "Дневник достижений". Твоя задача:
1. Дать короткий воодушевляющий ответ (1-2 предложения, эмоджи приветствуются)
2. Создать краткое резюме достижения (summary, до 200 символов)
3. Сформировать позитивный вывод/инсайт (insight, до 200 символов) 
4. Определить sentiment, category, tags, confidence

Отвечай в формате JSON:
{
  "reply": "Мотивирующий ответ",
  "summary": "Краткое резюме достижения",
  "insight": "Позитивный вывод о значении этого действия",
  "sentiment": "positive|neutral|negative",
  "category": "название",
  "tags": ["тег1"],
  "confidence": 0.95,
  "isAchievement": true,
  "mood": "энергия"
}
```

Обновить парсинг ответа AI для извлечения summary и insight.

### 3. Обновление ChatInputSection для сохранения инсайтов

**Файл:** `src/components/ChatInputSection.tsx` (строки 131-143)

Расширить `entryData` при создании записи:

```typescript
const entryData = {
  // ... существующие поля
  aiSummary: analysis.summary,
  aiInsight: analysis.insight,
  isAchievement: analysis.isAchievement,
  mood: analysis.mood
};
```

### 4. API-функции для карточек мотивации

**Новый файл:** `src/utils/motivationApi.ts`

Создать специализированные функции:

```typescript
// Получить записи за вчера и сегодня
export async function getRecentEntries(userId: string): Promise<DiaryEntry[]>

// Получить мотивационные карточки (с кэшем)
export async function getMotivationCards(userId: string): Promise<MotivationCard[]>

// Отметить карточку как просмотренную
export async function markCardAsRead(userId: string, cardId: string): Promise<void>

// Получить дефолтные мотивации
export function getDefaultMotivations(): MotivationCard[]
```

### 5. Backend API для карточек

**Файл:** `src/supabase/functions/server/index.tsx`

Добавить новые эндпоинты:

**a) GET `/motivations/cards/:userId`** - получить карточки для пользователя:

- Фильтровать записи по дате (вчера + сегодня)
- Исключить просмотренные карточки (из кэша)
- Вернуть до 3 карточек с полями: id, date, summary (title), insight (description), gradient
- Если нет записей → вернуть 3 дефолтные мотивации

**b) POST `/motivations/mark-read`** - отметить карточку просмотренной:

- Сохранить в KV: `card_views:${userId}` → массив просмотренных entry IDs
- TTL = 24 часа (автоочистка на следующий день)

**c) GET `/motivations/default`** - получить дефолтные мотивации

### 6. Улучшение AchievementHomeScreen

**Файл:** `src/components/screens/AchievementHomeScreen.tsx` (строки 296-343)

Изменить `loadEntriesAndStats`:

```typescript
// Вместо getEntries(userId, 20) использовать:
const cards = await getMotivationCards(userId);

// Если cards.length === 0:
//   - Показать дефолтные мотивации
// Иначе:
//   - Отобразить карточки с ai_summary (title) и ai_insight (description)
```

Обновить функцию `handleSwipe` для правого свайпа:

```typescript
if (direction === 'right') {
  // Отметить карточку просмотренной
  await markCardAsRead(userId, currentCard.id);
  // ... остальная логика
}
```

### 7. Дефолтные мотивации

**Файл:** `src/components/screens/AchievementHomeScreen.tsx` (обновить STARTER_CARDS)

Заменить текущие 2 карточки на 3 мотивационные:

```typescript
const DEFAULT_MOTIVATIONS: AchievementCard[] = [
  {
    id: "default_1",
    date: "Начни сегодня",
    title: "Сегодня отличное время",
    description: "Запиши маленькую победу — это первый шаг к осознанию своих достижений.",
    gradient: "from-[#FE7669] to-[#ff8969]",
    isMarked: false
  },
  {
    id: "default_2", 
    date: "Совет дня",
    title: "Даже одна мысль делает день осмысленным",
    description: "Не обязательно писать много — одна фраза может изменить твой взгляд на прожитый день.",
    gradient: "from-[#ff6b9d] to-[#c471ed]",
    isMarked: false
  },
  {
    id: "default_3",
    date: "Мотивация",
    title: "Запиши момент благодарности",
    description: "Почувствуй лёгкость, когда замечаешь хорошее в своей жизни. Это путь к счастью.",
    gradient: "from-[#c471ed] to-[#8B78FF]",
    isMarked: false
  }
];
```

### 8. Интерфейс MotivationCard

**Файл:** `src/utils/motivationApi.ts`

```typescript
export interface MotivationCard {
  id: string;
  entryId?: string;      // Связь с записью (если не дефолтная)
  date: string;          // Дата записи или "Совет дня"
  title: string;         // ai_summary или дефолтный заголовок
  description: string;   // ai_insight или дефолтное описание
  gradient: string;      // Градиент на основе sentiment
  isMarked: boolean;     // Просмотрена ли
  isDefault?: boolean;   // Дефолтная мотивация или из записи
  sentiment?: string;
  category?: string;
}
```

### 9. Типы для AIAnalysisResult

**Файл:** `src/utils/api.ts` (строки 75-81)

Расширить интерфейс:

```typescript
export interface AIAnalysisResult {
  reply: string;
  summary: string;       // НОВОЕ
  insight: string;       // НОВОЕ
  sentiment: 'positive' | 'neutral' | 'negative';
  category: string;
  tags: string[];
  confidence: number;
  isAchievement?: boolean;  // НОВОЕ
  mood?: string;           // НОВОЕ
}
```

### 10. Тестирование и отладка

- Проверить генерацию карточек для пользователей с записями за вчера/сегодня
- Убедиться, что дефолтные мотивации показываются при отсутствии записей
- Проверить корректность свайпа и отметки "прочитано"
- Убедиться, что просмотренные карточки не показываются повторно в течение дня
- Проверить, что новый AI-промпт генерирует качественные summary и insight

## Ключевые файлы для изменения

1. `src/utils/api.ts` - расширение DiaryEntry и AIAnalysisResult
2. `src/utils/motivationApi.ts` - НОВЫЙ файл с API для карточек
3. `src/supabase/functions/server/index.tsx` - улучшение AI-промпта и новые эндпоинты
4. `src/components/ChatInputSection.tsx` - сохранение ai_summary/ai_insight
5. `src/components/screens/AchievementHomeScreen.tsx` - использование новых API для карточек

## Приоритет оптимизации токенов

✅ AI-анализ вызывается ОДИН раз при создании записи

✅ summary и insight кэшируются в базе

✅ Карточки формируются из кэша без повторных AI-запросов

✅ Просмотренные карточки отслеживаются в KV с TTL 24ч

✅ Дефолтные мотивации хардкод (без AI)

Функционал monthly_insights (PDF-книги и месячные итоги) можно реализовать отдельно после завершения базовой системы карточек.

---

## 🌍 Мультиязычность и сохранение настроек

### 11. Сохранение языка пользователя

**Проблема:** Язык выбирается на WelcomeScreen (шаг 1), но не сохраняется в профиле

**Решение:**

**Файл:** `src/App.tsx` (строки 335-347)

Обновить `handleWelcomeNext` для сохранения языка:

```typescript
const handleWelcomeNext = async (language: string) => {
  setSelectedLanguage(language);
  
  // Если пользователь авторизован - сохраняем язык сразу
  if (userData?.id) {
    try {
      await updateUserProfile(userData.id, { language });
      console.log('Language saved:', language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  }
  
  setCurrentStep(2);
};
```

**Файл:** `src/utils/auth.ts` (строка 221)

При создании профиля сохранять язык из selectedLanguage:

```typescript
const newProfile = await createUserProfile({
  id: session.user.id,
  email: session.user.email!,
  name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Пользователь',
  diaryName: session.user.user_metadata?.diaryName || 'Мой дневник',
  diaryEmoji: session.user.user_metadata?.diaryEmoji || '🏆',
  language: session.user.user_metadata?.language || 'ru',  // Язык из метаданных
  // ...
});
```

**Файл:** `src/utils/auth.ts` (функция signUpWithEmail)

Передавать язык при регистрации:

```typescript
export async function signUpWithEmail(
  email: string, 
  password: string, 
  userData: {
    name: string;
    diaryName?: string;
    diaryEmoji?: string;
    language?: string;  // ДОБАВИТЬ
    // ...
  }
): Promise<AuthResult>
```

### 12. AI-ответы на языке пользователя

**Файл:** `src/supabase/functions/server/index.tsx` (строки 414-428)

Обновить AI-промпт для учета языка пользователя:

```
Ты - мотивирующий AI-помощник в приложении "Дневник достижений".
ВАЖНО: Отвечай на языке пользователя (${userLanguage}).

Твоя задача:
1. Дать короткий воодушевляющий ответ (1-2 предложения, эмоджи приветствуются)
2. Создать краткое резюме достижения (summary, до 200 символов)
3. Сформировать позитивный вывод/инсайт (insight, до 200 символов)
4. Определить sentiment, category, tags, confidence

Отвечай в формате JSON:
{
  "reply": "Мотивирующий ответ на языке ${userLanguage}",
  "summary": "Краткое резюме на языке ${userLanguage}",
  "insight": "Позитивный вывод на языке ${userLanguage}",
  "sentiment": "positive|neutral|negative",
  "category": "название категории на языке ${userLanguage}",
  "tags": ["тег1 на языке ${userLanguage}"],
  "confidence": 0.95,
  "isAchievement": true,
  "mood": "эмоция на языке ${userLanguage}"
}
```

**Файл:** `src/supabase/functions/server/index.tsx` (эндпоинт `/chat/analyze`)

Получать язык пользователя из запроса:

```typescript
app.post('/make-server-9729c493/chat/analyze', async (c) => {
  try {
    const { text, userName, userId } = await c.req.json();  // ДОБАВИТЬ userId
    
    // Получить профиль для определения языка
    let userLanguage = 'ru';
    if (userId) {
      const profile = await kv.get(`profile:${userId}`);
      if (profile?.language) {
        userLanguage = profile.language;
      }
    }
    
    // Использовать userLanguage в промпте
    // ...
  }
});
```

**Файл:** `src/components/ChatInputSection.tsx` (строка 115)

Передавать userId в analyzeTextWithAI:

```typescript
const analysis = await analyzeTextWithAI(userText, userName, userId);
```

**Файл:** `src/utils/api.ts` (функция analyzeTextWithAI)

Обновить сигнатуру для передачи userId:

```typescript
export async function analyzeTextWithAI(
  text: string, 
  userName?: string,
  userId?: string  // ДОБАВИТЬ
): Promise<AIAnalysisResult>
```

### 13. Мультиязычные дефолтные мотивации

**Файл:** `src/components/screens/AchievementHomeScreen.tsx`

Создать переводы дефолтных мотиваций:

```typescript
const DEFAULT_MOTIVATIONS: { [key: string]: AchievementCard[] } = {
  ru: [
    {
      id: "default_1",
      date: "Начни сегодня",
      title: "Сегодня отличное время",
      description: "Запиши маленькую победу — это первый шаг к осознанию своих достижений.",
      gradient: "from-[#FE7669] to-[#ff8969]",
      isMarked: false
    },
    // ... еще 2 карточки
  ],
  en: [
    {
      id: "default_1",
      date: "Start today",
      title: "Today is a great time",
      description: "Write down a small victory — it's the first step to recognizing your achievements.",
      gradient: "from-[#FE7669] to-[#ff8969]",
      isMarked: false
    },
    // ... еще 2 карточки
  ],
  // ... переводы для es, de, fr, zh, ja
};

// Функция получения дефолтных мотиваций с учетом языка
function getDefaultMotivations(language: string): AchievementCard[] {
  return DEFAULT_MOTIVATIONS[language] || DEFAULT_MOTIVATIONS['ru'];
}
```

### 14. Загрузка языка из профиля при входе

**Файл:** `src/App.tsx` (useEffect для checkExistingSession)

После загрузки профиля устанавливать язык:

```typescript
const checkExistingSession = async () => {
  try {
    setIsCheckingSession(true);
    const result = await checkSession();
    
    if (result.success && result.user) {
      console.log('Existing session found:', result.user);
      setUserData(result.user);
      
      // Устанавливаем язык из профиля
      if (result.user.language) {
        setSelectedLanguage(result.user.language);
      }
      
      // Устанавливаем название дневника
      if (result.user.diaryName && result.user.diaryEmoji) {
        setDiaryData({
          name: result.user.diaryName,
          emoji: result.user.diaryEmoji
        });
      }
      
      // ...
    }
  } catch (error) {
    console.error('Error checking session:', error);
  } finally {
    setIsCheckingSession(false);
  }
};
```

### 15. Сохранение diaryName и diaryEmoji уже реализовано

**Проверка:** В `src/App.tsx` (строки 358-375) уже есть:

```typescript
const handleOnboarding3Next = async (diaryName: string, emoji: string) => {
  setDiaryData({ name: diaryName, emoji });
  
  // Если пользователь уже авторизован, сохраняем изменения
  if (userData?.id) {
    try {
      await updateUserProfile(userData.id, {
        diaryName,
        diaryEmoji: emoji
      });
      console.log('Diary settings saved');
    } catch (error) {
      console.error('Error saving diary settings:', error);
    }
  }
  
  setCurrentStep(4);
};
```

✅ Эта часть уже работает корректно!

---

## 📋 Обновленный порядок реализации с учетом языков

1. ✅ Расширение DiaryEntry (ai_summary, ai_insight, mood, isAchievement)
2. ✅ Улучшение AI-промпта с учетом языка пользователя
3. ✅ Сохранение языка в профиле при выборе на WelcomeScreen
4. ✅ Передача userId в AI-анализ для определения языка
5. ✅ Загрузка языка из профиля при входе
6. ✅ Мультиязычные дефолтные мотивации
7. ✅ API для мотивационных карточек с фильтрацией по дате
8. ✅ Отслеживание просмотренных карточек
9. ✅ Интеграция в AchievementHomeScreen
10. ✅ Тестирование на разных языках

---

## 💾 Сохранение первой записи и настроек из онбординга

### 16. Проблема с первой записью

**Текущее состояние:**

- В `OnboardingScreen4.tsx` пользователь может создать первую запись
- Запись сохраняется в state (`firstEntry`)
- НО запись НЕ сохраняется в базу как DiaryEntry
- После регистрации firstEntry просто передается в `AchievementHomeScreen` как prop
- Пользователь НЕ видит свою первую запись в кабинете

**Файлы:**

- `src/App.tsx` (строки 384-422) - обработка onboarding4Next
- `src/App.tsx` (строка 559) - передача firstEntry как prop
- `src/components/screens/AchievementHomeScreen.tsx` - получает firstEntry но не использует

### 17. Решение: Сохранение первой записи после регистрации

**Файл:** `src/App.tsx` (функция `handleAuthComplete`)

Добавить логику сохранения первой записи после регистрации/входа:

```typescript
const handleAuthComplete = async (data: any) => {
  console.log('Auth complete with data:', data);
  setUserData(data);
  setShowAuth(false);
  setShowAuthAfterEntry(false);
  
  // НОВОЕ: Сохраняем выбранный язык в профиль
  if (selectedLanguage && selectedLanguage !== data.language) {
    try {
      await updateUserProfile(data.id, { language: selectedLanguage });
      data.language = selectedLanguage;
    } catch (error) {
      console.error('Error updating language:', error);
    }
  }
  
  // НОВОЕ: Сохраняем первую запись, если она есть
  if (firstEntry && firstEntry.trim()) {
    try {
      console.log('Saving first entry from onboarding:', firstEntry);
      
      // Анализируем текст с AI
      const analysis = await analyzeTextWithAI(
        firstEntry, 
        data.name || 'Пользователь',
        data.id
      );
      
      // Создаем запись в базе
      const savedEntry = await createEntry({
        userId: data.id,
        text: firstEntry,
        sentiment: analysis.sentiment,
        category: analysis.category,
        tags: analysis.tags,
        aiReply: analysis.reply,
        aiSummary: analysis.summary,
        aiInsight: analysis.insight,
        isAchievement: analysis.isAchievement,
        mood: analysis.mood,
        focusArea: analysis.category
      });
      
      console.log('First entry saved:', savedEntry);
      
      // Очищаем firstEntry из state
      setFirstEntry("");
      
      toast.success("Твоя первая запись сохранена! 🎉");
    } catch (error) {
      console.error('Error saving first entry:', error);
      toast.error("Не удалось сохранить первую запись");
    }
  }
  
  // Сохраняем данные онбординга, если есть
  if (data.id && (diaryData.name || notificationSettings.selectedTime !== 'none')) {
    try {
      await updateUserProfile(data.id, {
        diaryName: diaryData.name || 'Мой дневник',
        diaryEmoji: diaryData.emoji || '🏆',
        language: selectedLanguage,
        notificationSettings: notificationSettings,
        onboardingCompleted: true
      });
      // ...
    }
  }
  
  // ...остальная логика
};
```

### 18. Обновление обработки onboarding4Next для авторизованных

**Файл:** `src/App.tsx` (строки 384-422)

Если пользователь УЖЕ авторизован при завершении онбординга, сохранять запись сразу:

```typescript
const handleOnboarding4Next = async (entry: string, settings: any) => {
  setFirstEntry(entry);
  setNotificationSettings(settings);
  
  // Если пользователь уже авторизован, сохраняем настройки и запись
  if (userData?.id) {
    try {
      // Сохраняем настройки профиля
      await updateUserProfile(userData.id, {
        notificationSettings: settings,
        onboardingCompleted: true
      });
      
      console.log('✅ Onboarding completed and saved');
      
      // НОВОЕ: Сохраняем первую запись, если она есть
      if (entry && entry.trim()) {
        console.log('Saving first entry from onboarding (authorized):', entry);
        
        const analysis = await analyzeTextWithAI(
          entry, 
          userData.name || 'Пользователь',
          userData.id
        );
        
        await createEntry({
          userId: userData.id,
          text: entry,
          sentiment: analysis.sentiment,
          category: analysis.category,
          tags: analysis.tags,
          aiReply: analysis.reply,
          aiSummary: analysis.summary,
          aiInsight: analysis.insight,
          isAchievement: analysis.isAchievement,
          mood: analysis.mood,
          focusArea: analysis.category
        });
        
        console.log('First entry saved successfully');
        setFirstEntry(""); // Очищаем
        
        toast.success("Твоя первая запись сохранена! 🎉");
      }
      
      // Обновляем userData
      setUserData({
        ...userData,
        onboardingCompleted: true,
        notificationSettings: settings
      });
      
      setOnboardingComplete(true);
      setNeedsOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast.error("Ошибка сохранения данных");
      setOnboardingComplete(true);
    }
  } else {
    // Если не авторизован - показываем экран авторизации
    if (entry.trim()) {
      setTimeout(() => {
        setShowAuthAfterEntry(true);
      }, 1000);
    } else {
      setShowAuth(true);
    }
  }
};
```

### 19. Удаление пропа firstEntry из AchievementHomeScreen

**Файл:** `src/components/screens/AchievementHomeScreen.tsx`

Удалить неиспользуемый проп `firstEntry`:

```typescript
interface AchievementHomeScreenProps {
  diaryData?: DiaryData;
  // firstEntry?: string;  // УДАЛИТЬ - больше не нужно
  userData?: any;
}

export function AchievementHomeScreen({ 
  diaryData = { name: "Мой дневник", emoji: "🏆" }, 
  // firstEntry,  // УДАЛИТЬ
  userData 
}: AchievementHomeScreenProps)
```

**Файл:** `src/App.tsx` (строки 559, 564)

Убрать передачу firstEntry:

```typescript
case "home": return (
  <AchievementHomeScreen 
    diaryData={diaryData} 
    userData={userData} 
  />
);
```

### 20. Сохранение языка при регистрации

**Файл:** `src/utils/auth.ts` (функция signUpWithEmail)

Принимать и сохранять язык:

```typescript
export async function signUpWithEmail(
  email: string, 
  password: string, 
  userData: {
    name: string;
    diaryName?: string;
    diaryEmoji?: string;
    language?: string;  // ДОБАВИТЬ
    notificationSettings?: any;
  }
): Promise<AuthResult> {
  try {
    // ... регистрация
    
    // Создаем профиль с языком
    const profile = await createUserProfile({
      id: data.user.id,
      email: data.user.email!,
      name: userData.name,
      diaryName: userData.diaryName || 'Мой дневник',
      diaryEmoji: userData.diaryEmoji || '🏆',
      language: userData.language || 'ru',  // ДОБАВИТЬ
      notificationSettings: userData.notificationSettings || {
        selectedTime: 'none',
        morningTime: '08:00',
        eveningTime: '21:00',
        permissionGranted: false
      },
      onboardingCompleted: false
    });
    
    // ...
  }
}
```

**Файл:** `src/components/AuthScreenNew.tsx`

Передавать selectedLanguage при регистрации:

```typescript
// В handleSignUp добавить:
const result = await signUpWithEmail(email, password, {
  name,
  language: selectedLanguage  // ДОБАВИТЬ (получить из пропов или контекста)
});
```

### 21. Регистрация push-уведомлений после онбординга

**Проблема:** Настройки напоминаний сохраняются, но push-подписка не регистрируется

**Файл:** `src/App.tsx` (после сохранения notificationSettings)

Добавить регистрацию Service Worker и push-подписки:

```typescript
// После updateUserProfile с notificationSettings
if (settings.permissionGranted && settings.selectedTime !== 'none') {
  try {
    // Регистрируем Service Worker
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', registration);
      
      // Создаем push-подписку (если нужно)
      // TODO: Реализовать на бэкенде
    }
    
    // Планируем локальные напоминания (fallback)
    scheduleLocalNotifications(settings);
  } catch (error) {
    console.error('Error setting up notifications:', error);
  }
}
```

### 22. Проверка всей цепочки сохранения

**Итоговая последовательность:**

1. **Шаг 1 (WelcomeScreen):** Выбор языка → сохраняется в `selectedLanguage`
2. **Шаг 3 (OnboardingScreen3):** Название дневника + эмодзи → сохраняется в `diaryData`
3. **Шаг 4 (OnboardingScreen4):** Напоминания + первая запись → сохраняется в `notificationSettings` и `firstEntry`
4. **Регистрация (AuthScreen):** 

   - Создается профиль с языком, diaryName, diaryEmoji
   - После успеха вызывается `handleAuthComplete`

5. **handleAuthComplete:**

   - Сохраняет `firstEntry` через AI-анализ как DiaryEntry
   - Обновляет профиль с полными данными онбординга
   - Регистрирует push-уведомления
   - Завершает онбординг

**Результат:** Пользователь видит свою первую запись в кабинете как карточку мотивации!