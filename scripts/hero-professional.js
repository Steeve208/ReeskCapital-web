/* ================================
   HERO PROFESIONAL - RSC CHAIN
   JavaScript optimizado para rendimiento
================================ */

class ProfessionalHeroManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeStats();
        this.setupAnimations();
    }
    
    setupEventListeners() {
        // Event listeners para botones
        const primaryBtn = document.querySelector('.btn-primary');
        const secondaryBtns = document.querySelectorAll('.btn-secondary, .btn-tertiary');
        
        if (primaryBtn) {
            primaryBtn.addEventListener('click', (e) => this.handleButtonClick(e, 'primary'));
        }
        
        secondaryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleButtonClick(e, 'secondary'));
        });
        
        // Event listeners para tarjetas de características
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', () => this.animateFeatureCard(card, 'enter'));
            card.addEventListener('mouseleave', () => this.animateFeatureCard(card, 'leave'));
        });
        
        // Event listeners para tarjetas de estadísticas
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.addEventListener('mouseenter', () => this.animateStatCard(card, 'enter'));
            card.addEventListener('mouseleave', () => this.animateStatCard(card, 'leave'));
        });
    }
    
    handleButtonClick(event, buttonType) {
        // Agregar efecto de click
        const button = event.currentTarget;
        button.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
        
        // Log del click para analytics
        console.log(`Button clicked: ${buttonType} - ${button.querySelector('.btn-title').textContent}`);
    }
    
    animateFeatureCard(card, action) {
        const icon = card.querySelector('.feature-icon');
        const title = card.querySelector('.feature-title');
        
        if (action === 'enter') {
            icon.style.transform = 'scale(1.1) rotate(5deg)';
            title.style.color = '#00ff88';
        } else {
            icon.style.transform = 'scale(1) rotate(0deg)';
            title.style.color = '#fff';
        }
    }
    
    animateStatCard(card, action) {
        const value = card.querySelector('.stat-value');
        const icon = card.querySelector('.stat-icon');
        
        if (action === 'enter') {
            value.style.transform = 'scale(1.1)';
            icon.style.transform = 'scale(1.2)';
        } else {
            value.style.transform = 'scale(1)';
            icon.style.transform = 'scale(1)';
        }
    }
    
    initializeStats() {
        // Inicializar estadísticas con valores por defecto
        this.updateStat('priceCard', '$0', '+0%', 'positive');
        this.updateStat('circulationCard', '0', 'Total Supply');
        this.updateStat('tpsCard', '0', 'Transactions Per Second');
        this.updateStat('nodesCard', '0', 'Active Nodes');
        
        // Simular actualizaciones en tiempo real (opcional)
        this.startStatsSimulation();
    }
    
    updateStat(cardId, value, changeOrDesc, type = null) {
        const card = document.getElementById(cardId);
        if (!card) return;
        
        const valueElement = card.querySelector('.stat-value');
        const changeElement = card.querySelector('.stat-change');
        const descElement = card.querySelector('.stat-desc');
        
        if (valueElement) {
            valueElement.textContent = value;
        }
        
        if (changeElement && type) {
            changeElement.textContent = changeOrDesc;
            changeElement.className = `stat-change ${type}`;
        }
        
        if (descElement && !type) {
            descElement.textContent = changeOrDesc;
        }
    }
    
    startStatsSimulation() {
        // Simulación de estadísticas en tiempo real (para demo)
        let price = 0.00;
        let tps = 0;
        let nodes = 0;
        
        setInterval(() => {
            // Simular fluctuación de precio
            price += (Math.random() - 0.5) * 0.01;
            price = Math.max(0, price);
            const priceChange = price > 0 ? `+${(price * 100).toFixed(2)}%` : '0%';
            const priceType = price > 0 ? 'positive' : 'neutral';
            
            this.updateStat('priceCard', `$${price.toFixed(4)}`, priceChange, priceType);
            
            // Simular TPS
            tps = Math.floor(Math.random() * 1000) + 100;
            this.updateStat('tpsCard', tps.toLocaleString(), 'Transactions Per Second');
            
            // Simular nodos activos
            nodes = Math.floor(Math.random() * 100) + 50;
            this.updateStat('nodesCard', nodes.toLocaleString(), 'Active Nodes');
            
        }, 5000); // Actualizar cada 5 segundos
    }
    
    setupAnimations() {
        // Configurar animaciones de entrada
        this.setupEntranceAnimations();
        
        // Configurar animaciones de scroll
        this.setupScrollAnimations();
    }
    
    setupEntranceAnimations() {
        // Animación de entrada para el título
        const title = document.querySelector('.hero-main-title');
        if (title) {
            title.style.opacity = '0';
            title.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                title.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
                title.style.opacity = '1';
                title.style.transform = 'translateY(0)';
            }, 300);
        }
        
        // Animación de entrada para la descripción
        const description = document.querySelector('.hero-description');
        if (description) {
            description.style.opacity = '0';
            description.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                description.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
                description.style.opacity = '1';
                description.style.transform = 'translateY(0)';
            }, 600);
        }
        
        // Animación de entrada para los botones
        const actions = document.querySelector('.hero-actions');
        if (actions) {
            actions.style.opacity = '0';
            actions.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                actions.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
                actions.style.opacity = '1';
                actions.style.transform = 'translateY(0)';
            }, 900);
        }
    }
    
    setupScrollAnimations() {
        // Configurar animaciones basadas en scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observar elementos para animaciones
        const animatedElements = document.querySelectorAll('.feature-card, .stat-card');
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }
    
    // Método para actualizar estadísticas desde datos externos
    updateStatsFromAPI(data) {
        if (data.price) {
            this.updateStat('priceCard', `$${data.price}`, data.priceChange, data.priceChangeType);
        }
        
        if (data.circulation) {
            this.updateStat('circulationCard', data.circulation.toLocaleString(), 'Total Supply');
        }
        
        if (data.tps) {
            this.updateStat('tpsCard', data.tps.toLocaleString(), 'Transactions Per Second');
        }
        
        if (data.nodes) {
            this.updateStat('nodesCard', data.nodes.toLocaleString(), 'Active Nodes');
        }
    }
    
    // Método para mostrar notificaciones
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `hero-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.heroManager = new ProfessionalHeroManager();
    
    // Exponer métodos para uso externo
    window.updateHeroStats = (data) => {
        if (window.heroManager) {
            window.heroManager.updateStatsFromAPI(data);
        }
    };
    
    window.showHeroNotification = (message, type) => {
        if (window.heroManager) {
            window.heroManager.showNotification(message, type);
        }
    };
});

// Exportar para uso en otros módulos
window.ProfessionalHeroManager = ProfessionalHeroManager;
