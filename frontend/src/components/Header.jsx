import React, { useState } from 'react';
import { FiMenu, FiX, FiPlus } from 'react-icons/fi';
import '../styles/header.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Header({ currentMember, onMemberChange, members, onAddMember }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditMember, setShowEditMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
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

  const openEditMember = (member) => {
    setEditingMember(member);
    setEditName(member.name);
    setEditEmail(member.email);
    setShowEditMember(true);
    setShowMenu(false);
  };

  const handleEditMember = async (e) => {
    e.preventDefault();
    if (!editName || !editEmail) return;
    try {
      const res = await fetch(`${API_URL}/members/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, email: editEmail })
      });
      if (res.ok) {
        onMemberChange({ ...editingMember, name: editName, email: editEmail });
        setShowEditMember(false);
        window.location.reload();
      }
    } catch (error) {
      alert('Erro ao editar membro: ' + error.message);
    }
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

      {showEditMember && editingMember && (
        <div className="add-member-modal">
          <form onSubmit={handleEditMember}>
            <h3>Editar Membro</h3>
            <input
              type="text"
              placeholder="Nome"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
            />
            <div className="modal-buttons">
              <button type="submit" className="btn-primary">Salvar</button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowEditMember(false)}
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
              <div key={member.id} className="member-item">
                <button
                  className={`member-option ${currentMember?.id === member.id ? 'active' : ''}`}
                  onClick={() => {
                    onMemberChange(member);
                    setShowMenu(false);
                  }}
                >
                  {member.name}
                </button>
                <button
                  className="btn-edit-small"
                  onClick={() => openEditMember(member)}
                  title="Editar membro"
                >
                  ✎️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
