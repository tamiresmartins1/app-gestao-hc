import express from 'express';
import { runAsync, getAsync, allAsync } from '../db.js';

export const notesRoutes = express.Router();

// GET notas de um membro
notesRoutes.get('/:member_id', async (req, res) => {
  try {
    const { member_id } = req.params;
    const note = await getAsync(
      `SELECT * FROM member_notes WHERE member_id = $1`,
      [member_id]
    );
    res.json(note || { member_id, content: '' });
  } catch (error) {
    console.error('Erro ao carregar notas:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST/PUT salvar notas
notesRoutes.post('/:member_id', async (req, res) => {
  try {
    const { member_id } = req.params;
    const { content } = req.body;

    // Verifica se já existe nota
    const existing = await getAsync(
      `SELECT id FROM member_notes WHERE member_id = $1`,
      [member_id]
    );

    if (existing) {
      // Atualiza
      await runAsync(
        `UPDATE member_notes SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE member_id = $2`,
        [content, member_id]
      );
    } else {
      // Insere
      await runAsync(
        `INSERT INTO member_notes (member_id, content) VALUES ($1, $2)`,
        [member_id, content]
      );
    }

    res.json({ success: true, member_id, content });
  } catch (error) {
    console.error('Erro ao salvar notas:', error);
    res.status(500).json({ error: error.message });
  }
});
