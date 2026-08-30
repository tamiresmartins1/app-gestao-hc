import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import '../styles/calendar.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Calendar({ member, members }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'média',
    recurrence_type: 'none',
    recurrence_end_date: ''
  });

  useEffect(() => {
    loadTasks();
  }, [member]);

  const loadTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/tasks?member_id=${member.id}`);
      setTasks(res.data);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const day = parseInt(selectedDate.getDate());
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      const dayStr = String(day).padStart(2, '0');
      const due_date = `${year}-${month}-${dayStr}`;

      await axios.post(`${API_URL}/tasks`, {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        assigned_to: member.id,
        created_by: member.id,
        due_date: due_date,
        recurrence_type: formData.recurrence_type,
        recurrence_end_date: formData.recurrence_end_date || null
      });

      setFormData({ title: '', description: '', priority: 'média', recurrence_type: 'none', recurrence_end_date: '' });
      setShowForm(false);
      loadTasks();
    } catch (error) {
      alert('Erro ao criar tarefa: ' + error.response?.data?.error);
    }
  };

  const getTasksForDate = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    return tasks.filter(t => t.due_date === dateStr);
  };

  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={handlePrevMonth}><FiChevronLeft /></button>
        <h2>{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</h2>
        <button onClick={handleNextMonth}><FiChevronRight /></button>
      </div>

      <div className="calendar-weekdays">
        <div>Dom</div>
        <div>Seg</div>
        <div>Ter</div>
        <div>Qua</div>
        <div>Qui</div>
        <div>Sex</div>
        <div>Sab</div>
      </div>

      <div className="calendar-days">
        {days.map((day, idx) => (
          <div
            key={idx}
            className={`calendar-day ${day ? '' : 'empty'}`}
            onClick={() => day && handleDateClick(day)}
          >
            {day && (
              <>
                <div className="day-header">
                  <div className="day-number">
                    {day}
                  </div>
                  {getTasksForDate(day).length > 0 && (
                    <div className="task-badge">
                      {getTasksForDate(day).length} tarefa{getTasksForDate(day).length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div className="day-tasks">
                  {getTasksForDate(day).map(task => (
                    <div
                      key={task.id}
                      className={`calendar-task ${task.status}`}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {showForm && selectedDate && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nova Tarefa - {selectedDate.toLocaleDateString('pt-BR')}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Digite o título da tarefa"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Digite a descrição (opcional)"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Prioridade</label>
                <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                  <option value="baixa">Baixa</option>
                  <option value="média">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              <div className="form-group">
                <label>Repetição</label>
                <select value={formData.recurrence_type} onChange={(e) => setFormData({ ...formData, recurrence_type: e.target.value })}>
                  <option value="none">Nenhuma</option>
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal (todo {selectedDate.toLocaleString('pt-BR', { weekday: 'long' })})</option>
                  <option value="biweekly">Quinzenal</option>
                  <option value="monthly">Mensal</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>

              {formData.recurrence_type !== 'none' && (
                <div className="form-group">
                  <label>Até quando (deixe em branco para sem fim)</label>
                  <input
                    type="date"
                    value={formData.recurrence_end_date}
                    onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
                  />
                </div>
              )}

              <div className="modal-buttons">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
