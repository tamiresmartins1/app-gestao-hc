import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

export const glpiRoutes = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/app_gestao',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// GET all GLPI tickets
glpiRoutes.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM glpi_tickets ORDER BY opened_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao carregar GLPI tickets:', error);
    res.status(500).json({ error: 'Erro ao carregar GLPI tickets' });
  }
});

// POST new GLPI ticket
glpiRoutes.post('/', async (req, res) => {
  try {
    const { glpi_number, description, status = 'ativa', opened_at } = req.body;

    if (!glpi_number || !description) {
      return res.status(400).json({ error: 'glpi_number e description são obrigatórios' });
    }

    const insertDate = opened_at || new Date().toISOString();
    const now = new Date().toISOString();

    const result = await pool.query(
      `INSERT INTO glpi_tickets (glpi_number, description, status, opened_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [glpi_number, description, status, insertDate, now, now]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar GLPI ticket:', error);
    res.status(500).json({ error: 'Erro ao criar GLPI ticket' });
  }
});

// PATCH update GLPI ticket status
glpiRoutes.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status é obrigatório' });
    }

    const result = await pool.query(
      'UPDATE glpi_tickets SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *',
      [status, new Date().toISOString(), id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar GLPI ticket:', error);
    res.status(500).json({ error: 'Erro ao atualizar GLPI ticket' });
  }
});

// DELETE GLPI ticket
glpiRoutes.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'DELETE FROM glpi_tickets WHERE id = $1',
      [id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar GLPI ticket:', error);
    res.status(500).json({ error: 'Erro ao deletar GLPI ticket' });
  }
});

