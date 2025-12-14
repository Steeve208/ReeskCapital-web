/**
 * RSC CHAIN - ADMIN PANEL - USERS MODULE
 * Simplified version based on test-supabase.html
 */

// Configuración Supabase
const USERS_SUPABASE_URL = 'https://unevdceponbnmhvpzlzf.supabase.co';
const USERS_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXZkY2Vwb25ibm1odnB6bHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTIyMTksImV4cCI6MjA3MTQ4ODIxOX0.OLHbZrezgBiXWQplN1jrGD_xkARqG2uD8ECqzo05jE4';

// Variables
let supabaseClient = null;
let paginaActual = 1;
let porPagina = 25;
let totalUsuarios = 0;

// Crear cliente (igual que el test)
function crearCliente() {
  if (supabaseClient) return supabaseClient;
  
  if (!window.supabase || !window.supabase.createClient) {
    console.error('Supabase library not loaded');
    return null;
  }
  
  supabaseClient = window.supabase.createClient(USERS_SUPABASE_URL, USERS_SUPABASE_KEY);
  console.log('✅ Cliente Supabase creado');
  return supabaseClient;
}

// Función principal
async function loadUsers() {
  console.log('=== LOADING USERS MODULE ===');
  
  const container = document.getElementById('adminContent');
  container.innerHTML = getUsersTemplate();
  
  // Crear cliente
  const client = crearCliente();
  if (!client) {
    mostrarError('Could not create Supabase client');
    return;
  }
  
  // Cargar datos
  await cargarDatos();
}

// Cargar datos de Supabase
async function cargarDatos() {
  const client = crearCliente();
  if (!client) return;
  
  const tbody = document.getElementById('tablaUsuarios');
  
  try {
    // 1. Count total
    console.log('Obteniendo count...');
    const { count, error: errCount } = await client
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (errCount) throw errCount;
    
    totalUsuarios = count || 0;
    console.log('Total users:', totalUsuarios);
    
    // Actualizar stats
    document.getElementById('statTotal').textContent = totalUsuarios.toLocaleString('en-US');
    document.getElementById('statActivos').textContent = totalUsuarios.toLocaleString('en-US');
    
    // 2. Obtener usuarios de la página actual
    const desde = (paginaActual - 1) * porPagina;
    console.log(`Loading page ${paginaActual}, from: ${desde}`);
    
    const { data: usuarios, error } = await client
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .range(desde, desde + porPagina - 1);
    
    if (error) throw error;
    
    console.log(`✅ ${usuarios.length} usuarios obtenidos`);
    
    // 3. Renderizar tabla
    renderizarTabla(usuarios);
    
    // 4. Actualizar paginación
    actualizarPaginacion();
    
    // 5. Calcular nuevos (7 días)
    const hace7dias = new Date();
    hace7dias.setDate(hace7dias.getDate() - 7);
    
    const { count: nuevos } = await client
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', hace7dias.toISOString());
    
    document.getElementById('statNuevos').textContent = (nuevos || 0).toLocaleString('en-US');
    
    // 6. Calcular balance total (solo top 1000 para rendimiento)
    try {
      const { data: balances } = await client
        .from('users')
        .select('balance')
        .order('balance', { ascending: false })
        .limit(1000);
      
      if (balances) {
        const total = balances.reduce((sum, u) => sum + parseFloat(u.balance || 0), 0);
    document.getElementById('statBalance').textContent = total.toLocaleString('en-US', {maximumFractionDigits: 2}) + ' RSC';
      }
    } catch (e) {
      console.log('Error calculating balance:', e);
    }
    
    // Toast de éxito
    usersShowToast('✅ Users loaded successfully');
    
  } catch (err) {
    console.error('Error:', err);
    mostrarError(err.message || 'Unknown error');
  }
}

