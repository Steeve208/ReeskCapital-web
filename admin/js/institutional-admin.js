// =====================================================
// RSC CHAIN - INSTITUTIONAL ADMIN PANEL
// Professional Financial Institution Admin System
// =====================================================

// Global State
const AdminState = {
  currentUser: null,
  currentRole: null,
  permissions: [],
  currentModule: 'dashboard',
  notifications: [],
  unreadNotifications: 0,
  authenticated: false // Flag para evitar verificaciones múltiples
};

// Exponer AdminState INMEDIATAMENTE para que esté disponible
window.AdminState = AdminState;

// Exponer AdminState globalmente para que los módulos puedan acceder
window.AdminState = AdminState;

// Role Definitions - Complete Corporate Structure
const ROLES = {
  // Executive Level
  CEO: {
    id: 'ceo',
    name: 'Chief Executive Officer',
    level: 100,
    permissions: ['*'] // All permissions
  },
  CO_CEO: {
    id: 'co_ceo',
    name: 'Co-Chief Executive Officer',
    level: 99,
    permissions: ['*'] // All permissions
  },
  SUPER_ADMIN: {
    id: 'super_admin',
    name: 'Super Administrator',
    level: 98,
    permissions: ['*'] // All permissions
  },
  
  // C-Level Executives
  CFO: {
    id: 'cfo',
    name: 'Chief Financial Officer',
    level: 95,
    permissions: [
      'dashboard.view',
      'executive.view',
      'transactions.*',
      'treasury.*',
      'payments.*',
      'invoices.*',
      'expenses.*',
      'budgets.*',
      'reports.*',
      'analytics.*',
      'approvals.*',
      'employees.view',
      'compliance.view',
      'audit.view'
    ]
  },
  CMO: {
    id: 'cmo',
    name: 'Chief Marketing Officer',
    level: 95,
    permissions: [
      'dashboard.view',
      'executive.view',
      'marketing.*',
      'campaigns.*',
      'social.*',
      'community.*',
      'content.*',
      'design.*',
      'media.*',
      'templates.*',
      'influencers.*',
      'analytics.*',
      'reports.view',
      'approvals.view',
      'approvals.approve'
    ]
  },
  CTO: {
    id: 'cto',
    name: 'Chief Technology Officer',
    level: 95,
    permissions: [
      'dashboard.view',
      'executive.view',
      'system.*',
      'security.*',
      'integrations.*',
      'automation.*',
      'analytics.*',
      'reports.view'
    ]
  },
  CHRO: {
    id: 'chro',
    name: 'Chief Human Resources Officer',
    level: 95,
    permissions: [
      'dashboard.view',
      'executive.view',
      'hr.*',
      'employees.*',
      'departments.*',
      'roles.*',
      'attendance.*',
      'leave.*',
      'performance.*',
      'recruitment.*',
      'reports.view'
    ]
  },
  
  // Directors
  DIRECTOR_FINANCE: {
    id: 'director_finance',
    name: 'Director of Finance',
    level: 85,
    permissions: [
      'dashboard.view',
      'transactions.*',
      'treasury.*',
      'payments.*',
      'invoices.*',
      'expenses.*',
      'budgets.*',
      'reports.*',
      'approvals.view',
      'approvals.approve',
      'employees.view'
    ]
  },
  DIRECTOR_MARKETING: {
    id: 'director_marketing',
    name: 'Director of Marketing',
    level: 85,
    permissions: [
      'dashboard.view',
      'marketing.*',
      'campaigns.*',
      'social.*',
      'community.*',
      'content.*',
      'design.view',
      'media.view',
      'templates.view',
      'influencers.*',
      'analytics.view',
      'reports.view',
      'approvals.view',
      'approvals.approve'
    ]
  },
  DIRECTOR_OPERATIONS: {
    id: 'director_operations',
    name: 'Director of Operations',
    level: 85,
    permissions: [
      'dashboard.view',
      'projects.*',
      'tasks.*',
      'kanban.*',
      'calendar.*',
      'time.*',
      'employees.view',
      'messages.*',
      'channels.*',
      'meetings.*',
      'reports.view',
      'approvals.view',
      'approvals.approve'
    ]
  },
  DIRECTOR_DESIGN: {
    id: 'director_design',
    name: 'Director of Design',
    level: 85,
    permissions: [
      'dashboard.view',
      'design.*',
      'brand.*',
      'media.*',
      'templates.*',
      'content.view',
      'projects.view',
      'tasks.view',
      'approvals.view',
      'approvals.approve'
    ]
  },
  
  // Managers
  MANAGER_FINANCE: {
    id: 'manager_finance',
    name: 'Finance Manager',
    level: 75,
    permissions: [
      'dashboard.view',
      'transactions.view',
      'transactions.create',
      'treasury.view',
      'payments.view',
      'payments.create',
      'invoices.view',
      'invoices.create',
      'expenses.view',
      'expenses.create',
      'budgets.view',
      'reports.view',
      'approvals.view',
      'employees.view'
    ]
  },
  MANAGER_MARKETING: {
    id: 'manager_marketing',
    name: 'Marketing Manager',
    level: 75,
    permissions: [
      'dashboard.view',
      'campaigns.*',
      'social.*',
      'community.*',
      'content.*',
      'design.view',
      'media.view',
      'templates.view',
      'influencers.view',
      'analytics.view',
      'reports.view',
      'approvals.view'
    ]
  },
  MANAGER_COMMUNITY: {
    id: 'manager_community',
    name: 'Community Manager',
    level: 75,
    permissions: [
      'dashboard.view',
      'community.*',
      'social.*',
      'campaigns.view',
      'content.view',
      'messages.*',
      'channels.*',
      'influencers.view',
      'analytics.view'
    ]
  },
  MANAGER_PROJECTS: {
    id: 'manager_projects',
    name: 'Project Manager',
    level: 75,
    permissions: [
      'dashboard.view',
      'projects.*',
      'tasks.*',
      'kanban.*',
      'calendar.*',
      'time.*',
      'messages.view',
      'channels.view',
      'reports.view'
    ]
  },
  MANAGER_HR: {
    id: 'manager_hr',
    name: 'HR Manager',
    level: 75,
    permissions: [
      'dashboard.view',
      'hr.*',
      'employees.*',
      'departments.*',
      'attendance.*',
      'leave.*',
      'performance.*',
      'recruitment.*',
      'reports.view'
    ]
  },
  
  // Specialists
  DESIGNER: {
    id: 'designer',
    name: 'Designer',
    level: 60,
    permissions: [
      'dashboard.view',
      'design.*',
      'brand.view',
      'media.*',
      'templates.*',
      'projects.view',
      'tasks.view',
      'tasks.create',
      'messages.view',
      'channels.view',
      'calendar.view'
    ]
  },
  SENIOR_DESIGNER: {
    id: 'senior_designer',
    name: 'Senior Designer',
    level: 65,
    permissions: [
      'dashboard.view',
      'design.*',
      'brand.*',
      'media.*',
      'templates.*',
      'projects.*',
      'tasks.*',
      'messages.*',
      'channels.*',
      'calendar.*',
      'approvals.view'
    ]
  },
  COMMUNITY_MANAGER: {
    id: 'community_manager',
    name: 'Community Manager',
    level: 60,
    permissions: [
      'dashboard.view',
      'community.*',
      'social.*',
      'campaigns.view',
      'content.view',
      'content.create',
      'messages.*',
      'channels.*',
      'influencers.view',
      'analytics.view'
    ]
  },
  MARKETING_SPECIALIST: {
    id: 'marketing_specialist',
    name: 'Marketing Specialist',
    level: 60,
    permissions: [
      'dashboard.view',
      'campaigns.view',
      'campaigns.create',
      'social.view',
      'content.view',
      'content.create',
      'media.view',
      'templates.view',
      'analytics.view'
    ]
  },
  CONTENT_CREATOR: {
    id: 'content_creator',
    name: 'Content Creator',
    level: 55,
    permissions: [
      'dashboard.view',
      'content.*',
      'media.*',
      'templates.view',
      'campaigns.view',
      'social.view',
      'projects.view',
      'tasks.view',
      'messages.view'
    ]
  },
  FINANCE_ANALYST: {
    id: 'finance_analyst',
    name: 'Finance Analyst',
    level: 55,
    permissions: [
      'dashboard.view',
      'transactions.view',
      'treasury.view',
      'payments.view',
      'invoices.view',
      'expenses.view',
      'budgets.view',
      'reports.view',
      'analytics.view'
    ]
  },
  COMPLIANCE_OFFICER: {
    id: 'compliance_officer',
    name: 'Compliance Officer',
    level: 70,
    permissions: [
      'dashboard.view',
      'compliance.*',
      'audit.*',
      'risk.*',
      'legal.*',
      'transactions.view',
      'approvals.view',
      'approvals.approve'
    ]
  },
  
  // Support & Operations
  SUPPORT_AGENT: {
    id: 'support_agent',
    name: 'Support Agent',
    level: 40,
    permissions: [
      'dashboard.view',
      'users.view',
      'users.edit',
      'messages.*',
      'channels.view',
      'content.view',
      'tasks.view',
      'tasks.create'
    ]
  },
  OPERATIONS_COORDINATOR: {
    id: 'operations_coordinator',
    name: 'Operations Coordinator',
    level: 50,
    permissions: [
      'dashboard.view',
      'projects.view',
      'tasks.*',
      'kanban.*',
      'calendar.*',
      'messages.*',
      'channels.*',
      'meetings.*'
    ]
  },
  
  // Viewers & Interns
  VIEWER: {
    id: 'viewer',
    name: 'Viewer',
    level: 10,
    permissions: [
      'dashboard.view',
      'reports.view'
    ]
  },
  INTERN: {
    id: 'intern',
    name: 'Intern',
    level: 5,
    permissions: [
      'dashboard.view',
      'tasks.view',
      'messages.view',
      'channels.view',
      'calendar.view'
    ]
  }
};

