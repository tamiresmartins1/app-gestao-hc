import React, { useState } from 'react';
import { FiMenu, FiX, FiPlus } from 'react-icons/fi';
import '../styles/header.css';

export default function Header({ currentMember, onMemberChange, members, onAddMember }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail) return;
    await onAddMember(newMemberName, newMemberEmail);
    setNewMemberName('');
    setNewMemberEmail('');
    setShowAddMember(false);
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">📋 APP GESTÃO HC</div>
      </div>

      <div className="header-center">
        {currentMember && (
          <div className="member-info">
            👤 {currentMember.name}
          </div>
        )}
      </div>

      <div className="header-right">
        <button
          className="btn-add-member"
          onClick={() => setShowAddMember(!showAddMember)}
          title="Adicionar novo membro"
        >
          <FiPlus /> Novo Membro
        </button>
      </div>

      {showAddMember && (
        <div className="add-member-modal">
          <form onSubmit={handleAddMember}>
            <input
              type="text"
              placeholder="Nome"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              required
            />
            <div className="modal-buttons">
              <button type="submit" className="btn-primary">Adicionar</button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAddMember(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={`member-selector ${showMenu ? 'open' : ''}`}>
        <button
          className="toggle-menu"
          onClick={() => setShowMenu(!showMenu)}
        >
          {showMenu ? <FiX /> : <FiMenu />}
        </button>

        {showMenu && (
          <div className="member-list">
            {members.map((member) => (
              <button
                key={member.id}
                className={`member-option ${currentMember?.id === member.id ? 'active' : ''}`}
                onClick={() => {
                  onMemberChange(member);
                  setShowMenu(false);
                }}
              >
                {member.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
