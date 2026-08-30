import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSend, FiTrash2, FiX } from 'react-icons/fi';
import '../styles/messages.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Messages({ member, members, onUnreadUpdate }) {
  const [messages, setMessages] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [view, setView] = useState('inbox');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyContent, setReplyContent] = useState('');

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

  // Atualiza o badge de não-lidos quando muda
  useEffect(() => {
    if (onUnreadUpdate) {
      onUnreadUpdate(unreadCount);
    }
  }, [unreadCount, onUnreadUpdate]);

  const handleOpenMessage = async (message) => {
    setSelectedMessage(message);
    if (!message.read) {
      await handleMarkAsRead(message.id);
    }
  };

  const handleCloseModal = () => {
    setSelectedMessage(null);
    setReplyContent('');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyContent || !selectedMessage) return;

    try {
      // Enviar resposta como nova mensagem
      await axios.post(`${API_URL}/messages`, {
        sender_id: member.id,
        recipient_id: selectedMessage.sender_id,
        subject: `Re: ${selectedMessage.subject}`,
        content: replyContent,
        parent_message_id: selectedMessage.id
      });

      setReplyContent('');
      handleCloseModal();
      loadMessages();
    } catch (error) {
      alert('Erro ao enviar resposta: ' + error.response?.data?.error);
    }
  };

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
                onClick={() => handleOpenMessage(msg)}
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

      {/* Modal de Visualização de Mensagem */}
      {selectedMessage && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalhes do Recado</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-field">
                <label>Remetente:</label>
                <p>{selectedMessage.sender_name || 'Desconhecido'}</p>
              </div>

              <div className="modal-field">
                <label>Assunto:</label>
                <p>{selectedMessage.subject}</p>
              </div>

              <div className="modal-field">
                <label>Data/Hora:</label>
                <p>{new Date(selectedMessage.created_at).toLocaleString('pt-BR')}</p>
              </div>

              <div className="modal-field">
                <label>Mensagem:</label>
                <div className="message-content">
                  {selectedMessage.content}
                </div>
              </div>

              <div className="modal-divider"></div>

              <form onSubmit={handleSendReply} className="reply-form">
                <h4>Responder</h4>
                <textarea
                  className="reply-textarea"
                  placeholder="Digite sua resposta..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows="4"
                />
                <div className="reply-actions">
                  <button type="submit" className="btn-primary" disabled={!replyContent.trim()}>
                    <FiSend /> Enviar Resposta
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Fechar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
