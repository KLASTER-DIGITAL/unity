# 💰 Система монетизации - Детальный план задачи

**Дата обновления**: 2025-01-18  
**Версия**: 1.0  
**Статус**: Фаза 3 - Q3 2025  
**Автор**: Команда UNITY

> **Связь с мастер-планом**: Эта задача детализирует **Задачу 7** из [UNITY_MASTER_PLAN_2025.md](../UNITY_MASTER_PLAN_2025.md)

---

## 🎯 Цель задачи

Внедрить устойчивую freemium бизнес-модель с Premium подпиской $4.99/месяц, интеграцией платежей и реферальной системой.

### Ключевые метрики
- **Conversion Rate**: 15% freemium → premium
- **Churn Rate**: < 5% месячный отток
- **LTV**: $60 (средняя подписка 12 месяцев)
- **Referral Rate**: 20% пользователей приводят друзей

---

## 📋 Детальные задачи

### Неделя 1: Freemium модель

#### 1.1 Ограничения для бесплатных пользователей
**Файлы для создания/изменения**:
- `src/shared/lib/subscription/subscription-manager.ts`
- `src/shared/lib/subscription/usage-tracker.ts`
- `src/shared/hooks/useSubscription.ts`

**Freemium ограничения**:
```typescript
// subscription-manager.ts
export const FREEMIUM_LIMITS = {
  ENTRIES_PER_MONTH: 10,
  AI_ANALYSIS_PER_MONTH: 3,
  MEDIA_FILES_PER_ENTRY: 1,
  EXPORT_FORMATS: ['txt'], // только текст
  HISTORY_MONTHS: 1, // только последний месяц
  MOTIVATION_CARDS_PER_WEEK: 1
} as const;

export const PREMIUM_FEATURES = {
  UNLIMITED_ENTRIES: true,
  UNLIMITED_AI_ANALYSIS: true,
  UNLIMITED_MEDIA: true,
  ALL_EXPORT_FORMATS: ['pdf', 'csv', 'json'],
  FULL_HISTORY: true,
  UNLIMITED_MOTIVATION_CARDS: true,
  ADVANCED_ANALYTICS: true,
  PRIORITY_SUPPORT: true
} as const;
```

#### 1.2 Usage Tracking
**Реализация отслеживания использования**:
```typescript
// usage-tracker.ts
export class UsageTracker {
  async trackEntryCreation(userId: string): Promise<boolean> {
    const usage = await this.getCurrentMonthUsage(userId);
    const subscription = await this.getUserSubscription(userId);
    
    if (subscription.type === 'freemium') {
      if (usage.entries >= FREEMIUM_LIMITS.ENTRIES_PER_MONTH) {
        throw new UsageLimitError('Достигнут лимит записей');
      }
    }
    
    await this.incrementUsage(userId, 'entries');
    return true;
  }
}
```

### Неделя 2: Stripe интеграция

#### 2.1 Настройка Stripe
**Установка зависимостей**:
```bash
npm install stripe @stripe/stripe-js
```

**Файлы для создания**:
- `supabase/functions/create-checkout-session/index.ts`
- `supabase/functions/handle-webhook/index.ts`
- `src/shared/lib/payments/stripe-client.ts`

#### 2.2 Checkout процесс
**Edge Function для создания сессии**:
```typescript
// create-checkout-session/index.ts
import Stripe from 'stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

export default async function handler(req: Request) {
  const { userId, priceId } = await req.json();
  
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [{
      price: priceId, // price_premium_monthly
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: `${origin}/subscription/success`,
    cancel_url: `${origin}/subscription/cancel`,
    metadata: { userId }
  });
  
  return new Response(JSON.stringify({ url: session.url }));
}
```

#### 2.3 Webhook обработка
**Обработка событий Stripe**:
```typescript
// handle-webhook/index.ts
export default async function handler(req: Request) {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();
  
  const event = stripe.webhooks.constructEvent(
    body, signature, webhookSecret
  );
  
  switch (event.type) {
    case 'checkout.session.completed':
      await activateSubscription(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await deactivateSubscription(event.data.object);
      break;
  }
}
```

### Неделя 3: Subscription UI

#### 3.1 Paywall компоненты
**Файлы для создания**:
- `src/features/mobile/subscription/components/PaywallModal.tsx`
- `src/features/mobile/subscription/components/PricingPlans.tsx`
- `src/features/mobile/subscription/components/FeatureComparison.tsx`

**Paywall дизайн**:
```typescript
// PaywallModal.tsx
export function PaywallModal({ feature, onClose }: PaywallProps) {
  return (
    <Modal isOpen onClose={onClose}>
      <div className="text-center p-6">
        <h2 className="text-2xl font-bold mb-4">
          Разблокируйте {feature}
        </h2>
        
        <div className="mb-6">
          <PremiumFeaturesList />
        </div>
        
        <PricingPlans />
        
        <Button onClick={handleUpgrade} className="w-full">
          Попробовать Premium бесплатно
        </Button>
        
        <p className="text-sm text-gray-500 mt-2">
          7 дней бесплатно, затем $4.99/месяц
        </p>
      </div>
    </Modal>
  );
}
```

