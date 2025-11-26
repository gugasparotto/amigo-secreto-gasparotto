# 🎁 Amigo Secreto - Família Gasparotto

Sistema completo de sorteio de amigo secreto desenvolvido com Next.js 16 e Vercel Postgres.

## 🚀 Tecnologias

- **Next.js 16** (App Router)
- **TypeScript**
- **Vercel Postgres** (banco de dados)
- **Bootstrap 5** (estilização)
- **Autenticação simples** (JWT em cookies)

## 📋 Funcionalidades

### 🔐 Sistema de Login
- Login com email e senha (case-insensitive)
- Redirecionamento automático:
  - Administradores → `/admin`
  - Usuários comuns → `/meu-amigo`
- Rastreamento automático de último acesso

### 👨‍💼 Painel Administrativo (`/admin`)
- ✅ Cadastrar usuários (nome, email, senha)
- ✅ Listar todos os usuários com status online/offline
- ✅ Visualizar último login de cada usuário
- ✅ Excluir usuários
- ✅ Realizar sorteio automático
- ✅ Limpar sorteio para refazer
- ✅ Visualizar resultados do sorteio (todos os pares)
- ✅ Atualização automática a cada 30 segundos
- ✅ Indicador visual de usuários online (últimos 5 minutos)

### 🎯 Área do Usuário (`/meu-amigo`)
- Ver quem tirou no amigo secreto
- Ver lista de sugestões de presentes do amigo secreto
- Cadastrar própria lista de desejos (presentes que gostaria de receber)
- Gerenciar lista de presentes (adicionar/remover itens)
- Adicionar nome, URL e descrição para cada presente
- Trocar senha da própria conta
- Ping automático para manter status online

## 🎲 Algoritmo do Sorteio

O algoritmo garante:
- ❌ **Ninguém tira a si mesmo**
- ✅ **Cada pessoa dá exatamente 1 presente**
- ✅ **Cada pessoa recebe exatamente 1 presente**
- ✅ **Funciona com qualquer número de pessoas** (mínimo 2)

Utiliza embaralhamento Fisher-Yates com validação e correção automática de conflitos.

## 🗄️ Estrutura do Banco de Dados

### Tabela `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  last_activity TIMESTAMP
);
```

### Tabela `draw_results`
```sql
CREATE TABLE draw_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(giver_id)
);
```

### Tabela `gifts`
```sql
CREATE TABLE gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📦 Instalação Local

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd amigo-secreto-gasparotto
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie o arquivo `.env.local` (já existe um exemplo):
```env
# Após criar o banco na Vercel, copie as variáveis aqui
POSTGRES_URL=""
POSTGRES_PRISMA_URL=""
POSTGRES_URL_NON_POOLING=""
POSTGRES_USER=""
POSTGRES_HOST=""
POSTGRES_PASSWORD=""
POSTGRES_DATABASE=""

# Secret para JWT (mude em produção)
JWT_SECRET="seu-secret-aleatorio-aqui"
```

### 4. Execute o projeto localmente
```bash
npm run dev
```

Acesse: `http://localhost:3000`

**Login inicial:** `admin@admin.com` / `admin`

## 🌐 Deploy na Vercel (Gratuito)

### Passo 1: Crie uma conta na Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Crie uma conta (pode usar GitHub)

### Passo 2: Crie o banco de dados Postgres
1. No dashboard da Vercel, vá em **Storage**
2. Clique em **Create Database**
3. Escolha **Neon** (Serverless Postgres)
4. Escolha a região mais próxima
5. Dê um nome (ex: `amigo-secreto-db`)
6. Clique em **Create**

### Passo 3: Execute o SQL para criar as tabelas
1. Vá na aba **Data** do banco criado
2. Clique em **Query**
3. Cole e execute o conteúdo do arquivo `schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  last_activity TIMESTAMP
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

INSERT INTO users (name, email, password, is_admin) 
VALUES ('Administrador', 'admin@admin.com', 'admin', true)
ON CONFLICT (email) DO NOTHING;
```

