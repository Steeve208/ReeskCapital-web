// Admin Panel for Feature Flag Management
// This script provides a simple interface to toggle features on/off

class AdminPanel {
  constructor() {
    this.isVisible = false;
    this.init();
  }

  init() {
    // Create admin panel HTML
    this.createAdminPanel();
    
    // Add keyboard shortcut (Ctrl+Shift+A) to toggle admin panel
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        this.togglePanel();
      }
    });
  }

  createAdminPanel() {
    // Create admin panel container
    const adminPanel = document.createElement('div');
    adminPanel.id = 'adminPanel';
    adminPanel.className = 'admin-panel';
    adminPanel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      background: rgba(0, 0, 0, 0.95);
      border: 2px solid #00ff88;
      border-radius: 10px;
      padding: 20px;
      color: white;
      font-family: 'Inter', sans-serif;
      z-index: 10000;
      display: none;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 255, 136, 0.3);
    `;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #00ff88;
    `;
    
    const title = document.createElement('h3');
    title.textContent = '🔧 Admin Panel';
    title.style.margin = '0';
    title.style.color = '#00ff88';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: #00ff88;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
    `;
    closeBtn.onclick = () => this.togglePanel();
    
    header.appendChild(title);
    header.appendChild(closeBtn);

    // Create feature flags section
    const flagsSection = document.createElement('div');
    flagsSection.innerHTML = `
      <h4 style="margin: 0 0 15px 0; color: #00ff88;">Feature Flags</h4>
      <div id="featureFlagsList"></div>
    `;

    // Create instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid #333;
      font-size: 12px;
      color: #888;
    `;
    instructions.innerHTML = `
      <strong>Shortcuts:</strong><br>
      • Ctrl+Shift+A: Toggle panel<br>
      • Changes apply immediately<br>
      • Refresh page to reset
    `;

    adminPanel.appendChild(header);
    adminPanel.appendChild(flagsSection);
    adminPanel.appendChild(instructions);
    document.body.appendChild(adminPanel);

    this.panel = adminPanel;
    this.updateFeatureFlagsList();
  }

  updateFeatureFlagsList() {
    const flagsList = document.getElementById('featureFlagsList');
    if (!flagsList) return;

    flagsList.innerHTML = '';
    
    const flags = window.getAllFeatureFlags ? window.getAllFeatureFlags() : {};
    
    Object.entries(flags).forEach(([flagName, isEnabled]) => {
      const flagItem = document.createElement('div');
      flagItem.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding: 8px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 5px;
      `;

      const label = document.createElement('label');
      label.textContent = flagName;
      label.style.cssText = `
        font-size: 14px;
        color: ${isEnabled ? '#00ff88' : '#ff4444'};
        cursor: pointer;
      `;

      const toggle = document.createElement('input');
      toggle.type = 'checkbox';
      toggle.checked = isEnabled;
      toggle.style.cssText = `
        width: 40px;
        height: 20px;
        appearance: none;
        background: ${isEnabled ? '#00ff88' : '#333'};
        border-radius: 10px;
        position: relative;
        cursor: pointer;
        transition: background 0.3s;
      `;

      toggle.onchange = () => {
        const newValue = toggle.checked;
        if (window.setFeatureFlag) {
          window.setFeatureFlag(flagName, newValue);
        }
        
        // Update visual state
        label.style.color = newValue ? '#00ff88' : '#ff4444';
        toggle.style.background = newValue ? '#00ff88' : '#333';
        
        // Handle special cases
        if (flagName === 'BANK_ENABLED') {
          if (newValue) {
            if (window.showBankFeatures) window.showBankFeatures();
          } else {
            if (window.hideBankFeatures) window.hideBankFeatures();
          }
        }
      };

      flagItem.appendChild(label);
      flagItem.appendChild(toggle);
      flagsList.appendChild(flagItem);
    });
  }

  togglePanel() {
    this.isVisible = !this.isVisible;
    this.panel.style.display = this.isVisible ? 'block' : 'none';
    
    if (this.isVisible) {
      this.updateFeatureFlagsList();
    }
  }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize if feature flags are available
  if (window.FEATURE_FLAGS) {
    new AdminPanel();
    console.log('Admin panel initialized. Press Ctrl+Shift+A to toggle.');
  }
}); 