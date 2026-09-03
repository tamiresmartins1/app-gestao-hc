import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initDatabase } from './db.js';
import { taskRoutes } from './routes/tasks.js';
import { membersRoutes } from './routes/members.js';
import { messagesRoutes } from './routes/messages.js';
import { processesRoutes } from './routes/processes.js';
import { notesRoutes } from './routes/notes.js';
import { glpiRoutes } from './routes/glpi.js';

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const corsOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  /netlify\.app$/,
  /vercel\.app$/
];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

app.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/api/tasks') {
    console.log('🔍 DEBUG - Raw POST body:', JSON.stringify(req.body, null, 2));
    if (req.body.due_date) {
      console.log(`📅 due_date type: ${typeof req.body.due_date}`);
      console.log(`📅 due_date value: "${req.body.due_date}"`);
      console.log(`📅 due_date length: ${String(req.body.due_date).length}`);
    }
  }
  next();
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});

app.use('/api/tasks', taskRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/processes', processesRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/glpi', glpiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const start = async () => {
  try {
    await initDatabase();
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📋 Ambiente: ${NODE_ENV}`);
      console.log(`📋 Frontend em: http://localhost:5173`);
      console.log(`🔗 API pronta em: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

start();

process.on('unhandledRejection', (err) => {
  console.error('❌ Erro não tratado:', err);
  process.exit(1);
});
// Redeploy Sun Aug 30 20:25:23     2026
