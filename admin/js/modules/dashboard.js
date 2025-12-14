/**
 * RSC CHAIN - ADMIN PANEL - DASHBOARD
 * Main panel with real-time stats
 */

// Supabase configuration
const DASH_SUPABASE_URL = 'https://unevdceponbnmhvpzlzf.supabase.co';
const DASH_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXZkY2Vwb25ibm1odnB6bHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTIyMTksImV4cCI6MjA3MTQ4ODIxOX0.OLHbZrezgBiXWQplN1jrGD_xkARqG2uD8ECqzo05jE4';

let dashClient = null;

// Create Supabase client
function getDashClient() {
  if (dashClient) return dashClient;
  if (window.supabase && window.supabase.createClient) {
    dashClient = window.supabase.createClient(DASH_SUPABASE_URL, DASH_SUPABASE_KEY);
  }
  return dashClient;
}

// Main function
async function loadDashboard() {
  console.log('📊 Loading Dashboard...');
  
  const container = document.getElementById('adminContent');
  container.innerHTML = getDashboardTemplate();
  
  // Cargar datos en paralelo
  await Promise.all([
    cargarEstadisticas(),
    cargarMetricasSociales(),
    cargarActividadReciente()
  ]);
  
  // Inicializar gráficos
  inicializarGraficos();
}

