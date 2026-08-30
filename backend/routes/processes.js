import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { runAsync, getAsync, allAsync } from '../db.js';

export const processesRoutes = express.Router();

processesRoutes.get('/', async (req, res) => {
  try {
    const processes = await allAsync(
      `SELECT p.*, m.name as owner_name FROM processes p
       LEFT JOIN members m ON p.owner_id = m.id
       ORDER BY p.created_at DESC`
    );

    for (let process of processes) {
      const members = await allAsync(
        `SELECT mb.id, mb.name FROM process_members pm
         JOIN members mb ON pm.member_id = mb.id
         WHERE pm.process_id = $1`,
        [process.id]
      );
      process.assigned_members = members;
    }

    res.json(processes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

processesRoutes.get('/:id', async (req, res) => {
  try {
    const process = await getAsync(
      `SELECT p.*, m.name as owner_name FROM processes p
       LEFT JOIN members m ON p.owner_id = m.id WHERE p.id = $1`,
      [req.params.id]
    );
    if (!process) return res.status(404).json({ error: 'Processo não encontrado' });

    const tasks = await allAsync(
      `SELECT t.* FROM process_tasks pt
       JOIN tasks t ON pt.task_id = t.id
       WHERE pt.process_id = $1 ORDER BY pt.dependency_order`,
      [req.params.id]
    );

    res.json({ ...process, tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

processesRoutes.post('/', async (req, res) => {
  try {
    const { name, description, owner_id, due_date, responsible_ids = [], participant_ids = [], depends_on_id } = req.body;
    const id = uuidv4();

    let safeDueDate = due_date;
    if (due_date) {
      const [year, month, day] = due_date.split('-');
      const dayNum = parseInt(day) + 1;
      safeDueDate = `${year}-${month}-${String(dayNum).padStart(2, '0')}`;
    }

    await runAsync(
      `INSERT INTO processes (id, name, description, owner_id, due_date, depends_on_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, name, description, owner_id, safeDueDate, depends_on_id || null]
    );

    for (let member_id of responsible_ids) {
      await runAsync(
        `INSERT INTO process_members (id, process_id, member_id) VALUES ($1, $2, $3)`,
        [uuidv4(), id, member_id]
      );

      await runAsync(
        `INSERT INTO process_completion_status (id, process_id, member_id, completed) VALUES ($1, $2, $3, false)`,
        [uuidv4(), id, member_id]
      );
    }

    for (let member_id of participant_ids) {
      await runAsync(
        `INSERT INTO process_members (id, process_id, member_id) VALUES ($1, $2, $3)`,
        [uuidv4(), id, member_id]
      );
    }

    const process = await getAsync('SELECT * FROM processes WHERE id = $1', [id]);
    res.status(201).json(process);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

processesRoutes.put('/:id', async (req, res) => {
  try {
    const { name, description, status, due_date } = req.body;
    if (name) await runAsync('UPDATE processes SET name = $1 WHERE id = $2', [name, req.params.id]);
    if (description) await runAsync('UPDATE processes SET description = $1 WHERE id = $2', [description, req.params.id]);
    if (status) {
      await runAsync('UPDATE processes SET status = $1 WHERE id = $2', [status, req.params.id]);

      if (status === 'concluido') {
        const currentProcess = await getAsync('SELECT * FROM processes WHERE id = $1', [req.params.id]);

        const dependentProcesses = await allAsync(
          `SELECT * FROM processes WHERE depends_on_id = $1`,
          [req.params.id]
        );

        for (let depProcess of dependentProcesses) {
          const members = await allAsync(
            `SELECT member_id FROM process_members WHERE process_id = $1`,
            [depProcess.id]
          );

          for (let { member_id } of members) {
            await runAsync(
              `INSERT INTO process_notifications (id, process_id, member_id, message)
               VALUES ($1, $2, $3, $4)`,
              [uuidv4(), depProcess.id, member_id, `O processo "${currentProcess.name}" foi concluído. Sua etapa "${depProcess.name}" pode começar!`]
            );
          }
        }
      }
    }

    if (due_date) {
      const [year, month, day] = due_date.split('-');
      const dayNum = parseInt(day) + 1;
      const safeDueDate = `${year}-${month}-${String(dayNum).padStart(2, '0')}`;
      await runAsync('UPDATE processes SET due_date = $1 WHERE id = $2', [safeDueDate, req.params.id]);
    }

    const process = await getAsync('SELECT * FROM processes WHERE id = $1', [req.params.id]);
    res.json(process);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

processesRoutes.get('/notifications/:member_id', async (req, res) => {
  try {
    const notifications = await allAsync(
      `SELECT pn.*, p.name as process_name FROM process_notifications pn
       JOIN processes p ON pn.process_id = p.id
       WHERE pn.member_id = $1 AND pn.read = false
       ORDER BY pn.created_at DESC`,
      [req.params.member_id]
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

processesRoutes.put('/notifications/:notification_id/read', async (req, res) => {
  try {
    await runAsync(
      `UPDATE process_notifications SET read = true WHERE id = $1`,
      [req.params.notification_id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

processesRoutes.put('/:id/member-complete/:member_id', async (req, res) => {
  try {
    const { processId, memberId } = { processId: req.params.id, memberId: req.params.member_id };

    await runAsync(
      `UPDATE process_completion_status SET completed = true WHERE process_id = $1 AND member_id = $2`,
      [processId, memberId]
    );

    const allCompleted = await getAsync(
      `SELECT COUNT(*) as total, SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed
       FROM process_completion_status WHERE process_id = $1`,
      [processId]
    );

    if (parseInt(allCompleted.total) === parseInt(allCompleted.completed)) {
      await runAsync('UPDATE processes SET status = $1 WHERE id = $2', ['concluido', processId]);

      const dependentProcesses = await allAsync(
        `SELECT * FROM processes WHERE depends_on_id = $1`,
        [processId]
      );

      for (let depProcess of dependentProcesses) {
        const members = await allAsync(
          `SELECT member_id FROM process_members WHERE process_id = $1`,
          [depProcess.id]
        );

        for (let { member_id } of members) {
          const currentProcess = await getAsync('SELECT * FROM processes WHERE id = $1', [processId]);
          await runAsync(
            `INSERT INTO process_notifications (id, process_id, member_id, message)
             VALUES ($1, $2, $3, $4)`,
            [uuidv4(), depProcess.id, member_id, `O processo "${currentProcess.name}" foi concluído por todos! Sua etapa "${depProcess.name}" pode começar!`]
          );
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

processesRoutes.post('/:id/tasks', async (req, res) => {
  try {
    const { task_id, dependency_order } = req.body;
    const id = uuidv4();

    await runAsync(
      `INSERT INTO process_tasks (id, process_id, task_id, dependency_order)
       VALUES ($1, $2, $3, $4)`,
      [id, req.params.id, task_id, dependency_order || 0]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

processesRoutes.delete('/:id', async (req, res) => {
  try {
    const processId = req.params.id;

    await runAsync('DELETE FROM process_notifications WHERE process_id = $1', [processId]);
    await runAsync('DELETE FROM process_completion_status WHERE process_id = $1', [processId]);
    await runAsync('DELETE FROM process_members WHERE process_id = $1', [processId]);
    await runAsync('DELETE FROM process_tasks WHERE process_id = $1', [processId]);
    await runAsync('UPDATE processes SET depends_on_id = NULL WHERE depends_on_id = $1', [processId]);
    await runAsync('DELETE FROM processes WHERE id = $1', [processId]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
