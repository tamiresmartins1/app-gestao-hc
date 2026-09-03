import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/scheduled-tasks.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ScheduledTasks({ member }) {
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    recurrence: 'semanal',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    loadScheduledTasks();
  }, [member.id]);

  const loadScheduledTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/scheduled-tasks/member/${member.id}`);
      setScheduledTasks(res.data);
    } catch (error) {
      console.error('Erro ao carregar tarefas programadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = editingId ? { ...formData } : {
        member_id: member.id,
        ...formData
      };

      // Ajusta datas para UTC-3 (adiciona 1 dia)
      if (dataToSend.start_date) {
        const [year, month, day] = dataToSend.start_date.split('-');
        const dayNum = parseInt(day) + 1;
        dataToSend.start_date = `${year}-${month}-${String(dayNum).padStart(2, '0')}`;
      }
      if (dataToSend.end_date) {
        const [year, month, day] = dataToSend.end_date.split('-');
        const dayNum = parseInt(day) + 1;
        dataToSend.end_date = `${year}-${month}-${String(dayNum).padStart(2, '0')}`;
      }

      if (editingId) {
        await axios.patch(`${API_URL}/scheduled-tasks/${editingId}`, dataToSend);
      } else {
        await axios.post(`${API_URL}/scheduled-tasks`, dataToSend);
      }

      setFormData({
        title: '',
        description: '',
        recurrence: 'semanal',
        start_date: '',
        end_date: ''
      });
      setEditingId(null);
      setShowForm(false);
      loadScheduledTasks();
    } catch (error) {
      console.error('Erro ao salvar tarefa programada:', error);
      alert('Erro ao salvar: ' + error.response?.data?.error);
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setFormData({
      title: task.title,
      description: task.description || '',
      recurrence: task.recurrence,
      start_date: task.start_date,
      end_date: task.end_date
    });
    setShowForm(true);
  };

  const handleUpdate = async (id, updates) => {
    try {
      await axios.patch(`${API_URL}/scheduled-tasks/${id}`, updates);
      loadScheduledTasks();
    } catch (error) {
      console.error('Erro ao atualizar tarefa programada:', error);
      alert('Erro ao atualizar: ' + error.response?.data?.error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que quer deletar esta tarefa programada?')) {
      try {
        await axios.delete(`${API_URL}/scheduled-tasks/${id}`);
        loadScheduledTasks();
      } catch (error) {
        console.error('Erro ao deletar tarefa programada:', error);
        alert('Erro ao deletar: ' + error.response?.data?.error);
      }
    }
  };

  const getRecurrenceLabel = (rec) => {
    const labels = {
      'diario': '📅 Diário',
      'semanal': '📅 Semanal',
      'quinzenal': '📅 Quinzenal',
      'mensal': '📅 Mensal'
    };
    return labels[rec] || rec;
  };

  return (
    <div className="scheduled-tasks-container">
      <div className="scheduled-header">
        <h3>📋 Tarefas Programadas</h3>
        <button
          className="btn-new-scheduled"
          onClick={() => {
            if (editingId) {
              setEditingId(null);
              setFormData({
                title: '',
                description: '',
                recurrence: 'semanal',
                start_date: '',
                end_date: ''
              });
            }
            setShowForm(!showForm);
          }}
        >
          {showForm ? '✕ Cancelar' : '+ Nova Programação'}
        </button>
      </div>

      {showForm && (
        <form className="scheduled-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nome da Tarefa *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Reunião semanal"
                required
              />
            </div>

            <div className="form-group">
              <label>Recorrência *</label>
              <select
                value={formData.recurrence}
                onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
              >
                <option value="diario">Diário</option>
                <option value="semanal">Semanal</option>
                <option value="quinzenal">Quinzenal</option>
                <option value="mensal">Mensal</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição da tarefa (opcional)"
              rows="2"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data de Início *</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Data de Término *</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-submit-scheduled">Salvar Programação</button>
        </form>
      )}

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : scheduledTasks.length === 0 ? (
        <div className="empty-state">
          <p>✨ Nenhuma tarefa programada!</p>
        </div>
      ) : (
        <div className="scheduled-list">
          {scheduledTasks.map((task) => (
            <div key={task.id} className="scheduled-card">
              <div className="scheduled-header-card">
                <div>
                  <h4>{task.title}</h4>
                  <p className="scheduled-description">{task.description}</p>
                </div>
                <div className="scheduled-recurrence">
                  {getRecurrenceLabel(task.recurrence)}
                </div>
              </div>

              <div className="scheduled-dates">
                <span>📅 {new Date(task.start_date).toLocaleDateString('pt-BR')} até {new Date(task.end_date).toLocaleDateString('pt-BR')}</span>
              </div>

              <div className="scheduled-actions">
                <button
                  className="btn-edit"
                  onClick={() => handleEdit(task)}
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(task.id)}
                  title="Deletar"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
