# 📖 Анализ процесса создания книги

**Дата**: 2025-11-22  
**Статус**: ✅ Исправлено

---

## 🔍 Проблема

Пользователь сообщил, что при нажатии "Создать книгу":
1. Быстро появляется экран (BookCreationWizard)
2. Дальше появляются даты (Step1Period - выбор периода)

**Проблема**: Быстрое мигание Step0 (выбор плана) для Premium пользователей, которое создавало плохой UX.

---

## 🔄 Что происходит при нажатии "Создать книгу"

### 1. **Инициализация визарда**

```typescript
// ReportsScreen.tsx
onCreateBook={() => {
  setShowBooksLibrary(false);
  setShowBookWizard(true); // ✅ Открывается BookCreationWizard
}}
```

### 2. **BookCreationWizard открывается**

**До исправления**:
- `currentStep` инициализировался как `0` (Step0PlanType)
- Для Premium пользователей два `useEffect` пытались пропустить Step0
- Это создавало race condition и быстрое мигание Step0

**После исправления**:
- Добавлен `isLoadingUser` state для предотвращения мигания
- Данные пользователя загружаются **ДО** показа визарда
- Начальный шаг определяется на основе `isPremium` статуса:
  - **Premium**: `currentStep = 1` (Step1Period - даты)
  - **Free**: `currentStep = 0` (Step0PlanType - выбор плана)

### 3. **Шаги визарда**

#### **Для Premium пользователей** (4 шага):
1. **Step 1: Период** (даты) - `currentStep = 1`
2. **Step 2: Контексты** (категории) - `currentStep = 2`
3. **Step 3: Стиль** - `currentStep = 3`
4. **Step 4: Макет** - `currentStep = 4`

#### **Для Free пользователей** (3 шага):
1. **Step 0: Тип книги** (Free/Premium) - `currentStep = 0`
2. **Step 1: Период** (даты) - `currentStep = 1`
3. **Step 2: Контексты** (категории) - `currentStep = 2`
4. **Генерация** (пропускаются Step 3 и 4)

---

## ✅ Исправления

### 1. **Убрано дублирование логики пропуска Step0**

**До**:
```typescript
// Два useEffect пытались пропустить Step0
useEffect(() => {
  if (isPremium && currentStep === 0 && config.planType !== 'premium') {
    setConfig((prev) => ({ ...prev, planType: 'premium' }));
    setCurrentStep(1);
  }
}, [isPremium, currentStep, config.planType]);

useEffect(() => {
  // ... загрузка данных пользователя
  if (profile.is_premium) {
    setConfig((prev) => ({ ...prev, planType: 'premium' }));
    setCurrentStep(1);
  }
}, []);
```

**После**:
```typescript
// Один useEffect загружает данные и устанавливает начальный шаг
useEffect(() => {
  const getUserData = async () => {
    setIsLoadingUser(true);
    // ... загрузка данных
    if (userIsPremium) {
      setConfig((prev) => ({ ...prev, planType: 'premium' }));
      setCurrentStep(1); // Начальный шаг для Premium
    } else {
      setCurrentStep(0); // Начальный шаг для Free
    }
    setIsLoadingUser(false);
  };
  getUserData();
}, []);
```

### 2. **Добавлен loading state**

```typescript
const [isLoadingUser, setIsLoadingUser] = useState(true);

// Показываем спиннер пока загружаются данные пользователя
{isLoadingUser ? (
  <div className="flex h-full items-center justify-center">
    <div className="text-center">
      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
      <p className="text-muted-foreground text-sm">Загрузка...</p>
    </div>
  </div>
) : (
  // Визард показывается только после загрузки данных
  <div className="flex h-full flex-col">
    {/* ... визард */}
  </div>
)}
```

### 3. **Улучшена инициализация**

- Начальный шаг определяется **ДО** показа визарда
- Нет race condition между загрузкой данных и пропуском Step0
- Premium пользователи сразу видят Step1 (даты), без мигания Step0

---

## 📊 Поток создания книги

```
1. Пользователь нажимает "Создать книгу"
   ↓
2. ReportsScreen → setShowBookWizard(true)
   ↓
3. BookCreationWizard монтируется
   ↓
4. isLoadingUser = true (показывается спиннер)
   ↓
5. Загрузка данных пользователя (getUserData)
   ↓
6. Определение начального шага:
   - Premium → currentStep = 1 (Step1Period - даты)
   - Free → currentStep = 0 (Step0PlanType - выбор плана)
   ↓
7. isLoadingUser = false (визард показывается)
   ↓
8. Пользователь видит правильный шаг без мигания
```

---

## 🎯 Результат

✅ **Premium пользователи**:
- Не видят Step0 (выбор плана)
- Сразу видят Step1 (выбор периода - даты)
- Нет мигания экрана

✅ **Free пользователи**:
- Видят Step0 (выбор плана)
- После выбора плана переходят на Step1 (даты)
- Нормальный UX без проблем

✅ **Общее**:
- Нет race condition
- Нет дублирования логики
- Плавная загрузка с индикатором
- Правильная инициализация начального шага

---

## 📝 Файлы изменены

- `src/features/mobile/reports/components/book-creation-wizard/BookCreationWizard.tsx`
  - Добавлен `isLoadingUser` state
  - Убрано дублирование логики пропуска Step0
  - Улучшена инициализация начального шага
  - Добавлен loading spinner

---

## ✅ Тестирование

**Проверьте**:
1. Premium пользователь → должен сразу видеть Step1 (даты)
2. Free пользователь → должен видеть Step0 (выбор плана)
3. Нет мигания экрана при открытии визарда
4. Плавная загрузка с индикатором

