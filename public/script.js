// ================= CONFIGURAÇÃO DA APLICAÇÃO =================
const AVIVA_APP = {
  version: '1.0.0',
  data: null,
  isOnline: navigator.onLine,
  isPWA: window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone || 
         document.referrer.includes('android-app://')
};

// ================= FUNÇÕES DO SERVICE WORKER =================
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registrado:', registration.scope);
        
        // Monitorar atualizações
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 Nova versão do Service Worker encontrada!');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateNotification();
            }
          });
        });
        
        // Verificar atualizações periodicamente
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // A cada 1 hora
        
      })
      .catch(error => {
        console.error('❌ Falha ao registrar Service Worker:', error);
      });
  }
}

function showUpdateNotification() {
  if (confirm('✨ Uma nova versão do AVIVA está disponível!\n\nDeseja atualizar agora?')) {
    window.location.reload();
  }
}

// ================= GERENCIAMENTO DE DADOS =================
async function loadAppData() {
  try {
    // Tentar carregar do servidor
    const response = await fetch('/api/data');
    
    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    
    AVIVA_APP.data = await response.json();
    
    // Salvar no cache local
    localStorage.setItem('aviva_data_cache', JSON.stringify({
      data: AVIVA_APP.data,
      timestamp: Date.now()
    }));
    
    console.log('📦 Dados carregados do servidor');
    return AVIVA_APP.data;
    
  } catch (error) {
    console.warn('⚠️  Usando dados do cache local:', error.message);
    
    // Tentar carregar do cache local
    const cache = localStorage.getItem('aviva_data_cache');
    if (cache) {
      const cached = JSON.parse(cache);
      
      // Verificar se o cache é recente (menos de 1 hora)
      if (Date.now() - cached.timestamp < 60 * 60 * 1000) {
        AVIVA_APP.data = cached.data;
        console.log('📦 Dados carregados do cache local');
        return AVIVA_APP.data;
      }
    }
    
    // Dados de fallback
    AVIVA_APP.data = getFallbackData();
    console.log('📦 Usando dados de fallback');
    return AVIVA_APP.data;
  }
}

function getFallbackData() {
  return {
    versiculo: {
      texto: "Porque para mim o viver é Cristo, e o morrer é lucro.",
      referencia: "Filipenses 1:21"
    },
    eventosEspeciais: {
      ativo: true,
      periodo: "Janeiro 2026",
      titulo: "Campanha das Primícias",
      tema: "Consagrando o Primeiro ao Senhor",
      descricao: "Venha consagrar o primeiro mês do ano ao Senhor!"
    },
    palavraSemana: {
      titulo: "O FIM É MELHOR DO QUE O COMEÇO",
      mensagem: "Versículo: Eclesiastes 7:8..."
    },
    agenda: [],
    meditacaoDiaria: [],
    contatos: [],
    links: {}
  };
}

// ================= INTERFACE DO USUÁRIO =================
function updateUI() {
  if (!AVIVA_APP.data) return;
  
  // Versículo do dia
  updateVersiculo();
  
  // Eventos especiais
  updateEventosEspeciais();
  
  // Palavra da semana
  updatePalavraSemana();
  
  // Agenda
  updateAgenda();
  
  // Meditação diária
  updateMeditacao();
  
  // Contatos
  updateContatos();
  
  // Links
  updateLinks();
  
  // Indicador de conexão
  updateConnectionStatus();
}

function updateVersiculo() {
  const versiculoContainer = document.getElementById('versiculoContainer');
  if (versiculoContainer && AVIVA_APP.data.versiculo) {
    versiculoContainer.innerHTML = `
      <div class="versiculo-content">
        ${AVIVA_APP.data.versiculo.texto}
        <strong>${AVIVA_APP.data.versiculo.referencia}</strong>
      </div>
      ${AVIVA_APP.isOnline ? '' : '<div class="offline-badge">📴 Offline</div>'}
    `;
  }
}

