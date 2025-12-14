/**
 * RSC CHAIN - ADMIN PANEL
 * Main JavaScript File
 */

// Admin panel state
let currentModule = 'dashboard';

// Initialize Admin Panel
async function initAdminPanel() {
  try {
    showLoading(true);
    console.log('[Admin] Starting panel...');
    
    // Check authentication using the new system
    if (!isAdminAuthenticated()) {
      console.log('❌ Not authenticated, redirecting to login...');
      showLoginScreen();
      showLoading(false);
      return;
    }
    
    // Get admin session
    const session = getAdminSession();
    console.log('✅ Admin authenticated:', session.name, '(' + session.role + ')');
    
    // Update UI with admin info
    updateAdminInfo();
    
    // Configure navigation by permissions
    setupNavigation();
    
    // Hide unauthorized modules
    hideUnauthorizedModules();
    
    // Load dashboard
    await loadModule('dashboard');
    
    // Setup menu toggle
    setupMenuToggle();
    
    showLoading(false);
    
  } catch (error) {
    console.error('Init error:', error);
    showToast('Error initializing panel', 'error');
    showLoading(false);
  }
}

// Show login screen
function showLoginScreen() {
  const mainContent = document.querySelector('.admin-main');
  const sidebar = document.querySelector('.admin-sidebar');
  
  if (sidebar) sidebar.style.display = 'none';
  
  if (mainContent) {
    mainContent.innerHTML = getLoginTemplate();
  }
}

// Login template
function getLoginTemplate() {
  return `
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <div class="login-logo">
            <i class="fas fa-shield-alt"></i>
          </div>
          <h1>RSC Admin</h1>
          <p>Admin Panel</p>
        </div>
        
        <form id="loginForm" onsubmit="handleLogin(event)">
          <div class="login-field">
            <label for="loginEmail">
              <i class="fas fa-envelope"></i> Email
            </label>
            <input type="email" id="loginEmail" placeholder="admin@rscchain.com" required>
          </div>
          
          <div class="login-field">
            <label for="loginPassword">
              <i class="fas fa-lock"></i> Password
            </label>
            <input type="password" id="loginPassword" placeholder="••••••••" required>
          </div>
          
          <div class="login-error" id="loginError" style="display:none;">
            <i class="fas fa-exclamation-circle"></i>
            <span id="loginErrorMsg"></span>
          </div>
          
          <button type="submit" class="login-btn" id="loginBtn">
            <span>Sign In</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </form>
        
        <div class="login-footer">
          <p>RSC Chain © 2024 - Admin Panel</p>
        </div>
      </div>
    </div>
    
    <style>
      .login-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #0a0a0f 0%, #1a1f2e 50%, #0f1419 100%);
        padding: 2rem;
      }
      .login-box {
        width: 100%;
        max-width: 420px;
        background: linear-gradient(145deg, #161a22 0%, #1a1f2a 100%);
        border: 1px solid #232937;
        border-radius: 24px;
        padding: 3rem 2.5rem;
        box-shadow: 0 25px 50px rgba(0,0,0,0.5);
      }
      .login-header {
        text-align: center;
        margin-bottom: 2.5rem;
      }
      .login-logo {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #00ff88, #00d673);
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        font-size: 2.5rem;
        color: #0a0a0f;
      }
      .login-header h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: #fff;
        margin: 0 0 0.5rem;
      }
      .login-header p {
        color: #888;
        font-size: 0.95rem;
      }
      .login-field {
        margin-bottom: 1.5rem;
      }
      .login-field label {
        display: block;
        font-size: 0.85rem;
        color: #888;
        margin-bottom: 0.5rem;
      }
      .login-field label i {
        margin-right: 0.5rem;
        color: #00ff88;
      }
      .login-field input {
        width: 100%;
        padding: 1rem 1.25rem;
        background: #0f1115;
        border: 2px solid #232937;
        border-radius: 12px;
        color: #fff;
        font-size: 1rem;
        transition: all 0.3s;
        box-sizing: border-box;
      }
      .login-field input:focus {
        outline: none;
        border-color: #00ff88;
        box-shadow: 0 0 0 4px rgba(0,255,136,0.1);
      }
      .login-field input::placeholder {
        color: #555;
      }
      .login-error {
        background: rgba(239,68,68,0.1);
        border: 1px solid rgba(239,68,68,0.3);
        border-radius: 10px;
        padding: 1rem;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: #ef4444;
        font-size: 0.9rem;
      }
      .login-btn {
        width: 100%;
        padding: 1rem 1.5rem;
        background: linear-gradient(135deg, #00ff88, #00d673);
        border: none;
        border-radius: 12px;
        color: #0a0a0f;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        transition: all 0.3s;
      }
      .login-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(0,255,136,0.3);
      }
      .login-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }
      .login-btn.loading span {
        display: none;
      }
      .login-btn.loading::before {
        content: "Verificando...";
      }
      .login-footer {
        text-align: center;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid #232937;
      }
      .login-footer p {
        color: #555;
        font-size: 0.8rem;
      }
    </style>
  `;
}