// Renderizar tabla de usuarios
function renderizarTabla(usuarios) {
  const tbody = document.getElementById('tablaUsuarios');
  
  if (!usuarios || usuarios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#888;">No users found</td></tr>';
    return;
  }
  
  let filas = '';
  
  for (const u of usuarios) {
    const nombre = u.username || (u.email ? u.email.split('@')[0] : 'Sin nombre');
    const iniciales = nombre.substring(0, 2).toUpperCase();
    const email = u.email || 'N/A';
    const balance = parseFloat(u.balance || 0).toFixed(2);
    const fecha = u.created_at ? new Date(u.created_at).toLocaleDateString('en-US') : 'N/A';
    
    filas += `
      <tr style="border-bottom:1px solid #232937;">
        <td style="padding:16px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:32px;height:32px;background:linear-gradient(135deg,#00ff88,#3b82f6);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;">${iniciales}</div>
            <span>${nombre}</span>
          </div>
        </td>
        <td style="padding:16px;">${email}</td>
        <td style="padding:16px;color:#00ff88;font-weight:600;">${balance} RSC</td>
        <td style="padding:16px;">${fecha}</td>
        <td style="padding:16px;">
          <button onclick="verUsuario('${u.id}')" style="padding:6px 12px;background:#3b82f6;border:none;border-radius:6px;color:white;cursor:pointer;margin-right:4px;">
            <i class="fas fa-eye"></i>
          </button>
          <button onclick="editarBalance('${u.id}')" style="padding:6px 12px;background:#00ff88;border:none;border-radius:6px;color:#0a0a0f;cursor:pointer;">
            <i class="fas fa-coins"></i>
          </button>
        </td>
      </tr>
    `;
  }
  
  tbody.innerHTML = filas;
}

// Ver detalles de usuario - Modal profesional
async function verUsuario(id) {
  const client = crearCliente();
  if (!client) return;
  
  // Mostrar loading en modal
  usersShowModal(`
    <div style="text-align:center;padding:2rem;">
      <i class="fas fa-spinner fa-spin" style="font-size:2rem;color:#00ff88;"></i>
      <p style="margin-top:1rem;color:#888;">Loading user...</p>
    </div>
  `);
  
  try {
    const { data: user, error } = await client
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    const nombre = user.username || user.email?.split('@')[0] || 'User';
    const iniciales = nombre.substring(0, 2).toUpperCase();
    const balance = parseFloat(user.balance || 0).toFixed(2);
    const fechaRegistro = user.created_at ? new Date(user.created_at).toLocaleString('en-US') : 'N/A';
    const fechaUpdate = user.updated_at ? new Date(user.updated_at).toLocaleString('en-US') : 'N/A';
    
    usersShowModal(`
      <div style="padding:1.5rem;">
        <!-- Header -->
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1px solid #232937;">
          <div style="width:60px;height:60px;background:linear-gradient(135deg,#00ff88,#3b82f6);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:bold;">
            ${iniciales}
          </div>
          <div>
            <h3 style="margin:0;font-size:1.25rem;color:#fff;">${nombre}</h3>
            <p style="margin:0.25rem 0 0;color:#888;font-size:0.875rem;">${user.email || 'No email'}</p>
          </div>
        </div>
        
        <!-- Info Grid -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:2rem;">
          <div style="background:#0f1115;padding:1rem;border-radius:10px;">
            <p style="margin:0;color:#888;font-size:0.75rem;text-transform:uppercase;">Balance</p>
            <p style="margin:0.5rem 0 0;color:#00ff88;font-size:1.5rem;font-weight:700;">${balance} RSC</p>
          </div>
          <div style="background:#0f1115;padding:1rem;border-radius:10px;">
            <p style="margin:0;color:#888;font-size:0.75rem;text-transform:uppercase;">Referral Code</p>
            <p style="margin:0.5rem 0 0;color:#fff;font-size:1rem;font-weight:600;">${user.referral_code || 'N/A'}</p>
          </div>
        </div>
        
        <!-- Details -->
        <div style="background:#0f1115;padding:1rem;border-radius:10px;margin-bottom:2rem;">
          <div style="display:flex;justify-content:space-between;padding:0.75rem 0;border-bottom:1px solid #232937;">
            <span style="color:#888;">ID</span>
            <span style="color:#fff;font-family:monospace;font-size:0.75rem;">${user.id}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:0.75rem 0;border-bottom:1px solid #232937;">
            <span style="color:#888;">Username</span>
            <span style="color:#fff;">${user.username || 'N/A'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:0.75rem 0;border-bottom:1px solid #232937;">
            <span style="color:#888;">Referred By</span>
            <span style="color:#fff;">${user.referred_by || 'None'}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:0.75rem 0;border-bottom:1px solid #232937;">
            <span style="color:#888;">Registered</span>
            <span style="color:#fff;">${fechaRegistro}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:0.75rem 0;">
            <span style="color:#888;">Last update</span>
            <span style="color:#fff;">${fechaUpdate}</span>
          </div>
        </div>
        
        <!-- Actions -->
        <div style="display:flex;gap:1rem;">
          <button onclick="editarBalance('${user.id}')" style="flex:1;padding:12px;background:#00ff88;border:none;border-radius:10px;color:#0a0a0f;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
            <i class="fas fa-coins"></i> Edit Balance
          </button>
          <button onclick="darPremio('${user.id}')" style="flex:1;padding:12px;background:#3b82f6;border:none;border-radius:10px;color:#fff;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
            <i class="fas fa-gift"></i> Give Reward
          </button>
          <button onclick="usersCloseModal()" style="padding:12px 20px;background:#232937;border:none;border-radius:10px;color:#888;cursor:pointer;">
            Close
          </button>
        </div>
      </div>
    `);
    
  } catch (err) {
    usersShowModal(`
      <div style="text-align:center;padding:2rem;">
        <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:#ff5555;"></i>
        <p style="margin-top:1rem;color:#ff5555;">Error loading user</p>
        <p style="color:#888;">${err.message}</p>
        <button onclick="usersCloseModal()" style="margin-top:1rem;padding:10px 20px;background:#232937;border:none;border-radius:8px;color:#888;cursor:pointer;">
          Close
        </button>
      </div>
    `);
  }
}

