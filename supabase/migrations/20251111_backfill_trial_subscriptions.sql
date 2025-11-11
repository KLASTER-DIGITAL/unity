-- Migration: Backfill Trial Subscriptions for Existing FREE Users
-- Date: 2025-11-11
-- Description: Добавляет 14-дневный trial всем существующим FREE пользователям без подписок

-- 1. Создать trial подписки для FREE пользователей без активных подписок
INSERT INTO subscriptions (
  user_id,
  plan_type,
  status,
  start_date,
  end_date,
  payment_method,
  amount,
  currency,
  metadata,
  created_at,
  updated_at
)
SELECT 
  p.id as user_id,
  'monthly' as plan_type,
  'active' as status,
  NOW() as start_date,
  NOW() + INTERVAL '14 days' as end_date,
  'promo' as payment_method,
  0 as amount,
  'USD' as currency,
  jsonb_build_object(
    'is_trial', true,
    'trial_days', 14,
    'created_via', 'backfill_migration',
    'welcome_modal_shown', false,
    'backfill_date', NOW()
  ) as metadata,
  NOW() as created_at,
  NOW() as updated_at
FROM profiles p
LEFT JOIN subscriptions s ON s.user_id = p.id AND s.status = 'active'
WHERE p.is_premium = false
  AND s.id IS NULL
  AND p.created_at < '2025-11-10'::timestamptz  -- Только пользователи созданные ДО автоматического trial
ON CONFLICT DO NOTHING;

-- 2. Обновить is_premium = true для пользователей с новыми trial подписками
UPDATE profiles
SET is_premium = true
WHERE id IN (
  SELECT user_id 
  FROM subscriptions 
  WHERE status = 'active' 
    AND metadata->>'is_trial' = 'true'
    AND metadata->>'created_via' = 'backfill_migration'
)
AND is_premium = false;

-- 3. Вывести статистику
DO $$
DECLARE
  trial_count INTEGER;
  updated_profiles_count INTEGER;
BEGIN
  -- Подсчитать созданные trial подписки
  SELECT COUNT(*) INTO trial_count
  FROM subscriptions
  WHERE metadata->>'created_via' = 'backfill_migration';
  
  -- Подсчитать обновленные профили
  SELECT COUNT(*) INTO updated_profiles_count
  FROM profiles p
  JOIN subscriptions s ON s.user_id = p.id
  WHERE s.metadata->>'created_via' = 'backfill_migration'
    AND p.is_premium = true;
  
  RAISE NOTICE '✅ Backfill Trial Subscriptions Complete:';
  RAISE NOTICE '   - Created % trial subscriptions', trial_count;
  RAISE NOTICE '   - Updated % profiles to is_premium = true', updated_profiles_count;
  RAISE NOTICE '   - Trial duration: 14 days';
  RAISE NOTICE '   - End date: %', NOW() + INTERVAL '14 days';
END $$;

