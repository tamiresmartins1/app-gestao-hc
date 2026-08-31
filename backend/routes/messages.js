import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runAsync, getAsync, allAsync } from '../db.js';

export const messagesRoutes = express.Router();

messagesRoutes.get('/inbox/:recipient_id', async (req, res) => {
  try {
    const messages = await allAsync(
      `SELECT m.*, s.name as sender_name FROM messages m
       LEFT JOIN members s ON m.sender_id = s.id
       WHERE m.recipient_id = $1 OR m.sender_id = $1
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
       WHERE (m.sender_id = $1 AND m.recipient_id = $2) OR (m.sender_id = $3 AND m.recipient_id = $4)
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
    const { sender_id, recipient_id, subject, content, parent_message_id } = req.body;
    const id = uuidv4();

    await runAsync(
      `INSERT INTO messages (id, sender_id, recipient_id, subject, content, parent_message_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, sender_id, recipient_id, subject, content, parent_message_id || null]
    );

    const message = await getAsync('SELECT * FROM messages WHERE id = $1', [id]);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

messagesRoutes.put('/:id/read', async (req, res) => {
  try {
    await runAsync('UPDATE messages SET read = true WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

messagesRoutes.delete('/:id', async (req, res) => {
  try {
    await runAsync('DELETE FROM messages WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
