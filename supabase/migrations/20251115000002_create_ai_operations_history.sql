-- Migration: Create ai_operations_history table for versioning
-- Date: 2025-11-15
-- Description: Версионирование изменений AI операций для отката и аудита

-- Create ai_operations_history table
CREATE TABLE IF NOT EXISTS ai_operations_history (
  id BIGSERIAL PRIMARY KEY,
  operation_id TEXT NOT NULL,             -- ID операции из ai_operations
  snapshot JSONB NOT NULL,                -- Полный snapshot операции до изменения
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create index for faster queries by operation_id
CREATE INDEX IF NOT EXISTS idx_ai_operations_history_operation_id ON ai_operations_history(operation_id);

-- Create index for faster queries by created_at (для сортировки по дате)
CREATE INDEX IF NOT EXISTS idx_ai_operations_history_created_at ON ai_operations_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE ai_operations_history ENABLE ROW LEVEL SECURITY;

-- Policy: Only super_admin can read ai_operations_history
CREATE POLICY "Super admin can read ai_operations_history"
  ON ai_operations_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Policy: Only super_admin can insert ai_operations_history
CREATE POLICY "Super admin can insert ai_operations_history"
  ON ai_operations_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Function to automatically save history before update
CREATE OR REPLACE FUNCTION save_ai_operation_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Сохраняем старую версию в историю
  INSERT INTO ai_operations_history (operation_id, snapshot, created_by)
  VALUES (
    OLD.id,
    row_to_json(OLD)::jsonb,
    auth.uid()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to save history before every update
CREATE TRIGGER ai_operations_save_history
  BEFORE UPDATE ON ai_operations
  FOR EACH ROW
  EXECUTE FUNCTION save_ai_operation_history();

-- Function to restore operation from history
CREATE OR REPLACE FUNCTION restore_ai_operation_from_history(
  p_history_id BIGINT
)
RETURNS JSONB AS $$
DECLARE
  v_snapshot JSONB;
  v_operation_id TEXT;
BEGIN
  -- Проверяем права доступа
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: only super_admin can restore operations';
  END IF;

  -- Получаем snapshot из истории
  SELECT snapshot, operation_id
  INTO v_snapshot, v_operation_id
  FROM ai_operations_history
  WHERE id = p_history_id;

  IF v_snapshot IS NULL THEN
    RAISE EXCEPTION 'History record not found: %', p_history_id;
  END IF;

  -- Обновляем операцию из snapshot
  UPDATE ai_operations
  SET
    group_name = v_snapshot->>'group_name',
    display_name = v_snapshot->>'display_name',
    description = v_snapshot->>'description',
    model = v_snapshot->>'model',
    max_tokens = (v_snapshot->>'max_tokens')::INTEGER,
    temperature = (v_snapshot->>'temperature')::REAL,
    system_prompt = v_snapshot->>'system_prompt',
    user_prompt_template = v_snapshot->>'user_prompt_template',
    is_enabled = (v_snapshot->>'is_enabled')::BOOLEAN,
    extra_config = COALESCE(v_snapshot->'extra_config', '{}'::jsonb),
    updated_at = NOW(),
    updated_by = auth.uid()
  WHERE id = v_operation_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'operation_id', v_operation_id,
    'restored_from_history_id', p_history_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON TABLE ai_operations_history IS 'История изменений AI операций для версионирования и отката';
COMMENT ON COLUMN ai_operations_history.id IS 'Уникальный ID записи истории';
COMMENT ON COLUMN ai_operations_history.operation_id IS 'ID операции из ai_operations';
COMMENT ON COLUMN ai_operations_history.snapshot IS 'Полный snapshot операции до изменения в JSON формате';
COMMENT ON COLUMN ai_operations_history.created_at IS 'Дата создания записи истории';
COMMENT ON COLUMN ai_operations_history.created_by IS 'ID пользователя который сделал изменение';

COMMENT ON FUNCTION save_ai_operation_history() IS 'Автоматически сохраняет историю перед обновлением ai_operations';
COMMENT ON FUNCTION restore_ai_operation_from_history(BIGINT) IS 'Восстанавливает операцию из истории по ID записи истории';

