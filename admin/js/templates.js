/**
 * ADMIN PANEL - HTML TEMPLATES (English placeholders)
 * Each module shows a simple loading placeholder. Real content is rendered by module JS files.
 */

function loadingTemplate(label) {
  return `
    <div style="text-align:center;padding:4rem;">
      <i class="fas fa-tools" style="font-size:2rem;color:var(--primary);"></i>
      <p style="margin-top:1rem;color:var(--text-secondary);">${label} module is coming soon.</p>
    </div>
  `;
}

const AdminTemplates = {
  dashboard: () => loadingTemplate('dashboard'),
  content: () => loadingTemplate('content management'),
  users: () => loadingTemplate('users'),
  'social-metrics': () => loadingTemplate('social metrics'),
  metrics: () => loadingTemplate('system metrics'),
  campaigns: () => loadingTemplate('Campaigns'),
  rewards: () => loadingTemplate('Rewards'),
  jobs: () => loadingTemplate('Automation'),
  treasury: () => loadingTemplate('Treasury'),
  settings: () => loadingTemplate('Settings'),
  audit: () => loadingTemplate('Audit log'),
  admins: () => loadingTemplate('administrators')
};

// Export
window.AdminTemplates = AdminTemplates;

