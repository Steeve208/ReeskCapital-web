// =====================================================
// TASKS MODULE
// Task management and assignment system
// =====================================================

export async function render() {
  return `
    <div class="tasks-module">
      <!-- Tasks Header -->
      <div class="module-header">
        <div class="header-left">
          <h1 class="module-title">My Tasks</h1>
          <p class="module-subtitle">Manage your assigned tasks and deadlines</p>
        </div>
        <div class="header-right">
          <button class="btn-secondary" id="filterTasksBtn">
            <i class="fas fa-filter"></i>
            Filters
          </button>
          <button class="btn-primary" id="newTaskBtn" ${!hasPermission('tasks.create') ? 'style="display:none;"' : ''}>
            <i class="fas fa-plus"></i>
            New Task
          </button>
        </div>
      </div>

      <!-- Task Stats -->
      <div class="task-stats">
        <div class="task-stat-card">
          <div class="stat-icon todo">
            <i class="fas fa-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value" id="todoCount">0</div>
            <div class="stat-label">To Do</div>
          </div>
        </div>
        <div class="task-stat-card">
          <div class="stat-icon in-progress">
            <i class="fas fa-spinner"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value" id="inProgressCount">0</div>
            <div class="stat-label">In Progress</div>
          </div>
        </div>
        <div class="task-stat-card">
          <div class="stat-icon review">
            <i class="fas fa-eye"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value" id="reviewCount">0</div>
            <div class="stat-label">In Review</div>
          </div>
        </div>
        <div class="task-stat-card">
          <div class="stat-icon completed">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value" id="completedCount">0</div>
            <div class="stat-label">Completed</div>
          </div>
        </div>
        <div class="task-stat-card">
          <div class="stat-icon overdue">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value" id="overdueCount">0</div>
            <div class="stat-label">Overdue</div>
          </div>
        </div>
      </div>

      <!-- Task List -->
      <div class="tasks-container">
        <div class="tasks-list" id="tasksList">
          <!-- Tasks will be loaded here -->
        </div>
      </div>
    </div>
  `;
}

export async function init() {
  console.log('✅ Initializing Tasks module...');
  
  // Load tasks
  await loadTasks();
  
  // Setup event listeners
  setupTasksEvents();
  
  console.log('✅ Tasks module initialized');
}

// Load Tasks
async function loadTasks() {
  try {
    // TODO: Load from API
    const tasks = [
      {
        id: 1,
        title: 'Design landing page hero section',
        description: 'Create modern hero section with CTA buttons',
        project: 'Website Redesign',
        status: 'in-progress',
        priority: 'high',
        dueDate: '2024-03-15',
        assignee: 'John Doe',
        tags: ['Design', 'UI/UX']
      },
      {
        id: 2,
        title: 'Review marketing campaign content',
        description: 'Review and approve Q1 campaign content',
        project: 'Q1 Marketing Campaign',
        status: 'review',
        priority: 'medium',
        dueDate: '2024-03-10',
        assignee: 'Jane Smith',
        tags: ['Marketing', 'Review']
      },
      {
        id: 3,
        title: 'Update brand guidelines',
        description: 'Add new color palette to brand guidelines',
        project: 'Brand Guidelines Update',
        status: 'todo',
        priority: 'low',
        dueDate: '2024-03-20',
        assignee: 'Alex Martinez',
        tags: ['Design', 'Brand']
      },
      {
        id: 4,
        title: 'Fix mobile app navigation bug',
        description: 'Navigation menu not working on iOS devices',
        project: 'Mobile App Launch',
        status: 'in-progress',
        priority: 'high',
        dueDate: '2024-03-08',
        assignee: 'Sarah Wilson',
        tags: ['Development', 'Bug Fix']
      }
    ];
    
    renderTasks(tasks);
    updateTaskStats(tasks);
  } catch (error) {
    console.error('Error loading tasks:', error);
    showToast('Error loading tasks', 'error');
  }
}

