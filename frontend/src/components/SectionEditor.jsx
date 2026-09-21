import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../styles/member-notes.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function SectionEditor({ member, section, title, icon }) {
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

  useEffect(() => {
    if (member?.id) {
      loadSection();
    }
  }, [member?.id, section]);

  const loadSection = async () => {
    try {
      const res = await axios.get(`${API_URL}/sections/${member.id}/${section}`);
      setContent(res.data.content || '');
      setLastSaved(new Date());
    } catch (error) {
      console.error(`Erro ao carregar ${section}:`, error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== '' && member?.id) {
        saveSection();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [content, member?.id]);

  const saveSection = async () => {
    try {
      setIsSaving(true);
      await axios.post(`${API_URL}/sections/${member.id}/${section}`, { content });
      setLastSaved(new Date());
    } catch (error) {
      console.error(`Erro ao salvar ${section}:`, error);
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
        <h3>{icon} {title}</h3>
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
        placeholder={`Escreva aqui ${title.toLowerCase()}...`}
        className="notes-editor"
      />
    </div>
  );
}
