import React, { useState } from 'react';
import { FiExternalLink, FiPhone } from 'react-icons/fi';
import '../styles/quick-links.css';

export default function QuickLinks() {
  const [expandedCategory, setExpandedCategory] = useState('auditoria');

  const resources = {
    auditoria: {
      title: '📋 Auditoria',
      links: [
        { name: '2026 MV Formulário de Auditoria - (respostas)', url: 'https://docs.google.com/spreadsheets/d/1DBbgVeMnGZNLb-QRpj_BpnZVM_8HZBEQM_E0nICSbpo/edit?gid=2055570076#gid=2055570076' },
        { name: 'Formulário auditoria Atendimento', url: 'https://docs.google.com/forms/d/e/1FAIpQLSfJuocBIbwhEtywpltj6t9_8q3qXxGJ9tTyCua-pTW-uDjTHA/viewform' },
        { name: 'Formulário auditoria Triagem', url: 'https://docs.google.com/forms/d/e/1FAIpQLSe6xJ5ofIW49pKFL2T9idIGkcRIjWA6GDE21qiAsGS6vWDoSg/viewform' },
        { name: 'Manual Auditoria Interna 2026', url: 'https://docs.google.com/document/d/1LdW6ovoCJLyhJeBypQmv2_NdKGsK3caONmY-HF1kDQ4/edit?tab=t.0#heading=h.jea0c892xm7' }
      ]
    },
    checagem: {
      title: '✓ Checagem',
      links: [
        { name: 'Checagem painel diário', url: 'https://docs.google.com/spreadsheets/d/1ooaDcXuaBRMZzBop6tFNcgL0270Cj0AUiBwklEZkfIs/edit?gid=1124401189#gid=1124401189' },
        { name: 'Liberação porta FOFITO', url: 'https://docs.google.com/spreadsheets/d/1RGUNDiKTUgNA-HlbDi0gchqk2nNP1E11vMZr1dRAtqM/edit?gid=1695514206#gid=1695514206' }
      ]
    },
    compras: {
      title: '💳 Compras',
      links: [
        { name: 'Compras', url: 'https://docs.google.com/spreadsheets/d/1_SPyzZcamEn3e1TIk-dtB-xMn2NCEd90HOSixrOhEYU/edit?gid=557954761#gid=557954761' }
      ]
    },
    indicadores: {
      title: '📊 Indicadores',
      links: [
        { name: 'Avaliação de Desempenho Duxx- 2026', url: 'https://docs.google.com/spreadsheets/d/1eFVpzMjmEdFP7Y1ff1dHYTrMo5akY7j6RNpIvdftEb8/edit?gid=1805105409#gid=1805105409' },
        { name: 'Indicadores Amb 2026', url: 'https://docs.google.com/spreadsheets/d/1NAi7KvFApQyE-Pe7Nk8Rqm39GGq1IwuUaK2W96qn0rw/edit?gid=2103906718#gid=2103906718' },
        { name: 'Indicadores protocolo Reabilitação Pulmonar 2026', url: 'https://docs.google.com/spreadsheets/d/1oYKF-ysiRksCCGWKip5UuVcl101k8V2ZKnkbShIYiz0/edit?gid=1314571940#gid=1314571940' }
      ]
    },
    logistica: {
      title: '📦 Logística',
      links: [
        { name: 'Controle de Triagem', url: 'https://docs.google.com/spreadsheets/d/1xI_J8uUos95PFw5xcpDG7PTZkP2XJuB1nlDI9DyNyz8/edit?gid=1785422635#gid=1785422635' },
        { name: 'Etiquetas', url: 'https://docs.google.com/spreadsheets/d/1dMyQUDOIjpaNS9K08PmPHDrfofjgkejg/edit?gid=1143134970#gid=1143134970' },
        { name: 'Forms retirada e devolução equipamento', url: 'https://docs.google.com/forms/d/1xc4YSDV5HHswOdn8MszGAS-GTvE92jAJqDHyH04_eaw/edit' },
        { name: 'Logistica agendas', url: 'https://docs.google.com/spreadsheets/d/1xrciwqZHoYVcgGC9hxYGpJgOGMysopuehhridYxkpZA/edit?usp=drive_web&ouid=114421952541590824162' },
        { name: 'Mapa de ocupação 2026', url: 'https://docs.google.com/spreadsheets/d/1gSV357rg34ZQEglMo0MM6kuFYYIU0sjBujdfvkBJ4Uw/edit?gid=1858629908#gid=1858629908' }
      ]
    },
    paineis: {
      title: '🖥️ Painéis',
      links: [
        { name: 'Painel Faturamento', url: 'http://portalhishc.phcnet.usp.br/PAINEL/ACCOUNT/LOGIN_NEW.ASPX?chave=kWHnpAzY6uQZXfCJVmrnfzZM3Nb6%2baZFEIM7xmLkXMqPqMmhJE2Qz%2fRPYBHJpLap8QOrpmDQQz15h0Z5uSbBwA%3d%3d' },
        { name: 'Painel MV Atendimento', url: 'http://painelmv.phcnet.usp.br/PainelEvolucaoFisioterapeuticaAmbulatorial' },
        { name: 'Painel MV Triagem', url: 'http://painelmv.phcnet.usp.br/PainelTriagemFisioAmb' }
      ]
    },
    sondas: {
      title: '🔬 Sondas',
      links: [
        { name: 'Rastreabilidade de Sondas Ambulatório', url: 'https://docs.google.com/spreadsheets/d/1Yg02-aUoMhNM9nDLgsgWu_AMeMSAln7iY5sv9Ji6YXY/edit?gid=1826935223#gid=1826935223' },
        { name: 'Sondas Controle de esterilização', url: 'https://docs.google.com/spreadsheets/d/1xq1Ui5WpPxkoJmVIgclkZ-SH0q5tV-2LGxTAvBJy5i0/edit?gid=454997872#gid=454997872' }
      ]
    },
    treinamento: {
      title: '📋 Auditoria',
      links: [
        { name: '2026 MV Formulário de Auditoria - (respostas)', url: 'https://docs.google.com/spreadsheets/d/1DBbgVeMnGZNLb-QRpj_BpnZVM_8HZBEQM_E0nICSbpo/edit?gid=2055570076#gid=2055570076' },
        { name: 'Formulário auditoria Atendimento', url: 'https://docs.google.com/forms/d/e/1FAIpQLSfJuocBIbwhEtywpltj6t9_8q3qXxGJ9tTyCua-pTW-uDjTHA/viewform' },
        { name: 'Formulário auditoria Triagem', url: 'https://docs.google.com/forms/d/e/1FAIpQLSe6xJ5ofIW49pKFL2T9idIGkcRIjWA6GDE21qiAsGS6vWDoSg/viewform' },
        { name: 'Manual Auditoria Interna 2026', url: 'https://docs.google.com/document/d/1LdW6ovoCJLyhJeBypQmv2_NdKGsK3caONmY-HF1kDQ4/edit?tab=t.0#heading=h.jea0c892xm7' }
      ]
    },
    checagem: {
      title: '✓ Checagem',
      links: [
        { name: 'Checagem painel diário', url: 'https://docs.google.com/spreadsheets/d/1ooaDcXuaBRMZzBop6tFNcgL0270Cj0AUiBwklEZkfIs/edit?gid=1124401189#gid=1124401189' },
        { name: 'Liberação porta FOFITO', url: 'https://docs.google.com/spreadsheets/d/1RGUNDiKTUgNA-HlbDi0gchqk2nNP1E11vMZr1dRAtqM/edit?gid=1695514206#gid=1695514206' }
      ]
    },
    treinamento: {
      title: '🎓 Treinamento',
      links: [
        { name: 'Lista de treinamento - IMPRESSÃO', url: 'https://docs.google.com/document/d/1xA3_D2b0RaT8ucMW1pKsAnFWy0KyIaEN/edit' },
        { name: 'Treinamento Admissão + Atualização 2026', url: 'https://docs.google.com/spreadsheets/d/1s_U6aBc-9vbw3aP-FlVWOmAJehoICeCPh6NdYsXW02I/edit?gid=1440432876#gid=1440432876' }
      ]
    },
    logistica: {
      title: '📦 Logística',
      links: [
        { name: 'Controle de Triagem', url: 'https://docs.google.com/spreadsheets/d/1xI_J8uUos95PFw5xcpDG7PTZkP2XJuB1nlDI9DyNyz8/edit?gid=1785422635#gid=1785422635' },
        { name: 'Etiquetas', url: 'https://docs.google.com/spreadsheets/d/1dMyQUDOIjpaNS9K08PmPHDrfofjgkejg/edit?gid=1143134970#gid=1143134970' },
        { name: 'Forms retirada e devolução equipamento', url: 'https://docs.google.com/forms/d/1xc4YSDV5HHswOdn8MszGAS-GTvE92jAJqDHyH04_eaw/edit' },
        { name: 'Logistica agendas', url: 'https://docs.google.com/spreadsheets/d/1xrciwqZHoYVcgGC9hxYGpJgOGMysopuehhridYxkpZA/edit?usp=drive_web&ouid=114421952541590824162' },
        { name: 'Mapa de ocupação 2026', url: 'https://docs.google.com/spreadsheets/d/1gSV357rg34ZQEglMo0MM6kuFYYIU0sjBujdfvkBJ4Uw/edit?gid=1858629908#gid=1858629908' }
      ]
    },
    compras: {
      title: '💳 Compras',
      links: [
        { name: 'Compras', url: 'https://docs.google.com/spreadsheets/d/1_SPyzZcamEn3e1TIk-dtB-xMn2NCEd90HOSixrOhEYU/edit?gid=557954761#gid=557954761' }
      ]
    },
    sondas: {
      title: '🔬 Sondas',
      links: [
        { name: 'Rastreabilidade de Sondas Ambulatório', url: 'https://docs.google.com/spreadsheets/d/1Yg02-aUoMhNM9nDLgsgWu_AMeMSAln7iY5sv9Ji6YXY/edit?gid=1826935223#gid=1826935223' },
        { name: 'Sondas Controle de esterilização', url: 'https://docs.google.com/spreadsheets/d/1xq1Ui5WpPxkoJmVIgclkZ-SH0q5tV-2LGxTAvBJy5i0/edit?gid=454997872#gid=454997872' }
      ]
    },
    indicadores: {
      title: '📊 Indicadores',
      links: [
        { name: 'Avaliação de Desempenho Duxx- 2026', url: 'https://docs.google.com/spreadsheets/d/1eFVpzMjmEdFP7Y1ff1dHYTrMo5akY7j6RNpIvdftEb8/edit?gid=1805105409#gid=1805105409' },
        { name: 'Indicadores Amb 2026', url: 'https://docs.google.com/spreadsheets/d/1NAi7KvFApQyE-Pe7Nk8Rqm39GGq1IwuUaK2W96qn0rw/edit?gid=2103906718#gid=2103906718' },
        { name: 'Indicadores protocolo Reabilitação Pulmonar 2026', url: 'https://docs.google.com/spreadsheets/d/1oYKF-ysiRksCCGWKip5UuVcl101k8V2ZKnkbShIYiz0/edit?gid=1314571940#gid=1314571940' }
      ]
    },
    paineis: {
      title: '🖥️ Painéis',
      links: [
        { name: 'Painel Faturamento', url: 'http://portalhishc.phcnet.usp.br/PAINEL/ACCOUNT/LOGIN_NEW.ASPX?chave=kWHnpAzY6uQZXfCJVmrnfzZM3Nb6%2baZFEIM7xmLkXMqPqMmhJE2Qz%2fRPYBHJpLap8QOrpmDQQz15h0Z5uSbBwA%3d%3d' },
        { name: 'Painel MV Atendimento', url: 'http://painelmv.phcnet.usp.br/PainelEvolucaoFisioterapeuticaAmbulatorial' },
        { name: 'Painel MV Triagem', url: 'http://painelmv.phcnet.usp.br/PainelTriagemFisioAmb' }
      ]
    }
  };

  const phones = [
    { area: 'DIVISÃO', number: '6867 / 7969' },
    { area: 'FOFITO', number: '6515' },
    { area: 'Sala Deise', number: '3373' },
    { area: 'CEAC - Recepção', number: '7576' },
    { area: 'CEAC amb', number: '2239' },
    { area: 'Ricardo TI', number: '8071' },
    { area: 'Alexandre Crispim TI', number: '8071' },
    { area: 'Jose Nogueira (Chefe DAM)', number: '6699' },
    { area: 'Vanessa Telessaude', number: '9719' }
  ];

  return (
    <div className="quick-links">
      <h2>📌 Links Rápidos e Recursos</h2>

      <div className="links-container">
        {Object.entries(resources).map(([key, category]) => (
          <div key={key} className="category">
            <button
              className={`category-header ${expandedCategory === key ? 'expanded' : ''}`}
              onClick={() => setExpandedCategory(expandedCategory === key ? null : key)}
            >
              <span>{category.title}</span>
              <span className="arrow">▼</span>
            </button>

            {expandedCategory === key && (
              <div className="category-links">
                {category.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-item"
                  >
                    <span>{link.name}</span>
                    <FiExternalLink />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="phones-section">
        <h3>☎️ Ramais e Telefones</h3>
        <div className="phones-grid">
          {phones.map((phone, idx) => (
            <div key={idx} className="phone-card">
              <div className="phone-area">{phone.area}</div>
              <div className="phone-number">
                <FiPhone /> {phone.number}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="info-box">
        <p>💡 <strong>Dica:</strong> Faltam alguns ramais? Deixa que você manda depois! Vou atualizar!</p>
      </div>
    </div>
  );
}
