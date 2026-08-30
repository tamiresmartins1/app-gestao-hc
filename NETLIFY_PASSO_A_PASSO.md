# 🚀 Deploy no Netlify - Guia Passo a Passo

## 📌 Visão Geral

Vamos fazer o deploy em 3 etapas:

1. **GitHub**: Enviar o código para o GitHub
2. **Backend**: Deploy do servidor (Render)
3. **Frontend**: Deploy do site (Netlify)

Total de tempo: ~15 minutos

---

## ETAPA 1: GitHub

### Passo 1.1: Criar conta GitHub

1. Acesse https://github.com/signup
2. Preencha email, senha, username
3. Clique em "Create account"
4. Valide seu email

### Passo 1.2: Criar repositório

1. Após criar conta, vá para https://github.com/new
2. **Repository name**: `app-gestao-hc`
3. **Description**: "Sistema de gestão de tarefas para equipes de saúde"
4. Escolha **Public** (importante para plano gratuito)
5. ✓ Initialize with .gitignore (opcional)
6. Clique em **"Create repository"**

### Passo 1.3: Fazer upload do código (Windows)

Abra **Prompt de Comando (CMD)** e execute:

```bash
cd C:\Users\mizae\Downloads\APP GESTAO HC

git init
git config user.name "Seu Nome"
git config user.email "seu.email@gmail.com"
git add .
git commit -m "Initial commit: APP GESTAO HC"
git branch -M main
git remote add origin https://github.com/SEU_USERNAME/app-gestao-hc.git
git push -u origin main
```

**Substitua:**
- `Seu Nome` pelo seu nome
- `seu.email@gmail.com` pelo seu email
- `SEU_USERNAME` pelo seu username GitHub

**Será pedida sua senha do GitHub. Se falhar, use um Personal Access Token:**

1. Vá para https://github.com/settings/tokens
2. Clique em "Generate new token"
3. Marque `repo`
4. Clique em "Generate token"
5. Copie o token
6. Use o token como senha

✅ Pronto! Seu código está no GitHub.

---

## ETAPA 2: Backend (Render)

### Por que Render?

- ✅ Gratuito
- ✅ Suporta Node.js
- ✅ Deploy automático do GitHub
- ✅ Banco de dados SQLite funciona
- ✅ Sem necessidade de cartão de crédito

### Passo 2.1: Acessar Render

1. Vá para https://render.com
2. Clique em **"Get started"** ou **"Sign up"**
3. Escolha **"GitHub"**
4. Clique em **"Authorize render-ack"**
5. Faça login no GitHub
6. Autorize o Render

### Passo 2.2: Criar Web Service

1. No dashboard do Render, clique em **"New +"**
2. Escolha **"Web Service"**
3. Se for a primeira vez, conecte seu repositório GitHub
4. Selecione o repositório **`app-gestao-hc`**
5. Clique em **"Connect"**

### Passo 2.3: Configurar deploy

Preencha os campos:

| Campo | Valor |
|-------|-------|
| **Name** | `app-gestao-hc-backend` |
| **Environment** | Node |
| **Region** | `Oregon (US West)` ou próximo |
| **Branch** | `main` |
| **Build Command** | `cd backend && npm install` |
| **Start Command** | `node backend/server.js` |
| **Plan** | Free (gratuito) |

### Passo 2.4: Adicionar variáveis de ambiente

1. Role para baixo até "Environment"
2. Clique em **"Add Environment Variable"**
3. Adicione:

```
PORT = 10000
NODE_ENV = production
```

4. Clique em **"Create Web Service"**

**Aguarde 3-5 minutos para o deploy terminar.**

Você verá: ✅ Deploy successful

### Passo 2.5: Copiar URL do backend

Você verá uma URL como:
```
https://app-gestao-hc-backend.onrender.com
```

**Copie essa URL!** Você vai usar no próximo passo.

---

## ETAPA 3: Frontend (Netlify)

### Passo 3.1: Acessar Netlify

1. Vá para https://netlify.com
2. Clique em **"Sign up"**
3. Escolha **"GitHub"**
4. Clique em **"Authorize Netlify"**
5. Faça login no GitHub
6. Autorize o Netlify

### Passo 3.2: Deploy automático

1. No dashboard do Netlify, clique em **"Add new site"**
2. Escolha **"Import an existing project"**
3. Selecione **"GitHub"**
4. Procure por **`app-gestao-hc`**
5. Clique em **"app-gestao-hc"**