// Initialize Admin Panel
async function initInstitutionalAdmin() {
  console.log('🚀 Initializing Institutional Admin Panel...');
  
  // Check authentication FIRST (before anything else)
  console.log('🔐 Step 1: Verificando autenticación...');
  await checkAuthentication();
  
  // Si llegamos aquí, significa que la autenticación fue exitosa
  // (checkAuthentication redirige a login si falla, así que si llegamos aquí = autenticado)
  console.log('✅ Autenticación verificada, continuando inicialización...');
  console.log('👤 Usuario en AdminState:', AdminState.currentUser?.name || 'No definido');
  console.log('🆔 ID de usuario:', AdminState.currentUser?.id || 'No definido');
  
  // Verificar que AdminState tenga usuario antes de continuar
  if (!AdminState.currentUser || !AdminState.currentUser.id) {
    console.error('❌ AdminState.currentUser no está definido después de checkAuthentication');
    console.error('📋 AdminState completo:', AdminState);
    
    // Última verificación: buscar en localStorage directamente
    console.log('🔍 Última verificación en localStorage...');
    const lastCheck = localStorage.getItem('adminSession') || localStorage.getItem('admin_session');
    if (lastCheck) {
      try {
        const parsed = JSON.parse(lastCheck);
        const session = parsed.user || parsed;
        if (session && session.id) {
          console.log('✅ Sesión encontrada en última verificación, configurando AdminState...');
          AdminState.currentUser = {
            id: session.id,
            email: session.email,
            name: session.name || session.display_name || session.email?.split('@')[0] || 'Admin',
            avatar: session.avatar || session.avatar_url
          };
          AdminState.currentRole = {
            id: session.role_id || session.role || 'viewer',
            name: typeof session.role === 'string' ? session.role : (session.role?.name || 'viewer')
          };
          AdminState.authenticated = true;
          updateUserInfo();
          loadPermissions();
          console.log('✅ AdminState configurado correctamente');
        } else {
          throw new Error('Sesión sin ID válido');
        }
      } catch (e) {
        console.error('❌ Error en última verificación:', e);
        console.error('🔄 Redirigiendo a login por seguridad...');
        window.location.href = 'login.html';
        return;
      }
    } else {
      console.error('🔄 No hay sesión en localStorage, redirigiendo a login...');
      window.location.href = 'login.html';
      return;
    }
  }
  
  // Test database connection (non-blocking, no debe bloquear si falla)
  console.log('📡 Step 2: Probando conexión a base de datos...');
  try {
    // Usar timeout para evitar que esto bloquee la inicialización
    const connectionPromise = AdminAPI.testConnection();
    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(false), 3000));
    
    const connectionOk = await Promise.race([connectionPromise, timeoutPromise]);
    if (!connectionOk) {
      console.warn('⚠️ No se pudo conectar a la base de datos de admin. Algunas funciones pueden no estar disponibles.');
    } else {
      console.log('✅ Conexión a base de datos exitosa');
    }
  } catch (error) {
    console.warn('⚠️ Error probando conexión (no crítico, continuando):', error.message);
    // NO redirigir por errores de conexión a BD
  }
  
  // Setup event listeners
  console.log('🔧 Step 3: Configurando event listeners...');
  setupEventListeners();
  
  // Setup navigation
  console.log('🧭 Step 4: Configurando navegación...');
  setupNavigation();
  
  // Setup permissions
  console.log('🔒 Step 5: Aplicando permisos...');
  applyPermissions();
  
  // Setup notifications
  console.log('🔔 Step 6: Configurando notificaciones...');
  setupNotifications();
  
  // Load initial module
  console.log('📊 Step 7: Cargando módulo inicial (dashboard)...');
  await loadModule('dashboard');
  
  console.log('✅ Institutional Admin Panel initialized');
  console.log('📊 Admin Database:', 'https://hphrsidciuyiejazzonl.supabase.co');
  console.log('👤 Usuario actual:', AdminState.currentUser?.name || 'Unknown');
}