function updateEventosEspeciais() {
  const eventosSection = document.getElementById('eventosEspeciaisSection');
  if (!eventosSection || !AVIVA_APP.data.eventosEspeciais) return;
  
  const { ativo, periodo, titulo, tema, descricao, versiculo } = AVIVA_APP.data.eventosEspeciais;
  
  if (ativo) {
    eventosSection.style.display = 'block';
    
    if (document.getElementById('eventoPeriodo')) {
      document.getElementById('eventoPeriodo').textContent = periodo || '';
    }
    if (document.getElementById('eventoTitulo')) {
      document.getElementById('eventoTitulo').textContent = titulo || '';
    }
    if (document.getElementById('eventoTema')) {
      document.getElementById('eventoTema').textContent = tema || '';
    }
    
    const eventoVersiculo = document.getElementById('eventoVersiculo');
    if (eventoVersiculo && versiculo) {
      eventoVersiculo.innerHTML = `
        <div class="versiculo-content">
          ${versiculo.texto || ''}
          <strong>${versiculo.referencia || ''}</strong>
        </div>
      `;
    }
    
    if (document.getElementById('eventoDescricao')) {
      document.getElementById('eventoDescricao').textContent = descricao || '';
    }
  } else {
    eventosSection.style.display = 'none';
  }
}

function updatePalavraSemana() {
  if (!AVIVA_APP.data.palavraSemana) return;
  
  const { titulo, mensagem } = AVIVA_APP.data.palavraSemana;
  
  // Título principal
  const palavraTitulo = document.getElementById('palavraSemanaTitulo');
  if (palavraTitulo) {
    palavraTitulo.textContent = titulo || '';
  }
  
  // Título do modal
  const modalTitulo = document.getElementById('modalTitulo');
  if (modalTitulo) {
    modalTitulo.textContent = titulo || '';
  }
  
  // Conteúdo do modal
  const modalConteudo = document.getElementById('modalConteudo');
  if (modalConteudo && mensagem) {
    const mensagemFormatada = formatPalavraSemana(mensagem);
    modalConteudo.innerHTML = mensagemFormatada;
  }
}

function formatPalavraSemana(mensagem) {
  return mensagem.split('\n\n').map(paragrafo => {
    if (paragrafo.includes('Introdução:')) {
      return `<div class="modal-section"><h3>Introdução</h3><p>${paragrafo.replace('Introdução:', '').trim()}</p></div>`;
    } else if (paragrafo.includes('Explicação:')) {
      return `<div class="modal-section"><h3>Explicação</h3><p>${paragrafo.replace('Explicação:', '').trim()}</p></div>`;
    } else if (paragrafo.includes('Aplicação:')) {
      return `<div class="modal-section"><h3>Aplicação</h3><p>${paragrafo.replace('Aplicação:', '').trim()}</p></div>`;
    } else if (paragrafo.includes('Conclusão:')) {
      return `<div class="modal-section"><h3>Conclusão</h3><p>${paragrafo.replace('Conclusão:', '').trim()}</p></div>`;
    } else if (paragrafo.includes('Versículo:')) {
      const versiculo = paragrafo.replace('Versículo:', '').trim();
      return `<div class="modal-section"><p class="verse">${versiculo}</p></div>`;
    } else {
      return `<div class="modal-section"><p>${paragrafo}</p></div>`;
    }
  }).join('');
}

function updateAgenda() {
  const agendaContainer = document.getElementById('agenda');
  if (!agendaContainer || !AVIVA_APP.data.agenda) return;
  
  let agendaHTML = '';
  
  AVIVA_APP.data.agenda.forEach(evento => {
    if (evento.tipo === 'recorrente') {
      agendaHTML += `
        <div class="agenda-item agenda-recurrent">
          <div class="agenda-icon">
            <i class="${evento.icone || 'fas fa-church'}"></i>
          </div>
          <div class="agenda-content">
            <h4>${evento.titulo} <span class="highlight">• ${evento.horario}</span></h4>
            <p>${evento.descricao}</p>
          </div>
        </div>
      `;
    } else {
      const [day, month] = evento.data ? evento.data.split('/') : ['', ''];
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      agendaHTML += `
        <div class="agenda-item agenda-especial">
          <div class="agenda-date">
            <div class="day">${day}</div>
            <div class="month">${monthNames[parseInt(month)-1] || ''}</div>
          </div>
          <div class="agenda-content">
            <h4>${evento.titulo} <span class="highlight">• ${evento.horario}</span></h4>
            <p>${evento.descricao}</p>
          </div>
        </div>
      `;
    }
  });
  
  agendaContainer.innerHTML = agendaHTML || '<p class="no-events">Nenhum evento agendado</p>';
}

