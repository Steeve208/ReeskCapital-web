/**
 * RSC CHAIN - ADMIN PANEL - GESTIÓN DE CONTENIDO
 * Sistema de anuncios y campañas de marketing
 * Soporta: imágenes, videos, banners, HTML personalizado
 * Ubicaciones: Hero, Announcement Box, Banner lateral
 */

// Configuración Supabase (nombres únicos para evitar conflictos)
const CONTENT_SUPABASE_URL = 'https://unevdceponbnmhvpzlzf.supabase.co';
const CONTENT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZXZkY2Vwb25ibm1odnB6bHpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MTIyMTksImV4cCI6MjA3MTQ4ODIxOX0.OLHbZrezgBiXWQplN1jrGD_xkARqG2uD8ECqzo05jE4';

let contentDbClient = null;
let anuncios = [];

// Ubicaciones disponibles
const UBICACIONES = {
  hero: {
    name: 'Hero Principal',
    description: 'Banner grande en la parte superior de la página',
    icon: 'fas fa-image',
    maxWidth: '1920px',
    maxHeight: '600px'
  },
  announcement: {
    name: 'Cuadro de Anuncios',
    description: 'Caja de anuncios debajo del hero',
    icon: 'fas fa-bullhorn',
    maxWidth: '1200px',
    maxHeight: '400px'
  },
  sidebar: {
    name: 'Banner Lateral',
    description: 'Banner en la barra lateral',
    icon: 'fas fa-columns',
    maxWidth: '300px',
    maxHeight: '600px'
  },
  popup: {
    name: 'Popup Modal',
    description: 'Ventana emergente al entrar',
    icon: 'fas fa-window-restore',
    maxWidth: '600px',
    maxHeight: '500px'
  },
  mining_event: {
    name: 'Evento Minería',
    description: 'Banner en la sección de minería',
    icon: 'fas fa-hammer',
    maxWidth: '100%',
    maxHeight: '300px'
  }
};

// Tipos de contenido
const TIPOS_CONTENIDO = {
  image: { name: 'Imagen', icon: 'fas fa-image', accepts: 'image/*' },
  video: { name: 'Video', icon: 'fas fa-video', accepts: 'video/*' },
  youtube: { name: 'YouTube', icon: 'fab fa-youtube', accepts: 'url' },
  html: { name: 'HTML Personalizado', icon: 'fas fa-code', accepts: 'html' },
  text: { name: 'Texto/Banner', icon: 'fas fa-font', accepts: 'text' }
};

// Crear cliente
function getContentClient() {
  if (contentDbClient) return contentDbClient;
  if (window.supabase && window.supabase.createClient) {
    contentDbClient = window.supabase.createClient(CONTENT_SUPABASE_URL, CONTENT_SUPABASE_KEY);
  }
  return contentDbClient;
}

// Función principal
async function loadContent() {
  console.log('📢 Cargando Gestión de Contenido...');
  
  const container = document.getElementById('adminContent');
  container.innerHTML = getContentTemplate();
  
  await cargarAnuncios();
}

// Cargar anuncios
async function cargarAnuncios() {
  const lista = document.getElementById('listaAnuncios');
  
  try {
    // Intentar cargar desde Supabase
    const client = getContentClient();
    let data = null;
    
    if (client) {
      const result = await client
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!result.error) {
        data = result.data;
      }
    }
    
    // Si no hay datos de Supabase, usar localStorage
    if (!data) {
      data = JSON.parse(localStorage.getItem('admin_announcements') || '[]');
    }
    
    anuncios = data;
    console.log('📢 Anuncios cargados:', anuncios.length);
    
    renderizarAnuncios();
    actualizarEstadisticas();
    
  } catch (error) {
    console.error('Error cargando anuncios:', error);
    lista.innerHTML = `
      <div style="text-align:center;padding:3rem;color:#888;">
        <i class="fas fa-exclamation-triangle" style="font-size:2rem;color:#ff5555;"></i>
        <p style="margin-top:1rem;">Error al cargar anuncios</p>
      </div>
    `;
  }
}

