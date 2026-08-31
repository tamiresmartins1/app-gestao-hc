import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/notifications.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Notifications({ member, onUnreadUpdate }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (member) {
      loadNotifications();
      let interval;

      const handleVisibilityChange = () => {
        if (document.hidden) {
          clearInterval(interval);
        } else {
          loadNotifications();
          interval = setInterval(loadNotifications, 3000);
        }
      };

      interval = setInterval(loadNotifications, 3000);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [member]);

  const loadNotifications = async () => {
    if (!member) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/processes/notifications/${member.id}`);
      setNotifications(res.data);

      const unreadCount = res.data.filter(n => !n.read).length;
      if (onUnreadUpdate) {
        onUnreadUpdate(unreadCount);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API_URL}/processes/notifications/${notificationId}/read`);
      loadNotifications();
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
