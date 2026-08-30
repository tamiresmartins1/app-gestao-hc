import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runAsync, getAsync, allAsync } from '../db.js';

export const membersRoutes = express.Router();

membersRoutes.get('/', async (req, res) => {
  try {
    const members = await allAsync('SELECT * FROM members ORDER BY name');
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

membersRoutes.get('/:id', async (req, res) => {
  try {
    const member = await getAsync('SELECT * FROM members WHERE id = ?', [req.params.id]);
    if (!member) return res.status(404).json({ error: 'Membro não encontrado' });
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

membersRoutes.post('/', async (req, res) => {
  try {
    const { name, email, role = 'member' } = req.body;
    const id = uuidv4();

    await runAsync(
      'INSERT INTO members (id, name, email, role) VALUES (?, ?, ?, ?)',
      [id, name, email, role]
    );

    const member = await getAsync('SELECT * FROM members WHERE id = ?', [id]);
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

membersRoutes.put('/:id', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    if (name) await runAsync('UPDATE members SET name = ? WHERE id = ?', [name, req.params.id]);
    if (email) await runAsync('UPDATE members SET email = ? WHERE id = ?', [email, req.params.id]);
    if (role) await runAsync('UPDATE members SET role = ? WHERE id = ?', [role, req.params.id]);

    const member = await getAsync('SELECT * FROM members WHERE id = ?', [req.params.id]);
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

membersRoutes.delete('/:id', async (req, res) => {
  try {
    await runAsync('DELETE FROM members WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

membersRoutes.get('/:id/stats', async (req, res) => {
  try {
    const stats = await getAsync(
      `SELECT
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'ativa' THEN 1 ELSE 0 END) as active_tasks,
        SUM(CASE WHEN status = 'atrasada' THEN 1 ELSE 0 END) as overdue_tasks,
        SUM(CASE WHEN status = 'concluída' THEN 1 ELSE 0 END) as completed_tasks
       FROM tasks WHERE assigned_to = ?`,
      [req.params.id]
    );
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
