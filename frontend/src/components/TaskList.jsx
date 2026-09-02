import React, { useState } from 'react';
import { FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import '../styles/task-list.css';

export default function TaskList({ tasks, onUpdate, onDelete, compact = false, isTaskDueToday }) {
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({});

  const priorityColor = {
    alta: '#f44336',
    média: '#ff9800',
    baixa: '#9c27b0'
  };

  const statusLabel = {
    ativa: '🟢 Ativa',
    atrasada: '🔴 Atrasada',
    concluída: '✅ Concluída'
  };

  const isOverdue = (task) => {
    if (task.status === 'concluída') return false;
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await onUpdate(taskId, { status: newStatus });
    setEditingId(null);
  };

  const openEditModal = (task) => {
    setEditingTask(task.id);
    setEditForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date || ''
    });
  };

  const handleSaveEdit = async () => {
    await onUpdate(editingTask, editForm);
    setEditingTask(null);
    setEditForm({});
  };

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>Nenhuma tarefa encontrada</p>
      </div>
    );
  }

  return (
    <div className={`task-list ${compact ? 'compact' : ''}`}>
      {tasks.map((task) => (
        <div key={task.id} className={`task-item ${isOverdue(task) ? 'overdue' : ''}`}>
          <div className="task-left">
            <div className="task-title">{task.title}</div>
            {task.description && (
              <div className="task-description">{task.description}</div>
            )}
            {!compact && (
              <div className="task-meta">
                {task.due_date && (
                  <>
                    <span className="meta-item">📅 {new Date(task.due_date).toLocaleDateString('pt-BR')}</span>
                    {isTaskDueToday && isTaskDueToday(task) && (
                      <span className="meta-badge-today">🔔 Vence hoje</span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="task-right">
            <span
              className="badge"
              style={{
                backgroundColor: priorityColor[task.priority] + '20',
                color: priorityColor[task.priority],
                fontWeight: 600
              }}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>

            <div className="status-dropdown">
              <button
                className="status-btn"
                onClick={() => setEditingId(editingId === task.id ? null : task.id)}
              >
                {statusLabel[task.status]}
              </button>

              {editingId === task.id && (
                <div className="status-menu">
                  <button
                    onClick={() => handleStatusChange(task.id, 'ativa')}
                    className={task.status === 'ativa' ? 'active' : ''}
                  >
                    🟢 Ativa
                  </button>
                  <button
                    onClick={() => handleStatusChange(task.id, 'atrasada')}
                    className={task.status === 'atrasada' ? 'active' : ''}
                  >
                    🔴 Atrasada
                  </button>
                  <button
                    onClick={() => handleStatusChange(task.id, 'concluída')}
                    className={task.status === 'concluída' ? 'active' : ''}
                  >
                    ✅ Concluída
                  </button>
                </div>
              )}
            </div>

            <button
              className="btn-edit"
              onClick={() => openEditModal(task)}
              title="Editar tarefa"
            >
              <FiEdit2 />
            </button>

            <button
              className="btn-delete"
              onClick={() => onDelete(task.id)}
              title="Deletar tarefa"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
      ))}

      {editingTask && (
        <div className="modal-overlay" onClick={() => setEditingTask(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Tarefa</h3>
              <button className="close-btn" onClick={() => setEditingTask(null)}>
                <FiX />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
              <div className="form-group">
                <label>Título *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Prioridade</label>
                <select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}>
                  <option value="baixa">Baixa</option>
                  <option value="média">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              <div className="form-group">
                <label>Data de Vencimento</label>
                <input
                  type="date"
                  value={editForm.due_date}
                  onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                />
              </div>

              <div className="modal-buttons">
                <button type="button" className="btn-secondary" onClick={() => setEditingTask(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
