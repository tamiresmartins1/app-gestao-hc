import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runAsync, getAsync, allAsync } from '../db.js';

export const processesRoutes = express.Router();

processesRoutes.get('/', async (req, res) => {
  try {
    const processes = await allAsync(
      `SELECT p.*, m.name as owner_name FROM processes p
       LEFT JOIN members m ON p.owner_id = m.id
       ORDER BY p.created_at DESC`
    );

    for (let process of processes) {
      const members = await allAsync(
        `SELECT mb.id, mb.name FROM process_members pm
         JOIN members mb ON pm.member_id = mb.id
         WHERE pm.process_id = $1`,
        [process.id]
      );
      process.assigned_members = members;
    }

    res.json(processes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

processesRoutes.get('/:id', async (req, res) => {
  try {
    const process = await getAsync(
      `SELECT p.*, m.name as owner_name FROM processes p
       LEFT JOIN members m ON p.owner_id = m.id WHERE p.id = $1`,
      [req.params.id]
    );
    if (!process) return res.status(404).json({ error: 'Processo não encontrado' });

    const tasks = await allAsync(
      `SELECT t.* FROM process_tasks pt
       JOIN tasks t ON pt.task_id = t.id
       WHERE pt.process_id = $1 ORDER BY pt.dependency_order`,
      [req.params.id]
    );

    res.json({ ...process, tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

processesRoutes.post('/', async (req, res) => {
  try {
    const { name, description, owner_id, due_date, assigned_member_ids = [] } = req.body;
    const id = uuidv4();

    let safeDueDate = due_date;
    if (due_date) {
      const [year, month, day] = due_date.split('-');
      const dayNum = parseInt(day) + 1;
      safeDueDate = `${year}-${month}-${String(dayNum).padStart(2, '0')}`;
    }

    await runAsync(
      `INSERT INTO processes (id, name, description, owner_id, due_date)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, name, description, owner_id, safeDueDate]
    );

    for (let member_id of assigned_member_ids) {
      await runAsync(
        `INSERT INTO process_members (id, process_id, member_id) VALUES ($1, $2, $3)`,
        [uuidv4(), id, member_id]
      );
    }

    const process = await getAsync('SELECT * FROM processes WHERE id = $1', [id]);
    res.status(201).json(process);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

processesRoutes.put('/:id', async (req, res) => {
  try {
    const { name, description, status, due_date } = req.body;
    if (name) await runAsync('UPDATE processes SET name = $1 WHERE id = $2', [name, req.params.id]);
    if (description) await runAsync('UPDATE processes SET description = $1 WHERE id = $2', [description, req.params.id]);
    if (status) await runAsync('UPDATE processes SET status = $1 WHERE id = $2', [status, req.params.id]);

    if (due_date) {
      const [year, month, day] = due_date.split('-');
      const dayNum = parseInt(day) + 1;
      const safeDueDate = `${year}-${month}-${String(dayNum).padStart(2, '0')}`;
      await runAsync('UPDATE processes SET due_date = $1 WHERE id = $2', [safeDueDate, req.params.id]);
    }

    const process = await getAsync('SELECT * FROM processes WHERE id = $1', [req.params.id]);
    res.json(process);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

processesRoutes.post('/:id/tasks', async (req, res) => {
  try {
    const { task_id, dependency_order } = req.body;
    const id = uuidv4();

    await runAsync(
      `INSERT INTO process_tasks (id, process_id, task_id, dependency_order)
       VALUES ($1, $2, $3, $4)`,
      [id, req.params.id, task_id, dependency_order || 0]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

processesRoutes.delete('/:id', async (req, res) => {
  try {
    await runAsync('DELETE FROM process_tasks WHERE process_id = $1', [req.params.id]);
    await runAsync('DELETE FROM processes WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