// Check Authentication - Connected to Supabase API
async function checkAuthentication() {
  // Si ya está autenticado, no verificar de nuevo
  if (AdminState.authenticated && AdminState.currentUser && AdminState.currentUser.id) {
    console.log('✅ Ya autenticado, saltando verificación');
    return;
  }
  
  console.log('🔐 Verificando autenticación...');
  
  // Buscar sesión en localStorage PRIMERO (más confiable y rápido)
  let session = null;
  const adminSessionStr = localStorage.getItem('adminSession');
  const adminSessionStr2 = localStorage.getItem('admin_session');
  
  console.log('📋 localStorage.adminSession:', adminSessionStr ? '✅ Existe' : '❌ No existe');
  console.log('📋 localStorage.admin_session:', adminSessionStr2 ? '✅ Existe' : '❌ No existe');
  
  // Intentar parsear adminSession primero
  if (adminSessionStr) {
    try {
      session = JSON.parse(adminSessionStr);
      if (session && session.id) {
        console.log('✅ Sesión encontrada en adminSession:', session.email || session.name);
      } else {
        console.warn('⚠️ adminSession no tiene ID válido');
        session = null;
      }
    } catch (e) {
      console.warn('⚠️ Error parseando adminSession:', e);
      session = null;
    }
  }
  
  // Si no hay sesión, intentar con admin_session
  if (!session && adminSessionStr2) {
    try {
      const sessionData = JSON.parse(adminSessionStr2);
      // Puede estar en formato { user: {...}, role: {...} }
      session = sessionData.user || sessionData;
      if (session && session.id) {
        console.log('✅ Sesión encontrada en admin_session:', session.email || session.name);
      } else {
        console.warn('⚠️ admin_session no tiene ID válido');
        session = null;
      }
    } catch (e) {
      console.warn('⚠️ Error parseando admin_session:', e);
      session = null;
    }
  }
  
  // Si aún no hay sesión, intentar con getAdminSession (puede estar en memoria)
  if (!session && typeof getAdminSession === 'function') {
    try {
      session = getAdminSession();
      if (session && session.id) {
        console.log('✅ Sesión encontrada desde getAdminSession:', session.email || session.name);
      }
    } catch (e) {
      console.warn('⚠️ Error en getAdminSession:', e);
    }
  }
  
  // Si tenemos sesión válida, configurar AdminState
  if (session && session.id) {
    console.log('✅ Sesión válida encontrada:', session.email || session.name);
    console.log('📋 Datos de sesión:', {
      id: session.id,
      email: session.email,
      name: session.name,
      role: session.role,
      role_id: session.role_id
    });
    
    AdminState.currentUser = {
      id: session.id,
      email: session.email,
      name: session.name || session.display_name || session.email?.split('@')[0] || 'Admin',
      avatar: session.avatar || session.avatar_url
    };
    
    // Map role from session to AdminState
    if (session.role_id || session.role) {
      AdminState.currentRole = {
        id: session.role_id || session.role,
        name: typeof session.role === 'string' ? session.role : (session.role?.name || 'viewer')
      };
    } else {
      AdminState.currentRole = {
        id: 'viewer',
        name: 'Viewer'
      };
    }
    
    // Update UI with user info
    updateUserInfo();
    
    // Load permissions
    loadPermissions();
    
    console.log('✅ Usuario autenticado exitosamente:', AdminState.currentUser.name);
    console.log('👤 Rol:', AdminState.currentRole.name);
    console.log('✅ checkAuthentication completado - NO redirigiendo');
    
    // Marcar como autenticado para evitar verificaciones posteriores
    AdminState.authenticated = true;
    console.log('🔒 Flag authenticated establecido en true');
    
    return; // Exit successfully - NO redirect
  }
  
  // NO HAY SESIÓN VÁLIDA - Redirigir a login
  console.log('❌ No se encontró sesión válida en localStorage');
  console.log('📋 Última verificación de localStorage:');
  console.log('  - adminSession:', localStorage.getItem('adminSession') ? 'Existe' : 'No existe');
  console.log('  - admin_session:', localStorage.getItem('admin_session') ? 'Existe' : 'No existe');
  
  // Debug: mostrar contenido de localStorage
  try {
    const adminSessionDebug = localStorage.getItem('adminSession');
    const adminSession2Debug = localStorage.getItem('admin_session');
    if (adminSessionDebug) {
      console.log('📋 Contenido adminSession (primeros 200 chars):', adminSessionDebug.substring(0, 200));
    }
    if (adminSession2Debug) {
      console.log('📋 Contenido admin_session (primeros 200 chars):', adminSession2Debug.substring(0, 200));
    }
  } catch (e) {
    console.error('Error leyendo localStorage para debug:', e);
  }
  
  // SOLO redirigir si realmente no hay NADA en localStorage
  console.log('🔄 Redirigiendo a login (no hay sesión válida)...');
  window.location.href = 'login.html';
}

