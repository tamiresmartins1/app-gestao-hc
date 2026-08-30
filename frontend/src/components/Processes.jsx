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
    responsible_ids: [],
    participant_ids: [],
    depends_on_id: null
  });
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [selectedProcessDetails, setSelectedProcessDetails] = useState(null);
  const [editingProcess, setEditingProcess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const loadProcessDetails = async (processId) => {
    try {
      const res = await axios.get(`${API_URL}/processes/${processId}`);
      setSelectedProcessDetails(res.data);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    }
  };

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
        responsible_ids: [],
        participant_ids: [],
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

      {selectedProcessDetails && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }} onClick={() => setSelectedProcessDetails(null)}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h2>{selectedProcessDetails.name}</h2>
            {selectedProcessDetails.description && (
              <p style={{ color: '#666', marginBottom: '20px' }}>
                {selectedProcessDetails.description}
              </p>
            )}

            {selectedProcessDetails.due_date && (
              <div style={{ marginBottom: '20px', padding: '10px', background: '#fff3cd', borderRadius: '4px' }}>
                📅 <strong>Prazo:</strong> {new Date(selectedProcessDetails.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}
              </div>
            )}

            <h3 style={{ marginTop: '20px', marginBottom: '15px' }}>
              👨‍💼 Responsáveis - Marque quando terminar:
            </h3>

            <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '4px' }}>
              {selectedProcessDetails.completion_status && selectedProcessDetails.completion_status.length > 0 ? (
                selectedProcessDetails.completion_status.map(status => (
                  <div key={status.member_id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px',
                    marginBottom: '10px',
                    background: status.completed ? '#e8f5e9' : '#f5f5f5',
                    borderRadius: '4px'
                  }}>
                    <input
                      type="checkbox"
                      checked={status.completed}
                      onChange={async (e) => {
                        try {
                          await axios.put(`${API_URL}/processes/${selectedProcessDetails.id}/member-complete/${status.member_id}`);
                          loadProcessDetails(selectedProcessDetails.id);
                          loadProcesses();
                        } catch (error) {
                          alert('Erro ao marcar conclusão: ' + error.response?.data?.error);
                        }
                      }}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <span style={{ flex: 1, fontWeight: status.completed ? 'bold' : 'normal' }}>
                      {status.name}
                    </span>
                    {status.completed && <span style={{ color: '#4CAF50' }}>✓ Concluído</span>}
                  </div>
                ))
              ) : (
                <p style={{ color: '#999' }}>Nenhum responsável atribuído</p>
              )}
            </div>

            <button
              onClick={() => setSelectedProcessDetails(null)}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#f5f5f5',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {editingProcess && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setEditingProcess(null)}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }} onClick={(e) => e.stopPropagation()}>
            <h3>Editar Processo</h3>
            <input
              type="text"
              placeholder="Nome"
              value={editingProcess.name}
              onChange={(e) => setEditingProcess({ ...editingProcess, name: e.target.value })}
              style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
            />
            <textarea
              placeholder="Descrição"
              value={editingProcess.description || ''}
              onChange={(e) => setEditingProcess({ ...editingProcess, description: e.target.value })}
              rows="3"
              style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={async () => {
                  try {
                    await axios.put(`${API_URL}/processes/${editingProcess.id}`, editingProcess);
                    loadProcesses();
                    setEditingProcess(null);
                  } catch (error) {
                    alert('Erro ao atualizar: ' + error.response?.data?.error);
                  }
                }}
                style={{ flex: 1, padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Salvar
              </button>
              <button
                onClick={() => setEditingProcess(null)}
                style={{ flex: 1, padding: '10px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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

          <label style={{ display: 'block', marginTop: '15px', fontWeight: 'bold' }}>
            👨‍💼 Responsáveis pelo processo (executam o trabalho - pode selecionar várias):
          </label>
          <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px', marginTop: '5px' }}>
            {members.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '12px' }}>
                <input
                  type="checkbox"
                  id={`responsible-${m.id}`}
                  checked={formData.responsible_ids.includes(m.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        responsible_ids: [...formData.responsible_ids, m.id]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        responsible_ids: formData.responsible_ids.filter(id => id !== m.id)
                      });
                    }
                  }}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0, marginTop: '2px' }}
                />
                <label htmlFor={`responsible-${m.id}`} style={{ cursor: 'pointer', margin: 0, lineHeight: '1.4' }}>
                  {m.name}
                </label>
              </div>
            ))}
          </div>

          <label style={{ display: 'block', marginTop: '15px', fontWeight: 'bold' }}>
            👥 Participantes da próxima etapa (recebem alerta quando responsáveis terminam):
          </label>
          <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px', marginTop: '5px' }}>
            {members.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '12px' }}>
                <input
                  type="checkbox"
                  id={`participant-${m.id}`}
                  checked={formData.participant_ids.includes(m.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData({
                        ...formData,
                        participant_ids: [...formData.participant_ids, m.id]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        participant_ids: formData.participant_ids.filter(id => id !== m.id)
                      });
                    }
                  }}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0, marginTop: '2px' }}
                />
                <label htmlFor={`participant-${m.id}`} style={{ cursor: 'pointer', margin: 0, lineHeight: '1.4' }}>
                  {m.name}
                </label>
              </div>
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
              onClick={() => {
                setSelectedProcess(process.id);
                loadProcessDetails(process.id);
              }}
            >
              <div className="process-header">
                <h4>{process.name}</h4>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    className="btn-edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProcess(process);
                    }}
                    style={{ padding: '6px 10px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    ✏️
                  </button>
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

              <div className="process-meta" style={{ alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  {process.due_date && (
                    <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#d32f2f' }}>
                      📅 Prazo: {new Date(process.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </div>
                  )}
                  <select
                    value={process.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusChange(process.id, e.target.value);
                    }}
                    className="status-select"
                    style={{ width: '100%' }}
                  >
                    <option value="em_progresso">Em Progresso</option>
                    <option value="pausado">Pausado</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </div>
              </div>

              {process.assigned_members && process.assigned_members.length > 0 && (
                <div className="process-members">
                  <h5>👨‍💼 Responsáveis ({process.assigned_members.length})</h5>
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