function updateMeditacao() {
  const meditacaoPreview = document.getElementById('meditacaoPreview');
  if (!meditacaoPreview || !AVIVA_APP.data.meditacaoDiaria) return;
  
  let meditacaoHTML = '';
  
  // Mostrar até 3 vídeos
  const videos = AVIVA_APP.data.meditacaoDiaria.slice(0, 3);
  
  if (videos.length === 0) {
    meditacaoHTML = '<p class="no-videos">Nenhuma meditação disponível</p>';
  } else {
    videos.forEach(video => {
      meditacaoHTML += `
        <div class="video-preview" data-id="${video.id}">
          <div class="video-icon">
            <i class="fas fa-play-circle"></i>
          </div>
          <h4>${video.titulo}</h4>
          <div class="video-meta">
            <span class="duracao">${video.duracao}</span>
            <span class="categoria">${video.categoria}</span>
          </div>
          <p>${video.descricao}</p>
          <button class="btn btn-small watch-btn" data-id="${video.id}">
            <i class="fas fa-play"></i> Assistir
          </button>
        </div>
      `;
    });
  }
  
  meditacaoPreview.innerHTML = meditacaoHTML;
  
  // Adicionar eventos aos botões de assistir
  document.querySelectorAll('.watch-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const videoId = e.target.closest('.watch-btn').dataset.id;
      playVideo(videoId);
    });
  });
}

function updateContatos() {
  const contactList = document.getElementById('contactList');
  if (!contactList || !AVIVA_APP.data.contatos) return;
  
  let contactListHTML = '';
  
  AVIVA_APP.data.contatos.forEach(contato => {
    const numeroFormatado = contato.numero.replace(/\D/g, '');
    const mensagem = encodeURIComponent(`Olá ${contato.nome.split(' ')[0]}! Gostaria de mais informações sobre ${contato.cargo}`);
    
    contactListHTML += `
      <div class="contact-item-modal">
        <div class="contact-info-modal">
          <span class="contact-name">${contato.nome}</span>
          <span class="contact-role">${contato.cargo}</span>
          <span class="contact-number">${contato.numero}</span>
        </div>
        <a href="https://wa.me/${numeroFormatado}?text=${mensagem}" 
           target="_blank" 
           class="btn-whatsapp"
           ${!AVIVA_APP.isOnline ? 'onclick="return false;" style="opacity:0.5; cursor:not-allowed;"' : ''}>
          <i class="fab fa-whatsapp"></i> WhatsApp
        </a>
      </div>
    `;
  });
  
  contactList.innerHTML = contactListHTML;
}

function updateLinks() {
  if (!AVIVA_APP.data.links) return;
  
  const links = AVIVA_APP.data.links;
  
  // Atualizar links dinâmicos
  const linkElements = {
    'linkOracao': links.oracao,
    'linkAconselhamento': links.aconselhamento,
    'linkVisitante': links.visitante,
    'linkYouTube': links.youtube
  };
  
  Object.entries(linkElements).forEach(([id, url]) => {
    const element = document.getElementById(id);
    if (element && url) {
      element.href = url;
    }
  });
}

function updateConnectionStatus() {
  const connectionStatus = document.getElementById('connectionStatus');
  if (connectionStatus) {
    if (AVIVA_APP.isOnline) {
      connectionStatus.innerHTML = '<i class="fas fa-wifi"></i> Online';
      connectionStatus.className = 'connection-status online';
    } else {
      connectionStatus.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline';
      connectionStatus.className = 'connection-status offline';
    }
  }
}

