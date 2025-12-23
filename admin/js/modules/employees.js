// =====================================================
// EMPLOYEES MODULE
// Complete HR and employee management system
// =====================================================

export async function render() {
  return `
    <div class="employees-module">
      <!-- Employees Header -->
      <div class="module-header">
        <div class="header-left">
          <h1 class="module-title">Employee Directory</h1>
          <p class="module-subtitle">Manage employees, departments, and organizational structure</p>
        </div>
        <div class="header-right">
          <button class="btn-secondary" id="exportEmployeesBtn">
            <i class="fas fa-download"></i>
            Export
          </button>
          <button class="btn-primary" id="newEmployeeBtn" ${!hasPermission('employees.create') ? 'style="display:none;"' : ''}>
            <i class="fas fa-user-plus"></i>
            Add Employee
          </button>
        </div>
      </div>

      <!-- Employee Stats -->
      <div class="employee-stats">
        <div class="employee-stat-card">
          <div class="stat-icon total">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value" id="totalEmployees">0</div>
            <div class="stat-label">Total Employees</div>
          </div>
        </div>
        <div class="employee-stat-card">
          <div class="stat-icon active">
            <i class="fas fa-user-check"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value" id="activeEmployees">0</div>
            <div class="stat-label">Active</div>
          </div>
        </div>
        <div class="employee-stat-card">
          <div class="stat-icon departments">
            <i class="fas fa-building"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value" id="totalDepartments">0</div>
            <div class="stat-label">Departments</div>
          </div>
        </div>
        <div class="employee-stat-card">
          <div class="stat-icon new-hires">
            <i class="fas fa-user-plus"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value" id="newHires">0</div>
            <div class="stat-label">New Hires (30d)</div>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="filters-bar">
        <div class="filter-group">
          <select class="filter-select" id="departmentFilter">
            <option value="all">All Departments</option>
            <option value="marketing">Marketing</option>
            <option value="design">Design</option>
            <option value="development">Development</option>
            <option value="community">Community</option>
            <option value="finance">Finance</option>
            <option value="hr">Human Resources</option>
          </select>
          <select class="filter-select" id="roleFilter">
            <option value="all">All Roles</option>
            <option value="ceo">CEO</option>
            <option value="director">Director</option>
            <option value="manager">Manager</option>
            <option value="specialist">Specialist</option>
          </select>
          <select class="filter-select" id="statusFilter">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="on-leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Search employees..." id="employeeSearch">
        </div>
      </div>

      <!-- Employees Table -->
      <div class="employees-table-container">
        <table class="employees-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Role</th>
              <th>Email</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="employeesTableBody">
            <!-- Employees will be loaded here -->
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export async function init() {
  console.log('👥 Initializing Employees module...');
  
  // Load employees
  await loadEmployees();
  
  // Setup event listeners
  setupEmployeesEvents();
  
  console.log('✅ Employees module initialized');
}

// Load Employees
async function loadEmployees() {
  try {
    // TODO: Load from API
    const employees = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@rscchain.com',
        department: 'Marketing',
        role: 'Marketing Manager',
        status: 'active',
        joinDate: '2023-01-15',
        avatar: null
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@rscchain.com',
        department: 'Design',
        role: 'Senior Designer',
        status: 'active',
        joinDate: '2023-03-20',
        avatar: null
      },
      {
        id: 3,
        name: 'Mike Johnson',
        email: 'mike.johnson@rscchain.com',
        department: 'Development',
        role: 'Senior Developer',
        status: 'active',
        joinDate: '2023-02-10',
        avatar: null
      },
      {
        id: 4,
        name: 'Emily Davis',
        email: 'emily.davis@rscchain.com',
        department: 'Marketing',
        role: 'Community Manager',
        status: 'active',
        joinDate: '2023-05-01',
        avatar: null
      },
      {
        id: 5,
        name: 'Alex Martinez',
        email: 'alex.martinez@rscchain.com',
        department: 'Design',
        role: 'Designer',
        status: 'active',
        joinDate: '2024-01-10',
        avatar: null
      }
    ];
    
    renderEmployees(employees);
    updateEmployeeStats(employees);
  } catch (error) {
    console.error('Error loading employees:', error);
    showToast('Error loading employees', 'error');
  }
}

// Render Employees
function renderEmployees(employees) {
  const tbody = document.getElementById('employeesTableBody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (employees.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state-cell">
          <div class="empty-state">
            <i class="fas fa-users"></i>
            <h3>No employees found</h3>
            <p>Add your first employee to get started</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  employees.forEach(employee => {
    const row = createEmployeeRow(employee);
    tbody.appendChild(row);
  });
}

// Create Employee Row
function createEmployeeRow(employee) {
  const row = document.createElement('tr');
  row.className = 'employee-row';
  row.setAttribute('data-employee-id', employee.id);
  
  row.innerHTML = `
    <td>
      <div class="employee-cell">
        <div class="employee-avatar">
          ${employee.avatar 
            ? `<img src="${employee.avatar}" alt="${employee.name}">`
            : `<i class="fas fa-user"></i>`
          }
        </div>
        <div class="employee-info">
          <div class="employee-name">${employee.name}</div>
        </div>
      </div>
    </td>
    <td>
      <span class="department-badge dept-${employee.department.toLowerCase()}">
        ${employee.department}
      </span>
    </td>
    <td>${employee.role}</td>
    <td>${employee.email}</td>
    <td>
      <span class="status-badge status-${employee.status}">
        ${formatStatus(employee.status)}
      </span>
    </td>
    <td>${formatDate(employee.joinDate)}</td>
    <td>
      <div class="table-actions">
        <button class="action-btn" onclick="viewEmployee(${employee.id})" title="View">
          <i class="fas fa-eye"></i>
        </button>
        ${hasPermission('employees.edit') ? `
          <button class="action-btn" onclick="editEmployee(${employee.id})" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
        ` : ''}
        ${hasPermission('employees.delete') ? `
          <button class="action-btn danger" onclick="deleteEmployee(${employee.id})" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        ` : ''}
      </div>
    </td>
  `;
  
  return row;
}

// Update Employee Stats
function updateEmployeeStats(employees) {
  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    departments: new Set(employees.map(e => e.department)).size,
    newHires: employees.filter(e => {
      const joinDate = new Date(e.joinDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return joinDate >= thirtyDaysAgo;
    }).length
  };
  
  updateStat('totalEmployees', stats.total);
  updateStat('activeEmployees', stats.active);
  updateStat('totalDepartments', stats.departments);
  updateStat('newHires', stats.newHires);
}

// Update Stat
function updateStat(id, value) {
  const element = document.getElementById(id);
  if (element) {
    animateNumber(element, value);
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
    
    element.textContent = current;
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target;
    }
  }
  
  requestAnimationFrame(update);
}

// Format Status
function formatStatus(status) {
  const statusMap = {
    'active': 'Active',
    'on-leave': 'On Leave',
    'inactive': 'Inactive'
  };
  return statusMap[status] || status;
}

// Format Date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Setup Employees Events
function setupEmployeesEvents() {
  // New employee button
  const newEmployeeBtn = document.getElementById('newEmployeeBtn');
  if (newEmployeeBtn) {
    newEmployeeBtn.addEventListener('click', () => {
      showNewEmployeeModal();
    });
  }
  
  // Search
  const searchInput = document.getElementById('employeeSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterEmployees(e.target.value);
    });
  }
  
  // Filters
  const filters = ['departmentFilter', 'roleFilter', 'statusFilter'];
  filters.forEach(filterId => {
    const filter = document.getElementById(filterId);
    if (filter) {
      filter.addEventListener('change', () => {
        applyFilters();
      });
    }
  });
}

// Filter Employees
function filterEmployees(searchTerm) {
  // TODO: Filter employees
  console.log('Search:', searchTerm);
}

// Apply Filters
function applyFilters() {
  // TODO: Apply all filters
  console.log('Applying filters...');
}

// View Employee
window.viewEmployee = function(employeeId) {
  showToast('Employee details - Coming soon', 'info');
  // TODO: Open employee details modal
};

// Edit Employee
window.editEmployee = function(employeeId) {
  showToast('Edit employee - Coming soon', 'info');
  // TODO: Open employee edit modal
};

// Delete Employee
window.deleteEmployee = function(employeeId) {
  if (confirm('Are you sure you want to delete this employee?')) {
    showToast('Employee deleted', 'success');
    // TODO: Delete via API
  }
};

// Show New Employee Modal
function showNewEmployeeModal() {
  showToast('New employee form - Coming soon', 'info');
  // TODO: Open modal with employee creation form
}

