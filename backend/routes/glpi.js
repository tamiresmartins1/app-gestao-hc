import express from 'express';
import { runAsync, getAsync, allAsync } from '../db.js';

export const glpiRoutes = express.Router();

// GET all GLPI tickets
glpiRoutes.get('/', async (req, res) => {
  try {
    const tickets = await allAsync(
      'SELECT * FROM glpi_tickets ORDER BY opened_at DESC',
      []
    );
    res.json(tickets);
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

    await runAsync(
      `INSERT INTO glpi_tickets (glpi_number, description, status, opened_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [glpi_number, description, status, insertDate, new Date().toISOString(), new Date().toISOString()]
    );

    const ticket = await getAsync(
      'SELECT * FROM glpi_tickets WHERE glpi_number = ?',
      [glpi_number]
    );

    res.status(201).json(ticket);
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

    await runAsync(
      'UPDATE glpi_tickets SET status = ?, updated_at = ? WHERE id = ?',
      [status, new Date().toISOString(), id]
    );

    const ticket = await getAsync(
      'SELECT * FROM glpi_tickets WHERE id = ?',
      [id]
    );

    res.json(ticket);
  } catch (error) {
    console.error('Erro ao atualizar GLPI ticket:', error);
    res.status(500).json({ error: 'Erro ao atualizar GLPI ticket' });
  }
});

// DELETE GLPI ticket
glpiRoutes.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await runAsync(
      'DELETE FROM glpi_tickets WHERE id = ?',
      [id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar GLPI ticket:', error);
    res.status(500).json({ error: 'Erro ao deletar GLPI ticket' });
  }
});

