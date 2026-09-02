import React, { useState, useEffect } from 'react';
import '../styles/manager-dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ManagerDashboard({ members }) {
  const [teamStats, setTeamStats] = useState({});
  const [tasks, setTasks] = useState([]);
  const [modal, setModal] = useState({ open: false, type: null, memberName: null });
  const teamMembers = ['Tamires', 'Poliana', 'Nathalia'];

  useEffect(() => {
    loadTeamStats();
  }, [members]);

  const loadTeamStats = async () => {
    const stats = {};
    for (const name of teamMembers) {
      const member = members.find(m => m.name === name);
      if (member) {
        try {
          const res = await fetch(`${API_URL}/members/${member.id}/stats`);
          if (res.ok) {
            const data = await res.json();
            stats[name] = data;
          }
        } catch (error) {
          console.error(`Erro ao carregar stats de ${name}:`, error);
        }
      }
    }
    setTeamStats(stats);
  };

  const openTaskModal = async (memberName, taskType) => {
    const member = members.find(m => m.name === memberName);
    if (!member) return;

    try {
      const res = await fetch(`${API_URL}/tasks?member_id=${member.id}`);
      if (res.ok) {
        const allTasks = await res.json();
        setTasks(allTasks);
        setModal({ open: true, type: taskType, memberName });
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  };

  const closeModal = () => {
    setModal({ open: false, type: null, memberName: null });
  };

  const getFilteredTasks = () => {
    if (!modal.type) return [];

    return tasks.filter(task => {
      if (modal.type === 'ativas') {
        return task.status === 'ativa' || task.status === 'atrasada';
      } else if (modal.type === 'atrasadas') {
        return task.status === 'atrasada';
      } else if (modal.type === 'concluidas') {
        return task.status === 'concluída';
      }
      return false;
    });
  };

  return (
    <div className="manager-dashboard">
      <h2>📊 Painel de Gerenciamento - Equipe</h2>

      <div className="team-overview">
        <div className="overview-card">
          <h3>Total de Tarefas da Equipe</h3>
          <div className="big-number">
            {Object.values(teamStats).reduce((sum, s) => sum + (s.total_tasks || 0), 0)}
          </div>
        </div>
        <div className="overview-card active clickable-card" onClick={() => setModal({ open: true, type: 'ativas-all', memberName: null })}>
          <h3>Tarefas Ativas</h3>
          <div className="big-number">
            {Object.values(teamStats).reduce((sum, s) => sum + (s.active_tasks || 0), 0)}
          </div>
        </div>
        <div className="overview-card overdue clickable-card" onClick={() => setModal({ open: true, type: 'atrasadas-all', memberName: null })}>
          <h3>Tarefas Atrasadas</h3>
          <div className="big-number">
            {Object.values(teamStats).reduce((sum, s) => sum + (s.overdue_tasks || 0), 0)}
          </div>
        </div>
        <div className="overview-card completed clickable-card" onClick={() => setModal({ open: true, type: 'concluidas-all', memberName: null })}>
          <h3>Tarefas Concluídas</h3>
          <div className="big-number">
            {Object.values(teamStats).reduce((sum, s) => sum + (s.completed_tasks || 0), 0)}
          </div>
        </div>
      </div>


      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                📋 Tarefas {modal.type === 'ativas' ? 'Ativas' : modal.type === 'atrasadas' ? 'Atrasadas' : 'Concluídas'} - {modal.memberName}
              </h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {getFilteredTasks().length === 0 ? (
                <p className="empty-message">Nenhuma tarefa nesta categoria</p>
              ) : (
                <div className="task-list-modal">
                  {getFilteredTasks().map(task => (
                    <div key={task.id} className="task-modal-item">
                      <div className="task-title">{task.title}</div>
                      <div className="task-meta">
                        <span className="meta-member">👤 {task.assigned_to_name || 'N/A'}</span>
                        {task.due_date && (
                          <span className="meta-date">📅 {new Date(task.due_date).toLocaleDateString('pt-BR')}</span>
                        )}
                        <span className={`meta-priority ${task.priority}`}>{task.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
