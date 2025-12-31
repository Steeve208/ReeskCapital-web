/* ===== SISTEMA DE TRADUCCIÓN GLOBAL ===== */

class GlobalI18nManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('rsc_language') || 'en';
        this.translations = this.loadTranslations();
        this.init();
    }

    loadTranslations() {
        return {
            es: {
                // Navbar
                'nav.how.it.works': 'Cómo funciona',
                'nav.about.us': 'Acerca de',
                'nav.blog': 'Blog',
                'nav.contact': 'Contacto',
                'nav.first.round': 'First Round',
                'nav.my.account': 'Mi Cuenta',
                
                // Hero
                'hero.title.line1': 'INSTITUTIONAL-GRADE',
                'hero.title.line2': 'BLOCKCHAIN FOR FINANCE',
                'hero.subtitle': 'Infraestructura lista para empresas con seguridad resistente a la cuántica, cumplimiento regulatorio y confiabilidad de nivel institucional para el futuro de las finanzas descentralizadas.',
                'hero.meta': '99.99% Uptime • Quantum-Safe • Fully Audited',
                'hero.trusted.by': 'CONFIADO POR',
                'hero.institutions': 'INSTITUCIONES',
                'hero.trusted.description': 'Construido con estándares de seguridad empresarial, cumplimiento regulatorio e infraestructura de nivel institucional. RSC Chain ofrece la confiabilidad y transparencia requeridas para aplicaciones financieras.',
                
                // App Download
                'app.download.title': 'Descarga RSC Mining App',
                'app.download.subtitle': 'Minería en tiempo real desde tu dispositivo móvil Android',
                'app.download.apk': 'Descargar APK',
                'app.download.playstore': 'Play Store',
                
                // Technology
                'tech.title': 'Seguridad Alimentada por Quantum',
                'tech.subtitle': 'RSC Chain ofrece seguridad blockchain de próxima generación a través de tecnologías cuánticas avanzadas que garantizan protección completa contra amenazas actuales y futuras.',
                
                // Common
                'select.language': 'Seleccionar Idioma'
            },
            en: {
                // Navbar
                'nav.how.it.works': 'How it works',
                'nav.about.us': 'About Us',
                'nav.blog': 'Blog',
                'nav.contact': 'Contact',
                'nav.first.round': 'First Round',
                'nav.my.account': 'My Account',
                
                // Hero
                'hero.title.line1': 'INSTITUTIONAL-GRADE',
                'hero.title.line2': 'BLOCKCHAIN FOR FINANCE',
                'hero.subtitle': 'Enterprise-ready infrastructure with quantum-resistant security, regulatory compliance, and institutional-grade reliability for the future of decentralized finance.',
                'hero.meta': '99.99% Uptime • Quantum-Safe • Fully Audited',
                'hero.trusted.by': 'TRUSTED BY',
                'hero.institutions': 'INSTITUTIONS',
                'hero.trusted.description': 'Built with enterprise security standards, regulatory compliance, and institutional-grade infrastructure. RSC Chain delivers the reliability and transparency required for financial applications.',
                
                // App Download
                'app.download.title': 'Download RSC Mining App',
                'app.download.subtitle': 'Real-time mining from your Android mobile device',
                'app.download.apk': 'Download APK',
                'app.download.playstore': 'Play Store',
                
                // Technology
                'tech.title': 'Quantum-Powered Security',
                'tech.subtitle': 'RSC Chain delivers next-generation blockchain security through advanced quantum technologies that ensure complete protection against current and future threats.',
                
                // Common
                'select.language': 'Select Language'
            },
            pt: {
                // Navbar
                'nav.how.it.works': 'Como funciona',
                'nav.about.us': 'Sobre nós',
                'nav.blog': 'Blog',
                'nav.contact': 'Contato',
                'nav.first.round': 'First Round',
                'nav.my.account': 'Minha Conta',
                
                // Hero
                'hero.title.line1': 'INSTITUCIONAL',
                'hero.title.line2': 'BLOCKCHAIN PARA FINANÇAS',
                'hero.subtitle': 'Infraestrutura pronta para empresas com segurança resistente a quântica, conformidade regulatória e confiabilidade de nível institucional para o futuro das finanças descentralizadas.',
                'hero.meta': '99.99% Uptime • Quantum-Safe • Totalmente Auditado',
                'hero.trusted.by': 'CONFIADO POR',
                'hero.institutions': 'INSTITUIÇÕES',
                'hero.trusted.description': 'Construído com padrões de segurança empresarial, conformidade regulatória e infraestrutura de nível institucional. RSC Chain oferece a confiabilidade e transparência necessárias para aplicações financeiras.',
                
                // App Download
                'app.download.title': 'Baixar App RSC Mining',
                'app.download.subtitle': 'Mineração em tempo real do seu dispositivo móvel Android',
                'app.download.apk': 'Baixar APK',
                'app.download.playstore': 'Play Store',
                
                // Technology
                'tech.title': 'Segurança Alimentada por Quantum',
                'tech.subtitle': 'RSC Chain oferece segurança blockchain de próxima geração através de tecnologias quânticas avançadas que garantem proteção completa contra ameaças atuais e futuras.',
                
                // Common
                'select.language': 'Selecionar Idioma'
            },
            fr: {
                // Navbar
                'nav.how.it.works': 'Comment ça marche',
                'nav.about.us': 'À propos',
                'nav.blog': 'Blog',
                'nav.contact': 'Contact',
                'nav.first.round': 'First Round',
                'nav.my.account': 'Mon Compte',
                
                // Hero
                'hero.title.line1': 'BLOCKCHAIN',
                'hero.title.line2': 'INSTITUTIONNELLE POUR LA FINANCE',
                'hero.subtitle': 'Infrastructure prête pour les entreprises avec sécurité résistante aux quantiques, conformité réglementaire et fiabilité de niveau institutionnel pour l\'avenir de la finance décentralisée.',
                'hero.meta': '99.99% Uptime • Quantum-Safe • Entièrement Audité',
                'hero.trusted.by': 'CONFIÉ PAR',
                'hero.institutions': 'INSTITUTIONS',
                'hero.trusted.description': 'Construit avec des normes de sécurité d\'entreprise, conformité réglementaire et infrastructure de niveau institutionnel. RSC Chain offre la fiabilité et la transparence requises pour les applications financières.',
                
                // App Download
                'app.download.title': 'Télécharger l\'App RSC Mining',
                'app.download.subtitle': 'Mining en temps réel depuis votre appareil mobile Android',
                'app.download.apk': 'Télécharger APK',
                'app.download.playstore': 'Play Store',
                
                // Technology
                'tech.title': 'Sécurité Alimentée par Quantum',
                'tech.subtitle': 'RSC Chain offre une sécurité blockchain de nouvelle génération grâce à des technologies quantiques avancées qui garantissent une protection complète contre les menaces actuelles et futures.',
                
                // Common
                'select.language': 'Sélectionner la Langue'
            },
            de: {
                // Navbar
                'nav.how.it.works': 'Wie es funktioniert',
                'nav.about.us': 'Über uns',
                'nav.blog': 'Blog',
                'nav.contact': 'Kontakt',
                'nav.first.round': 'First Round',
                'nav.my.account': 'Mein Konto',
                
                // Hero
                'hero.title.line1': 'INSTITUTIONELLE',
                'hero.title.line2': 'BLOCKCHAIN FÜR FINANZEN',
                'hero.subtitle': 'Unternehmensbereite Infrastruktur mit quantenresistenter Sicherheit, regulatorischer Compliance und institutioneller Zuverlässigkeit für die Zukunft der dezentralisierten Finanzen.',
                'hero.meta': '99.99% Uptime • Quantum-Safe • Vollständig Auditiert',
                'hero.trusted.by': 'VERTRAUT VON',
                'hero.institutions': 'INSTITUTIONEN',
                'hero.trusted.description': 'Gebaut mit Unternehmenssicherheitsstandards, regulatorischer Compliance und institutioneller Infrastruktur. RSC Chain bietet die Zuverlässigkeit und Transparenz, die für Finanzanwendungen erforderlich sind.',
                
                // App Download
                'app.download.title': 'RSC Mining App Herunterladen',
                'app.download.subtitle': 'Echtzeit-Mining von Ihrem Android-Mobilgerät',
                'app.download.apk': 'APK Herunterladen',
                'app.download.playstore': 'Play Store',
                
                // Technology
                'tech.title': 'Quantenbetriebene Sicherheit',
                'tech.subtitle': 'RSC Chain bietet Sicherheit der nächsten Generation für Blockchain durch fortgeschrittene Quantentechnologien, die vollständigen Schutz vor aktuellen und zukünftigen Bedrohungen gewährleisten.',
                
                // Common
                'select.language': 'Sprache Auswählen'
            },
            it: {
                // Navbar
                'nav.how.it.works': 'Come funziona',
                'nav.about.us': 'Chi siamo',
                'nav.blog': 'Blog',
                'nav.contact': 'Contatto',
                'nav.first.round': 'First Round',
                'nav.my.account': 'Il Mio Account',
                
                // Hero
                'hero.title.line1': 'BLOCKCHAIN',
                'hero.title.line2': 'ISTITUZIONALE PER LA FINANZA',
                'hero.subtitle': 'Infrastruttura pronta per le aziende con sicurezza resistente ai quanti, conformità normativa e affidabilità di livello istituzionale per il futuro della finanza decentralizzata.',
                'hero.meta': '99.99% Uptime • Quantum-Safe • Completamente Verificato',
                'hero.trusted.by': 'FIDATO DA',
                'hero.institutions': 'ISTITUZIONI',
                'hero.trusted.description': 'Costruito con standard di sicurezza aziendale, conformità normativa e infrastruttura di livello istituzionale. RSC Chain offre l\'affidabilità e la trasparenza richieste per le applicazioni finanziarie.',
                
                // App Download
                'app.download.title': 'Scarica App RSC Mining',
                'app.download.subtitle': 'Mining in tempo reale dal tuo dispositivo mobile Android',
                'app.download.apk': 'Scarica APK',
                'app.download.playstore': 'Play Store',
                
                // Technology
                'tech.title': 'Sicurezza Alimentata da Quantum',
                'tech.subtitle': 'RSC Chain offre sicurezza blockchain di prossima generazione attraverso tecnologie quantistiche avanzate che garantiscono protezione completa contro minacce attuali e future.',
                
                // Common
                'select.language': 'Seleziona Lingua'
            },
            zh: {
                // Navbar
                'nav.how.it.works': '工作原理',
                'nav.about.us': '关于我们',
                'nav.blog': '博客',
                'nav.contact': '联系',
                'nav.first.round': 'First Round',
                'nav.my.account': '我的账户',
                
                // Hero
                'hero.title.line1': '机构级',
                'hero.title.line2': '金融区块链',
                'hero.subtitle': '企业就绪的基础设施，具有抗量子安全性、监管合规性和机构级可靠性，面向去中心化金融的未来。',
                'hero.meta': '99.99% 正常运行时间 • 量子安全 • 完全审计',
                'hero.trusted.by': '受信任于',
                'hero.institutions': '机构',
                'hero.trusted.description': '采用企业安全标准、监管合规性和机构级基础设施构建。RSC Chain 提供金融应用所需的可靠性和透明度。',
                
                // App Download
                'app.download.title': '下载 RSC Mining App',
                'app.download.subtitle': '从您的 Android 移动设备进行实时挖矿',
                'app.download.apk': '下载 APK',
                'app.download.playstore': 'Play Store',
                
                // Technology
                'tech.title': '量子驱动安全',
                'tech.subtitle': 'RSC Chain 通过先进的量子技术提供下一代区块链安全，确保完全保护免受当前和未来威胁。',
                
                // Common
                'select.language': '选择语言'
            },
            ja: {
                // Navbar
                'nav.how.it.works': '仕組み',
                'nav.about.us': '私たちについて',
                'nav.blog': 'ブログ',
                'nav.contact': 'お問い合わせ',
                'nav.first.round': 'First Round',
                'nav.my.account': 'マイアカウント',
                
                // Hero
                'hero.title.line1': '機関級',
                'hero.title.line2': '金融ブロックチェーン',
                'hero.subtitle': '量子耐性セキュリティ、規制遵守、機関級の信頼性を備えた企業対応インフラストラクチャで、分散型金融の未来を支えます。',
                'hero.meta': '99.99% 稼働時間 • 量子安全 • 完全監査済み',
                'hero.trusted.by': '信頼されている',
                'hero.institutions': '機関',
                'hero.trusted.description': '企業セキュリティ標準、規制遵守、機関級インフラストラクチャで構築。RSC Chain は金融アプリケーションに必要な信頼性と透明性を提供します。',
                
                // App Download
                'app.download.title': 'RSC Mining App をダウンロード',
                'app.download.subtitle': 'Android モバイルデバイスからリアルタイムマイニング',
                'app.download.apk': 'APK をダウンロード',
                'app.download.playstore': 'Play Store',
                
                // Technology
                'tech.title': '量子駆動セキュリティ',
                'tech.subtitle': 'RSC Chain は、先進的な量子技術を通じて次世代ブロックチェーンセキュリティを提供し、現在および将来の脅威に対する完全な保護を確保します。',
                
                // Common
                'select.language': '言語を選択'
            },
            ru: {
                // Navbar
                'nav.how.it.works': 'Как это работает',
                'nav.about.us': 'О нас',
                'nav.blog': 'Блог',
                'nav.contact': 'Контакты',
                'nav.first.round': 'First Round',
                'nav.my.account': 'Мой аккаунт',
                
                // Hero
                'hero.title.line1': 'ИНСТИТУЦИОНАЛЬНЫЙ',
                'hero.title.line2': 'БЛОКЧЕЙН ДЛЯ ФИНАНСОВ',
                'hero.subtitle': 'Инфраструктура, готовая для предприятий, с квантово-устойчивой безопасностью, нормативным соответствием и институциональной надежностью для будущего децентрализованных финансов.',
                'hero.meta': '99.99% Время работы • Квантово-безопасный • Полностью проверен',
                'hero.trusted.by': 'ДОВЕРЯЮТ',
                'hero.institutions': 'ИНСТИТУТЫ',
                'hero.trusted.description': 'Построен с корпоративными стандартами безопасности, нормативным соответствием и институциональной инфраструктурой. RSC Chain обеспечивает надежность и прозрачность, необходимые для финансовых приложений.',
                
                // App Download
                'app.download.title': 'Скачать RSC Mining App',
                'app.download.subtitle': 'Майнинг в реальном времени с вашего Android-устройства',
                'app.download.apk': 'Скачать APK',
                'app.download.playstore': 'Play Store',
                
                // Technology
                'tech.title': 'Квантовая Безопасность',
                'tech.subtitle': 'RSC Chain обеспечивает безопасность блокчейна следующего поколения через передовые квантовые технологии, гарантирующие полную защиту от текущих и будущих угроз.',
                
                // Common
                'select.language': 'Выбрать Язык'
            },
            ar: {
                // Navbar
                'nav.how.it.works': 'كيف يعمل',
                'nav.about.us': 'من نحن',
                'nav.blog': 'المدونة',
                'nav.contact': 'اتصل',
                'nav.first.round': 'First Round',
                'nav.my.account': 'حسابي',
                
                // Hero
                'hero.title.line1': 'بلوك تشين',
                'hero.title.line2': 'مؤسسي للتمويل',
                'hero.subtitle': 'بنية تحتية جاهزة للمؤسسات مع أمان مقاوم للكم، والامتثال التنظيمي، والموثوقية على المستوى المؤسسي لمستقبل التمويل اللامركزي.',
                'hero.meta': '99.99% وقت التشغيل • آمن كميًا • مدقق بالكامل',
                'hero.trusted.by': 'موثوق به من قبل',
                'hero.institutions': 'المؤسسات',
                'hero.trusted.description': 'مبني بمعايير أمان المؤسسات والامتثال التنظيمي والبنية التحتية على المستوى المؤسسي. يوفر RSC Chain الموثوقية والشفافية المطلوبة للتطبيقات المالية.',
                
                // App Download
                'app.download.title': 'تحميل تطبيق RSC Mining',
                'app.download.subtitle': 'التعدين في الوقت الفعلي من جهازك المحمول Android',
                'app.download.apk': 'تحميل APK',
                'app.download.playstore': 'Play Store',
                
                // Technology
                'tech.title': 'الأمان المدعوم بالكم',
                'tech.subtitle': 'يوفر RSC Chain أمان بلوك تشين من الجيل التالي من خلال تقنيات الكم المتقدمة التي تضمن الحماية الكاملة ضد التهديدات الحالية والمستقبلية.',
                
                // Common
                'select.language': 'اختر اللغة'
            }
        };
    }

    init() {
        this.setupLanguageSelector();
        this.translatePage();
        this.updateActiveLanguage();
    }

    setupLanguageSelector() {
        const btn = document.getElementById('languageSelectorBtn');
        const dropdown = document.getElementById('languageDropdown');
        const overlay = document.createElement('div');
        overlay.className = 'language-dropdown-overlay';
        document.body.appendChild(overlay);

        if (btn && dropdown) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
                overlay.classList.toggle('active');
            });

            overlay.addEventListener('click', () => {
                dropdown.classList.remove('show');
                overlay.classList.remove('active');
            });

            // Cerrar al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.remove('show');
                    overlay.classList.remove('active');
                }
            });

            // Manejar selección de idioma
            const options = dropdown.querySelectorAll('.language-option');
            options.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const lang = option.dataset.lang;
                    this.changeLanguage(lang);
                    dropdown.classList.remove('show');
                    overlay.classList.remove('active');
                });
            });
        }
        
        // Manejar selección de idioma en menú móvil
        const mobileOptions = document.querySelectorAll('.language-option.mobile');
        mobileOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const lang = option.dataset.lang;
                this.changeLanguage(lang);
            });
        });
    }

    changeLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('rsc_language', lang);
            document.documentElement.lang = lang;
            this.translatePage();
            this.updateActiveLanguage();
        }
    }

    updateActiveLanguage() {
        const options = document.querySelectorAll('.language-option');
        options.forEach(option => {
            if (option.dataset.lang === this.currentLanguage) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
        
        // Actualizar también en menú móvil
        const mobileOptions = document.querySelectorAll('.language-option.mobile');
        mobileOptions.forEach(option => {
            if (option.dataset.lang === this.currentLanguage) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    translatePage() {
        // Traducir elementos con data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            if (translation) {
                if (element.tagName === 'INPUT' && element.type === 'text') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Traducir elementos específicos
        this.translateNavbar();
        this.translateHero();
        this.translateAppDownload();
        this.translateTechnology();
    }

    translateNavbar() {
        const navLinks = {
            'nav.how.it.works': 'a[href="#home"]',
            'nav.about.us': 'a[href="pages/about.html"]',
            'nav.blog': 'a[href="pages/docs.html"]',
            'nav.contact': 'a[href="https://t.me/RSCchain"]'
        };

        Object.entries(navLinks).forEach(([key, selector]) => {
            const element = document.querySelector(`.neurosearch-nav-left ${selector}`);
            if (element) {
                element.textContent = this.getTranslation(key);
            }
        });

        const accountLinks = {
            'nav.first.round': 'a[href="pages/coming-soon.html"]:first-of-type',
            'nav.my.account': 'a[href="pages/coming-soon.html"]:last-of-type'
        };

        Object.entries(accountLinks).forEach(([key, selector]) => {
            const element = document.querySelector(`.neurosearch-nav-right ${selector}`);
            if (element) {
                element.textContent = this.getTranslation(key);
            }
        });
    }

    translateHero() {
        const titleLeft = document.querySelector('.neurosearch-hero-title-left h1');
        if (titleLeft) {
            const spans = titleLeft.querySelectorAll('span');
            if (spans.length >= 2) {
                spans[0].textContent = this.getTranslation('hero.title.line1');
                spans[1].textContent = this.getTranslation('hero.title.line2');
            }
        }

        const subtitle = document.querySelector('.hero-subtitle');
        if (subtitle) {
            subtitle.textContent = this.getTranslation('hero.subtitle');
        }

        const meta = document.querySelector('.neurosearch-hero-meta span');
        if (meta) {
            meta.textContent = this.getTranslation('hero.meta');
        }

        const trustedBy = document.querySelector('#hero-trusted-by, .neurosearch-hero-right h2');
        if (trustedBy) {
            trustedBy.innerHTML = `${this.getTranslation('hero.trusted.by')}<br>${this.getTranslation('hero.institutions')}`;
        }

        const trustedDesc = document.querySelector('.neurosearch-hero-right p');
        if (trustedDesc) {
            trustedDesc.textContent = this.getTranslation('hero.trusted.description');
        }
    }

    translateAppDownload() {
        const title = document.querySelector('.app-download-cta-text h2');
        if (title) {
            title.textContent = this.getTranslation('app.download.title');
        }

        const subtitle = document.querySelector('.app-download-cta-text p');
        if (subtitle) {
            subtitle.textContent = this.getTranslation('app.download.subtitle');
        }

        const apkBtn = document.querySelector('.app-download-btn-primary span');
        if (apkBtn) {
            apkBtn.textContent = this.getTranslation('app.download.apk');
        }

        const playBtn = document.querySelector('.app-download-btn-secondary span');
        if (playBtn) {
            playBtn.textContent = this.getTranslation('app.download.playstore');
        }
    }

    translateTechnology() {
        const title = document.querySelector('.neurosearch-technology-title');
        if (title) {
            title.textContent = this.getTranslation('tech.title');
        }

        const subtitle = document.querySelector('.neurosearch-technology-subtitle');
        if (subtitle) {
            subtitle.textContent = this.getTranslation('tech.subtitle');
        }
    }

    getTranslation(key) {
        return this.translations[this.currentLanguage]?.[key] || key;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.globalI18n = new GlobalI18nManager();
});