// Update User Info in UI
function updateUserInfo() {
  const user = AdminState.currentUser;
  const role = AdminState.currentRole;
  
  // Update sidebar user info
  const userNameEl = document.getElementById('currentUserName');
  const userRoleEl = document.getElementById('currentUserRole');
  
  if (userNameEl) userNameEl.textContent = user?.name || user?.email || 'User';
  if (userRoleEl) userRoleEl.textContent = role?.name || 'No Role';
  
  // Update header user menu
  const userMenuName = document.getElementById('userMenuName');
  const userMenuRole = document.getElementById('userMenuRole');
  
  if (userMenuName) userMenuName.textContent = user?.name || user?.email || 'User';
  if (userMenuRole) userMenuRole.textContent = role?.name || 'No Role';
}

// Load Permissions
function loadPermissions() {
  const role = AdminState.currentRole;
  if (!role) {
    AdminState.permissions = [];
    return;
  }
  
  // Get role definition
  const roleDef = ROLES[role.id?.toUpperCase()] || ROLES.VIEWER;
  AdminState.permissions = roleDef.permissions;
  
  console.log('📋 Loaded permissions:', AdminState.permissions);
}

// Apply Permissions to UI
function applyPermissions() {
  // Hide/show navigation items based on permissions
  const navItems = document.querySelectorAll('[data-permission]');
  navItems.forEach(item => {
    const permission = item.getAttribute('data-permission');
    if (!hasPermission(permission)) {
      item.style.display = 'none';
    } else {
      item.style.display = '';
    }
  });
  
  // Hide/show sections based on permission groups
  const sections = document.querySelectorAll('[data-permission-group]');
  sections.forEach(section => {
    const group = section.getAttribute('data-permission-group');
    const hasAnyPermission = Array.from(section.querySelectorAll('[data-permission]'))
      .some(item => hasPermission(item.getAttribute('data-permission')));
    
    if (!hasAnyPermission) {
      section.style.display = 'none';
    }
  });
  
  // Hide/show quick actions
  const quickActions = document.querySelectorAll('[data-action]');
  quickActions.forEach(action => {
    const permission = action.getAttribute('data-permission');
    if (permission && !hasPermission(permission)) {
      action.style.display = 'none';
    }
  });
}

