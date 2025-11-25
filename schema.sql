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

-- Criar um usuário admin inicial (email: admin@admin.com, senha: admin)
INSERT INTO users (name, email, password, is_admin) 
VALUES ('Administrador', 'admin@admin.com', 'admin', true)
ON CONFLICT (email) DO NOTHING;
