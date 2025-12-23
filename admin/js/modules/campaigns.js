// =====================================================
// CAMPAIGNS MODULE
// Marketing campaigns and community management
// =====================================================

export async function render() {
  return `
    <div class="campaigns-module">
      <!-- Campaigns Header -->
      <div class="module-header">
        <div class="header-left">
          <h1 class="module-title">Marketing Campaigns</h1>
          <p class="module-subtitle">Manage marketing campaigns and community initiatives</p>
        </div>
        <div class="header-right">
          <button class="btn-secondary" id="campaignAnalyticsBtn">
            <i class="fas fa-chart-bar"></i>
            Analytics
          </button>
          <button class="btn-primary" id="newCampaignBtn" ${!hasPermission('campaigns.create') ? 'style="display:none;"' : ''}>
            <i class="fas fa-plus"></i>
            New Campaign
          </button>
        </div>
      </div>

      <!-- Campaign Stats -->
      <div class="campaign-stats">
        <div class="campaign-stat-card">
          <div class="stat-icon active">
            <i class="fas fa-play-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value" id="activeCampaigns">0</div>
            <div class="stat-label">Active Campaigns</div>
          </div>
        </div>
        <div class="campaign-stat-card">
          <div class="stat-icon total-reach">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value" id="totalReach">0</div>
            <div class="stat-label">Total Reach</div>
          </div>
        </div>
        <div class="campaign-stat-card">
          <div class="stat-icon engagement">
            <i class="fas fa-heart"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value" id="totalEngagement">0</div>
            <div class="stat-label">Total Engagement</div>
          </div>
        </div>
        <div class="campaign-stat-card">
          <div class="stat-icon conversion">
            <i class="fas fa-mouse-pointer"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value" id="conversionRate">0%</div>
            <div class="stat-label">Conversion Rate</div>
          </div>
        </div>
      </div>

      <!-- Campaign Tabs -->
      <div class="campaign-tabs">
        <button class="campaign-tab active" data-tab="all">All Campaigns</button>
        <button class="campaign-tab" data-tab="active">Active</button>
        <button class="campaign-tab" data-tab="scheduled">Scheduled</button>
        <button class="campaign-tab" data-tab="completed">Completed</button>
        <button class="campaign-tab" data-tab="draft">Drafts</button>
      </div>

      <!-- Campaigns Grid -->
      <div class="campaigns-grid" id="campaignsGrid">
        <!-- Campaigns will be loaded here -->
      </div>
    </div>
  `;
}

export async function init() {
  console.log('📢 Initializing Campaigns module...');
  
  // Load campaigns
  await loadCampaigns();
  
  // Setup event listeners
  setupCampaignsEvents();
  
  console.log('✅ Campaigns module initialized');
}

// Load Campaigns
async function loadCampaigns() {
  try {
    // TODO: Load from API
    const campaigns = [
      {
        id: 1,
        name: 'Q1 Product Launch',
        description: 'Launch campaign for new product features',
        status: 'active',
        type: 'product',
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        budget: 50000,
        spent: 32500,
        reach: 125000,
        engagement: 8500,
        conversion: 3.2,
        channels: ['Twitter', 'Telegram', 'Discord'],
        manager: 'Emily Davis'
      },
      {
        id: 2,
        name: 'Community Growth Initiative',
        description: 'Increase community engagement and growth',
        status: 'active',
        type: 'community',
        startDate: '2024-02-15',
        endDate: '2024-04-15',
        budget: 30000,
        spent: 18500,
        reach: 89000,
        engagement: 6200,
        conversion: 4.1,
        channels: ['Discord', 'Telegram'],
        manager: 'Chris Lee'
      },
      {
        id: 3,
        name: 'Brand Awareness Campaign',
        description: 'Increase brand visibility across platforms',
        status: 'scheduled',
        type: 'brand',
        startDate: '2024-04-01',
        endDate: '2024-06-30',
        budget: 75000,
        spent: 0,
        reach: 0,
        engagement: 0,
        conversion: 0,
        channels: ['Twitter', 'LinkedIn', 'YouTube'],
        manager: 'Mike Johnson'
      }
    ];
    
    renderCampaigns(campaigns);
    updateCampaignStats(campaigns);
  } catch (error) {
    console.error('Error loading campaigns:', error);
    showToast('Error loading campaigns', 'error');
  }
}

