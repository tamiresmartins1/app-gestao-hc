import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard({ members }) {
  const [stats, setStats] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const tasksRes = await axios.get(`${API_URL}/tasks`);
      setAllTasks(tasksRes.data);

      const memberStats = {};
      for (const member of members) {
        const res = await axios.get(`${API_URL}/members/${member.id}/stats`);
        memberStats[member.id] = res.data;
      }
      setStats(memberStats);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalStats = members.reduce(
    (acc, member) => {
      const stat = stats[member.id] || {};
      return {
        total: acc.total + (stat.total_tasks || 0),
        active: acc.active + (stat.active_tasks || 0),
        overdue: acc.overdue + (stat.overdue_tasks || 0),
        completed: acc.completed + (stat.completed_tasks || 0)
      };
    },
    { total: 0, active: 0, overdue: 0, completed: 0 }
  );

  const overdueTasks = allTasks.filter(t => t.status === 'atrasada');
  const upcomingTasks = allTasks
    .filter(t => t.status === 'ativa' && t.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard de Tarefas</h2>
        <div className="period-selector">
          <button
            className={selectedPeriod === 'week' ? 'active' : ''}
            onClick={() => setSelectedPeriod('week')}
          >
            Semana
          </button>
          <button
            className={selectedPeriod === 'month' ? 'active' : ''}
            onClick={() => setSelectedPeriod('month')}
          >
            Mês
          </button>
          <button
            className={selectedPeriod === 'year' ? 'active' : ''}
            onClick={() => setSelectedPeriod('year')}
          >
            Ano
          </button>
        </div>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <>
          <div className="dashboard-cards">
            <div className="card">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <div className="card-number">{totalStats.total}</div>
                <div className="card-label">Total de Tarefas</div>
              </div>
            </div>

            <div className="card active">
              <div className="card-icon">🟢</div>
              <div className="card-content">
                <div className="card-number">{totalStats.active}</div>
                <div className="card-label">Tarefas Ativas</div>
              </div>
            </div>

            <div className="card overdue">
              <div className="card-icon">🔴</div>
              <div className="card-content">
                <div className="card-number">{totalStats.overdue}</div>
                <div className="card-label">Tarefas Atrasadas</div>
              </div>
            </div>

            <div className="card completed">
              <div className="card-icon">✅</div>
              <div className="card-content">
                <div className="card-number">{totalStats.completed}</div>
                <div className="card-label">Tarefas Concluídas</div>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-section">
              <h3>Carga de Trabalho por Membro</h3>
              <div className="members-load">
                {members.map((member) => {
                  const memberStat = stats[member.id] || {};
                  const percentage = totalStats.total > 0
                    ? ((memberStat.total_tasks || 0) / totalStats.total * 100).toFixed(0)
                    : 0;

                  return (
                    <div key={member.id} className="member-load-item">
                      <div className="member-load-info">
                        <div className="member-name">{member.name}</div>
                        <div className="load-stats">
                          {memberStat.active_tasks || 0} ativas | {memberStat.overdue_tasks || 0} atrasadas | {memberStat.completed_tasks || 0} concluídas
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="percentage">{percentage}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="dashboard-section">
              <h3>Tarefas Atrasadas</h3>
              {overdueTasks.length === 0 ? (
                <p className="empty-message">✨ Nenhuma tarefa atrasada!</p>
              ) : (
                <div className="tasks-list">
                  {overdueTasks.map((task) => (
                    <div key={task.id} className="dashboard-task">
                      <div className="task-info">
                        <div className="task-title">{task.title}</div>
                        <div className="task-meta">
                          {task.assigned_to_name && (
                            <span>👤 {task.assigned_to_name}</span>
                          )}
                          {task.due_date && (
                            <span>📅 {new Date(task.due_date).toLocaleDateString('pt-BR')}</span>
                          )}
                        </div>
                      </div>
                      <span className="priority-badge" style={{
                        backgroundColor: {
                          alta: '#f44336',
                          média: '#ff9800',
                          baixa: '#9c27b0'
                        }[task.priority],
                        color: 'white'
                      }}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-section">
            <h3>Próximas Tarefas</h3>
            {upcomingTasks.length === 0 ? (
              <p className="empty-message">Nenhuma tarefa programada</p>
            ) : (
              <div className="tasks-timeline">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="timeline-item">
                    <div className="timeline-date">
                      {new Date(task.due_date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">{task.title}</div>
                      <div className="timeline-meta">
                        {task.assigned_to_name && (
                          <span>{task.assigned_to_name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
