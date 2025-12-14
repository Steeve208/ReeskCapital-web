/**
 * RSC CHAIN - ADMIN PANEL - AUTENTICACIÓN
 * Sistema de login para administradores
 * Base de datos separada para admins
 */

// Configuración Supabase ADMINS (base de datos separada)
const ADMIN_DB_URL = 'https://hphrsidciuyiejazzonl.supabase.co';
const ADMIN_DB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwaHJzaWRjaXV5aWVqYXp6b25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTg2MjIsImV4cCI6MjA4MTIzNDYyMn0.n18XN0x383ZbLo8DoxPAJDNAQ-V8Hxpa1Eg6R4I60mQ';

let adminDbClient = null;
let currentAdmin = null;

// Crear cliente de Supabase para admins
function getAdminDbClient() {
  if (adminDbClient) return adminDbClient;
  
  if (window.supabase && window.supabase.createClient) {
    adminDbClient = window.supabase.createClient(ADMIN_DB_URL, ADMIN_DB_KEY);
    console.log('✅ Cliente de admin DB inicializado');
  }
  return adminDbClient;
}

// Login de administrador
async function adminLogin(email, password) {
  const client = getAdminDbClient();
  if (!client) {
    throw new Error('No se pudo conectar con la base de datos');
  }
  
  try {
    console.log('🔐 Intentando login para:', email);
    
    // Buscar admin por email
    const { data: admin, error } = await client
      .from('admins')
      .select(`
        id,
        email,
        password_hash,
        display_name,
        role_id,
        is_active,
        avatar_url,
        admin_roles (
          id,
          name,
          permissions
        )
      `)
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .single();
    
    if (error || !admin) {
      console.error('❌ Admin no encontrado:', error);
      throw new Error('Invalid email or password');
    }
    
    // Verify password
    // Note: In production, use bcrypt on the server
    // For now, we verify with the Supabase function
    const { data: verification, error: verifyError } = await client
      .rpc('verify_admin_password', {
        admin_email: email.toLowerCase().trim(),
        password_input: password
      });
    
    if (verifyError) {
      console.error('❌ Error verifying password:', verifyError);
      // Fallback: simple comparison (dev only)
      // In production ALWAYS use bcrypt
      if (password !== 'admin123') { // Temporary dev password
        throw new Error('Invalid email or password');
      }
    } else if (verification && verification.length > 0 && !verification[0].is_valid) {
      throw new Error('Invalid email or password');
    }
    
    // Successful login - record
    await client.rpc('record_admin_login', { admin_email: email });
    
    // Guardar sesión
    const sessionData = {
      id: admin.id,
      email: admin.email,
      name: admin.display_name || admin.email.split('@')[0],
      role: admin.admin_roles?.name || 'viewer',
      role_id: admin.role_id,
      permissions: admin.admin_roles?.permissions || ['dashboard'],
      avatar: admin.avatar_url,
      loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('adminSession', JSON.stringify(sessionData));
    currentAdmin = sessionData;
    
    // Registrar en audit log
    await logAdminAction('login', 'auth', { email: admin.email });
    
    console.log('✅ Login exitoso:', sessionData.name);
    return sessionData;
    
  } catch (error) {
    console.error('❌ Error en login:', error);
    throw error;
  }
}

// Cerrar sesión
async function adminLogout() {
  try {
    const session = getAdminSession();
    if (session) {
      await logAdminAction('logout', 'auth', { email: session.email });
    }
    
    localStorage.removeItem('adminSession');
    currentAdmin = null;
    
    // Recargar página para mostrar login
    window.location.reload();
    
  } catch (error) {
    console.error('Error en logout:', error);
    localStorage.removeItem('adminSession');
    window.location.reload();
  }
}

// Obtener sesión actual
function getAdminSession() {
  if (currentAdmin) return currentAdmin;
  
  try {
    const stored = localStorage.getItem('adminSession');
    if (stored) {
      currentAdmin = JSON.parse(stored);
      return currentAdmin;
    }
  } catch (e) {
    console.error('Error leyendo sesión:', e);
  }
  
  return null;
}

// Verificar si está autenticado
function isAdminAuthenticated() {
  const session = getAdminSession();
  if (!session) return false;
  
  // Verificar que la sesión no tenga más de 24 horas
  const loginTime = new Date(session.loginTime);
  const now = new Date();
  const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
  
  if (hoursDiff > 24) {
    localStorage.removeItem('adminSession');
    currentAdmin = null;
    return false;
  }
  
  return true;
}

// Verificar permiso para un módulo
function hasPermission(module) {
  const session = getAdminSession();
  if (!session) return false;
  
  // Super admin tiene acceso a todo
  if (session.role === 'super_admin') return true;
  if (session.permissions && session.permissions.includes('all')) return true;
  
  // Verificar permiso específico
  if (session.permissions && session.permissions.includes(module)) return true;
  
  // Dashboard siempre permitido
  if (module === 'dashboard') return true;
  
  return false;
}

// Obtener módulos permitidos
function getAllowedModules() {
  const session = getAdminSession();
  if (!session) return ['dashboard'];
  
  if (session.role === 'super_admin' || (session.permissions && session.permissions.includes('all'))) {
    return [
      'dashboard', 'content', 'users', 'social-metrics', 
      'metrics', 'campaigns', 'rewards', 'jobs', 
      'treasury', 'admins', 'audit', 'settings'
    ];
  }
  
  // Mapeo de permisos a módulos
  const permissionToModules = {
    'content': ['content'],
    'announcements': ['content'],
    'campaigns': ['campaigns'],
    'users': ['users'],
    'support': ['users'],
    'rewards': ['rewards'],
    'metrics': ['metrics', 'social-metrics'],
    'events': ['campaigns'],
    'social': ['social-metrics'],
    'treasury': ['treasury'],
    'payments': ['treasury'],
    'dashboard': ['dashboard'],
    'reports': ['dashboard', 'audit']
  };
  
  const modules = new Set(['dashboard']);
  
  if (session.permissions) {
    session.permissions.forEach(perm => {
      if (permissionToModules[perm]) {
        permissionToModules[perm].forEach(m => modules.add(m));
      }
    });
  }
  
  return Array.from(modules);
}

// Registrar acción en audit log
async function logAdminAction(action, module, details = {}) {
  try {
    const client = getAdminDbClient();
    if (!client) return;
    
    const session = getAdminSession();
    
    await client.from('admin_audit_log').insert({
      admin_id: session?.id || null,
      action: action,
      module: module,
      details: details,
      ip_address: null // Se puede obtener del servidor
    });
    
  } catch (error) {
    console.error('Error registrando audit:', error);
  }
}

// Cambiar contraseña
async function changeAdminPassword(currentPassword, newPassword) {
  const client = getAdminDbClient();
  const session = getAdminSession();
  
  if (!client || !session) {
    throw new Error('No autenticado');
  }
  
  try {
    // Verificar contraseña actual
    const { data: verification } = await client
      .rpc('verify_admin_password', {
        admin_email: session.email,
        password_input: currentPassword
      });
    
    if (!verification || verification.length === 0 || !verification[0].is_valid) {
      throw new Error('Current password is incorrect');
    }
    
    // Cambiar contraseña
    const { data, error } = await client
      .rpc('change_admin_password', {
        admin_email: session.email,
        new_password: newPassword
      });
    
    if (error) throw error;
    
    await logAdminAction('change_password', 'auth', { email: session.email });
    
    return true;
    
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    throw error;
  }
}

// Obtener lista de admins (solo para super_admin)
async function getAdminsList() {
  const client = getAdminDbClient();
  const session = getAdminSession();
  
  if (!session || session.role !== 'super_admin') {
    throw new Error('No autorizado');
  }
  
  try {
    const { data, error } = await client
      .from('admin_list')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
    
  } catch (error) {
    console.error('Error obteniendo admins:', error);
    throw error;
  }
}

// Crear nuevo admin (solo para super_admin)
async function createAdmin(email, displayName, roleId, password) {
  const client = getAdminDbClient();
  const session = getAdminSession();
  
  if (!session || session.role !== 'super_admin') {
    throw new Error('No autorizado');
  }
  
  try {
    // Crear admin con contraseña hasheada
    const { data, error } = await client
      .from('admins')
      .insert({
        email: email.toLowerCase().trim(),
        display_name: displayName,
        role_id: roleId,
        password_hash: password, // El trigger de Supabase puede hashear
        created_by: session.id
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Hashear la contraseña usando la función
    await client.rpc('change_admin_password', {
      admin_email: email.toLowerCase().trim(),
      new_password: password
    });
    
    await logAdminAction('create_admin', 'admins', { 
      new_admin_email: email,
      role_id: roleId 
    });
    
    return data;
    
  } catch (error) {
    console.error('Error creando admin:', error);
    throw error;
  }
}

// Actualizar rol de admin (solo para super_admin)
async function updateAdminRole(adminId, newRoleId) {
  const client = getAdminDbClient();
  const session = getAdminSession();
  
  if (!session || session.role !== 'super_admin') {
    throw new Error('No autorizado');
  }
  
  try {
    const { data, error } = await client
      .from('admins')
      .update({ role_id: newRoleId })
      .eq('id', adminId)
      .select()
      .single();
    
    if (error) throw error;
    
    await logAdminAction('update_admin_role', 'admins', { 
      admin_id: adminId,
      new_role_id: newRoleId 
    });
    
    return data;
    
  } catch (error) {
    console.error('Error actualizando rol:', error);
    throw error;
  }
}

// Suspender/activar admin (solo para super_admin)
async function toggleAdminStatus(adminId, isActive) {
  const client = getAdminDbClient();
  const session = getAdminSession();
  
  if (!session || session.role !== 'super_admin') {
    throw new Error('No autorizado');
  }
  
  // No permitir auto-suspensión
  if (adminId === session.id) {
    throw new Error('No puedes suspenderte a ti mismo');
  }
  
  try {
    const { data, error } = await client
      .from('admins')
      .update({ is_active: isActive })
      .eq('id', adminId)
      .select()
      .single();
    
    if (error) throw error;
    
    await logAdminAction(isActive ? 'activate_admin' : 'suspend_admin', 'admins', { 
      admin_id: adminId 
    });
    
    return data;
    
  } catch (error) {
    console.error('Error cambiando estado:', error);
    throw error;
  }
}

// Obtener roles disponibles
async function getAdminRoles() {
  const client = getAdminDbClient();
  
  try {
    const { data, error } = await client
      .from('admin_roles')
      .select('*')
      .order('id');
    
    if (error) throw error;
    return data || [];
    
  } catch (error) {
    console.error('Error obteniendo roles:', error);
    return [];
  }
}

// Exportar funciones
window.adminLogin = adminLogin;
window.adminLogout = adminLogout;
window.getAdminSession = getAdminSession;
window.isAdminAuthenticated = isAdminAuthenticated;
window.hasPermission = hasPermission;
window.getAllowedModules = getAllowedModules;
window.logAdminAction = logAdminAction;
window.changeAdminPassword = changeAdminPassword;
window.getAdminsList = getAdminsList;
window.createAdmin = createAdmin;
window.updateAdminRole = updateAdminRole;
window.toggleAdminStatus = toggleAdminStatus;
window.getAdminRoles = getAdminRoles;
window.getAdminDbClient = getAdminDbClient;

