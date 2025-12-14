/**
 * RSC CHAIN - ADMIN PANEL - SOCIAL METRICS
 * Controls the Social Goals mining event
 * Changes apply immediately to the event
 */

// Supabase configuration
const METRICS_SUPABASE_URL = 'https://unevdceponbnmhvpzlzf.supabase.co';
const METRICS_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXZkY2Vwb25ibm1odnB6bHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTIyMTksImV4cCI6MjA3MTQ4ODIxOX0.OLHbZrezgBiXWQplN1jrGD_xkARqG2uD8ECqzo05jE4';

let metricsDbClient = null;

// Platforms definition
const PLATFORMS = {
  youtube: {
    name: 'YouTube',
    icon: 'fab fa-youtube',
    color: '#FF0000',
    label: 'Subscribers',
    link: 'https://youtube.com/@rscchain',
    defaultValue: 0
  },
  x: {
    name: 'X (Twitter)',
    icon: 'fab fa-x-twitter', 
    color: '#000000',
    label: 'Followers',
    link: 'https://x.com/Reeskcap',
    defaultValue: 2000
  },
  telegram: {
    name: 'Telegram',
    icon: 'fab fa-telegram',
    color: '#0088cc',
    label: 'Members',
    link: 'https://t.me/RSCchain',
    defaultValue: 2017
  },
  discord: {
    name: 'Discord',
    icon: 'fab fa-discord',
    color: '#5865F2',
    label: 'Members',
    link: 'https://discord.gg/dJjJ4N3dC',
    defaultValue: 260
  }
};

// Crear cliente Supabase
function getMetricsClient() {
  if (metricsDbClient) return metricsDbClient;
  
  if (window.supabase && window.supabase.createClient) {
    metricsDbClient = window.supabase.createClient(METRICS_SUPABASE_URL, METRICS_SUPABASE_KEY);
  }
  return metricsDbClient;
}

// Main function
async function loadSocialMetrics() {
  console.log('📊 Loading Social Metrics...');
  
  const container = document.getElementById('adminContent');
  container.innerHTML = getMetricsTemplate();
  
  // Cargar métricas actuales
  await cargarMetricas();
}

// Cargar métricas desde storage/DB
async function cargarMetricas() {
  const container = document.getElementById('metricsContainer');
  
  try {
    // Cargar desde localStorage (fuente principal para este evento)
    let metrics = JSON.parse(localStorage.getItem('social_metrics_admin') || '{}');
    
    // Si no hay datos, usar valores por defecto
    if (Object.keys(metrics).length === 0) {
      metrics = {
        youtube: PLATFORMS.youtube.defaultValue,
        x: PLATFORMS.x.defaultValue,
        telegram: PLATFORMS.telegram.defaultValue,
        discord: PLATFORMS.discord.defaultValue,
        last_updated: new Date().toISOString()
      };
      localStorage.setItem('social_metrics_admin', JSON.stringify(metrics));
    }
    
  console.log('📊 Metrics loaded:', metrics);
    
    // Renderizar cards
    renderMetricsCards(metrics);
    
    // Actualizar timestamp
    if (metrics.last_updated) {
      document.getElementById('lastUpdate').textContent = 
        'Last update: ' + new Date(metrics.last_updated).toLocaleString('en-US');
    }
    
  } catch (error) {
    console.error('Error loading metrics:', error);
    container.innerHTML = `
      <div style="text-align:center;padding:3rem;color:#ff5555;">
        <i class="fas fa-exclamation-triangle" style="font-size:3rem;"></i>
        <p style="margin-top:1rem;">Error loading metrics</p>
        <button onclick="cargarMetricas()" style="margin-top:1rem;padding:10px 20px;background:#00ff88;border:none;border-radius:8px;color:#0a0a0f;cursor:pointer;">
          Retry
        </button>
      </div>
    `;
  }
}

