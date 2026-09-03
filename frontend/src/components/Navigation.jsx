import React from 'react';
import { FiBarChart2, FiCheckSquare, FiMail, FiGitBranch, FiLink, FiBell, FiTool } from 'react-icons/fi';
import '../styles/navigation.css';

export default function Navigation({ activeTab, onTabChange, unreadMessagesCount = 0, unreadNotificationsCount = 0, glpiActiveCount = 0, currentMember }) {
  const allTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FiBarChart2, onlyChefe: true },
    { id: 'tarefas', label: 'Minhas Tarefas', icon: FiCheckSquare },
    { id: 'recados', label: 'Recados', icon: FiMail, badge: unreadMessagesCount > 0 ? unreadMessagesCount : null },
    { id: 'processos', label: 'Processos', icon: FiGitBranch },
    { id: 'links', label: 'Links Rápidos', icon: FiLink },
    { id: 'notificacoes', label: 'Notificações', icon: FiBell, badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null },
    { id: 'glpi', label: 'GLPI', icon: FiTool, badge: glpiActiveCount > 0 ? glpiActiveCount : null }
  ];

  // Filtra o Dashboard para apenas chefe
  const tabs = allTabs.filter(tab => {
    if (tab.onlyChefe && currentMember) {
      return currentMember.role === 'chefe';
    }
    if (tab.onlyChefe && !currentMember) {
      return false; // Esconde se ainda não carregou
    }
    return true;
  });

  return (
    <nav className="navigation">
      <div className="nav-container">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
              title={tab.label}
            >
              <div className="nav-tab-content">
                <Icon size={20} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="nav-badge">{tab.badge}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