// Editar balance - Modal profesional
async function editarBalance(id) {
  const client = crearCliente();
  if (!client) return;
  
  // Obtener datos actuales
  try {
    const { data: user, error } = await client
      .from('users')
      .select('username, email, balance')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    const nombre = user.username || user.email?.split('@')[0] || 'User';
    const balanceActual = parseFloat(user.balance || 0).toFixed(2);
    
    usersShowModal(`
      <div style="padding:1.5rem;">
        <h3 style="margin:0 0 1.5rem;color:#fff;display:flex;align-items:center;gap:10px;">
          <i class="fas fa-coins" style="color:#00ff88;"></i>
          Edit Balance
        </h3>
        
        <div style="background:#0f1115;padding:1rem;border-radius:10px;margin-bottom:1.5rem;">
          <p style="margin:0;color:#888;font-size:0.875rem;">User: <strong style="color:#fff;">${nombre}</strong></p>
          <p style="margin:0.5rem 0 0;color:#888;font-size:0.875rem;">Current balance: <strong style="color:#00ff88;">${balanceActual} RSC</strong></p>
        </div>
        
        <div style="margin-bottom:1.5rem;">
          <label style="display:block;color:#888;font-size:0.875rem;margin-bottom:0.5rem;">New Balance (RSC)</label>
          <input type="number" id="inputNuevoBalance" value="${balanceActual}" step="0.01" min="0"
            style="width:100%;padding:12px 16px;background:#0f1115;border:1px solid #232937;border-radius:10px;color:#fff;font-size:1.25rem;font-weight:600;box-sizing:border-box;">
        </div>
        
        <div style="display:flex;gap:1rem;">
          <button onclick="confirmarCambioBalance('${id}')" style="flex:1;padding:12px;background:#00ff88;border:none;border-radius:10px;color:#0a0a0f;font-weight:600;cursor:pointer;">
            <i class="fas fa-check"></i> Save Changes
          </button>
          <button onclick="usersCloseModal()" style="padding:12px 20px;background:#232937;border:none;border-radius:10px;color:#888;cursor:pointer;">
            Cancel
          </button>
        </div>
      </div>
    `);
    
  } catch (err) {
    usersShowToast('Error: ' + err.message);
  }
}

// Confirmar cambio de balance
async function confirmarCambioBalance(id) {
  const input = document.getElementById('inputNuevoBalance');
  const nuevoBalance = parseFloat(input.value);
  
  if (isNaN(nuevoBalance) || nuevoBalance < 0) {
    usersShowToast('⚠️ Invalid balance');
    return;
  }
  
  const client = crearCliente();
  if (!client) return;
  
  try {
    const { error } = await client
      .from('users')
      .update({ balance: nuevoBalance })
      .eq('id', id);
    
    if (error) throw error;
    
    usersCloseModal();
    usersShowToast('✅ Balance updated to ' + nuevoBalance.toFixed(2) + ' RSC');
    await cargarDatos();
    
  } catch (err) {
    usersShowToast('❌ Error: ' + err.message);
  }
}

