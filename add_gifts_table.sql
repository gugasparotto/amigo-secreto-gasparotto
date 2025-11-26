-- Adicionar nova tabela de presentes
CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_gifts_user_id ON gifts(user_id);
