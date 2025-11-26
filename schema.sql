-- Script SQL para criar as tabelas no Vercel Postgres
-- Execute este script no dashboard da Vercel ou via CLI

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS draw_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(giver_id)
);

CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gifts_user_id ON gifts(user_id);

-- Criar um usuário admin inicial (email: admin@admin.com, senha: admin)
INSERT INTO users (name, email, password, is_admin) 
VALUES ('Administrador', 'admin@admin.com', 'admin', true)
ON CONFLICT (email) DO NOTHING;