// Dar premio a usuario
async function darPremio(id) {
  const client = crearCliente();
  if (!client) return;
  
  try {
    const { data: user, error } = await client
      .from('users')
      .select('username, email, balance')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    const nombre = user.username || user.email?.split('@')[0] || 'User';
    const balanceActual = parseFloat(user.balance || 0).toFixed(2);
    
    usersShowModal(`
      <div style="padding:1.5rem;">
        <h3 style="margin:0 0 1.5rem;color:#fff;display:flex;align-items:center;gap:10px;">
          <i class="fas fa-gift" style="color:#3b82f6;"></i>
          Give Reward
        </h3>
        
        <div style="background:#0f1115;padding:1rem;border-radius:10px;margin-bottom:1.5rem;">
          <p style="margin:0;color:#888;font-size:0.875rem;">User: <strong style="color:#fff;">${nombre}</strong></p>
          <p style="margin:0.5rem 0 0;color:#888;font-size:0.875rem;">Current balance: <strong style="color:#00ff88;">${balanceActual} RSC</strong></p>
        </div>
        
        <div style="margin-bottom:1rem;">
          <label style="display:block;color:#888;font-size:0.875rem;margin-bottom:0.5rem;">Amount to add (RSC)</label>
          <input type="number" id="inputPremio" value="100" step="0.01" min="0.01"
            style="width:100%;padding:12px 16px;background:#0f1115;border:1px solid #232937;border-radius:10px;color:#fff;font-size:1.25rem;font-weight:600;box-sizing:border-box;">
        </div>
        
        <div style="margin-bottom:1.5rem;">
          <label style="display:block;color:#888;font-size:0.875rem;margin-bottom:0.5rem;">Reason (optional)</label>
          <input type="text" id="inputRazon" placeholder="E.g.: Event reward, Compensation..."
            style="width:100%;padding:12px 16px;background:#0f1115;border:1px solid #232937;border-radius:10px;color:#fff;box-sizing:border-box;">
        </div>
        
        <div style="display:flex;gap:1rem;">
          <button onclick="confirmarPremio('${id}', ${user.balance || 0})" style="flex:1;padding:12px;background:#3b82f6;border:none;border-radius:10px;color:#fff;font-weight:600;cursor:pointer;">
            <i class="fas fa-gift"></i> Give Reward
          </button>
          <button onclick="usersCloseModal()" style="padding:12px 20px;background:#232937;border:none;border-radius:10px;color:#888;cursor:pointer;">
            Cancel
          </button>
        </div>
      </div>
    `);
    
  } catch (err) {
    usersShowToast('Error: ' + err.message);
  }
}

// Confirmar premio
async function confirmarPremio(id, balanceActual) {
  const inputPremio = document.getElementById('inputPremio');
  const inputRazon = document.getElementById('inputRazon');
  
  const premio = parseFloat(inputPremio.value);
  const razon = inputRazon.value || 'Manual reward';
  
  if (isNaN(premio) || premio <= 0) {
    usersShowToast('⚠️ Invalid amount');
    return;
  }
  
  const nuevoBalance = parseFloat(balanceActual) + premio;
  
  const client = crearCliente();
  if (!client) return;
  
  try {
    const { error } = await client
      .from('users')
      .update({ balance: nuevoBalance })
      .eq('id', id);
    
    if (error) throw error;
    
    usersCloseModal();
    usersShowToast(`🎉 Reward of ${premio.toFixed(2)} RSC granted! New balance: ${nuevoBalance.toFixed(2)} RSC`);
    await cargarDatos();
    
  } catch (err) {
    usersShowToast('❌ Error: ' + err.message);
  }
}

