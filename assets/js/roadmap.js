/* ===============================
   ROADMAP.JS — MANEJO Y ANIMACIÓN ROADMAP
================================= */

// Utilidad para traer roadmap desde JSON local
async function loadRoadmapData() {
  try {
    const res = await fetch('data/roadmap.json');
    if (!res.ok) throw new Error("No se pudo cargar roadmap.json");
    return await res.json();
  } catch (e) {
    console.error('[RSC] Error cargando roadmap:', e);
    return [];
  }
}

// Renderizado dinámico del roadmap
async function renderRoadmap() {
  const container = document.querySelector('.roadmap-timeline');
  if (!container) return;
  container.innerHTML = ""; // Limpia el timeline

  const roadmapData = await loadRoadmapData();
  if (!roadmapData || !roadmapData.length) {
    container.innerHTML = "<div class='roadmap-item'>No hay hitos disponibles.</div>";
    return;
  }

  roadmapData.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = `roadmap-item q${item.quarter.toLowerCase()}${item.future ? ' future' : ''}`;
    if (item.active) div.classList.add('active');
    div.innerHTML = `
      <div class="roadmap-date">${item.quarter} ${item.year}</div>
      <div class="roadmap-content">
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
        <button class="roadmap-more-btn" data-idx="${idx}">Ver detalles</button>
        <div class="roadmap-details" style="display:none;"></div>
      </div>
    `;
    // Agrega detalles extendidos, si existen
    if (item.details) {
      div.querySelector('.roadmap-details').innerHTML = item.details;
    }
    container.appendChild(div);
  });

  // Animación de aparición secuencial
  if (container.parentElement.classList.contains('roadmap-animate')) {
    setTimeout(() => {
      container.querySelectorAll('.roadmap-item').forEach((el, i) => {
        setTimeout(() => el.classList.add('fade-in'), i * 160);
      });
    }, 350);
  }

  // Manejar clics para ver detalles de cada hito
  container.querySelectorAll('.roadmap-more-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const parent = btn.closest('.roadmap-content');
      const details = parent.querySelector('.roadmap-details');
      if (!details) return;
      const expanded = details.style.display === 'block';
      // Cierra todos
      container.querySelectorAll('.roadmap-details').forEach(d => d.style.display = 'none');
      if (!expanded) details.style.display = 'block';
    });
  });

  // Resalta etapa futura al hacer hover/click
  container.querySelectorAll('.roadmap-item.future').forEach(block => {
    block.addEventListener('mouseenter', () => block.classList.add('active'));
    block.addEventListener('mouseleave', () => block.classList.remove('active'));
    block.addEventListener('click', () => block.classList.toggle('active'));
  });
}

// Inicializa roadmap al cargar
document.addEventListener('DOMContentLoaded', renderRoadmap);

