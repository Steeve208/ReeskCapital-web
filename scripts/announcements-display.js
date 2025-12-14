/**
 * RSC CHAIN - SISTEMA DE ANUNCIOS
 * Muestra los anuncios creados en el panel de admin
 * Ubicaciones: Hero, Announcement Box, Sidebar, Popup, Mining Event
 */

class AnnouncementsDisplay {
  constructor() {
    this.anuncios = [];
    this.mostrados = new Set(); // Para popups ya mostrados
    this.initialized = false;
  }

  async initialize() {
    console.log('📢 Inicializando sistema de anuncios...');
    
    try {
      // Cargar anuncios
      this.cargarAnuncios();
      
      // Mostrar en cada ubicación
      this.renderizarTodos();
      
      // Escuchar actualizaciones en tiempo real
      this.setupListeners();
      
      this.initialized = true;
      console.log('✅ Sistema de anuncios inicializado');
      
    } catch (error) {
      console.error('Error inicializando anuncios:', error);
    }
  }

  cargarAnuncios() {
    try {
      const data = localStorage.getItem('rsc_announcements_public');
      if (data) {
        this.anuncios = JSON.parse(data);
        console.log('📢 Anuncios cargados:', this.anuncios.length);
      }
    } catch (e) {
      console.error('Error cargando anuncios:', e);
      this.anuncios = [];
    }
  }

  setupListeners() {
    // Escuchar actualizaciones del admin
    window.addEventListener('announcementsUpdated', (e) => {
      console.log('📢 Actualización de anuncios recibida');
      this.anuncios = e.detail || [];
      this.renderizarTodos();
    });

    // Escuchar cambios en localStorage (admin en otra pestaña)
    window.addEventListener('storage', (e) => {
      if (e.key === 'rsc_announcements_public') {
        console.log('📢 Cambio detectado en anuncios');
        this.cargarAnuncios();
        this.renderizarTodos();
      }
    });
  }

  renderizarTodos() {
    this.renderizarHero();
    this.renderizarAnnouncementBox();
    this.renderizarSidebar();
    this.renderizarMiningEvent();
    this.mostrarPopup();
  }

  // Obtener anuncios por ubicación
  getAnunciosPorUbicacion(ubicacion) {
    return this.anuncios.filter(a => a.ubicacion === ubicacion && a.activo);
  }

  // HERO PRINCIPAL
  renderizarHero() {
    const anuncios = this.getAnunciosPorUbicacion('hero');
    const container = document.getElementById('heroAnnouncement') || document.querySelector('.hero-announcement');
    
    if (!container) return;
    
    if (anuncios.length === 0) {
      container.style.display = 'none';
      return;
    }

    const anuncio = anuncios[0]; // Mostrar el de mayor prioridad
    container.style.display = 'block';
    container.innerHTML = this.renderizarContenido(anuncio, 'hero');
  }