// Show modal (namespaced)
function usersShowModal(contenido) {
  // Remover modal existente si hay
  usersCloseModal();
  
  const modal = document.createElement('div');
  modal.id = 'userModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(5px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  `;
  modal.onclick = (e) => {
    if (e.target === modal) usersCloseModal();
  };
  
  const contenedor = document.createElement('div');
  contenedor.style.cssText = `
    background: #161a22;
    border: 1px solid #232937;
    border-radius: 16px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    animation: modalIn 0.2s ease;
  `;
  contenedor.innerHTML = contenido;
  
  // Agregar animación
  const style = document.createElement('style');
  style.textContent = `
    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.95) translateY(-10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
  `;
  document.head.appendChild(style);
  
  modal.appendChild(contenedor);
  document.body.appendChild(modal);
}

// Close modal (namespaced)
function usersCloseModal() {
  const modal = document.getElementById('userModal');
  if (modal) modal.remove();
}

// Buscar usuarios
async function buscarUsuarios() {
  const input = document.getElementById('inputBuscar');
  const termino = input ? input.value.trim() : '';
  
  if (!termino) {
    paginaActual = 1;
    await cargarDatos();
    return;
  }
  
  const client = crearCliente();
  if (!client) return;
  
  try {
    const { data, error } = await client
      .from('users')
      .select('*')
      .or(`email.ilike.%${termino}%,username.ilike.%${termino}%`)
      .order('created_at', { ascending: false })
      .limit(porPagina);
    
    if (error) throw error;
    
    renderizarTabla(data);
    usersShowToast(`🔍 ${data.length} resultados`);
    
  } catch (err) {
    console.error('Search error:', err);
  }
}

// Paginación
function actualizarPaginacion() {
  const totalPaginas = Math.ceil(totalUsuarios / porPagina) || 1;
  document.getElementById('infoPagina').textContent = `Page ${paginaActual} of ${totalPaginas.toLocaleString('en-US')}`;
  document.getElementById('btnAnterior').disabled = paginaActual <= 1;
  document.getElementById('btnSiguiente').disabled = paginaActual >= totalPaginas;
}

function paginaAnterior() {
  if (paginaActual > 1) {
    paginaActual--;
    cargarDatos();
  }
}

function paginaSiguiente() {
  const totalPaginas = Math.ceil(totalUsuarios / porPagina);
  if (paginaActual < totalPaginas) {
    paginaActual++;
    cargarDatos();
  }
}

function cambiarPorPagina() {
  const select = document.getElementById('selectPorPagina');
  porPagina = parseInt(select.value);
  paginaActual = 1;
  cargarDatos();
}

