import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './components/Header';
import Navigation from './components/Navigation';
import MemberTasks from './components/MemberTasks';
import Dashboard from './components/Dashboard';
import ManagerDashboard from './components/ManagerDashboard';
import Messages from './components/Messages';
import Processes from './components/Processes';
import QuickLinks from './components/QuickLinks';
import './styles/app.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [members, setMembers] = useState([]);
  const [currentMember, setCurrentMember] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/members`);
      setMembers(res.data);
      if (res.data.length > 0) {
        setCurrentMember(res.data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    } finally {
      setLoading(false);
    }
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
      const res = await axios.post(`${API_URL}/tasks`, {
        ...taskData,
        created_by: currentMember.id,
        assigned_to: taskData.assigned_to || currentMember.id
      });
      await loadTasks();
    } catch (error) {
      alert('Erro ao adicionar tarefa: ' + error.response?.data?.error);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await axios.put(`${API_URL}/tasks/${taskId}`, updates);
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

  return (
    <div className="app">
      <Header
        currentMember={currentMember}
        onMemberChange={setCurrentMember}
        members={members}
        onAddMember={handleAddMember}
      />

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

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

            {activeTab === 'recados' && currentMember && (
              <Messages member={currentMember} members={members} />
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
