# APP GESTÃO HC

Sistema de gestão de tarefas colaborativo para equipes de saúde. Permite gerenciamento de tarefas individuais, dashboard geral, recados entre membros e gerenciamento de processos interdependentes.

## 🚀 Características

- **Gerenciamento de Tarefas**: Criar, editar, deletar e filtrar tarefas por status e prioridade
- **Múltiplas Visualizações**: Lista, Kanban, Calendário
- **Dashboard**: Visão geral da carga de trabalho de todos os membros, tarefas atrasadas e próximas
- **Recados**: Sistema de mensagens interno entre membros
- **Processos**: Organizar tarefas em processos com dependências
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile

## 📋 Stack Técnico

- **Frontend**: React 18 + Vite + Axios
- **Backend**: Node.js + Express + SQLite3
- **Database**: SQLite (pronto para migrar para PostgreSQL)
- **Icons**: React Icons

## 🛠️ Instalação

### Pré-requisitos
- Node.js 16+ instalado
- npm ou yarn

### Backend

```bash
cd backend
npm install
npm run dev
```

O servidor rodará em `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
APP GESTAO HC/
├── backend/
│   ├── routes/
│   │   ├── tasks.js        # API de tarefas
│   │   ├── members.js      # API de membros
│   │   ├── messages.js     # API de mensagens
│   │   └── processes.js    # API de processos
│   ├── db.js               # Inicialização do banco de dados
│   ├── server.js           # Servidor principal
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── MemberTasks.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   ├── TaskList.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Messages.jsx
│   │   │   └── Processes.jsx
│   │   ├── styles/
│   │   │   └── *.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🎯 Funcionalidades

### 1. Dashboard
- Resumo de todas as tarefas (ativas, atrasadas, concluídas)
- Carga de trabalho por membro
- Lista de tarefas atrasadas
- Timeline de próximas tarefas

### 2. Minhas Tarefas
- Criar nova tarefa
- Filtrar por status e prioridade
- Três visualizações: Lista, Kanban, Calendário
- Marcar como concluída, atrasada ou ativa
- Deletar tarefa

### 3. Recados
- Inbox de mensagens recebidas
- Enviar novo recado para qualquer membro
- Marcar como lido
- Deletar recado

### 4. Processos
- Criar novo processo
- Atribuir tarefas a processos
- Visualizar dependências
- Gerenciar status de processos

## 📊 API Endpoints

### Tasks
- `GET /api/tasks` - Listar tarefas
- `GET /api/tasks/:id` - Obter tarefa
- `POST /api/tasks` - Criar tarefa
- `PUT /api/tasks/:id` - Atualizar tarefa
- `DELETE /api/tasks/:id` - Deletar tarefa
- `GET /api/tasks/stats/:member_id` - Estatísticas do membro

### Members
- `GET /api/members` - Listar membros
- `GET /api/members/:id` - Obter membro
- `POST /api/members` - Criar membro
- `PUT /api/members/:id` - Atualizar membro
- `DELETE /api/members/:id` - Deletar membro
- `GET /api/members/:id/stats` - Estatísticas do membro

### Messages
- `GET /api/messages/inbox/:recipient_id` - Inbox
- `GET /api/messages/conversation/:user_id/:other_user_id` - Conversa
- `POST /api/messages` - Enviar mensagem
- `PUT /api/messages/:id/read` - Marcar como lido
- `DELETE /api/messages/:id` - Deletar mensagem

### Processes
- `GET /api/processes` - Listar processos
- `GET /api/processes/:id` - Obter processo
- `POST /api/processes` - Criar processo
- `PUT /api/processes/:id` - Atualizar processo
- `DELETE /api/processes/:id` - Deletar processo
- `POST /api/processes/:id/tasks` - Adicionar tarefa ao processo

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na pasta backend:

```
PORT=5000
NODE_ENV=development
```

## 📱 Responsive Design

A aplicação é totalmente responsiva e funciona em:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🚀 Deploy

### Backend (Heroku)
```bash
cd backend
git push heroku main
```

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy da pasta dist
```

## 📝 Notas

- O banco de dados SQLite é criado automaticamente na primeira execução
- Todos os dados são salvos localmente
- Para produção, recomenda-se migrar para PostgreSQL

## 🐛 Troubleshooting

### Backend não conecta
- Verificar se porta 5000 está disponível
- Verificar permissões de escrita na pasta do projeto

### Frontend não conecta ao backend
- Verificar se backend está rodando em `http://localhost:5000`
- Verificar CORS no `server.js`

## 📄 Licença

Projeto interno - APP GESTÃO HC

## 👥 Equipe

Desenvolvido para otimizar o gerenciamento de tarefas em ambiente de saúde.
