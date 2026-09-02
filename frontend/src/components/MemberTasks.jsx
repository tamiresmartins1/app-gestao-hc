import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import MemberNotes from './MemberNotes';
import '../styles/member-tasks.css';

export default function MemberTasks({ member, tasks, members, onAddTask, onUpdateTask, onDeleteTask }) {
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('ativas');

  // Carrega filtros do localStorage por membro
  const getStoredFilterStatus = () => {
    return localStorage.getItem(`filterStatus_${member.id}`) || 'all';
  };

  const getStoredFilterPriority = () => {
    return localStorage.getItem(`filterPriority_${member.id}`) || 'all';
  };

  const [filterStatus, setFilterStatus] = useState(getStoredFilterStatus());
  const [filterPriority, setFilterPriority] = useState(getStoredFilterPriority());

  // Salva filtros quando mudam
  useEffect(() => {
    localStorage.setItem(`filterStatus_${member.id}`, filterStatus);
  }, [filterStatus, member.id]);

  useEffect(() => {
    localStorage.setItem(`filterPriority_${member.id}`, filterPriority);
  }, [filterPriority, member.id]);

  // Recarrega filtros quando muda de membro
  useEffect(() => {
    setFilterStatus(getStoredFilterStatus());
    setFilterPriority(getStoredFilterPriority());
  }, [member.id]);

  const isTaskOverdue = (task) => {
    if (task.status === 'concluída') return false;
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const isTaskDueToday = (task) => {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  };

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => t.status === 'ativa' && !isTaskOverdue(t)).length,
    overdue: tasks.filter(t => isTaskOverdue(t) || t.status === 'atrasada').length,
    completed: tasks.filter(t => t.status === 'concluída').length
  };

  const filteredTasks = tasks
    .filter(task => {
      // Filtro de visualização (Ativas vs Concluídas)
      const viewMatch = viewMode === 'ativas'
        ? task.status !== 'concluída'
        : task.status === 'concluída';

      // Filtro de status - se "ativa", mostra ativas + atrasadas
      let statusMatch = true;
      if (filterStatus !== 'all') {
        if (filterStatus === 'ativa') {
          statusMatch = task.status === 'ativa' || task.status === 'atrasada';
        } else {
          statusMatch = task.status === filterStatus;
        }
      }

      const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
      return viewMatch && statusMatch && priorityMatch;
    })
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    });

  return (
    <div className="member-tasks">
      <div className="tasks-header">
        <h2>👋 Olá, {member.name}!</h2>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <FiPlus /> Nova Tarefa
        </button>
      </div>

      <div className="tasks-layout">
        <div className="tasks-column">
          {showForm && (
            <TaskForm
              member={member}
              members={members}
              onSubmit={async (data) => {
                console.log('📤 Frontend sending task data:', data);
                if (data.due_date) {
                  console.log(`📅 Frontend due_date: "${data.due_date}" (type: ${typeof data.due_date})`);
                }
                await onAddTask(data);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          )}

          <div className="tasks-stats">
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-card active">
              <div className="stat-number">{stats.active}</div>
              <div className="stat-label">Ativas</div>
            </div>
            <div className="stat-card overdue">
              <div className="stat-number">{stats.overdue}</div>
              <div className="stat-label">Atrasadas</div>
            </div>
            <div className="stat-card completed">
              <div className="stat-number">{stats.completed}</div>
              <div className="stat-label">Concluídas</div>
            </div>
          </div>

          <div className="tasks-controls">
            <div className="view-tabs">
              <button
                className={`view-tab ${viewMode === 'ativas' ? 'active' : ''}`}
                onClick={() => setViewMode('ativas')}
              >
                📋 Ativas
              </button>
              <button
                className={`view-tab ${viewMode === 'concluidas' ? 'active' : ''}`}
                onClick={() => setViewMode('concluidas')}
              >
                ✅ Concluídas
              </button>
            </div>

            <div className="filters-row">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">Todos os status</option>
                <option value="ativa">Ativas</option>
                <option value="atrasada">Atrasadas</option>
              </select>

              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                <option value="all">Todas as prioridades</option>
                <option value="alta">Alta</option>
                <option value="média">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
          </div>

          <TaskList
            tasks={filteredTasks}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
            isTaskDueToday={isTaskDueToday}
          />
        </div>

        <div className="notes-column">
          <MemberNotes member={member} />
        </div>
      </div>
    </div>
  );
}
