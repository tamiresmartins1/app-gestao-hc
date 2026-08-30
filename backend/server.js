import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initDatabase } from './db.js';
import { taskRoutes } from './routes/tasks.js';
import { membersRoutes } from './routes/members.js';
import { messagesRoutes } from './routes/messages.js';
import { processesRoutes } from './routes/processes.js';

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
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});

initDatabase();

app.use('/api/tasks', taskRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/processes', processesRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📋 Ambiente: ${NODE_ENV}`);
  console.log(`📋 Frontend em: http://localhost:5173`);
  console.log(`🔗 API pronta em: http://localhost:${PORT}/api`);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Erro não tratado:', err);
  process.exit(1);
});