#### 3.2 Subscription management
**Управление подпиской**:
```typescript
// SubscriptionSettings.tsx
export function SubscriptionSettings() {
  const { subscription } = useSubscription();
  
  return (
    <div className="space-y-4">
      <SubscriptionStatus subscription={subscription} />
      
      {subscription.type === 'premium' && (
        <>
          <UsageStatistics />
          <BillingHistory />
          <CancelSubscription />
        </>
      )}
      
      {subscription.type === 'freemium' && (
        <UpgradePrompt />
      )}
    </div>
  );
}
```

### Неделя 4: Реферальная система

#### 4.1 Referral tracking
**База данных**:
```sql
-- Таблица рефералов
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES users(id),
  referred_id UUID REFERENCES users(id),
  referral_code TEXT UNIQUE,
  status TEXT DEFAULT 'pending', -- pending, completed, rewarded
  reward_type TEXT, -- free_month, premium_trial
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Реализация**:
```typescript
// referral-system.ts
export class ReferralSystem {
  async generateReferralCode(userId: string): Promise<string> {
    const code = `UNITY${userId.slice(0, 8).toUpperCase()}`;
    
    await supabase.from('referrals').insert({
      referrer_id: userId,
      referral_code: code
    });
    
    return code;
  }
  
  async processReferral(code: string, newUserId: string) {
    const referral = await this.findReferralByCode(code);
    
    if (referral) {
      // Награда рефереру
      await this.grantReward(referral.referrer_id, 'free_month');
      
      // Бонус новому пользователю
      await this.grantReward(newUserId, 'premium_trial');
      
      await this.markReferralCompleted(referral.id);
    }
  }
}
```

#### 4.2 Referral UI
**Компоненты**:
```typescript
// ReferralProgram.tsx
export function ReferralProgram() {
  const { user } = useAuth();
  const { referralCode, stats } = useReferral(user.id);
  
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        Приглашайте друзей
      </h2>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <p className="text-sm mb-2">Ваш код приглашения:</p>
        <div className="flex items-center gap-2">
          <code className="bg-white px-3 py-2 rounded">
            {referralCode}
          </code>
          <Button onClick={() => copyToClipboard(referralCode)}>
            Копировать
          </Button>
        </div>
      </div>
      
      <ReferralStats stats={stats} />
      <ShareButtons referralCode={referralCode} />
    </div>
  );
}
```

---

## 💳 Платежные планы

### Pricing Strategy
```typescript
export const PRICING_PLANS = {
  freemium: {
    name: 'Базовый',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      '10 записей в месяц',
      '3 AI-анализа',
      'Базовая аналитика',
      'Экспорт в текст'
    ]
  },
  premium: {
    name: 'Premium',
    price: 4.99,
    currency: 'USD', 
    interval: 'month',
    trial_days: 7,
    features: [
      'Безлимитные записи',
      'Безлимитный AI-анализ',
      'Расширенная аналитика',
      'Все форматы экспорта',
      'PDF книги достижений',
      'Приоритетная поддержка'
    ]
  }
} as const;
```

### A/B Testing
**Тестирование цен**:
- **Группа A**: $4.99/месяц
- **Группа B**: $6.99/месяц  
- **Группа C**: $3.99/месяц с годовой скидкой

---

## 📊 Аналитика и мониторинг

### Revenue Metrics
```typescript
// revenue-analytics.ts
export interface RevenueMetrics {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  churn_rate: number;
  ltv: number; // Lifetime Value
  cac: number; // Customer Acquisition Cost
  conversion_rate: number;
}

export class RevenueAnalytics {
  async calculateMRR(): Promise<number> {
    const activeSubscriptions = await this.getActiveSubscriptions();
    return activeSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  }
}
```

### Subscription Events
```typescript
// Отслеживание событий
export const SUBSCRIPTION_EVENTS = {
  PAYWALL_SHOWN: 'paywall_shown',
  UPGRADE_CLICKED: 'upgrade_clicked',
  CHECKOUT_STARTED: 'checkout_started',
  SUBSCRIPTION_ACTIVATED: 'subscription_activated',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  REFERRAL_SHARED: 'referral_shared'
} as const;
```

---

## 🧪 Тестирование

### Payment Testing
1. **Stripe Test Mode** - тестовые карты
2. **Webhook Testing** - ngrok для локальной разработки
3. **Subscription Flows** - полный цикл подписки
4. **Edge Cases** - неудачные платежи, отмены

### A/B Testing
- **Paywall Timing** - когда показывать paywall
- **Pricing Display** - как представлять цены
- **Feature Messaging** - какие преимущества подчеркивать

---

## ✅ Критерии готовности

### Definition of Done
- [ ] Freemium ограничения работают корректно
- [ ] Stripe интеграция протестирована
- [ ] Paywall показывается в нужных местах
- [ ] Subscription management функционирует
- [ ] Реферальная система активна
- [ ] Webhook обработка настроена
- [ ] Revenue аналитика работает

### Legal Requirements
- **Terms of Service** - условия использования
- **Privacy Policy** - политика конфиденциальности
- **Refund Policy** - политика возвратов
- **GDPR Compliance** - соответствие GDPR

---

## 🔗 Связанные документы

- [UNITY_MASTER_PLAN_2025.md](../UNITY_MASTER_PLAN_2025.md) - общая стратегия
- [react-native-expo-migration.md](./react-native-expo-migration.md) - мобильные приложения
- [advanced-analytics.md](./advanced-analytics.md) - аналитика

---

**🎯 Результат**: Устойчивая бизнес-модель с предсказуемым доходом и высокой конверсией пользователей.
