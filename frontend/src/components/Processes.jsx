import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import '../styles/processes.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Processes({ members }) {
  const [processes, setProcesses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    owner_id: members[0]?.id || '',
    due_date: '',
    assigned_member_ids: [],
    depends_on_id: null
  });
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadProcesses();
  }, []);

  const loadProcesses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/processes`);
      setProcesses(res.data);
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      const dataToSend = { ...formData };
      if (dataToSend.due_date) {
        const [year, month, day] = dataToSend.due_date.split('-');
        const dayNum = parseInt(day) + 1;
        dataToSend.due_date = `${year}-${month}-${String(dayNum).padStart(2, '0')}`;
      }

      await axios.post(`${API_URL}/processes`, dataToSend);
      setFormData({
        name: '',
        description: '',
        owner_id: members[0]?.id || '',
        due_date: '',
        assigned_member_ids: [],
        depends_on_id: null
      });
      setShowForm(false);
      loadProcesses();
    } catch (error) {
      alert('Erro ao criar processo: ' + error.response?.data?.error);
    }
  };

  const handleDelete = async (processId) => {
    if (!window.confirm('Deseja deletar este processo?')) return;
    try {
      await axios.delete(`${API_URL}/processes/${processId}`);
      loadProcesses();
      setSelectedProcess(null);
    } catch (error) {
      alert('Erro ao deletar processo: ' + error.response?.data?.error);
    }
  };

  const handleStatusChange = async (processId, newStatus) => {
    try {
      await axios.put(`${API_URL}/processes/${processId}`, { status: newStatus });
      loadProcesses();
    } catch (error) {
      alert('Erro ao atualizar processo: ' + error.response?.data?.error);
    }
  };

  return (
    <div className="processes">
      <div className="processes-header">
        <h2>🔗 Processos e Dependências</h2>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <FiPlus /> Novo Processo
        </button>
      </div>

      {showForm && (
        <form className="process-form" onSubmit={handleSubmit}>
          <h3>Criar Novo Processo</h3>

          <input
            type="text"
            placeholder="Nome do processo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <textarea
            placeholder="Descrição (opcional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="3"
          />

          <input
            type="date"
            placeholder="Prazo"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />

          <select
            value={formData.depends_on_id || ''}
            onChange={(e) => setFormData({ ...formData, depends_on_id: e.target.value || null })}
            style={{ marginTop: '10px' }}
          >
            <option value="">Nenhuma dependência (começa agora)</option>
            {processes
              .filter(p => p.id !== selectedProcess && p.status !== 'concluido')
              .map(p => (
                <option key={p.id} value={p.id}>
                  Aguardar: {p.name} (será desbloqueado quando terminar)
                </option>
              ))}
          </select>

          <label style={{ display: 'block', marginTop: '15px' }}>
            👥 Pessoas que participam do processo (pode selecionar várias):
          </label>
          <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px', marginTop: '5px' }}>
            {members.map(m => (
              <label key={m.id} style={{ display: 'block', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.assigned_member_ids.includes(m.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        assigned_member_ids: [...formData.assigned_member_ids, m.id]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        assigned_member_ids: formData.assigned_member_ids.filter(id => id !== m.id)
                      });
                    }
                  }}
                />
                {m.name}
              </label>
            ))}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">Criar</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div>Carregando...</div>
      ) : processes.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum processo criado ainda</p>
        </div>
      ) : (
        <div className="processes-grid">
          {processes.map(process => (
            <div
              key={process.id}
              className="process-card"
              onClick={() => setSelectedProcess(process.id)}
            >
              <div className="process-header">
                <h4>{process.name}</h4>
                <button
                  className="btn-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(process.id);
                  }}
                >
                  <FiTrash2 />
                </button>
              </div>

              {process.description && (
                <p className="process-description">{process.description}</p>
              )}

              {process.depends_on_id && (
                <div style={{
                  background: '#fff3cd',
                  padding: '8px',
                  borderRadius: '4px',
                  marginBottom: '10px',
                  fontSize: '12px',
                  color: '#856404'
                }}>
                  🔒 <strong>Bloqueado:</strong> Aguardando conclusão do processo anterior
                </div>
              )}

              <div className="process-meta">
                <span>👤 {process.owner_name}</span>
                {process.due_date && (
                  <span>📅 {new Date(process.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                )}
                <select
                  value={process.status}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleStatusChange(process.id, e.target.value);
                  }}
                  className="status-select"
                >
                  <option value="em_progresso">Em Progresso</option>
                  <option value="pausado">Pausado</option>
                  <option value="concluido">Concluído</option>
                </select>
              </div>

              {process.assigned_members && process.assigned_members.length > 0 && (
                <div className="process-members">
                  <h5>👥 Auditando ({process.assigned_members.length})</h5>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {process.assigned_members.map(member => (
                      <span key={member.id} style={{
                        background: '#e3f2fd',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {member.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {process.tasks && process.tasks.length > 0 && (
                <div className="process-tasks">
                  <h5>Tarefas ({process.tasks.length})</h5>
                  <ul>
                    {process.tasks.slice(0, 3).map(task => (
                      <li key={task.id}>{task.title}</li>
                    ))}
                    {process.tasks.length > 3 && (
                      <li className="more">+{process.tasks.length - 3} mais</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="info-section">
        <h3>ℹ️ Sobre Processos</h3>
        <p>
          Processos permitem organizar tarefas interdependentes. Cada processo pode conter
          múltiplas tarefas com dependências de ordem, facilitando o gerenciamento de workflows
          complexos e sequenciais.
        </p>
      </div>
    </div>
  );
}
