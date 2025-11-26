-- Adicionar campos de login e atividade na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP;