// ================= FUNÇÕES DE VÍDEO =================
function playVideo(videoId) {
  if (!AVIVA_APP.isOnline) {
    alert('⚠️  Você está offline. Conecte-se à internet para assistir vídeos.');
    return;
  }
  
  const video = AVIVA_APP.data.meditacaoDiaria.find(v => v.id == videoId);
  if (!video) {
    alert('Vídeo não encontrado');
    return;
  }
  
  // Registrar visualização
  fetch(`/api/video/${videoId}/view`, { method: 'POST' })
    .catch(err => console.log('Erro ao registrar view:', err));
  
  // Abrir vídeo
  if (video.tipo === 'youtube') {
    window.open(video.url, '_blank');
  } else if (video.tipo === 'upload') {
    // Criar modal de vídeo
    const videoModal = document.createElement('div');
    videoModal.className = 'modal';
    videoModal.id = 'videoModal';
    videoModal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <div class="video-container">
          <video controls autoplay style="width:100%; border-radius:10px;">
            <source src="${video.url}" type="video/mp4">
            Seu navegador não suporta vídeo HTML5.
          </video>
        </div>
        <div class="video-info">
          <h3>${video.titulo}</h3>
          <p>${video.descricao}</p>
          <div class="video-meta">
            <span><i class="fas fa-clock"></i> ${video.duracao}</span>
            <span><i class="fas fa-tag"></i> ${video.categoria}</span>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(videoModal);
    openModal('videoModal');
    
    // Fechar modal quando vídeo terminar
    const videoElement = videoModal.querySelector('video');
    videoElement.addEventListener('ended', () => {
      setTimeout(() => closeModal('videoModal'), 2000);
    });
  }
}

// ================= GERENCIAMENTO DE MODAIS =================
function setupModals() {
  // Abrir modal palavra da semana
  const openModalBtn = document.getElementById('openModal');
  if (openModalBtn) {
    openModalBtn.addEventListener('click', () => openModal('modalPalavraSemana'));
  }
  
  // Botões eventos especiais
  const btnGarantirLugar = document.getElementById('btnGarantirLugar');
  const btnJaInscrito = document.getElementById('btnJaInscrito');
  
  if (btnGarantirLugar) {
    btnGarantirLugar.addEventListener('click', () => openModal('modalInscricao'));
  }
  
  if (btnJaInscrito) {
    btnJaInscrito.addEventListener('click', () => openModal('modalConfirmacao'));
  }
  
  // Botões fechar modal
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('close-modal')) {
      const modal = e.target.closest('.modal');
      if (modal) closeModal(modal.id);
    }
    
    // Fechar modal clicando fora
    if (e.target.classList.contains('modal')) {
      closeModal(e.target.id);
    }
  });
  
  // Formulário de inscrição
  const formInscricao = document.getElementById('formInscricao');
  if (formInscricao) {
    formInscricao.addEventListener('submit', handleInscricao);
  }
  
  // Botão global WhatsApp
  const whatsappGlobal = document.getElementById('whatsappGlobal');
  if (whatsappGlobal) {
    whatsappGlobal.addEventListener('click', () => openModal('modalContatos'));
  }
  
  // Tecla ESC para fechar modais
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal').forEach(modal => {
        if (modal.style.display === 'block') {
          closeModal(modal.id);
        }
      });
    }
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Focar no primeiro campo de input se existir
    const firstInput = modal.querySelector('input, textarea, button');
    if (firstInput) firstInput.focus();
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Remover modal de vídeo se existir
    if (modalId === 'videoModal') {
      setTimeout(() => modal.remove(), 300);
    }
  }
}

async function handleInscricao(e) {
  e.preventDefault();
  
  if (!AVIVA_APP.isOnline) {
    alert('⚠️  Você está offline. Conecte-se à internet para fazer inscrição.');
    return;
  }
  
  const form = e.target;
  const formData = {
    nome: form.nomeCompleto.value.trim(),
    telefone: form.telefone.value.trim(),
    email: form.email.value.trim() || null,
    quantidade: form.quantidadePessoas.value || 1
  };
  
  // Validação básica
  if (!formData.nome || !formData.telefone) {
    alert('Por favor, preencha pelo menos nome e telefone.');
    return;
  }
  
  try {
    const response = await fetch('/api/inscricoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      closeModal('modalInscricao');
      openModal('modalConfirmacao');
      form.reset();
      
      // Atualizar contador de inscrições se existir
      const inscricoesCount = document.getElementById('inscricoesCount');
      if (inscricoesCount) {
        const current = parseInt(inscricoesCount.textContent) || 0;
        inscricoesCount.textContent = current + 1;
      }
    } else {
      throw new Error('Erro ao enviar inscrição');
    }
  } catch (error) {
    alert('Erro ao enviar inscrição: ' + error.message);
  }
}

