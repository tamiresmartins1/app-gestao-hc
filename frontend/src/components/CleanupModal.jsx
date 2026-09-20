import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/cleanup-modal.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CleanupModal() {
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Verifica a cada 24h se deve mostrar o aviso
  useEffect(() => {
    checkCleanup();
  }, []);

  const checkCleanup = async () => {
    try {
      const lastCleanupStr = localStorage.getItem('lastCleanupCheck');
      const lastCleanup = lastCleanupStr ? new Date(lastCleanupStr) : null;
      const now = new Date();

      // Se passou 24h desde última check, verifica novamente
      if (!lastCleanup || (now - lastCleanup) > 24 * 60 * 60 * 1000) {
        localStorage.setItem('lastCleanupCheck', now.toISOString());

        const res = await axios.get(`${API_URL}/cleanup/stats`);
        const totalToDelete = res.data.messages + res.data.glpi;

        // Mostra modal só se houver algo para deletar
        if (totalToDelete > 0) {
          setStats(res.data);
          setShowModal(true);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar limpeza:', error);
    }
  };

  const handleCleanup = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/cleanup/execute`);
      setCompleted(true);

      // Fecha modal após 2 segundos
      setTimeout(() => {
        setShowModal(false);
        setCompleted(false);
        setStats(null);
        setLoading(false);
      }, 2000);
    } catch (error) {
      alert('Erro ao executar limpeza: ' + error.response?.data?.error);
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="cleanup-overlay">
      <div className="cleanup-modal">
        <h3>🧹 Limpeza de Dados Antiga</h3>

        {!completed ? (
          <>
            <p className="cleanup-intro">
              É hora de limpar dados antigos para manter o banco de dados eficiente!
            </p>

            {stats && (
              <div className="cleanup-stats">
                <p className="cleanup-detail">
                  📬 <strong>{stats.messages}</strong> mensagens antigas serão deletadas
                </p>
                <p className="cleanup-detail">
                  🔧 <strong>{stats.glpi}</strong> GLPI tickets antigos serão deletados
                </p>
                <p className="cleanup-cutoff">
                  ℹ️ Serão deletados registros anteriores a <strong>{stats.cutoffDate}</strong><br/>
                  (com buffer de segurança de {stats.bufferDays} dias)
                </p>
              </div>
            )}

            <div className="cleanup-actions">
              <button
                className="cleanup-confirm"
                onClick={handleCleanup}
                disabled={loading}
              >
                {loading ? '⏳ Limpando...' : '✅ Executar Limpeza'}
              </button>
              <button
                className="cleanup-cancel"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                ❌ Cancelar
              </button>
            </div>
          </>
        ) : (
          <div className="cleanup-success">
            <p>✨ Limpeza concluída com sucesso!</p>
            <p className="cleanup-message">
              {stats?.messages || 0} mensagens e {stats?.glpi || 0} GLPI tickets foram deletados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
