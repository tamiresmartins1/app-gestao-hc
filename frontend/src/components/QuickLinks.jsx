import React, { useState } from 'react';
import { FiExternalLink, FiPhone } from 'react-icons/fi';
import '../styles/quick-links.css';

export default function QuickLinks() {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const resources = {
    // 07 ESPECIALIDADES
    especialidades: {
      title: '07 ESPECIALIDADES',
      links: [
        { name: 'Perfil dos Ambulatórios_2018-20Atual', url: 'https://docs.google.com/spreadsheets/d/1zhN762qYLiZG9aQD_uxmhUFm6tw6DlJCuUbnAdfi7bA/edit?gid=490316343#gid=490316343' },
        { name: 'Telessaude', url: 'https://drive.google.com/drive/u/0/folders/1Ysj9dW3EREA9mHAvBB8cOYd0H9ogD1gl' },
        { name: 'Fisio pélvica', url: 'https://drive.google.com/drive/u/0/folders/1qgR4KA_0UFouY0ytLD5p65-VFTFc0shd' },
        { name: 'Reumato', url: 'https://drive.google.com/drive/u/0/folders/1j8eeW8Sv5sBbH1n0aNzQI65E9Jz_SoQc' },
        { name: 'Neuromodulacao', url: 'https://drive.google.com/drive/u/0/folders/1mGJFcA6eAbR2at4xbjIBRg-oWXF8k20I' },
        { name: 'Neurofuncional', url: 'https://drive.google.com/drive/u/0/folders/1DPkpDuOjeAWCNNMUyUrlku1TquWYjvYo' },
        { name: 'Geronto', url: 'https://drive.google.com/drive/u/0/folders/1IU4X9Fe8rkcksGCPS_Fm8oWE4JIKgwJZ' },
        { name: 'CEAC', url: 'https://drive.google.com/drive/u/0/folders/1FSwNQTaPB_LU-yO-sYAOeJAMbrpiqd8H' }
      ]
    },

    // 06 OPERAÇÕES
    operacoes: {
      title: '06 OPERAÇÕES',
      links: [
        { name: 'Mapa de Ocupação - 2026', url: 'https://docs.google.com/spreadsheets/d/1gSV357rg34ZQEglMo0MM6kuFYYIU0sjBujdfvkBJ4Uw/edit?gid=1858629908#gid=1858629908' },
        { name: 'Controle Reservas do Ambulatório 2026', url: 'https://docs.google.com/spreadsheets/d/1r7Q_tnYpqbn_NAuOlEsz1Mk9tO1Ux8_T9OPuIDH7TUI/edit?gid=195376181#gid=195376181' },
        { name: 'FISIO | Controle de Estoque 2026', url: 'https://docs.google.com/spreadsheets/d/1wEijgtWBAkFm_RpmBMwKUISVV_DO_jn8jRjJaPmLaVU/edit?gid=689280098#gid=689280098' },
        { name: 'Monitoramento - Operações Ambulatório 2026', url: 'https://docs.google.com/spreadsheets/d/1naUtnLplFIPOshZpK4J3PqttvVjzkoAilWqc8vdRfJs/edit?gid=1797299157#gid=1797299157' },
        { name: 'LOGISTICA AGENDAMENTOS 2026', url: 'https://docs.google.com/spreadsheets/d/1EGE2kM9HkraxnzCMrWmuPUFrrY6dCbMDNjDHy1r5Nmc/edit' },
        { name: 'CONTROLE DE TRIAGEM AMBULATORIO ATUAL_26', url: 'https://docs.google.com/spreadsheets/d/1xI_J8uUos95PFw5xcpDG7PTZkP2XJuB1nlDI9DyNyz8/edit?gid=1785422635#gid=1785422635' }
      ]
    },

    // 04 EQUIPAMENTOS
    equipamentos: {
      title: '04 EQUIPAMENTOS',
      links: [
        { name: 'RASTREABILIDADE (Pasta Drive)', url: 'https://drive.google.com/drive/u/0/folders/1E-SWl-R6FI2C3E1SFbfUxGOm0b8V4Hjk' },
        { name: 'Controle de esterilização', url: 'https://docs.google.com/spreadsheets/d/1xq1Ui5WpPxkoJmVIgclkZ-SH0q5tV-2LGxTAvBJy5i0/edit?gid=825708681#gid=825708681' },
        { name: 'Rastreabilidade de Sondas Ambulatório', url: 'https://docs.google.com/spreadsheets/d/1Yg02-aUoMhNM9nDLgsgWu_AMeMSAln7iY5sv9Ji6YXY/edit?gid=1826935223#gid=1826935223' },
        { name: 'RASTREABILIDADE UNIFICADA', url: 'https://docs.google.com/spreadsheets/d/1CdahV54pWaVnVwW0PJGlxvxjf20G9YOoThlSfgsRw8M/edit?gid=162437101#gid=162437101' },
        { name: 'Etiquetas', url: 'https://docs.google.com/spreadsheets/d/1dMyQUDOIjpaNS9K08PmPHDrfofjgkejg/edit?gid=1143134970#gid=1143134970' },
        { name: 'Forms retirada e devolução equipamento', url: 'https://docs.google.com/forms/d/1xc4YSDV5HHswOdn8MszGAS-GTvE92jAJqDHyH04_eaw/edit' }
      ]
    },

    // 03 AUDITORIAS
    auditorias: {
      title: '03 AUDITORIAS',
      links: [
        { name: 'Avaliação de Desempenho Duxx- 2026', url: 'https://docs.google.com/spreadsheets/d/1eFVpzMjmEdFP7Y1ff1dHYTrMo5akY7j6RNpIvdftEb8/edit?gid=1805105409#gid=1805105409' },
        { name: 'AUDITORIAS DE PRONTUARIOS (Pasta Drive)', url: 'https://drive.google.com/drive/u/0/folders/1CBtmJBQHBXOhTlq5p6NnFaBSwc7c81nA' },
        { name: '2026 MV Formulário de Auditoria - (respostas)', url: 'https://docs.google.com/spreadsheets/d/1DBbgVeMnGZNLb-QRpj_BpnZVM_8HZBEQM_E0nICSbpo/edit?gid=2055570076#gid=2055570076' },
        { name: 'Formulário auditoria Atendimento', url: 'https://docs.google.com/forms/d/e/1FAIpQLSfJuocBIbwhEtywpltj6t9_8q3qXxGJ9tTyCua-pTW-uDjTHA/viewform' },
        { name: 'Formulário auditoria Triagem', url: 'https://docs.google.com/forms/d/e/1FAIpQLSe6xJ5ofIW49pKFL2T9idIGkcRIjWA6GDE21qiAsGS6vWDoSg/viewform' },
        { name: 'Manual Auditoria Interna 2026', url: 'https://docs.google.com/document/d/1LdW6ovoCJLyhJeBypQmv2_NdKGsK3caONmY-HF1kDQ4/edit?tab=t.0#heading=h.jea0c892xm7' }
      ]
    },

    // 02 INDICADORES
    indicadores: {
      title: '02 INDICADORES',
      links: [
        { name: 'MATRIZ INDICADORES MV (Pasta Drive)', url: 'https://drive.google.com/drive/u/0/folders/1YA_niK63QoiYbABuVJ-J5KXUuQBDSgRq' },
        { name: 'Tempo de espera - Filas Amb Fisio 2026', url: 'https://docs.google.com/spreadsheets/d/1WQ5mg0QmubwTOIuJN8rChhhyTnrDvij4F5K-ERgG90E/edit?gid=0#gid=0' },
        { name: 'Meta_Produtividade_2026', url: 'https://docs.google.com/spreadsheets/d/1TEUwZ6quC5NNu715gYTWK8GRy9MYq__E5_LItvcRQPM/edit?gid=801689827#gid=801689827' },
        { name: 'CONTROLE DE ALTAS 2026', url: 'https://docs.google.com/spreadsheets/d/1am6ERNesP1lYajXRnjw-QDCEBd1BIhsJgnhLwFYaQnY/edit?gid=647064807#gid=647064807' },
        { name: 'INDICADORES AMBULATÓRIO 2026', url: 'https://docs.google.com/spreadsheets/d/1NAi7KvFApQyE-Pe7Nk8Rqm39GGq1IwuUaK2W96qn0rw/edit?gid=2103906718#gid=2103906718' },
        { name: 'INDICADOR - Protocolo Reabilitação Pulmonar 2026', url: 'https://docs.google.com/spreadsheets/d/1oYKF-ysiRksCCGWKip5UuVcl101k8V2ZKnkbShIYiz0/edit' },
        { name: 'PAINEL DE INDICADORES LOOKER STUDIO', url: 'https://datastudio.google.com/u/0/reporting/29eb0733-3247-4fd8-8268-888cf7976fb3' }
      ]
    },

    // 01 PROFISSIONAIS (com TREINAMENTOS)
    profissionais: {
      title: '01 PROFISSIONAIS',
      links: [
        { name: 'Cadastro de Funcionários 2026', url: 'https://docs.google.com/spreadsheets/d/1sKidqBtVO9T6piYNkr3c6sDoHdESCMMuvTGsiVBF0jc/edit?gid=288335903#gid=288335903' },
        { name: 'Treinamentos (Pasta Drive)', url: 'https://drive.google.com/drive/u/0/folders/1aL4CUPXqWxa-GniIGF82JxfpO9ttzYV6' },
        { name: 'Lista de treinamento - IMPRESSÃO', url: 'https://docs.google.com/document/d/1xA3_D2b0RaT8ucMW1pKsAnFWy0KyIaEN/edit' },
        { name: 'Treinamento Admissão + Atualização 2026', url: 'https://docs.google.com/spreadsheets/d/1s_U6aBc-9vbw3aP-FlVWOmAJehoICeCPh6NdYsXW02I/edit?gid=1440432876#gid=1440432876' },
        { name: 'Liberação porta FOFITO', url: 'https://docs.google.com/spreadsheets/d/1RGUNDiKTUgNA-HlbDi0gchqk2nNP1E11vMZr1dRAtqM/edit?gid=1695514206#gid=1695514206' }
      ]
    },

    // PAINÉIS E CHECAGEM DIÁRIA
    paineis: {
      title: '🖥️ PAINÉIS E CHECAGEM DIÁRIA',
      links: [
        { name: 'Painel Faturamento', url: 'http://portalhishc.phcnet.usp.br/PAINEL/ACCOUNT/LOGIN_NEW.ASPX?chave=kWHnpAzY6uQZXfCJVmrnfzZM3Nb6%2baZFEIM7xmLkXMqPqMmhJE2Qz%2fRPYBHJpLap8QOrpmDQQz15h0Z5uSbBwA%3d%3d' },
        { name: 'Painel MV Atendimento', url: 'http://painelmv.phcnet.usp.br/PainelEvolucaoFisioterapeuticaAmbulatorial' },
        { name: 'Painel MV Triagem', url: 'http://painelmv.phcnet.usp.br/PainelTriagemFisioAmb' },
        { name: 'Checagem painel diário', url: 'https://docs.google.com/spreadsheets/d/1ooaDcXuaBRMZzBop6tFNcgL0270Cj0AUiBwklEZkfIs/edit?gid=1124401189#gid=1124401189' }
      ]
    },
  };

  const phones = [
    { area: 'Telefonista HC', number: '9' },
    { area: 'DIVISÃO', number: '6867 / 7969' },
    { area: 'FOFITO', number: '6515' },
    { area: 'Sala Deise', number: '3373' },
    { area: 'CEAC - Recepção', number: '2223' },
    { area: 'CEAC amb', number: '2239' },
    { area: 'Ricardo TI', number: '8071' },
    { area: 'Alexandre Crispim TI', number: '8071' },
    { area: 'Jose Nogueira (Chefe DAM)', number: '6600' },
    { area: 'Vanessa Telessaude', number: '9710' },
    { area: 'TELE - Stefany', number: '9188' },
    { area: 'TI', number: '6630' },
    { area: 'Desdesorção', number: '6643' },
    { area: 'Serviço Social', number: '6066' },
    { area: 'Rouparia', number: '6382' },
    { area: 'Engenharia Clínica', number: '6323' },
    { area: 'Bombeiro', number: '6030' },
    { area: 'Gustavo FFM Patrimônio', number: '3016-5700' },
    { area: 'Volante', number: '6070' },
    { area: 'Tele Assistência', number: '6294' },
    { area: 'Lorena TI', number: '6006' },
    { area: 'PS ICHC', number: '3375 / 3370' },
    { area: 'ONET - Manutenção/Oxigênio', number: '6025' },
    { area: 'ONET - Manutenção Ar Condicionado', number: '6025' }
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
        <p>💡 <strong>Dica:</strong> Faltam alguns links? Deixa que você manda depois! Vou atualizar!</p>
      </div>
    </div>
  );
}
