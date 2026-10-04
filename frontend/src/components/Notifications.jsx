import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/notifications.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Notifications({ member, notifications: notificationsFromProps, onUnreadUpdate }) {
  const [notifications, setNotifications] = useState(notificationsFromProps || []);
  const [loading, setLoading] = useState(false);

  // Sincroniza notificações da prop (carregadas globalmente no App.jsx)
  useEffect(() => {
    setNotifications(notificationsFromProps || []);

    const unreadCount = (notificationsFromProps || []).filter(n => !n.read).length;
    if (onUnreadUpdate) {
      onUnreadUpdate(unreadCount);
    }
  }, [notificationsFromProps, onUnreadUpdate]);

  const markAsRead = async (notificationId) => {
    try {
      // Remove da lista local imediatamente
      setNotifications(notifications.filter(n => n.id !== notificationId));

      // Marca como lida no backend
      await axios.put(`${API_URL}/processes/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Erro ao marcar como lido:', error);
    }
  };

  // Mostrar apenas notificações NÃO lidas
  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="notifications">
      <div className="notifications-header">
        <h2>⚠️ Aviso de Processo</h2>
        {unreadNotifications.length > 0 && (
          <span className="unread-badge">
            {unreadNotifications.length} nova{unreadNotifications.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : unreadNotifications.length === 0 ? (
        <div className="empty-state">
          <p>📭 Você não tem notificações</p>
        </div>
      ) : (
        <div className="notifications-list">
          {unreadNotifications.map(notification => (
            <div
              key={notification.id}
              className="notification-item unread"
              onClick={() => markAsRead(notification.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="notification-content">
                <h4>{notification.process_name}</h4>
                <p>{notification.message}</p>
                <small>
                  {new Date(notification.created_at).toLocaleString('pt-BR')}
                </small>
              </div>
              <div className="notification-dot"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
