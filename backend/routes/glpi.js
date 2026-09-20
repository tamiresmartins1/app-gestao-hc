import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import { v4 as uuidv4 } from 'uuid';

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
    const ticketId = parseInt(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status é obrigatório' });
    }

    // Buscar status anterior
    const currentTicket = await pool.query(
      'SELECT * FROM glpi_tickets WHERE id = $1',
      [ticketId]
    );

    if (!currentTicket.rows[0]) {
      return res.status(404).json({ error: 'Ticket não encontrado' });
    }

    const oldStatus = currentTicket.rows[0].status;
    const now = new Date().toISOString();

    // Atualizar ticket
    const result = await pool.query(
      'UPDATE glpi_tickets SET status = $1, closed_at = $2, updated_at = $3 WHERE id = $4 RETURNING *',
      [status, status === 'concluída' ? now : null, now, ticketId]
    );

    // Registrar no histórico
    try {
      await pool.query(
        'INSERT INTO glpi_history (ticket_id, status_from, status_to, closed_at, created_at) VALUES ($1, $2, $3, $4, $5)',
        [ticketId, oldStatus, status, status === 'concluída' ? now : null, now]
      );
    } catch (historyError) {
      console.warn('Aviso ao registrar histórico:', historyError.message);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar GLPI ticket:', error);
    res.status(500).json({ error: 'Erro ao atualizar GLPI ticket: ' + error.message });
  }
});

// GET GLPI ticket history
glpiRoutes.get('/:id/history', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM glpi_history WHERE ticket_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    res.status(500).json({ error: 'Erro ao carregar histórico' });
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

