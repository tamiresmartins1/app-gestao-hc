import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Navigation from './components/Navigation';
import MemberTasks from './components/MemberTasks';
import Dashboard from './components/Dashboard';
import ManagerDashboard from './components/ManagerDashboard';
import Messages from './components/Messages';
import Notifications from './components/Notifications';
import Processes from './components/Processes';
import QuickLinks from './components/QuickLinks';
import GLPI from './components/GLPI';
import './styles/app.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'dashboard';
  });
  const [members, setMembers] = useState([]);
  const [currentMember, setCurrentMember] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [glpiTickets, setGlpiTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const currentMemberRef = React.useRef(currentMember);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // Redireciona pra tarefas se não-chefe tentar acessar dashboard
  useEffect(() => {
    if (activeTab === 'dashboard' && currentMember && currentMember.role !== 'chefe') {
      setActiveTab('tarefas');
    }
  }, [activeTab, currentMember]);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);

      // Tenta usar cache primeiro
      const cachedMembers = localStorage.getItem('membersCache');
      const cacheTime = localStorage.getItem('membersCacheTime');
      const now = Date.now();
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

      let members = null;
      if (cachedMembers && cacheTime && (now - parseInt(cacheTime)) < CACHE_DURATION) {
        members = JSON.parse(cachedMembers);
        setLoading(false);
      } else {
        const res = await axios.get(`${API_URL}/members`);
        members = res.data;
        localStorage.setItem('membersCache', JSON.stringify(members));
        localStorage.setItem('membersCacheTime', now.toString());
        setLoading(false);
      }

      setMembers(members);

      const savedMemberId = localStorage.getItem('selectedMemberId');
      const member = members.find(m => m.id === savedMemberId) || members[0];

      if (member) {
        setCurrentMember(member);
      }
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      setLoading(false);
    }
  };

  const handleMemberChange = (member) => {
    setCurrentMember(member);
    localStorage.setItem('selectedMemberId', member.id);
  };

  const loadTasks = async (memberId = currentMember?.id) => {
    if (!memberId) return;
    try {
      const res = await axios.get(`${API_URL}/tasks?member_id=${memberId}`);
      setTasks(res.data);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  };

  useEffect(() => {
    currentMemberRef.current = currentMember;
    if (currentMember) {
      loadTasks(currentMember.id);
      loadMessages(currentMember.id);
      loadNotifications(currentMember.id);
    }
  }, [currentMember]);

  const loadMessages = async (memberId = currentMember?.id) => {
    if (!memberId) {
      console.warn(`⚠️ memberId vazio em loadMessages`);
      return;
    }
    try {
      console.log(`📬 Tentando carregar mensagens para member: ${memberId}`);
      const res = await axios.get(`${API_URL}/messages/inbox/${memberId}`);
      setMessages(res.data);
      console.log(`✅ Mensagens carregadas: ${res.data.length}`);
    } catch (error) {
      console.error(`❌ Erro ao carregar mensagens:`, error);
    }
  };

  const loadNotifications = async (memberId = currentMember?.id) => {
    if (!memberId) return;
    try {
      const res = await axios.get(`${API_URL}/processes/notifications/${memberId}`);
      setNotifications(res.data);
      console.log(`🔔 Notificações carregadas (GLOBAL): ${res.data.length}`);

      const unreadCount = res.data.filter(n => !n.read).length;
      console.log(`🔔 Não lidas: ${unreadCount}`);
      setUnreadNotificationsCount(unreadCount);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  // Polling global - roda UMA VEZ quando app monta
  useEffect(() => {
    console.log(`🚀 App montado - iniciando polling global`);

    const pollData = () => {
      if (currentMemberRef.current) {
        loadMessages(currentMemberRef.current.id);
        loadNotifications(currentMemberRef.current.id);
      }
    };

    // Carrega imediatamente
    pollData();

    // Polling a cada 1 segundo
    const messageInterval = setInterval(pollData, 1000);
    console.log(`⏱️ Polling iniciado - a cada 1 segundo`);

    // Listeners para eventos de refresh imediato
    const handleRefreshMessages = () => {
      console.log(`🔄 Evento refreshMessages recebido - recarregando mensagens`);
      if (currentMemberRef.current) {
        loadMessages(currentMemberRef.current.id);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log(`👁️ Aba escondida`);
        clearInterval(messageInterval);
      } else {
        console.log(`👁️ Aba visível - retomando polling`);
        pollData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('refreshMessages', handleRefreshMessages);

    return () => {
      console.log(`🛑 Limpando polling`);
      clearInterval(messageInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('refreshMessages', handleRefreshMessages);
    };
  }, []);

  const handleAddMember = async (name, email) => {
    try {
      const res = await axios.post(`${API_URL}/members`, { name, email });
      setMembers([...members, res.data]);
    } catch (error) {
      alert('Erro ao adicionar membro: ' + error.response?.data?.error);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      const dataToSend = {
        ...taskData,
        created_by: currentMember.id,
        assigned_to: taskData.assigned_to || currentMember.id
      };

      if (dataToSend.due_date) {
        const [year, month, day] = dataToSend.due_date.split('-');
        const dayNum = parseInt(day) + 1;
        dataToSend.due_date = `${year}-${month}-${String(dayNum).padStart(2, '0')}`;
        console.log(`⏰ Adjusting date for UTC-3: ${taskData.due_date} → ${dataToSend.due_date}`);
      }

      const res = await axios.post(`${API_URL}/tasks`, dataToSend);
      await loadTasks();
    } catch (error) {
      alert('Erro ao adicionar tarefa: ' + error.response?.data?.error);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const dataToSend = { ...updates };

      if (dataToSend.due_date) {
        const [year, month, day] = dataToSend.due_date.split('-');
        const dayNum = parseInt(day) + 1;
        dataToSend.due_date = `${year}-${month}-${String(dayNum).padStart(2, '0')}`;
        console.log(`⏰ Adjusting update date for UTC-3: ${updates.due_date} → ${dataToSend.due_date}`);
      }

      await axios.put(`${API_URL}/tasks/${taskId}`, dataToSend);
      await loadTasks();
    } catch (error) {
      alert('Erro ao atualizar tarefa: ' + error.response?.data?.error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Deseja deletar esta tarefa?')) return;
    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`);
      await loadTasks();
    } catch (error) {
      alert('Erro ao deletar tarefa: ' + error.response?.data?.error);
    }
  };

  // Calcula unread count GLOBALMENTE quando mensagens mudam
  useEffect(() => {
    const unreadCount = messages.filter(m => !m.read).length;
    setUnreadMessagesCount(unreadCount);
    console.log(`📬 Mensagens não-lidas: ${unreadCount}`);
  }, [messages]);

  // Calcula unread count GLOBALMENTE quando notificações mudam
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    setUnreadNotificationsCount(unreadCount);
    console.log(`🔔 Notificações não-lidas: ${unreadCount}`);
  }, [notifications]);

  // Calcula count de GLPI ativos
  const glpiActiveCount = glpiTickets.filter(t => t.status === 'ativa').length;

  const handleUnreadUpdate = (count) => {
    setUnreadMessagesCount(count);
  };

  const handleUnreadNotificationsUpdate = (count) => {
    setUnreadNotificationsCount(count);
  };

  const loadGlpiTickets = async () => {
    try {
      const res = await axios.get(`${API_URL}/glpi`);
      setGlpiTickets(res.data);
    } catch (error) {
      console.error('Erro ao carregar GLPI tickets:', error);
    }
  };

  // Polling para GLPI
  useEffect(() => {
    loadGlpiTickets();
    const glpiInterval = setInterval(loadGlpiTickets, 5000);
    return () => clearInterval(glpiInterval);
  }, []);

  return (
    <div className="app">
      <Header
        currentMember={currentMember}
        onMemberChange={handleMemberChange}
        members={members}
        onAddMember={handleAddMember}
      />

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} unreadMessagesCount={unreadMessagesCount} unreadNotificationsCount={unreadNotificationsCount} glpiActiveCount={glpiActiveCount} currentMember={currentMember} />

      <div className="app-content">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Carregando aplicação...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && currentMember?.role === 'chefe' && (
              <ManagerDashboard members={members} />
            )}

            {activeTab === 'tarefas' && currentMember && (
              <MemberTasks
                member={currentMember}
                tasks={tasks}
                members={members}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {activeTab === 'notificacoes' && currentMember && (
              <Notifications member={currentMember} notifications={notifications} onUnreadUpdate={handleUnreadNotificationsUpdate} />
            )}

            {activeTab === 'glpi' && (
              <GLPI />
            )}

            {activeTab === 'recados' && currentMember && (
              <Messages member={currentMember} members={members} messages={messages} onUnreadUpdate={handleUnreadUpdate} />
            )}

            {activeTab === 'processos' && (
              <Processes members={members} />
            )}

            {activeTab === 'links' && (
              <QuickLinks />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
// Updated Sun Aug 30 20:06:25     2026