// Renderizar lista de anuncios
function renderizarAnuncios() {
  const lista = document.getElementById('listaAnuncios');
  
  if (anuncios.length === 0) {
    lista.innerHTML = `
      <div style="text-align:center;padding:3rem;color:#888;">
        <i class="fas fa-bullhorn" style="font-size:3rem;margin-bottom:1rem;opacity:0.3;"></i>
        <p>No hay anuncios creados</p>
        <button onclick="mostrarFormularioNuevo()" style="margin-top:1rem;padding:10px 20px;background:#00ff88;border:none;border-radius:8px;color:#0a0a0f;font-weight:600;cursor:pointer;">
          <i class="fas fa-plus"></i> Crear Primer Anuncio
        </button>
      </div>
    `;
    return;
  }
  
  lista.innerHTML = anuncios.map(anuncio => {
    const ubicacion = UBICACIONES[anuncio.ubicacion] || { name: anuncio.ubicacion, icon: 'fas fa-question' };
    const tipo = TIPOS_CONTENIDO[anuncio.tipo] || { name: anuncio.tipo, icon: 'fas fa-file' };
    const activo = anuncio.activo;
    const fechaInicio = anuncio.fecha_inicio ? new Date(anuncio.fecha_inicio).toLocaleDateString('es-ES') : '-';
    const fechaFin = anuncio.fecha_fin ? new Date(anuncio.fecha_fin).toLocaleDateString('es-ES') : 'Sin límite';
    
    return `
      <div class="anuncio-card ${activo ? 'activo' : 'inactivo'}">
        <div class="anuncio-preview">
          ${getPreviewHTML(anuncio)}
        </div>
        <div class="anuncio-info">
          <div class="anuncio-header">
            <h3>${anuncio.titulo}</h3>
            <span class="anuncio-status ${activo ? 'active' : 'inactive'}">
              ${activo ? '<i class="fas fa-check-circle"></i> Activo' : '<i class="fas fa-pause-circle"></i> Inactivo'}
            </span>
          </div>
          <p class="anuncio-descripcion">${anuncio.descripcion || 'Sin descripción'}</p>
          <div class="anuncio-meta">
            <span><i class="${ubicacion.icon}"></i> ${ubicacion.name}</span>
            <span><i class="${tipo.icon}"></i> ${tipo.name}</span>
            <span><i class="fas fa-calendar"></i> ${fechaInicio} - ${fechaFin}</span>
          </div>
          <div class="anuncio-actions">
            <button onclick="editarAnuncio('${anuncio.id}')" class="btn-edit">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button onclick="toggleAnuncio('${anuncio.id}')" class="btn-toggle">
              <i class="fas fa-${activo ? 'pause' : 'play'}"></i> ${activo ? 'Desactivar' : 'Activar'}
            </button>
            <button onclick="eliminarAnuncio('${anuncio.id}')" class="btn-delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Obtener HTML de preview
function getPreviewHTML(anuncio) {
  switch (anuncio.tipo) {
    case 'image':
      return `<img src="${anuncio.contenido}" alt="${anuncio.titulo}" style="max-width:100%;max-height:100%;object-fit:cover;border-radius:8px;">`;
    case 'video':
      return `<video src="${anuncio.contenido}" style="max-width:100%;max-height:100%;border-radius:8px;" muted></video>`;
    case 'youtube':
      const videoId = extractYouTubeId(anuncio.contenido);
      return `<img src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="${anuncio.titulo}" style="max-width:100%;border-radius:8px;">`;
    case 'html':
      return `<div style="padding:1rem;background:#0f1115;border-radius:8px;font-size:0.75rem;color:#888;"><i class="fas fa-code"></i> HTML Personalizado</div>`;
    case 'text':
      return `<div style="padding:1rem;background:${anuncio.color_fondo || '#00ff88'};color:${anuncio.color_texto || '#000'};border-radius:8px;font-weight:600;text-align:center;">${anuncio.contenido.substring(0, 50)}...</div>`;
    default:
      return `<div style="padding:1rem;background:#232937;border-radius:8px;color:#888;text-align:center;"><i class="fas fa-image"></i></div>`;
  }
}

// Extraer ID de YouTube
function extractYouTubeId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : '';
}

// Mostrar formulario nuevo anuncio
function mostrarFormularioNuevo() {
  contentShowModal(getFormularioHTML());
}

// Editar anuncio
function editarAnuncio(id) {
  const anuncio = anuncios.find(a => a.id === id);
  if (!anuncio) return;
  contentShowModal(getFormularioHTML(anuncio));
}

// Obtener HTML del formulario
function getFormularioHTML(anuncio = null) {
  const esEdicion = anuncio !== null;
  const titulo = esEdicion ? 'Editar Anuncio' : 'Nuevo Anuncio';
  
  return `
    <div class="form-anuncio">
      <h3 style="margin:0 0 1.5rem;color:#fff;display:flex;align-items:center;gap:10px;">
        <i class="fas fa-${esEdicion ? 'edit' : 'plus-circle'}" style="color:#00ff88;"></i>
        ${titulo}
      </h3>
      
      <div class="form-grid">
        <div class="form-group">
          <label>Título del Anuncio *</label>
          <input type="text" id="formTitulo" value="${anuncio?.titulo || ''}" placeholder="Ej: Nuevo Evento de Minería" required>
        </div>
        
        <div class="form-group">
          <label>Descripción</label>
          <input type="text" id="formDescripcion" value="${anuncio?.descripcion || ''}" placeholder="Descripción breve del anuncio">
        </div>
        
        <div class="form-group">
          <label>Ubicación *</label>
          <select id="formUbicacion">
            ${Object.entries(UBICACIONES).map(([key, ubi]) => `
              <option value="${key}" ${anuncio?.ubicacion === key ? 'selected' : ''}>
                ${ubi.name} - ${ubi.description}
              </option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label>Tipo de Contenido *</label>
          <select id="formTipo" onchange="cambiarTipoContenido()">
            ${Object.entries(TIPOS_CONTENIDO).map(([key, tipo]) => `
              <option value="${key}" ${anuncio?.tipo === key ? 'selected' : ''}>
                ${tipo.name}
              </option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-group form-full" id="contenidoContainer">
          <label>Contenido *</label>
          <div id="inputContenido">
            ${getInputContenido(anuncio?.tipo || 'image', anuncio?.contenido || '')}
          </div>
        </div>
        
        <div class="form-group">
          <label>Link/URL de destino</label>
          <input type="url" id="formLink" value="${anuncio?.link || ''}" placeholder="https://ejemplo.com">
        </div>
        
        <div class="form-group">
          <label>Abrir en nueva pestaña</label>
          <select id="formTarget">
            <option value="_blank" ${anuncio?.target === '_blank' ? 'selected' : ''}>Sí, nueva pestaña</option>
            <option value="_self" ${anuncio?.target === '_self' ? 'selected' : ''}>No, misma página</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Fecha de inicio</label>
          <input type="datetime-local" id="formFechaInicio" value="${anuncio?.fecha_inicio ? anuncio.fecha_inicio.slice(0, 16) : ''}">
        </div>
        
        <div class="form-group">
          <label>Fecha de fin</label>
          <input type="datetime-local" id="formFechaFin" value="${anuncio?.fecha_fin ? anuncio.fecha_fin.slice(0, 16) : ''}">
        </div>
        
        <div class="form-group">
          <label>Prioridad (mayor = más arriba)</label>
          <input type="number" id="formPrioridad" value="${anuncio?.prioridad || 0}" min="0" max="100">
        </div>
        
        <div class="form-group">
          <label>Estado</label>
          <select id="formActivo">
            <option value="true" ${anuncio?.activo !== false ? 'selected' : ''}>Activo</option>
            <option value="false" ${anuncio?.activo === false ? 'selected' : ''}>Inactivo</option>
          </select>
        </div>
      </div>
      
      <div class="form-actions">
        <button onclick="guardarAnuncio(${esEdicion ? `'${anuncio.id}'` : 'null'})" class="btn-save">
          <i class="fas fa-save"></i> ${esEdicion ? 'Guardar Cambios' : 'Crear Anuncio'}
        </button>
        <button onclick="contentCloseModal()" class="btn-cancel">Cancel</button>
      </div>
    </div>
  `;
}

// Obtener input según tipo de contenido
function getInputContenido(tipo, valor = '') {
  switch (tipo) {
    case 'image':
    case 'video':
      return `
        <input type="url" id="formContenido" value="${valor}" placeholder="URL de la ${tipo === 'image' ? 'imagen' : 'video'} (https://...)">
        <small style="color:#888;margin-top:0.5rem;display:block;">Puedes usar URLs de servicios como Imgur, Cloudinary, etc.</small>
      `;
    case 'youtube':
      return `
        <input type="url" id="formContenido" value="${valor}" placeholder="URL de YouTube (https://youtube.com/watch?v=...)">
        <small style="color:#888;margin-top:0.5rem;display:block;">Pega el link completo del video de YouTube</small>
      `;
    case 'html':
      return `
        <textarea id="formContenido" rows="6" placeholder="<div>Tu código HTML aquí</div>" style="font-family:monospace;">${valor}</textarea>
        <small style="color:#888;margin-top:0.5rem;display:block;">⚠️ Cuidado: El HTML se renderiza tal cual. Asegúrate de que sea seguro.</small>
      `;
    case 'text':
      return `
        <textarea id="formContenido" rows="3" placeholder="Texto del banner...">${valor}</textarea>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1rem;">
          <div>
            <label style="font-size:0.75rem;color:#888;">Color de fondo</label>
            <input type="color" id="formColorFondo" value="#00ff88" style="width:100%;height:40px;border:none;border-radius:8px;cursor:pointer;">
          </div>
          <div>
            <label style="font-size:0.75rem;color:#888;">Color de texto</label>
            <input type="color" id="formColorTexto" value="#000000" style="width:100%;height:40px;border:none;border-radius:8px;cursor:pointer;">
          </div>
        </div>
      `;
    default:
      return `<input type="text" id="formContenido" value="${valor}" placeholder="Contenido...">`;
  }
}

// Cambiar tipo de contenido
function cambiarTipoContenido() {
  const tipo = document.getElementById('formTipo').value;
  document.getElementById('inputContenido').innerHTML = getInputContenido(tipo);
}

// Guardar anuncio
async function guardarAnuncio(id = null) {
  const titulo = document.getElementById('formTitulo').value.trim();
  const descripcion = document.getElementById('formDescripcion').value.trim();
  const ubicacion = document.getElementById('formUbicacion').value;
  const tipo = document.getElementById('formTipo').value;
  const contenido = document.getElementById('formContenido').value.trim();
  const link = document.getElementById('formLink').value.trim();
  const target = document.getElementById('formTarget').value;
  const fechaInicio = document.getElementById('formFechaInicio').value;
  const fechaFin = document.getElementById('formFechaFin').value;
  const prioridad = parseInt(document.getElementById('formPrioridad').value) || 0;
  const activo = document.getElementById('formActivo').value === 'true';
  
  // Validación
  if (!titulo) {
    contentShowToast('⚠️ El título es obligatorio', 'warning');
    return;
  }
  if (!contenido) {
    contentShowToast('⚠️ El contenido es obligatorio', 'warning');
    return;
  }
  
  // Crear objeto anuncio
  const anuncio = {
    id: id || generateId(),
    titulo,
    descripcion,
    ubicacion,
    tipo,
    contenido,
    link,
    target,
    fecha_inicio: fechaInicio || null,
    fecha_fin: fechaFin || null,
    prioridad,
    activo,
    updated_at: new Date().toISOString()
  };
  
  // Agregar colores para tipo text
  if (tipo === 'text') {
    anuncio.color_fondo = document.getElementById('formColorFondo')?.value || '#00ff88';
    anuncio.color_texto = document.getElementById('formColorTexto')?.value || '#000000';
  }
  
  if (!id) {
    anuncio.created_at = new Date().toISOString();
  }
  
  try {
    // Guardar en Supabase si está disponible
    const client = getContentClient();
    if (client) {
      const { error } = await client
        .from('announcements')
        .upsert(anuncio, { onConflict: 'id' });
      
      if (error) {
        console.log('Supabase error, usando localStorage:', error);
      }
    }
    
    // Siempre guardar en localStorage como backup
    if (id) {
      const index = anuncios.findIndex(a => a.id === id);
      if (index >= 0) anuncios[index] = anuncio;
    } else {
      anuncios.unshift(anuncio);
    }
    localStorage.setItem('admin_announcements', JSON.stringify(anuncios));
    
    // Publicar para el frontend
    publicarAnuncios();
    
    contentCloseModal();
    renderizarAnuncios();
    actualizarEstadisticas();
    
    contentShowToast(`✅ Anuncio ${id ? 'actualizado' : 'creado'} correctamente`, 'success');
    
  } catch (error) {
    console.error('Error guardando anuncio:', error);
    contentShowToast('❌ Error al guardar', 'error');
  }
}

// Toggle activar/desactivar
async function toggleAnuncio(id) {
  const anuncio = anuncios.find(a => a.id === id);
  if (!anuncio) return;
  
  anuncio.activo = !anuncio.activo;
  anuncio.updated_at = new Date().toISOString();
  
  // Guardar
  localStorage.setItem('admin_announcements', JSON.stringify(anuncios));
  
  const client = getContentClient();
  if (client) {
    await client.from('announcements').update({ activo: anuncio.activo }).eq('id', id);
  }
  
  publicarAnuncios();
  renderizarAnuncios();
  actualizarEstadisticas();
  
  contentShowToast(`${anuncio.activo ? '✅ Anuncio activado' : '⏸️ Anuncio desactivado'}`, 'success');
}

// Eliminar anuncio
async function eliminarAnuncio(id) {
  if (!confirm('¿Estás seguro de eliminar este anuncio?')) return;
  
  anuncios = anuncios.filter(a => a.id !== id);
  localStorage.setItem('admin_announcements', JSON.stringify(anuncios));
  
  const client = getContentClient();
  if (client) {
    await client.from('announcements').delete().eq('id', id);
  }
  
  publicarAnuncios();
  renderizarAnuncios();
  actualizarEstadisticas();
  
  contentShowToast('🗑️ Anuncio eliminado', 'success');
}

// Publicar anuncios activos al frontend
function publicarAnuncios() {
  const ahora = new Date();
  
  // Filtrar anuncios activos y vigentes
  const activos = anuncios.filter(a => {
    if (!a.activo) return false;
    if (a.fecha_inicio && new Date(a.fecha_inicio) > ahora) return false;
    if (a.fecha_fin && new Date(a.fecha_fin) < ahora) return false;
    return true;
  });
  
  // Ordenar por prioridad
  activos.sort((a, b) => (b.prioridad || 0) - (a.prioridad || 0));
  
  // Guardar para el frontend
  localStorage.setItem('rsc_announcements_public', JSON.stringify(activos));
  
  // Disparar evento para actualización en tiempo real
  window.dispatchEvent(new CustomEvent('announcementsUpdated', { detail: activos }));
  
  console.log('📢 Anuncios publicados:', activos.length);
}

// Actualizar estadísticas
function actualizarEstadisticas() {
  const total = anuncios.length;
  const activos = anuncios.filter(a => a.activo).length;
  
  const statTotal = document.getElementById('statTotalAnuncios');
  const statActivos = document.getElementById('statAnunciosActivos');
  
  if (statTotal) statTotal.textContent = total;
  if (statActivos) statActivos.textContent = activos;
}

// Generar ID único
function generateId() {
  return 'ann_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Modal
function contentShowModal(contenido) {
  contentCloseModal();
  
  const modal = document.createElement('div');
  modal.id = 'contentModal';
  modal.className = 'content-modal';
  modal.onclick = (e) => { if (e.target === modal) contentCloseModal(); };
  
  modal.innerHTML = `<div class="modal-box">${contenido}</div>`;
  document.body.appendChild(modal);
}

function contentCloseModal() {
  const modal = document.getElementById('contentModal');
  if (modal) modal.remove();
}

// Toast (prefijada para evitar conflictos)
function contentShowToast(mensaje, tipo = 'info') {
  if (typeof window.showToast === 'function') {
    window.showToast(mensaje, tipo);
  } else {
    console.log(`[${tipo}] ${mensaje}`);
  }
}

// Template principal
function getContentTemplate() {
  return `
    <style>
      .content-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        gap: 1rem;
      }
      .content-header h2 {
        margin: 0;
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .content-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }
      .stat-box {
        background: #161a22;
        border: 1px solid #232937;
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
      }
      .stat-box-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: #00ff88;
      }
      .stat-box-label {
        color: #888;
        font-size: 0.875rem;
        margin-top: 0.5rem;
      }
      .anuncios-lista {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .anuncio-card {
        background: #161a22;
        border: 1px solid #232937;
        border-radius: 16px;
        display: grid;
        grid-template-columns: 200px 1fr;
        overflow: hidden;
        transition: all 0.3s;
      }
      .anuncio-card:hover {
        border-color: #00ff88;
      }
      .anuncio-card.inactivo {
        opacity: 0.6;
      }
      .anuncio-preview {
        background: #0f1115;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 150px;
        padding: 1rem;
      }
      .anuncio-info {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
      }
      .anuncio-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.5rem;
      }
      .anuncio-header h3 {
        margin: 0;
        font-size: 1.1rem;
        color: #fff;
      }
      .anuncio-status {
        font-size: 0.75rem;
        padding: 4px 10px;
        border-radius: 20px;
        font-weight: 600;
      }
      .anuncio-status.active {
        background: rgba(0,255,136,0.1);
        color: #00ff88;
      }
      .anuncio-status.inactive {
        background: rgba(255,255,255,0.1);
        color: #888;
      }
      .anuncio-descripcion {
        color: #888;
        font-size: 0.875rem;
        margin: 0 0 1rem;
      }
      .anuncio-meta {
        display: flex;
        gap: 1.5rem;
        font-size: 0.75rem;
        color: #666;
        margin-bottom: 1rem;
        flex-wrap: wrap;
      }
      .anuncio-meta span {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .anuncio-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: auto;
      }
      .anuncio-actions button {
        padding: 8px 16px;
        border: none;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s;
      }
      .btn-edit {
        background: #3b82f6;
        color: #fff;
      }
      .btn-toggle {
        background: #232937;
        color: #e5e5e5;
      }
      .btn-delete {
        background: transparent;
        color: #ff5555;
        border: 1px solid #ff555533 !important;
      }
      .btn-delete:hover {
        background: #ff555522;
      }
      .btn-nuevo {
        padding: 12px 24px;
        background: linear-gradient(135deg, #00ff88, #00d673);
        border: none;
        border-radius: 10px;
        color: #0a0a0f;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      /* Modal */
      .content-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        overflow-y: auto;
      }
      .modal-box {
        background: #161a22;
        border: 1px solid #232937;
        border-radius: 16px;
        padding: 2rem;
        max-width: 700px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
      }
      /* Form */
      .form-anuncio .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .form-group.form-full {
        grid-column: 1 / -1;
      }
      .form-group label {
        font-size: 0.75rem;
        color: #888;
        text-transform: uppercase;
      }
      .form-group input,
      .form-group select,
      .form-group textarea {
        padding: 12px 16px;
        background: #0f1115;
        border: 1px solid #232937;
        border-radius: 10px;
        color: #fff;
        font-size: 1rem;
        box-sizing: border-box;
      }
      .form-group input:focus,
      .form-group select:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: #00ff88;
      }
      .form-group textarea {
        resize: vertical;
        min-height: 80px;
      }
      .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
      }
      .btn-save {
        flex: 1;
        padding: 14px;
        background: linear-gradient(135deg, #00ff88, #00d673);
        border: none;
        border-radius: 10px;
        color: #0a0a0f;
        font-weight: 700;
        font-size: 1rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .btn-cancel {
        padding: 14px 24px;
        background: #232937;
        border: none;
        border-radius: 10px;
        color: #888;
        font-weight: 600;
        cursor: pointer;
      }
      @media (max-width: 768px) {
        .anuncio-card {
          grid-template-columns: 1fr;
        }
        .form-anuncio .form-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>

    <div class="content-header">
      <h2><i class="fas fa-bullhorn" style="color:#00ff88;"></i> Gestión de Contenido</h2>
      <button onclick="mostrarFormularioNuevo()" class="btn-nuevo">
        <i class="fas fa-plus"></i> Nuevo Anuncio
      </button>
    </div>

    <div class="content-stats">
      <div class="stat-box">
        <div class="stat-box-value" id="statTotalAnuncios">0</div>
        <div class="stat-box-label">Total Anuncios</div>
      </div>
      <div class="stat-box">
        <div class="stat-box-value" id="statAnunciosActivos">0</div>
        <div class="stat-box-label">Activos</div>
      </div>
    </div>

    <div class="anuncios-lista" id="listaAnuncios">
      <div style="text-align:center;padding:3rem;">
        <i class="fas fa-spinner fa-spin" style="font-size:2rem;color:#00ff88;"></i>
        <p style="margin-top:1rem;color:#888;">Cargando anuncios...</p>
      </div>
    </div>
  `;
}

// Exportar
window.loadContent = loadContent;
window.cargarAnuncios = cargarAnuncios;
window.mostrarFormularioNuevo = mostrarFormularioNuevo;
window.editarAnuncio = editarAnuncio;
window.guardarAnuncio = guardarAnuncio;
window.toggleAnuncio = toggleAnuncio;
window.eliminarAnuncio = eliminarAnuncio;
window.cambiarTipoContenido = cambiarTipoContenido;
window.contentCloseModal = contentCloseModal;
window.contentShowModal = contentShowModal;

