import React from 'react';
import { FiBarChart3, FiCheckSquare, FiMail, FiGitBranch } from 'react-icons/fi';
import '../styles/navigation.css';

export default function Navigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FiBarChart3 },
    { id: 'tarefas', label: 'Minhas Tarefas', icon: FiCheckSquare },
    { id: 'recados', label: 'Recados', icon: FiMail },
    { id: 'processos', label: 'Processos', icon: FiGitBranch }
  ];

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
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
