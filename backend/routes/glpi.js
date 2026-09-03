import express from 'express';
import supabase from '../supabase.js';

const router = express.Router();

// GET all GLPI tickets
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('glpi_tickets')
      .select('*')
      .order('opened_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Erro ao carregar GLPI tickets:', error);
    res.status(500).json({ error: 'Erro ao carregar GLPI tickets' });
  }
});

// POST new GLPI ticket
router.post('/', async (req, res) => {
  try {
    const { glpi_number, description, status = 'ativa', opened_at } = req.body;

    if (!glpi_number || !description) {
      return res.status(400).json({ error: 'glpi_number e description são obrigatórios' });
    }

    const { data, error } = await supabase
      .from('glpi_tickets')
      .insert({
        glpi_number,
        description,
        status,
        opened_at: opened_at || new Date().toISOString()
      })
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Erro ao criar GLPI ticket:', error);
    res.status(500).json({ error: 'Erro ao criar GLPI ticket' });
  }
});

// PATCH update GLPI ticket status
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status é obrigatório' });
    }

    const { data, error } = await supabase
      .from('glpi_tickets')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (error) {
    console.error('Erro ao atualizar GLPI ticket:', error);
    res.status(500).json({ error: 'Erro ao atualizar GLPI ticket' });
  }
});

// DELETE GLPI ticket
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('glpi_tickets')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar GLPI ticket:', error);
    res.status(500).json({ error: 'Erro ao deletar GLPI ticket' });
  }
});

export default router;
