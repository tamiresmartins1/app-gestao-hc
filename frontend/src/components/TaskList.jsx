import React, { useState } from 'react';
import { FiTrash2, FiEdit2, FiCheck } from 'react-icons/fi';
import '../styles/task-list.css';

export default function TaskList({ tasks, onUpdate, onDelete, compact = false }) {
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');

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

  const handleStatusChange = async (taskId, newStatus) => {
    await onUpdate(taskId, { status: newStatus });
    setEditingId(null);
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
        <div key={task.id} className="task-item">
          <div className="task-left">
            <div className="task-title">{task.title}</div>
            {task.description && (
              <div className="task-description">{task.description}</div>
            )}
            {!compact && (
              <div className="task-meta">
                {task.due_date && (
                  <span className="meta-item">📅 {new Date(task.due_date).toLocaleDateString('pt-BR')}</span>
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
              {task.priority}
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
              className="btn-delete"
              onClick={() => onDelete(task.id)}
              title="Deletar tarefa"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