// Render Tasks
function renderTasks(tasks) {
  const container = document.getElementById('tasksList');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-tasks"></i>
        <h3>No tasks found</h3>
        <p>You're all caught up! 🎉</p>
      </div>
    `;
    return;
  }
  
  // Group by status
  const grouped = groupTasksByStatus(tasks);
  
  // Render each group
  Object.keys(grouped).forEach(status => {
    const group = document.createElement('div');
    group.className = 'task-group';
    group.innerHTML = `
      <div class="task-group-header">
        <h3>${formatStatus(status)}</h3>
        <span class="task-count">${grouped[status].length}</span>
      </div>
      <div class="task-group-items"></div>
    `;
    
    const itemsContainer = group.querySelector('.task-group-items');
    grouped[status].forEach(task => {
      const taskItem = createTaskItem(task);
      itemsContainer.appendChild(taskItem);
    });
    
    container.appendChild(group);
  });
}

// Group Tasks by Status
function groupTasksByStatus(tasks) {
  const groups = {
    'todo': [],
    'in-progress': [],
    'review': [],
    'completed': []
  };
  
  tasks.forEach(task => {
    if (groups[task.status]) {
      groups[task.status].push(task);
    }
  });
  
  return groups;
}

// Create Task Item
function createTaskItem(task) {
  const item = document.createElement('div');
  item.className = `task-item task-${task.status} task-priority-${task.priority}`;
  item.setAttribute('data-task-id', task.id);
  
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
  
  item.innerHTML = `
    <div class="task-checkbox">
      <input type="checkbox" ${task.status === 'completed' ? 'checked' : ''} onchange="toggleTaskComplete(${task.id})">
    </div>
    <div class="task-content">
      <div class="task-header">
        <h4 class="task-title">${task.title}</h4>
        <div class="task-priority priority-${task.priority}">
          <i class="fas fa-${getPriorityIcon(task.priority)}"></i>
        </div>
      </div>
      <p class="task-description">${task.description}</p>
      <div class="task-meta">
        <span class="task-project">
          <i class="fas fa-project-diagram"></i>
          ${task.project}
        </span>
        <span class="task-due-date ${isOverdue ? 'overdue' : ''}">
          <i class="fas fa-calendar"></i>
          ${formatDate(task.dueDate)}
        </span>
      </div>
      <div class="task-tags">
        ${task.tags.map(tag => `<span class="task-tag">${tag}</span>`).join('')}
      </div>
    </div>
    <div class="task-actions">
      <button class="task-action-btn" onclick="viewTaskDetails(${task.id})">
        <i class="fas fa-eye"></i>
      </button>
      <button class="task-action-btn" onclick="editTask(${task.id})">
        <i class="fas fa-edit"></i>
      </button>
    </div>
  `;
  
  return item;
}

// Update Task Stats
function updateTaskStats(tasks) {
  const stats = {
    todo: 0,
    'in-progress': 0,
    review: 0,
    completed: 0,
    overdue: 0
  };
  
  tasks.forEach(task => {
    stats[task.status]++;
    if (new Date(task.dueDate) < new Date() && task.status !== 'completed') {
      stats.overdue++;
    }
  });
  
  updateStat('todoCount', stats.todo);
  updateStat('inProgressCount', stats['in-progress']);
  updateStat('reviewCount', stats.review);
  updateStat('completedCount', stats.completed);
  updateStat('overdueCount', stats.overdue);
}

// Update Stat
function updateStat(id, value) {
  const element = document.getElementById(id);
  if (element) {
    animateNumber(element, value);
  }
}

// Get Priority Icon
function getPriorityIcon(priority) {
  const icons = {
    'high': 'exclamation-circle',
    'medium': 'minus-circle',
    'low': 'arrow-down'
  };
  return icons[priority] || 'circle';
}

// Format Date
function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays <= 7) return `In ${diffDays} days`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Format Status
function formatStatus(status) {
  const statusMap = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'review': 'In Review',
    'completed': 'Completed'
  };
  return statusMap[status] || status;
}

// Setup Tasks Events
function setupTasksEvents() {
  // New task button
  const newTaskBtn = document.getElementById('newTaskBtn');
  if (newTaskBtn) {
    newTaskBtn.addEventListener('click', () => {
      showNewTaskModal();
    });
  }
}

// Toggle Task Complete
window.toggleTaskComplete = function(taskId) {
  showToast('Task status updated', 'success');
  // TODO: Update task status via API
};

// View Task Details
window.viewTaskDetails = function(taskId) {
  showToast('Task details - Coming soon', 'info');
  // TODO: Open task details modal
};

// Edit Task
window.editTask = function(taskId) {
  showToast('Edit task - Coming soon', 'info');
  // TODO: Open task edit modal
};

// Show New Task Modal
function showNewTaskModal() {
  showToast('New task form - Coming soon', 'info');
  // TODO: Open modal with task creation form
}

