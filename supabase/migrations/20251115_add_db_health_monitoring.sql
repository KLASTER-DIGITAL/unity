-- Database Health Monitoring
-- Created: 2025-11-15
-- Purpose: Мониторинг здоровья БД для раннего обнаружения проблем при масштабировании до 100K пользователей

-- =====================================================
-- 1. Функция для получения метрик здоровья БД
-- =====================================================

CREATE OR REPLACE FUNCTION get_db_health_metrics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  db_size_mb NUMERIC;
  active_conns INTEGER;
  idle_conns INTEGER;
  max_conns INTEGER;
  cache_hit_ratio NUMERIC;
  index_hit_ratio NUMERIC;
  table_bloat_ratio NUMERIC;
  deadlocks_count INTEGER;
  slow_queries_count INTEGER;
BEGIN
  -- Database size in MB
  SELECT 
    ROUND(pg_database_size(current_database()) / 1024.0 / 1024.0, 2)
  INTO db_size_mb;

  -- Connection statistics
  SELECT 
    COUNT(*) FILTER (WHERE state = 'active'),
    COUNT(*) FILTER (WHERE state = 'idle'),
    setting::INTEGER
  INTO active_conns, idle_conns, max_conns
  FROM pg_stat_activity
  CROSS JOIN pg_settings
  WHERE pg_settings.name = 'max_connections';

  -- Cache hit ratio (should be > 99%)
  SELECT 
    ROUND(
      100.0 * sum(blks_hit) / NULLIF(sum(blks_hit) + sum(blks_read), 0),
      2
    )
  INTO cache_hit_ratio
  FROM pg_stat_database
  WHERE datname = current_database();

  -- Index hit ratio (should be > 95%)
  SELECT 
    ROUND(
      100.0 * sum(idx_blks_hit) / NULLIF(sum(idx_blks_hit) + sum(idx_blks_read), 0),
      2
    )
  INTO index_hit_ratio
  FROM pg_statio_user_indexes;

  -- Table bloat ratio (approximate)
  SELECT 
    ROUND(
      AVG(
        CASE 
          WHEN pg_total_relation_size(schemaname||'.'||tablename) > 0
          THEN 100.0 * (pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) 
               / pg_total_relation_size(schemaname||'.'||tablename)
          ELSE 0
        END
      ),
      2
    )
  INTO table_bloat_ratio
  FROM pg_tables
  WHERE schemaname = 'public';

  -- Deadlocks count (from pg_stat_database)
  SELECT deadlocks
  INTO deadlocks_count
  FROM pg_stat_database
  WHERE datname = current_database();

  -- Slow queries count (queries > 1 second)
  SELECT COUNT(*)
  INTO slow_queries_count
  FROM pg_stat_activity
  WHERE state = 'active'
    AND query_start < NOW() - INTERVAL '1 second'
    AND query NOT LIKE '%pg_stat_activity%';

  -- Build JSON result
  result := json_build_object(
    'timestamp', NOW(),
    'database', current_database(),
    'size_mb', db_size_mb,
    'connections', json_build_object(
      'active', active_conns,
      'idle', idle_conns,
      'max', max_conns,
      'usage_percent', ROUND(100.0 * (active_conns + idle_conns) / max_conns, 2)
    ),
    'cache', json_build_object(
      'hit_ratio', cache_hit_ratio,
      'status', CASE 
        WHEN cache_hit_ratio >= 99 THEN 'healthy'
        WHEN cache_hit_ratio >= 95 THEN 'warning'
        ELSE 'critical'
      END
    ),
    'indexes', json_build_object(
      'hit_ratio', index_hit_ratio,
      'status', CASE 
        WHEN index_hit_ratio >= 95 THEN 'healthy'
        WHEN index_hit_ratio >= 90 THEN 'warning'
        ELSE 'critical'
      END
    ),
    'bloat', json_build_object(
      'ratio', table_bloat_ratio,
      'status', CASE 
        WHEN table_bloat_ratio < 20 THEN 'healthy'
        WHEN table_bloat_ratio < 40 THEN 'warning'
        ELSE 'critical'
      END
    ),
    'performance', json_build_object(
      'deadlocks', deadlocks_count,
      'slow_queries', slow_queries_count,
      'status', CASE 
        WHEN deadlocks_count = 0 AND slow_queries_count < 5 THEN 'healthy'
        WHEN deadlocks_count < 10 AND slow_queries_count < 20 THEN 'warning'
        ELSE 'critical'
      END
    )
  );

  RETURN result;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION get_db_health_metrics() TO service_role;

-- =====================================================
-- 2. Таблица для хранения истории метрик (опционально)
-- =====================================================

CREATE TABLE IF NOT EXISTS db_health_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metrics JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index для быстрого поиска по дате
CREATE INDEX IF NOT EXISTS idx_db_health_history_created_at 
ON db_health_history(created_at DESC);

-- RLS: только service role может читать/писать
ALTER TABLE db_health_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can read db_health_history"
ON db_health_history FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Service role can insert db_health_history"
ON db_health_history FOR INSERT
TO service_role
WITH CHECK (true);

-- Автоматический cleanup старых записей (хранить только 30 дней)
CREATE OR REPLACE FUNCTION cleanup_db_health_history()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM db_health_history
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

GRANT EXECUTE ON FUNCTION cleanup_db_health_history() TO service_role;