// Check Permission
function hasPermission(permission) {
  if (!permission) return true;
  
  // Super admin has all permissions
  if (AdminState.permissions.includes('*')) {
    return true;
  }
  
  // Exact match
  if (AdminState.permissions.includes(permission)) {
    return true;
  }
  
  // Wildcard match (e.g., 'transactions.*' matches 'transactions.view')
  const parts = permission.split('.');
  if (parts.length === 2) {
    const wildcard = `${parts[0]}.*`;
    if (AdminState.permissions.includes(wildcard)) {
      return true;
    }
  }
  
  return false;
}

// Setup Event Listeners
function setupEventListeners() {
  // Sidebar toggle
  const sidebarToggle = document.getElementById('sidebarToggle');
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('adminSidebar');
  
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      sidebar?.classList.toggle('collapsed');
    });
  }
  
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      sidebar?.classList.toggle('active');
    });
  }
  
  // Notifications
  const notificationsBtn = document.getElementById('notificationsBtn');
  const notificationsPanel = document.getElementById('notificationsPanel');
  
  if (notificationsBtn) {
    notificationsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notificationsPanel?.classList.toggle('active');
    });
  }
  
  // User menu
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userMenuPanel = document.getElementById('userMenuPanel');
  
  if (userMenuBtn) {
    userMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenuPanel?.classList.toggle('active');
    });
  }
  
  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!notificationsBtn?.contains(e.target) && !notificationsPanel?.contains(e.target)) {
      notificationsPanel?.classList.remove('active');
    }
    
    if (!userMenuBtn?.contains(e.target) && !userMenuPanel?.contains(e.target)) {
      userMenuPanel?.classList.remove('active');
    }
  });
  
  // User menu actions
  const userMenuLinks = document.querySelectorAll('.user-menu-link[data-action]');
  userMenuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const action = link.getAttribute('data-action');
      handleUserMenuAction(action);
    });
  });
  
  // Quick actions
  const quickActions = document.querySelectorAll('.btn-quick-action[data-action]');
  quickActions.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      handleQuickAction(action);
    });
  });
  
  // Mark all notifications as read
  const markAllRead = document.getElementById('markAllRead');
  if (markAllRead) {
    markAllRead.addEventListener('click', () => {
      markAllNotificationsRead();
    });
  }
}

// Setup Navigation
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-module]');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      const module = item.getAttribute('data-module');
      const permission = item.getAttribute('data-permission');
      
      // Check permission
      if (permission && !hasPermission(permission)) {
        showToast('You do not have permission to access this module', 'error');
        return;
      }
      
      // Update active state
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Load module
      loadModule(module);
      
      // Close sidebar on mobile
      if (window.innerWidth <= 1024) {
        document.getElementById('adminSidebar')?.classList.remove('active');
      }
    });
  });
}

