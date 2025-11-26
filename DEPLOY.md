# 🚀 Guia Rápido de Deploy

## Pré-requisitos
- Conta no GitHub
- Conta na Vercel (gratuita)

## 📝 Checklist de Deploy

### 1️⃣ Preparar Repositório
```bash
# Inicializar git (se ainda não foi feito)
git init
git add .
git commit -m "Initial commit - Sistema Amigo Secreto"

# Criar repositório no GitHub e subir o código
git remote add origin <URL-DO-SEU-REPO>
git push -u origin main
```

### 2️⃣ Criar Banco de Dados na Vercel
1. Acesse https://vercel.com/dashboard
2. Vá em **Storage** → **Create Database**
3. Escolha **Neon** (Serverless Postgres)
4. Nome: `amigo-secreto-db`
5. Região: escolha a mais próxima
6. Clique em **Create**

### 3️⃣ Configurar Banco de Dados
Após conectar o banco ao projeto:
1. Faça o deploy do projeto (passo 4)
2. Após o deploy, acesse: `https://SEU-PROJETO.vercel.app/api/setup`
3. Você verá uma mensagem de sucesso
4. **IMPORTANTE**: Delete o arquivo `app/api/setup/route.ts` e faça novo deploy

**OU** execute o SQL manualmente:
1. Clique em **Open in Neon** no banco
2. No console do Neon, execute o conteúdo de `schema.sql`

### 4️⃣ Deploy do Projeto
1. Dashboard Vercel → **Add New** → **Project**
2. Importe o repositório do GitHub
3. Configurações:
   - Framework: Next.js (detectado automaticamente)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Install Command: `npm install`

### 5️⃣ Configurar Variáveis de Ambiente
**Se você clicou em "Connect Project"**, as variáveis já foram configuradas automaticamente!

Caso contrário:
1. Na página do projeto → **Settings** → **Environment Variables**
2. Volte ao banco de dados
3. Copie todas as variáveis da aba **.env.local**
4. Cole no projeto
5. Adicione também:
   ```
   JWT_SECRET=amigo-secreto-2024-gasparotto-family
   ```

### 6️⃣ Conectar Banco ao Projeto
1. No banco de dados → **Settings** → **Connected Projects**
2. Conecte ao projeto criado
3. Isso sincroniza automaticamente as variáveis

### 7️⃣ Deploy!
1. Clique em **Deploy**
2. Aguarde ~2 minutos
3. Acesse a URL gerada

### 8️⃣ Testar
1. Abra a URL do projeto
2. Login: `admin@admin.com` / `admin`
3. Cadastre alguns usuários de teste
4. Realize um sorteio teste
5. Faça logout
6. Teste login com um usuário comum
7. Veja se aparece quem tirou

## ✅ Verificações Pós-Deploy

- [ ] Site abre corretamente
- [ ] Login de admin funciona
- [ ] Consegue cadastrar usuários
- [ ] Listagem de usuários aparece
- [ ] Consegue excluir usuários
- [ ] Sorteio funciona (com pelo menos 2 usuários)
- [ ] Login de usuário comum funciona
- [ ] Usuário comum vê quem tirou
- [ ] Logout funciona
- [ ] Site é responsivo no celular

## 🐛 Problemas Comuns

### Erro ao conectar no banco
- Verifique se as variáveis `POSTGRES_*` estão corretas
- Verifique se o banco está conectado ao projeto
- Vá em **Deployments** → **Function Logs** para ver erros

### Página não carrega
- Verifique se o build foi bem-sucedido
- Veja os logs de build
- Verifique se não há erros TypeScript

### Sorteio não funciona
- Verifique se tem pelo menos 2 usuários cadastrados
- Veja os logs da função no dashboard
- Verifique se a tabela `draw_results` existe

### Login não funciona
- Verifique se o usuário admin foi criado no banco
- Teste executar novamente o INSERT do `schema.sql`
- Verifique a variável `JWT_SECRET`

## 🔄 Atualizar o Site

Para fazer alterações após o deploy:

```bash
# Faça suas mudanças no código
git add .
git commit -m "Descrição das mudanças"
git push

# A Vercel vai fazer deploy automático!
```

## 📱 Compartilhar com a Família

Após o deploy bem-sucedido:

1. Copie a URL do site (ex: `amigo-secreto-gasparotto.vercel.app`)
2. Cadastre todos os participantes no painel admin
3. Envie para cada um:
   - URL do site
   - Email de login
   - Senha
4. Oriente a entrar e ver quem tirou
5. Lembre todos de manter segredo! 🤫

## 💡 Dicas

- **Domínio personalizado**: Na Vercel, vá em Settings → Domains
- **Trocar senha admin**: Use o painel para criar um novo admin e excluir o antigo
- **Refazer sorteio**: Pode fazer quantas vezes quiser, sobrescreve o anterior
- **Backup**: Exporte os dados do banco antes de refazer sorteio

## 🎉 Pronto!

Seu sistema de amigo secreto está no ar!

Acesse, cadastre a família e divirta-se! 🎄🎁
