// =====================================================
// DESIGN ASSETS MODULE
// Design assets and creative resources management
// =====================================================

export async function render() {
  return `
    <div class="design-assets-module">
      <!-- Design Assets Header -->
      <div class="module-header">
        <div class="header-left">
          <h1 class="module-title">Design Assets</h1>
          <p class="module-subtitle">Manage design files, templates, and creative resources</p>
        </div>
        <div class="header-right">
          <div class="view-toggle">
            <button class="view-btn active" data-view="grid">
              <i class="fas fa-th"></i>
            </button>
            <button class="view-btn" data-view="list">
              <i class="fas fa-list"></i>
            </button>
          </div>
          <button class="btn-secondary" id="uploadFolderBtn">
            <i class="fas fa-folder-plus"></i>
            Upload Folder
          </button>
          <button class="btn-primary" id="uploadAssetBtn" ${!hasPermission('design.create') ? 'style="display:none;"' : ''}>
            <i class="fas fa-upload"></i>
            Upload Asset
          </button>
        </div>
      </div>

      <!-- Asset Categories -->
      <div class="asset-categories">
        <button class="category-btn active" data-category="all">
          <i class="fas fa-th"></i>
          All Assets
        </button>
        <button class="category-btn" data-category="logos">
          <i class="fas fa-image"></i>
          Logos
        </button>
        <button class="category-btn" data-category="templates">
          <i class="fas fa-layer-group"></i>
          Templates
        </button>
        <button class="category-btn" data-category="icons">
          <i class="fas fa-icons"></i>
          Icons
        </button>
        <button class="category-btn" data-category="images">
          <i class="fas fa-photo-video"></i>
          Images
        </button>
        <button class="category-btn" data-category="videos">
          <i class="fas fa-video"></i>
          Videos
        </button>
        <button class="category-btn" data-category="fonts">
          <i class="fas fa-font"></i>
          Fonts
        </button>
      </div>

      <!-- Assets Grid -->
      <div class="assets-container">
        <div class="assets-grid" id="assetsGrid">
          <!-- Assets will be loaded here -->
        </div>
      </div>
    </div>
  `;
}

export async function init() {
  console.log('🎨 Initializing Design Assets module...');
  
  // Load assets
  await loadAssets();
  
  // Setup event listeners
  setupAssetsEvents();
  
  console.log('✅ Design Assets module initialized');
}

// Load Assets
async function loadAssets() {
  try {
    // TODO: Load from API
    const assets = [
      {
        id: 1,
        name: 'RSC Logo Primary',
        type: 'logo',
        category: 'logos',
        format: 'SVG',
        size: '45 KB',
        thumbnail: null,
        createdAt: '2024-01-15',
        createdBy: 'Alex Martinez',
        tags: ['logo', 'brand', 'primary']
      },
      {
        id: 2,
        name: 'Social Media Template',
        type: 'template',
        category: 'templates',
        format: 'PSD',
        size: '2.3 MB',
        thumbnail: null,
        createdAt: '2024-02-20',
        createdBy: 'Lisa Chen',
        tags: ['template', 'social', 'marketing']
      },
      {
        id: 3,
        name: 'Brand Colors Palette',
        type: 'palette',
        category: 'templates',
        format: 'JSON',
        size: '12 KB',
        thumbnail: null,
        createdAt: '2024-01-10',
        createdBy: 'Alex Martinez',
        tags: ['colors', 'brand', 'palette']
      }
    ];
    
    renderAssets(assets);
  } catch (error) {
    console.error('Error loading assets:', error);
    showToast('Error loading assets', 'error');
  }
}

// Render Assets
function renderAssets(assets) {
  const container = document.getElementById('assetsGrid');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (assets.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-palette"></i>
        <h3>No assets found</h3>
        <p>Upload your first design asset to get started</p>
        ${hasPermission('design.create') ? '<button class="btn-primary">Upload Asset</button>' : ''}
      </div>
    `;
    return;
  }
  
  assets.forEach(asset => {
    const card = createAssetCard(asset);
    container.appendChild(card);
  });
}

// Create Asset Card
function createAssetCard(asset) {
  const card = document.createElement('div');
  card.className = 'asset-card';
  card.setAttribute('data-asset-id', asset.id);
  
  card.innerHTML = `
    <div class="asset-thumbnail">
      ${asset.thumbnail 
        ? `<img src="${asset.thumbnail}" alt="${asset.name}">`
        : `<div class="asset-placeholder">
            <i class="fas fa-${getAssetIcon(asset.type)}"></i>
            <span class="asset-format">${asset.format}</span>
          </div>`
      }
      <div class="asset-overlay">
        <button class="asset-action-btn" onclick="previewAsset(${asset.id})" title="Preview">
          <i class="fas fa-eye"></i>
        </button>
        <button class="asset-action-btn" onclick="downloadAsset(${asset.id})" title="Download">
          <i class="fas fa-download"></i>
        </button>
        ${hasPermission('design.edit') ? `
          <button class="asset-action-btn" onclick="editAsset(${asset.id})" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
        ` : ''}
      </div>
    </div>
    <div class="asset-info">
      <h4 class="asset-name">${asset.name}</h4>
      <div class="asset-meta">
        <span class="asset-size">${asset.size}</span>
        <span class="asset-date">${formatDate(asset.createdAt)}</span>
      </div>
      <div class="asset-creator">
        <i class="fas fa-user"></i>
        ${asset.createdBy}
      </div>
      <div class="asset-tags">
        ${asset.tags.map(tag => `<span class="asset-tag">${tag}</span>`).join('')}
      </div>
    </div>
  `;
  
  return card;
}

// Get Asset Icon
function getAssetIcon(type) {
  const icons = {
    'logo': 'image',
    'template': 'layer-group',
    'icon': 'icons',
    'image': 'photo-video',
    'video': 'video',
    'font': 'font',
    'palette': 'palette'
  };
  return icons[type] || 'file';
}

// Format Date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Setup Assets Events
function setupAssetsEvents() {
  // Upload asset button
  const uploadBtn = document.getElementById('uploadAssetBtn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      showUploadModal();
    });
  }
  
  // Category buttons
  const categoryBtns = document.querySelectorAll('.category-btn');
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.getAttribute('data-category');
      filterAssets(category);
    });
  });
  
  // View toggle
  const viewBtns = document.querySelectorAll('.view-btn');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.getAttribute('data-view');
      switchView(view);
    });
  });
}

// Filter Assets
function filterAssets(category) {
  // TODO: Filter assets by category
  console.log('Filter:', category);
}

// Switch View
function switchView(view) {
  const container = document.getElementById('assetsGrid');
  if (!container) return;
  
  container.className = 'assets-grid view-' + view;
}

// Preview Asset
window.previewAsset = function(assetId) {
  showToast('Asset preview - Coming soon', 'info');
  // TODO: Open asset preview modal
};

// Download Asset
window.downloadAsset = function(assetId) {
  showToast('Downloading asset...', 'info');
  // TODO: Download asset
};

// Edit Asset
window.editAsset = function(assetId) {
  showToast('Edit asset - Coming soon', 'info');
  // TODO: Open asset edit modal
};

// Show Upload Modal
function showUploadModal() {
  showToast('Upload asset - Coming soon', 'info');
  // TODO: Open upload modal
}

