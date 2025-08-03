// ===== DOCS ENHANCED JAVASCRIPT =====

class DocsManager {
    constructor() {
        this.currentPage = 'whitepaper';
        this.searchIndex = [];
        this.searchResults = [];
        this.init();
    }

    init() {
            this.setupEventListeners();
        this.initializeSearch();
        this.setupNavigation();
        this.setupAPITester();
        this.setupQuickStart();
        this.setupFloatingNav();
        this.setupTOC();
        this.setupKeyboardShortcuts();
        this.loadPageContent();
    }

    setupEventListeners() {
        // Búsqueda
        const searchInput = document.getElementById('docsSearch');
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

        // Breadcrumb
        document.querySelectorAll('.breadcrumb-item a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href === '../index.html') {
                    window.location.href = href;
                }
            });
        });

        // Botones de acción
        this.setupActionButtons();
    }

    setupActionButtons() {
        // Descargar Whitepaper
        const downloadBtn = document.getElementById('downloadWhitepaper');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadWhitepaper());
        }

        // Ver Online
        const viewOnlineBtn = document.getElementById('viewOnline');
        if (viewOnlineBtn) {
            viewOnlineBtn.addEventListener('click', () => this.viewOnline());
        }

        // Probar API
        const testAPIBtn = document.getElementById('testAPI');
        if (testAPIBtn) {
            testAPIBtn.addEventListener('click', () => this.showAPITester());
        }

        // Descargar SDK
        const downloadSDKBtn = document.getElementById('downloadSDK');
        if (downloadSDKBtn) {
            downloadSDKBtn.addEventListener('click', () => this.downloadSDK());
        }

        // Botones de acción del sidebar
        const printBtn = document.getElementById('printDocs');
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printDocumentation());
        }

        const exportBtn = document.getElementById('exportDocs');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToPDF());
        }

        const shareBtn = document.getElementById('shareDocs');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareDocumentation());
        }
    }

    initializeSearch() {
        // Crear índice de búsqueda
        this.searchIndex = [
            {
                title: 'Whitepaper',
                content: 'Documento técnico completo de la blockchain RSC Chain',
                section: 'whitepaper',
                keywords: ['whitepaper', 'documento', 'técnico', 'blockchain', 'rsc']
            },
            {
                title: 'API Reference',
                content: 'Documentación completa de la API REST de RSC Chain',
                section: 'api',
                keywords: ['api', 'rest', 'endpoints', 'documentación', 'referencia']
            },
            {
                title: 'Quick Start',
                content: 'Comienza con RSC Chain en 5 minutos',
                section: 'quickstart',
                keywords: ['quick', 'start', 'comenzar', 'inicio', 'tutorial']
            },
            {
                title: 'Wallet Integration',
                content: 'Guía para integrar wallets con RSC Chain',
                section: 'wallet-guide',
                keywords: ['wallet', 'integración', 'cartera', 'conectar']
            },
            {
                title: 'Mining Setup',
                content: 'Configuración y optimización de minería',
                section: 'mining-guide',
                keywords: ['mining', 'minería', 'setup', 'configuración', 'optimización']
            },
            {
                title: 'Staking Guide',
                content: 'Guía completa de staking y delegación',
                section: 'staking-guide',
                keywords: ['staking', 'delegación', 'recompensas', 'validadores']
            },
            {
                title: 'Node Setup',
                content: 'Configurar y ejecutar un nodo RSC',
                section: 'nodes',
                keywords: ['node', 'nodo', 'configurar', 'ejecutar', 'servidor']
            },
            {
                title: 'Smart Contracts',
                content: 'Desarrollo de contratos inteligentes',
                section: 'smart-contracts',
                keywords: ['smart', 'contracts', 'contratos', 'inteligentes', 'solidity']
            },
            {
                title: 'dApp Development',
                content: 'Desarrollo de aplicaciones descentralizadas',
                section: 'dapps',
                keywords: ['dapp', 'aplicaciones', 'descentralizadas', 'desarrollo']
            },
            {
                title: 'Tokenomics',
                content: 'Economía y distribución del token RSC',
                section: 'tokenomics',
                keywords: ['tokenomics', 'economía', 'distribución', 'token', 'rsc']
            },
            {
                title: 'Analytics API',
                content: 'API para análisis y métricas de blockchain',
                section: 'analytics',
                keywords: ['analytics', 'métricas', 'análisis', 'estadísticas']
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
        const dropdown = document.getElementById('searchResults');
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
        const dropdown = document.getElementById('searchResults');
        if (dropdown) {
            dropdown.classList.add('active');
        }
    }

    hideSearchResults() {
        setTimeout(() => {
            const dropdown = document.getElementById('searchResults');
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
        document.querySelectorAll('.docs-page').forEach(page => {
            page.classList.remove('active');
        });

        // Mostrar página correspondiente
        const targetPage = document.getElementById(`${section}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = section;
            this.updateBreadcrumb(section);
            this.updatePageTitle(section);
        }

        // Scroll al inicio
        const contentWrapper = document.querySelector('.docs-content-wrapper');
        if (contentWrapper) {
            contentWrapper.scrollTop = 0;
        }
    }

    updateBreadcrumb(section) {
        const currentPageElement = document.getElementById('currentPage');
        if (currentPageElement) {
            const pageNames = {
                'whitepaper': 'Whitepaper',
                'api': 'API Reference',
                'quickstart': 'Quick Start',
                'wallet-guide': 'Wallet Integration',
                'mining-guide': 'Mining Setup',
                'staking-guide': 'Staking Guide',
                'nodes': 'Node Setup',
                'smart-contracts': 'Smart Contracts',
                'dapps': 'dApp Development',
                'tokenomics': 'Tokenomics',
                'analytics': 'Analytics API'
            };

            currentPageElement.innerHTML = `<span>${pageNames[section] || 'Documentación'}</span>`;
        }
    }

    updatePageTitle(section) {
        const pageNames = {
            'whitepaper': 'Whitepaper RSC Chain',
            'api': 'API Reference',
            'quickstart': 'Quick Start Guide',
            'wallet-guide': 'Wallet Integration',
            'mining-guide': 'Mining Setup',
            'staking-guide': 'Staking Guide',
            'nodes': 'Node Setup',
            'smart-contracts': 'Smart Contracts',
            'dapps': 'dApp Development',
            'tokenomics': 'Tokenomics',
            'analytics': 'Analytics API'
        };

        const title = pageNames[section] || 'Documentación';
        document.title = `${title} - ReeskCapital.co`;
    }

    setupNavigation() {
        // Navegación entre páginas
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateToPreviousPage());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateToNextPage());
        }
    }

    navigateToPreviousPage() {
        const sections = ['whitepaper', 'api', 'quickstart', 'wallet-guide', 'mining-guide', 'staking-guide'];
        const currentIndex = sections.indexOf(this.currentPage);
        const previousIndex = currentIndex > 0 ? currentIndex - 1 : sections.length - 1;
        this.navigateToSection(sections[previousIndex]);
    }

    navigateToNextPage() {
        const sections = ['whitepaper', 'api', 'quickstart', 'wallet-guide', 'mining-guide', 'staking-guide'];
        const currentIndex = sections.indexOf(this.currentPage);
        const nextIndex = currentIndex < sections.length - 1 ? currentIndex + 1 : 0;
        this.navigateToSection(sections[nextIndex]);
    }

    setupAPITester() {
        const endpointSelect = document.getElementById('endpointSelect');
        const sendRequestBtn = document.getElementById('sendRequest');
        const copyCurlBtn = document.getElementById('copyCurl');

        if (endpointSelect) {
            endpointSelect.addEventListener('change', (e) => this.updateAPITester(e.target.value));
        }

        if (sendRequestBtn) {
            sendRequestBtn.addEventListener('click', () => this.sendAPIRequest());
        }

        if (copyCurlBtn) {
            copyCurlBtn.addEventListener('click', () => this.copyCurlCommand());
        }

        // Tabs del request builder
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.getAttribute('data-tab');
                this.switchAPITab(tab);
            });
        });

        // Botones de probar endpoint
        document.querySelectorAll('.try-endpoint').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const endpoint = e.target.getAttribute('data-endpoint');
                this.tryEndpoint(endpoint);
            });
        });
    }

    updateAPITester(endpoint) {
        const endpointConfigs = {
            'wallet/create': {
                method: 'POST',
                path: '/api/wallet/create',
                description: 'Crear nueva wallet',
                params: [],
                body: '{}'
            },
            'wallet/balance': {
                method: 'GET',
                path: '/api/wallet/0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
                description: 'Obtener balance de una dirección',
                params: ['address'],
                body: null
            },
            'tx/send': {
                method: 'POST',
                path: '/api/tx/send',
                description: 'Enviar transacción',
                params: ['from', 'to', 'amount', 'privateKey'],
                body: '{\n  "from": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",\n  "to": "0x1234567890abcdef",\n  "amount": "100.0",\n  "private_key": "0x..."\n}'
            },
            'mining/start': {
                method: 'POST',
                path: '/api/mining/start',
                description: 'Iniciar sesión de minería',
                params: ['address'],
                body: '{\n  "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"\n}'
            },
            'blockchain/stats': {
                method: 'GET',
                path: '/api/blockchain/stats',
                description: 'Obtener estadísticas de la blockchain',
                params: [],
                body: null
            }
        };

        const config = endpointConfigs[endpoint];
        if (config) {
            this.updateRequestBuilder(config);
        }
    }

    updateRequestBuilder(config) {
        // Actualizar método y path
        const methodElement = document.querySelector('.endpoint-header .method');
        const pathElement = document.querySelector('.endpoint-header .path');
        
        if (methodElement) {
            methodElement.textContent = config.method;
            methodElement.className = `method ${config.method.toLowerCase()}`;
        }
        
        if (pathElement) {
            pathElement.textContent = config.path;
        }

        // Actualizar parámetros
        const paramsTab = document.getElementById('paramsTab');
        if (paramsTab && config.params.length > 0) {
            paramsTab.innerHTML = config.params.map(param => `
                <div class="param-input">
                    <label>${param}:</label>
                    <input type="text" placeholder="${param}" class="form-input">
                </div>
            `).join('');
        }

        // Actualizar body
        const bodyTab = document.querySelector('#bodyTab textarea');
        if (bodyTab && config.body) {
            bodyTab.value = config.body;
        }
    }

    switchAPITab(tabName) {
        // Ocultar todos los tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Activar tab seleccionado
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(`${tabName}Tab`);
        
        if (activeTab) activeTab.classList.add('active');
        if (activeContent) activeContent.classList.add('active');
    }

    async sendAPIRequest() {
        const endpointSelect = document.getElementById('endpointSelect');
        const endpoint = endpointSelect.value;
        
        // Simular request
        const responseViewer = document.querySelector('.response-viewer');
        const statusCode = responseViewer.querySelector('.status-code');
        const responseTime = responseViewer.querySelector('.response-time');
        const responseCode = responseViewer.querySelector('#responseCode');

        // Mostrar loading
        statusCode.textContent = 'Loading...';
        statusCode.className = 'status-code loading';
        responseTime.textContent = '...';

        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // Simular respuesta
        const responses = {
            'wallet/create': {
                status: '201 Created',
                time: '45ms',
                data: {
                    "success": true,
                    "data": {
                        "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
                        "privateKey": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
                    }
                }
            },
            'wallet/balance': {
                status: '200 OK',
                time: '32ms',
                data: {
                    "success": true,
                    "data": {
                        "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
                        "balance": 1250.75
                    }
                }
            },
            'tx/send': {
                status: '200 OK',
                time: '67ms',
                data: {
                    "success": true,
                    "data": {
                        "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
                        "status": "pending"
                    }
                }
            },
            'mining/start': {
                status: '200 OK',
                time: '89ms',
                data: {
                    "success": true,
                    "data": {
                        "sessionId": "mining_session_12345",
                        "status": "started",
                        "estimatedReward": 50.0
                    }
                }
            },
            'blockchain/stats': {
                status: '200 OK',
                time: '23ms',
                data: {
                    "success": true,
                    "data": {
                        "totalSupply": 1000000000,
                        "circulatingSupply": 650000000,
                        "totalTransactions": 15420,
                        "activeNodes": 47,
                        "currentTPS": 1250
                    }
                }
            }
        };

        const response = responses[endpoint] || {
            status: '404 Not Found',
            time: '12ms',
            data: { "error": "Endpoint not found" }
        };

        // Actualizar UI
        statusCode.textContent = response.status;
        statusCode.className = `status-code ${response.status.startsWith('2') ? 'success' : 'error'}`;
        responseTime.textContent = response.time;
        responseCode.textContent = JSON.stringify(response.data, null, 2);

        // Highlight syntax
        if (window.Prism) {
            Prism.highlightElement(responseCode);
        }
    }

    copyCurlCommand() {
        const endpointSelect = document.getElementById('endpointSelect');
        const endpoint = endpointSelect.value;
        
        const curlCommands = {
            'wallet/create': 'curl -X POST "https://rsc-chain-production.up.railway.app/api/wallet/create" \\\n  -H "Content-Type: application/json"',
            'wallet/balance': 'curl -X GET "https://rsc-chain-production.up.railway.app/api/wallet/0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"',
            'tx/send': 'curl -X POST "https://rsc-chain-production.up.railway.app/api/tx/send" \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "from": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",\n    "to": "0x1234567890abcdef",\n    "amount": "100.0",\n    "private_key": "0x..."\n  }\'',
            'mining/start': 'curl -X POST "https://rsc-chain-production.up.railway.app/api/mining/start" \\\n  -H "Content-Type: application/json" \\\n  -d \'{\n    "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"\n  }\'',
            'blockchain/stats': 'curl -X GET "https://rsc-chain-production.up.railway.app/api/blockchain/stats"'
        };

        const command = curlCommands[endpoint] || 'curl -X GET "https://rsc-chain-production.up.railway.app/api/status"';
        
        navigator.clipboard.writeText(command).then(() => {
            this.showNotification('Comando cURL copiado al portapapeles', 'success');
        });
    }

    tryEndpoint(endpoint) {
        // Actualizar selector y enviar request
        const endpointSelect = document.getElementById('endpointSelect');
        endpointSelect.value = endpoint;
        this.updateAPITester(endpoint);
        this.sendAPIRequest();
    }

    setupQuickStart() {
        const createWalletBtn = document.getElementById('createWalletDemo');
        if (createWalletBtn) {
            createWalletBtn.addEventListener('click', () => this.createWalletDemo());
        }

        // Navegación entre pasos
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            step.addEventListener('click', () => this.goToStep(index + 1));
        });
    }

    createWalletDemo() {
        const demoResult = document.getElementById('walletResult');
        if (!demoResult) return;

        // Simular creación de wallet
        demoResult.innerHTML = `
            <div class="demo-loading">Creando wallet...</div>
        `;
        demoResult.classList.add('active');

        setTimeout(() => {
            const walletAddress = '0x' + Math.random().toString(16).substr(2, 40);
            demoResult.innerHTML = `
                <div class="demo-success">
                    <h4>✅ Wallet creada exitosamente</h4>
                    <div class="wallet-info">
                        <div class="info-item">
                            <strong>Dirección:</strong>
                            <code>${walletAddress}</code>
                        </div>
                        <div class="info-item">
                            <strong>Balance inicial:</strong>
                            <span>0 RSC</span>
                </div>
                    </div>
                    <button class="btn-secondary" onclick="docsManager.copyToClipboard('${walletAddress}')">
                        Copiar dirección
                    </button>
            </div>
        `;
        }, 2000);
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Dirección copiada al portapapeles', 'success');
        });
    }

    goToStep(stepNumber) {
        // Actualizar progreso
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            if (index + 1 < stepNumber) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (index + 1 === stepNumber) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });

        // Mostrar contenido del paso
        document.querySelectorAll('.step-panel').forEach((panel, index) => {
            if (index + 1 === stepNumber) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
    }

    setupFloatingNav() {
        const backToTopBtn = document.getElementById('backToTop');
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', () => {
                const contentWrapper = document.querySelector('.docs-content-wrapper');
                if (contentWrapper) {
                    contentWrapper.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }
    }

    setupTOC() {
        const tocToggle = document.getElementById('tocToggle');
        const tocContent = document.getElementById('tocContent');
        
        if (tocToggle && tocContent) {
            tocToggle.addEventListener('click', () => {
                tocContent.classList.toggle('active');
                tocToggle.classList.toggle('active');
            });
        }

        // Navegación por TOC
        document.querySelectorAll('.toc-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const contentWrapper = document.querySelector('.docs-content-wrapper');
            if (contentWrapper) {
                const offset = section.offsetTop - 100;
                contentWrapper.scrollTo({ top: offset, behavior: 'smooth' });
            }
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + K para búsqueda
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('docsSearch');
                if (searchInput) {
                    searchInput.focus();
                }
            }

            // Flechas para navegación
            if (e.key === 'ArrowLeft' && e.altKey) {
                e.preventDefault();
                this.navigateToPreviousPage();
            }

            if (e.key === 'ArrowRight' && e.altKey) {
                e.preventDefault();
                this.navigateToNextPage();
            }

            // Escape para cerrar modales/búsqueda
            if (e.key === 'Escape') {
                this.hideSearchResults();
            }
        });
    }

    loadPageContent() {
        // Cargar contenido dinámico según la página actual
        this.updatePageContent(this.currentPage);
    }

    updatePageContent(section) {
        // Aquí se puede cargar contenido dinámico según la sección
        console.log(`Cargando contenido para: ${section}`);
    }

    // Funciones de utilidad
    downloadWhitepaper() {
        this.showNotification('Descargando whitepaper...', 'info');
        // Simular descarga
        setTimeout(() => {
            this.showNotification('Whitepaper descargado exitosamente', 'success');
        }, 2000);
    }

    viewOnline() {
        this.showNotification('Abriendo whitepaper en nueva pestaña...', 'info');
        // Aquí se abriría el whitepaper en una nueva pestaña
    }

    showAPITester() {
        // Mostrar el API tester si está oculto
        const apiTester = document.querySelector('.api-tester');
        if (apiTester) {
            apiTester.scrollIntoView({ behavior: 'smooth' });
        }
    }

    downloadSDK() {
        this.showNotification('Descargando SDK...', 'info');
        setTimeout(() => {
            this.showNotification('SDK descargado exitosamente', 'success');
        }, 1500);
    }

    printDocumentation() {
        window.print();
    }

    exportToPDF() {
        this.showNotification('Generando PDF...', 'info');
        setTimeout(() => {
            this.showNotification('PDF generado exitosamente', 'success');
        }, 3000);
    }

    shareDocumentation() {
        if (navigator.share) {
            navigator.share({
                title: 'Documentación RSC Chain',
                text: 'Revisa la documentación oficial de RSC Chain',
                url: window.location.href
            });
        } else {
            // Fallback: copiar URL
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showNotification('URL copiada al portapapeles', 'success');
            });
        }
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
    window.docsManager = new DocsManager();
});

// Exportar para uso global
window.DocsManager = DocsManager; 