// Render Campaigns
function renderCampaigns(campaigns) {
  const container = document.getElementById('campaignsGrid');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (campaigns.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-bullhorn"></i>
        <h3>No campaigns found</h3>
        <p>Create your first campaign to get started</p>
        ${hasPermission('campaigns.create') ? '<button class="btn-primary">Create Campaign</button>' : ''}
      </div>
    `;
    return;
  }
  
  campaigns.forEach(campaign => {
    const card = createCampaignCard(campaign);
    container.appendChild(card);
  });
}

// Create Campaign Card
function createCampaignCard(campaign) {
  const card = document.createElement('div');
  card.className = `campaign-card campaign-${campaign.status}`;
  card.setAttribute('data-campaign-id', campaign.id);
  
  const budgetProgress = (campaign.spent / campaign.budget) * 100;
  const daysRemaining = calculateDaysRemaining(campaign.endDate);
  
  card.innerHTML = `
    <div class="campaign-header">
      <div class="campaign-type-badge type-${campaign.type}">
        <i class="fas fa-${getCampaignTypeIcon(campaign.type)}"></i>
        ${campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)}
      </div>
      <div class="campaign-status-badge status-${campaign.status}">
        ${formatStatus(campaign.status)}
      </div>
    </div>
    <div class="campaign-body">
      <h3 class="campaign-title">${campaign.name}</h3>
      <p class="campaign-description">${campaign.description}</p>
      <div class="campaign-meta">
        <div class="campaign-manager">
          <i class="fas fa-user"></i>
          ${campaign.manager}
        </div>
        <div class="campaign-dates">
          <i class="fas fa-calendar"></i>
          ${formatDateRange(campaign.startDate, campaign.endDate)}
        </div>
      </div>
      <div class="campaign-progress">
        <div class="progress-header">
          <span>Budget</span>
          <span>$${campaign.spent.toLocaleString()} / $${campaign.budget.toLocaleString()}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${budgetProgress}%"></div>
        </div>
      </div>
      <div class="campaign-metrics">
        <div class="campaign-metric">
          <i class="fas fa-users"></i>
          <div class="metric-content">
            <div class="metric-value">${formatNumber(campaign.reach)}</div>
            <div class="metric-label">Reach</div>
          </div>
        </div>
        <div class="campaign-metric">
          <i class="fas fa-heart"></i>
          <div class="metric-content">
            <div class="metric-value">${formatNumber(campaign.engagement)}</div>
            <div class="metric-label">Engagement</div>
          </div>
        </div>
        <div class="campaign-metric">
          <i class="fas fa-percentage"></i>
          <div class="metric-content">
            <div class="metric-value">${campaign.conversion}%</div>
            <div class="metric-label">Conversion</div>
          </div>
        </div>
      </div>
      <div class="campaign-channels">
        ${campaign.channels.map(channel => `
          <span class="channel-badge">
            <i class="fab fa-${getChannelIcon(channel)}"></i>
            ${channel}
          </span>
        `).join('')}
      </div>
    </div>
    <div class="campaign-footer">
      ${daysRemaining > 0 ? `<span class="days-remaining">${daysRemaining} days remaining</span>` : '<span class="days-remaining">Ended</span>'}
      <button class="btn-view-campaign" onclick="viewCampaignDetails(${campaign.id})">
        View Details
      </button>
    </div>
  `;
  
  return card;
}

// Update Campaign Stats
function updateCampaignStats(campaigns) {
  const stats = {
    active: campaigns.filter(c => c.status === 'active').length,
    totalReach: campaigns.reduce((sum, c) => sum + c.reach, 0),
    totalEngagement: campaigns.reduce((sum, c) => sum + c.engagement, 0),
    avgConversion: campaigns.length > 0 
      ? (campaigns.reduce((sum, c) => sum + c.conversion, 0) / campaigns.length).toFixed(1)
      : 0
  };
  
  updateStat('activeCampaigns', stats.active);
  updateStat('totalReach', stats.totalReach);
  updateStat('totalEngagement', stats.totalEngagement);
  updateStat('conversionRate', stats.avgConversion + '%');
}

// Get Campaign Type Icon
function getCampaignTypeIcon(type) {
  const icons = {
    'product': 'box',
    'community': 'users',
    'brand': 'star',
    'event': 'calendar',
    'promotion': 'gift'
  };
  return icons[type] || 'bullhorn';
}

// Get Channel Icon
function getChannelIcon(channel) {
  const icons = {
    'Twitter': 'twitter',
    'Telegram': 'telegram',
    'Discord': 'discord',
    'LinkedIn': 'linkedin',
    'YouTube': 'youtube',
    'Facebook': 'facebook'
  };
  return icons[channel] || 'share-alt';
}

// Format Number
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Calculate Days Remaining
function calculateDaysRemaining(endDate) {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Format Date Range
function formatDateRange(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' - ' +
         endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Format Status
function formatStatus(status) {
  const statusMap = {
    'active': 'Active',
    'scheduled': 'Scheduled',
    'completed': 'Completed',
    'draft': 'Draft',
    'paused': 'Paused'
  };
  return statusMap[status] || status;
}

// Update Stat
function updateStat(id, value) {
  const element = document.getElementById(id);
  if (element) {
    if (typeof value === 'number') {
      animateNumber(element, value);
    } else {
      element.textContent = value;
    }
  }
}

// Animate Number
function animateNumber(element, target) {
  const start = 0;
  const duration = 1000;
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.floor(start + (target - start) * progress);
    
    element.textContent = formatNumber(current);
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = formatNumber(target);
    }
  }
  
  requestAnimationFrame(update);
}

// Setup Campaigns Events
function setupCampaignsEvents() {
  // New campaign button
  const newCampaignBtn = document.getElementById('newCampaignBtn');
  if (newCampaignBtn) {
    newCampaignBtn.addEventListener('click', () => {
      showNewCampaignModal();
    });
  }
  
  // Campaign tabs
  const tabs = document.querySelectorAll('.campaign-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabType = tab.getAttribute('data-tab');
      filterCampaigns(tabType);
    });
  });
}

// Filter Campaigns
function filterCampaigns(filter) {
  // TODO: Filter campaigns
  console.log('Filter:', filter);
}

// View Campaign Details
window.viewCampaignDetails = function(campaignId) {
  showToast('Campaign details - Coming soon', 'info');
  // TODO: Open campaign details modal
};

// Show New Campaign Modal
function showNewCampaignModal() {
  showToast('New campaign form - Coming soon', 'info');
  // TODO: Open modal with campaign creation form
}

