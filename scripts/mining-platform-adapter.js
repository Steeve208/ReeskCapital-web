// ===== MINING PLATFORM ADAPTER =====
// Adapta el nuevo frontend con los scripts existentes de Supabase

(function() {
    'use strict';
    
    console.log('🔌 Mining Platform Adapter iniciando...');
    
    // Esperar a que Supabase Integration esté listo
    function waitForSupabase() {
        return new Promise((resolve) => {
            if (window.supabaseIntegration) {
                resolve(window.supabaseIntegration);
            } else {
                const checkInterval = setInterval(() => {
                    if (window.supabaseIntegration) {
                        clearInterval(checkInterval);
                        resolve(window.supabaseIntegration);
                    }
                }, 100);
            }
        });
    }
    
    // Inicializar cuando esté listo
    waitForSupabase().then((supabase) => {
        console.log('✅ Supabase Integration detectado');
        initializeMiningPlatform(supabase);
    });
    
    function initializeMiningPlatform(supabase) {
        // Referencias a elementos del DOM
        const elements = {
            // Botones de control
            startMiningBtn: document.getElementById('startMiningBtn'),
            stopMiningBtn: document.getElementById('stopMiningBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            
            // Stats
            currentHashrate: document.getElementById('currentHashrate'),
            miningBalance: document.getElementById('miningBalance'),
            totalShares: document.getElementById('totalShares'),
            miningStatus: document.getElementById('miningStatus'),
            miningDuration: document.getElementById('miningDuration'),
            miningStatusBadge: document.getElementById('miningStatusBadge'),
            
            // Métricas
            avgHashrate: document.getElementById('avgHashrate'),
            cpuUsage: document.getElementById('cpuUsage'),
            cpuBar: document.getElementById('cpuBar'),
            memoryUsage: document.getElementById('memoryUsage'),
            memoryBar: document.getElementById('memoryBar'),
            temperature: document.getElementById('temperature'),
            
            // Ganancias
            periodEarnings: document.getElementById('periodEarnings'),
            earningsUSD: document.getElementById('earningsUSD'),
            minedAmount: document.getElementById('minedAmount'),
            miningRate: document.getElementById('miningRate'),
            dailyEst: document.getElementById('dailyEst'),
            monthlyEst: document.getElementById('monthlyEst'),
            
            // Calculadora
            calculateBtn: document.getElementById('calculateBtn'),
            calcHashrate: document.getElementById('calcHashrate'),
            hashrateUnit: document.getElementById('hashrateUnit'),
            calcPower: document.getElementById('calcPower'),
            calcElectricity: document.getElementById('calcElectricity'),
            calcPrice: document.getElementById('calcPrice'),
            
            // Modal de settings
            settingsModal: document.getElementById('settingsModal'),
            modalClose: document.getElementById('modalClose'),
            modalOverlay: document.getElementById('modalOverlay'),
            saveSettings: document.getElementById('saveSettings'),
            resetSettings: document.getElementById('resetSettings'),
            
            // Activity
            activityList: document.getElementById('activityList'),
            refreshActivity: document.getElementById('refreshActivity'),
            refreshMetrics: document.getElementById('refreshMetrics'),
            
            // Animación
            miningAnimation: document.getElementById('miningAnimation')
        };
        
        // Timer de actualización
        let updateInterval = null;
        let durationInterval = null;
        
        // Configurar event listeners
        setupEventListeners();
        
        // Cargar estado inicial
        loadInitialState();
        
        // Iniciar loop de actualización
        startUpdateLoop();
        
        function setupEventListeners() {
            // Start Mining
            if (elements.startMiningBtn) {
                elements.startMiningBtn.addEventListener('click', async () => {
                    elements.startMiningBtn.disabled = true;
                    try {
                        await supabase.startMiningSession();
                        updateUIState(true);
                        addActivity('Mining iniciado', 'success');
                        showNotification('¡Minería iniciada!', 'success');
                    } catch (error) {
                        console.error('Error starting mining:', error);
                        showNotification('Error al iniciar minería: ' + error.message, 'error');
                        elements.startMiningBtn.disabled = false;
                    }
                });
            }
            
            // Stop Mining
            if (elements.stopMiningBtn) {
                elements.stopMiningBtn.addEventListener('click', async () => {
                    elements.stopMiningBtn.disabled = true;
                    try {
                        await supabase.stopMiningSession();
                        updateUIState(false);
                        addActivity('Mining detenido', 'info');
                        showNotification('Minería detenida', 'info');
                    } catch (error) {
                        console.error('Error stopping mining:', error);
                        showNotification('Error al detener minería: ' + error.message, 'error');
                        elements.stopMiningBtn.disabled = false;
                    }
                });
            }
            
            // Settings
            if (elements.settingsBtn) {
                elements.settingsBtn.addEventListener('click', () => {
                    if (elements.settingsModal) {
                        elements.settingsModal.classList.add('active');
                    }
                });
            }
            
            if (elements.modalClose) {
                elements.modalClose.addEventListener('click', () => {
                    if (elements.settingsModal) {
                        elements.settingsModal.classList.remove('active');
                    }
                });
            }
            
            if (elements.modalOverlay) {
                elements.modalOverlay.addEventListener('click', () => {
                    if (elements.settingsModal) {
                        elements.settingsModal.classList.remove('active');
                    }
                });
            }
            
            // Calculator
            if (elements.calculateBtn) {
                elements.calculateBtn.addEventListener('click', calculateProfitability);
            }
            
            // Refresh buttons
            if (elements.refreshActivity) {
                elements.refreshActivity.addEventListener('click', loadInitialState);
            }
            
            if (elements.refreshMetrics) {
                elements.refreshMetrics.addEventListener('click', updateMetrics);
            }
            
            // Thread count slider
            const threadCount = document.getElementById('threadCount');
            if (threadCount) {
                threadCount.addEventListener('input', (e) => {
                    const value = e.target.value;
                    const valueDisplay = document.getElementById('threadCountValue');
                    if (valueDisplay) {
                        valueDisplay.textContent = value;
                    }
                });
            }
        }
        
        function loadInitialState() {
            // Verificar si el usuario está autenticado
            if (!supabase.user.isAuthenticated) {
                // Mostrar modal de login/registro
                showAuthModal();
                return;
            }
            
            // Cargar balance
            if (elements.miningBalance) {
                elements.miningBalance.textContent = supabase.user.balance.toFixed(6) + ' RSC';
            }
            
            // Verificar si hay sesión activa
            if (supabase.miningSession.isActive) {
                updateUIState(true);
                addActivity('Sesión de minería activa', 'success');
            } else {
                updateUIState(false);
            }
            
        // Cargar stats
        updateMetrics();
        
        // Cargar sistema de referidos
        loadReferralSystem();
        
        // Verificar código de referido en URL
        checkReferralCodeFromURL();
    }
        
        function updateUIState(isMining) {
            // Botones
            if (elements.startMiningBtn) {
                elements.startMiningBtn.style.display = isMining ? 'none' : 'flex';
                elements.startMiningBtn.disabled = false;
            }
            
            if (elements.stopMiningBtn) {
                elements.stopMiningBtn.style.display = isMining ? 'flex' : 'none';
                elements.stopMiningBtn.disabled = false;
            }
            
            // Status badge
            if (elements.miningStatusBadge) {
                if (isMining) {
                    elements.miningStatusBadge.innerHTML = '<i class="fas fa-circle"></i> Mining';
                    elements.miningStatusBadge.className = 'status-badge mining';
                } else {
                    elements.miningStatusBadge.innerHTML = '<i class="fas fa-circle"></i> Stopped';
                    elements.miningStatusBadge.className = 'status-badge';
                }
            }
            
            // Status text
            if (elements.miningStatus) {
                elements.miningStatus.textContent = isMining ? 'Mining' : 'Stopped';
            }
            
            // Animación
            if (elements.miningAnimation) {
                const core = elements.miningAnimation.querySelector('.mining-core');
                if (core) {
                    if (isMining) {
                        core.classList.add('active');
                    } else {
                        core.classList.remove('active');
                    }
                }
            }
            
            // Duration timer
            if (isMining) {
                startDurationTimer();
            } else {
                stopDurationTimer();
                if (elements.miningDuration) {
                    elements.miningDuration.textContent = '00:00:00';
                }
            }
        }
        
        function updateMetrics() {
            if (!supabase.miningSession.isActive) return;
            
            // Hashrate actual
            const hashrate = supabase.miningSession.hashRate || 100;
            if (elements.currentHashrate) {
                elements.currentHashrate.textContent = formatHashRate(hashrate);
            }
            
            if (elements.avgHashrate) {
                elements.avgHashrate.textContent = formatHashRate(hashrate * 0.95);
            }
            
            // Tokens minados
            const tokensMined = supabase.miningSession.tokensMined || 0;
            if (elements.minedAmount) {
                elements.minedAmount.textContent = tokensMined.toFixed(6) + ' RSC';
            }
            
            // CPU Usage (simulado)
            const cpuUsage = 50 + Math.random() * 30;
            if (elements.cpuUsage) {
                elements.cpuUsage.textContent = cpuUsage.toFixed(1) + '%';
            }
            if (elements.cpuBar) {
                elements.cpuBar.style.width = cpuUsage + '%';
            }
            
            // Memory (simulado)
            const memory = 100 + Math.random() * 50;
            if (elements.memoryUsage) {
                elements.memoryUsage.textContent = memory.toFixed(0) + ' MB';
            }
            if (elements.memoryBar) {
                elements.memoryBar.style.width = (memory / 5) + '%';
            }
            
            // Temperature (simulado)
            const temp = 55 + Math.random() * 15;
            if (elements.temperature) {
                elements.temperature.textContent = temp.toFixed(0) + ' °C';
            }
            
            // Earnings estimates
            const ratePerHour = (hashrate / 1000) * 0.36; // 0.36 RSC por 1000 H/s por hora
            if (elements.miningRate) {
                elements.miningRate.textContent = ratePerHour.toFixed(6) + ' RSC';
            }
            if (elements.dailyEst) {
                elements.dailyEst.textContent = (ratePerHour * 24).toFixed(6) + ' RSC';
            }
            if (elements.monthlyEst) {
                elements.monthlyEst.textContent = (ratePerHour * 24 * 30).toFixed(6) + ' RSC';
            }
        }
        
        function startDurationTimer() {
            stopDurationTimer();
            
            durationInterval = setInterval(() => {
                if (!supabase.miningSession.isActive || !supabase.miningSession.startTime) return;
                
                const start = new Date(supabase.miningSession.startTime).getTime();
                const now = Date.now();
                const duration = now - start;
                
                if (elements.miningDuration) {
                    elements.miningDuration.textContent = formatDuration(duration);
                }
                
                // Actualizar balance con tokens minados
                const hours = duration / (1000 * 60 * 60);
                const hashrate = supabase.miningSession.hashRate || 100;
                const tokensPerHour = (hashrate / 1000) * 0.36;
                const tokensMined = hours * tokensPerHour;
                
                supabase.miningSession.tokensMined = tokensMined;
                
                if (elements.miningBalance) {
                    const totalBalance = supabase.user.balance + tokensMined;
                    elements.miningBalance.textContent = totalBalance.toFixed(6) + ' RSC';
                }
            }, 1000);
        }
        
        function stopDurationTimer() {
            if (durationInterval) {
                clearInterval(durationInterval);
                durationInterval = null;
            }
        }
        
        function startUpdateLoop() {
            // Actualizar métricas cada 2 segundos
            updateInterval = setInterval(() => {
                if (supabase.miningSession.isActive) {
                    updateMetrics();
                }
            }, 2000);
        }
        
        function calculateProfitability() {
            const hashrate = parseFloat(elements.calcHashrate?.value || 1000);
            const unit = parseFloat(elements.hashrateUnit?.value || 1000);
            const power = parseFloat(elements.calcPower?.value || 100);
            const electricity = parseFloat(elements.calcElectricity?.value || 0.10);
            const price = parseFloat(elements.calcPrice?.value || 0.50);
            
            const totalHashrate = hashrate * unit;
            const ratePerHour = (totalHashrate / 1000) * 0.36;
            
            const hourly = ratePerHour;
            const daily = hourly * 24;
            const weekly = daily * 7;
            const monthly = daily * 30;
            
            const powerKW = power / 1000;
            const hourlyCost = powerKW * electricity;
            const monthlyCost = hourlyCost * 24 * 30;
            
            const monthlyRevenue = monthly * price;
            const monthlyProfit = monthlyRevenue - monthlyCost;
            
            // Update UI
            document.getElementById('resultHourly').textContent = hourly.toFixed(6) + ' RSC';
            document.getElementById('resultHourlyUSD').textContent = '$' + (hourly * price).toFixed(2);
            
            document.getElementById('resultDaily').textContent = daily.toFixed(6) + ' RSC';
            document.getElementById('resultDailyUSD').textContent = '$' + (daily * price).toFixed(2);
            
            document.getElementById('resultWeekly').textContent = weekly.toFixed(6) + ' RSC';
            document.getElementById('resultWeeklyUSD').textContent = '$' + (weekly * price).toFixed(2);
            
            document.getElementById('resultMonthly').textContent = monthly.toFixed(6) + ' RSC';
            document.getElementById('resultMonthlyUSD').textContent = '$' + (monthly * price).toFixed(2);
            
            document.getElementById('grossRevenue').textContent = '$' + monthlyRevenue.toFixed(2);
            document.getElementById('electricityCost').textContent = '-$' + monthlyCost.toFixed(2);
            document.getElementById('netProfit').textContent = '$' + monthlyProfit.toFixed(2);
            
            const roi = monthlyCost > 0 ? ((monthlyProfit / monthlyCost) * 100).toFixed(2) : '0.00';
            document.getElementById('roi').textContent = roi + '%';
            
            addActivity('Rentabilidad calculada', 'info');
        }
        
        function addActivity(text, type = 'info') {
            if (!elements.activityList) return;
            
            const iconMap = {
                success: 'check-circle',
                error: 'exclamation-circle',
                info: 'info-circle',
                warning: 'exclamation-triangle'
            };
            
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-${iconMap[type] || 'info-circle'}"></i>
                </div>
                <div class="activity-content">
                    <span class="activity-text">${text}</span>
                    <span class="activity-time">${new Date().toLocaleTimeString()}</span>
                </div>
            `;
            
            elements.activityList.insertBefore(item, elements.activityList.firstChild);
            
            // Keep only last 10 items
            while (elements.activityList.children.length > 10) {
                elements.activityList.removeChild(elements.activityList.lastChild);
            }
        }
        
        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `mining-notification mining-notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
                    <span>${message}</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            setTimeout(() => notification.classList.add('show'), 100);
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 5000);
        }
        
        function formatDuration(ms) {
            const seconds = Math.floor(ms / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            
            const s = seconds % 60;
            const m = minutes % 60;
            const h = hours;
            
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        
        function formatHashRate(hashrate) {
            if (hashrate >= 1000000000) {
                return (hashrate / 1000000000).toFixed(2) + ' GH/s';
            } else if (hashrate >= 1000000) {
                return (hashrate / 1000000).toFixed(2) + ' MH/s';
            } else if (hashrate >= 1000) {
                return (hashrate / 1000).toFixed(2) + ' KH/s';
            } else {
                return hashrate.toFixed(2) + ' H/s';
            }
        }
        
        // Función para mostrar modal de autenticación
        function showAuthModal() {
            const authModal = createAuthModal();
            document.body.appendChild(authModal);
            setTimeout(() => authModal.classList.add('show'), 100);
        }
        
        function createAuthModal() {
            const modal = document.createElement('div');
            modal.className = 'auth-modal';
            modal.id = 'authModal';
            modal.innerHTML = `
                <div class="auth-modal-overlay"></div>
                <div class="auth-modal-content">
                    <div class="auth-modal-header">
                        <h2>Bienvenido a RSC Mining</h2>
                        <p>Inicia sesión o regístrate para comenzar a minar</p>
                    </div>
                    <div class="auth-tabs">
                        <button class="auth-tab active" data-tab="login">Iniciar Sesión</button>
                        <button class="auth-tab" data-tab="register">Registrarse</button>
                    </div>
                    <div class="auth-forms">
                        <!-- Login Form -->
                        <form class="auth-form active" id="loginForm">
                            <div class="form-group">
                                <label for="loginEmail">
                                    <i class="fas fa-envelope"></i>
                                    Email
                                </label>
                                <input type="email" id="loginEmail" required placeholder="tu@email.com">
                            </div>
                            <div class="form-group">
                                <label for="loginPassword">
                                    <i class="fas fa-lock"></i>
                                    Contraseña
                                </label>
                                <input type="password" id="loginPassword" required placeholder="••••••••">
                            </div>
                            <button type="submit" class="auth-submit-btn">
                                <i class="fas fa-sign-in-alt"></i>
                                Iniciar Sesión
                            </button>
                            <div class="auth-demo">
                                <button type="button" class="auth-demo-btn" id="createTestUserBtn">
                                    <i class="fas fa-vial"></i>
                                    Crear Usuario de Prueba
                                </button>
                            </div>
                        </form>
                        
                        <!-- Register Form -->
                        <form class="auth-form" id="registerForm">
                            <div class="form-group">
                                <label for="registerUsername">
                                    <i class="fas fa-user"></i>
                                    Usuario
                                </label>
                                <input type="text" id="registerUsername" required placeholder="tu_usuario">
                            </div>
                            <div class="form-group">
                                <label for="registerEmail">
                                    <i class="fas fa-envelope"></i>
                                    Email
                                </label>
                                <input type="email" id="registerEmail" required placeholder="tu@email.com">
                            </div>
                            <div class="form-group">
                                <label for="registerPassword">
                                    <i class="fas fa-lock"></i>
                                    Contraseña
                                </label>
                                <input type="password" id="registerPassword" required placeholder="••••••••">
                            </div>
                            <div class="form-group">
                                <label for="registerReferral">
                                    <i class="fas fa-users"></i>
                                    Código de Referido (Opcional)
                                </label>
                                <input type="text" id="registerReferral" placeholder="RSC123456">
                            </div>
                            <button type="submit" class="auth-submit-btn">
                                <i class="fas fa-user-plus"></i>
                                Registrarse
                            </button>
                        </form>
                    </div>
                    <div class="auth-error" id="authError"></div>
                </div>
            `;
            
            // Setup tab switching
            const tabs = modal.querySelectorAll('.auth-tab');
            const forms = modal.querySelectorAll('.auth-form');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const targetTab = tab.dataset.tab;
                    
                    tabs.forEach(t => t.classList.remove('active'));
                    forms.forEach(f => f.classList.remove('active'));
                    
                    tab.classList.add('active');
                    const targetForm = modal.querySelector(`#${targetTab}Form`);
                    if (targetForm) {
                        targetForm.classList.add('active');
                    }
                });
            });
            
            // Setup login form
            const loginForm = modal.querySelector('#loginForm');
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = modal.querySelector('#loginEmail').value;
                const password = modal.querySelector('#loginPassword').value;
                
                try {
                    showAuthLoading(true);
                    await supabase.loginUser(email, password);
                    closeAuthModal(modal);
                    loadInitialState();
                    showNotification('¡Bienvenido de vuelta!', 'success');
                } catch (error) {
                    showAuthError(modal, error.message);
                } finally {
                    showAuthLoading(false);
                }
            });
            
            // Setup register form
            const registerForm = modal.querySelector('#registerForm');
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = modal.querySelector('#registerUsername').value;
                const email = modal.querySelector('#registerEmail').value;
                const password = modal.querySelector('#registerPassword').value;
                const referralCodeInput = modal.querySelector('#registerReferral');
                const referralCode = referralCodeInput.value || getStoredReferralCode() || null;
                
                try {
                    showAuthLoading(true);
                    await supabase.registerUser(email, username, password, referralCode);
                    clearStoredReferralCode(); // Limpiar código después del registro
                    closeAuthModal(modal);
                    loadInitialState();
                    showNotification('¡Cuenta creada exitosamente!', 'success');
                } catch (error) {
                    showAuthError(modal, error.message);
                } finally {
                    showAuthLoading(false);
                }
            });
            
            // Auto-completar código de referido si está disponible
            const storedReferralCode = getStoredReferralCode();
            if (storedReferralCode && modal.querySelector('#registerReferral')) {
                modal.querySelector('#registerReferral').value = storedReferralCode;
            }
            
            // Setup test user button
            const testUserBtn = modal.querySelector('#createTestUserBtn');
            if (testUserBtn) {
                testUserBtn.addEventListener('click', async () => {
                    try {
                        showAuthLoading(true);
                        const testUser = await supabase.createTestUser();
                        // El createTestUser ya hace auto-login
                        closeAuthModal(modal);
                        loadInitialState();
                        showNotification('¡Usuario de prueba creado!', 'success');
                    } catch (error) {
                        showAuthError(modal, error.message);
                    } finally {
                        showAuthLoading(false);
                    }
                });
            }
            
            return modal;
        }
        
        function showAuthError(modal, message) {
            const errorDiv = modal.querySelector('#authError');
            if (errorDiv) {
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
                setTimeout(() => {
                    errorDiv.style.display = 'none';
                }, 5000);
            }
        }
        
        function showAuthLoading(show) {
            const buttons = document.querySelectorAll('.auth-submit-btn, .auth-demo-btn');
            buttons.forEach(btn => {
                btn.disabled = show;
                if (show) {
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
                }
            });
        }
        
        function closeAuthModal(modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        }
        
        // Sistema de Referidos
        function loadReferralSystem() {
            if (!supabase.user.isAuthenticated) return;
            
            // Cargar código de referido
            loadReferralCode();
            
            // Cargar estadísticas de referidos
            loadReferralStats();
            
            // Cargar lista de referidos
            loadReferralsList();
            
            // Cargar historial de comisiones
            loadCommissionsHistory();
            
            // Setup event listeners para referidos
            setupReferralEventListeners();
        }
        
        function loadReferralCode() {
            const referralCodeInput = document.getElementById('referralCode');
            const referralLinkInput = document.getElementById('referralLink');
            
            if (referralCodeInput && supabase.user.referralCode) {
                referralCodeInput.value = supabase.user.referralCode;
            }
            
            if (referralLinkInput && supabase.user.referralCode) {
                const baseUrl = window.location.origin + window.location.pathname.replace('/pages/mine.html', '');
                referralLinkInput.value = `${baseUrl}?ref=${supabase.user.referralCode}`;
            }
        }
        
        async function loadReferralStats() {
            try {
                // Obtener estadísticas de referidos desde la API
                const response = await fetch(`${supabase.config.url}/rest/v1/users?referred_by=eq.${supabase.user.id}&select=count`, {
                    headers: {
                        'apikey': supabase.config.anonKey,
                        'Authorization': `Bearer ${supabase.config.anonKey}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const totalReferrals = data.length || 0;
                    
                    // Actualizar UI
                    updateReferralStatsUI(totalReferrals);
                }
                
                // Obtener comisiones desde transacciones
                await loadCommissionsFromTransactions();
                
            } catch (error) {
                console.error('Error loading referral stats:', error);
            }
        }
        
        async function loadCommissionsFromTransactions() {
            try {
                const response = await fetch(`${supabase.config.url}/rest/v1/transactions?user_id=eq.${supabase.user.id}&type=eq.referral_commission&select=amount,created_at`, {
                    headers: {
                        'apikey': supabase.config.anonKey,
                        'Authorization': `Bearer ${supabase.config.anonKey}`
                    }
                });
                
                if (response.ok) {
                    const transactions = await response.json();
                    const totalCommissions = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
                    
                    // Calcular comisiones de hoy
                    const today = new Date().toDateString();
                    const todayCommissions = transactions
                        .filter(tx => new Date(tx.created_at).toDateString() === today)
                        .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
                    
                    updateCommissionsUI(totalCommissions, todayCommissions);
                }
            } catch (error) {
                console.error('Error loading commissions:', error);
            }
        }
        
        function updateReferralStatsUI(totalReferrals) {
            const elements = [
                'totalReferrals',
                'detailedTotalReferrals'
            ];
            
            elements.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = totalReferrals;
                }
            });
        }
        
        function updateCommissionsUI(totalCommissions, todayCommissions) {
            const totalElements = [
                'totalCommissions',
                'detailedTotalCommissions'
            ];
            
            totalElements.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = totalCommissions.toFixed(6);
                }
            });
            
            const todayElement = document.getElementById('todayCommissions');
            if (todayElement) {
                todayElement.textContent = todayCommissions.toFixed(6) + ' RSC';
            }
        }
        
        async function loadReferralsList() {
            try {
                const response = await fetch(`${supabase.config.url}/rest/v1/users?referred_by=eq.${supabase.user.id}&select=username,created_at,balance&order=created_at.desc`, {
                    headers: {
                        'apikey': supabase.config.anonKey,
                        'Authorization': `Bearer ${supabase.config.anonKey}`
                    }
                });
                
                if (response.ok) {
                    const referrals = await response.json();
                    displayReferralsList(referrals);
                }
            } catch (error) {
                console.error('Error loading referrals list:', error);
            }
        }
        
        function displayReferralsList(referrals) {
            const referralsList = document.getElementById('referralsList');
            if (!referralsList) return;
            
            if (referrals.length === 0) {
                referralsList.innerHTML = `
                    <div class="no-referrals">
                        <i class="fas fa-user-plus"></i>
                        <p>Aún no tienes referidos. ¡Comparte tu código para empezar a ganar!</p>
                    </div>
                `;
                return;
            }
            
            referralsList.innerHTML = referrals.map(referral => `
                <div class="referral-item">
                    <div class="referral-info">
                        <div class="referral-name">${referral.username}</div>
                        <div class="referral-date">Se unió el ${new Date(referral.created_at).toLocaleDateString()}</div>
                    </div>
                    <div class="referral-earnings">${parseFloat(referral.balance || 0).toFixed(6)} RSC</div>
                </div>
            `).join('');
        }
        
        async function loadCommissionsHistory() {
            try {
                const response = await fetch(`${supabase.config.url}/rest/v1/transactions?user_id=eq.${supabase.user.id}&type=eq.referral_commission&select=amount,description,created_at&order=created_at.desc&limit=10`, {
                    headers: {
                        'apikey': supabase.config.anonKey,
                        'Authorization': `Bearer ${supabase.config.anonKey}`
                    }
                });
                
                if (response.ok) {
                    const commissions = await response.json();
                    displayCommissionsHistory(commissions);
                }
            } catch (error) {
                console.error('Error loading commissions history:', error);
            }
        }
        
        function displayCommissionsHistory(commissions) {
            const commissionsList = document.getElementById('commissionsList');
            if (!commissionsList) return;
            
            if (commissions.length === 0) {
                commissionsList.innerHTML = `
                    <div class="no-commissions">
                        <i class="fas fa-coins"></i>
                        <p>No hay comisiones aún. Las comisiones aparecerán cuando tus referidos minen.</p>
                    </div>
                `;
                return;
            }
            
            commissionsList.innerHTML = commissions.map(commission => `
                <div class="commission-item">
                    <div class="commission-info">
                        <div class="commission-description">${commission.description || 'Comisión de referido'}</div>
                        <div class="commission-date">${new Date(commission.created_at).toLocaleDateString()}</div>
                    </div>
                    <div class="commission-amount">+${parseFloat(commission.amount || 0).toFixed(6)} RSC</div>
                </div>
            `).join('');
        }
        
        function setupReferralEventListeners() {
            // Copy referral code
            const copyReferralCodeBtn = document.getElementById('copyReferralCode');
            if (copyReferralCodeBtn) {
                copyReferralCodeBtn.addEventListener('click', () => {
                    const referralCodeInput = document.getElementById('referralCode');
                    if (referralCodeInput) {
                        referralCodeInput.select();
                        document.execCommand('copy');
                        showNotification('Código de referido copiado!', 'success');
                    }
                });
            }
            
            // Copy referral link
            const copyReferralLinkBtn = document.getElementById('copyReferralLink');
            if (copyReferralLinkBtn) {
                copyReferralLinkBtn.addEventListener('click', () => {
                    const referralLinkInput = document.getElementById('referralLink');
                    if (referralLinkInput) {
                        referralLinkInput.select();
                        document.execCommand('copy');
                        showNotification('Link de referido copiado!', 'success');
                    }
                });
            }
        }
        
        // Función para procesar comisiones automáticamente cuando alguien mina
        function processReferralCommission(miningAmount) {
            if (!supabase.user.referredBy) return;
            
            const commissionRate = 0.10; // 10%
            const commissionAmount = miningAmount * commissionRate;
            
            // Aquí se procesaría la comisión en el backend
            // Por ahora solo mostramos la notificación
            if (commissionAmount > 0) {
                showNotification(`¡Comisión ganada: ${commissionAmount.toFixed(6)} RSC!`, 'success');
                addActivity(`Comisión de referido: +${commissionAmount.toFixed(6)} RSC`, 'success');
            }
        }
        
        // Verificar código de referido en la URL
        function checkReferralCodeFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            const referralCode = urlParams.get('ref');
            
            if (referralCode) {
                // Guardar código de referido para usar en el registro
                localStorage.setItem('rsc_referral_code', referralCode);
                
                // Mostrar notificación
                showNotification(`Código de referido detectado: ${referralCode}`, 'info');
                addActivity(`Código de referido detectado: ${referralCode}`, 'info');
                
                // Limpiar URL
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
            }
        }
        
        // Función para obtener código de referido guardado (para usar en registro)
        function getStoredReferralCode() {
            return localStorage.getItem('rsc_referral_code');
        }
        
        // Función para limpiar código de referido después del registro
        function clearStoredReferralCode() {
            localStorage.removeItem('rsc_referral_code');
        }
        
        console.log('✅ Mining Platform Adapter inicializado');
    }
    
    // Add notification and auth modal styles
    const style = document.createElement('style');
    style.textContent = `
        .mining-notification {
            position: fixed;
            top: 80px;
            right: -400px;
            z-index: 10000;
            background: rgba(21, 21, 21, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 255, 136, 0.2);
            border-radius: 12px;
            padding: 16px 20px;
            min-width: 300px;
            max-width: 400px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            transition: right 0.3s ease;
        }
        
        .mining-notification.show {
            right: 20px;
        }
        
        .mining-notification-success {
            border-color: rgba(0, 255, 136, 0.5);
        }
        
        .mining-notification-error {
            border-color: rgba(255, 68, 68, 0.5);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
            color: #ffffff;
        }
        
        .notification-content i {
            font-size: 1.2rem;
        }
        
        .mining-notification-success i {
            color: #00ff88;
        }
        
        .mining-notification-error i {
            color: #ff4444;
        }
        
        .mining-notification-info i {
            color: #00bfff;
        }
        
        /* Auth Modal Styles */
        .auth-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .auth-modal.show {
            opacity: 1;
        }
        
        .auth-modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(10px);
        }
        
        .auth-modal-content {
            position: relative;
            width: 90%;
            max-width: 450px;
            background: #151515;
            border-radius: 16px;
            border: 1px solid rgba(0, 255, 136, 0.2);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            overflow: hidden;
            animation: slideUp 0.3s ease;
        }
        
        @keyframes slideUp {
            from {
                transform: translateY(30px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .auth-modal-header {
            padding: 30px;
            text-align: center;
            background: linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .auth-modal-header h2 {
            font-size: 1.8rem;
            font-weight: 700;
            margin: 0 0 8px 0;
            background: linear-gradient(45deg, #00ff88, #6366f1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .auth-modal-header p {
            font-size: 0.95rem;
            color: #a0a0a0;
            margin: 0;
        }
        
        .auth-tabs {
            display: flex;
            padding: 20px 20px 0;
            gap: 10px;
        }
        
        .auth-tab {
            flex: 1;
            padding: 12px;
            background: transparent;
            border: none;
            color: #a0a0a0;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.3s ease;
        }
        
        .auth-tab:hover {
            color: #ffffff;
        }
        
        .auth-tab.active {
            color: #00ff88;
            border-bottom-color: #00ff88;
        }
        
        .auth-forms {
            padding: 30px;
        }
        
        .auth-form {
            display: none;
        }
        
        .auth-form.active {
            display: block;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9rem;
            font-weight: 500;
            color: #ffffff;
            margin-bottom: 8px;
        }
        
        .form-group label i {
            color: #00ff88;
            font-size: 0.85rem;
        }
        
        .form-group input {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #ffffff;
            font-size: 0.95rem;
            transition: all 0.3s ease;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #00ff88;
            background: rgba(255, 255, 255, 0.08);
            box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
        }
        
        .auth-submit-btn {
            width: 100%;
            padding: 14px;
            background: linear-gradient(45deg, #00ff88, #00cc6a);
            border: none;
            border-radius: 8px;
            color: #ffffff;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            transition: all 0.3s ease;
            margin-top: 10px;
        }
        
        .auth-submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 255, 136, 0.3);
        }
        
        .auth-submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .auth-demo {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .auth-demo-btn {
            width: 100%;
            padding: 12px;
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.3);
            border-radius: 8px;
            color: #6366f1;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.3s ease;
        }
        
        .auth-demo-btn:hover {
            background: rgba(99, 102, 241, 0.2);
            border-color: rgba(99, 102, 241, 0.5);
        }
        
        .auth-error {
            display: none;
            padding: 12px;
            margin: 0 30px 20px;
            background: rgba(255, 68, 68, 0.1);
            border: 1px solid rgba(255, 68, 68, 0.3);
            border-radius: 8px;
            color: #ff4444;
            font-size: 0.9rem;
            text-align: center;
        }
    `;
    document.head.appendChild(style);
    
})();

console.log('🔌 Mining Platform Adapter loaded');

