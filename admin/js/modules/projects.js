// =====================================================
// PROJECTS MODULE
// Complete project management system
// =====================================================

export async function render() {
  return `
    <div class="projects-module">
      <!-- Projects Header -->
      <div class="module-header">
        <div class="header-left">
          <h1 class="module-title">Projects</h1>
          <p class="module-subtitle">Manage and track all company projects</p>
        </div>
        <div class="header-right">
          <div class="view-toggle">
            <button class="view-btn active" data-view="grid">
              <i class="fas fa-th"></i>
            </button>
            <button class="view-btn" data-view="list">
              <i class="fas fa-list"></i>
            </button>
            <button class="view-btn" data-view="kanban">
              <i class="fas fa-columns"></i>
            </button>
          </div>
          <button class="btn-primary" id="newProjectBtn" ${!hasPermission('projects.create') ? 'style="display:none;"' : ''}>
            <i class="fas fa-plus"></i>
            New Project
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="filter-group">
          <button class="filter-btn active" data-filter="all">All Projects</button>
          <button class="filter-btn" data-filter="active">Active</button>
          <button class="filter-btn" data-filter="completed">Completed</button>
          <button class="filter-btn" data-filter="on-hold">On Hold</button>
        </div>
        <div class="filter-group">
          <select class="filter-select" id="departmentFilter">
            <option value="all">All Departments</option>
            <option value="marketing">Marketing</option>
            <option value="design">Design</option>
            <option value="development">Development</option>
            <option value="community">Community</option>
          </select>
          <select class="filter-select" id="statusFilter">
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Search projects..." id="projectSearch">
        </div>
      </div>

      <!-- Projects Grid -->
      <div class="projects-container" id="projectsContainer">
        <div class="projects-grid" id="projectsGrid">
          <!-- Project cards will be loaded here -->
        </div>
      </div>

      <!-- Project Card Template (hidden) -->
      <template id="projectCardTemplate">
        <div class="project-card" data-project-id="">
          <div class="project-header">
            <div class="project-icon">
              <i class="fas fa-project-diagram"></i>
            </div>
            <div class="project-menu">
              <button class="project-menu-btn">
                <i class="fas fa-ellipsis-v"></i>
              </button>
            </div>
          </div>
          <div class="project-body">
            <h3 class="project-title"></h3>
            <p class="project-description"></p>
            <div class="project-meta">
              <span class="project-department"></span>
              <span class="project-date"></span>
            </div>
            <div class="project-progress">
              <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
              </div>
              <span class="progress-text">0%</span>
            </div>
            <div class="project-team">
              <div class="team-avatars"></div>
              <span class="team-count">0 members</span>
            </div>
            <div class="project-stats">
              <div class="stat-item">
                <i class="fas fa-tasks"></i>
                <span class="task-count">0</span>
              </div>
              <div class="stat-item">
                <i class="fas fa-comments"></i>
                <span class="comment-count">0</span>
              </div>
              <div class="stat-item">
                <i class="fas fa-file"></i>
                <span class="file-count">0</span>
              </div>
            </div>
          </div>
          <div class="project-footer">
            <span class="project-status"></span>
            <button class="btn-view-project">View Details</button>
          </div>
        </div>
      </template>
    </div>
  `;
}

export async function init() {
  console.log('📁 Initializing Projects module...');
  
  // Load projects
  await loadProjects();
  
  // Setup event listeners
  setupProjectsEvents();
  
  console.log('✅ Projects module initialized');
}

// Load Projects
async function loadProjects() {
  try {
    // TODO: Load from API
    const projects = [
      {
        id: 1,
        title: 'Website Redesign',
        description: 'Complete redesign of company website with modern UI/UX',
        department: 'Marketing',
        status: 'in-progress',
        progress: 75,
        startDate: '2024-01-15',
        endDate: '2024-03-30',
        team: ['John Doe', 'Jane Smith', 'Mike Johnson'],
        tasks: 24,
        comments: 12,
        files: 8
      },
      {
        id: 2,
        title: 'Mobile App Launch',
        description: 'Development and launch of new mobile application',
        department: 'Development',
        status: 'in-progress',
        progress: 60,
        startDate: '2024-02-01',
        endDate: '2024-05-15',
        team: ['Sarah Wilson', 'Tom Brown'],
        tasks: 45,
        comments: 28,
        files: 15
      },
      {
        id: 3,
        title: 'Q1 Marketing Campaign',
        description: 'Quarterly marketing campaign across all channels',
        department: 'Marketing',
        status: 'completed',
        progress: 100,
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        team: ['Emily Davis', 'Chris Lee'],
        tasks: 18,
        comments: 9,
        files: 12
      },
      {
        id: 4,
        title: 'Brand Guidelines Update',
        description: 'Update and expand brand guidelines documentation',
        department: 'Design',
        status: 'review',
        progress: 90,
        startDate: '2024-02-10',
        endDate: '2024-03-20',
        team: ['Alex Martinez', 'Lisa Chen'],
        tasks: 12,
        comments: 6,
        files: 5
      }
    ];
    
    renderProjects(projects);
  } catch (error) {
    console.error('Error loading projects:', error);
    showToast('Error loading projects', 'error');
  }
}