// ================= GERENCIAMENTO DE CONEXÃO =================
function setupConnectionManager() {
  // Status inicial
  AVIVA_APP.isOnline = navigator.onLine;
  updateConnectionStatus();
  
  // Ouvir mudanças de conexão
  window.addEventListener('online', () => {
    AVIVA_APP.isOnline = true;
    updateConnectionStatus();
    showNotification('🟢 Você está online novamente!', 'success');
    
    // Sincronizar dados quando voltar online
    setTimeout(loadAppData, 1000);
  });
  
  window.addEventListener('offline', () => {
    AVIVA_APP.isOnline = false;
    updateConnectionStatus();
    showNotification('🔴 Você está offline. Algumas funções não estarão disponíveis.', 'warning');
  });
  
  // Verificar conexão periodicamente
  setInterval(() => {
    AVIVA_APP.isOnline = navigator.onLine;
    updateConnectionStatus();
  }, 30000); // A cada 30 segundos
}

function showNotification(message, type = 'info') {
  // Criar elemento de notificação
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span>${message}</span>
      <button class="notification-close">&times;</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Mostrar notificação
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Auto-remover após 5 segundos
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
  
  // Fechar ao clicar no botão
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  });
}

// ================= INSTALAÇÃO PWA =================
const INSTALL_STORAGE_KEY = 'aviva_app_installed';
const BANNER_DISMISSED_KEY = 'aviva_banner_dismissed_until';

function jaInstalado() {
  return localStorage.getItem(INSTALL_STORAGE_KEY) === '1';
}

function bannerDispensado() {
  const ate = localStorage.getItem(BANNER_DISMISSED_KEY);
  return ate && Date.now() < Number(ate);
}

function setupPWAInstall() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (isStandalone || jaInstalado()) return;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
    if (!bannerDispensado()) showInstallPrompt();
  });

  // Detecta quando o app foi instalado com sucesso
  window.addEventListener('appinstalled', () => {
    localStorage.setItem(INSTALL_STORAGE_KEY, '1');
    const b = document.getElementById('installBanner');
    if (b) b.remove();
  });

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  if ((isIOS || isAndroid()) && !bannerDispensado()) {
    criarBannerInstall();
  }
}

function isAndroid() { return /Android/.test(navigator.userAgent); }

function showInstallPrompt() {
  const banner = document.getElementById('installBanner');
  if (banner) banner.classList.add('show');
  else criarBannerInstall();
}

