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
  'Fechamento de Indicador',
  'Reunião Clínica Agenda'
];

export default function Processes({ members, notifications: notificationsFromProps = [], onUnreadNotificationsUpdate }) {
  const [processes, setProcesses] = useState([]);
  const [expandedMonths, setExpandedMonths] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    owner_id: members[0]?.id || '',
    category: 'Auditoria',
    responsible_ids: [],
    participant_ids: [],
    depends_on_id: null
  });

  useEffect(() => {
    loadProcesses();
  }, []);

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

  const handleAddProcess = async (e) => {
    e.preventDefault();
    if (!formData.name || !selectedMonth) return;

    try {
      const year = new Date().getFullYear();
      const dataToSend = {
        ...formData,
        process_month: `${year}-${selectedMonth}`,
        due_date: `${year}-${selectedMonth}-01`
      };

      await axios.post(`${API_URL}/processes`, dataToSend);

      // Limpar apenas o nome, manter o mês e categoria
      setFormData(prev => ({
        ...prev,
        name: '',
        description: '',
        responsible_ids: [],
        participant_ids: []
      }));

      loadProcesses();
    } catch (error) {
      alert('Erro ao criar processo: ' + error.response?.data?.error);
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
        <form className="process-form" onSubmit={handleAddProcess}>
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

          <div className="form-group">
            <label>Nome do Processo *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: Auditoria de Estoque"
              required
            />
          </div>

          <div className="form-group">
            <label>Categoria *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descrição do processo"
              rows="3"
            />
          </div>

          <button type="submit" className="btn-submit">
            + Adicionar Processo
          </button>
        </form>
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
                  const categoryProcesses = getProcessesByMonthAndCategory(month.num, category);
                  return (
                    <div key={category} className="category-section">
                      <h4>{category}</h4>
                      {categoryProcesses.length === 0 ? (
                        <p className="empty">Nenhum processo</p>
                      ) : (
                        <div className="processes-list">
                          {categoryProcesses.map(process => (
                            <div key={process.id} className="process-item">
                              <div className="process-info">
                                <h5>{process.name}</h5>
                                <p>{process.description}</p>
                                <small>{process.status}</small>
                              </div>
                              <button
                                className="btn-delete"
                                onClick={() => handleDeleteProcess(process.id)}
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          ))}
                        </div>
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