### Passo 4: Deploy do projeto
1. No dashboard da Vercel, clique em **Add New** → **Project**
2. Importe seu repositório do GitHub (ou faça upload)
3. Configure o projeto:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

### Passo 5: Configure as variáveis de ambiente
1. Na página de configuração do projeto, vá em **Environment Variables**
2. No banco de dados criado, vá em **Settings** → **.env.local**
3. Copie todas as variáveis `POSTGRES_*`
4. Cole no projeto da Vercel
5. Adicione também:
   ```
   JWT_SECRET=sua-chave-secreta-aleatoria-aqui
   ```
6. Clique em **Deploy**

### Passo 6: Conecte o banco ao projeto
1. Volte ao banco de dados na Vercel
2. Vá em **Settings** → **Connected Projects**
3. Conecte ao projeto que você criou
4. As variáveis serão sincronizadas automaticamente

### Passo 7: Teste o site
1. Aguarde o deploy finalizar
2. Acesse a URL fornecida pela Vercel (ex: `amigo-secreto.vercel.app`)
3. Faça login com: `admin@admin.com` / `admin`
4. Pronto! 🎉

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção local
npm start

# Lint
npm run lint
```

## 📱 Como Usar

### Para o Administrador:
1. Faça login com suas credenciais de admin
2. Cadastre todos os participantes (nome, email, senha)
3. Quando todos estiverem cadastrados, clique em **Realizar Sorteio**
4. Avise os participantes para fazerem login
5. Acompanhe quem está online e quando fizeram último login
6. Use **Ver Resultados** para consultar todos os pares (se necessário)
7. Use **Limpar Sorteio** para desfazer e realizar novo sorteio

### Para os Participantes:
1. Acesse o site
2. Faça login com o email e senha fornecidos
3. Cadastre sua lista de desejos (presentes que gostaria de receber)
4. Veja quem você tirou no amigo secreto
5. Consulte a lista de presentes sugeridos pela pessoa que você tirou
6. Troque sua senha se desejar
7. 🤫 Não conte para ninguém!

## 🎁 Sistema de Lista de Presentes

Cada participante pode:
- Cadastrar quantos presentes quiser na sua lista de desejos
- Adicionar nome (obrigatório), URL do produto e descrição
- Editar ou remover presentes da lista
- Ver a lista de presentes de quem tirou

URLs são automaticamente formatadas com `https://` se necessário.

## 🔒 Segurança

⚠️ **Importante:** Este projeto usa autenticação simplificada (senhas em texto puro). Para ambientes de produção real, considere:
- Hash de senhas (bcrypt)
- HTTPS obrigatório
- Rate limiting
- Validação mais robusta

Para uso familiar/privado está adequado.

## 📄 Licença

Projeto de uso pessoal - Família Gasparotto

## 🤝 Suporte

Em caso de dúvidas:
1. Verifique se o banco de dados está conectado
2. Confira as variáveis de ambiente
3. Veja os logs de erro na Vercel (aba **Deployments** → **Function Logs**)

## 🆕 Changelog

### Funcionalidades Adicionadas Pós-Lançamento:
- ✅ **Remoção de credenciais expostas** na tela de login
- ✅ **Sistema de troca de senha** para usuários
- ✅ **Botão Limpar Sorteio** para administradores
- ✅ **Botão Ver Resultados** para visualizar todos os pares do sorteio
- ✅ **Sistema de Lista de Presentes** completo:
  - Cadastro ilimitado de presentes
  - Campos: nome, URL, descrição
  - Auto-formatação de URLs (adiciona https://)
  - Links clicáveis para produtos externos
- ✅ **Login case-insensitive** (aceita maiúsculas/minúsculas)
- ✅ **Rastreamento de atividade de usuários**:
  - Timestamp de último login
  - Indicador de status online/offline
  - Atualização automática a cada 30 segundos no painel admin
  - Sistema de ping para manter usuários online
  - Badge visual verde para usuários ativos nos últimos 5 minutos

---

Feito com ❤️ para a família Gasparotto 🎄