// Handle login
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const btn = document.getElementById('loginBtn');
  const errorDiv = document.getElementById('loginError');
  const errorMsg = document.getElementById('loginErrorMsg');
  
  // Hide previous error
  errorDiv.style.display = 'none';
  btn.classList.add('loading');
  btn.disabled = true;
  
  try {
    // Use auth.js login
    await adminLogin(email, password);
    
    // Successful login - reload page
    showToast('✅ Welcome to the admin panel', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 500);
    
  } catch (error) {
    console.error('Login error:', error);
    errorMsg.textContent = error.message || 'Login failed';
    errorDiv.style.display = 'flex';
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

// Ocultar módulos no autorizados en el menú
function hideUnauthorizedModules() {
  const allowedModules = getAllowedModules();
  const navLinks = document.querySelectorAll('.nav-link[data-module]');
  
  navLinks.forEach(link => {
    const module = link.getAttribute('data-module');
    if (!allowedModules.includes(module)) {
      link.style.display = 'none';
    }
  });
}

// Las funciones adminLogin, adminLogout, etc. vienen de auth.js

// Logout (wrapper para auth.js)
async function logout() {
  await adminLogout();
}

// Update Admin Info
function updateAdminInfo() {
  const session = getAdminSession();
  if (!session) return;
  
  const nameEl = document.getElementById('adminName');
  const roleEl = document.getElementById('adminRole');
  
  if (nameEl) nameEl.textContent = session.name || 'Admin';
  if (roleEl) roleEl.textContent = formatRoleName(session.role);
}

// Formatear nombre de rol
function formatRoleName(role) {
  const roles = {
    'super_admin': 'Super Admin',
    'content_manager': 'Content Manager',
    'user_manager': 'User Manager',
    'metrics_manager': 'Metrics Manager',
    'finance_manager': 'Finance Manager',
    'viewer': 'Viewer'
  };
  
  return roles[role] || role || 'Admin';
}

// Setup Navigation
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const module = item.dataset.module;
      
      if (module) {
        // Update active state
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Load module
        await loadModule(module);
      }
    });
  });
}