// Utilidades
function mostrarError(mensaje) {
  const tbody = document.getElementById('tablaUsuarios');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:3rem;">
          <i class="fas fa-exclamation-triangle" style="font-size:3rem;color:#ff5555;"></i>
          <p style="color:#ff5555;font-weight:600;margin-top:1rem;">Error connecting to Supabase</p>
          <p style="color:#888;margin-top:0.5rem;">${mensaje}</p>
          <button onclick="cargarDatos()" style="margin-top:1rem;padding:10px 20px;background:#00ff88;border:none;border-radius:8px;color:#0a0a0f;font-weight:600;cursor:pointer;">
            Retry
          </button>
        </td>
      </tr>
    `;
  }
}

function usersShowToast(mensaje) {
  // Usar toast global si existe
  if (typeof window.showToast === 'function') {
    window.showToast(mensaje, 'success');
    return;
  }
  console.log(mensaje);
}

// Template HTML
function getUsersTemplate() {
  return `
    <div style="margin-bottom:2rem;">
      <h2 style="margin:0;font-size:1.5rem;">👥 Users Management</h2>
    </div>
    
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:2rem;">
      <div style="background:#161a22;border:1px solid #232937;border-radius:12px;padding:1.5rem;text-align:center;">
        <div id="statTotal" style="font-size:2rem;font-weight:700;color:#00ff88;">-</div>
        <div style="color:#888;font-size:0.875rem;margin-top:0.5rem;">Total Users</div>
      </div>
      <div style="background:#161a22;border:1px solid #232937;border-radius:12px;padding:1.5rem;text-align:center;">
        <div id="statActivos" style="font-size:2rem;font-weight:700;color:#00ff88;">-</div>
        <div style="color:#888;font-size:0.875rem;margin-top:0.5rem;">Active Users</div>
      </div>
      <div style="background:#161a22;border:1px solid #232937;border-radius:12px;padding:1.5rem;text-align:center;">
        <div id="statBalance" style="font-size:2rem;font-weight:700;color:#00ff88;">-</div>
        <div style="color:#888;font-size:0.875rem;margin-top:0.5rem;">Total Balance</div>
      </div>
      <div style="background:#161a22;border:1px solid #232937;border-radius:12px;padding:1.5rem;text-align:center;">
        <div id="statNuevos" style="font-size:2rem;font-weight:700;color:#00ff88;">-</div>
        <div style="color:#888;font-size:0.875rem;margin-top:0.5rem;">New (7 days)</div>
      </div>
    </div>
    
    <div style="display:flex;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap;">
      <input type="text" id="inputBuscar" placeholder="Search email, username..." 
        style="flex:1;min-width:250px;padding:12px 16px;background:#161a22;border:1px solid #232937;border-radius:10px;color:#e5e5e5;font-size:14px;"
        onkeyup="if(event.key==='Enter')buscarUsuarios()">
      <select id="selectPorPagina" onchange="cambiarPorPagina()" style="padding:12px 16px;background:#161a22;border:1px solid #232937;border-radius:10px;color:#e5e5e5;">
        <option value="25">25 per page</option>
        <option value="50">50 per page</option>
        <option value="100">100 per page</option>
      </select>
      <button onclick="buscarUsuarios()" style="padding:12px 20px;background:#3b82f6;border:none;border-radius:10px;color:white;font-weight:600;cursor:pointer;">
        <i class="fas fa-search"></i> Search
      </button>
      <button onclick="cargarDatos()" style="padding:12px 20px;background:#232937;border:1px solid #232937;border-radius:10px;color:#e5e5e5;cursor:pointer;">
        <i class="fas fa-sync"></i> Refresh
      </button>
    </div>
    
    <div style="background:#161a22;border:1px solid #232937;border-radius:12px;overflow:hidden;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#0f1115;">
            <th style="padding:16px;text-align:left;color:#888;font-weight:600;font-size:12px;text-transform:uppercase;">User</th>
            <th style="padding:16px;text-align:left;color:#888;font-weight:600;font-size:12px;text-transform:uppercase;">Email</th>
            <th style="padding:16px;text-align:left;color:#888;font-weight:600;font-size:12px;text-transform:uppercase;">Balance</th>
            <th style="padding:16px;text-align:left;color:#888;font-weight:600;font-size:12px;text-transform:uppercase;">Registered</th>
            <th style="padding:16px;text-align:left;color:#888;font-weight:600;font-size:12px;text-transform:uppercase;">Actions</th>
          </tr>
        </thead>
        <tbody id="tablaUsuarios">
          <tr>
            <td colspan="5" style="text-align:center;padding:3rem;">
              <i class="fas fa-spinner fa-spin" style="font-size:2rem;color:#00ff88;"></i>
              <p style="margin-top:1rem;color:#888;">Loading users...</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div style="display:flex;justify-content:center;align-items:center;gap:2rem;margin-top:1.5rem;">
      <button id="btnAnterior" onclick="paginaAnterior()" style="padding:10px 20px;background:transparent;border:1px solid #232937;border-radius:8px;color:#888;cursor:pointer;">
        <i class="fas fa-chevron-left"></i> Previous
      </button>
      <span id="infoPagina" style="color:#888;">Page 1 of 1</span>
      <button id="btnSiguiente" onclick="paginaSiguiente()" style="padding:10px 20px;background:transparent;border:1px solid #232937;border-radius:8px;color:#888;cursor:pointer;">
        Next <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  `;
}

// Exportar funciones al scope global
window.loadUsers = loadUsers;
window.cargarDatos = cargarDatos;
window.buscarUsuarios = buscarUsuarios;
window.paginaAnterior = paginaAnterior;
window.paginaSiguiente = paginaSiguiente;
window.cambiarPorPagina = cambiarPorPagina;
window.verUsuario = verUsuario;
window.editarBalance = editarBalance;
window.confirmarCambioBalance = confirmarCambioBalance;
window.darPremio = darPremio;
window.confirmarPremio = confirmarPremio;
window.usersShowModal = usersShowModal;
window.usersCloseModal = usersCloseModal;
