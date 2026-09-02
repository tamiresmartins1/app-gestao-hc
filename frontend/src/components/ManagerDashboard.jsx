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
        <div className="overview-card active">
          <h3>Tarefas Ativas</h3>
          <div className="big-number">
            {Object.values(teamStats).reduce((sum, s) => sum + (s.active_tasks || 0), 0)}
          </div>
        </div>
        <div className="overview-card overdue">
          <h3>Tarefas Atrasadas</h3>
          <div className="big-number">
            {Object.values(teamStats).reduce((sum, s) => sum + (s.overdue_tasks || 0), 0)}
          </div>
        </div>
        <div className="overview-card completed">
          <h3>Tarefas Concluídas</h3>
          <div className="big-number">
            {Object.values(teamStats).reduce((sum, s) => sum + (s.completed_tasks || 0), 0)}
          </div>
        </div>
      </div>

      <div className="team-members-stats">
        <h3>📈 Carga de Trabalho por Membro</h3>
        <div className="member-stats-grid">
          {teamMembers.map(name => {
            const stats = teamStats[name] || {};
            const total = parseInt(stats.total_tasks) || 0;
            const active = parseInt(stats.active_tasks) || 0;
            const overdue = parseInt(stats.overdue_tasks) || 0;
            const completed = parseInt(stats.completed_tasks) || 0;

            const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <div key={name} className="member-stat-card">
                <h4>{name}</h4>
                <div className="stat-row">
                  <span>Total:</span>
                  <span className="value">{total}</span>
                </div>
                <div className="stat-row clickable" onClick={() => openTaskModal(name, 'ativas')}>
                  <span>Ativas:</span>
                  <span className="value active">{active}</span>
                </div>
                <div className="stat-row clickable" onClick={() => openTaskModal(name, 'atrasadas')}>
                  <span>Atrasadas:</span>
                  <span className="value overdue">{overdue}</span>
                </div>
                <div className="stat-row clickable" onClick={() => openTaskModal(name, 'concluidas')}>
                  <span>Concluídas:</span>
                  <span className="value completed">{completed}</span>
                </div>
                {total > 0 && (
                  <>
                    <div className="stat-row">
                      <span>Progresso:</span>
                      <span className="value">{progressPercent}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
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
