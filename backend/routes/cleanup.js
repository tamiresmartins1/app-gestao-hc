import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

export const cleanupRoutes = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/app_gestao',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// GET cleanup stats (mostrar quantos registros serão deletados)
cleanupRoutes.get('/stats', async (req, res) => {
  try {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    twoMonthsAgo.setDate(twoMonthsAgo.getDate() + 15); // Buffer de 15 dias

    // Contar mensagens que serão deletadas
    const messagesResult = await pool.query(
      `SELECT COUNT(*) as count FROM messages
       WHERE created_at < $1 AND status = 'concluido'`,
      [twoMonthsAgo.toISOString()]
    );

    // Contar GLPI tickets que serão deletados
    const glpiResult = await pool.query(
      `SELECT COUNT(*) as count FROM glpi_tickets
       WHERE created_at < $1 AND status = 'concluida'`,
      [twoMonthsAgo.toISOString()]
    );

    res.json({
      messages: parseInt(messagesResult.rows[0].count) || 0,
      glpi: parseInt(glpiResult.rows[0].count) || 0,
      cutoffDate: twoMonthsAgo.toLocaleDateString('pt-BR'),
      bufferDays: 15
    });
  } catch (error) {
    console.error('Erro ao calcular stats de limpeza:', error);
    res.status(500).json({ error: 'Erro ao calcular dados para limpeza' });
  }
});

// POST cleanup (executar a limpeza)
cleanupRoutes.post('/execute', async (req, res) => {
  try {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    twoMonthsAgo.setDate(twoMonthsAgo.getDate() + 15); // Buffer de 15 dias

    const cutoffDate = twoMonthsAgo.toISOString();

    // Deletar mensagens antigas
    const messagesResult = await pool.query(
      `DELETE FROM messages
       WHERE created_at < $1 AND status = 'concluido'
       RETURNING id`,
      [cutoffDate]
    );

    // Deletar GLPI tickets antigos
    const glpiResult = await pool.query(
      `DELETE FROM glpi_tickets
       WHERE created_at < $1 AND status = 'concluida'
       RETURNING id`,
      [cutoffDate]
    );

    const messagesDeleted = messagesResult.rows.length;
    const glpiDeleted = glpiResult.rows.length;

    console.log(`🧹 Limpeza executada:`);
    console.log(`   📬 Mensagens deletadas: ${messagesDeleted}`);
    console.log(`   🔧 GLPI tickets deletados: ${glpiDeleted}`);

    res.json({
      success: true,
      deleted: {
        messages: messagesDeleted,
        glpi: glpiDeleted
      },
      cutoffDate: twoMonthsAgo.toLocaleDateString('pt-BR'),
      message: `🧹 Limpeza concluída! ${messagesDeleted} mensagens e ${glpiDeleted} GLPI tickets deletados.`
    });
  } catch (error) {
    console.error('Erro ao executar limpeza:', error);
    res.status(500).json({ error: 'Erro ao executar limpeza de dados' });
  }
});
