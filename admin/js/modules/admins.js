/**
 * RSC CHAIN - ADMIN PANEL - GESTIÓN DE ADMINISTRADORES
 * Conecta con la base de datos de admins para gestionar usuarios admin
 */

// Configuración Supabase ADMINS
const ADMINS_DB_URL = 'https://hphrsidciuyiejazzonl.supabase.co';
const ADMINS_DB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwaHJzaWRjaXV5aWVqYXp6b25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTg2MjIsImV4cCI6MjA4MTIzNDYyMn0.n18XN0x383ZbLo8DoxPAJDNAQ-V8Hxpa1Eg6R4I60mQ';

let adminsClient = null;
let adminsList = [];
let rolesList = [];

// Crear cliente
function getAdminsClient() {
  if (adminsClient) return adminsClient;
  if (window.supabase && window.supabase.createClient) {
    adminsClient = window.supabase.createClient(ADMINS_DB_URL, ADMINS_DB_KEY);
  }
  return adminsClient;
}

// Función principal
async function loadAdminsModule() {
  console.log('👥 Loading Administrators module...');
  
  const container = document.getElementById('adminContent');
  container.innerHTML = getAdminsTemplate();
  ensureAdminFormListener();
  
  // Initialize with predefined roles first (guarantees we always have roles)
  if (rolesList.length === 0) {
    rolesList = [...ROLES_PREDEFINIDOS];
    console.log('📋 Predefined roles loaded:', rolesList.length);
  }
  
  // Luego intentar cargar desde la DB
  await Promise.all([
    cargarRoles(),
    cargarAdmins()
  ]);
}

// Roles predefinidos (fallback si no hay DB)
const ROLES_PREDEFINIDOS = [
  { id: 1, name: 'super_admin', description: 'Full access to every module', permissions: ['all'] },
  { id: 2, name: 'content_manager', description: 'Manage content and announcements', permissions: ['content', 'announcements', 'campaigns'] },
  { id: 3, name: 'user_manager', description: 'Manage users and support', permissions: ['users', 'support', 'rewards'] },
  { id: 4, name: 'metrics_manager', description: 'Manage metrics and events', permissions: ['metrics', 'events', 'social'] },
  { id: 5, name: 'finance_manager', description: 'Manage treasury and payments', permissions: ['treasury', 'payments', 'rewards'] },
  { id: 6, name: 'viewer', description: 'Read-only - Dashboard and reports', permissions: ['dashboard', 'reports'] }
];

// Cargar roles desde DB
async function cargarRoles() {
  const client = getAdminsClient();
  
  // If there is no client, use predefined roles
  if (!client) {
    console.log('⚠️ No DB connection, using predefined roles');
    rolesList = ROLES_PREDEFINIDOS;
    renderRolesTable();
    return;
  }
  
  try {
    const { data, error } = await client
      .from('admin_roles')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error loading roles from DB:', error);
      // Use predefined roles as fallback
      rolesList = ROLES_PREDEFINIDOS;
    } else {
      rolesList = (data && data.length > 0) ? data : ROLES_PREDEFINIDOS;
    }
    
    console.log('✅ Roles loaded:', rolesList.length);
    renderRolesTable();
    
  } catch (error) {
    console.error('Error loading roles:', error);
    // Use predefined roles as fallback
    rolesList = ROLES_PREDEFINIDOS;
    renderRolesTable();
  }
}

// Cargar admins desde DB
async function cargarAdmins() {
  const client = getAdminsClient();
  if (!client) return;
  
  const tbody = document.getElementById('adminsTableBody');
  tbody.innerHTML = `
    <tr><td colspan="6" style="text-align:center;padding:2rem;">
      <i class="fas fa-spinner fa-spin"></i> Loading administrators...
    </td></tr>
  `;
  
  try {
    // Usar la vista admin_list que no muestra password_hash
    const { data, error } = await client
      .from('admin_list')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      // Si la vista no existe, intentar con la tabla directa
      console.log('Vista no disponible, usando tabla directa...');
      const { data: directData, error: directError } = await client
        .from('admins')
        .select(`
          id,
          email,
          display_name,
          role_id,
          is_active,
          last_login,
          login_count,
          created_at,
          admin_roles (
            name,
            permissions
          )
        `)
        .order('created_at', { ascending: false });
      
      if (directError) throw directError;
      
      adminsList = (directData || []).map(a => ({
        ...a,
        role_name: a.admin_roles?.name || 'No role',
        permissions: a.admin_roles?.permissions || []
      }));
    } else {
      adminsList = data || [];
    }
    
    console.log('✅ Admins cargados:', adminsList.length);
    renderAdminsTable();
    
  } catch (error) {
    console.error('Error cargando admins:', error);
    tbody.innerHTML = `
      <tr><td colspan="6" style="text-align:center;color:#ef4444;padding:2rem;">
        <i class="fas fa-exclamation-triangle"></i> Error: ${error.message}
        <br><br>
        <button onclick="cargarAdmins()" style="padding:8px 16px;background:#3b82f6;border:none;border-radius:8px;color:#fff;cursor:pointer;">
          Retry
        </button>
      </td></tr>
    `;
  }
}