function criarBannerInstall() {
  if (document.getElementById('installBanner')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div class="install-banner" id="installBanner">
      <div class="install-banner-content">
        <div class="app-icon"><i class="fas fa-church"></i></div>
        <div class="app-info">
          <div class="app-name">AVIVA App</div>
          <div class="app-desc">Instale — rápido, sem anúncios</div>
        </div>
      </div>
      <div class="install-banner-actions">
        <button class="btn-install" id="btnInstallPWA"><i class="fas fa-download"></i> Instalar</button>
        <button class="btn-close" id="btnCloseBanner">&times;</button>
      </div>
    </div>
  `);

  document.getElementById('btnCloseBanner').addEventListener('click', () => {
    document.getElementById('installBanner').classList.remove('show');
    // Não mostra de novo por 7 dias
    localStorage.setItem(BANNER_DISMISSED_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
  });

  document.getElementById('btnInstallPWA').addEventListener('click', abrirGuiaInstalacao);

  setTimeout(() => {
    const b = document.getElementById('installBanner');
    if (b) b.classList.add('show');
  }, 4000);
}

function abrirGuiaInstalacao() {
  // Tenta o prompt nativo (Android Chrome)
  if (window.deferredPrompt) {
    window.deferredPrompt.prompt();
    window.deferredPrompt.userChoice.then(r => {
      if (r.outcome === 'accepted') localStorage.setItem(INSTALL_STORAGE_KEY, '1');
      window.deferredPrompt = null;
      const b = document.getElementById('installBanner');
      if (b) b.classList.remove('show');
    });
    return;
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroidDevice = isAndroid();

  let passos = '';
  let titulo = '';

  if (isIOS) {
    titulo = '📱 Instalar no iPhone / iPad';
    passos = `
      <div class="install-step"><span class="install-num">1</span><div><strong>Abra no Safari</strong><br><small>O app só pode ser instalado pelo Safari (não Chrome)</small></div></div>
      <div class="install-step"><span class="install-num">2</span><div><strong>Toque em Compartilhar</strong> <span style="font-size:1.3rem">📤</span><br><small>Botão na barra inferior do Safari</small></div></div>
      <div class="install-step"><span class="install-num">3</span><div><strong>Role e toque em "Adicionar à Tela de Início"</strong> <span style="font-size:1.1rem">➕</span></div></div>
      <div class="install-step"><span class="install-num">4</span><div><strong>Toque em "Adicionar"</strong><br><small>O ícone AVIVA vai aparecer na sua tela inicial!</small></div></div>`;
  } else if (isAndroidDevice) {
    titulo = '🤖 Instalar no Android';
    passos = `
      <div class="install-step"><span class="install-num">1</span><div><strong>Abra no Chrome</strong><br><small>Se estiver em outro navegador, copie o link e abra no Chrome</small></div></div>
      <div class="install-step"><span class="install-num">2</span><div><strong>Toque nos 3 pontos</strong> <span style="font-size:1.2rem">⋮</span><br><small>Canto superior direito da tela</small></div></div>
      <div class="install-step"><span class="install-num">3</span><div><strong>Toque em "Instalar aplicativo"</strong><br><small>ou "Adicionar à tela inicial"</small></div></div>
      <div class="install-step"><span class="install-num">4</span><div><strong>Confirme a instalação</strong><br><small>O ícone AVIVA vai aparecer na sua tela!</small></div></div>`;
  } else {
    titulo = '💻 Instalar no computador';
    passos = `
      <div class="install-step"><span class="install-num">1</span><div><strong>Clique nos 3 pontos</strong> no Chrome<br><small>Canto superior direito</small></div></div>
      <div class="install-step"><span class="install-num">2</span><div><strong>Clique em "Instalar AVIVA…"</strong><br><small>ou procure "Salvar e compartilhar" → "Criar atalho"</small></div></div>
      <div class="install-step"><span class="install-num">3</span><div><strong>Confirme clicando em "Instalar"</strong></div></div>`;
  }

  // Criar modal de instrução
  const existente = document.getElementById('installGuideModal');
  if (existente) existente.remove();

  document.body.insertAdjacentHTML('beforeend', `
    <div id="installGuideModal" style="position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:flex-end;padding:0">
      <div style="background:#fff;border-radius:20px 20px 0 0;width:100%;max-height:85vh;overflow-y:auto;padding:1.5rem">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.2rem">
          <h3 style="font-size:1.1rem;font-weight:700">${titulo}</h3>
          <button onclick="document.getElementById('installGuideModal').remove()" style="background:none;border:none;font-size:1.5rem;color:#6b7280;cursor:pointer;line-height:1">&times;</button>
        </div>
        <div id="installSteps">${passos}</div>
        <button onclick="document.getElementById('installGuideModal').remove();localStorage.setItem('${INSTALL_STORAGE_KEY}','1');document.getElementById('installBanner')?.remove();"
          style="width:100%;margin-top:1.2rem;padding:.9rem;background:#2563eb;color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:700;cursor:pointer">
          ✅ Já instalei o app!
        </button>
      </div>
    </div>
    <style>
      .install-step{display:flex;align-items:flex-start;gap:.8rem;padding:.9rem;background:#f8fafc;border-radius:12px;margin-bottom:.6rem}
      .install-num{min-width:28px;height:28px;background:#2563eb;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem}
      .install-step small{color:#6b7280;font-size:.8rem}
    </style>
  `);

  // Fechar clicando fora
  document.getElementById('installGuideModal').addEventListener('click', function(e) {
    if (e.target === this) this.remove();
  });
}

// ================= EFEITOS VISUAIS =================
function setupVisualEffects() {
  // Partículas de fundo
  createParticles();
  
  // Efeito no logo
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('mouseenter', () => {
      logo.style.transform = 'scale(1.05) rotate(5deg)';
      logo.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.6)';
    });
    
    logo.addEventListener('mouseleave', () => {
      logo.style.transform = 'scale(1) rotate(0)';
      logo.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.3)';
    });
    
    // Toque em dispositivos móveis
    logo.addEventListener('touchstart', () => {
      logo.style.transform = 'scale(0.95)';
    });
    
    logo.addEventListener('touchend', () => {
      logo.style.transform = 'scale(1)';
    });
  }
  
  // Animação de entrada das seções
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
      }
    });
  }, observerOptions);
  
  // Observar todas as seções
  document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
  });
  
  // Efeito de digitação no versículo
  const versiculoContainer = document.getElementById('versiculoContainer');
  if (versiculoContainer && AVIVA_APP.data?.versiculo) {
    versiculoContainer.style.opacity = '0';
    setTimeout(() => {
      versiculoContainer.style.transition = 'opacity 1s ease';
      versiculoContainer.style.opacity = '1';
    }, 500);
  }
}

function createParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;
  
  const particleCount = 20;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const size = Math.random() * 6 + 3;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 20}s`;
    particle.style.opacity = Math.random() * 0.5 + 0.1;
    
    particlesContainer.appendChild(particle);
  }
}

// ================= INICIALIZAÇÃO =================
async function initApp() {
  console.log('🚀 Iniciando AVIVA App v' + AVIVA_APP.version);
  
  try {
    // Registrar Service Worker
    registerServiceWorker();
    
    // Configurar gerenciamento de conexão
    setupConnectionManager();
    
    // Configurar modais
    setupModals();
    
    // Configurar instalação PWA
    setupPWAInstall();
    
    // Configurar efeitos visuais
    setupVisualEffects();
    
    // Carregar dados
    await loadAppData();
    
    // Atualizar interface
    updateUI();
    
    // Atualizar dados periodicamente
    setInterval(async () => {
      if (AVIVA_APP.isOnline) {
        await loadAppData();
        updateUI();
      }
    }, 5 * 60 * 1000); // A cada 5 minutos
    
    console.log('✅ AVIVA App iniciado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao iniciar app:', error);
    showNotification('Erro ao carregar o app. Recarregue a página.', 'error');
  }
}

// Iniciar quando a página carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// ================= FUNÇÕES GLOBAIS =================
window.AVIVA = {
  openModal,
  closeModal,
  playVideo,
  refreshData: loadAppData,
  getAppData: () => AVIVA_APP.data,
  isOnline: () => AVIVA_APP.isOnline,
  installApp: showInstallInstructions
};

// CSS adicional para notificações
const notificationCSS = `
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--primary);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  transform: translateX(150%);
  transition: transform 0.3s ease;
  z-index: 9999;
  max-width: 350px;
}

.notification.show {
  transform: translateX(0);
}

.notification.success {
  background: var(--success);
}

.notification.warning {
  background: var(--warning);
}

.notification.error {
  background: var(--danger);
}

.notification-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.notification-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  margin: 0;
}

.connection-status {
  position: fixed;
  bottom: 80px;
  right: 20px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  z-index: 999;
}

.connection-status.online {
  background: rgba(16, 185, 129, 0.9);
}

.connection-status.offline {
  background: rgba(239, 68, 68, 0.9);
}

.offline-badge {
  display: inline-block;
  background: var(--warning);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-size: 0.8rem;
  margin-left: 0.5rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}

.section {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.section.animated {
  opacity: 1;
  transform: translateY(0);
}
`;

// Adicionar CSS dinâmico
const style = document.createElement('style');
style.textContent = notificationCSS;
document.head.appendChild(style);