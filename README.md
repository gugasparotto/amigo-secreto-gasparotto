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
- Login com email e senha
- Redirecionamento automático:
  - Administradores → `/admin`
  - Usuários comuns → `/meu-amigo`

### 👨‍💼 Painel Administrativo (`/admin`)
- ✅ Cadastrar usuários (nome, email, senha)
- ✅ Listar todos os usuários
- ✅ Excluir usuários
- ✅ Realizar sorteio automático
- ✅ Validações para garantir sorteio justo

### 🎯 Área do Usuário (`/meu-amigo`)
- Ver quem tirou no amigo secreto
- Interface simples e clara

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
  is_admin BOOLEAN DEFAULT false
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
3. Escolha **Postgres**
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
  is_admin BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS draw_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  giver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(giver_id)
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

### Para os Participantes:
1. Acesse o site
2. Faça login com o email e senha fornecidos
3. Veja quem você tirou no amigo secreto
4. 🤫 Não conte para ninguém!

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

---

Feito com ❤️ para a família Gasparotto 🎄