// Renderizar cards de métricas
function renderMetricsCards(metrics) {
  const container = document.getElementById('metricsContainer');
  
  let html = '';
  
  Object.entries(PLATFORMS).forEach(([key, platform]) => {
    const value = metrics[key] || platform.defaultValue;
    
    html += `
      <div class="metric-card" data-platform="${key}">
        <div class="metric-header">
          <div class="metric-icon" style="background:${platform.color}20;color:${platform.color};">
            <i class="${platform.icon}"></i>
          </div>
          <div class="metric-title">
            <h3>${platform.name}</h3>
            <span class="metric-label">${platform.label}</span>
          </div>
          <a href="${platform.link}" target="_blank" class="metric-link" title="View on ${platform.name}">
            <i class="fas fa-external-link-alt"></i>
          </a>
        </div>
        
        <div class="metric-value-display">
          <span class="metric-current" id="display-${key}">${metricsFormatNumber(value)}</span>
        </div>
        
        <div class="metric-input-group">
          <label>Current value</label>
          <input type="number" 
            id="input-${key}" 
            value="${value}" 
            min="0"
            oninput="previewChange('${key}')"
            class="metric-input">
        </div>
        
        <div class="metric-actions">
          <button onclick="guardarMetrica('${key}')" class="btn-save">
            <i class="fas fa-save"></i> Save
          </button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Preview del cambio
function previewChange(platform) {
  const input = document.getElementById(`input-${platform}`);
  const display = document.getElementById(`display-${platform}`);
  
  if (input && display) {
    const value = parseInt(input.value) || 0;
    display.textContent = metricsFormatNumber(value);
  }
}

// Guardar métrica individual
async function guardarMetrica(platform) {
  const input = document.getElementById(`input-${platform}`);
  const newValue = parseInt(input.value);
  
  if (isNaN(newValue) || newValue < 0) {
    metricsShowToast('⚠️ Invalid value', 'warning');
    return;
  }
  
  try {
    // Cargar métricas actuales
    let metrics = JSON.parse(localStorage.getItem('social_metrics_admin') || '{}');
    
    const oldValue = metrics[platform] || 0;
    
    // Actualizar valor
    metrics[platform] = newValue;
    metrics.last_updated = new Date().toISOString();
    
    // Guardar en localStorage (esto es lo que lee el evento de minería)
    localStorage.setItem('social_metrics_admin', JSON.stringify(metrics));
    
    // También intentar guardar en Supabase si existe la tabla
    await guardarEnSupabase(platform, newValue, oldValue);
    
    // Notificar al evento de minería (si está en la misma pestaña)
    notificarEvento(platform, newValue);
    
    // Actualizar UI
    document.getElementById('lastUpdate').textContent = 
      'Last update: ' + new Date().toLocaleString('en-US');
    
    metricsShowToast(`✅ ${PLATFORMS[platform].name} updated: ${metricsFormatNumber(newValue)} ${PLATFORMS[platform].label}`, 'success');
    
    console.log(`📊 Metric saved: ${platform} = ${newValue}`);
    
  } catch (error) {
    console.error('Error saving metric:', error);
    metricsShowToast('❌ Error saving metric', 'error');
  }
}

// Guardar en Supabase
async function guardarEnSupabase(platform, newValue, oldValue) {
  const client = getMetricsClient();
  if (!client) return;
  
  try {
    // Intentar insertar/actualizar en tabla social_metrics
    const { error } = await client
      .from('social_metrics')
      .upsert({
        platform: platform,
        current_value: newValue,
        updated_at: new Date().toISOString()
      }, { onConflict: 'platform' });
    
    if (error) {
      // Si la tabla no existe, no pasa nada - usamos localStorage
      console.log('Nota: Tabla social_metrics no disponible, usando solo localStorage');
    } else {
      console.log('✅ Guardado en Supabase');
    }
    
  } catch (e) {
    console.log('Usando localStorage como almacenamiento principal');
  }
}

// Notificar al evento de minería
function notificarEvento(platform, value) {
  // Dispatch custom event para actualización en tiempo real
  window.dispatchEvent(new CustomEvent('socialMetricsUpdated', {
    detail: { platform, value }
  }));
  
  console.log(`📤 Evento notificado: ${platform} = ${value}`);
}

// Guardar todas las métricas
async function guardarTodasMetricas() {
  let metrics = {};
  let hasChanges = false;
  
  Object.keys(PLATFORMS).forEach(key => {
    const input = document.getElementById(`input-${key}`);
    if (input) {
      metrics[key] = parseInt(input.value) || 0;
      hasChanges = true;
    }
  });
  
  if (!hasChanges) {
    metricsShowToast('No changes to save', 'info');
    return;
  }
  
  try {
    metrics.last_updated = new Date().toISOString();
    localStorage.setItem('social_metrics_admin', JSON.stringify(metrics));
    
    // Notificar todos los cambios
    Object.entries(metrics).forEach(([key, value]) => {
      if (key !== 'last_updated') {
        notificarEvento(key, value);
      }
    });
    
    document.getElementById('lastUpdate').textContent = 
      'Last update: ' + new Date().toLocaleString('en-US');
    
    metricsShowToast('✅ All metrics saved', 'success');
    
  } catch (error) {
    console.error('Error:', error);
    metricsShowToast('❌ Error saving metrics', 'error');
  }
}

// Utilidades (prefijadas para evitar conflictos)
function metricsFormatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

function metricsShowToast(mensaje, tipo = 'info') {
  if (typeof window.showToast === 'function') {
    window.showToast(mensaje, tipo);
    return;
  }
  console.log(`[${tipo}] ${mensaje}`);
}

// Template HTML
function getMetricsTemplate() {
  return `
    <style>
      .social-metrics-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        gap: 1rem;
      }
      .social-metrics-header h2 {
        margin: 0;
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .header-actions {
        display: flex;
        gap: 1rem;
      }
      .info-banner {
        background: linear-gradient(135deg, rgba(0,255,136,0.1), rgba(59,130,246,0.1));
        border: 1px solid rgba(0,255,136,0.3);
        border-radius: 12px;
        padding: 1rem 1.5rem;
        margin-bottom: 2rem;
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .info-banner i {
        font-size: 1.5rem;
        color: #00ff88;
      }
      .info-banner p {
        margin: 0;
        color: #e5e5e5;
      }
      .info-banner strong {
        color: #00ff88;
      }
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
      }
      .metric-card {
        background: #161a22;
        border: 1px solid #232937;
        border-radius: 16px;
        padding: 1.5rem;
        transition: all 0.3s ease;
      }
      .metric-card:hover {
        border-color: #00ff88;
        transform: translateY(-2px);
      }
      .metric-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      .metric-icon {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
      }
      .metric-title h3 {
        margin: 0;
        font-size: 1.1rem;
        color: #fff;
      }
      .metric-label {
        font-size: 0.75rem;
        color: #888;
        text-transform: uppercase;
      }
      .metric-link {
        margin-left: auto;
        width: 36px;
        height: 36px;
        background: #232937;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #888;
        text-decoration: none;
        transition: all 0.2s;
      }
      .metric-link:hover {
        background: #00ff88;
        color: #0a0a0f;
      }
      .metric-value-display {
        text-align: center;
        margin-bottom: 1.5rem;
      }
      .metric-current {
        font-size: 2.5rem;
        font-weight: 700;
        color: #00ff88;
      }
      .metric-input-group {
        margin-bottom: 1rem;
      }
      .metric-input-group label {
        display: block;
        font-size: 0.75rem;
        color: #888;
        text-transform: uppercase;
        margin-bottom: 0.5rem;
      }
      .metric-input {
        width: 100%;
        padding: 12px 16px;
        background: #0f1115;
        border: 1px solid #232937;
        border-radius: 10px;
        color: #fff;
        font-size: 1.25rem;
        font-weight: 600;
        text-align: center;
        box-sizing: border-box;
        transition: border-color 0.2s;
      }
      .metric-input:focus {
        outline: none;
        border-color: #00ff88;
      }
      .metric-actions {
        display: flex;
        gap: 0.5rem;
      }
      .btn-save {
        flex: 1;
        padding: 12px;
        background: linear-gradient(135deg, #00ff88, #00d673);
        border: none;
        border-radius: 10px;
        color: #0a0a0f;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s;
      }
      .btn-save:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 20px rgba(0,255,136,0.3);
      }
      .btn-secondary {
        padding: 12px 20px;
        background: #232937;
        border: 1px solid #232937;
        border-radius: 10px;
        color: #e5e5e5;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .btn-primary {
        padding: 12px 20px;
        background: #3b82f6;
        border: none;
        border-radius: 10px;
        color: #fff;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .last-update {
        text-align: center;
        margin-top: 2rem;
        color: #888;
        font-size: 0.875rem;
      }
    </style>

    <div class="social-metrics-header">
      <h2><i class="fas fa-chart-line" style="color:#00ff88;"></i> Social Metrics</h2>
      <div class="header-actions">
        <button onclick="cargarMetricas()" class="btn-secondary">
          <i class="fas fa-sync"></i> Refresh
        </button>
        <button onclick="guardarTodasMetricas()" class="btn-primary">
          <i class="fas fa-save"></i> Save All
        </button>
      </div>
    </div>

    <div class="info-banner">
      <i class="fas fa-bolt"></i>
      <p>
        <strong>Real-time update:</strong> 
        Changes made here are reflected immediately in the <strong>Social Goals</strong> event on the mining page.
        Users will see updated metrics without reloading.
      </p>
    </div>

    <div class="metrics-grid" id="metricsContainer">
      <div style="text-align:center;padding:3rem;grid-column:1/-1;">
        <i class="fas fa-spinner fa-spin" style="font-size:2rem;color:#00ff88;"></i>
        <p style="margin-top:1rem;color:#888;">Loading metrics...</p>
      </div>
    </div>

    <p class="last-update" id="lastUpdate">Last update: -</p>
  `;
}

// Exportar funciones
window.loadSocialMetrics = loadSocialMetrics;
window.cargarMetricas = cargarMetricas;
window.guardarMetrica = guardarMetrica;
window.guardarTodasMetricas = guardarTodasMetricas;
window.previewChange = previewChange;
