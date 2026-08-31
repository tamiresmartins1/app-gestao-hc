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
      await axios.put(`${API_URL}/processes/notifications/${notificationId}/read`);
      // Notificações serão recarregadas pelo polling global no App.jsx
    } catch (error) {
      console.error('Erro ao marcar como lido:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications">
      <div className="notifications-header">
        <h2>🔔 Notificações</h2>
        {unreadCount > 0 && (
          <span className="unread-badge">
            {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <p>📭 Você não tem notificações</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="notification-content">
                <h4>{notification.process_name}</h4>
                <p>{notification.message}</p>
                <small>
                  {new Date(notification.created_at).toLocaleString('pt-BR')}
                </small>
              </div>
              {!notification.read && (
                <div className="notification-dot"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