  // CUADRO DE ANUNCIOS
  renderizarAnnouncementBox() {
    const anuncios = this.getAnunciosPorUbicacion('announcement');
    const container = document.getElementById('announcementBox') || document.querySelector('.announcement-box');
    
    if (!container) return;
    
    if (anuncios.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    container.innerHTML = `
      <div class="announcements-carousel">
        ${anuncios.map(a => this.renderizarContenido(a, 'announcement')).join('')}
      </div>
    `;

    // Si hay más de un anuncio, iniciar carrusel
    if (anuncios.length > 1) {
      this.iniciarCarrusel(container);
    }
  }

  // SIDEBAR
  renderizarSidebar() {
    const anuncios = this.getAnunciosPorUbicacion('sidebar');
    const container = document.getElementById('sidebarAnnouncements') || document.querySelector('.sidebar-announcements');
    
    if (!container) return;
    
    if (anuncios.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    container.innerHTML = anuncios.map(a => this.renderizarContenido(a, 'sidebar')).join('');
  }

  // EVENTO DE MINERÍA
  renderizarMiningEvent() {
    const anuncios = this.getAnunciosPorUbicacion('mining_event');
    const container = document.getElementById('miningEventAnnouncement') || document.querySelector('.mining-event-announcement');
    
    if (!container) return;
    
    if (anuncios.length === 0) {
      container.style.display = 'none';
      return;
    }

    const anuncio = anuncios[0];
    container.style.display = 'block';
    container.innerHTML = this.renderizarContenido(anuncio, 'mining_event');
  }

  // POPUP
  mostrarPopup() {
    const anuncios = this.getAnunciosPorUbicacion('popup');
    
    if (anuncios.length === 0) return;

    const anuncio = anuncios[0];
    
    // No mostrar si ya se mostró esta sesión
    const sessionKey = `popup_shown_${anuncio.id}`;
    if (sessionStorage.getItem(sessionKey)) return;

    // Mostrar después de un delay
    setTimeout(() => {
      this.crearPopup(anuncio);
      sessionStorage.setItem(sessionKey, 'true');
    }, 3000);
  }

  crearPopup(anuncio) {
    const existente = document.getElementById('announcementPopup');
    if (existente) existente.remove();

    const popup = document.createElement('div');
    popup.id = 'announcementPopup';
    popup.className = 'announcement-popup';
    popup.innerHTML = `
      <div class="popup-overlay" onclick="window.announcementsDisplay.cerrarPopup()"></div>
      <div class="popup-content">
        <button class="popup-close" onclick="window.announcementsDisplay.cerrarPopup()">
          <i class="fas fa-times"></i>
        </button>
        ${this.renderizarContenido(anuncio, 'popup')}
      </div>
    `;

    // Agregar estilos si no existen
    if (!document.getElementById('popupStyles')) {
      const styles = document.createElement('style');
      styles.id = 'popupStyles';
      styles.textContent = `
        .announcement-popup {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }
        .popup-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(5px);
        }
        .popup-content {
          position: relative;
          background: #161a22;
          border: 1px solid #232937;
          border-radius: 16px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }
        .popup-close {
          position: absolute;
          top: 15px;
          right: 15px;
          width: 36px;
          height: 36px;
          background: rgba(0, 0, 0, 0.5);
          border: none;
          border-radius: 50%;
          color: #fff;
          font-size: 1rem;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s;
        }
        .popup-close:hover {
          background: #ff5555;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(popup);
  }

  cerrarPopup() {
    const popup = document.getElementById('announcementPopup');
    if (popup) {
      popup.style.animation = 'fadeIn 0.3s ease reverse';
      setTimeout(() => popup.remove(), 280);
    }
  }

  // Renderizar contenido según tipo
  renderizarContenido(anuncio, ubicacion) {
    const { tipo, contenido, titulo, link, target, color_fondo, color_texto } = anuncio;
    
    let html = '';
    
    switch (tipo) {
      case 'image':
        html = `<img src="${contenido}" alt="${titulo}" style="width:100%;height:auto;display:block;">`;
        break;
        
      case 'video':
        html = `
          <video autoplay muted loop playsinline style="width:100%;height:auto;display:block;">
            <source src="${contenido}" type="video/mp4">
          </video>
        `;
        break;
        
      case 'youtube':
        const videoId = this.extractYouTubeId(contenido);
        html = `
          <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">
            <iframe 
              src="https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0" 
              style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen>
            </iframe>
          </div>
        `;
        break;
        
      case 'html':
        html = contenido;
        break;
        
      case 'text':
        html = `
          <div class="text-banner" style="
            background: ${color_fondo || '#00ff88'};
            color: ${color_texto || '#000'};
            padding: 1.5rem 2rem;
            text-align: center;
            font-weight: 600;
            font-size: 1.1rem;
          ">
            ${contenido}
          </div>
        `;
        break;
        
      default:
        html = `<div style="padding:2rem;text-align:center;color:#888;">${titulo}</div>`;
    }

    // Envolver en link si existe
    if (link) {
      html = `<a href="${link}" target="${target || '_blank'}" style="display:block;text-decoration:none;">${html}</a>`;
    }

    return `
      <div class="announcement-item" data-id="${anuncio.id}" data-ubicacion="${ubicacion}">
        ${html}
      </div>
    `;
  }

  extractYouTubeId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : '';
  }

  iniciarCarrusel(container) {
    const items = container.querySelectorAll('.announcement-item');
    if (items.length <= 1) return;

    let current = 0;
    items.forEach((item, i) => {
      item.style.display = i === 0 ? 'block' : 'none';
    });

    setInterval(() => {
      items[current].style.display = 'none';
      current = (current + 1) % items.length;
      items[current].style.display = 'block';
    }, 5000);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.announcementsDisplay = new AnnouncementsDisplay();
  window.announcementsDisplay.initialize();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnnouncementsDisplay;
}