// Load Module
async function loadModule(moduleName) {
  const content = document.getElementById('adminContent');
  if (!content) {
    console.error('❌ adminContent element not found');
    return;
  }
  
  try {
    AdminState.currentModule = moduleName;
    
    // Show loading
    content.innerHTML = `
      <div class="content-loading">
        <div class="loading-spinner"></div>
        <p>Loading ${moduleName}...</p>
      </div>
    `;
    
    // Update page title
    updatePageTitle(moduleName);
    
    // Asegurar que AdminState esté disponible globalmente
    if (!window.AdminState) {
      window.AdminState = AdminState;
    }
    
    // Timeout para evitar que se quede cargando indefinidamente
    const loadTimeout = setTimeout(() => {
      console.warn(`⚠️ Timeout cargando módulo ${moduleName}`);
      content.innerHTML = `
        <div style="padding: 2rem; text-align: center;">
          <h2 style="color: var(--warning); margin-bottom: 1rem;">Timeout Loading Module</h2>
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">El módulo está tardando demasiado en cargar.</p>
          <button onclick="loadModule('dashboard')" style="padding: 0.5rem 1rem; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer;">
            Recargar Dashboard
          </button>
        </div>
      `;
    }, 10000); // 10 segundos timeout
    
    try {
      let module = null;
      
      // Para dashboard, intentar primero con versión simple
      if (moduleName === 'dashboard') {
        try {
          console.log(`📦 Intentando dashboard-simple primero...`);
          module = await import(`./modules/dashboard-simple.js`);
          console.log(`✅ Dashboard simple cargado`);
        } catch (simpleError) {
          console.log(`⚠️ Dashboard simple no disponible, usando normal`);
        }
      }
      
      // Si no se cargó, intentar módulo normal
      if (!module) {
        console.log(`📦 Importando módulo normal: ${moduleName}`);
        
        // Intentar múltiples rutas
        const paths = [
          `./modules/${moduleName}.js`,
          `js/modules/${moduleName}.js`,
          `/admin/js/modules/${moduleName}.js`
        ];
        
        let imported = false;
        for (const path of paths) {
          try {
            console.log(`🔄 Intentando: ${path}`);
            module = await import(path);
            console.log(`✅ Import exitoso desde: ${path}`);
            imported = true;
            break;
          } catch (err) {
            console.warn(`⚠️ Falló: ${path} - ${err.message}`);
          }
        }
        
        if (!imported) {
          throw new Error(`No se pudo importar ${moduleName} desde ninguna ruta`);
        }
      }
      
      clearTimeout(loadTimeout);
      
      console.log(`✅ Módulo importado. Exports:`, Object.keys(module));
      console.log(`📋 Tipo de module:`, typeof module);
      console.log(`📋 module.render:`, typeof module.render);
      
      if (!module) {
        throw new Error('Module is null or undefined');
      }
      
      if (typeof module.render !== 'function') {
        console.error(`❌ module.render no es una función. Tipo:`, typeof module.render);
        console.error(`📋 Exports disponibles:`, Object.keys(module));
        throw new Error(`Module render function not found. Available exports: ${Object.keys(module || {}).join(', ')}`);
      }
      
      console.log(`🎨 Renderizando módulo ${moduleName}...`);
      
      // Asegurar AdminState
      if (!window.AdminState) {
        window.AdminState = AdminState;
      }
      
      // Renderizar - SIMPLIFICADO
      console.log(`🔄 Llamando module.render()...`);
      const html = await module.render();
      console.log(`✅ Render completado, tipo:`, typeof html, `longitud:`, html?.length);
      
      // Validar rápidamente
      if (!html || typeof html !== 'string' || html.trim().length === 0) {
        throw new Error(`HTML inválido: tipo=${typeof html}, length=${html?.length}`);
      }
      
      // Insertar directamente
      console.log(`🔄 Insertando HTML en DOM...`);
      content.innerHTML = html;
      console.log(`✅✅✅ CONTENIDO INSERTADO EXITOSAMENTE`);
      
      // Inicializar módulo si tiene función init (NO BLOQUEAR si falla)
      if (typeof module.init === 'function') {
        console.log(`🔧 Inicializando módulo ${moduleName}...`);
        // Ejecutar init en background, no bloquear si falla
        module.init().then(() => {
          console.log(`✅ Módulo ${moduleName} inicializado correctamente`);
        }).catch((initError) => {
          console.error(`❌ Error inicializando módulo ${moduleName}:`, initError);
          console.error('Init error stack:', initError.stack);
          // No bloquear por errores de init, solo mostrar warning
          if (window.showToast) {
            window.showToast(`Algunas funciones de ${moduleName} pueden no estar disponibles`, 'warning');
          }
        });
      } else {
        console.log(`ℹ️ Módulo ${moduleName} no tiene función init()`);
      }
      
      console.log(`✅ Módulo ${moduleName} cargado y renderizado exitosamente`);
      
    } catch (error) {
      clearTimeout(loadTimeout);
      console.error(`❌ Error loading module ${moduleName}:`, error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Mostrar error detallado
      content.innerHTML = `
        <div style="padding: 2rem; text-align: center; max-width: 800px; margin: 0 auto;">
          <h2 style="color: var(--danger); margin-bottom: 1rem;">Error Loading Module</h2>
          <p style="color: var(--text-secondary); margin-bottom: 0.5rem;"><strong>Module:</strong> ${moduleName}</p>
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem;"><strong>Error:</strong> ${error.message || 'Unknown error'}</p>
          <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
            <button onclick="loadModule('dashboard')" style="padding: 0.5rem 1rem; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer;">
              Volver al Dashboard
            </button>
            <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: var(--secondary); color: white; border: none; border-radius: 8px; cursor: pointer;">
              Recargar Página
            </button>
          </div>
          <details style="margin-top: 1.5rem; text-align: left;">
            <summary style="cursor: pointer; color: var(--text-secondary); margin-bottom: 0.5rem;">Detalles técnicos</summary>
            <pre style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; overflow-x: auto; font-size: 0.85rem; text-align: left;">${error.stack || error.toString()}</pre>
          </details>
        </div>
      `;
      
      if (window.showToast) {
        window.showToast(`Error loading module: ${moduleName}`, 'error');
      }
    }
    
  } catch (error) {
    console.error('❌ Error crítico en loadModule:', error);
    if (content) {
      content.innerHTML = `
        <div style="padding: 2rem; text-align: center;">
          <h2 style="color: var(--danger);">Error Crítico</h2>
          <p>${error.message || 'Error desconocido'}</p>
          <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer;">
            Recargar Página
          </button>
        </div>
      `;
    }
  }
}

// Update Page Title
function updatePageTitle(moduleName) {
  const pageTitle = document.getElementById('pageTitle');
  if (pageTitle) {
    const titles = {
      dashboard: 'Dashboard',
      transactions: 'Transactions',
      treasury: 'Treasury',
      payments: 'Payments',
      employees: 'Employees',
      roles: 'Roles & Permissions',
      compliance: 'Compliance Center',
      audit: 'Audit Log',
      approvals: 'Approvals',
      users: 'User Management',
      content: 'Content Management',
      campaigns: 'Campaigns',
      analytics: 'Analytics',
      reports: 'Reports',
      settings: 'Settings',
      security: 'Security'
    };
    
    pageTitle.textContent = titles[moduleName] || moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  }
  
  // Update breadcrumb
  const breadcrumb = document.getElementById('breadcrumb');
  if (breadcrumb) {
    breadcrumb.innerHTML = `<span class="breadcrumb-item active">${pageTitle?.textContent || 'Dashboard'}</span>`;
  }
}

// Setup Notifications - Connected to Supabase API
function setupNotifications() {
  // Load notifications
  loadNotifications();
  
  // Setup real-time notifications using Supabase
  try {
    const client = AdminAPI.getAdminClient();
    if (client) {
      // Subscribe to notifications channel
      const channel = client
        .channel('admin-notifications')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'admin_notifications' 
          }, 
          (payload) => {
            console.log('New notification:', payload);
            if (payload.new) {
              showToast(payload.new.message, payload.new.type || 'info');
              AdminState.unreadNotifications++;
              updateNotificationBadge();
            }
          }
        )
        .subscribe();
      
      console.log('✅ Real-time notifications connected');
    }
  } catch (error) {
    console.warn('Could not setup real-time notifications:', error);
  }
}

