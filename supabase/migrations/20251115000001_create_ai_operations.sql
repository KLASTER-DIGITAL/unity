-- Migration: Create ai_operations table for AI Control Center
-- Date: 2025-11-15
-- Description: Централизованное управление AI операциями, промптами и моделями

-- Create ai_operations table
CREATE TABLE IF NOT EXISTS ai_operations (
  id TEXT PRIMARY KEY,                    -- 'entry_analysis', 'card_from_entry', etc.
  group_name TEXT NOT NULL,               -- 'cards', 'push', 'reports', 'coach'
  display_name TEXT NOT NULL,             -- Человекочитаемое имя для UI
  description TEXT NOT NULL,              -- Описание операции для супер-админа
  
  -- AI Model Configuration
  model TEXT NOT NULL,                    -- 'gpt-4o-mini', 'gpt-4o', etc.
  max_tokens INTEGER NOT NULL,            -- Максимальное количество токенов
  temperature REAL NOT NULL,              -- Temperature для AI (0.0 - 2.0)
  
  -- Prompts
  system_prompt TEXT NOT NULL,            -- System prompt для AI
  user_prompt_template TEXT NOT NULL,     -- User prompt template с плейсхолдерами
  
  -- Control Flags
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,  -- Включена ли операция
  extra_config JSONB DEFAULT '{}'::jsonb,    -- Дополнительные настройки (response_format, etc.)
  
  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries by group_name
CREATE INDEX IF NOT EXISTS idx_ai_operations_group_name ON ai_operations(group_name);

-- Create index for enabled operations
CREATE INDEX IF NOT EXISTS idx_ai_operations_enabled ON ai_operations(is_enabled) WHERE is_enabled = TRUE;

-- Enable Row Level Security
ALTER TABLE ai_operations ENABLE ROW LEVEL SECURITY;

-- Policy: Only super_admin can read ai_operations
CREATE POLICY "Super admin can read ai_operations"
  ON ai_operations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Policy: Only super_admin can insert ai_operations
CREATE POLICY "Super admin can insert ai_operations"
  ON ai_operations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Policy: Only super_admin can update ai_operations
CREATE POLICY "Super admin can update ai_operations"
  ON ai_operations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Policy: Only super_admin can delete ai_operations
CREATE POLICY "Super admin can delete ai_operations"
  ON ai_operations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_operations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at on every update
CREATE TRIGGER ai_operations_updated_at
  BEFORE UPDATE ON ai_operations
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_operations_updated_at();

-- Add comment to table
COMMENT ON TABLE ai_operations IS 'AI Control Center: централизованное управление AI операциями, промптами и моделями';

-- Add comments to columns
COMMENT ON COLUMN ai_operations.id IS 'Уникальный идентификатор операции (entry_analysis, card_from_entry, etc.)';
COMMENT ON COLUMN ai_operations.group_name IS 'Группа операции (cards, push, reports, coach)';
COMMENT ON COLUMN ai_operations.display_name IS 'Человекочитаемое имя для UI';
COMMENT ON COLUMN ai_operations.description IS 'Описание операции для супер-админа';
COMMENT ON COLUMN ai_operations.model IS 'AI модель (gpt-4o-mini, gpt-4o, etc.)';
COMMENT ON COLUMN ai_operations.max_tokens IS 'Максимальное количество токенов для ответа';
COMMENT ON COLUMN ai_operations.temperature IS 'Temperature для AI (0.0 - 2.0)';
COMMENT ON COLUMN ai_operations.system_prompt IS 'System prompt для AI';
COMMENT ON COLUMN ai_operations.user_prompt_template IS 'User prompt template с плейсхолдерами ({{user_name}}, {{entry_text}}, etc.)';
COMMENT ON COLUMN ai_operations.is_enabled IS 'Включена ли операция (можно отключить без удаления)';
COMMENT ON COLUMN ai_operations.extra_config IS 'Дополнительные настройки в JSON формате (response_format, top_p, etc.)';
COMMENT ON COLUMN ai_operations.updated_at IS 'Дата последнего обновления';
COMMENT ON COLUMN ai_operations.updated_by IS 'ID пользователя который последний раз обновил запись';
COMMENT ON COLUMN ai_operations.created_at IS 'Дата создания записи';

