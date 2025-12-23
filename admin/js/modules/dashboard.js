// =====================================================
// CORPORATE DASHBOARD MODULE
// Complete dashboard for all departments
// =====================================================

export async function render() {
  // Obtener AdminState desde window (debe estar disponible globalmente)
  const AdminState = window.AdminState || {};
  const currentUser = AdminState.currentUser || { name: 'User', email: 'user@rscchain.com' };
  
  console.log('📊 Dashboard render - User:', currentUser.name);
  
  return `
    <div class="dashboard-module">
      <!-- Dashboard Header -->
      <div class="dashboard-header">
        <div class="dashboard-header-left">
          <h1 class="dashboard-title">Corporate Dashboard</h1>
          <p class="dashboard-subtitle">Welcome back, ${currentUser.name || 'User'}</p>
        </div>
        <div class="dashboard-header-right">
          <div class="date-range-picker">
            <button class="btn-date-range" id="dateRangeBtn">
              <i class="fas fa-calendar"></i>
              <span id="dateRangeText">Last 30 days</span>
              <i class="fas fa-chevron-down"></i>
            </button>
          </div>
          <button class="btn-refresh" id="refreshDashboard">
            <i class="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>
      </div>

      <!-- Key Metrics Grid -->
      <div class="metrics-grid">
        <!-- Total Employees -->
        <div class="metric-card">
          <div class="metric-header">
            <div class="metric-icon employees">
              <i class="fas fa-users"></i>
            </div>
            <div class="metric-trend up">
              <i class="fas fa-arrow-up"></i>
              <span>+12%</span>
            </div>
          </div>
          <div class="metric-content">
            <div class="metric-value" id="totalEmployees">0</div>
            <div class="metric-label">Total Employees</div>
            <div class="metric-change">+24 this month</div>
          </div>
        </div>

        <!-- Active Projects -->
        <div class="metric-card">
          <div class="metric-header">
            <div class="metric-icon projects">
              <i class="fas fa-project-diagram"></i>
            </div>
            <div class="metric-trend up">
              <i class="fas fa-arrow-up"></i>
              <span>+8%</span>
            </div>
          </div>
          <div class="metric-content">
            <div class="metric-value" id="activeProjects">0</div>
            <div class="metric-label">Active Projects</div>
            <div class="metric-change">12 in progress</div>
          </div>
        </div>

        <!-- Pending Tasks -->
        <div class="metric-card">
          <div class="metric-header">
            <div class="metric-icon tasks">
              <i class="fas fa-tasks"></i>
            </div>
            <div class="metric-trend down">
              <i class="fas fa-arrow-down"></i>
              <span>-15%</span>
            </div>
          </div>
          <div class="metric-content">
            <div class="metric-value" id="pendingTasks">0</div>
            <div class="metric-label">Pending Tasks</div>
            <div class="metric-change">45 completed today</div>
          </div>
        </div>

        <!-- Monthly Revenue -->
        <div class="metric-card">
          <div class="metric-header">
            <div class="metric-icon revenue">
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="metric-trend up">
              <i class="fas fa-arrow-up"></i>
              <span>+23%</span>
            </div>
          </div>
          <div class="metric-content">
            <div class="metric-value" id="monthlyRevenue">$0</div>
            <div class="metric-label">Monthly Revenue</div>
            <div class="metric-change">vs last month</div>
          </div>
        </div>

        <!-- Active Campaigns -->
        <div class="metric-card">
          <div class="metric-header">
            <div class="metric-icon campaigns">
              <i class="fas fa-bullhorn"></i>
            </div>
            <div class="metric-trend neutral">
              <i class="fas fa-minus"></i>
              <span>0%</span>
            </div>
          </div>
          <div class="metric-content">
            <div class="metric-value" id="activeCampaigns">0</div>
            <div class="metric-label">Active Campaigns</div>
            <div class="metric-change">8 running</div>
          </div>
        </div>

        <!-- Community Growth -->
        <div class="metric-card">
          <div class="metric-header">
            <div class="metric-icon community">
              <i class="fas fa-users-cog"></i>
            </div>
            <div class="metric-trend up">
              <i class="fas fa-arrow-up"></i>
              <span>+18%</span>
            </div>
          </div>
          <div class="metric-content">
            <div class="metric-value" id="communityGrowth">0</div>
            <div class="metric-label">Community Growth</div>
            <div class="metric-change">+2.5K this week</div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <!-- Revenue Chart -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Revenue Overview</h3>
            <div class="chart-actions">
              <button class="chart-filter active" data-period="month">Month</button>
              <button class="chart-filter" data-period="quarter">Quarter</button>
              <button class="chart-filter" data-period="year">Year</button>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="revenueChart"></canvas>
          </div>
        </div>

        <!-- Department Performance -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>Department Performance</h3>
          </div>
          <div class="chart-body">
            <canvas id="departmentChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Activity Sections -->
      <div class="activity-sections">
        <!-- Recent Projects -->
        <div class="activity-card">
          <div class="activity-header">
            <h3>Recent Projects</h3>
            <a href="#" class="view-all-link" onclick="loadModule('projects')">View All</a>
          </div>
          <div class="activity-list" id="recentProjects">
            <div class="activity-item">
              <div class="activity-icon">
                <i class="fas fa-project-diagram"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">Website Redesign</div>
                <div class="activity-meta">Marketing • 85% Complete</div>
              </div>
              <div class="activity-status">
                <span class="status-badge in-progress">In Progress</span>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon">
                <i class="fas fa-project-diagram"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">Mobile App Launch</div>
                <div class="activity-meta">Development • 60% Complete</div>
              </div>
              <div class="activity-status">
                <span class="status-badge in-progress">In Progress</span>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon">
                <i class="fas fa-project-diagram"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">Q1 Marketing Campaign</div>
                <div class="activity-meta">Marketing • Completed</div>
              </div>
              <div class="activity-status">
                <span class="status-badge completed">Completed</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pending Approvals -->
        <div class="activity-card">
          <div class="activity-header">
            <h3>Pending Approvals</h3>
            <a href="#" class="view-all-link" onclick="loadModule('approvals')">View All</a>
          </div>
          <div class="activity-list" id="pendingApprovals">
            <div class="activity-item">
              <div class="activity-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">Budget Request - Marketing</div>
                <div class="activity-meta">Finance • $50,000 • 2 days ago</div>
              </div>
              <div class="activity-actions">
                <button class="btn-approve">Approve</button>
                <button class="btn-reject">Reject</button>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">Hire Request - Designer</div>
                <div class="activity-meta">HR • 1 day ago</div>
              </div>
              <div class="activity-actions">
                <button class="btn-approve">Approve</button>
                <button class="btn-reject">Reject</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Team Activity -->
        <div class="activity-card">
          <div class="activity-header">
            <h3>Team Activity</h3>
          </div>
          <div class="activity-list" id="teamActivity">
            <div class="activity-item">
              <div class="activity-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">John Doe completed task "Design Landing Page"</div>
                <div class="activity-meta">2 hours ago</div>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">Jane Smith started project "Mobile App"</div>
                <div class="activity-meta">4 hours ago</div>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="activity-content">
                <div class="activity-title">Mike Johnson published campaign "Summer Sale"</div>
                <div class="activity-meta">6 hours ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats by Department -->
      <div class="department-stats">
        <h2 class="section-title">Department Overview</h2>
        <div class="department-grid">
          <div class="department-card">
            <div class="department-header">
              <div class="department-icon marketing">
                <i class="fas fa-bullhorn"></i>
              </div>
              <div class="department-info">
                <h3>Marketing</h3>
                <p>12 members</p>
              </div>
            </div>
            <div class="department-metrics">
              <div class="dept-metric">
                <span class="dept-metric-value">8</span>
                <span class="dept-metric-label">Active Campaigns</span>
              </div>
              <div class="dept-metric">
                <span class="dept-metric-value">24</span>
                <span class="dept-metric-label">Tasks</span>
              </div>
            </div>
          </div>

          <div class="department-card">
            <div class="department-header">
              <div class="department-icon design">
                <i class="fas fa-palette"></i>
              </div>
              <div class="department-info">
                <h3>Design</h3>
                <p>8 members</p>
              </div>
            </div>
            <div class="department-metrics">
              <div class="dept-metric">
                <span class="dept-metric-value">15</span>
                <span class="dept-metric-label">Active Projects</span>
              </div>
              <div class="dept-metric">
                <span class="dept-metric-value">32</span>
                <span class="dept-metric-label">Assets Created</span>
              </div>
            </div>
          </div>

          <div class="department-card">
            <div class="department-header">
              <div class="department-icon development">
                <i class="fas fa-code"></i>
              </div>
              <div class="department-info">
                <h3>Development</h3>
                <p>15 members</p>
              </div>
            </div>
            <div class="department-metrics">
              <div class="dept-metric">
                <span class="dept-metric-value">6</span>
                <span class="dept-metric-label">Active Projects</span>
              </div>
              <div class="dept-metric">
                <span class="dept-metric-value">18</span>
                <span class="dept-metric-label">Tasks</span>
              </div>
            </div>
          </div>

          <div class="department-card">
            <div class="department-header">
              <div class="department-icon community">
                <i class="fas fa-users-cog"></i>
              </div>
              <div class="department-info">
                <h3>Community</h3>
                <p>6 members</p>
              </div>
            </div>
            <div class="department-metrics">
              <div class="dept-metric">
                <span class="dept-metric-value">125K</span>
                <span class="dept-metric-label">Community Size</span>
              </div>
              <div class="dept-metric">
                <span class="dept-metric-value">+2.5K</span>
                <span class="dept-metric-label">This Week</span>
              </div>
            </div>
          </div>

          <div class="department-card">
            <div class="department-header">
              <div class="department-icon finance">
                <i class="fas fa-dollar-sign"></i>
              </div>
              <div class="department-info">
                <h3>Finance</h3>
                <p>5 members</p>
              </div>
            </div>
            <div class="department-metrics">
              <div class="dept-metric">
                <span class="dept-metric-value">$2.5M</span>
                <span class="dept-metric-label">Monthly Revenue</span>
              </div>
              <div class="dept-metric">
                <span class="dept-metric-value">12</span>
                <span class="dept-metric-label">Pending Invoices</span>
              </div>
            </div>
          </div>

          <div class="department-card">
            <div class="department-header">
              <div class="department-icon hr">
                <i class="fas fa-user-tie"></i>
              </div>
              <div class="department-info">
                <h3>Human Resources</h3>
                <p>4 members</p>
              </div>
            </div>
            <div class="department-metrics">
              <div class="dept-metric">
                <span class="dept-metric-value">8</span>
                <span class="dept-metric-label">Open Positions</span>
              </div>
              <div class="dept-metric">
                <span class="dept-metric-value">3</span>
                <span class="dept-metric-label">Interviews Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function init() {
  console.log('📊 Initializing Dashboard module...');
  
  try {
    const showToast = window.showToast || function(msg, type) { console.log(`[${type}] ${msg}`); };
    
    // Load dashboard data
    await loadDashboardData();
    
    // Initialize charts (puede fallar si Chart.js no está disponible)
    try {
      initCharts();
    } catch (chartError) {
      console.warn('⚠️ Charts no disponibles:', chartError.message);
    }
    
    // Setup event listeners
    setupDashboardEvents();
    
    console.log('✅ Dashboard module initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing dashboard:', error);
    console.error('Stack:', error.stack);
    const showToast = window.showToast || function(msg, type) { console.log(`[${type}] ${msg}`); };
    showToast('Error initializing dashboard. Some features may not be available.', 'warning');
  }
}

// Load Dashboard Data
async function loadDashboardData() {
  try {
    // TODO: Load from API
    // Simulated data for now
    updateMetric('totalEmployees', 156);
    updateMetric('activeProjects', 42);
    updateMetric('pendingTasks', 128);
    updateMetric('monthlyRevenue', '$2,450,000');
    updateMetric('activeCampaigns', 8);
    updateMetric('communityGrowth', '125,432');
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    const showToast = window.showToast || function(msg, type) { console.log(`[${type}] ${msg}`); };
    showToast('Error loading dashboard data', 'error');
  }
}

// Update Metric
function updateMetric(id, value) {
  const element = document.getElementById(id);
  if (element) {
    // Animate number if it's a number
    if (typeof value === 'number' || !isNaN(value)) {
      animateNumber(element, parseInt(value) || 0);
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
    
    element.textContent = current.toLocaleString();
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target.toLocaleString();
    }
  }
  
  requestAnimationFrame(update);
}

// Initialize Charts
function initCharts() {
  // Revenue Chart
  const revenueCtx = document.getElementById('revenueChart');
  if (revenueCtx) {
    new Chart(revenueCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue',
          data: [1.8, 2.1, 2.3, 2.0, 2.4, 2.5],
          borderColor: '#0066ff',
          backgroundColor: 'rgba(0, 102, 255, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function(value) {
                return '$' + value + 'M';
              }
            }
          }
        }
      }
    });
  }
  
  // Department Chart
  const deptCtx = document.getElementById('departmentChart');
  if (deptCtx) {
    new Chart(deptCtx, {
      type: 'doughnut',
      data: {
        labels: ['Marketing', 'Design', 'Development', 'Community', 'Finance', 'HR'],
        datasets: [{
          data: [25, 18, 22, 15, 12, 8],
          backgroundColor: [
            '#0066ff',
            '#00d4ff',
            '#00ff88',
            '#ff9800',
            '#9c27b0',
            '#f44336'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
}

// Setup Dashboard Events
function setupDashboardEvents() {
  // Refresh button
  const refreshBtn = document.getElementById('refreshDashboard');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.querySelector('i').classList.add('fa-spin');
      await loadDashboardData();
      setTimeout(() => {
        refreshBtn.querySelector('i').classList.remove('fa-spin');
      }, 1000);
    });
  }
  
  // Date range picker
  const dateRangeBtn = document.getElementById('dateRangeBtn');
  if (dateRangeBtn) {
    // TODO: Implement date range picker
  }
  
  // Chart filters
  const chartFilters = document.querySelectorAll('.chart-filter');
  chartFilters.forEach(filter => {
    filter.addEventListener('click', () => {
      chartFilters.forEach(f => f.classList.remove('active'));
      filter.classList.add('active');
      // TODO: Update chart data
    });
  });
  
  // Approve/Reject buttons
  const showToast = window.showToast || function(msg, type) { console.log(`[${type}] ${msg}`); };
  
  const approveBtns = document.querySelectorAll('.btn-approve');
  approveBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Approval action - Coming soon', 'info');
    });
  });
  
  const rejectBtns = document.querySelectorAll('.btn-reject');
  rejectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Rejection action - Coming soon', 'info');
    });
  });
}
