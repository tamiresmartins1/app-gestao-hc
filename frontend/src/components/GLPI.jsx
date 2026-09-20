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
  const [selectedTicketHistory, setSelectedTicketHistory] = useState(null);
  const [ticketHistory, setTicketHistory] = useState([]);
  const [historyByTicket, setHistoryByTicket] = useState({});

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/glpi`);
      setTickets(res.data);

      // Carregar histórico para cada ticket
      const historyMap = {};
      for (const ticket of res.data) {
        try {
          const histRes = await axios.get(`${API_URL}/glpi/${ticket.id}/history`);
          historyMap[ticket.id] = histRes.data;
        } catch (error) {
          console.error(`Erro ao carregar histórico do ticket ${ticket.id}:`, error);
          historyMap[ticket.id] = [];
        }
      }
      setHistoryByTicket(historyMap);
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
      alert('❌ Erro ao atualizar: ' + (error.response?.data?.error || error.message));
    }
  };

  const deleteTicket = async (id) => {
    if (confirm('Tem certeza que quer deletar este ticket?')) {
      try {
        await axios.delete(`${API_URL}/glpi/${id}`);
        loadTickets();
      } catch (error) {
        console.error('Erro ao deletar ticket:', error);
        alert('❌ Erro ao deletar: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const loadHistory = async (ticketId) => {
    try {
      const res = await axios.get(`${API_URL}/glpi/${ticketId}/history`);
      setTicketHistory(res.data);
      setSelectedTicketHistory(ticketId);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const activeTickets = tickets.filter(t => t.status === 'ativa');
  const resolvedTickets = tickets.filter(t => t.status === 'concluída');

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
        <>
          {activeTickets.length > 0 && (
            <div className="glpi-section">
              <h3>📋 Abertos ({activeTickets.length})</h3>
              <div className="glpi-list">
                {activeTickets.map((ticket) => (
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
                          title="Marcar como concluída"
                        >
                          ✓
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
            </div>
          )}

          {resolvedTickets.length > 0 && (
            <div className="glpi-section">
              <h3>📁 Histórico ({resolvedTickets.length})</h3>
              <div className="glpi-list">
                {resolvedTickets.map((ticket) => (
                  <div key={ticket.id} className={`glpi-card ${ticket.status}`}>
                    <div className="glpi-card-header">
                      <div className="glpi-number">#{ticket.glpi_number}</div>
                      <div className={`glpi-status ${ticket.status}`}>
                        ✅ Concluída
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
                        {ticket.closed_at && (
                          <span style={{ marginLeft: '10px' }}>
                            ✅ {new Date(ticket.closed_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                        )}
                      </div>

                      <div className="glpi-actions">
                        <button
                          className="btn-history"
                          onClick={() => loadHistory(ticket.id)}
                          title="Ver histórico"
                        >
                          📋
                        </button>
                        <button
                          className="btn-toggle"
                          onClick={() => toggleStatus(ticket.id, ticket.status)}
                          title="Reabrir"
                        >
                          ↻
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

                    {historyByTicket[ticket.id] && historyByTicket[ticket.id].length > 0 && (
                      <div className="glpi-card-history">
                        <div className="history-timeline">
                          {historyByTicket[ticket.id].map((entry) => (
                            <div key={entry.id} className="history-item">
                              <span className="history-transition">
                                {entry.status_from && <span className="status-badge-small from">{entry.status_from}</span>}
                                <span className="arrow-small">→</span>
                                <span className="status-badge-small to">{entry.status_to}</span>
                              </span>
                              <span className="history-time">
                                {new Date(entry.created_at).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {selectedTicketHistory && (
        <div className="glpi-modal-overlay" onClick={() => setSelectedTicketHistory(null)}>
          <div className="glpi-modal" onClick={(e) => e.stopPropagation()}>
            <div className="glpi-modal-header">
              <h3>📋 Histórico do Ticket</h3>
              <button onClick={() => setSelectedTicketHistory(null)}>✕</button>
            </div>
            <div className="glpi-modal-content">
              {ticketHistory.length === 0 ? (
                <p>Sem histórico registrado</p>
              ) : (
                <div className="history-list">
                  {ticketHistory.map((entry) => (
                    <div key={entry.id} className="history-entry">
                      <div className="history-status">
                        {entry.status_from && <span className="status-badge from">{entry.status_from}</span>}
                        <span className="arrow">→</span>
                        <span className="status-badge to">{entry.status_to}</span>
                      </div>
                      <div className="history-date">
                        📅 {new Date(entry.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
