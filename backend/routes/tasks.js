import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runAsync, getAsync, allAsync } from '../db.js';

export const taskRoutes = express.Router();

const markOverdueTasks = async () => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    await runAsync(
      `UPDATE tasks
       SET status = 'atrasada'
       WHERE due_date < $1 AND status = 'ativa'`,
      [todayStr]
    );
  } catch (error) {
    console.error('Erro ao marcar tarefas atrasadas:', error);
  }
};

taskRoutes.get('/', async (req, res) => {
  try {
    await markOverdueTasks();

    const { member_id, status, priority, view = 'list' } = req.query;
    let sql = `
      SELECT t.*, m.name as assigned_to_name
      FROM tasks t
      LEFT JOIN members m ON t.assigned_to = m.id
      WHERE 1=1
    `;
    const params = [];

    if (member_id) {
      sql += ` AND t.assigned_to = $${params.length + 1}`;
      params.push(member_id);
    }
    if (status) {
      sql += ` AND t.status = $${params.length + 1}`;
      params.push(status);
    }
    if (priority) {
      sql += ` AND t.priority = $${params.length + 1}`;
      params.push(priority);
    }

    sql += ` ORDER BY t.due_date ASC, t.priority DESC`;

    const tasks = await allAsync(sql, params);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

taskRoutes.get('/:id', async (req, res) => {
  try {
    const task = await getAsync(
      `SELECT t.*, m.name as assigned_to_name FROM tasks t
       LEFT JOIN members m ON t.assigned_to = m.id WHERE t.id = $1`,
      [req.params.id]
    );
    if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

taskRoutes.post('/', async (req, res) => {
  try {
    const { title, description, assigned_to, created_by, due_date, priority = 'média' } = req.body;
    const id = uuidv4();

    await runAsync(
      `INSERT INTO tasks (id, title, description, assigned_to, created_by, due_date, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, title, description, assigned_to, created_by, due_date, priority]
    );

    const task = await getAsync('SELECT * FROM tasks WHERE id = $1', [id]);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

taskRoutes.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, due_date } = req.body;
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      params.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      params.push(priority);
    }
    if (due_date !== undefined) {
      updates.push(`due_date = $${paramIndex++}`);
      params.push(due_date);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(req.params.id);

      await runAsync(
        `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        params
      );
    }

    const task = await getAsync('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

taskRoutes.delete('/:id', async (req, res) => {
  try {
    await runAsync('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

taskRoutes.get('/stats/:member_id', async (req, res) => {
  try {
    const stats = await getAsync(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'ativa' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'atrasada' THEN 1 ELSE 0 END) as overdue,
        SUM(CASE WHEN status = 'concluída' THEN 1 ELSE 0 END) as completed
       FROM tasks WHERE assigned_to = $1`,
      [req.params.member_id]
    );
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