// Load Notifications
async function loadNotifications() {
  try {
    // TODO: Load from API
    AdminState.notifications = [];
    AdminState.unreadNotifications = 0;
    updateNotificationsUI();
  } catch (error) {
    console.error('Error loading notifications:', error);
  }
}

// Update Notifications UI
function updateNotificationsUI() {
  const count = AdminState.unreadNotifications;
  const badge = document.getElementById('notificationCount');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'block' : 'none';
  }
  
  const list = document.getElementById('notificationsList');
  if (list) {
    if (AdminState.notifications.length === 0) {
      list.innerHTML = '<div class="notification-empty">No notifications</div>';
    } else {
      list.innerHTML = AdminState.notifications.map(notif => `
        <div class="notification-item ${notif.read ? '' : 'unread'}">
          <div class="notification-icon">
            <i class="fas fa-${getNotificationIcon(notif.type)}"></i>
          </div>
          <div class="notification-content">
            <div class="notification-title">${notif.title}</div>
            <div class="notification-message">${notif.message}</div>
            <div class="notification-time">${formatTime(notif.created_at)}</div>
          </div>
        </div>
      `).join('');
    }
  }
}

// Get Notification Icon
function getNotificationIcon(type) {
  const icons = {
    info: 'info-circle',
    success: 'check-circle',
    warning: 'exclamation-triangle',
    error: 'times-circle',
    approval: 'check',
    transaction: 'exchange-alt'
  };
  return icons[type] || 'bell';
}

// Format Time
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

// Mark All Notifications as Read
function markAllNotificationsRead() {
  AdminState.notifications.forEach(notif => notif.read = true);
  AdminState.unreadNotifications = 0;
  updateNotificationsUI();
}

// Handle User Menu Action
function handleUserMenuAction(action) {
  switch (action) {
    case 'profile':
      loadModule('profile');
      break;
    case 'settings':
      loadModule('settings');
      break;
    case 'security':
      loadModule('security');
      break;
    case 'help':
      showToast('Help & Support coming soon', 'info');
      break;
    case 'logout':
      handleLogout();
      break;
  }
  
  // Close menu
  document.getElementById('userMenuPanel')?.classList.remove('active');
}

