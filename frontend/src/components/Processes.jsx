import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import '../styles/processes.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const formatDueDate = (dueDate) => {
  if (!dueDate) return null;

  try {
    const date = new Date(dueDate + 'T00:00:00');
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    console.error('Erro ao formatar data:', dueDate, error);
    return null;
  }
};

export default function Processes({ members }) {
  const [processes, setProcesses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    owner_id: members[0]?.id || '',
    due_date: '',
    category: 'Auditoria',
    responsible_ids: [],
    participant_ids: [],
    depends_on_id: null
  });
  const [filter, setFilter] = useState('all');
  const [customCategory, setCustomCategory] = useState('');

  const defaultCategories = [
    'Auditoria',
    'Fechamento de Indicador',
    'Reunião Clínica Agenda'
  ];
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

      await axios.post(`${API_URL}/processes`, dataToSend);
      setFormData({
        name: '',
        description: '',
        owner_id: members[0]?.id || '',
        due_date: '',
        category: 'Auditoria',
        responsible_ids: [],
        participant_ids: [],
        depends_on_id: null
      });
      setCustomCategory('');
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

            {formatDueDate(selectedProcessDetails.due_date) ? (
              <div style={{ marginBottom: '20px', padding: '10px', background: '#fff3cd', borderRadius: '4px' }}>
                📅 <strong>Prazo:</strong> {formatDueDate(selectedProcessDetails.due_date)}
              </div>
            ) : (
              <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '4px', color: '#666' }}>
                ⏰ <strong>Sem prazo definido</strong>
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

            <div style={{ marginTop: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                📅 Editar Prazo:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="date"
                  value={selectedProcessDetails.due_date || ''}
                  onChange={(e) => {
                    setSelectedProcessDetails({ ...selectedProcessDetails, due_date: e.target.value });
                  }}
                  style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <button
                  onClick={async () => {
                    try {
                      await axios.put(`${API_URL}/processes/${selectedProcessDetails.id}`, {
                        due_date: selectedProcessDetails.due_date
                      });
                      loadProcessDetails(selectedProcessDetails.id);
                      loadProcesses();
                    } catch (error) {
                      alert('Erro ao atualizar prazo: ' + error.response?.data?.error);
                    }
                  }}
                  style={{
                    padding: '8px 15px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Salvar
                </button>
              </div>
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
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          overflowY: 'auto'
        }} onClick={() => setEditingProcess(null)}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '8px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '95vh',
            overflowY: 'auto',
            margin: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '30px', borderBottom: '2px solid #4CAF50', paddingBottom: '15px' }}>✏️ Editar Processo</h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>📝 Nome:</label>
              <input
                type="text"
                placeholder="Nome do processo"
                value={editingProcess.name}
                onChange={(e) => setEditingProcess({ ...editingProcess, name: e.target.value })}
                style={{ width: '100%', padding: '12px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>📄 Descrição:</label>
              <textarea
                placeholder="Descrição (opcional)"
                value={editingProcess.description || ''}
                onChange={(e) => setEditingProcess({ ...editingProcess, description: e.target.value })}
                rows="4"
                style={{ width: '100%', padding: '12px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>📂 Categoria:</label>
              <input
                type="text"
                value={editingProcess.category || ''}
                onChange={(e) => setEditingProcess({ ...editingProcess, category: e.target.value })}
                style={{ width: '100%', padding: '12px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>📅 Prazo:</label>
              <input
                type="date"
                value={editingProcess.due_date || ''}
                onChange={(e) => setEditingProcess({ ...editingProcess, due_date: e.target.value })}
                style={{ width: '100%', padding: '12px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>📊 Status:</label>
              <select
                value={editingProcess.status}
                onChange={(e) => setEditingProcess({ ...editingProcess, status: e.target.value })}
                style={{ width: '100%', padding: '12px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd', fontSize: '16px' }}
              >
                <option value="em_progresso">Em Progresso</option>
                <option value="pausado">Pausado</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>

            <div style={{ marginBottom: '30px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', fontSize: '16px' }}>
                👨‍💼 Responsáveis (pode selecionar várias):
              </label>
              <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '4px', background: '#f9f9f9' }}>
                {members.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '12px' }}>
                    <input
                      type="checkbox"
                      id={`edit-resp-${m.id}`}
                      checked={editingProcess.responsible_ids?.includes(m.id) || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditingProcess({
                            ...editingProcess,
                            responsible_ids: [...(editingProcess.responsible_ids || []), m.id]
                          });
                        } else {
                          setEditingProcess({
                            ...editingProcess,
                            responsible_ids: (editingProcess.responsible_ids || []).filter(id => id !== m.id)
                          });
                        }
                      }}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <label htmlFor={`edit-resp-${m.id}`} style={{ cursor: 'pointer', margin: 0, flex: 1 }}>
                      {m.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
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
                style={{ flex: 1, padding: '14px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
              >
                💾 Salvar Tudo
              </button>
              <button
                onClick={() => setEditingProcess(null)}
                style={{ flex: 1, padding: '14px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
              >
                ❌ Cancelar
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

          <label style={{ display: 'block', marginTop: '15px', fontWeight: 'bold', marginBottom: '10px' }}>
            📂 Categoria:
          </label>
          <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
            {defaultCategories.map(cat => (
              <div key={cat} style={{ marginBottom: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, category: cat });
                    setCustomCategory('');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: formData.category === cat && customCategory === '' ? '#4CAF50' : '#f5f5f5',
                    color: formData.category === cat && customCategory === '' ? 'white' : '#333',
                    border: formData.category === cat && customCategory === '' ? '2px solid #4CAF50' : '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  {cat}
                </button>
              </div>
            ))}
          </div>

          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            ✏️ Ou escreva uma categoria diferente:
          </label>
          <input
            type="text"
            placeholder="Digite uma categoria customizada..."
            value={customCategory}
            onChange={(e) => {
              setCustomCategory(e.target.value);
              if (e.target.value) {
                setFormData({ ...formData, category: e.target.value });
              }
            }}
            style={{ width: '100%', padding: '10px', marginBottom: '15px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
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
        <>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', overflowX: 'auto', paddingBottom: '10px' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '8px 15px',
                background: filter === 'all' ? '#4CAF50' : '#f0f0f0',
                color: filter === 'all' ? 'white' : '#333',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                whiteSpace: 'nowrap'
              }}
            >
              📊 Todos ({processes.length})
            </button>
            {[...new Set(processes.map(p => p.category))].sort().map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  padding: '8px 15px',
                  background: filter === cat ? '#4CAF50' : '#f0f0f0',
                  color: filter === cat ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap'
                }}
              >
                📁 {cat} ({processes.filter(p => p.category === cat).length})
              </button>
            ))}
          </div>

          <div className="processes-grid">
          {processes
            .filter(p => filter === 'all' || p.category === filter)
            .map(process => (
            <div
              key={process.id}
              className="process-card"
              onClick={() => {
                setSelectedProcess(process.id);
                loadProcessDetails(process.id);
              }}
            >
              <div className="process-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>{process.name}</h4>
                  <span style={{
                    display: 'inline-block',
                    background: '#e3f2fd',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#1976D2',
                    whiteSpace: 'nowrap'
                  }}>
                    📁 {process.category || 'Sem categoria'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
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
                  {formatDueDate(process.due_date) ? (
                    <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#d32f2f' }}>
                      📅 Prazo: {formatDueDate(process.due_date)}
                    </div>
                  ) : (
                    <div style={{ marginBottom: '8px', fontSize: '12px', color: '#999' }}>
                      ⏰ Sem prazo definido
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
        </>
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
