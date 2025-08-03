// ===== ABOUT ENHANCED JAVASCRIPT =====

class AboutManager {
    constructor() {
        this.currentSection = 'story';
        this.searchIndex = [];
        this.searchResults = [];
        this.timelineData = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeSearch();
        this.setupNavigation();
        this.setupTimeline();
        this.setupValues();
        this.setupFloatingNav();
        this.setupKeyboardShortcuts();
        this.loadSectionContent();
    }

    setupEventListeners() {
        // Búsqueda
        const searchInput = document.getElementById('aboutSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
            searchInput.addEventListener('focus', () => this.showSearchResults());
            searchInput.addEventListener('blur', () => this.hideSearchResults());
        }

        // Navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.navigateToSection(section);
            });
        });

        // Botones de acción
        this.setupActionButtons();
    }

    setupActionButtons() {
        // Descargar Historia
        const downloadStoryBtn = document.getElementById('downloadStory');
        if (downloadStoryBtn) {
            downloadStoryBtn.addEventListener('click', () => this.downloadStory());
        }

        // Compartir Historia
        const shareStoryBtn = document.getElementById('shareStory');
        if (shareStoryBtn) {
            shareStoryBtn.addEventListener('click', () => this.shareStory());
        }

        // Press Kit
        const downloadPressKitBtn = document.getElementById('downloadPressKit');
        if (downloadPressKitBtn) {
            downloadPressKitBtn.addEventListener('click', () => this.downloadPressKit());
        }

        // Compartir Acerca
        const shareAboutBtn = document.getElementById('shareAbout');
        if (shareAboutBtn) {
            shareAboutBtn.addEventListener('click', () => this.shareAbout());
        }

        // Imprimir Acerca
        const printAboutBtn = document.getElementById('printAbout');
        if (printAboutBtn) {
            printAboutBtn.addEventListener('click', () => this.printAbout());
        }
    }

    initializeSearch() {
        // Crear índice de búsqueda
        this.searchIndex = [
            {
                title: 'Historia',
                content: 'La revolución blockchain que cambió todo',
                section: 'story',
                keywords: ['historia', 'fundación', 'inicio', 'origen', 'blockchain']
            },
            {
                title: 'Visión & Misión',
                content: 'Nuestros valores fundamentales y objetivos',
                section: 'vision',
                keywords: ['visión', 'misión', 'valores', 'objetivos', 'propósito']
            },
            {
                title: 'Valores',
                content: 'Los principios que guían cada decisión',
                section: 'values',
                keywords: ['valores', 'principios', 'ética', 'cultura', 'filosofía']
            },
            {
                title: 'Roadmap',
                content: 'Nuestro camino hacia el futuro',
                section: 'roadmap',
                keywords: ['roadmap', 'desarrollo', 'plan', 'futuro', 'cronograma']
            },
            {
                title: 'Hitos',
                content: 'Logros importantes en nuestra historia',
                section: 'milestones',
                keywords: ['hitos', 'logros', 'éxitos', 'conquistas', 'momentos']
            },
            {
                title: 'Métricas',
                content: 'Estadísticas y datos de la empresa',
                section: 'metrics',
                keywords: ['métricas', 'estadísticas', 'datos', 'números', 'analytics']
            },
            {
                title: 'Equipo',
                content: 'Los visionarios detrás de RSC Chain',
                section: 'team',
                keywords: ['equipo', 'miembros', 'fundadores', 'desarrolladores', 'personal']
            },
            {
                title: 'Cultura',
                content: 'Valores y ambiente de trabajo',
                section: 'culture',
                keywords: ['cultura', 'ambiente', 'valores', 'trabajo', 'compañía']
            },
            {
                title: 'Carreras',
                content: 'Oportunidades de trabajo en RSC Chain',
                section: 'careers',
                keywords: ['carreras', 'trabajo', 'empleo', 'oportunidades', 'vacantes']
            },
            {
                title: 'Contacto',
                content: 'Conecta con nuestro equipo',
                section: 'contact',
                keywords: ['contacto', 'comunicación', 'soporte', 'ayuda', 'email']
            },
            {
                title: 'Soporte',
                content: 'Asistencia técnica y ayuda',
                section: 'support',
                keywords: ['soporte', 'ayuda', 'asistencia', 'técnico', 'problemas']
            },
            {
                title: 'Prensa',
                content: 'Kit de prensa y recursos',
                section: 'press',
                keywords: ['prensa', 'medios', 'comunicación', 'kit', 'recursos']
            }
        ];
    }

    handleSearch(query) {
        if (query.length < 2) {
            this.hideSearchResults();
            return;
        }

        const results = this.searchIndex.filter(item => {
            const searchText = `${item.title} ${item.content} ${item.keywords.join(' ')}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });

        this.displaySearchResults(results);
    }

    displaySearchResults(results) {
        const dropdown = document.getElementById('aboutSearchResults');
        if (!dropdown) return;

        dropdown.innerHTML = '';

        if (results.length === 0) {
            dropdown.innerHTML = `
                <div class="search-result-item">
                    <span>No se encontraron resultados</span>
                </div>
            `;
        } else {
            results.forEach(result => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.innerHTML = `
                    <div class="result-title">${result.title}</div>
                    <div class="result-content">${result.content}</div>
                `;
                item.addEventListener('click', () => {
                    this.navigateToSection(result.section);
                    this.hideSearchResults();
                });
                dropdown.appendChild(item);
            });
        }

        dropdown.classList.add('active');
    }

    showSearchResults() {
        const dropdown = document.getElementById('aboutSearchResults');
        if (dropdown) {
            dropdown.classList.add('active');
        }
    }

    hideSearchResults() {
        setTimeout(() => {
            const dropdown = document.getElementById('aboutSearchResults');
            if (dropdown) {
                dropdown.classList.remove('active');
            }
        }, 200);
    }

    navigateToSection(section) {
        // Actualizar navegación activa
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[data-section="${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Ocultar todas las páginas
        document.querySelectorAll('.about-page').forEach(page => {
            page.classList.remove('active');
        });

        // Mostrar página correspondiente
        const targetPage = document.getElementById(`${section}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentSection = section;
            this.updateBreadcrumb(section);
            this.updatePageTitle(section);
        }

        // Scroll al inicio
        const contentWrapper = document.querySelector('.about-content-wrapper');
        if (contentWrapper) {
            contentWrapper.scrollTop = 0;
        }
    }

    updateBreadcrumb(section) {
        const currentPageElement = document.querySelector('.breadcrumb-item.active span');
        if (currentPageElement) {
            const pageNames = {
                'story': 'Historia',
                'vision': 'Visión & Misión',
                'values': 'Valores',
                'roadmap': 'Roadmap',
                'milestones': 'Hitos',
                'metrics': 'Métricas',
                'team': 'Equipo',
                'culture': 'Cultura',
                'careers': 'Carreras',
                'contact': 'Contacto',
                'support': 'Soporte',
                'press': 'Prensa'
            };

            currentPageElement.textContent = pageNames[section] || 'Acerca de RSC Chain';
        }
    }

    updatePageTitle(section) {
        const pageNames = {
            'story': 'Nuestra Historia',
            'vision': 'Visión & Misión',
            'values': 'Nuestros Valores',
            'roadmap': 'Roadmap',
            'milestones': 'Hitos Importantes',
            'metrics': 'Métricas de la Empresa',
            'team': 'Nuestro Equipo',
            'culture': 'Cultura de la Empresa',
            'careers': 'Carreras en RSC Chain',
            'contact': 'Contacto',
            'support': 'Soporte',
            'press': 'Prensa'
        };

        const title = pageNames[section] || 'Acerca de RSC Chain';
        document.title = `${title} - ReeskCapital.co`;
    }

    setupNavigation() {
        // Navegación entre secciones
        const prevBtn = document.getElementById('prevSection');
        const nextBtn = document.getElementById('nextSection');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateToPreviousSection());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateToNextSection());
        }
    }

    navigateToPreviousSection() {
        const sections = ['story', 'vision', 'values', 'roadmap', 'milestones', 'metrics', 'team', 'culture', 'careers', 'contact', 'support', 'press'];
        const currentIndex = sections.indexOf(this.currentSection);
        const previousIndex = currentIndex > 0 ? currentIndex - 1 : sections.length - 1;
        this.navigateToSection(sections[previousIndex]);
    }

    navigateToNextSection() {
        const sections = ['story', 'vision', 'values', 'roadmap', 'milestones', 'metrics', 'team', 'culture', 'careers', 'contact', 'support', 'press'];
        const currentIndex = sections.indexOf(this.currentSection);
        const nextIndex = currentIndex < sections.length - 1 ? currentIndex + 1 : 0;
        this.navigateToSection(sections[nextIndex]);
    }

    setupTimeline() {
        // Configurar timeline interactivo
        this.timelineData = {
            '2023': {
                title: 'El Inicio',
                description: 'Un grupo de desarrolladores rebeldes se reunió con una visión clara: crear la blockchain más avanzada del mundo.',
                achievements: ['Fundación', 'Whitepaper', 'MVP'],
                status: 'completed'
            },
            '2024': {
                title: 'El Lanzamiento',
                description: 'RSC Chain se lanza al mundo, con minería web, P2P sin KYC y staking avanzado.',
                achievements: ['Lanzamiento', 'Minería Web', 'P2P Trading'],
                status: 'active'
            },
            '2025': {
                title: 'El Futuro',
                description: 'Expansión global con RSC Bank, pagos sin contacto y adopción masiva.',
                achievements: ['RSC Bank', 'Mobile App', 'Global Expansion'],
                status: 'pending'
            }
        };

        // Configurar controles del timeline
        document.querySelectorAll('.timeline-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const year = e.target.getAttribute('data-year');
                this.showTimelineYear(year);
            });
        });

        // Configurar items del timeline
        document.querySelectorAll('.timeline-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const year = item.getAttribute('data-year');
                this.showTimelineYear(year);
            });
        });
    }

    showTimelineYear(year) {
        // Actualizar controles
        document.querySelectorAll('.timeline-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`[data-year="${year}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Actualizar items del timeline
        document.querySelectorAll('.timeline-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeItem = document.querySelector(`.timeline-item[data-year="${year}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        // Mostrar información detallada
        this.showTimelineDetails(year);
    }

    showTimelineDetails(year) {
        const data = this.timelineData[year];
        if (!data) return;

        // Crear modal o actualizar sección con detalles
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'timeline-details-modal';
        detailsContainer.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${year} - ${data.title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${data.description}</p>
                    <div class="achievements-list">
                        <h4>Logros:</h4>
                        <ul>
                            ${data.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="status-badge ${data.status}">
                        ${data.status === 'completed' ? '✅ Completado' : 
                          data.status === 'active' ? '🔄 En Progreso' : '⏳ Pendiente'}
                    </div>
                </div>
            </div>
        `;

        // Mostrar modal
        document.body.appendChild(detailsContainer);
        setTimeout(() => detailsContainer.classList.add('active'), 10);

        // Cerrar modal
        detailsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || e.target === detailsContainer) {
                detailsContainer.classList.remove('active');
                setTimeout(() => detailsContainer.remove(), 300);
            }
        });
    }

    setupValues() {
        // Configurar valores interactivos
        document.querySelectorAll('.value-card-enhanced').forEach(card => {
            card.addEventListener('click', (e) => {
                const value = card.getAttribute('data-value');
                this.showValueDetails(value);
            });
        });

        // Configurar tags de valores
        document.querySelectorAll('.value-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                const value = e.target.textContent;
                this.showValueDetails(value.toLowerCase());
            });
        });
    }

    showValueDetails(value) {
        const valueDetails = {
            'privacy': {
                title: 'Privacidad Total',
                description: 'Tu información es tuya. No recopilamos datos innecesarios ni compartimos información personal.',
                features: ['Sin KYC', 'Encriptación E2E', 'Anonimato'],
                examples: ['Transacciones privadas', 'Sin rastreo', 'Control total']
            },
            'freedom': {
                title: 'Libertad Financiera',
                description: 'Sin fronteras, sin restricciones. Acceso global a servicios financieros sin intermediarios.',
                features: ['Sin Fronteras', 'Sin Bancos', 'Sin Permisos'],
                examples: ['Comercio global', 'Sin intermediarios', 'Acceso universal']
            },
            'innovation': {
                title: 'Innovación Constante',
                description: 'Pioneros en tecnología blockchain. Siempre a la vanguardia de las últimas innovaciones.',
                features: ['50K TPS', 'Minería Web', 'DeFi Nativo'],
                examples: ['Tecnología avanzada', 'Soluciones únicas', 'Mejora continua']
            },
            'community': {
                title: 'Comunidad Primero',
                description: 'Construido por la comunidad, para la comunidad. Cada usuario es parte de nuestra historia.',
                features: ['Gobernanza DAO', 'Votos Comunitarios', 'Transparencia'],
                examples: ['Decisiones colectivas', 'Participación activa', 'Transparencia total']
            }
        };

        const details = valueDetails[value];
        if (!details) return;

        // Crear modal con detalles del valor
        const modal = document.createElement('div');
        modal.className = 'value-details-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${details.title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p class="value-description">${details.description}</p>
                    
                    <div class="value-features-section">
                        <h4>Características:</h4>
                        <div class="features-grid">
                            ${details.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="value-examples-section">
                        <h4>Ejemplos:</h4>
                        <ul class="examples-list">
                            ${details.examples.map(example => `<li>${example}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;

        // Mostrar modal
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);

        // Cerrar modal
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || e.target === modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    setupFloatingNav() {
        // Configurar navegación flotante
        const backToTopBtn = document.getElementById('backToTop');
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', () => {
                const contentWrapper = document.querySelector('.about-content-wrapper');
                if (contentWrapper) {
                    contentWrapper.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + K para búsqueda
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('aboutSearch');
                if (searchInput) {
                    searchInput.focus();
                }
            }

            // Flechas para navegación
            if (e.key === 'ArrowLeft' && e.altKey) {
                e.preventDefault();
                this.navigateToPreviousSection();
            }

            if (e.key === 'ArrowRight' && e.altKey) {
                e.preventDefault();
                this.navigateToNextSection();
            }

            // Escape para cerrar modales/búsqueda
            if (e.key === 'Escape') {
                this.hideSearchResults();
                this.closeAllModals();
            }
        });
    }

    closeAllModals() {
        document.querySelectorAll('.timeline-details-modal, .value-details-modal').forEach(modal => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        });
    }

    loadSectionContent() {
        // Cargar contenido dinámico según la sección actual
        this.updateSectionContent(this.currentSection);
    }

    updateSectionContent(section) {
        // Aquí se puede cargar contenido dinámico según la sección
        console.log(`Cargando contenido para: ${section}`);
    }

    // Funciones de utilidad
    downloadStory() {
        this.showNotification('Descargando historia de la empresa...', 'info');
        setTimeout(() => {
            this.showNotification('Historia descargada exitosamente', 'success');
        }, 2000);
    }

    shareStory() {
        if (navigator.share) {
            navigator.share({
                title: 'Historia de RSC Chain',
                text: 'Conoce la historia de la blockchain más avanzada del mundo',
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showNotification('URL copiada al portapapeles', 'success');
            });
        }
    }

    downloadPressKit() {
        this.showNotification('Descargando press kit...', 'info');
        setTimeout(() => {
            this.showNotification('Press kit descargado exitosamente', 'success');
        }, 1500);
    }

    shareAbout() {
        if (navigator.share) {
            navigator.share({
                title: 'Acerca de RSC Chain',
                text: 'Conoce más sobre RSC Chain',
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showNotification('URL copiada al portapapeles', 'success');
            });
        }
    }

    printAbout() {
        window.print();
    }

    showNotification(message, type = 'info') {
        // Usar el sistema de notificaciones existente
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            // Fallback simple
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
                color: white;
                border-radius: 0.5rem;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.aboutManager = new AboutManager();
});

// Exportar para uso global
window.AboutManager = AboutManager; 