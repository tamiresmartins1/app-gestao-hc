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
    res.json(processes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

processesRoutes.get('/:id', async (req, res) => {
  try {
    const process = await getAsync(
      `SELECT p.*, m.name as owner_name FROM processes p
       LEFT JOIN members m ON p.owner_id = m.id WHERE p.id = ?`,
      [req.params.id]
    );
    if (!process) return res.status(404).json({ error: 'Processo não encontrado' });

    const tasks = await allAsync(
      `SELECT t.* FROM process_tasks pt
       JOIN tasks t ON pt.task_id = t.id
       WHERE pt.process_id = ? ORDER BY pt.dependency_order`,
      [req.params.id]
    );

    res.json({ ...process, tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

processesRoutes.post('/', async (req, res) => {
  try {
    const { name, description, owner_id } = req.body;
    const id = uuidv4();

    await runAsync(
      `INSERT INTO processes (id, name, description, owner_id)
       VALUES (?, ?, ?, ?)`,
      [id, name, description, owner_id]
    );

    const process = await getAsync('SELECT * FROM processes WHERE id = ?', [id]);
    res.status(201).json(process);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

processesRoutes.put('/:id', async (req, res) => {
  try {
    const { name, description, status } = req.body;
    if (name) await runAsync('UPDATE processes SET name = ? WHERE id = ?', [name, req.params.id]);
    if (description) await runAsync('UPDATE processes SET description = ? WHERE id = ?', [description, req.params.id]);
    if (status) await runAsync('UPDATE processes SET status = ? WHERE id = ?', [status, req.params.id]);

    const process = await getAsync('SELECT * FROM processes WHERE id = ?', [req.params.id]);
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
       VALUES (?, ?, ?, ?)`,
      [id, req.params.id, task_id, dependency_order || 0]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

processesRoutes.delete('/:id', async (req, res) => {
  try {
    await runAsync('DELETE FROM process_tasks WHERE process_id = ?', [req.params.id]);
    await runAsync('DELETE FROM processes WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
