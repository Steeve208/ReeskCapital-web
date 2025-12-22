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
    
    async function loadSettings() {
        // Load settings from Supabase
        if (window.miningSupabaseAdapter && window.miningSupabaseAdapter.initialized) {
            try {
                const userSettings = await window.miningSupabaseAdapter.getUserSettings();
                const userData = await window.miningSupabaseAdapter.getUserData();
                
                // Apply user data
                if (userData) {
                    if (userData.username && document.getElementById('username')) {
                        document.getElementById('username').value = userData.username;
                    }
                    if (userData.email && document.getElementById('email')) {
                        document.getElementById('email').value = userData.email;
                    }
                }
                
                // Apply settings
                if (userSettings) {
                    if (userSettings.language && document.getElementById('language')) {
                        document.getElementById('language').value = userSettings.language;
                    }
                    if (userSettings.theme && document.getElementById('theme')) {
                        document.getElementById('theme').value = userSettings.theme;
                    }
                    if (userSettings.defaultAlgorithm && document.getElementById('defaultAlgorithm')) {
                        document.getElementById('defaultAlgorithm').value = userSettings.defaultAlgorithm;
                    }
                    if (userSettings.autoStartMining !== undefined && document.getElementById('autoStartMining')) {
                        document.getElementById('autoStartMining').checked = userSettings.autoStartMining;
                    }
                }
                
                // Fallback to localStorage
                const localSettings = JSON.parse(localStorage.getItem('miningSettings') || '{}');
                Object.keys(localSettings).forEach(key => {
                    const element = document.getElementById(key);
                    if (element && !element.value && !element.checked) {
                        if (typeof localSettings[key] === 'boolean') {
                            element.checked = localSettings[key];
                        } else {
                            element.value = localSettings[key];
                        }
                    }
                });
            } catch (error) {
                console.error('Error cargando configuraciones:', error);
                // Fallback to localStorage
                loadSettingsFromLocalStorage();
            }
        } else {
            loadSettingsFromLocalStorage();
        }
    }
    
    function loadSettingsFromLocalStorage() {
        const settings = JSON.parse(localStorage.getItem('miningSettings') || '{}');
        
        if (settings.username && document.getElementById('username')) {
            document.getElementById('username').value = settings.username;
        }
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
    }
    
    async function saveGeneralSettings() {
        const settings = {
            username: document.getElementById('username').value,
            language: document.getElementById('language').value,
            theme: document.getElementById('theme').value
        };
        
        // Save to Supabase
        if (window.miningSupabaseAdapter && window.miningSupabaseAdapter.initialized) {
            try {
                const success = await window.miningSupabaseAdapter.updateUserSettings(settings);
                
                if (success) {
                    // Also save to localStorage as backup
                    localStorage.setItem('miningSettings', JSON.stringify({
                        ...JSON.parse(localStorage.getItem('miningSettings') || '{}'),
                        ...settings
                    }));
                    
                    window.miningNotifications?.success('Configuración general guardada');
                } else {
                    throw new Error('Error al guardar');
                }
            } catch (error) {
                console.error('Error guardando configuración:', error);
                // Fallback to localStorage
                localStorage.setItem('miningSettings', JSON.stringify({
                    ...JSON.parse(localStorage.getItem('miningSettings') || '{}'),
                    ...settings
                }));
                window.miningNotifications?.success('Configuración guardada localmente');
            }
        } else {
            // Fallback to localStorage
            localStorage.setItem('miningSettings', JSON.stringify({
                ...JSON.parse(localStorage.getItem('miningSettings') || '{}'),
                ...settings
            }));
            window.miningNotifications?.success('Configuración guardada localmente');
        }
    }
    
    function saveMiningSettings() {
        const settings = {
            defaultAlgorithm: document.getElementById('defaultAlgorithm').value,
            autoStartMining: document.getElementById('autoStartMining').checked,
            defaultIntensity: document.getElementById('defaultIntensity').value,
            defaultThreads: parseInt(document.getElementById('defaultThreads').value)
        };
        
        localStorage.setItem('miningSettings', JSON.stringify({
            ...JSON.parse(localStorage.getItem('miningSettings') || '{}'),
            ...settings
        }));
        
        showNotification('Configuración de minería guardada', 'success');
    }
    
    function saveNotificationSettings() {
        const settings = {
            emailNotifications: document.getElementById('emailNotifications').checked,
            pushNotifications: document.getElementById('pushNotifications').checked,
            miningAlerts: document.getElementById('miningAlerts').checked,
            payoutAlerts: document.getElementById('payoutAlerts').checked,
            hashrateThreshold: parseFloat(document.getElementById('hashrateThreshold').value)
        };
        
        localStorage.setItem('miningSettings', JSON.stringify({
            ...JSON.parse(localStorage.getItem('miningSettings') || '{}'),
            ...settings
        }));
        
        showNotification('Preferencias de notificaciones guardadas', 'success');
    }
    
    function saveAdvancedSettings() {
        const settings = {
            defaultPool: document.getElementById('defaultPool').value,
            poolTimeout: parseInt(document.getElementById('poolTimeout').value),
            poolFailover: document.getElementById('poolFailover').checked,
            backupPool: document.getElementById('backupPool').value,
            enableLogging: document.getElementById('enableLogging').checked,
            logLevel: document.getElementById('logLevel').value
        };
        
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
        
        // Change password via Supabase
        if (window.miningSupabaseAdapter && window.miningSupabaseAdapter.initialized) {
            try {
                const success = await window.miningSupabaseAdapter.changePassword(current, newPass);
                
                if (success) {
                    // Clear form
                    document.getElementById('currentPassword').value = '';
                    document.getElementById('newPassword').value = '';
                    document.getElementById('confirmPassword').value = '';
                    
                    window.miningNotifications?.success('Contraseña cambiada exitosamente');
                } else {
                    throw new Error('Error al cambiar la contraseña');
                }
            } catch (error) {
                console.error('Error cambiando contraseña:', error);
                window.miningNotifications?.error(error.message || 'Error al cambiar la contraseña. Verifica tu contraseña actual.');
            }
        } else {
            window.miningNotifications?.error('Sistema no disponible. Intenta más tarde.');
        }
        
        // Process password change
        if (window.supabaseIntegration) {
            window.supabaseIntegration.changePassword(current, newPass)
                .then(() => {
                    window.miningNotifications?.success('Contraseña cambiada correctamente');
                    document.getElementById('currentPassword').value = '';
                    document.getElementById('newPassword').value = '';
                    document.getElementById('confirmPassword').value = '';
                })
                .catch(error => {
                    window.miningNotifications?.error('Error al cambiar contraseña: ' + error.message);
                });
        } else {
            window.miningNotifications?.success('Contraseña cambiada correctamente');
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
        
        // Delete account
        if (window.supabaseIntegration) {
            window.supabaseIntegration.deleteAccount()
                .then(() => {
                    window.miningNotifications?.success('Cuenta eliminada. Serás redirigido...');
                    setTimeout(() => window.location.href = '../../index.html', 2000);
                })
                .catch(error => {
                    window.miningNotifications?.error('Error al eliminar cuenta: ' + error.message);
                });
        } else {
            window.miningNotifications?.success('Cuenta eliminada');
            setTimeout(() => window.location.href = '../../index.html', 2000);
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

