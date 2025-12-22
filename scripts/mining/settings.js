// ===== SETTINGS PAGE LOGIC =====

(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        initializeSettings();
        setupEventListeners();
        loadSettings();
    });
    
    function initializeSettings() {
        console.log('⚙️ Initializing Settings page...');
    }
    
    function setupEventListeners() {
        // Tab switching
        const tabs = document.querySelectorAll('.settings-tab');
        const tabContents = document.querySelectorAll('.settings-tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Update active content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === targetTab + 'Tab') {
                        content.classList.add('active');
                    }
                });
            });
        });
        
        // Save buttons
        document.getElementById('saveGeneralBtn')?.addEventListener('click', saveGeneralSettings);
        document.getElementById('saveMiningBtn')?.addEventListener('click', saveMiningSettings);
        document.getElementById('saveNotificationsBtn')?.addEventListener('click', saveNotificationSettings);
        document.getElementById('saveAdvancedBtn')?.addEventListener('click', saveAdvancedSettings);
        
        // Security actions
        document.getElementById('changePasswordBtn')?.addEventListener('click', changePassword);
        document.getElementById('setup2FABtn')?.addEventListener('click', setup2FA);
        
        // Danger zone
        document.getElementById('deleteAllDataBtn')?.addEventListener('click', confirmDeleteAllData);
        document.getElementById('deleteAccountBtn')?.addEventListener('click', confirmDeleteAccount);
    }
    
    async function waitForSupabaseIntegration() {
        let attempts = 0;
        const maxAttempts = 50;
        
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                attempts++;
                
                if (window.supabaseIntegration && 
                    window.supabaseIntegration.user && 
                    window.supabaseIntegration.user.isAuthenticated &&
                    window.supabaseIntegration.user.id) {
                    clearInterval(checkInterval);
                    resolve(true);
                    return;
                }
                
                if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    console.warn('⚠️ Supabase Integration no disponible');
                    resolve(false);
                }
            }, 100);
        });
    }
    
    async function loadSettings() {
        // Esperar a que Supabase esté listo
        const isReady = await waitForSupabaseIntegration();
        
        // Primero intentar cargar desde supabaseIntegration.user si está disponible (más rápido)
        if (window.supabaseIntegration && window.supabaseIntegration.user) {
            const usernameInput = document.getElementById('username');
            const emailInput = document.getElementById('userEmail');
            
            if (usernameInput && window.supabaseIntegration.user.username) {
                usernameInput.value = window.supabaseIntegration.user.username;
                console.log('✅ Username cargado desde supabaseIntegration.user:', window.supabaseIntegration.user.username);
            }
            if (emailInput && window.supabaseIntegration.user.email) {
                emailInput.value = window.supabaseIntegration.user.email;
                console.log('✅ Email cargado desde supabaseIntegration.user:', window.supabaseIntegration.user.email);
            }
        }
        
        if (!isReady || !window.supabaseIntegration || !window.supabaseIntegration.user || !window.supabaseIntegration.user.isAuthenticated) {
            console.warn('⚠️ Settings: Supabase no disponible, usando localStorage');
            loadSettingsFromLocalStorage();
            return;
        }
        
        try {
            console.log('📡 Settings: Cargando datos desde Supabase...');
            const userId = window.supabaseIntegration.user.id;
            
            // 1. Cargar datos del usuario desde Supabase (siempre actualizar desde BD para asegurar datos frescos)
            const userResponse = await window.supabaseIntegration.makeRequest(
                'GET',
                `/rest/v1/users?id=eq.${userId}&select=id,email,username,created_at,updated_at`
            );
            
            if (userResponse.ok) {
                const users = await userResponse.json();
                if (users.length > 0) {
                    const userData = users[0];
                    
                    console.log('📊 Settings: Datos del usuario desde Supabase:', {
                        email: userData.email,
                        username: userData.username
                    });
                    
                    // Actualizar campos del formulario (siempre desde BD)
                    const emailInput = document.getElementById('userEmail');
                    if (emailInput) {
                        emailInput.value = userData.email || '';
                        console.log('✅ Email actualizado desde BD:', userData.email);
                    }
                    
                    const usernameInput = document.getElementById('username');
                    if (usernameInput) {
                        // FORZAR actualización del username desde BD (siempre tiene prioridad)
                        const realUsername = userData.username || '';
                        usernameInput.setAttribute('value', realUsername);
                        usernameInput.value = realUsername;
                        
                        console.log('✅ Username actualizado desde BD:', realUsername);
                        console.log('📋 Verificación - Username en input:', usernameInput.value);
                        
                        // Verificar que se actualizó correctamente
                        if (usernameInput.value !== realUsername) {
                            console.warn('⚠️ El username no se actualizó correctamente, forzando nuevamente...');
                            usernameInput.value = realUsername;
                            usernameInput.setAttribute('value', realUsername);
                        }
                    } else {
                        console.error('❌ No se encontró el elemento username en el DOM');
                    }
                    
                    // Actualizar también en el objeto user de supabaseIntegration
                    if (window.supabaseIntegration.user) {
                        window.supabaseIntegration.user.username = userData.username;
                        window.supabaseIntegration.user.email = userData.email;
                        window.supabaseIntegration.saveUserToStorage();
                    }
                    
                    console.log('✅ Settings: Datos del usuario cargados desde Supabase');
                } else {
                    console.warn('⚠️ Settings: No se encontró usuario en la respuesta');
                }
            } else {
                const errorText = await userResponse.text();
                console.error('❌ Settings: Error obteniendo usuario:', userResponse.status, errorText);
            }
            
            // 2. Cargar configuraciones desde localStorage (solo preferencias, NO username/email)
            // Pasar false para NUNCA sobrescribir username/email que vienen de Supabase
            loadSettingsFromLocalStorage(false);
            
            // 3. Cargar sesiones activas
            await loadActiveSessions();
            
        } catch (error) {
            console.error('❌ Error cargando configuraciones:', error);
            loadSettingsFromLocalStorage();
        }
    }
    
    async function loadActiveSessions() {
        try {
            const sessionsList = document.getElementById('sessionsList');
            if (!sessionsList) return;
            
            // Por ahora, mostrar solo la sesión actual
            // TODO: Implementar sistema de sesiones múltiples si es necesario
            if (window.supabaseIntegration && window.supabaseIntegration.user && window.supabaseIntegration.user.isAuthenticated) {
                const userAgent = navigator.userAgent;
                const deviceInfo = getDeviceInfo(userAgent);
                
                sessionsList.innerHTML = `
                    <div class="session-item">
                        <div class="session-info">
                            <div class="session-device">
                                <i class="fas fa-${deviceInfo.icon}"></i>
                                <span>${deviceInfo.name}</span>
                            </div>
                            <div class="session-location">Sesión actual</div>
                            <div class="session-time">Última actividad: Ahora</div>
                        </div>
                        <button class="btn btn-danger btn-sm" onclick="window.location.href='../../index.html'; localStorage.clear();">
                            <i class="fas fa-times"></i>
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                `;
            } else {
                sessionsList.innerHTML = `
                    <div class="session-item">
                        <div class="session-info">
                            <div class="session-device">
                                <i class="fas fa-info-circle"></i>
                                <span>No hay sesiones activas</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error cargando sesiones:', error);
        }
    }
    
    function getDeviceInfo(userAgent) {
        if (userAgent.includes('Windows')) {
            return { name: 'Windows', icon: 'desktop' };
        } else if (userAgent.includes('Mac')) {
            return { name: 'macOS', icon: 'laptop' };
        } else if (userAgent.includes('Linux')) {
            return { name: 'Linux', icon: 'desktop' };
        } else if (userAgent.includes('Android')) {
            return { name: 'Android', icon: 'mobile-alt' };
        } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
            return { name: 'iOS', icon: 'mobile-alt' };
        }
        return { name: 'Dispositivo', icon: 'desktop' };
    }
    
    function loadSettingsFromLocalStorage(overwriteUserData = true) {
        const settings = JSON.parse(localStorage.getItem('miningSettings') || '{}');
        
        // NUNCA sobrescribir username/email desde localStorage si ya tienen valor
        // Los datos de Supabase siempre tienen prioridad
        if (overwriteUserData) {
            const usernameInput = document.getElementById('username');
            // Solo cargar desde localStorage si el campo está vacío
            if (settings.username && usernameInput && (!usernameInput.value || usernameInput.value.trim() === '')) {
                usernameInput.value = settings.username;
                console.log('⚠️ Username cargado desde localStorage (fallback):', settings.username);
            }
        }
        
        // Cargar preferencias (estas siempre se pueden cargar desde localStorage)
        if (settings.language && document.getElementById('language')) {
            document.getElementById('language').value = settings.language;
        }
        if (settings.theme && document.getElementById('theme')) {
            document.getElementById('theme').value = settings.theme;
        }
        if (settings.defaultAlgorithm && document.getElementById('defaultAlgorithm')) {
            document.getElementById('defaultAlgorithm').value = settings.defaultAlgorithm;
        }
        if (settings.autoStartMining !== undefined && document.getElementById('autoStartMining')) {
            document.getElementById('autoStartMining').checked = settings.autoStartMining;
        }
        if (settings.defaultIntensity && document.getElementById('defaultIntensity')) {
            document.getElementById('defaultIntensity').value = settings.defaultIntensity;
        }
        if (settings.defaultThreads && document.getElementById('defaultThreads')) {
            document.getElementById('defaultThreads').value = settings.defaultThreads;
        }
        if (settings.emailNotifications !== undefined && document.getElementById('emailNotifications')) {
            document.getElementById('emailNotifications').checked = settings.emailNotifications;
        }
        if (settings.pushNotifications !== undefined && document.getElementById('pushNotifications')) {
            document.getElementById('pushNotifications').checked = settings.pushNotifications;
        }
        if (settings.miningAlerts !== undefined && document.getElementById('miningAlerts')) {
            document.getElementById('miningAlerts').checked = settings.miningAlerts;
        }
        if (settings.payoutAlerts !== undefined && document.getElementById('payoutAlerts')) {
            document.getElementById('payoutAlerts').checked = settings.payoutAlerts;
        }
        if (settings.hashrateThreshold && document.getElementById('hashrateThreshold')) {
            document.getElementById('hashrateThreshold').value = settings.hashrateThreshold;
        }
        if (settings.defaultPool && document.getElementById('defaultPool')) {
            document.getElementById('defaultPool').value = settings.defaultPool;
        }
        if (settings.poolTimeout && document.getElementById('poolTimeout')) {
            document.getElementById('poolTimeout').value = settings.poolTimeout;
        }
        if (settings.poolFailover !== undefined && document.getElementById('poolFailover')) {
            document.getElementById('poolFailover').checked = settings.poolFailover;
        }
        if (settings.backupPool && document.getElementById('backupPool')) {
            document.getElementById('backupPool').value = settings.backupPool;
        }
        if (settings.enableLogging !== undefined && document.getElementById('enableLogging')) {
            document.getElementById('enableLogging').checked = settings.enableLogging;
        }
        if (settings.logLevel && document.getElementById('logLevel')) {
            document.getElementById('logLevel').value = settings.logLevel;
        }
    }
    
    async function saveGeneralSettings() {
        const language = document.getElementById('language').value;
        const theme = document.getElementById('theme').value;
        
        // Solo guardar preferencias (language, theme) en localStorage
        // Username y email son inmutables
        try {
            localStorage.setItem('miningSettings', JSON.stringify({
                ...JSON.parse(localStorage.getItem('miningSettings') || '{}'),
                language: language,
                theme: theme
            }));
            
            showNotification('Preferencias guardadas exitosamente', 'success');
            
        } catch (error) {
            console.error('Error guardando preferencias:', error);
            showNotification('Error al guardar las preferencias', 'error');
        }
    }
    
    async function saveMiningSettings() {
        const settings = {
            defaultAlgorithm: document.getElementById('defaultAlgorithm').value,
            autoStartMining: document.getElementById('autoStartMining').checked,
            defaultIntensity: document.getElementById('defaultIntensity').value,
            defaultThreads: parseInt(document.getElementById('defaultThreads').value)
        };
        
        // Guardar en localStorage (configuraciones de minería son locales por ahora)
        localStorage.setItem('miningSettings', JSON.stringify({
            ...JSON.parse(localStorage.getItem('miningSettings') || '{}'),
            ...settings
        }));
        
        showNotification('Configuración de minería guardada', 'success');
    }
    
    async function saveNotificationSettings() {
        const settings = {
            emailNotifications: document.getElementById('emailNotifications').checked,
            pushNotifications: document.getElementById('pushNotifications').checked,
            miningAlerts: document.getElementById('miningAlerts').checked,
            payoutAlerts: document.getElementById('payoutAlerts').checked,
            hashrateThreshold: parseFloat(document.getElementById('hashrateThreshold').value)
        };
        
        // Guardar en localStorage (preferencias de notificaciones son locales por ahora)
        localStorage.setItem('miningSettings', JSON.stringify({
            ...JSON.parse(localStorage.getItem('miningSettings') || '{}'),
            ...settings
        }));
        
        showNotification('Preferencias de notificaciones guardadas', 'success');
    }
    
    async function saveAdvancedSettings() {
        const settings = {
            defaultPool: document.getElementById('defaultPool').value,
            poolTimeout: parseInt(document.getElementById('poolTimeout').value),
            poolFailover: document.getElementById('poolFailover').checked,
            backupPool: document.getElementById('backupPool').value,
            enableLogging: document.getElementById('enableLogging').checked,
            logLevel: document.getElementById('logLevel').value
        };
        
        // Guardar en localStorage (configuraciones avanzadas son locales por ahora)
        localStorage.setItem('miningSettings', JSON.stringify({
            ...JSON.parse(localStorage.getItem('miningSettings') || '{}'),
            ...settings
        }));
        
        showNotification('Configuración avanzada guardada', 'success');
    }
    
    async function changePassword() {
        const current = document.getElementById('currentPassword').value;
        const newPass = document.getElementById('newPassword').value;
        const confirm = document.getElementById('confirmPassword').value;
        
        if (!current || !newPass || !confirm) {
            window.miningNotifications?.error('Por favor completa todos los campos');
            return;
        }
        
        if (newPass !== confirm) {
            window.miningNotifications?.error('Las contraseñas no coinciden');
            return;
        }
        
        if (newPass.length < 8) {
            window.miningNotifications?.error('La contraseña debe tener al menos 8 caracteres');
            return;
        }
        
        // Cambiar contraseña usando supabaseIntegration
        if (!window.supabaseIntegration || !window.supabaseIntegration.user || !window.supabaseIntegration.user.isAuthenticated) {
            showNotification('Error: No estás autenticado', 'error');
            return;
        }
        
        try {
            const userId = window.supabaseIntegration.user.id;
            const email = window.supabaseIntegration.user.email;
            
            // Verificar contraseña actual obteniendo el usuario y comparando
            const userResponse = await window.supabaseIntegration.makeRequest(
                'GET',
                `/rest/v1/users?id=eq.${userId}&select=id,password_hash,password`
            );
            
            if (!userResponse.ok) {
                throw new Error('Error al verificar usuario');
            }
            
            const users = await userResponse.json();
            if (users.length === 0) {
                throw new Error('Usuario no encontrado');
            }
            
            const user = users[0];
            const storedPassword = user.password_hash || user.password;
            
            // Verificar contraseña actual (está en base64)
            const currentPasswordEncoded = btoa(current);
            if (storedPassword !== currentPasswordEncoded) {
                // Intentar verificar haciendo login
                try {
                    await window.supabaseIntegration.loginUser(email, current);
                } catch (loginError) {
                    showNotification('Contraseña actual incorrecta', 'error');
                    return;
                }
            }
            
            // Actualizar contraseña en la BD (usando password_hash o password según el esquema)
            const hashedNewPassword = btoa(newPass);
            const updateData = {
                updated_at: new Date().toISOString()
            };
            
            // Intentar actualizar password_hash primero, luego password
            if (user.password_hash !== undefined) {
                updateData.password_hash = hashedNewPassword;
            } else {
                updateData.password = hashedNewPassword;
            }
            
            const updateResponse = await window.supabaseIntegration.makeRequest(
                'PATCH',
                `/rest/v1/users?id=eq.${userId}`,
                updateData
            );
            
            if (updateResponse.ok) {
                // Limpiar formulario
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
                
                showNotification('Contraseña cambiada exitosamente', 'success');
            } else {
                const errorText = await updateResponse.text();
                console.error('Error actualizando contraseña:', errorText);
                throw new Error('Error al actualizar la contraseña');
            }
            
        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            showNotification(error.message || 'Error al cambiar la contraseña. Verifica tu contraseña actual.', 'error');
        }
    }
    
    async function setup2FA() {
        await window.miningNotifications?.info('Configuración de 2FA - Funcionalidad próximamente');
    }
    
    async function confirmDeleteAllData() {
        const confirmed1 = await window.miningNotifications?.confirm(
            '¿Estás seguro de que deseas eliminar TODOS tus datos? Esta acción no se puede deshacer.',
            { title: 'Eliminar Datos', type: 'danger', danger: true }
        );
        if (!confirmed1) return;
        
        const confirmed2 = await window.miningNotifications?.confirm(
            'Esta es tu última advertencia. ¿Realmente deseas eliminar todos los datos?',
            { title: 'Confirmación Final', type: 'danger', danger: true }
        );
        if (!confirmed2) return;
        
        // Delete all data
        localStorage.removeItem('miningSettings');
        localStorage.removeItem('sessionHistory');
        // ... delete other data
        
        window.miningNotifications?.success('Todos los datos han sido eliminados');
        setTimeout(() => location.reload(), 1500);
    }
    
    async function confirmDeleteAccount() {
        const confirmed = await window.miningNotifications?.confirm(
            '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es PERMANENTE e IRREVERSIBLE.',
            { title: 'Eliminar Cuenta', type: 'danger', danger: true, confirmText: 'Eliminar Cuenta' }
        );
        if (!confirmed) return;
        
        // For security, we'll use a custom prompt-like dialog
        const confirmText = await new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'confirm-dialog-overlay';
            overlay.innerHTML = `
                <div class="confirm-dialog">
                    <div class="confirm-dialog-header">
                        <div class="confirm-dialog-icon danger">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3 class="confirm-dialog-title">Confirmación Final</h3>
                    </div>
                    <div class="confirm-dialog-message">
                        <p>Escribe "ELIMINAR" para confirmar:</p>
                        <input type="text" id="deleteConfirmInput" class="form-input" style="margin-top: 12px;" autofocus>
                    </div>
                    <div class="confirm-dialog-actions">
                        <button class="confirm-dialog-btn cancel" onclick="this.closest('.confirm-dialog-overlay').remove(); window._deleteConfirmResolve('');">
                            Cancelar
                        </button>
                        <button class="confirm-dialog-btn danger" onclick="const input = document.getElementById('deleteConfirmInput'); this.closest('.confirm-dialog-overlay').remove(); window._deleteConfirmResolve(input.value);">
                            Confirmar
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            window._deleteConfirmResolve = resolve;
        });
        
        if (confirmText !== 'ELIMINAR') {
            window.miningNotifications?.error('Confirmación incorrecta. Operación cancelada.');
            return;
        }
        
        // Eliminar cuenta desde Supabase
        if (!window.supabaseIntegration || !window.supabaseIntegration.user || !window.supabaseIntegration.user.isAuthenticated) {
            showNotification('Error: No estás autenticado', 'error');
            return;
        }
        
        try {
            const userId = window.supabaseIntegration.user.id;
            
            // Eliminar usuario de la BD
            // Nota: Esto eliminará en cascada todas las relaciones (referrals, transactions, sessions, etc.)
            const deleteResponse = await window.supabaseIntegration.makeRequest(
                'DELETE',
                `/rest/v1/users?id=eq.${userId}`
            );
            
            if (deleteResponse.ok) {
                // Limpiar localStorage
                localStorage.clear();
                
                // Limpiar sesión
                window.supabaseIntegration.user.isAuthenticated = false;
                window.supabaseIntegration.user = {
                    isAuthenticated: false,
                    id: null,
                    email: null,
                    username: null,
                    balance: 0,
                    referralCode: null
                };
                
                showNotification('Cuenta eliminada. Serás redirigido...', 'success');
                setTimeout(() => {
                    window.location.href = '../../index.html';
                }, 2000);
            } else {
                const errorText = await deleteResponse.text();
                console.error('Error eliminando cuenta:', errorText);
                throw new Error('Error al eliminar la cuenta');
            }
            
        } catch (error) {
            console.error('Error eliminando cuenta:', error);
            showNotification('Error al eliminar la cuenta: ' + error.message, 'error');
        }
    }
    
    function showNotification(message, type) {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }
    
    console.log('✅ Settings page initialized');
})();

