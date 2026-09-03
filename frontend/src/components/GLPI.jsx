import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/glpi.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function GLPI() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    glpi_number: '',
    description: '',
    status: 'ativa'
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/glpi`);
      setTickets(res.data);
    } catch (error) {
      console.error('Erro ao carregar GLPI tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/glpi`, formData);
      setFormData({ glpi_number: '', description: '', status: 'ativa' });
      setShowForm(false);
      loadTickets();
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'ativa' ? 'concluída' : 'ativa';
      await axios.patch(`${API_URL}/glpi/${id}`, { status: newStatus });
      loadTickets();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const deleteTicket = async (id) => {
    if (confirm('Tem certeza que quer deletar este ticket?')) {
      try {
        await axios.delete(`${API_URL}/glpi/${id}`);
        loadTickets();
      } catch (error) {
        console.error('Erro ao deletar ticket:', error);
      }
    }
  };

  return (
    <div className="glpi-container">
      <div className="glpi-header">
        <h2>🛠️ GLPI - Chamados de TI</h2>
        <button
          className="btn-new-ticket"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancelar' : '+ Novo Chamado'}
        </button>
      </div>

      {showForm && (
        <form className="glpi-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Número GLPI</label>
            <input
              type="text"
              value={formData.glpi_number}
              onChange={(e) => setFormData({ ...formData, glpi_number: e.target.value })}
              placeholder="Ex: #12345"
              required
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição do problema..."
              required
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="ativa">Ativa</option>
              <option value="concluída">Concluída</option>
            </select>
          </div>

          <button type="submit" className="btn-submit">Salvar Chamado</button>
        </form>
      )}

      {loading ? (
        <div className="loading">Carregando...</div>
      ) : tickets.length === 0 ? (
        <div className="empty-state">
          <p>✨ Nenhum chamado GLPI no momento!</p>
        </div>
      ) : (
        <div className="glpi-list">
          {tickets.map((ticket) => (
            <div key={ticket.id} className={`glpi-card ${ticket.status}`}>
              <div className="glpi-card-header">
                <div className="glpi-number">#{ticket.glpi_number}</div>
                <div className={`glpi-status ${ticket.status}`}>
                  {ticket.status === 'ativa' ? '🔴 Ativa' : '✅ Concluída'}
                </div>
              </div>

              <div className="glpi-description">
                {ticket.description}
              </div>

              <div className="glpi-footer">
                <div className="glpi-date">
                  📅 {new Date(ticket.opened_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </div>

                <div className="glpi-actions">
                  <button
                    className="btn-toggle"
                    onClick={() => toggleStatus(ticket.id, ticket.status)}
                    title={ticket.status === 'ativa' ? 'Marcar como concluída' : 'Reabrir'}
                  >
                    {ticket.status === 'ativa' ? '✓' : '↻'}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => deleteTicket(ticket.id)}
                    title="Deletar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