// Render Projects
function renderProjects(projects) {
  const container = document.getElementById('projectsGrid');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (projects.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-project-diagram"></i>
        <h3>No projects found</h3>
        <p>Create your first project to get started</p>
        ${hasPermission('projects.create') ? '<button class="btn-primary">Create Project</button>' : ''}
      </div>
    `;
    return;
  }
  
  projects.forEach(project => {
    const card = createProjectCard(project);
    container.appendChild(card);
  });
}

// Create Project Card
function createProjectCard(project) {
  const template = document.getElementById('projectCardTemplate');
  if (!template) return document.createElement('div');
  
  const card = template.content.cloneNode(true).querySelector('.project-card');
  
  card.setAttribute('data-project-id', project.id);
  card.querySelector('.project-title').textContent = project.title;
  card.querySelector('.project-description').textContent = project.description;
  card.querySelector('.project-department').textContent = project.department;
  card.querySelector('.project-date').textContent = formatDateRange(project.startDate, project.endDate);
  card.querySelector('.progress-fill').style.width = project.progress + '%';
  card.querySelector('.progress-text').textContent = project.progress + '%';
  card.querySelector('.task-count').textContent = project.tasks;
  card.querySelector('.comment-count').textContent = project.comments;
  card.querySelector('.file-count').textContent = project.files;
  card.querySelector('.project-status').textContent = formatStatus(project.status);
  card.querySelector('.project-status').className = 'project-status ' + project.status;
  card.querySelector('.team-count').textContent = project.team.length + ' members';
  
  // Team avatars
  const avatarsContainer = card.querySelector('.team-avatars');
  project.team.slice(0, 3).forEach((member, index) => {
    const avatar = document.createElement('div');
    avatar.className = 'team-avatar';
    avatar.style.zIndex = 10 - index;
    avatar.innerHTML = `<i class="fas fa-user"></i>`;
    avatarsContainer.appendChild(avatar);
  });
  
  // View button
  const viewBtn = card.querySelector('.btn-view-project');
  viewBtn.addEventListener('click', () => {
    viewProjectDetails(project.id);
  });
  
  return card;
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
    'planning': 'Planning',
    'in-progress': 'In Progress',
    'review': 'In Review',
    'completed': 'Completed',
    'on-hold': 'On Hold'
  };
  return statusMap[status] || status;
}

// View Project Details
function viewProjectDetails(projectId) {
  showToast('Project details view - Coming soon', 'info');
  // TODO: Open project details modal or navigate to project page
}

// Setup Projects Events
function setupProjectsEvents() {
  // New project button
  const newProjectBtn = document.getElementById('newProjectBtn');
  if (newProjectBtn) {
    newProjectBtn.addEventListener('click', () => {
      showNewProjectModal();
    });
  }
  
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
  
  // Filters
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      applyFilter(filter);
    });
  });
  
  // Search
  const searchInput = document.getElementById('projectSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterProjects(e.target.value);
    });
  }
}

// Switch View
function switchView(view) {
  const container = document.getElementById('projectsContainer');
  if (!container) return;
  
  container.className = 'projects-container view-' + view;
  
  if (view === 'kanban') {
    // TODO: Load kanban view
    showToast('Kanban view - Coming soon', 'info');
  }
}

// Apply Filter
function applyFilter(filter) {
  // TODO: Filter projects
  console.log('Filter:', filter);
}

// Filter Projects
function filterProjects(searchTerm) {
  // TODO: Filter projects by search term
  console.log('Search:', searchTerm);
}

// Show New Project Modal
function showNewProjectModal() {
  showToast('New project form - Coming soon', 'info');
  // TODO: Open modal with project creation form
}

