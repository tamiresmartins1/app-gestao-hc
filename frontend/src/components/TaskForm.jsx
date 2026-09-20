import React, { useState } from 'react';
import '../styles/task-form.css';

export default function TaskForm({ member, members, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: member?.id || '',
    due_date: '',
    priority: 'média'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) return;

    const submitData = { ...formData };
    if (submitData.due_date) {
      submitData.due_date = submitData.due_date.trim();
    }

    onSubmit(submitData);
    setFormData({
      title: '',
      description: '',
      assigned_to: member?.id || '',
      due_date: '',
      priority: 'média'
    });
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Título *</label>
          <input
            type="text"
            placeholder="Nome da tarefa"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Descrição</label>
          <textarea
            placeholder="Detalhes da tarefa (opcional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="3"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Atribuir a</label>
          <select
            value={formData.assigned_to}
            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
          >
            <option value="">Selecione uma pessoa</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Prazo de Entrega</label>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Prioridade</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          >
            <option value="baixa">🟢 Baixa</option>
            <option value="média">🟡 Média</option>
            <option value="alta">🔴 Alta</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          Criar Tarefa
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