### Passo 3.3: Configurar build

Preencha:

| Campo | Valor |
|-------|-------|
| **Base directory** | `frontend` |
| **Build command** | `npm run build` |
| **Publish directory** | `frontend/dist` |

Clique em **"Deploy site"**

**Aguarde 2-3 minutos para o deploy terminar.**

### Passo 3.4: Adicionar URL do backend

1. No Netlify, vá para **"Site settings"**
2. Clique em **"Environment"** (no menu esquerdo)
3. Clique em **"Add environment variable"**
4. Adicione:

```
VITE_API_URL = https://app-gestao-hc-backend.onrender.com
```

Use a URL que você copiou na Etapa 2, Passo 2.5.

5. Clique em **"Save"**

### Passo 3.5: Redeploye (importante!)

1. Volte para **"Deploys"**
2. Clique em **"Trigger deploy"**
3. Escolha **"Deploy site"**

**Aguarde 1-2 minutos.**

---

## ✅ PRONTO!

Seu app está no ar! 🎉

### URLs finais:

- **Frontend**: Vá para Netlify > Site settings > Site details > Site URL
  - Exemplo: `https://seu-site.netlify.app`

- **Backend**: Vá para Render > app-gestao-hc-backend > Environment
  - Exemplo: `https://app-gestao-hc-backend.onrender.com`

### Testar o app:

1. Abra a URL do frontend em seu navegador
2. Clique em "+ Novo Membro" e crie alguns membros
3. Clique em "Minhas Tarefas" e crie uma tarefa
4. Se funcionar, o deploy foi sucesso! ✅

---

## 🔄 Atualizar o app no futuro

Sempre que você fizer mudanças:

1. Abra CMD
2. Vá para a pasta: `cd C:\Users\mizae\Downloads\APP GESTAO HC`
3. Execute:

```bash
git add .
git commit -m "Descrição das mudanças"
git push origin main
```

**O Netlify e Render farão o deploy automaticamente!** ✅

---

## 🐛 Troubleshooting

### "Build failed" no Netlify

**Solução**: Verifique se existe `frontend/package.json`

```bash
cd frontend
npm install
npm run build
```

Se funcionar localmente, o problema é outro.

### "Cannot GET /" no frontend

**Solução**: Netlify não encontrou o arquivo `frontend/dist/index.html`

1. Abra o Netlify
2. Vá para **Site settings**
3. **Build & Deploy > Environment**
4. Verifique se `VITE_API_URL` está configurada

### Frontend não conecta ao backend

**Solução**:

1. Copie a URL do Render
2. No Netlify, vá para **Environment**
3. Atualize `VITE_API_URL` com a URL correta
4. Clique em **Redeploy**

### Erro CORS no console

**Solução**: O backend precisa aceitar a URL do Netlify

1. Abra `backend/server.js`
2. Procure por `corsOrigins`
3. Certifique-se que tem `netlify\.app`
4. Faça push para GitHub: `git add . && git commit -m "Fix CORS" && git push`
5. Aguarde o Render fazer redeploy automático

---

## 📱 Testar no celular

1. Copie a URL do Netlify
2. Abra em seu celular
3. Vá para Settings > Home screen (iOS) ou Add to home screen (Android)
4. Agora terá um ícone como app nativo!

---

## 🎯 Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Código enviado para GitHub (`git push`)
- [ ] Backend deployado no Render
- [ ] Frontend deployado no Netlify
- [ ] Variável `VITE_API_URL` configurada
- [ ] Frontend redeployado após configurar URL
- [ ] App testado no navegador
- [ ] Nenhum erro CORS no console
- [ ] Tarefas salvam corretamente

---

## 🚀 Sucesso!

Seu app está agora na nuvem! 🎉

**Links importantes:**
- Seu site Netlify
- API no Render
- Repositório no GitHub

Compartilhe a URL do Netlify com sua equipe!

---

## Próximas Melhorias

Agora que o app está deployado, você pode:

1. **Mudar domínio**: `seu-dominio.com` (Netlify oferece essa opção)
2. **Adicionar HTTPS**: Netlify faz isso automaticamente
3. **Backup do banco**: Configure no Render
4. **Adicionar equipe**: Todos podem usar a mesma URL

---

**Dúvidas? Veja DEPLOY.md para mais detalhes técnicos.**
