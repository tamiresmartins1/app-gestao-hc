import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import { v4 as uuidv4 } from 'uuid';

export const scheduledTasksRoutes = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/app_gestao',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// GET all scheduled tasks for a member
scheduledTasksRoutes.get('/member/:member_id', async (req, res) => {
  try {
    const { member_id } = req.params;
    const result = await pool.query(
      'SELECT * FROM scheduled_tasks WHERE member_id = $1 ORDER BY start_date ASC',
      [member_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao carregar tarefas programadas:', error);
    res.status(500).json({ error: 'Erro ao carregar tarefas programadas' });
  }
});

// POST create scheduled task
scheduledTasksRoutes.post('/', async (req, res) => {
  try {
    const { member_id, title, description, recurrence, start_date, end_date } = req.body;

    if (!member_id || !title || !recurrence || !start_date || !end_date) {
      return res.status(400).json({ error: 'member_id, title, recurrence, start_date e end_date são obrigatórios' });
    }

    const result = await pool.query(
      `INSERT INTO scheduled_tasks (member_id, title, description, recurrence, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [member_id, title, description || null, recurrence, start_date, end_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar tarefa programada:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message || 'Erro ao criar tarefa programada' });
  }
});

// PATCH update scheduled task
scheduledTasksRoutes.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, recurrence, start_date, end_date } = req.body;

    const result = await pool.query(
      `UPDATE scheduled_tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           recurrence = COALESCE($3, recurrence),
           start_date = COALESCE($4, start_date),
           end_date = COALESCE($5, end_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [title, description, recurrence, start_date, end_date, id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Tarefa programada não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao atualizar tarefa programada:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message || 'Erro ao atualizar tarefa programada' });
  }
});

// DELETE scheduled task
scheduledTasksRoutes.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'DELETE FROM scheduled_tasks WHERE id = $1',
      [id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar tarefa programada:', error);
    res.status(500).json({ error: 'Erro ao deletar tarefa programada' });
  }
});

// POST process scheduled tasks (create active tasks)
scheduledTasksRoutes.post('/process/all', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Buscar todas tarefas programadas ativas hoje
    const result = await pool.query(
      `SELECT * FROM scheduled_tasks
       WHERE start_date::text <= $1
       AND end_date::text >= $1`,
      [today]
    );

    let createdCount = 0;

    for (const task of result.rows) {
      // Verificar se já não existe tarefa duplicada
      const taskResult = await pool.query(
        `SELECT 1 FROM tasks WHERE assigned_to = $1 AND due_date = $2 AND title = $3 LIMIT 1`,
        [task.member_id, today, task.title]
      );

      // Se não existe tarefa duplicada, criar
      if (taskResult.rows.length === 0) {
        await pool.query(
          `INSERT INTO tasks (id, title, description, assigned_to, status, created_by, due_date, priority)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            uuidv4(),
            task.title,
            task.description || '',
            task.member_id,
            'ativa',
            task.member_id,
            today,
            'média'
          ]
        );

        createdCount++;
      }
    }

    res.json({ created: createdCount, message: `${createdCount} tarefas criadas para ${today}` });
  } catch (error) {
    console.error('Erro:', error.message);
    res.status(500).json({ error: error.message });
  }
});
