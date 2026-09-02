import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../styles/member-notes.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function MemberNotes({ member }) {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ]
  };

  const formats = [
    'bold', 'italic', 'underline',
    'color', 'background',
    'list', 'bullet'
  ];

  // Carrega notas ao montar o componente ou quando muda de membro
  useEffect(() => {
    if (member?.id) {
      loadNotes();
    }
  }, [member?.id]);

  const loadNotes = async () => {
    try {
      console.log(`📝 Carregando notas para member: ${member.id}`);
      const res = await axios.get(`${API_URL}/notes/${member.id}`);
      setContent(res.data.content || '');
      setLastSaved(new Date());
      console.log(`✅ Notas carregadas`);
    } catch (error) {
      console.error('❌ Erro ao carregar notas:', error);
    }
  };

  // Salva notas com debounce (300ms após parar de digitar)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== '' && member?.id) {
        saveNotes();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [content, member?.id]);

  const saveNotes = async () => {
    try {
      setIsSaving(true);
      console.log(`💾 Salvando notas...`);
      await axios.post(`${API_URL}/notes/${member.id}`, { content });
      setLastSaved(new Date());
      console.log(`✅ Notas salvas`);
    } catch (error) {
      console.error('❌ Erro ao salvar notas:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000);

    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
    return lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="member-notes">
      <div className="notes-header">
        <h3>📝 Anotações</h3>
        <div className="save-status">
          {isSaving ? (
            <span className="saving">Salvando...</span>
          ) : (
            <span className="saved">{lastSaved ? `✓ ${formatLastSaved()}` : ''}</span>
          )}
        </div>
      </div>

      <ReactQuill
        value={content}
        onChange={setContent}
        modules={modules}
        formats={formats}
        placeholder="Escreva suas anotações e passo a passo aqui... (salva automaticamente)"
        className="notes-editor"
      />
    </div>
  );
}
