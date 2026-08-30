# 🚀 Guia de Instalação - APP GESTÃO HC

## Pré-requisitos

### 1. Instalar Node.js

Você precisa ter **Node.js 16 ou superior** instalado.

#### Windows (Recomendado)

1. Acesse https://nodejs.org/
2. Baixe a versão **LTS (Long Term Support)** - é a versão recomendada
3. Execute o instalador e siga os passos:
   - Clique em "Next"
   - Aceite os termos
   - Clique em "Next" para confirmar o local de instalação
   - Certifique-se que "npm package manager" está marcado ✓
   - Clique em "Next" e depois "Install"
   - Aguarde a instalação completar
   - Clique em "Finish"

4. **Reinicie o computador** (importante!)

5. Abra o Prompt de Comando (CMD) ou PowerShell e verifique:
   ```bash
   node --version
   npm --version
   ```
   
   Você deverá ver as versões instaladas, por exemplo:
   ```
   v18.17.0
   9.6.7
   ```

### 2. Verificar Instalação

```bash
# Abra um novo Prompt de Comando e execute:
node --version
npm --version
```

## 📦 Instalação do APP

Após instalar o Node.js e **reiniciar o computador**, siga os passos:

### Passo 1: Abra um Prompt de Comando (CMD)

- Pressione `Win + R`
- Digite `cmd` e aperte Enter
- Você verá uma janela preta com branco

### Passo 2: Navegue até a pasta do APP

```bash
cd C:\Users\mizae\Downloads\APP GESTAO HC
```

### Passo 3: Instale as dependências do Backend

```bash
cd backend
npm install
```

**Isso pode levar 2-5 minutos.** Você verá vários arquivos sendo baixados. Aguarde até aparecer mensagens de conclusão.

### Passo 4: Instale as dependências do Frontend

```bash
cd ..\frontend
npm install
```

**Isso também pode levar alguns minutos.**

### Passo 5: Pronto! 🎉

Agora o app está pronto para rodar.

## ▶️ Como Rodar o APP

Você precisa abrir **DOIS** terminais (CMD ou PowerShell) e deixá-los abertos enquanto usa o app.

### Terminal 1: Backend

```bash
cd C:\Users\mizae\Downloads\APP GESTAO HC\backend
npm run dev
```

Você deverá ver mensagens como:
```
🚀 Servidor rodando na porta 5000
📋 Frontend em: http://localhost:5173
✅ Banco de dados conectado
```

### Terminal 2: Frontend

```bash
cd C:\Users\mizae\Downloads\APP GESTAO HC\frontend
npm run dev
```

Você deverá ver mensagens como:
```
VITE v4.4.0  ready in 520 ms

➜  Local:   http://localhost:5173/
```

### Abrir o APP

Abra seu navegador (Chrome, Edge, Firefox) e acesse:
```
http://localhost:5173
```

## 📝 Estrutura de Pastas

```
APP GESTAO HC/
├── backend/               ← Servidor Node.js
│   ├── node_modules/     ← Dependências (criado após npm install)
│   ├── routes/           ← Rotas da API
│   ├── db.js            ← Banco de dados
│   └── server.js        ← Arquivo principal
├── frontend/             ← Aplicação React
│   ├── node_modules/    ← Dependências (criado após npm install)
│   ├── src/             ← Código-fonte
│   └── index.html       ← Página principal
├── README.md            ← Documentação
└── SETUP.md            ← Este arquivo
```

## 🆘 Troubleshooting

### Erro: "npm: command not found"
**Solução**: Node.js não foi instalado ou você não reiniciou o computador após instalar.
- Reinstale Node.js de https://nodejs.org/
- **Reinicie o computador**

### Erro: "Port 5000 already in use"
**Solução**: Outra aplicação está usando a porta 5000.
- Feche qualquer outro app que possa estar usando essa porta
- Ou mude a porta no arquivo `backend/.env` (linha `PORT=5000`)

### Erro: "Cannot find module"
**Solução**: As dependências não foram instaladas corretamente.
```bash
# No terminal, vá para backend ou frontend
cd backend  # ou frontend
rm -r node_modules
npm install
```

### App não carrega no navegador
1. Verifique se o backend está rodando (deve ver as mensagens "🚀 Servidor rodando")
2. Verifique se o frontend está rodando (deve ver as mensagens "Local:")
3. Tente acessar `http://localhost:5173` (note o 5173, não 5000)

### Banco de dados não funciona
**Solução**: Delete o arquivo `backend/app_gestao.db` e reinicie o backend
```bash
cd backend
# Delete app_gestao.db manualmente ou:
del app_gestao.db
npm run dev
```

## 🎮 Usando o APP

1. **Adicionar novo membro**: Clique em "+ Novo Membro" no topo
2. **Criar tarefa**: Vá para "Minhas Tarefas" e clique em "+ Nova Tarefa"
3. **Enviar recado**: Vá para "Recados" e clique em "+ Novo Recado"
4. **Ver dashboard**: Clique em "Dashboard" para ver a visão geral

## 🎯 Próximas Etapas

Para desenvolvedores que querem customizar:

- **Backend**: Edite os arquivos em `backend/routes/`
- **Frontend**: Edite os arquivos em `frontend/src/`
- **Banco de dados**: Os dados são salvos em `backend/app_gestao.db`

## 📞 Suporte

Se tiver problemas:
1. Verifique que Node.js está instalado: `node --version`
2. Verifique que npm está instalado: `npm --version`
3. Verifique que os dois terminais estão rodando
4. Tente limpar cache e reinstalar: `rm -r node_modules && npm install`

Bom uso! 🚀
