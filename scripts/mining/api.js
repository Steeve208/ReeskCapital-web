// ===== API & INTEGRATIONS PAGE LOGIC =====

(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        initializeAPI();
        setupEventListeners();
        loadAPIKeys();
        loadWebhooks();
        setupDocsNavigation();
    });
    
    function initializeAPI() {
        console.log('🔌 Initializing API & Integrations page...');
    }
    
    function setupEventListeners() {
        // Tab switching
        const tabs = document.querySelectorAll('.api-tab');
        const tabContents = document.querySelectorAll('.api-tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');
                
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === targetTab + 'Tab') {
                        content.classList.add('active');
                    }
                });
            });
        });
        
        // Generate API key
        const generateBtn = document.getElementById('generateApiKeyBtn');
        const generateModal = document.getElementById('generateApiKeyModal');
        const closeModal = document.getElementById('closeApiKeyModal');
        const cancelBtn = document.getElementById('cancelApiKeyBtn');
        const confirmBtn = document.getElementById('confirmGenerateApiKeyBtn');
        
        if (generateBtn && generateModal) {
            generateBtn.addEventListener('click', () => {
                generateModal.classList.add('active');
            });
        }
        
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                generateModal.classList.remove('active');
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                generateModal.classList.remove('active');
            });
        }
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', generateAPIKey);
        }
        
        // Add webhook
        const addWebhookBtn = document.getElementById('addWebhookBtn');
        if (addWebhookBtn) {
            addWebhookBtn.addEventListener('click', () => {
                alert('Configurar Webhook - Funcionalidad próximamente');
            });
        }
        
        // Copy code buttons
        document.querySelectorAll('.btn-copy-code').forEach(btn => {
            btn.addEventListener('click', function() {
                const codeBlock = this.closest('.code-block');
                const code = codeBlock.querySelector('code').textContent;
                copyToClipboard(code);
                showNotification('Código copiado', 'success');
            });
        });
    }
    
    function loadAPIKeys() {
        const keysList = document.getElementById('apiKeysList');
        if (!keysList) return;
        
        const keys = [
            {
                name: 'Mi App de Minería',
                key: 'rsc_live_abc123xyz789def456ghi012jkl345mno678pqr901stu234vwx567',
                created: new Date('2024-01-01'),
                lastUsed: new Date('2024-01-15'),
                permissions: ['read', 'write']
            },
            {
                name: 'Dashboard Personal',
                key: 'rsc_live_xyz789abc123def456ghi012jkl345mno678pqr901stu234vwx567',
                created: new Date('2024-01-05'),
                lastUsed: new Date('2024-01-14'),
                permissions: ['read']
            }
        ];
        
        if (keys.length === 0) {
            keysList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-key"></i>
                    <p>No tienes API keys. Genera una para empezar.</p>
                </div>
            `;
        } else {
            keysList.innerHTML = keys.map(key => `
                <div class="api-key-card">
                    <div class="api-key-info">
                        <div class="api-key-name">${key.name}</div>
                        <div class="api-key-value">${key.key}</div>
                        <div class="api-key-meta">
                            <span>Creada: ${key.created.toLocaleDateString('es-ES')}</span>
                            <span>Último uso: ${key.lastUsed.toLocaleDateString('es-ES')}</span>
                            <span>Permisos: ${key.permissions.join(', ')}</span>
                        </div>
                    </div>
                    <div class="api-key-actions">
                        <button class="btn btn-secondary btn-sm" onclick="copyApiKey('${key.key}')">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn-icon-danger" onclick="revokeApiKey('${key.key}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    async function loadWebhooks() {
        const webhooksList = document.getElementById('webhooksList');
        if (!webhooksList) return;
        
        // Load from Supabase
        if (window.miningSupabaseAdapter && window.miningSupabaseAdapter.initialized) {
            try {
                const webhooks = await window.miningSupabaseAdapter.getWebhooks();
                
                if (webhooks && webhooks.length > 0) {
                    displayWebhooks(webhooks);
                    return;
                }
            } catch (error) {
                console.error('Error cargando webhooks:', error);
            }
        }
        
        // Fallback: empty state
        webhooksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-webhook"></i>
                <p>No tienes webhooks configurados</p>
            </div>
        `;
    }
    
    function displayWebhooks(webhooks) {
        const webhooksList = document.getElementById('webhooksList');
        if (!webhooksList) return;
        
        if (webhooks.length === 0) {
            webhooksList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-webhook"></i>
                    <p>No tienes webhooks configurados</p>
                </div>
            `;
            return;
        }
        
        webhooksList.innerHTML = webhooks.map(webhook => {
            const events = typeof webhook.events === 'string' ? JSON.parse(webhook.events) : webhook.events;
            const eventList = Array.isArray(events) ? events : [];
            
            return `
                <div class="webhook-card">
                    <div class="webhook-header">
                        <div class="webhook-name">${webhook.url.substring(0, 50)}...</div>
                        <div class="webhook-status">
                            <span class="status-badge ${webhook.status === 'active' ? 'confirmed' : 'pending'}">
                                ${webhook.status === 'active' ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                    </div>
                    <div class="webhook-url">${webhook.url}</div>
                    <div class="webhook-events">
                        ${eventList.map(event => `
                            <span class="webhook-event-badge">${event}</span>
                        `).join('')}
                    </div>
                    <div class="webhook-actions">
                        <button class="btn btn-secondary btn-sm" onclick="testWebhook('${webhook.id}')">
                            <i class="fas fa-paper-plane"></i>
                            <span>Probar</span>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteWebhook('${webhook.id}')">
                            <i class="fas fa-trash"></i>
                            <span>Eliminar</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    function setupDocsNavigation() {
        const navLinks = document.querySelectorAll('.docs-nav-link');
        const sections = document.querySelectorAll('.docs-section');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = this.getAttribute('href').substring(1);
                
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                sections.forEach(section => {
                    if (section.id === target) {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });
            });
        });
    }
    
    async function generateAPIKey() {
        const name = document.getElementById('apiKeyName').value;
        const permissions = {
            read: document.getElementById('permRead')?.checked || false,
            write: document.getElementById('permWrite')?.checked || false,
            withdraw: document.getElementById('permAdmin')?.checked || false
        };
        
        if (!name) {
            window.miningNotifications?.error('Por favor ingresa un nombre para la API key');
            return;
        }
        
        if (!permissions.read && !permissions.write && !permissions.withdraw) {
            window.miningNotifications?.error('Por favor selecciona al menos un permiso');
            return;
        }
        
        // Generate API key via Supabase
        if (window.miningSupabaseAdapter && window.miningSupabaseAdapter.initialized) {
            try {
                const newKey = await window.miningSupabaseAdapter.createApiKey({
                    key_name: name,
                    permissions: permissions
                });
                
                if (newKey) {
                    // Close modal
                    document.getElementById('generateApiKeyModal').classList.remove('active');
                    
                    // Clear form
                    document.getElementById('apiKeyName').value = '';
                    if (document.getElementById('permRead')) document.getElementById('permRead').checked = false;
                    if (document.getElementById('permWrite')) document.getElementById('permWrite').checked = false;
                    if (document.getElementById('permAdmin')) document.getElementById('permAdmin').checked = false;
                    
                    // Show success with key info
                    if (newKey.api_secret) {
                        const confirmed = await window.miningNotifications?.confirm(
                            `API Key creada exitosamente.\n\nSecret: ${newKey.api_secret}\n\n¿Copiar al portapapeles?`
                        );
                        if (confirmed) {
                            copyToClipboard(newKey.api_secret);
                            window.miningNotifications?.success('Secret copiado al portapapeles');
                        }
                    } else {
                        window.miningNotifications?.success('API key generada exitosamente');
                    }
                    
                    // Reload keys
                    loadAPIKeys();
                } else {
                    throw new Error('Error al generar la API key');
                }
            } catch (error) {
                console.error('Error generando API key:', error);
                window.miningNotifications?.error('Error al generar la API key. Intenta de nuevo.');
            }
        } else {
            window.miningNotifications?.error('Sistema no disponible. Intenta más tarde.');
        }
    }
    
    window.copyApiKey = function(key) {
        copyToClipboard(key);
        showNotification('API Key copiada', 'success');
    };
    
    window.revokeApiKey = async function(keyId) {
        const confirmed = await window.miningNotifications?.confirm('¿Estás seguro de que deseas revocar esta API key? No podrás deshacer esta acción.');
        
        if (confirmed) {
            if (window.miningSupabaseAdapter && window.miningSupabaseAdapter.initialized) {
                try {
                    const success = await window.miningSupabaseAdapter.revokeApiKey(keyId);
                    
                    if (success) {
                        window.miningNotifications?.success('API key revocada exitosamente');
                        loadAPIKeys();
                    } else {
                        throw new Error('Error al revocar la API key');
                    }
                } catch (error) {
                    console.error('Error revocando API key:', error);
                    window.miningNotifications?.error('Error al revocar la API key. Intenta de nuevo.');
                }
            } else {
                window.miningNotifications?.error('Sistema no disponible. Intenta más tarde.');
            }
        }
    };
    
    window.testWebhook = function(url) {
        alert('Probando webhook: ' + url);
    };
    
    window.deleteWebhook = function(url) {
        if (confirm('¿Eliminar este webhook?')) {
            console.log('Deleting webhook:', url);
            showNotification('Webhook eliminado', 'success');
            loadWebhooks();
        }
    };
    
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Copied to clipboard');
        });
    }
    
    function showNotification(message, type) {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }
    
    console.log('✅ API & Integrations page initialized');
})();