// Renderizar tabla de admins
function renderAdminsTable() {
  const tbody = document.getElementById('adminsTableBody');
  
  if (adminsList.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="6" style="text-align:center;padding:2rem;color:#888;">
        No administrators found
      </td></tr>
    `;
    return;
  }
  
  tbody.innerHTML = adminsList.map(admin => {
    const initials = getInitials(admin.display_name || admin.email);
    const roleName = admin.role_name || getRoleName(admin.role_id);
    const roleColor = getRoleColor(roleName);
    const lastLogin = admin.last_login ? formatTimeAgo(admin.last_login) : 'Never';
    
    return `
      <tr data-id="${admin.id}">
        <td>
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <div class="admin-avatar" style="background:${roleColor}20;color:${roleColor};">
              ${initials}
            </div>
            <div>
              <div style="font-weight:600;color:#fff;">${admin.display_name || 'No name'}</div>
              <div style="font-size:0.8rem;color:#888;">${admin.email}</div>
            </div>
          </div>
        </td>
        <td><span class="role-badge" style="background:${roleColor}20;color:${roleColor};">${roleName}</span></td>
        <td style="color:#888;">${lastLogin}</td>
        <td>
          <span class="status-badge ${admin.is_active ? 'active' : 'inactive'}">
            ${admin.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button onclick="editarAdmin('${admin.id}')" class="btn-action" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="cambiarPasswordAdmin('${admin.id}')" class="btn-action" title="Change password">
              <i class="fas fa-key"></i>
            </button>
            ${admin.is_active ? 
              `<button onclick="toggleAdminEstado('${admin.id}', false)" class="btn-action danger" title="Suspend">
                <i class="fas fa-ban"></i>
              </button>` :
              `<button onclick="toggleAdminEstado('${admin.id}', true)" class="btn-action success" title="Activate">
                <i class="fas fa-check"></i>
              </button>`
            }
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Renderizar tabla de roles
function renderRolesTable() {
  const tbody = document.getElementById('rolesTableBody');
  
  if (rolesList.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="5" style="text-align:center;padding:2rem;color:#888;">
        No roles defined
      </td></tr>
    `;
    return;
  }
  
  tbody.innerHTML = rolesList.map(role => {
    const adminCount = adminsList.filter(a => a.role_id === role.id || a.role_name === role.name).length;
    const permissions = Array.isArray(role.permissions) ? role.permissions : [];
    const permLabel = permissions.includes('all') ? 'All' : 'Limited';
    const permColor = permissions.includes('all') ? '#00ff88' : '#3b82f6';
    
    return `
      <tr>
        <td><span class="role-badge" style="background:${getRoleColor(role.name)}20;color:${getRoleColor(role.name)};">${role.name}</span></td>
        <td style="color:#ccc;">${role.description || '-'}</td>
        <td style="text-align:center;">${adminCount}</td>
        <td><span style="background:${permColor}20;color:${permColor};padding:4px 12px;border-radius:20px;font-size:0.8rem;">${permLabel}</span></td>
        <td>
          <div class="action-buttons">
            <button onclick="verPermisos(${role.id})" class="btn-action" title="View permissions">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Mostrar modal de nuevo admin
async function mostrarModalNuevoAdmin() {
  const modal = document.getElementById('adminModal');
  const form = document.getElementById('adminForm');
  const title = document.getElementById('modalTitle');
  
  title.textContent = 'New Administrator';
  form.reset();
  form.dataset.mode = 'create';
  form.dataset.adminId = '';
  
  // Show and fill Role field for new admin
  document.getElementById('roleGroup').style.display = 'block';
  document.getElementById('adminRole').required = true;
  document.getElementById('adminRole').innerHTML = `
    <option value="">-- Select Role --</option>
    <option value="1">Super Admin</option>
    <option value="2">Content Manager</option>
    <option value="3">User Manager</option>
    <option value="4">Metrics Manager</option>
    <option value="5">Finance Manager</option>
    <option value="6">Viewer</option>
  `;
  
  // Mostrar campo de contraseña para nuevo admin
  document.getElementById('passwordGroup').style.display = 'block';
  document.getElementById('adminPassword').required = true;
  
  modal.style.display = 'flex';
  
  // Asegurar que el formulario tenga el listener
  setTimeout(() => ensureAdminFormListener(), 100);
}

// Formatear nombre de rol para mostrar
function formatRoleName(name) {
  const names = {
    'super_admin': 'Super Admin',
    'content_manager': 'Content Manager',
    'user_manager': 'User Manager',
    'metrics_manager': 'Metrics Manager',
    'finance_manager': 'Finance Manager',
    'viewer': 'Viewer'
  };
  return names[name] || name;
}

// Editar admin
async function editarAdmin(adminId) {
  const admin = adminsList.find(a => a.id === adminId);
  if (!admin) {
    showAdminToast('❌ Admin no encontrado', 'error');
    return;
  }
  
  const modal = document.getElementById('adminModal');
  const form = document.getElementById('adminForm');
  const title = document.getElementById('modalTitle');
  
  title.textContent = 'Edit Administrator';
  form.dataset.mode = 'edit';
  form.dataset.adminId = adminId;
  
  document.getElementById('adminEmail').value = admin.email;
  document.getElementById('adminName').value = admin.display_name || '';
  
  // Ocultar campo de Rol en edición (el rol ya viene de la DB)
  const roleGroup = document.getElementById('roleGroup');
  const roleSelect = document.getElementById('adminRole');
  if (roleGroup) roleGroup.style.display = 'none';
  if (roleSelect) {
    roleSelect.required = false;
    roleSelect.removeAttribute('required');
  }
  
  // Ocultar campo de contraseña en edición
  document.getElementById('passwordGroup').style.display = 'none';
  document.getElementById('adminPassword').required = false;
  
  modal.style.display = 'flex';
  
  // Asegurar que el formulario tenga el listener
  setTimeout(() => ensureAdminFormListener(), 100);
}

// Asegura que el formulario tenga el listener correcto (fallback)
function ensureAdminFormListener() {
  const form = document.getElementById('adminForm');
  if (!form) return;
  // Limpia listeners previos para evitar duplicados
  form.onsubmit = (e) => {
    e.preventDefault();
    guardarAdmin(e);
    return false;
  };
  const saveBtn = form.querySelector('.btn-submit');
  if (saveBtn) {
    saveBtn.onclick = (e) => {
      e.preventDefault();
      guardarAdmin(e);
      return false;
    };
  }
  console.log('✅ Listener de formulario asegurado');
}

// Guardar admin
async function guardarAdmin(event) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }
  console.log('💾 Guardando admin...');
  
  const form = (event?.target && typeof event.target.closest === 'function')
    ? event.target.closest('form')
    : document.getElementById('adminForm');
  const mode = form.dataset.mode;
  const adminId = form.dataset.adminId;
  
  console.log('📋 Mode:', mode, 'Admin ID:', adminId);
  
  const email = document.getElementById('adminEmail').value.trim().toLowerCase();
  const displayName = document.getElementById('adminName').value.trim();
  
  if (!email) {
    showAdminToast('⚠️ Email is required', 'warning');
    return;
  }
  
  const client = getAdminsClient();
  if (!client) {
    console.error('❌ Supabase client not available');
    showAdminToast('Connection error', 'error');
    return;
  }
  
  try {
    if (mode === 'create') {
      // Get role and password only for new admin
      const roleId = parseInt(document.getElementById('adminRole').value);
      const password = document.getElementById('adminPassword').value;
      
      if (!roleId) {
        showAdminToast('⚠️ Please select a role', 'warning');
        return;
      }
      if (!password || password.length < 6) {
        showAdminToast('⚠️ Password must be at least 6 characters', 'warning');
        return;
      }
      
      // Crear nuevo admin
      const { data, error } = await client
        .from('admins')
        .insert({
          email: email,
          display_name: displayName,
          role_id: roleId,
          password_hash: password,
          is_active: true
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Hashear la contraseña
      await client.rpc('change_admin_password', {
        admin_email: email,
        new_password: password
      });
      
      showAdminToast('✅ Administrator created successfully', 'success');
      
    } else {
      // Update existing admin (only email and name, NOT the role)
      console.log('📝 Updating admin:', adminId, 'Email:', email, 'Name:', displayName);
      
      const { data, error } = await client
        .from('admins')
        .update({
          email: email,
          display_name: displayName
        })
        .eq('id', adminId)
        .select();
      
      if (error) {
        console.error('❌ Error en update:', error);
        throw error;
      }
      
      console.log('✅ Admin updated:', data);
      showAdminToast('✅ Administrator updated successfully', 'success');
    }
    
    adminsCloseModal();
    await cargarAdmins();
    
  } catch (error) {
    console.error('❌ Error saving admin:', error);
    const errorMsg = error.message || 'Unknown error';
    showAdminToast('❌ Error: ' + errorMsg, 'error');
    alert('Error: ' + errorMsg); // Fallback if toast is unavailable
  }
}

// Cambiar contraseña de admin
async function cambiarPasswordAdmin(adminId) {
  const admin = adminsList.find(a => a.id === adminId);
  if (!admin) return;
  
  const modal = document.getElementById('passwordModal');
  document.getElementById('passwordAdminEmail').textContent = admin.email;
  document.getElementById('passwordForm').dataset.adminId = adminId;
  document.getElementById('passwordForm').dataset.adminEmail = admin.email;
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
  
  modal.style.display = 'flex';
}

// Save new password
async function guardarPassword(event) {
  event.preventDefault();
  
  const form = event.target;
  const adminEmail = form.dataset.adminEmail;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (newPassword !== confirmPassword) {
    showAdminToast('❌ Passwords do not match', 'error');
    return;
  }
  
  if (newPassword.length < 6) {
    showAdminToast('❌ Password must be at least 6 characters', 'error');
    return;
  }
  
  const client = getAdminsClient();
  if (!client) {
    showAdminToast('Connection error', 'error');
    return;
  }
  
  try {
    const { data, error } = await client.rpc('change_admin_password', {
      admin_email: adminEmail,
      new_password: newPassword
    });
    
    if (error) throw error;
    
    showAdminToast('✅ Password updated successfully', 'success');
    adminsClosePasswordModal();
    
  } catch (error) {
    console.error('Error changing password:', error);
    showAdminToast('❌ Error: ' + error.message, 'error');
  }
}

// Toggle estado de admin
async function toggleAdminEstado(adminId, activar) {
  const action = activar ? 'activate' : 'suspend';
  if (!confirm(`Are you sure you want to ${action} this administrator?`)) return;
  
  const client = getAdminsClient();
  if (!client) return;
  
  try {
    const { error } = await client
      .from('admins')
      .update({ is_active: activar })
      .eq('id', adminId);
    
    if (error) throw error;
    
    showAdminToast(`✅ Administrator ${activar ? 'activated' : 'suspended'}`, 'success');
    await cargarAdmins();
    
  } catch (error) {
    console.error('Error:', error);
    showAdminToast('❌ Error: ' + error.message, 'error');
  }
}

// Ver permisos de un rol
function verPermisos(roleId) {
  const role = rolesList.find(r => r.id === roleId);
  if (!role) return;
  
  const permissions = Array.isArray(role.permissions) ? role.permissions : [];
  
  alert(`Permissions for ${role.name}:\n\n${permissions.join('\n') || 'No permissions defined'}`);
}

// Cambiar tab
function switchAdminsTab(tab) {
  document.querySelectorAll('.admins-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.admins-tab-content').forEach(content => content.classList.remove('active'));
  
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`tab-${tab}`).classList.add('active');
}

// Cerrar modales (namespaced)
function adminsCloseModal() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.style.display = 'none';
}

function adminsClosePasswordModal() {
  const modal = document.getElementById('passwordModal');
  if (modal) modal.style.display = 'none';
}

// Utilidades
function getInitials(name) {
  if (!name) return '??';
  const parts = name.split(/[@\s]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getRoleName(roleId) {
  const role = rolesList.find(r => r.id === roleId);
  return role?.name || 'No role';
}

function getRoleColor(roleName) {
  const colors = {
    'super_admin': '#8b5cf6',
    'content_manager': '#3b82f6',
    'user_manager': '#10b981',
    'metrics_manager': '#f59e0b',
    'finance_manager': '#ef4444',
    'viewer': '#6b7280'
  };
  return colors[roleName] || '#6b7280';
}

function formatTimeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US');
}

function showAdminToast(message, type = 'info') {
  if (typeof window.showToast === 'function') {
    window.showToast(message, type);
  } else {
    console.log(`[${type}] ${message}`);
  }
}

// Template
function getAdminsTemplate() {
  return `
    <style>
      .admins-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }
      .admins-header h2 {
        margin: 0;
        font-size: 1.5rem;
      }
      .admins-tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid #232937;
        padding-bottom: 0.5rem;
      }
      .admins-tab-btn {
        padding: 0.75rem 1.5rem;
        background: transparent;
        border: none;
        color: #888;
        font-size: 0.95rem;
        cursor: pointer;
        border-radius: 8px 8px 0 0;
        transition: all 0.2s;
      }
      .admins-tab-btn:hover {
        color: #fff;
        background: #1a1f2a;
      }
      .admins-tab-btn.active {
        color: #00ff88;
        background: #1a1f2a;
        border-bottom: 2px solid #00ff88;
      }
      .admins-tab-content {
        display: none;
      }
      .admins-tab-content.active {
        display: block;
      }
      .admins-table {
        width: 100%;
        border-collapse: collapse;
        background: #161a22;
        border-radius: 12px;
        overflow: hidden;
      }
      .admins-table th {
        text-align: left;
        padding: 1rem;
        background: #1a1f2a;
        color: #888;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .admins-table td {
        padding: 1rem;
        border-bottom: 1px solid #232937;
      }
      .admins-table tr:last-child td {
        border-bottom: none;
      }
      .admin-avatar {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.9rem;
      }
      .role-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
      }
      .status-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 500;
      }
      .status-badge.active {
        background: rgba(0,255,136,0.2);
        color: #00ff88;
      }
      .status-badge.inactive {
        background: rgba(239,68,68,0.2);
        color: #ef4444;
      }
      .action-buttons {
        display: flex;
        gap: 0.5rem;
      }
      .btn-action {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: none;
        background: #232937;
        color: #888;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      .btn-action:hover {
        background: #3b82f6;
        color: #fff;
      }
      .btn-action.danger:hover {
        background: #ef4444;
      }
      .btn-action.success:hover {
        background: #00ff88;
        color: #0a0a0f;
      }
      .btn-new-admin {
        padding: 0.75rem 1.5rem;
        background: linear-gradient(135deg, #00ff88, #00d673);
        border: none;
        border-radius: 10px;
        color: #0a0a0f;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .btn-new-admin:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 20px rgba(0,255,136,0.3);
      }
      
      /* Modal styles */
      .admin-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .modal-content {
        background: #161a22;
        border: 1px solid #232937;
        border-radius: 16px;
        width: 100%;
        max-width: 500px;
        padding: 2rem;
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }
      .modal-header h3 {
        margin: 0;
        font-size: 1.25rem;
      }
      .modal-close {
        background: none;
        border: none;
        color: #888;
        font-size: 1.5rem;
        cursor: pointer;
      }
      .form-group {
        margin-bottom: 1.25rem;
      }
      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: #888;
        font-size: 0.9rem;
      }
      .form-group input, .form-group select {
        width: 100%;
        padding: 0.75rem 1rem;
        background: #0f1115;
        border: 1px solid #232937;
        border-radius: 10px;
        color: #fff;
        font-size: 1rem;
        box-sizing: border-box;
      }
      .form-group input:focus, .form-group select:focus {
        outline: none;
        border-color: #00ff88;
      }
      .modal-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
      }
      .btn-cancel {
        flex: 1;
        padding: 0.75rem;
        background: #232937;
        border: none;
        border-radius: 10px;
        color: #888;
        cursor: pointer;
      }
      .btn-submit {
        flex: 1;
        padding: 0.75rem;
        background: linear-gradient(135deg, #00ff88, #00d673);
        border: none;
        border-radius: 10px;
        color: #0a0a0f;
        font-weight: 600;
        cursor: pointer;
      }
    </style>

    <div class="admins-header">
      <h2><i class="fas fa-users-cog" style="color:#8b5cf6;margin-right:0.5rem;"></i> Administrators Management</h2>
      <button class="btn-new-admin" onclick="mostrarModalNuevoAdmin()">
        <i class="fas fa-plus"></i> New Admin
      </button>
    </div>

    <div class="admins-tabs">
      <button class="admins-tab-btn active" data-tab="admins" onclick="switchAdminsTab('admins')">
        <i class="fas fa-user-shield"></i> Administrators
      </button>
      <button class="admins-tab-btn" data-tab="roles" onclick="switchAdminsTab('roles')">
        <i class="fas fa-key"></i> Roles
      </button>
    </div>

    <!-- Tab Administradores -->
    <div class="admins-tab-content active" id="tab-admins">
      <table class="admins-table">
        <thead>
          <tr>
            <th>Administrator</th>
            <th>Role</th>
            <th>Last Login</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="adminsTableBody">
          <tr>
            <td colspan="5" style="text-align:center;padding:2rem;">
              <i class="fas fa-spinner fa-spin"></i> Loading...
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Tab Roles -->
    <div class="admins-tab-content" id="tab-roles">
      <table class="admins-table">
        <thead>
          <tr>
            <th>Role</th>
            <th>Description</th>
            <th>Admins</th>
            <th>Permissions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="rolesTableBody">
          <tr>
            <td colspan="5" style="text-align:center;padding:2rem;">
              <i class="fas fa-spinner fa-spin"></i> Loading...
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Nuevo/Editar Admin -->
    <div class="admin-modal" id="adminModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="modalTitle">New Administrator</h3>
          <button class="modal-close" onclick="adminsCloseModal()">&times;</button>
        </div>
        <form id="adminForm" onsubmit="event.preventDefault(); guardarAdmin(event); return false;">
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="adminEmail" required placeholder="admin@rscchain.com">
          </div>
          <div class="form-group">
            <label>Name</label>
            <input type="text" id="adminName" placeholder="Full name">
          </div>
          <div class="form-group" id="roleGroup">
            <label>Role</label>
            <select id="adminRole" required>
              <option value="">Select role...</option>
            </select>
          </div>
          <div class="form-group" id="passwordGroup">
            <label>Password</label>
            <input type="password" id="adminPassword" placeholder="Minimum 6 characters" minlength="6">
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" onclick="adminsCloseModal()">Cancel</button>
            <button type="submit" class="btn-submit">Save</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Cambiar Contraseña -->
    <div class="admin-modal" id="passwordModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Change Password</h3>
          <button class="modal-close" onclick="adminsClosePasswordModal()">&times;</button>
        </div>
        <p style="color:#888;margin-bottom:1rem;">
          Change password for: <strong id="passwordAdminEmail" style="color:#00ff88;"></strong>
        </p>
        <form id="passwordForm" onsubmit="guardarPassword(event)">
          <div class="form-group">
            <label>New Password</label>
            <input type="password" id="newPassword" required placeholder="Minimum 6 characters" minlength="6">
          </div>
          <div class="form-group">
            <label>Confirm Password</label>
            <input type="password" id="confirmPassword" required placeholder="Repeat password">
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" onclick="adminsClosePasswordModal()">Cancel</button>
            <button type="submit" class="btn-submit">Change</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// Exportar funciones
window.loadAdminsModule = loadAdminsModule;
window.cargarAdmins = cargarAdmins;
window.cargarRoles = cargarRoles;
window.mostrarModalNuevoAdmin = mostrarModalNuevoAdmin;
window.editarAdmin = editarAdmin;
window.guardarAdmin = guardarAdmin;
window.cambiarPasswordAdmin = cambiarPasswordAdmin;
window.guardarPassword = guardarPassword;
window.toggleAdminEstado = toggleAdminEstado;
window.verPermisos = verPermisos;
window.switchAdminsTab = switchAdminsTab;
window.adminsCloseModal = adminsCloseModal;
window.adminsClosePasswordModal = adminsClosePasswordModal;

