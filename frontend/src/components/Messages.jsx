import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSend, FiTrash2 } from 'react-icons/fi';
import '../styles/messages.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Messages({ member, members }) {
  const [messages, setMessages] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [view, setView] = useState('inbox');

  useEffect(() => {
    if (member) {
      loadMessages();
    }
  }, [member, view]);

  const loadMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}/messages/inbox/${member.id}`);
      setMessages(res.data);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject || !content || !selectedRecipient) return;

    try {
      await axios.post(`${API_URL}/messages`, {
        sender_id: member.id,
        recipient_id: selectedRecipient,
        subject,
        content
      });
      setSubject('');
      setContent('');
      setShowCompose(false);
      loadMessages();
    } catch (error) {
      alert('Erro ao enviar mensagem: ' + error.response?.data?.error);
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Deseja deletar este recado?')) return;
    try {
      await axios.delete(`${API_URL}/messages/${messageId}`);
      loadMessages();
    } catch (error) {
      alert('Erro ao deletar recado: ' + error.response?.data?.error);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await axios.put(`${API_URL}/messages/${messageId}/read`);
      loadMessages();
    } catch (error) {
      console.error('Erro ao marcar como lido:', error);
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="messages">
      <div className="messages-header">
        <h2>📬 Recados</h2>
        <button
          className="btn-primary"
          onClick={() => setShowCompose(!showCompose)}
        >
          + Novo Recado
        </button>
      </div>

      {unreadCount > 0 && (
        <div className="unread-badge">
          Você tem {unreadCount} recado(s) não lido(s)
        </div>
      )}

      {showCompose && (
        <form className="compose-form" onSubmit={handleSend}>
          <h3>Enviar Recado</h3>

          <select
            value={selectedRecipient || ''}
            onChange={(e) => setSelectedRecipient(e.target.value)}
            required
          >
            <option value="">Destinatário...</option>
            {members
              .filter(m => m.id !== member.id)
              .map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))
            }
          </select>

          <input
            type="text"
            placeholder="Assunto"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          <textarea
            placeholder="Mensagem"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="5"
            required
          />

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              <FiSend /> Enviar
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowCompose(false);
                setSubject('');
                setContent('');
                setSelectedRecipient(null);
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="messages-container">
        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>📭 Nenhum recado no seu inbox</p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`message-item ${!msg.read ? 'unread' : ''}`}
                onClick={() => !msg.read && handleMarkAsRead(msg.id)}
              >
                <div className="message-sender">
                  <strong>{msg.sender_name || 'Desconhecido'}</strong>
                  {!msg.read && <span className="new-badge">NOVO</span>}
                </div>
                <div className="message-subject">{msg.subject}</div>
                <div className="message-date">
                  {new Date(msg.created_at).toLocaleString('pt-BR')}
                </div>
                <button
                  className="btn-delete-msg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(msg.id);
                  }}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
