import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import '../styles/member-tasks.css';

export default function MemberTasks({ member, tasks, members, onAddTask, onUpdateTask, onDeleteTask }) {
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const isTaskOverdue = (task) => {
    if (task.status === 'concluída') return false;
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => t.status === 'ativa' && !isTaskOverdue(t)).length,
    overdue: tasks.filter(t => isTaskOverdue(t) || t.status === 'atrasada').length,
    completed: tasks.filter(t => t.status === 'concluída').length
  };

  const filteredTasks = tasks
    .filter(task => {
      const statusMatch = filterStatus === 'all' || task.status === filterStatus;
      const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
      return statusMatch && priorityMatch;
    })
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    });

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

      <TaskList
        tasks={filteredTasks}
        onUpdate={onUpdateTask}
        onDelete={onDeleteTask}
      />
    </div>
  );
}
