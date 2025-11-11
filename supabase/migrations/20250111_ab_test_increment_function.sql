-- Create function to increment A/B test metrics atomically
-- This function is used by push-campaign-sender Edge Function

CREATE OR REPLACE FUNCTION increment_ab_test_metric(
  test_id UUID,
  metric_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate metric_name to prevent SQL injection
  IF metric_name NOT IN (
    'variant_a_sent',
    'variant_a_delivered',
    'variant_a_opened',
    'variant_a_clicked',
    'variant_b_sent',
    'variant_b_delivered',
    'variant_b_opened',
    'variant_b_clicked'
  ) THEN
    RAISE EXCEPTION 'Invalid metric name: %', metric_name;
  END IF;

  -- Increment the metric atomically
  EXECUTE format(
    'UPDATE push_ab_tests SET %I = COALESCE(%I, 0) + 1 WHERE id = $1',
    metric_name,
    metric_name
  ) USING test_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_ab_test_metric(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_ab_test_metric(UUID, TEXT) TO service_role;

-- Add comment
COMMENT ON FUNCTION increment_ab_test_metric IS 'Atomically increment A/B test metrics (sent, delivered, opened, clicked)';

