import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import '../styles/processes.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MONTHS = [
  { num: '01', name: 'Janeiro' },
  { num: '02', name: 'Fevereiro' },
  { num: '03', name: 'Março' },
  { num: '04', name: 'Abril' },
  { num: '05', name: 'Maio' },
  { num: '06', name: 'Junho' },
  { num: '07', name: 'Julho' },
  { num: '08', name: 'Agosto' },
  { num: '09', name: 'Setembro' },
  { num: '10', name: 'Outubro' },
  { num: '11', name: 'Novembro' },
  { num: '12', name: 'Dezembro' }
];

const CATEGORIES = [
  'Auditoria',
  'Fechamento Indicadores Matriz',
  'Reunião Clínica Agenda'
];

export default function Processes({ members, notifications: notificationsFromProps = [], onUnreadNotificationsUpdate }) {
  const [processes, setProcesses] = useState([]);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedProcesses, setExpandedProcesses] = useState({});
  const [selectedResponsible, setSelectedResponsible] = useState({});
  const [duplicatingProcess, setDuplicatingProcess] = useState(null);
  const [duplicateMonth, setDuplicateMonth] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const [formLines, setFormLines] = useState(() => {
    const ownerMember = members && members.length > 0 ? members[0] : { id: '1', name: 'Membro 1' };
    return [{
      id: Math.random(),
      name: '',
      description: '',
      category: 'Auditoria',
      owner_id: ownerMember.id,
      responsible_ids: [],
      participant_ids: []
    }];
  });

  useEffect(() => {
    loadProcesses();
  }, []);

  // Se não tem membros, usar membros de teste
  const availableMembers = members && members.length > 0 ? members : [
    { id: '1', name: 'Membro 1' },
    { id: '2', name: 'Membro 2' },
    { id: '3', name: 'Membro 3' }
  ];

  const loadProcesses = async () => {
    try {
      const res = await axios.get(`${API_URL}/processes`);
      setProcesses(res.data);
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
    }
  };

  const toggleMonth = (monthNum) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthNum]: !prev[monthNum]
    }));
  };

  const handleAddProcess = async (lineIndex) => {
    if (!selectedMonth) {
      alert('Selecione um mês');
      return;
    }

    const line = formLines[lineIndex];
    if (!line.name || line.responsible_ids.length === 0) {
      alert('Nome e responsáveis são obrigatórios');
      return;
    }

    try {
      const year = new Date().getFullYear();

      // Só usar owner_id real (não dummy)
      const realOwner = members && members.length > 0 ? members[0].id : null;
      if (!realOwner) {
        alert('Carregando membros... tente novamente em alguns segundos');
        return;
      }

      // Filtrar IDs de responsáveis que são reais (não dummy)
      const realResponsibleIds = line.responsible_ids.filter(id =>
        members.some(m => m.id === id)
      );

      if (realResponsibleIds.length === 0) {
        alert('Nenhum responsável real selecionado. Aguarde o carregamento dos membros.');
        return;
      }

      const dataToSend = {
        name: line.name,
        description: line.description,
        owner_id: realOwner,
        category: line.category,
        responsible_ids: realResponsibleIds,
        participant_ids: line.participant_ids.filter(id => members.some(m => m.id === id)),
        process_month: `${year}-${selectedMonth}`,
        due_date: `${year}-${selectedMonth}-01`
      };

      await axios.post(`${API_URL}/processes`, dataToSend);

      // Remove a linha adicionada
      setFormLines(prev => prev.filter((_, i) => i !== lineIndex));

      // Se não tem mais linhas, add uma vazia
      if (formLines.length === 1) {
        setFormLines([{
          id: Math.random(),
          name: '',
          description: '',
          category: 'Auditoria',
          responsible_ids: [],
          participant_ids: []
        }]);
      }

      loadProcesses();
    } catch (error) {
      alert('Erro ao criar processo: ' + error.response?.data?.error);
    }
  };

  const addLine = () => {
    setFormLines(prev => [...prev, {
      id: Math.random(),
      name: '',
      description: '',
      category: 'Auditoria',
      owner_id: members[0]?.id || '',
      responsible_ids: [],
      participant_ids: []
    }]);
  };

  const updateLine = (index, field, value) => {
    setFormLines(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateLineCheckbox = (index, field, memberId) => {
    setFormLines(prev => {
      const updated = [...prev];
      const line = { ...updated[index] };
      const ids = line[field] || [];

      if (ids.includes(memberId)) {
        line[field] = ids.filter(id => id !== memberId);
      } else {
        line[field] = [...ids, memberId];
      }

      updated[index] = line;
      return updated;
    });
  };

  const removeLine = (index) => {
    if (formLines.length === 1) {
      setFormLines([{
        id: Math.random(),
        name: '',
        description: '',
        category: 'Auditoria',
        owner_id: members[0]?.id || '',
        responsible_ids: [],
        participant_ids: []
      }]);
    } else {
      setFormLines(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSaveAll = async () => {
    if (!selectedMonth) {
      alert('Selecione um mês');
      return;
    }

    // Filtrar linhas que têm nome
    const linesToSave = formLines.filter(line => line.name && line.name.trim());

    if (linesToSave.length === 0) {
      alert('Nenhum processo para salvar');
      return;
    }

    // Verificar se tem membros reais
    const realOwner = members && members.length > 0 ? members[0].id : null;
    if (!realOwner) {
      alert('Carregando membros... tente novamente em alguns segundos');
      return;
    }

    try {
      const year = new Date().getFullYear();
      let successCount = 0;
      let errorCount = 0;

      for (let line of linesToSave) {
        // Filtrar IDs reais
        const realResponsibleIds = line.responsible_ids.filter(id =>
          members.some(m => m.id === id)
        );

        if (realResponsibleIds.length === 0) {
          errorCount++;
          continue;
        }

        const dataToSend = {
          name: line.name,
          description: line.description,
          owner_id: realOwner,
          category: line.category,
          responsible_ids: realResponsibleIds,
          participant_ids: line.participant_ids.filter(id => members.some(m => m.id === id)),
          process_month: `${year}-${selectedMonth}`,
          due_date: `${year}-${selectedMonth}-01`
        };

        try {
          await axios.post(`${API_URL}/processes`, dataToSend);
          successCount++;
        } catch (error) {
          console.error('Erro ao salvar processo:', line.name, error);
          errorCount++;
        }
      }

      alert(`✅ ${successCount} processo(s) salvo(s)${errorCount > 0 ? ` | ❌ ${errorCount} erro(s)` : ''}`);

      if (successCount > 0) {
        // Limpar formulário
        setFormLines([{
          id: Math.random(),
          name: '',
          description: '',
          category: 'Auditoria',
          owner_id: realOwner,
          responsible_ids: [],
          participant_ids: []
        }]);
        setSelectedMonth(null);
        setShowForm(false);
        loadProcesses();
      }
    } catch (error) {
      alert('Erro ao salvar: ' + error.message);
    }
  };

  const handleDeleteProcess = async (processId) => {
    if (!window.confirm('Tem certeza?')) return;
    try {
      await axios.delete(`${API_URL}/processes/${processId}`);
      loadProcesses();
    } catch (error) {
      alert('Erro ao deletar: ' + error.response?.data?.error);
    }
  };

  const getProcessesByMonthAndCategory = (monthNum, category) => {
    const year = new Date().getFullYear();
    const monthKey = `${year}-${monthNum}`;

    return processes.filter(p =>
      p.process_month === monthKey &&
      p.category === category &&
      p.status !== 'concluido'
    );
  };

  const handleMarkComplete = async (processId, memberId) => {
    try {
      if (!memberId) {
        alert('Selecione um responsável');
        return;
      }

      await axios.put(`${API_URL}/processes/${processId}/member-complete/${memberId}`);
      setSelectedResponsible(prev => ({
        ...prev,
        [processId]: null
      }));
      loadProcesses();
    } catch (error) {
      alert('Erro ao marcar como concluído: ' + error.response?.data?.error);
    }
  };

  const getProcessCompletionInfo = (processId) => {
    const process = processes.find(p => p.id === processId);
    if (!process) return { completed: 0, total: 0, percentage: 0 };

    // This would need to come from backend completion_status table
    // For now, we'll pass an empty object
    return { completed: 0, total: 0, percentage: 0 };
  };

  const handleDuplicateProcess = async (process, targetMonth) => {
    if (!targetMonth) {
      alert('Selecione um mês');
      return;
    }

    try {
      const year = new Date().getFullYear();
      const dataToSend = {
        name: process.name,
        description: process.description,
        owner_id: process.owner_id,
        category: process.category,
        responsible_ids: process.assigned_members?.map(m => m.id) || [],
        participant_ids: [],
        process_month: `${year}-${targetMonth}`,
        due_date: `${year}-${targetMonth}-01`
      };

      await axios.post(`${API_URL}/processes`, dataToSend);
      setDuplicatingProcess(null);
      setDuplicateMonth(null);
      loadProcesses();
      alert('✅ Processo duplicado com sucesso!');
    } catch (error) {
      alert('Erro ao duplicar: ' + error.response?.data?.error);
    }
  };

  const getAvailableMonths = () => {
    return MONTHS.map(month => ({
      ...month,
      key: month.num
    }));
  };

  return (
    <div className="processes-new">
      <div className="processes-header">
        <h2>🔗 Processos e Dependências</h2>
        <button
          className="btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setSelectedMonth(null);
          }}
        >
          {showForm ? '✕ Cancelar' : '+ Adicionar Processo'}
        </button>
      </div>

      {showForm && (
        <div className="process-form">
          <h3>Criar Novo Processo</h3>

          <div className="form-group">
            <label>Mês *</label>
            <select
              value={selectedMonth || ''}
              onChange={(e) => setSelectedMonth(e.target.value)}
              required
            >
              <option value="">Selecione um mês</option>
              {getAvailableMonths().map(month => (
                <option key={month.num} value={month.num}>
                  {month.name}
                </option>
              ))}
            </select>
          </div>

          <div className="process-lines">
            {formLines.map((line, index) => (
              <div key={line.id} className="process-line">
                <div className="line-inputs">
                  <input
                    type="text"
                    value={line.name}
                    onChange={(e) => updateLine(index, 'name', e.target.value)}
                    placeholder="Nome do processo"
                    className="line-input-main"
                  />

                  <select
                    value={line.category}
                    onChange={(e) => updateLine(index, 'category', e.target.value)}
                    className="line-input-category"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <textarea
                    value={line.description}
                    onChange={(e) => updateLine(index, 'description', e.target.value)}
                    placeholder="Descrição"
                    rows="1"
                    className="line-input-desc"
                  />
                </div>

                <div className="line-checkboxes">
                  <div className="checkbox-section">
                    <label className="section-label">👤 Responsáveis</label>
                    <div className="checkbox-group-inline">
                      {availableMembers.map(member => (
                        <div key={member.id} className="checkbox-item-inline">
                          <input
                            type="checkbox"
                            id={`resp-${index}-${member.id}`}
                            checked={line.responsible_ids.includes(member.id)}
                            onChange={() => updateLineCheckbox(index, 'responsible_ids', member.id)}
                          />
                          <label htmlFor={`resp-${index}-${member.id}`}>{member.name}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="checkbox-section">
                    <label className="section-label">🔄 Próximas</label>
                    <div className="checkbox-group-inline">
                      {availableMembers.map(member => (
                        <div key={member.id} className="checkbox-item-inline">
                          <input
                            type="checkbox"
                            id={`part-${index}-${member.id}`}
                            checked={line.participant_ids.includes(member.id)}
                            onChange={() => updateLineCheckbox(index, 'participant_ids', member.id)}
                          />
                          <label htmlFor={`part-${index}-${member.id}`}>{member.name}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="line-actions">
                  <button
                    type="button"
                    className="btn-remove-line"
                    onClick={() => removeLine(index)}
                  >
                    ✕ Remover Linha
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-add-another" onClick={addLine}>
              + Adicionar Linha
            </button>
            <button
              type="button"
              className="btn-save-all"
              onClick={handleSaveAll}
              disabled={!selectedMonth || formLines.every(line => !line.name)}
            >
              💾 Salvar Tudo
            </button>
          </div>
        </div>
      )}

      <div className="months-grid">
        {getAvailableMonths().map(month => (
          <div key={month.num} className="month-card">
            <div
              className="month-header"
              onClick={() => toggleMonth(month.num)}
            >
              <h3>{month.name}</h3>
              {expandedMonths[month.num] ? <FiChevronUp /> : <FiChevronDown />}
            </div>

            {expandedMonths[month.num] && (
              <div className="month-content">
                {CATEGORIES.map(category => {
                  const categoryKey = `${month.num}-${category}`;
                  const categoryProcesses = getProcessesByMonthAndCategory(month.num, category);
                  const isExpanded = expandedCategories[categoryKey];

                  return (
                    <div key={category} className="category-section">
                      <div
                        className="category-header"
                        onClick={() => setExpandedCategories(prev => ({
                          ...prev,
                          [categoryKey]: !prev[categoryKey]
                        }))}
                      >
                        <h4>{category}</h4>
                        {categoryProcesses.length > 0 && (
                          <span className="category-count">{categoryProcesses.length}</span>
                        )}
                        <span className="category-toggle">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </div>

                      {isExpanded && (
                        <>
                          {categoryProcesses.length === 0 ? (
                            <p className="empty">Nenhum processo</p>
                          ) : (
                            <div className="processes-list">
                          {categoryProcesses.map(process => (
                            <div key={process.id} className="process-item">
                              <div
                                className="process-info"
                                onClick={() => setExpandedProcesses(prev => ({
                                  ...prev,
                                  [process.id]: !prev[process.id]
                                }))}
                              >
                                <h5>{process.name}</h5>
                                {expandedProcesses[process.id] && (
                                  <>
                                    <p>{process.description}</p>
                                    <div className="process-meta">
                                      {process.due_date && (
                                        <small className="due-date">📅 {new Date(process.due_date + 'T00:00:00').toLocaleDateString('pt-BR')}</small>
                                      )}
                                      {process.completion_status && process.completion_status.total > 0 ? (
                                        <div className="completion-bar">
                                          <div className="completion-progress" style={{width: `${process.completion_status.percentage}%`}}></div>
                                          <small>{process.completion_status.completed}/{process.completion_status.total} concluído</small>
                                        </div>
                                      ) : (
                                        <small>{process.status}</small>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                              {expandedProcesses[process.id] && (
                                <div className="process-actions">
                                  <div className="responsible-selector">
                                    <label>Quem completou?</label>
                                    <select
                                      value={selectedResponsible[process.id] || ''}
                                      onChange={(e) => setSelectedResponsible(prev => ({
                                        ...prev,
                                        [process.id]: e.target.value
                                      }))}
                                    >
                                      <option value="">Selecione...</option>
                                      {process.assigned_members && process.assigned_members.map(member => (
                                        <option key={member.id} value={member.id}>
                                          {member.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="process-actions-buttons">
                                    <button
                                      className="btn-complete"
                                      onClick={() => handleMarkComplete(process.id, selectedResponsible[process.id])}
                                      disabled={!selectedResponsible[process.id]}
                                    >
                                      ✓ Marcar Concluído
                                    </button>
                                    <button
                                      className="btn-duplicate"
                                      onClick={() => setDuplicatingProcess(process.id)}
                                      title="Duplicar para outro mês"
                                    >
                                      📋 Duplicar
                                    </button>
                                    <button
                                      className="btn-delete"
                                      onClick={() => handleDeleteProcess(process.id)}
                                    >
                                      <FiTrash2 />
                                    </button>
                                  </div>

                                  {duplicatingProcess === process.id && (
                                    <div className="duplicate-selector">
                                      <label>Duplicar para qual mês?</label>
                                      <div className="duplicate-months">
                                        {MONTHS.map(m => (
                                          <button
                                            key={m.num}
                                            className="month-btn"
                                            onClick={() => handleDuplicateProcess(process, m.num)}
                                          >
                                            {m.name}
                                          </button>
                                        ))}
                                      </div>
                                      <button
                                        className="btn-cancel-duplicate"
                                        onClick={() => setDuplicatingProcess(null)}
                                      >
                                        ✕ Cancelar
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
