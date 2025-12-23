// =====================================================
// EXECUTIVE DASHBOARD MODULE
// High-level KPIs and metrics for executives
// =====================================================

export async function render() {
  return `
    <div class="executive-module">
      <!-- Executive Header -->
      <div class="executive-header">
        <div class="header-left">
          <h1 class="module-title">Executive Dashboard</h1>
          <p class="module-subtitle">High-level overview of company performance and KPIs</p>
        </div>
        <div class="header-right">
          <div class="executive-filters">
            <select class="filter-select" id="executivePeriod">
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <button class="btn-secondary" id="exportReportBtn">
            <i class="fas fa-file-export"></i>
            Export Report
          </button>
        </div>
      </div>

      <!-- Key Performance Indicators -->
      <div class="kpi-grid">
        <div class="kpi-card primary">
          <div class="kpi-header">
            <h3>Total Revenue</h3>
            <div class="kpi-trend up">
              <i class="fas fa-arrow-up"></i>
              <span>+23.5%</span>
            </div>
          </div>
          <div class="kpi-value">$12.5M</div>
          <div class="kpi-change">vs $10.1M last period</div>
          <div class="kpi-chart-mini">
            <canvas id="revenueMiniChart"></canvas>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <h3>Active Employees</h3>
            <div class="kpi-trend up">
              <i class="fas fa-arrow-up"></i>
              <span>+12%</span>
            </div>
          </div>
          <div class="kpi-value">156</div>
          <div class="kpi-change">+24 this month</div>
          <div class="kpi-chart-mini">
            <canvas id="employeesMiniChart"></canvas>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <h3>Active Projects</h3>
            <div class="kpi-trend up">
              <i class="fas fa-arrow-up"></i>
              <span>+8%</span>
            </div>
          </div>
          <div class="kpi-value">42</div>
          <div class="kpi-change">12 completed this month</div>
          <div class="kpi-chart-mini">
            <canvas id="projectsMiniChart"></canvas>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <h3>Customer Growth</h3>
            <div class="kpi-trend up">
              <i class="fas fa-arrow-up"></i>
              <span>+18%</span>
            </div>
          </div>
          <div class="kpi-value">125.4K</div>
          <div class="kpi-change">+2.5K this week</div>
          <div class="kpi-chart-mini">
            <canvas id="customersMiniChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Strategic Metrics -->
      <div class="strategic-metrics">
        <div class="strategic-chart-card">
          <div class="chart-header">
            <h3>Revenue by Department</h3>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-color" style="background: #0066ff;"></span> Marketing</span>
              <span class="legend-item"><span class="legend-color" style="background: #00d4ff;"></span> Sales</span>
              <span class="legend-item"><span class="legend-color" style="background: #00ff88;"></span> Operations</span>
            </div>
          </div>
          <div class="chart-body-large">
            <canvas id="departmentRevenueChart"></canvas>
          </div>
        </div>

        <div class="strategic-chart-card">
          <div class="chart-header">
            <h3>Employee Distribution</h3>
          </div>
          <div class="chart-body-large">
            <canvas id="employeeDistributionChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Department Performance -->
      <div class="department-performance">
        <h2 class="section-title">Department Performance</h2>
        <div class="performance-table-container">
          <table class="performance-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Employees</th>
                <th>Active Projects</th>
                <th>Budget</th>
                <th>Spent</th>
                <th>Efficiency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="performanceTableBody">
              <!-- Performance data will be loaded here -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Risk Indicators -->
      <div class="risk-indicators">
        <h2 class="section-title">Risk Indicators</h2>
        <div class="risk-grid">
          <div class="risk-card low">
            <div class="risk-icon">
              <i class="fas fa-shield-alt"></i>
            </div>
            <div class="risk-content">
              <h4>Compliance Risk</h4>
              <div class="risk-level">Low</div>
              <p>All compliance requirements met</p>
            </div>
          </div>
          <div class="risk-card medium">
            <div class="risk-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="risk-content">
              <h4>Financial Risk</h4>
              <div class="risk-level">Medium</div>
              <p>3 pending approvals over $50K</p>
            </div>
          </div>
          <div class="risk-card low">
            <div class="risk-icon">
              <i class="fas fa-users"></i>
            </div>
            <div class="risk-content">
              <h4>HR Risk</h4>
              <div class="risk-level">Low</div>
              <p>No critical positions vacant</p>
            </div>
          </div>
          <div class="risk-card low">
            <div class="risk-icon">
              <i class="fas fa-server"></i>
            </div>
            <div class="risk-content">
              <h4>Technical Risk</h4>
              <div class="risk-level">Low</div>
              <p>System uptime: 99.99%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function init() {
  console.log('👔 Initializing Executive Dashboard module...');
  
  // Load executive data
  await loadExecutiveData();
  
  // Initialize charts
  initExecutiveCharts();
  
  // Setup event listeners
  setupExecutiveEvents();
  
  console.log('✅ Executive Dashboard module initialized');
}

// Load Executive Data
async function loadExecutiveData() {
  try {
    // TODO: Load from API
    const performanceData = [
      {
        department: 'Marketing',
        employees: 12,
        activeProjects: 8,
        budget: 500000,
        spent: 325000,
        efficiency: 92
      },
      {
        department: 'Design',
        employees: 8,
        activeProjects: 15,
        budget: 300000,
        spent: 245000,
        efficiency: 88
      },
      {
        department: 'Development',
        employees: 15,
        activeProjects: 6,
        budget: 750000,
        spent: 680000,
        efficiency: 95
      },
      {
        department: 'Community',
        employees: 6,
        activeProjects: 4,
        budget: 200000,
        spent: 185000,
        efficiency: 90
      },
      {
        department: 'Finance',
        employees: 5,
        activeProjects: 2,
        budget: 400000,
        spent: 320000,
        efficiency: 85
      },
      {
        department: 'HR',
        employees: 4,
        activeProjects: 3,
        budget: 250000,
        spent: 210000,
        efficiency: 87
      }
    ];
    
    renderPerformanceTable(performanceData);
  } catch (error) {
    console.error('Error loading executive data:', error);
    showToast('Error loading executive data', 'error');
  }
}

// Render Performance Table
function renderPerformanceTable(data) {
  const tbody = document.getElementById('performanceTableBody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  data.forEach(dept => {
    const row = document.createElement('tr');
    const budgetPercent = (dept.spent / dept.budget) * 100;
    
    row.innerHTML = `
      <td>
        <div class="dept-cell">
          <strong>${dept.department}</strong>
        </div>
      </td>
      <td>${dept.employees}</td>
      <td>${dept.activeProjects}</td>
      <td>$${dept.budget.toLocaleString()}</td>
      <td>$${dept.spent.toLocaleString()}</td>
      <td>
        <div class="efficiency-bar">
          <div class="efficiency-fill" style="width: ${dept.efficiency}%"></div>
          <span class="efficiency-text">${dept.efficiency}%</span>
        </div>
      </td>
      <td>
        <span class="status-badge ${budgetPercent > 90 ? 'warning' : 'success'}">
          ${budgetPercent > 90 ? 'Over Budget' : 'On Track'}
        </span>
      </td>
    `;
    
    tbody.appendChild(row);
  });
}

// Initialize Executive Charts
function initExecutiveCharts() {
  // Mini charts for KPIs
  initMiniCharts();
  
  // Department Revenue Chart
  const deptRevenueCtx = document.getElementById('departmentRevenueChart');
  if (deptRevenueCtx) {
    new Chart(deptRevenueCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Marketing',
            data: [1.2, 1.5, 1.8, 1.6, 2.0, 2.2],
            backgroundColor: '#0066ff'
          },
          {
            label: 'Sales',
            data: [2.5, 2.8, 3.1, 2.9, 3.4, 3.6],
            backgroundColor: '#00d4ff'
          },
          {
            label: 'Operations',
            data: [1.8, 2.0, 2.2, 2.1, 2.5, 2.7],
            backgroundColor: '#00ff88'
          }
        ]
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
  
  // Employee Distribution Chart
  const empDistCtx = document.getElementById('employeeDistributionChart');
  if (empDistCtx) {
    new Chart(empDistCtx, {
      type: 'doughnut',
      data: {
        labels: ['Marketing', 'Design', 'Development', 'Community', 'Finance', 'HR'],
        datasets: [{
          data: [12, 8, 15, 6, 5, 4],
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

// Initialize Mini Charts
function initMiniCharts() {
  const miniCharts = ['revenueMiniChart', 'employeesMiniChart', 'projectsMiniChart', 'customersMiniChart'];
  
  miniCharts.forEach(chartId => {
    const ctx = document.getElementById(chartId);
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['W1', 'W2', 'W3', 'W4'],
          datasets: [{
            data: [10, 11, 12, 12.5],
            borderColor: '#0066ff',
            backgroundColor: 'rgba(0, 102, 255, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { display: false },
            y: { display: false }
          }
        }
      });
    }
  });
}

// Setup Executive Events
function setupExecutiveEvents() {
  // Export report
  const exportBtn = document.getElementById('exportReportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      showToast('Exporting executive report...', 'info');
      // TODO: Generate and download report
    });
  }
  
  // Period filter
  const periodSelect = document.getElementById('executivePeriod');
  if (periodSelect) {
    periodSelect.addEventListener('change', () => {
      const period = periodSelect.value;
      if (period === 'custom') {
        // TODO: Open date range picker
        showToast('Custom date range - Coming soon', 'info');
      } else {
        loadExecutiveData();
      }
    });
  }
}