// Load Module
async function loadModule(moduleName) {
  try {
    console.log('📦 Loading module:', moduleName);
    showLoading(true);
    currentModule = moduleName;
    
    // Update page title
    const titles = {
      'dashboard': 'Dashboard',
      'content': 'Content Management',
      'users': 'Users Management',
      'social-metrics': '📊 Social Metrics - Real-time Update',
      'metrics': 'System Metrics',
      'campaigns': 'Campaigns and Events',
      'rewards': 'Rewards Engine',
      'jobs': 'Automation Tasks',
      'treasury': 'Treasury',
      'admins': 'Administrators and Roles',
      'audit': 'Audit Log',
      'settings': 'System Settings'
    };
    
    document.getElementById('pageTitle').textContent = titles[moduleName] || 'Admin Panel';
    
    // Load module content
    const contentContainer = document.getElementById('adminContent');
    
    // Check if templates are loaded
    if (!window.AdminTemplates) {
      console.error('❌ AdminTemplates not loaded');
      contentContainer.innerHTML = `
        <div style="text-align: center; padding: 4rem;">
          <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #f59e0b; margin-bottom: 1rem;"></i>
          <h2 style="color: var(--text-primary);">Error: Templates not loaded</h2>
          <p style="color: var(--text-secondary);">Check that templates.js is correctly included</p>
        </div>
      `;
      showLoading(false);
      return;
    }
    
    console.log('✅ AdminTemplates disponible:', Object.keys(window.AdminTemplates));
    
    // Load template if available
    if (window.AdminTemplates[moduleName]) {
      console.log('✅ Template encontrado para:', moduleName);
      contentContainer.innerHTML = window.AdminTemplates[moduleName]();
      console.log('✅ Template renderizado');
    } else {
      console.warn('⚠️ Template no encontrado para:', moduleName);
      // Fallback for modules without templates yet
      contentContainer.innerHTML = `
        <div style="text-align: center; padding: 4rem;">
          <i class="fas fa-tools" style="font-size: 4rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
          <h2 style="color: var(--text-secondary);">Module in development</h2>
          <p style="color: var(--text-muted);">This module will be available soon</p>
        </div>
      `;
    }
    
    // Call module-specific load function if exists
    const loadFunctions = {
      'dashboard': window.loadDashboard,
      'content': window.loadContent,
      'users': window.loadUsers,
      'social-metrics': window.loadSocialMetrics,
      'metrics': window.loadSocialMetrics, // Same as social-metrics
      'campaigns': window.loadCampaigns,
      'rewards': window.loadRewards,
      'jobs': window.loadJobs,
      'treasury': window.loadTreasury,
      'admins': window.loadAdminsModule,
      'audit': window.loadAudit,
      'settings': window.loadSettings
    };
    
    if (loadFunctions[moduleName] && typeof loadFunctions[moduleName] === 'function') {
      console.log('📞 Calling module-specific function');
      await loadFunctions[moduleName]();
    }
    
    showLoading(false);
    console.log('✅ Module loaded successfully:', moduleName);
  } catch (error) {
    console.error('❌ Module load error:', error);
    showToast('Error loading module: ' + error.message, 'error');
    showLoading(false);
  }
}

// Setup Menu Toggle (Mobile)
function setupMenuToggle() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('adminSidebar');
  
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove('active');
      }
    });
  }
}

// Log Audit
async function logAudit(adminId, action, module, details = {}) {
  try {
    const client = getSupabaseClient();
    if (!client) {
      console.log('[logAudit] Supabase no disponible, audit no registrado');
      return;
    }
    
    const { error } = await client
      .from('audit_logs')
      .insert({
        admin_id: adminId,
        action: action,
        module: module,
        details: details,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent
      });
    
    if (error) {
      console.error('Audit log error:', error);
    }
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

// Get Client IP (via external service)
async function getClientIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}

// Generate Token
function generateToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Show Loading
function showLoading(show = true) {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    if (show) {
      overlay.classList.add('active');
    } else {
      overlay.classList.remove('active');
    }
  }
}

// Show Toast
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    'success': 'fa-check-circle',
    'error': 'fa-times-circle',
    'warning': 'fa-exclamation-triangle',
    'info': 'fa-info-circle'
  };
  
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas ${icons[type] || icons.info}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-message">${message}</div>
    </div>
  `;
  
  container.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Format Date
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format Number
function formatNumber(number) {
  return new Intl.NumberFormat('en-US').format(number);
}

// Format Currency
function formatCurrency(amount, currency = 'RSC') {
  return `${formatNumber(amount)} ${currency}`;
}

// Show Notifications
function showNotifications() {
  showToast('Notifications system coming soon', 'info');
}

// Show Help
function showHelp() {
  showToast('Help documentation coming soon', 'info');
}

// Export functions
window.initAdminPanel = initAdminPanel;
window.adminLogin = adminLogin;
window.logout = logout;
window.loadModule = loadModule;
window.showLoading = showLoading;
window.showToast = showToast;
window.formatDate = formatDate;
window.formatNumber = formatNumber;
window.formatCurrency = formatCurrency;
window.showNotifications = showNotifications;
window.showHelp = showHelp;
window.logAudit = logAudit;
window.currentAdmin = currentAdmin;

// Helper para obtener cliente Supabase (usado por funciones de auth)
function getSupabaseClient() {
  return window.supabaseClient || null;
}