// Handle Quick Action
function handleQuickAction(action) {
  switch (action) {
    case 'new-project':
      if (hasPermission('projects.create')) {
        loadModule('projects');
        // TODO: Open new project modal
        showToast('Create new project', 'info');
      } else {
        showToast('You do not have permission to create projects', 'error');
      }
      break;
    case 'new-task':
      if (hasPermission('tasks.create')) {
        loadModule('tasks');
        // TODO: Open new task modal
        showToast('Create new task', 'info');
      } else {
        showToast('You do not have permission to create tasks', 'error');
      }
      break;
    case 'new-message':
      if (hasPermission('messages.create')) {
        loadModule('messages');
        // TODO: Open new message modal
        showToast('Send new message', 'info');
      } else {
        showToast('You do not have permission to send messages', 'error');
      }
      break;
    case 'search':
      // TODO: Open global search modal
      showToast('Global search - Press Ctrl+K', 'info');
      break;
  }
}

// Handle Logout - Connected to Supabase API
async function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    try {
      // Use the existing logout function from auth.js
      if (typeof adminLogout === 'function') {
        await adminLogout();
      } else {
        // Fallback: Clear localStorage
        localStorage.removeItem('admin_session');
        localStorage.removeItem('adminSession');
        window.location.href = 'login.html';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout
      localStorage.removeItem('admin_session');
      localStorage.removeItem('adminSession');
      window.location.href = 'login.html';
    }
  }
}

// Show Toast Notification
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas fa-${getToastIcon(type)}"></i>
    </div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  container.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

// Get Toast Icon
function getToastIcon(type) {
  const icons = {
    success: 'check-circle',
    error: 'times-circle',
    warning: 'exclamation-triangle',
    info: 'info-circle'
  };
  return icons[type] || 'info-circle';
}

// API Helper Functions - Connected to Supabase Admin Database
const AdminAPI = {
  // Get Supabase client for admins (main admin database)
  getAdminClient() {
    if (typeof getAdminDbClient === 'function') {
      return getAdminDbClient();
    }
    // Fallback: create client directly
    if (window.supabase && window.supabase.createClient) {
      return window.supabase.createClient(
        'https://hphrsidciuyiejazzonl.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwaHJzaWRjaXV5aWVqYXp6b25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTg2MjIsImV4cCI6MjA4MTIzNDYyMn0.n18XN0x383ZbLo8DoxPAJDNAQ-V8Hxpa1Eg6R4I60mQ'
      );
    }
    console.error('❌ No se pudo crear cliente de Supabase para admin');
    return null;
  },
  
  // Get Supabase client with service role (for admin operations)
  getAdminServiceClient() {
    if (typeof getAdminServiceClient === 'function') {
      return getAdminServiceClient();
    }
    // Fallback: create service client directly
    if (window.supabase && window.supabase.createClient) {
      return window.supabase.createClient(
        'https://hphrsidciuyiejazzonl.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwaHJzaWRjaXV5aWVqYXp6b25sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTY1ODYyMiwiZXhwIjoyMDgxMjM0NjIyfQ.zIq2r7RKcpkXQZZo0hDUKGXXBrHo6lnpC8oFPVq_Q64'
      );
    }
    return null;
  },
  
  // Get Supabase client for users (main website database)
  getUsersClient() {
    // Main website uses different Supabase instance
    if (window.supabase && window.supabase.createClient) {
      return window.supabase.createClient(
        'https://unevdceponbnmhvpzlzf.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXZkY2Vwb25ibm1odnB6bHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTIyMTksImV4cCI6MjA3MTQ4ODIxOX0.OLHbZrezgBiXWQplN1jrGD_xkARqG2uD8ECqzo05jE4'
      );
    }
    return null;
  },
  
  // Log action to audit log
  async logAction(action, module, details = {}) {
    try {
      if (typeof logAdminAction === 'function') {
        await logAdminAction(action, module, details);
      } else {
        // Fallback: log directly to Supabase
        const client = this.getAdminClient();
        if (client) {
          const session = AdminState.currentUser;
          await client.from('admin_audit_log').insert({
            admin_id: session?.id || null,
            action: action,
            module: module,
            details: details,
            ip_address: null,
            created_at: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error logging action:', error);
    }
  },
  
  // Check if user has permission
  hasPermission(permission) {
    return hasPermission(permission);
  },
  
  // Test connection to admin database
  async testConnection() {
    try {
      const client = this.getAdminClient();
      if (!client) {
        throw new Error('No se pudo crear cliente de Supabase');
      }
      
      // Test query
      const { data, error } = await client
        .from('admins')
        .select('count')
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      console.log('✅ Conexión exitosa a base de datos de admin');
      return true;
    } catch (error) {
      console.error('❌ Error conectando a base de datos de admin:', error);
      return false;
    }
  }
};

// Export for use in modules - Asegurar que estén disponibles
window.AdminState = AdminState;
window.AdminAPI = AdminAPI;
window.hasPermission = hasPermission;
window.showToast = showToast;
window.loadModule = loadModule;

// Log para verificar que todo está disponible
console.log('✅ Funciones globales expuestas para módulos:', {
  AdminState: !!window.AdminState,
  AdminAPI: !!window.AdminAPI,
  hasPermission: !!window.hasPermission,
  showToast: !!window.showToast,
  loadModule: !!window.loadModule
});

