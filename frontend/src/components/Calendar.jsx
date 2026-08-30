import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import '../styles/calendar.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Calendar({ member, members }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [tasks, setTasks] = useState([]);
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'média'
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

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const handleDateClick = (day) => {
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(month + 1).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    setSelectedDateStr(dateStr);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Preencha o título!');
      return;
    }

    try {
      await axios.post(`${API_URL}/tasks`, {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        assigned_to: member.id,
        created_by: member.id,
        due_date: selectedDateStr
      });

      setFormData({ title: '', description: '', priority: 'média' });
      setShowForm(false);
      setSelectedDateStr(null);
      loadTasks();
    } catch (error) {
      alert('Erro ao criar tarefa');
    }
  };

  const getTasksForDate = (day) => {
    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(month + 1).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    return tasks.filter(t => t.due_date === dateStr);
  };

  const monthName = new Date(year, month).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days = [...Array(firstDay).fill(null), ...Array(daysInMonth).keys().map(i => i + 1)];

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={() => setMonth(m => m === 0 ? 11 : m - 1) || (m === 0 && setYear(y => y - 1))}><FiChevronLeft /></button>
        <h2>{monthName}</h2>
        <button onClick={() => setMonth(m => m === 11 ? 0 : m + 1) || (m === 11 && setYear(y => y + 1))}><FiChevronRight /></button>
      </div>

      <div className="calendar-weekdays">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="calendar-days">
        {days.map((day, idx) => (
          <div key={idx} className={`calendar-day ${!day ? 'empty' : ''}`} onClick={() => day && handleDateClick(day)}>
            {day && (
              <>
                <div className="day-number">{day}</div>
                {getTasksForDate(day).length > 0 && (
                  <div className="task-badge">{getTasksForDate(day).length} tarefa{getTasksForDate(day).length > 1 ? 's' : ''}</div>
                )}
                <div className="day-tasks">
                  {getTasksForDate(day).slice(0, 2).map(task => (
                    <div key={task.id} className={`calendar-task ${task.status}`} title={task.title}>
                      {task.title}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nova Tarefa - {selectedDateStr}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}><FiX /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Título *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Digite o título" />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Digite a descrição (opcional)" />
              </div>

              <div className="form-group">
                <label>Prioridade</label>
                <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                  <option value="baixa">Baixa</option>
                  <option value="média">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              <div className="modal-buttons">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Criar Tarefa</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
