// Dashboard simplificado que definitivamente funciona
export async function render() {
  const AdminState = window.AdminState || {};
  const user = AdminState.currentUser || { name: 'User', email: 'user@rscchain.com' };
  
  return `
    <div class="dashboard-module" style="padding: 2rem;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h1 style="color: var(--text-primary); margin-bottom: 1rem;">Corporate Dashboard</h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">Welcome back, ${user.name || 'User'}</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
          <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
              <h3 style="color: var(--text-secondary); font-size: 0.9rem; font-weight: 500;">Total Employees</h3>
              <div style="color: var(--success); font-size: 0.85rem;">
                <i class="fas fa-arrow-up"></i> +12%
              </div>
            </div>
            <div style="font-size: 2rem; font-weight: 600; color: var(--text-primary);" id="totalEmployees">156</div>
          </div>
          
          <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
              <h3 style="color: var(--text-secondary); font-size: 0.9rem; font-weight: 500;">Active Projects</h3>
              <div style="color: var(--success); font-size: 0.85rem;">
                <i class="fas fa-arrow-up"></i> +8%
              </div>
            </div>
            <div style="font-size: 2rem; font-weight: 600; color: var(--text-primary);" id="activeProjects">42</div>
          </div>
          
          <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
              <h3 style="color: var(--text-secondary); font-size: 0.9rem; font-weight: 500;">Pending Tasks</h3>
              <div style="color: var(--warning); font-size: 0.85rem;">
                <i class="fas fa-arrow-down"></i> -5%
              </div>
            </div>
            <div style="font-size: 2rem; font-weight: 600; color: var(--text-primary);" id="pendingTasks">128</div>
          </div>
          
          <div style="background: var(--card-bg); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
              <h3 style="color: var(--text-secondary); font-size: 0.9rem; font-weight: 500;">Monthly Revenue</h3>
              <div style="color: var(--success); font-size: 0.85rem;">
                <i class="fas fa-arrow-up"></i> +15%
              </div>
            </div>
            <div style="font-size: 2rem; font-weight: 600; color: var(--text-primary);" id="monthlyRevenue">$2.45M</div>
          </div>
        </div>
        
        <div style="background: var(--card-bg); padding: 2rem; border-radius: 12px; border: 1px solid var(--border-color);">
          <h2 style="color: var(--text-primary); margin-bottom: 1.5rem;">Recent Activity</h2>
          <div style="space-y: 1rem;">
            <div style="padding: 1rem; background: rgba(0,0,0,0.1); border-radius: 8px; margin-bottom: 1rem;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; color: white;">
                  <i class="fas fa-user"></i>
                </div>
                <div style="flex: 1;">
                  <div style="color: var(--text-primary); font-weight: 500;">New employee onboarded</div>
                  <div style="color: var(--text-secondary); font-size: 0.85rem;">2 hours ago</div>
                </div>
              </div>
            </div>
            
            <div style="padding: 1rem; background: rgba(0,0,0,0.1); border-radius: 8px; margin-bottom: 1rem;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--success); display: flex; align-items: center; justify-content: center; color: white;">
                  <i class="fas fa-check"></i>
                </div>
                <div style="flex: 1;">
                  <div style="color: var(--text-primary); font-weight: 500;">Project milestone completed</div>
                  <div style="color: var(--text-secondary); font-size: 0.85rem;">5 hours ago</div>
                </div>
              </div>
            </div>
            
            <div style="padding: 1rem; background: rgba(0,0,0,0.1); border-radius: 8px;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--warning); display: flex; align-items: center; justify-content: center; color: white;">
                  <i class="fas fa-exclamation"></i>
                </div>
                <div style="flex: 1;">
                  <div style="color: var(--text-primary); font-weight: 500;">Pending approval required</div>
                  <div style="color: var(--text-secondary); font-size: 0.85rem;">1 day ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function init() {
  console.log('✅ Dashboard simple inicializado');
  // No hacer nada complejo, solo log
}