// Load stats from Supabase
async function cargarEstadisticas() {
  const client = getDashClient();
  
  try {
    // Total de usuarios
    const { count: totalUsers, error: usersError } = await client
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (!usersError && totalUsers !== null) {
      document.getElementById('dashTotalUsers').textContent = formatDashNumber(totalUsers);
      document.getElementById('dashTotalUsers').classList.add('loaded');
    }
    
    // Usuarios nuevos (últimos 7 días)
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    
    const { count: newUsers } = await client
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', hace7Dias.toISOString());
    
    if (newUsers !== null) {
      document.getElementById('dashNewUsers').textContent = '+' + formatDashNumber(newUsers);
    }
    
    // Balance total (top 1000 usuarios por rendimiento)
    const { data: balanceData } = await client
      .from('users')
      .select('balance')
      .order('balance', { ascending: false })
      .limit(1000);
    
    if (balanceData) {
      const totalBalance = balanceData.reduce((sum, u) => sum + (parseFloat(u.balance) || 0), 0);
      document.getElementById('dashTotalBalance').textContent = formatDashNumber(totalBalance) + ' RSC';
    }
    
    // Usuarios activos (con balance > 0)
    const { count: activeUsers } = await client
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gt('balance', 0);
    
    if (activeUsers !== null) {
      document.getElementById('dashActiveUsers').textContent = formatDashNumber(activeUsers);
    }
    
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Load social metrics from localStorage
function cargarMetricasSociales() {
  try {
    const metrics = JSON.parse(localStorage.getItem('social_metrics_admin') || '{}');
    
    const youtube = metrics.youtube || 0;
    const twitter = metrics.x || 0;
    const telegram = metrics.telegram || 0;
    const discord = metrics.discord || 0;
    
    // Actualizar cards de métricas
    document.getElementById('dashYoutube').textContent = formatDashNumber(youtube);
    document.getElementById('dashTwitter').textContent = formatDashNumber(twitter);
    document.getElementById('dashTelegram').textContent = formatDashNumber(telegram);
    document.getElementById('dashDiscord').textContent = formatDashNumber(discord);
    
    // Calcular total de seguidores
    const totalFollowers = youtube + twitter + telegram + discord;
    document.getElementById('dashTotalFollowers').textContent = formatDashNumber(totalFollowers);
    
  } catch (error) {
    console.error('Error loading social metrics:', error);
  }
}

// Load recent activity
async function cargarActividadReciente() {
  const container = document.getElementById('dashRecentActivity');
  
  // Local activity placeholders
  const actividades = [
    {
      icon: 'fa-chart-line',
      type: 'info',
      title: 'Dashboard loaded',
      module: 'System',
      time: 'Now'
    }
  ];
  
  // Agregar actividad de métricas si hay datos
  const metrics = JSON.parse(localStorage.getItem('social_metrics_admin') || '{}');
  if (metrics.last_updated) {
    const fecha = new Date(metrics.last_updated);
    const hace = tiempoTranscurrido(fecha);
    actividades.unshift({
      icon: 'fa-sync',
      type: 'success',
      title: 'Social metrics updated',
      module: 'Metrics',
      time: hace
    });
  }
  
  // Renderizar actividades
  container.innerHTML = actividades.map(act => `
    <div class="dash-activity-item">
      <div class="dash-activity-icon ${act.type}">
        <i class="fas ${act.icon}"></i>
      </div>
      <div class="dash-activity-content">
        <div class="dash-activity-title">${act.title}</div>
        <div class="dash-activity-meta">
          <span>${act.module}</span>
          <span>•</span>
          <span>${act.time}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Initialize simple charts (no Chart.js)
function inicializarGraficos() {
  // Gráfico de barras simple para métricas sociales
  const metricsChart = document.getElementById('dashMetricsChart');
  if (metricsChart) {
    const metrics = JSON.parse(localStorage.getItem('social_metrics_admin') || '{}');
    
    const data = [
      { label: 'YouTube', value: metrics.youtube || 0, color: '#FF0000', max: 2000 },
      { label: 'Twitter', value: metrics.x || 0, color: '#1DA1F2', max: 5000 },
      { label: 'Telegram', value: metrics.telegram || 0, color: '#0088cc', max: 5000 },
      { label: 'Discord', value: metrics.discord || 0, color: '#5865F2', max: 1000 }
    ];
    
    metricsChart.innerHTML = `
      <div class="dash-simple-chart">
        ${data.map(d => {
          const percent = Math.min((d.value / d.max) * 100, 100);
          return `
            <div class="dash-bar-item">
              <div class="dash-bar-label">${d.label}</div>
              <div class="dash-bar-container">
                <div class="dash-bar-fill" style="width:${percent}%;background:${d.color};"></div>
              </div>
              <div class="dash-bar-value">${formatDashNumber(d.value)}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
  
  // Gráfico de resumen de usuarios
  const usersChart = document.getElementById('dashUsersChart');
  if (usersChart) {
    usersChart.innerHTML = `
      <div class="dash-users-summary">
        <div class="dash-summary-item">
          <i class="fas fa-user-plus" style="color:#00ff88;"></i>
          <span>New this week</span>
          <strong id="dashWeekUsers">-</strong>
        </div>
        <div class="dash-summary-item">
          <i class="fas fa-user-check" style="color:#3b82f6;"></i>
          <span>With active balance</span>
          <strong id="dashBalanceUsers">-</strong>
        </div>
        <div class="dash-summary-item">
          <i class="fas fa-users" style="color:#8b5cf6;"></i>
          <span>Total registered</span>
          <strong id="dashAllUsers">-</strong>
        </div>
      </div>
    `;
    
    // Actualizar con datos si existen
    setTimeout(() => {
      const totalEl = document.getElementById('dashTotalUsers');
      const activeEl = document.getElementById('dashActiveUsers');
      const newEl = document.getElementById('dashNewUsers');
      
      if (totalEl) document.getElementById('dashAllUsers').textContent = totalEl.textContent;
      if (activeEl) document.getElementById('dashBalanceUsers').textContent = activeEl.textContent;
      if (newEl) document.getElementById('dashWeekUsers').textContent = newEl.textContent;
    }, 1500);
  }
}

// Utilidades
function formatDashNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return new Intl.NumberFormat('en-US').format(Math.round(num));
}

function tiempoTranscurrido(fecha) {
  const ahora = new Date();
  const diff = ahora - fecha;
  const minutos = Math.floor(diff / 60000);
  const horas = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);
  
  if (minutos < 1) return 'Now';
  if (minutos < 60) return `${minutos} min ago`;
  if (horas < 24) return `${horas}h ago`;
  return `${dias} days ago`;
}

// Template del Dashboard
function getDashboardTemplate() {
  return `
    <style>
      .dash-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }
      .dash-card {
        background: linear-gradient(135deg, #161a22 0%, #1a1f2a 100%);
        border: 1px solid #232937;
        border-radius: 16px;
        padding: 1.5rem;
        transition: all 0.3s ease;
      }
      .dash-card:hover {
        transform: translateY(-3px);
        border-color: #00ff88;
        box-shadow: 0 10px 30px rgba(0,255,136,0.1);
      }
      .dash-card-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }
      .dash-card-icon {
        width: 45px;
        height: 45px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
      }
      .dash-card-icon.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; }
      .dash-card-icon.green { background: linear-gradient(135deg, #00ff88, #00d673); color: #0a0a0f; }
      .dash-card-icon.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: #fff; }
      .dash-card-icon.orange { background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; }
      .dash-card-icon.red { background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; }
      .dash-card-icon.cyan { background: linear-gradient(135deg, #06b6d4, #0891b2); color: #fff; }
      .dash-card-title {
        font-size: 0.8rem;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .dash-card-value {
        font-size: 2rem;
        font-weight: 700;
        color: #fff;
        margin-bottom: 0.25rem;
      }
      .dash-card-value.loaded {
        animation: dashPulse 0.5s ease;
      }
      @keyframes dashPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); color: #00ff88; }
        100% { transform: scale(1); }
      }
      .dash-card-subtitle {
        font-size: 0.85rem;
        color: #666;
      }
      .dash-card-change {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.8rem;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 6px;
        margin-top: 0.5rem;
      }
      .dash-card-change.positive { background: rgba(0,255,136,0.15); color: #00ff88; }
      .dash-card-change.negative { background: rgba(239,68,68,0.15); color: #ef4444; }
      .dash-card-change.neutral { background: rgba(136,136,136,0.15); color: #888; }

      /* Sección de métricas sociales */
      .dash-social-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }
      .dash-social-card {
        background: #161a22;
        border: 1px solid #232937;
        border-radius: 12px;
        padding: 1rem;
        text-align: center;
        transition: all 0.2s;
      }
      .dash-social-card:hover {
        border-color: var(--platform-color);
        transform: translateY(-2px);
      }
      .dash-social-icon {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
      }
      .dash-social-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #fff;
      }
      .dash-social-label {
        font-size: 0.75rem;
        color: #888;
        text-transform: uppercase;
      }

      /* Charts section */
      .dash-charts-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }
      .dash-chart-card {
        background: #161a22;
        border: 1px solid #232937;
        border-radius: 16px;
        padding: 1.5rem;
      }
      .dash-chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }
      .dash-chart-header h3 {
        font-size: 1rem;
        font-weight: 600;
        color: #fff;
        margin: 0;
      }
      .dash-chart-body {
        min-height: 200px;
      }

      /* Simple bar chart */
      .dash-simple-chart {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .dash-bar-item {
        display: grid;
        grid-template-columns: 80px 1fr 60px;
        align-items: center;
        gap: 1rem;
      }
      .dash-bar-label {
        font-size: 0.85rem;
        color: #ccc;
      }
      .dash-bar-container {
        height: 24px;
        background: #232937;
        border-radius: 12px;
        overflow: hidden;
      }
      .dash-bar-fill {
        height: 100%;
        border-radius: 12px;
        transition: width 1s ease;
      }
      .dash-bar-value {
        font-size: 0.9rem;
        font-weight: 600;
        color: #fff;
        text-align: right;
      }

      /* Users summary */
      .dash-users-summary {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .dash-summary-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: #1a1f2a;
        border-radius: 12px;
      }
      .dash-summary-item i {
        font-size: 1.25rem;
        width: 40px;
        text-align: center;
      }
      .dash-summary-item span {
        flex: 1;
        color: #888;
      }
      .dash-summary-item strong {
        font-size: 1.25rem;
        color: #fff;
      }

      /* Activity section */
      .dash-activity-section {
        background: #161a22;
        border: 1px solid #232937;
        border-radius: 16px;
        padding: 1.5rem;
      }
      .dash-activity-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }
      .dash-activity-header h3 {
        font-size: 1rem;
        font-weight: 600;
        color: #fff;
        margin: 0;
      }
      .dash-activity-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .dash-activity-item {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background: #1a1f2a;
        border-radius: 10px;
        align-items: center;
      }
      .dash-activity-icon {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
      }
      .dash-activity-icon.success { background: rgba(0,255,136,0.2); color: #00ff88; }
      .dash-activity-icon.info { background: rgba(59,130,246,0.2); color: #3b82f6; }
      .dash-activity-icon.warning { background: rgba(245,158,11,0.2); color: #f59e0b; }
      .dash-activity-icon.danger { background: rgba(239,68,68,0.2); color: #ef4444; }
      .dash-activity-content { flex: 1; }
      .dash-activity-title {
        font-size: 0.9rem;
        color: #e5e5e5;
        margin-bottom: 0.25rem;
      }
      .dash-activity-meta {
        font-size: 0.75rem;
        color: #666;
        display: flex;
        gap: 0.5rem;
      }

      /* Quick actions */
      .dash-quick-actions {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
      }
      .dash-quick-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        background: #232937;
        border: 1px solid #2d3548;
        border-radius: 10px;
        color: #e5e5e5;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s;
      }
      .dash-quick-btn:hover {
        background: #00ff88;
        color: #0a0a0f;
        border-color: #00ff88;
      }
      .dash-quick-btn i {
        font-size: 1rem;
      }
    </style>

    <!-- Quick Actions -->
    <div class="dash-quick-actions">
      <button class="dash-quick-btn" onclick="loadModule('users')">
        <i class="fas fa-users"></i> View Users
      </button>
      <button class="dash-quick-btn" onclick="loadModule('social-metrics')">
        <i class="fas fa-chart-line"></i> Refresh Metrics
      </button>
      <button class="dash-quick-btn" onclick="loadModule('content')">
        <i class="fas fa-bullhorn"></i> Create Announcement
      </button>
      <button class="dash-quick-btn" onclick="location.reload()">
        <i class="fas fa-sync"></i> Refresh
      </button>
    </div>

    <!-- Stats Grid -->
    <div class="dash-grid">
      <div class="dash-card">
        <div class="dash-card-header">
          <div class="dash-card-icon blue"><i class="fas fa-users"></i></div>
        </div>
        <div class="dash-card-title">Total Users</div>
        <div class="dash-card-value" id="dashTotalUsers">
          <i class="fas fa-spinner fa-spin" style="font-size:1rem;"></i>
        </div>
        <div class="dash-card-change positive" id="dashNewUsers">+0 this week</div>
      </div>

      <div class="dash-card">
        <div class="dash-card-header">
          <div class="dash-card-icon green"><i class="fas fa-user-check"></i></div>
        </div>
        <div class="dash-card-title">Active Users</div>
        <div class="dash-card-value" id="dashActiveUsers">
          <i class="fas fa-spinner fa-spin" style="font-size:1rem;"></i>
        </div>
        <div class="dash-card-subtitle">With balance > 0</div>
      </div>

      <div class="dash-card">
        <div class="dash-card-header">
          <div class="dash-card-icon purple"><i class="fas fa-coins"></i></div>
        </div>
        <div class="dash-card-title">Total Balance</div>
        <div class="dash-card-value" id="dashTotalBalance">
          <i class="fas fa-spinner fa-spin" style="font-size:1rem;"></i>
        </div>
        <div class="dash-card-subtitle">In circulation</div>
      </div>

      <div class="dash-card">
        <div class="dash-card-header">
          <div class="dash-card-icon cyan"><i class="fas fa-share-alt"></i></div>
        </div>
        <div class="dash-card-title">Total Followers</div>
        <div class="dash-card-value" id="dashTotalFollowers">0</div>
        <div class="dash-card-subtitle">Across all networks</div>
      </div>
    </div>

    <!-- Social Metrics Grid -->
    <h3 style="color:#888;font-size:0.9rem;text-transform:uppercase;margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem;">
      <i class="fas fa-share-nodes"></i> Social Network Metrics
    </h3>
    <div class="dash-social-grid">
      <div class="dash-social-card" style="--platform-color:#FF0000;">
        <div class="dash-social-icon" style="color:#FF0000;"><i class="fab fa-youtube"></i></div>
        <div class="dash-social-value" id="dashYoutube">0</div>
        <div class="dash-social-label">YouTube</div>
      </div>
      <div class="dash-social-card" style="--platform-color:#1DA1F2;">
        <div class="dash-social-icon" style="color:#fff;"><i class="fab fa-x-twitter"></i></div>
        <div class="dash-social-value" id="dashTwitter">0</div>
        <div class="dash-social-label">X (Twitter)</div>
      </div>
      <div class="dash-social-card" style="--platform-color:#0088cc;">
        <div class="dash-social-icon" style="color:#0088cc;"><i class="fab fa-telegram"></i></div>
        <div class="dash-social-value" id="dashTelegram">0</div>
        <div class="dash-social-label">Telegram</div>
      </div>
      <div class="dash-social-card" style="--platform-color:#5865F2;">
        <div class="dash-social-icon" style="color:#5865F2;"><i class="fab fa-discord"></i></div>
        <div class="dash-social-value" id="dashDiscord">0</div>
        <div class="dash-social-label">Discord</div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="dash-charts-row">
      <div class="dash-chart-card">
        <div class="dash-chart-header">
          <h3><i class="fas fa-chart-bar" style="color:#00ff88;margin-right:0.5rem;"></i> Metrics Progress</h3>
        </div>
        <div class="dash-chart-body" id="dashMetricsChart">
          <div style="text-align:center;padding:2rem;color:#666;">
            <i class="fas fa-spinner fa-spin"></i> Loading...
          </div>
        </div>
      </div>

      <div class="dash-chart-card">
        <div class="dash-chart-header">
          <h3><i class="fas fa-users" style="color:#3b82f6;margin-right:0.5rem;"></i> Users Summary</h3>
        </div>
        <div class="dash-chart-body" id="dashUsersChart">
          <div style="text-align:center;padding:2rem;color:#666;">
            <i class="fas fa-spinner fa-spin"></i> Loading...
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="dash-activity-section">
      <div class="dash-activity-header">
        <h3><i class="fas fa-history" style="color:#f59e0b;margin-right:0.5rem;"></i> Recent Activity</h3>
        <button class="dash-quick-btn" onclick="loadModule('audit')" style="padding:0.5rem 1rem;font-size:0.8rem;">
          View All
        </button>
      </div>
      <div class="dash-activity-list" id="dashRecentActivity">
        <div style="text-align:center;padding:2rem;color:#666;">
          <i class="fas fa-spinner fa-spin"></i> Loading activity...
        </div>
      </div>
    </div>
  `;
}

// Exportar funciones
window.loadDashboard = loadDashboard;
