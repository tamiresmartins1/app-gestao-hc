# 🚀 Guia de Deploy - APP GESTÃO HC

## Opções de Deploy

Este guia mostra como deployar a aplicação completa na nuvem.

### Frontend: Netlify ✅
### Backend: Render ou Vercel
### Database: Opções incluídas

---

## 📋 Pré-requisitos

Você vai precisar de:
- Conta GitHub (grátis)
- Conta Netlify (grátis)
- Conta Render ou Vercel (grátis)

---

## PARTE 1: Preparar o GitHub

### Passo 1: Criar repositório GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `app-gestao-hc`
3. Descrição: "Sistema de gestão de tarefas para equipes de saúde"
4. Escolha **Public** (necessário para plano gratuito)
5. Clique em "Create repository"

### Passo 2: Fazer upload do código

```bash
cd C:\Users\mizae\Downloads\APP GESTAO HC

# Inicializar git
git init
git config user.name "Seu Nome"
git config user.email "seu.email@example.com"

# Adicionar arquivos
git add .

# Criar primeiro commit
git commit -m "Initial commit: APP GESTAO HC completo"

# Adicionar remote
git remote add origin https://github.com/SEU_USUARIO/app-gestao-hc.git

# Fazer push
git branch -M main
git push -u origin main
```

**Substitua `SEU_USUARIO` pelo seu usuário GitHub.**

---

## PARTE 2: Deploy do Frontend (Netlify)

### Passo 1: Acessar Netlify

1. Vá para https://netlify.com
2. Clique em "Sign up"
3. Escolha "GitHub"
4. Authorize Netlify
5. Crie sua conta

### Passo 2: Deploy automático

1. Após fazer login, clique em "Add new site"
2. Escolha "Connect to Git"
3. Selecione "GitHub"
4. Procure por `app-gestao-hc`
5. Clique em "Deploy site"

### Passo 3: Configurar build

Quando perguntar sobre as configurações:

- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`

Clique em "Deploy site"

### Passo 4: Configurar variáveis de ambiente

1. Vá para "Site settings"
2. Clique em "Environment"
3. Clique em "Add environment variables"
4. Adicione:

```
VITE_API_URL=https://seu-backend.herokuapp.com
```

(Você vai preencher a URL do backend no próximo passo)

---

## PARTE 3: Deploy do Backend

Você tem 2 opções principais:

### OPÇÃO A: Render (Recomendado)

#### Passo 1: Preparar o backend

Crie um arquivo `backend/Procfile`:

```
web: node server.js
```

#### Passo 2: Acessar Render

1. Vá para https://render.com
2. Clique em "Sign up"
3. Escolha "GitHub"
4. Authorize Render
5. Crie sua conta

#### Passo 3: Criar novo Web Service

1. No dashboard, clique em "New +"
2. Escolha "Web Service"
3. Selecione o repositório `app-gestao-hc`
4. Preencha:
   - **Name**: `app-gestao-hc-backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `cd backend && npm start`

#### Passo 4: Adicionar variáveis

Na seção "Environment", adicione:

```
PORT=3000
NODE_ENV=production
DATABASE_URL=file:./app_gestao.db
```

#### Passo 5: Deploy

Clique em "Create Web Service"

**Aguarde 3-5 minutos para o deploy terminar.**

Quando terminar, você verá uma URL como: `https://app-gestao-hc-backend.onrender.com`

### OPÇÃO B: Vercel

#### Passo 1: Acessar Vercel

1. Vá para https://vercel.com
2. Clique em "Sign up"
3. Escolha "GitHub"
4. Authorize Vercel

#### Passo 2: Importar projeto

1. Clique em "Add New..."
2. Escolha "Project"
3. Selecione `app-gestao-hc`

#### Passo 3: Configurar build

- **Framework Preset**: Other
- **Build Command**: `cd backend && npm install && npm start`
- **Output Directory**: `backend`

#### Passo 4: Adicionar variáveis

```
PORT=3000
NODE_ENV=production
```

---

## PARTE 4: Conectar Frontend ao Backend

### Depois que o backend estiver deployado:

1. Copie a URL do backend (ex: `https://app-gestao-hc-backend.onrender.com`)

2. No Netlify:
   - Vá para "Site settings"
   - "Environment"
   - Mude `VITE_API_URL` para sua URL do backend

3. Redeploye o frontend:
   - Vá para "Deploys"
   - Clique em "Trigger deploy"
   - "Deploy site"

---

## PARTE 5: Atualizar CORS no Backend

No arquivo `backend/server.js`, mude:

```javascript
app.use(cors());
```

Para:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',  // Desenvolvimento local
    'https://seu-frontend.netlify.app'  // URL do Netlify
  ],
  credentials: true
}));
```

**Substitua `seu-frontend` pela URL do seu Netlify.**

---

## Banco de Dados em Produção

### SQLite (Atual - para testes)
✅ Funciona com Render e Vercel
✅ Dados salvos no servidor
⚠️ Performance limitada

### PostgreSQL (Recomendado para produção)

Se quiser usar PostgreSQL:

1. Crie um banco em https://www.elephantsql.com (grátis)
2. Copie a URL de conexão
3. No backend, instale: `npm install pg pg-promise`
4. Atualize `backend/db.js` para usar PostgreSQL

**Por enquanto, SQLite é suficiente para testes.**

---

## URLs Finais

Após fazer deploy com sucesso:

- **Frontend**: `https://seu-nome.netlify.app`
- **Backend**: `https://app-gestao-hc-backend.onrender.com`

Acesse o frontend URL no navegador!

---

## ✅ Checklist de Deploy

- [ ] Repositório criado no GitHub
- [ ] Código enviado para GitHub (git push)
- [ ] Frontend deployed no Netlify
- [ ] Backend deployed no Render/Vercel
- [ ] URLs finais testadas
- [ ] CORS configurado corretamente
- [ ] Variáveis de ambiente adicionadas
- [ ] Frontend e backend se comunicam

---

## 🐛 Troubleshooting

### "Build failed on Netlify"
1. Verifique se `frontend/package.json` existe
2. Verifique se o `vite.config.js` está correto
3. Verifique variáveis de ambiente

### "Backend não responde"
1. Verifique a URL no Netlify
2. Verifique se o backend está rodando (`curl URL/api/health`)
3. Verifique logs no Render/Vercel

### "CORS error"
1. Verifique a URL do frontend em `server.js`
2. Certifique-se que o backend foi redeployado
3. Limpe cache do navegador (Ctrl+Shift+Del)

### "Database error"
1. Verifique se `app_gestao.db` foi criado
2. Verifique permissões de escrita
3. Resete o banco: delete `app_gestao.db`

---

## Próximas Melhorias

Para produção:

- [ ] Implementar autenticação real (JWT)
- [ ] Migrar para PostgreSQL
- [ ] Adicionar HTTPS
- [ ] Configurar CDN para imagens
- [ ] Adicionar monitoramento (Sentry)
- [ ] Implementar logs estruturados
- [ ] Configurar backup automático

---

## Links Úteis

- **Netlify**: https://netlify.com
- **Render**: https://render.com
- **Vercel**: https://vercel.com
- **GitHub**: https://github.com
- **ElephantSQL**: https://www.elephantsql.com

---

## Suporte

Se tiver problemas:

1. Verifique os logs no Netlify/Render/Vercel
2. Teste localmente: `npm run dev` (backend e frontend)
3. Verifique se Node.js está atualizado
4. Tente fazer deploy novamente

**Sucesso no deploy! 🚀**
