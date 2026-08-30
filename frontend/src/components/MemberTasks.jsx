import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import '../styles/member-tasks.css';

export default function MemberTasks({ member, tasks, members, onAddTask, onUpdateTask, onDeleteTask }) {
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => t.status === 'ativa').length,
    overdue: tasks.filter(t => t.status === 'atrasada').length,
    completed: tasks.filter(t => t.status === 'concluída').length
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const getTasksByStatus = (status) => filteredTasks.filter(t => t.status === status);

  return (
    <div className="member-tasks">
      <div className="tasks-header">
        <h2>Tarefas de {member.name}</h2>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <FiPlus /> Nova Tarefa
        </button>
      </div>

      {showForm && (
        <TaskForm
          member={member}
          members={members}
          onSubmit={async (data) => {
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
        <div className="view-modes">
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            Lista
          </button>
          <button
            className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            Kanban
          </button>
          <button
            className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            Calendário
          </button>
        </div>

        <div className="filters">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Todos os status</option>
            <option value="ativa">Ativas</option>
            <option value="atrasada">Atrasadas</option>
            <option value="concluída">Concluídas</option>
          </select>

          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="all">Todas as prioridades</option>
            <option value="alta">Alta</option>
            <option value="média">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>
      </div>

      {viewMode === 'list' && (
        <TaskList
          tasks={filteredTasks}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
        />
      )}

      {viewMode === 'kanban' && (
        <div className="kanban-board">
          <div className="kanban-column">
            <h3 className="kanban-title">Ativas</h3>
            <TaskList
              tasks={getTasksByStatus('ativa')}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
              compact
            />
          </div>
          <div className="kanban-column">
            <h3 className="kanban-title">Atrasadas</h3>
            <TaskList
              tasks={getTasksByStatus('atrasada')}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
              compact
            />
          </div>
          <div className="kanban-column">
            <h3 className="kanban-title">Concluídas</h3>
            <TaskList
              tasks={getTasksByStatus('concluída')}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
              compact
            />
          </div>
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className="calendar-view">
          <p>📅 Visualização de calendário (próximas tarefas ordenadas por data)</p>
          <TaskList
            tasks={[...filteredTasks].sort((a, b) =>
              new Date(a.due_date) - new Date(b.due_date)
            )}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
          />
        </div>
      )}
    </div>
  );
}
