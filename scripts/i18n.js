/* ===== INTERNATIONALIZATION SYSTEM ===== */

class I18nManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {
            en: {
                // Navigation
                'nav.home': 'Home',
                'nav.about': 'About',
                'nav.wallet': 'Wallet',
                'nav.mine': 'Mine',
                'nav.p2p': 'P2P',
                'nav.staking': 'Staking',
                'nav.explorer': 'Explorer',
                'nav.bank': 'Bank',
                'nav.docs': 'Docs',
                'nav.login': 'Login',
                
                // Hero Section
                'hero.network.active': 'NETWORK ACTIVE',
                'hero.nodes': 'Nodes',
                'hero.secure': 'Secure',
                'hero.title.subtitle.line1': 'THE WORLD\'S MOST',
                'hero.title.subtitle.line2': 'ADVANCED AND REBELLIOUS',
                'hero.title.subtitle.line3': 'BLOCKCHAIN',
                'hero.description.no.banks': 'No banks.',
                'hero.description.no.borders': 'No borders.',
                'hero.description.no.permission': 'No permission.',
                'hero.subtitle': 'The financial revolution that will change the world forever.',
                'hero.cta.create.wallet': 'CREATE WALLET',
                'hero.cta.full.access': 'Full Access',
                'hero.cta.start.mining': 'START MINING',
                'hero.cta.earn.rsc': 'Earn RSC',
                'hero.cta.p2p.trade': 'P2P TRADE',
                'hero.cta.no.intermediaries': 'No Intermediaries',
                'hero.features.decentralized': '100% Decentralized',
                'hero.features.no.control': 'No central control',
                
                // Common
                'language': 'Language',
                'theme': 'Theme',
                'dark': 'Dark',
                'connect': 'Connect',
                'connect.wallet': 'Connect Wallet',
                'open.menu': 'Open menu',
                'change.theme': 'Change theme',
                
                // Mobile
                'mobile.navigation': 'Navigation',
                'mobile.controls': 'Controls'
            },
            es: {
                // Navigation
                'nav.home': 'Inicio',
                'nav.about': 'Acerca',
                'nav.wallet': 'Wallet',
                'nav.mine': 'Minar',
                'nav.p2p': 'P2P',
                'nav.staking': 'Staking',
                'nav.explorer': 'Explorer',
                'nav.bank': 'Bank',
                'nav.docs': 'Docs',
                'nav.login': 'Login',
                
                // Hero Section
                'hero.network.active': 'RED ACTIVA',
                'hero.nodes': 'Nodos',
                'hero.secure': 'Seguro',
                'hero.title.subtitle.line1': 'LA BLOCKCHAIN MÁS',
                'hero.title.subtitle.line2': 'AVANZADA Y REBELDE',
                'hero.title.subtitle.line3': 'DEL MUNDO',
                'hero.description.no.banks': 'Sin bancos.',
                'hero.description.no.borders': 'Sin fronteras.',
                'hero.description.no.permission': 'Sin permiso.',
                'hero.subtitle': 'La revolución financiera que cambiará el mundo para siempre.',
                'hero.cta.create.wallet': 'CREAR WALLET',
                'hero.cta.full.access': 'Acceso Total',
                'hero.cta.start.mining': 'INICIAR MINERÍA',
                'hero.cta.earn.rsc': 'Gana RSC',
                'hero.cta.p2p.trade': 'COMERCIAR P2P',
                'hero.cta.no.intermediaries': 'Sin Intermediarios',
                'hero.features.decentralized': '100% Descentralizado',
                'hero.features.no.control': 'Sin control central',
                
                // Common
                'language': 'Idioma',
                'theme': 'Tema',
                'dark': 'Oscuro',
                'connect': 'Conectar',
                'connect.wallet': 'Conectar Wallet',
                'open.menu': 'Abrir menú',
                'change.theme': 'Cambiar tema',
                
                // Mobile
                'mobile.navigation': 'Navegación',
                'mobile.controls': 'Controles'
            }
        };
        
        this.init();
    }
    
    init() {
        // Load saved language preference
        const savedLang = localStorage.getItem('rsc-language');
        if (savedLang && this.translations[savedLang]) {
            this.currentLanguage = savedLang;
        }
        
        this.updateLanguageDisplay();
        this.setupEventListeners();
        this.translatePage();
    }
    
    setupEventListeners() {
        // Language toggle button
        const langToggle = document.getElementById('languageToggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => this.toggleLanguage());
        }
        
        // Language selector dropdown
        const langSelector = document.getElementById('languageSelector');
        if (langSelector) {
            langSelector.addEventListener('click', () => this.toggleLanguageDropdown());
        }
        
        // Language options - Use event delegation for better performance
        document.addEventListener('click', (e) => {
            if (e.target.matches('.language-option, .mobile-language-option')) {
                const lang = e.target.dataset.lang;
                this.changeLanguage(lang);
            }
        });
    }
    
    toggleLanguage() {
        const newLang = this.currentLanguage === 'en' ? 'es' : 'en';
        this.changeLanguage(newLang);
    }
    
    changeLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('rsc-language', lang);
            this.updateLanguageDisplay();
            this.translatePage();
            
            // Update HTML lang attribute
            document.documentElement.lang = lang;
        }
    }
    
    updateLanguageDisplay() {
        // Update language toggle button
        const langToggle = document.getElementById('languageToggle');
        if (langToggle) {
            const langText = langToggle.querySelector('.lang-text');
            if (langText) {
                langText.textContent = this.currentLanguage.toUpperCase();
            }
        }
        
        // Update language selector
        const langSelector = document.getElementById('languageSelector');
        if (langSelector) {
            const langSpan = langSelector.querySelector('span');
            if (langSpan) {
                langSpan.textContent = this.currentLanguage.toUpperCase();
            }
        }
        
        // Update mobile language selector
        const mobileLangSelector = document.querySelector('.mobile-language-selector span');
        if (mobileLangSelector) {
            mobileLangSelector.textContent = this.currentLanguage.toUpperCase();
        }
    }
    
    translatePage() {
        // Use more efficient selectors and batch updates
        requestAnimationFrame(() => {
            // Translate all elements with data-i18n attribute
            const elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(element => {
                const key = element.dataset.i18n;
                const translation = this.getTranslation(key);
                if (translation) {
                    element.textContent = translation;
                }
            });
            
            // Update specific elements
            this.updateNavigation();
            this.updateHeroSection();
        });
    }
    
    updateNavigation() {
        // Batch navigation updates for better performance
        const navLinks = document.querySelectorAll('.navbar-links a');
        const mobileNavTitles = document.querySelectorAll('.mobile-nav-title');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const navText = link.querySelector('.nav-text');
            
            if (navText) {
                if (href === 'index.html') {
                    navText.textContent = this.getTranslation('nav.home');
                } else if (href === 'pages/about.html') {
                    navText.textContent = this.getTranslation('nav.about');
                } else if (href === 'pages/wallet.html') {
                    navText.textContent = this.getTranslation('nav.wallet');
                } else if (href === 'pages/mine.html') {
                    navText.textContent = this.getTranslation('nav.mine');
                } else if (href === 'pages/p2p.html') {
                    navText.textContent = this.getTranslation('nav.p2p');
                } else if (href === 'pages/staking.html') {
                    navText.textContent = this.getTranslation('nav.staking');
                } else if (href === 'pages/explorer.html') {
                    navText.textContent = this.getTranslation('nav.explorer');
                } else if (href === 'pages/bank.html') {
                    navText.textContent = this.getTranslation('nav.bank');
                } else if (href === 'pages/docs.html') {
                    navText.textContent = this.getTranslation('nav.docs');
                } else if (href === 'pages/login.html') {
                    navText.textContent = this.getTranslation('nav.login');
                }
            }
        });
        
        mobileNavTitles.forEach(title => {
            if (title.textContent.includes('Navigation')) {
                title.textContent = this.getTranslation('mobile.navigation');
            } else if (title.textContent.includes('Controls')) {
                title.textContent = this.getTranslation('mobile.controls');
            }
        });
    }
    
    updateHeroSection() {
        // Batch hero section updates
        const statusText = document.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = this.getTranslation('hero.network.active');
        }
        
        const subtitleLines = document.querySelectorAll('.subtitle-line');
        if (subtitleLines.length >= 3) {
            subtitleLines[0].textContent = this.getTranslation('hero.title.subtitle.line1');
            subtitleLines[1].textContent = this.getTranslation('hero.title.subtitle.line2');
            subtitleLines[2].textContent = this.getTranslation('hero.title.subtitle.line3');
        }
        
        const highlightWords = document.querySelectorAll('.highlight-word');
        if (highlightWords.length >= 3) {
            highlightWords[0].textContent = this.getTranslation('hero.description.no.banks');
            highlightWords[1].textContent = this.getTranslation('hero.description.no.borders');
            highlightWords[2].textContent = this.getTranslation('hero.description.no.permission');
        }
        
        const epicSubtitle = document.querySelector('.epic-subtitle');
        if (epicSubtitle) {
            const textSpan = epicSubtitle.querySelector('span:not(.typing-cursor)');
            if (textSpan) {
                textSpan.textContent = this.getTranslation('hero.subtitle');
            }
        }
        
        // Batch CTA button updates
        const ctaButtons = document.querySelectorAll('.btn-main');
        ctaButtons.forEach(button => {
            const text = button.textContent;
            if (text.includes('CREATE WALLET') || text.includes('CREAR WALLET')) {
                button.textContent = this.getTranslation('hero.cta.create.wallet');
            } else if (text.includes('START MINING') || text.includes('INICIAR MINERÍA')) {
                button.textContent = this.getTranslation('hero.cta.start.mining');
            } else if (text.includes('P2P TRADE') || text.includes('COMERCIAR P2P')) {
                button.textContent = this.getTranslation('hero.cta.p2p.trade');
            }
        });
        
        const ctaSubs = document.querySelectorAll('.btn-sub');
        ctaSubs.forEach(sub => {
            const text = sub.textContent;
            if (text.includes('Full Access') || text.includes('Acceso Total')) {
                sub.textContent = this.getTranslation('hero.cta.full.access');
            } else if (text.includes('Earn RSC') || text.includes('Gana RSC')) {
                sub.textContent = this.getTranslation('hero.cta.earn.rsc');
            } else if (text.includes('No Intermediaries') || text.includes('Sin Intermediarios')) {
                sub.textContent = this.getTranslation('hero.cta.no.intermediaries');
            }
        });
        
        // Batch feature updates
        const featureTitles = document.querySelectorAll('.feature-title');
        featureTitles.forEach(title => {
            if (title.textContent.includes('100% Decentralized') || title.textContent.includes('100% Descentralizado')) {
                title.textContent = this.getTranslation('hero.features.decentralized');
            }
        });
        
        const featureDescs = document.querySelectorAll('.feature-desc');
        featureDescs.forEach(desc => {
            if (desc.textContent.includes('No central control') || desc.textContent.includes('Sin control central')) {
                desc.textContent = this.getTranslation('hero.features.no.control');
            }
        });
    }
    
    getTranslation(key) {
        return this.translations[this.currentLanguage][key] || key;
    }
    
    toggleLanguageDropdown() {
        const dropdown = document.querySelector('.language-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }
}

// Initialize i18n when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.i18nManager = new I18nManager();
});

// Export for use in other modules
window.I18nManager = I18nManager;
