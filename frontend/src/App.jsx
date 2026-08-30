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
import './styles/app.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'dashboard';
  });
  const [members, setMembers] = useState([]);
  const [currentMember, setCurrentMember] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/members`);
      setMembers(res.data);

      const savedMemberId = localStorage.getItem('selectedMemberId');
      const member = res.data.find(m => m.id === savedMemberId) || res.data[0];

      if (member) {
        setCurrentMember(member);
      }
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    } finally {
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
    if (currentMember) {
      loadTasks(currentMember.id);
    }
  }, [currentMember]);

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

  const handleUnreadUpdate = (count) => {
    setUnreadMessagesCount(count);
  };

  const handleUnreadNotificationsUpdate = (count) => {
    setUnreadNotificationsCount(count);
  };

  return (
    <div className="app">
      <Header
        currentMember={currentMember}
        onMemberChange={handleMemberChange}
        members={members}
        onAddMember={handleAddMember}
      />

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} unreadMessagesCount={unreadMessagesCount} unreadNotificationsCount={unreadNotificationsCount} />

      <div className="app-content">
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : (
          <>
            {activeTab === 'dashboard' && currentMember?.role === 'chefe' && (
              <ManagerDashboard members={members} />
            )}
            {activeTab === 'dashboard' && currentMember?.role !== 'chefe' && (
              <Dashboard members={members} onAddMember={handleAddMember} />
            )}
            {activeTab === 'dashboard' && !currentMember?.role && (
              <Dashboard members={members} onAddMember={handleAddMember} />
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
              <Notifications member={currentMember} onUnreadUpdate={handleUnreadNotificationsUpdate} />
            )}

            {activeTab === 'recados' && currentMember && (
              <Messages member={currentMember} members={members} onUnreadUpdate={handleUnreadUpdate} />
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
