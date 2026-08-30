import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runAsync, getAsync, allAsync } from '../db.js';

export const messagesRoutes = express.Router();

messagesRoutes.get('/inbox/:recipient_id', async (req, res) => {
  try {
    const messages = await allAsync(
      `SELECT m.*, s.name as sender_name FROM messages m
       LEFT JOIN members s ON m.sender_id = s.id
       WHERE m.recipient_id = ?
       ORDER BY m.created_at DESC`,
      [req.params.recipient_id]
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

messagesRoutes.get('/conversation/:user_id/:other_user_id', async (req, res) => {
  try {
    const messages = await allAsync(
      `SELECT m.*, s.name as sender_name FROM messages m
       LEFT JOIN members s ON m.sender_id = s.id
       WHERE (m.sender_id = ? AND m.recipient_id = ?) OR (m.sender_id = ? AND m.recipient_id = ?)
       ORDER BY m.created_at ASC`,
      [req.params.user_id, req.params.other_user_id, req.params.other_user_id, req.params.user_id]
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

messagesRoutes.post('/', async (req, res) => {
  try {
    const { sender_id, recipient_id, subject, content } = req.body;
    const id = uuidv4();

    await runAsync(
      `INSERT INTO messages (id, sender_id, recipient_id, subject, content)
       VALUES (?, ?, ?, ?, ?)`,
      [id, sender_id, recipient_id, subject, content]
    );

    const message = await getAsync('SELECT * FROM messages WHERE id = ?', [id]);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

messagesRoutes.put('/:id/read', async (req, res) => {
  try {
    await runAsync('UPDATE messages SET read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

messagesRoutes.delete('/:id', async (req, res) => {
  try {
    await runAsync('DELETE FROM messages WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
