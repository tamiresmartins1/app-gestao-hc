import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getAsync, runAsync } from '../db.js';

export const sectionsRoutes = express.Router();

sectionsRoutes.get('/:memberId/:section', async (req, res) => {
  try {
    const { memberId, section } = req.params;

    const result = await getAsync(
      `SELECT content FROM member_sections
       WHERE member_id = $1 AND section_type = $2`,
      [memberId, section]
    );

    res.json({ content: result?.content || '' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

sectionsRoutes.post('/:memberId/:section', async (req, res) => {
  try {
    const { memberId, section } = req.params;
    const { content } = req.body;

    const existing = await getAsync(
      `SELECT id FROM member_sections
       WHERE member_id = $1 AND section_type = $2`,
      [memberId, section]
    );

    if (existing) {
      await runAsync(
        `UPDATE member_sections
         SET content = $1, updated_at = CURRENT_TIMESTAMP
         WHERE member_id = $2 AND section_type = $3`,
        [content, memberId, section]
      );
    } else {
      await runAsync(
        `INSERT INTO member_sections (id, member_id, section_type, content)
         VALUES ($1, $2, $3, $4)`,
        [uuidv4(), memberId, section, content]
      );
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
