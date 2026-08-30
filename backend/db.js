import pkg from 'pg';
const { Pool } = pkg;
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/app_gestao',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Erro no pool de conexão:', err);
});

pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL');
});

export const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT DEFAULT 'member',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'ativa',
        priority TEXT DEFAULT 'média',
        assigned_to TEXT NOT NULL,
        created_by TEXT NOT NULL,
        due_date DATE,
        recurrence_type TEXT DEFAULT 'none',
        recurrence_end_date DATE,
        recurrence_day_of_week INTEGER,
        parent_task_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES members(id),
        FOREIGN KEY (created_by) REFERENCES members(id),
        FOREIGN KEY (parent_task_id) REFERENCES tasks(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        sender_id TEXT NOT NULL,
        recipient_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        parent_message_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES members(id),
        FOREIGN KEY (recipient_id) REFERENCES members(id),
        FOREIGN KEY (parent_message_id) REFERENCES messages(id)
      )
    `);

    // Adicionar coluna parent_message_id se ela não existir (para bancos existentes)
    try {
      await pool.query(`
        ALTER TABLE messages ADD COLUMN parent_message_id TEXT;
      `);
    } catch (error) {
      // Coluna já existe, continuar
    }

    // Adicionar constraint de foreign key se ela não existir
    try {
      await pool.query(`
        ALTER TABLE messages ADD CONSTRAINT fk_parent_message_id
        FOREIGN KEY (parent_message_id) REFERENCES messages(id);
      `);
    } catch (error) {
      // Constraint já existe, continuar
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS processes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'em_progresso',
        owner_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES members(id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS process_tasks (
        id TEXT PRIMARY KEY,
        process_id TEXT NOT NULL,
        task_id TEXT NOT NULL,
        dependency_order INTEGER DEFAULT 0,
        FOREIGN KEY (process_id) REFERENCES processes(id),
        FOREIGN KEY (task_id) REFERENCES tasks(id)
      )
    `);

    console.log('📊 Tabelas criadas/verificadas com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar banco:', error);
    throw error;
  }
};

export const runAsync = async (sql, params = []) => {
  try {
    const result = await pool.query(sql, params);
    return { id: result.rows[0]?.id, changes: result.rowCount };
  } catch (error) {
    console.error('Erro ao executar query:', sql, error);
    throw error;
  }
};

export const getAsync = async (sql, params = []) => {
  try {
    const result = await pool.query(sql, params);
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao buscar registro:', sql, error);
    throw error;
  }
};

export const allAsync = async (sql, params = []) => {
  try {
    const result = await pool.query(sql, params);
    return result.rows || [];
  } catch (error) {
    console.error('Erro ao buscar registros:', sql, error);
    throw error;
  }
};

export default pool;
