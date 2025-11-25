# 📁 Estrutura do Projeto

```
amigo-secreto-gasparotto/
├── app/                          # App Router do Next.js
│   ├── layout.tsx               # Layout raiz com Bootstrap CDN
│   ├── globals.css              # Estilos globais
│   ├── page.tsx                 # Página de login (/)
│   │
│   ├── admin/                   # Área administrativa
│   │   ├── page.tsx            # Dashboard do admin
│   │   └── api/                # APIs exclusivas do admin
│   │       ├── create-user/
│   │       │   └── route.ts   # POST - Criar usuário
│   │       ├── delete-user/
│   │       │   └── route.ts   # DELETE - Excluir usuário
│   │       ├── draw/
│   │       │   └── route.ts   # POST - Realizar sorteio
│   │       └── users/
│   │           └── route.ts   # GET - Listar usuários
│   │
│   ├── meu-amigo/              # Área do usuário
│   │   └── page.tsx            # Ver amigo secreto
│   │
│   └── api/                    # APIs públicas
│       ├── login/
│       │   └── route.ts       # POST - Fazer login
│       ├── logout/
│       │   └── route.ts       # POST - Fazer logout
│       ├── me/
│       │   └── route.ts       # GET - Dados do usuário logado
│       └── secret-friend/
│           └── route.ts       # GET - Quem o usuário tirou
│
├── lib/                        # Bibliotecas e utilitários
│   ├── db.ts                  # Conexão com Vercel Postgres
│   └── auth.ts                # Sistema de autenticação JWT
│
├── schema.sql                  # Script SQL das tabelas
├── .env.local                 # Variáveis de ambiente (não commitar)
├── next.config.ts             # Configuração do Next.js
├── package.json               # Dependências
├── tsconfig.json              # Configuração TypeScript
└── README.md                  # Documentação

```

## 🔑 Principais Componentes

### `/app/page.tsx` - Login
- Client component com formulário de login
- Valida credenciais via API `/api/login`
- Redireciona para `/admin` ou `/meu-amigo`

### `/app/admin/page.tsx` - Painel Admin
- Verifica permissões de admin
- Form para cadastrar usuários
- Tabela listando usuários
- Botão para realizar sorteio

### `/app/meu-amigo/page.tsx` - Área do Usuário
- Mostra quem a pessoa tirou
- Protegido por autenticação
- Layout simples e responsivo

### `/lib/auth.ts` - Autenticação
- `createToken()` - Gera token JWT simples
- `verifyToken()` - Valida token
- `getCurrentUser()` - Pega usuário logado
- `requireAuth()` - Middleware para rotas protegidas
- `requireAdmin()` - Middleware para rotas de admin

### `/lib/db.ts` - Banco de Dados
- Exporta conexão com Vercel Postgres
- Usa `@vercel/postgres`

## 🎯 Fluxo de Autenticação

1. Usuário faz login em `/`
2. API `/api/login` valida credenciais
3. Token JWT é criado e salvo em cookie HttpOnly
4. Redirecionamento baseado em `is_admin`:
   - Admin → `/admin`
   - Usuário → `/meu-amigo`
5. Cada rota protegida verifica o token

## 🎲 Algoritmo do Sorteio

Localizado em: `/app/admin/api/draw/route.ts`

**Função:** `shuffleSecretSanta(userIds: string[])`

**Lógica:**
1. Embaralha array de receivers (Fisher-Yates)
2. Itera pelos givers e receivers
3. Se giver === receiver, procura alguém para trocar
4. Valida que ninguém tirou a si mesmo
5. Retorna Map<giverId, receiverId>
6. Salva no banco em `draw_results`

**Garantias:**
- Ninguém tira a si mesmo
- Todos dão exatamente 1
- Todos recebem exatamente 1
- Máximo 100 tentativas para evitar loop infinito

## 🔐 Segurança Implementada

✅ Tokens JWT em cookies HttpOnly
✅ Validação de permissões em todas as APIs
✅ Proteção de rotas no frontend
✅ Foreign keys com cascade delete
✅ Unique constraints no banco

⚠️ **Não implementado** (OK para uso familiar):
- Hash de senhas
- Rate limiting
- CSRF protection
- Password strength validation

## 🎨 Estilização

- **Bootstrap 5.3.2** via CDN
- Gradiente roxo no background
- Cards com sombra
- Design responsivo
- Componentes padrão do Bootstrap

## 📊 Rotas da API

| Método | Rota | Proteção | Descrição |
|--------|------|----------|-----------|
| POST | `/api/login` | Público | Login |
| POST | `/api/logout` | Público | Logout |
| GET | `/api/me` | Autenticado | Dados do usuário |
| GET | `/api/secret-friend` | Autenticado | Quem tirou |
| GET | `/admin/api/users` | Admin | Listar usuários |
| POST | `/admin/api/create-user` | Admin | Criar usuário |
| DELETE | `/admin/api/delete-user` | Admin | Excluir usuário |
| POST | `/admin/api/draw` | Admin | Realizar sorteio |

## 🚀 Próximos Passos

1. Faça o deploy na Vercel seguindo o README.md
2. Configure o banco de dados Postgres
3. Execute o script SQL (`schema.sql`)
4. Configure as variáveis de ambiente
5. Teste o login com admin@admin.com / admin
6. Cadastre os participantes
7. Realize o sorteio!
