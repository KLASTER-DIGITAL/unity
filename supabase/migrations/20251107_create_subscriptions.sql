-- Migration: Create subscriptions table for Premium Subscription Management
-- Created: 2025-11-07
-- Purpose: Store subscription history and manage premium access

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('monthly', 'yearly', 'lifetime')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT true,
    payment_method VARCHAR(50) CHECK (payment_method IN ('stripe', 'manual', 'promo')),
    amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at DESC);

-- Create composite index for active subscriptions query
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status) WHERE status = 'active';

-- Add RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
    ON subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Super admins can view all subscriptions
CREATE POLICY "Super admins can view all subscriptions"
    ON subscriptions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE users.id = auth.uid() 
            AND users.email IN ('diary@leadshunter.biz', 'admin@unity.com')
        )
    );

-- Policy: Super admins can insert subscriptions
CREATE POLICY "Super admins can insert subscriptions"
    ON subscriptions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE users.id = auth.uid() 
            AND users.email IN ('diary@leadshunter.biz', 'admin@unity.com')
        )
    );

-- Policy: Super admins can update subscriptions
CREATE POLICY "Super admins can update subscriptions"
    ON subscriptions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE users.id = auth.uid() 
            AND users.email IN ('diary@leadshunter.biz', 'admin@unity.com')
        )
    );

-- Policy: Super admins can delete subscriptions
CREATE POLICY "Super admins can delete subscriptions"
    ON subscriptions
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE users.id = auth.uid() 
            AND users.email IN ('diary@leadshunter.biz', 'admin@unity.com')
        )
    );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_updated_at();

-- Add comments for documentation
COMMENT ON TABLE subscriptions IS 'Stores subscription history and manages premium access';
COMMENT ON COLUMN subscriptions.id IS 'Unique identifier for the subscription';
COMMENT ON COLUMN subscriptions.user_id IS 'Reference to the user who owns this subscription';
COMMENT ON COLUMN subscriptions.plan_type IS 'Type of subscription plan: monthly, yearly, or lifetime';
COMMENT ON COLUMN subscriptions.status IS 'Current status: active, cancelled, expired, or pending';
COMMENT ON COLUMN subscriptions.start_date IS 'When the subscription starts';
COMMENT ON COLUMN subscriptions.end_date IS 'When the subscription ends (NULL for lifetime)';
COMMENT ON COLUMN subscriptions.auto_renew IS 'Whether the subscription auto-renews';
COMMENT ON COLUMN subscriptions.payment_method IS 'Payment method: stripe, manual, or promo';
COMMENT ON COLUMN subscriptions.amount IS 'Subscription amount';
COMMENT ON COLUMN subscriptions.currency IS 'Currency code (USD, EUR, etc.)';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'Stripe subscription ID for integration';
COMMENT ON COLUMN subscriptions.stripe_customer_id IS 'Stripe customer ID for integration';
COMMENT ON COLUMN subscriptions.metadata IS 'Additional metadata (promo code, notes, etc.)';
COMMENT ON COLUMN subscriptions.created_at IS 'Timestamp when the subscription was created';
COMMENT ON COLUMN subscriptions.updated_at IS 'Timestamp when the subscription was last updated';
COMMENT ON COLUMN subscriptions.created_by IS 'Admin who created this subscription';
COMMENT ON COLUMN subscriptions.updated_by IS 'Admin who last updated this subscription';

