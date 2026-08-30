import React, { useState, useEffect } from 'react';
import '../styles/manager-dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ManagerDashboard({ members }) {
  const [teamStats, setTeamStats] = useState({});
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
                <div className="stat-row">
                  <span>Ativas:</span>
                  <span className="value active">{active}</span>
                </div>
                <div className="stat-row">
                  <span>Atrasadas:</span>
                  <span className="value overdue">{overdue}</span>
                </div>
                <div className="stat-row">
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
    </div>
  );
}
