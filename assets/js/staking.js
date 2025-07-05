// =====================
// STAKING FUNCTIONALITY
// =====================

class RSCStaking {
    constructor() {
        this.stakedAmount = 45250.00;
        this.rewards = 2847.32;
        this.currentAPY = 13.2;
        this.pools = [];
        this.validators = [];
        this.history = [];
        
        this.init();
    }

    init() {
        this.loadPools();
        this.loadValidators();
        this.loadHistory();
        this.initChart();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Pool filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterPools(e.target.dataset.filter);
            });
        });

        // Stake form
        document.getElementById('stakeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitStaking();
        });

        // Unstake form
        document.getElementById('unstakeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitUnstaking();
        });

        // Modal close events
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                modal.style.display = 'none';
            });
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Form inputs
        document.getElementById('stakeAmount').addEventListener('input', () => {
            this.updateStakingSummary();
        });

        document.getElementById('stakeDuration').addEventListener('change', () => {
            this.updateStakingSummary();
        });

        document.getElementById('unstakeAmount').addEventListener('input', () => {
            this.updateUnstakingSummary();
        });
    }

    initChart() {
        const ctx = document.getElementById('stakingChart').getContext('2d');
        
        // Generate sample data
        const data = [];
        const labels = [];
        let value = 40000;
        
        for (let i = 0; i < 30; i++) {
            value += (Math.random() - 0.3) * 2000; // Slight upward trend
            data.push(value);
            labels.push(`Día ${i + 1}`);
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Staked RSC',
                    data: data,
                    borderColor: '#3fd8c2',
                    backgroundColor: 'rgba(63, 216, 194, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#7657fc'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    async loadPools() {
        try {
            const res = await fetch('/api/staking/pools');
            if (!res.ok) throw new Error('No se pudo obtener los pools');
            const data = await res.json();
            this.pools = Array.isArray(data.pools) ? data.pools : [];
        } catch (err) {
            // Fallback a pools simulados si la API no responde
            this.pools = [
                { id: 'pool1', name: 'RSC Premium', apy: 13.2, minStake: 1000, maxStake: 100000, totalStaked: 1250000, participants: 1250, risk: 'low', badge: 'Popular' },
                { id: 'pool2', name: 'RSC Standard', apy: 11.8, minStake: 500, maxStake: 50000, totalStaked: 850000, participants: 2100, risk: 'low', badge: 'Stable' },
                { id: 'pool3', name: 'RSC Flex', apy: 10.5, minStake: 100, maxStake: 25000, totalStaked: 450000, participants: 3200, risk: 'low', badge: 'Flexible' },
                { id: 'pool4', name: 'RSC High Yield', apy: 15.8, minStake: 5000, maxStake: 200000, totalStaked: 750000, participants: 450, risk: 'medium', badge: 'High APY' }
            ];
        }
        this.renderPools();
    }

    renderPools() {
        const container = document.getElementById('poolsGrid');
        container.innerHTML = '';

        this.pools.forEach(pool => {
            const poolElement = document.createElement('div');
            poolElement.className = 'pool-card';
            
            poolElement.innerHTML = `
                <div class="pool-header">
                    <span class="pool-name">${pool.name}</span>
                    <span class="pool-badge">${pool.badge}</span>
                </div>
                <div class="pool-apy">${pool.apy}% APY</div>
                <div class="pool-details">
                    <div class="pool-detail">
                        <span>Stake Mínimo:</span>
                        <span>${pool.minStake.toLocaleString()} RSC</span>
                    </div>
                    <div class="pool-detail">
                        <span>Stake Máximo:</span>
                        <span>${pool.maxStake.toLocaleString()} RSC</span>
                    </div>
                    <div class="pool-detail">
                        <span>Total Staked:</span>
                        <span>${pool.totalStaked.toLocaleString()} RSC</span>
                    </div>
                    <div class="pool-detail">
                        <span>Participantes:</span>
                        <span>${pool.participants.toLocaleString()}</span>
                    </div>
                </div>
                <div class="pool-actions">
                    <button class="btn-pool-stake" onclick="openStakeModal('${pool.id}')">Hacer Staking</button>
                    <button class="btn-pool-info" onclick="viewPoolInfo('${pool.id}')">Info</button>
                </div>
            `;

            container.appendChild(poolElement);
        });
    }

    filterPools(filter) {
        const container = document.getElementById('poolsGrid');
        container.innerHTML = '';

        let filteredPools = this.pools;

        switch(filter) {
            case 'high':
                filteredPools = this.pools.filter(pool => pool.apy >= 13);
                break;
            case 'low':
                filteredPools = this.pools.filter(pool => pool.risk === 'low');
                break;
            case 'new':
                filteredPools = this.pools.filter(pool => pool.participants < 1000);
                break;
        }

        filteredPools.forEach(pool => {
            const poolElement = document.createElement('div');
            poolElement.className = 'pool-card';
            
            poolElement.innerHTML = `
                <div class="pool-header">
                    <span class="pool-name">${pool.name}</span>
                    <span class="pool-badge">${pool.badge}</span>
                </div>
                <div class="pool-apy">${pool.apy}% APY</div>
                <div class="pool-details">
                    <div class="pool-detail">
                        <span>Stake Mínimo:</span>
                        <span>${pool.minStake.toLocaleString()} RSC</span>
                    </div>
                    <div class="pool-detail">
                        <span>Stake Máximo:</span>
                        <span>${pool.maxStake.toLocaleString()} RSC</span>
                    </div>
                    <div class="pool-detail">
                        <span>Total Staked:</span>
                        <span>${pool.totalStaked.toLocaleString()} RSC</span>
                    </div>
                    <div class="pool-detail">
                        <span>Participantes:</span>
                        <span>${pool.participants.toLocaleString()}</span>
                    </div>
                </div>
                <div class="pool-actions">
                    <button class="btn-pool-stake" onclick="openStakeModal('${pool.id}')">Hacer Staking</button>
                    <button class="btn-pool-info" onclick="viewPoolInfo('${pool.id}')">Info</button>
                </div>
            `;

            container.appendChild(poolElement);
        });
    }

    async loadValidators() {
        try {
            const res = await fetch('/api/staking/validators');
            if (!res.ok) throw new Error('No se pudo obtener los validadores');
            const data = await res.json();
            this.validators = Array.isArray(data.validators) ? data.validators : [];
        } catch (err) {
            // Fallback a validadores simulados
            this.validators = [
                { id: 'val1', name: 'Validator Alpha', commission: 5.0, uptime: 99.8, totalStaked: 450000, delegators: 1250, status: 'active' },
                { id: 'val2', name: 'Validator Beta', commission: 3.5, uptime: 99.9, totalStaked: 380000, delegators: 980, status: 'active' },
                { id: 'val3', name: 'Validator Gamma', commission: 7.2, uptime: 99.5, totalStaked: 290000, delegators: 750, status: 'active' }
            ];
        }
        this.renderValidators();
    }

    renderValidators() {
        const container = document.getElementById('validatorsGrid');
        container.innerHTML = '';

        this.validators.forEach(validator => {
            const validatorElement = document.createElement('div');
            validatorElement.className = 'validator-card';
            
            validatorElement.innerHTML = `
                <div class="validator-info">
                    <div class="validator-avatar">${validator.avatar}</div>
                    <div class="validator-details">
                        <h4>${validator.name}</h4>
                        <p>Uptime: ${validator.uptime}%</p>
                    </div>
                </div>
                <div class="validator-stats">
                    <div class="validator-stat">
                        <span class="value">${validator.totalStaked.toLocaleString()}</span>
                        <span class="label">Total Staked</span>
                    </div>
                    <div class="validator-stat">
                        <span class="value">${validator.delegators}</span>
                        <span class="label">Delegators</span>
                    </div>
                </div>
                <div class="validator-commission">
                    <div class="rate">${validator.commission}%</div>
                    <div class="label">Commission</div>
                </div>
                <button class="btn-delegate" onclick="delegateToValidator('${validator.id}')">Delegar</button>
            `;

            container.appendChild(validatorElement);
        });
    }

    loadHistory() {
        this.history = [
            {
                date: new Date(Date.now() - 86400000),
                type: 'stake',
                amount: 10000,
                pool: 'RSC Premium',
                apy: 13.2,
                status: 'confirmed'
            },
            {
                date: new Date(Date.now() - 172800000),
                type: 'claim',
                amount: 847.32,
                pool: 'RSC Premium',
                apy: 13.2,
                status: 'confirmed'
            },
            {
                date: new Date(Date.now() - 259200000),
                type: 'stake',
                amount: 5000,
                pool: 'RSC Standard',
                apy: 11.8,
                status: 'confirmed'
            }
        ];

        this.renderHistory();
    }

    renderHistory() {
        const tbody = document.getElementById('historyTableBody');
        tbody.innerHTML = '';

        this.history.forEach(tx => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${tx.date.toLocaleDateString()}</td>
                <td>${tx.type === 'stake' ? 'Staking' : 'Claim'}</td>
                <td>${tx.amount.toLocaleString()} RSC</td>
                <td>${tx.pool}</td>
                <td>${tx.apy}%</td>
                <td><span class="status ${tx.status}">${tx.status}</span></td>
            `;

            tbody.appendChild(row);
        });
    }

    updateStakingSummary() {
        const amount = parseFloat(document.getElementById('stakeAmount').value) || 0;
        const duration = parseInt(document.getElementById('stakeDuration').value) || 365;
        
        // Calculate APY based on duration
        let apy = 10.5;
        if (duration >= 365) apy = 13.2;
        else if (duration >= 180) apy = 12.5;
        else if (duration >= 90) apy = 11.8;
        
        const annualRewards = amount * (apy / 100);
        const unlockDate = new Date();
        unlockDate.setDate(unlockDate.getDate() + duration);
        
        document.getElementById('estimatedAPY').textContent = `${apy}%`;
        document.getElementById('annualRewards').textContent = `${annualRewards.toFixed(2)} RSC`;
        document.getElementById('unlockDate').textContent = unlockDate.toLocaleDateString();
    }

    updateUnstakingSummary() {
        const amount = parseFloat(document.getElementById('unstakeAmount').value) || 0;
        const lostRewards = this.rewards * (amount / this.stakedAmount);
        const penalty = amount * 0.05; // 5% penalty for early unstaking
        const totalUnstake = amount - penalty;
        
        document.getElementById('lostRewards').textContent = `${lostRewards.toFixed(2)} RSC`;
        document.getElementById('penalty').textContent = `${penalty.toFixed(2)} RSC`;
        document.getElementById('totalUnstake').textContent = `${totalUnstake.toFixed(2)} RSC`;
    }

    async submitStaking() {
        // Validar wallet
        const wallet = localStorage.getItem('rsc_wallet');
        if (!wallet) {
            this.showNotification('Debes crear una wallet antes de hacer staking.', 'error');
            setTimeout(() => { window.location.href = 'wallet.html'; }, 1800);
            return;
        }
        const { privateKey } = JSON.parse(wallet);
        const address = '0x' + privateKey.slice(-40);
        // Obtener datos del formulario
        const amount = parseFloat(document.getElementById('stakeAmount').value);
        const poolId = document.getElementById('stakePool').value;
        const validator = document.getElementById('stakeValidator') ? document.getElementById('stakeValidator').value : null;
        if (!amount || amount <= 0 || !poolId) {
            this.showNotification('Completa todos los campos para hacer staking.', 'error');
            return;
        }
        try {
            const res = await fetch('/api/staking/delegate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, amount, validator: validator || poolId })
            });
            if (!res.ok) throw new Error('No se pudo delegar');
            const data = await res.json();
            this.showNotification('Staking realizado con éxito', 'success');
            // Refrescar pools/historial
            await this.loadPools();
            await this.loadHistory();
        } catch (err) {
            this.showNotification('Error al hacer staking', 'error');
        }
    }

    submitUnstaking() {
        const amount = parseFloat(document.getElementById('unstakeAmount').value);
        
        if (!amount || amount > this.stakedAmount) {
            this.showNotification('Cantidad inválida', 'error');
            return;
        }

        // Simulate unstaking
        this.showNotification('Procesando retiro...', 'info');
        
        setTimeout(() => {
            this.stakedAmount -= amount;
            this.history.unshift({
                date: new Date(),
                type: 'unstake',
                amount: amount,
                pool: 'RSC Premium',
                apy: 13.2,
                status: 'confirmed'
            });
            
            this.renderHistory();
            this.closeUnstakeModal();
            this.showNotification('Retiro confirmado exitosamente', 'success');
            this.updateBalance();
        }, 2000);
    }

    updateBalance() {
        // Update balance display
        const balanceElements = document.querySelectorAll('.balance-value');
        balanceElements[0].textContent = `${this.stakedAmount.toLocaleString()} RSC`;
        balanceElements[1].textContent = `${this.rewards.toLocaleString()} RSC`;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#24db81' : type === 'error' ? '#e35060' : '#7657fc'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Global functions
function openStakeModal(poolId = null) {
    document.getElementById('stakeModal').style.display = 'block';
    if (poolId) {
        document.getElementById('stakePool').value = poolId;
    }
}

function closeStakeModal() {
    document.getElementById('stakeModal').style.display = 'none';
    document.getElementById('stakeForm').reset();
}

function openUnstakeModal() {
    document.getElementById('unstakeModal').style.display = 'block';
}

function closeUnstakeModal() {
    document.getElementById('unstakeModal').style.display = 'none';
    document.getElementById('unstakeForm').reset();
}

function claimRewards() {
    if (window.rscStaking.rewards > 0) {
        window.rscStaking.showNotification('Reclamando recompensas...', 'info');
        
        setTimeout(() => {
            window.rscStaking.history.unshift({
                date: new Date(),
                type: 'claim',
                amount: window.rscStaking.rewards,
                pool: 'RSC Premium',
                apy: 13.2,
                status: 'confirmed'
            });
            
            window.rscStaking.rewards = 0;
            window.rscStaking.renderHistory();
            window.rscStaking.updateBalance();
            window.rscStaking.showNotification('Recompensas reclamadas exitosamente', 'success');
        }, 1500);
    } else {
        window.rscStaking.showNotification('No hay recompensas para reclamar', 'error');
    }
}

function refreshStaking() {
    const btn = document.querySelector('.btn-refresh');
    btn.style.transform = 'rotate(360deg)';
    
    setTimeout(() => {
        btn.style.transform = 'rotate(0deg)';
        window.rscStaking.showNotification('Datos actualizados', 'success');
    }, 1000);
}

function toggleChart() {
    const chartContainer = document.getElementById('stakingChart');
    chartContainer.style.display = chartContainer.style.display === 'none' ? 'block' : 'none';
}

function viewPoolInfo(poolId) {
    const pool = window.rscStaking.pools.find(p => p.id === poolId);
    if (pool) {
        alert(`Información del Pool ${pool.name}:\nAPY: ${pool.apy}%\nStake Mínimo: ${pool.minStake} RSC\nStake Máximo: ${pool.maxStake} RSC\nTotal Staked: ${pool.totalStaked.toLocaleString()} RSC\nParticipantes: ${pool.participants.toLocaleString()}`);
    }
}

function delegateToValidator(validatorId) {
    const validator = window.rscStaking.validators.find(v => v.id === validatorId);
    if (validator) {
        alert(`Delegando a ${validator.name}\nCommission: ${validator.commission}%\nUptime: ${validator.uptime}%`);
    }
}

function viewAllValidators() {
    alert('Página de validadores próximamente');
}

function exportHistory() {
    const history = window.rscStaking.history;
    const csv = [
        ['Fecha', 'Tipo', 'Cantidad', 'Pool', 'APY', 'Estado'],
        ...history.map(tx => [
            tx.date.toLocaleDateString(),
            tx.type === 'stake' ? 'Staking' : tx.type === 'claim' ? 'Claim' : 'Unstake',
            tx.amount,
            tx.pool,
            tx.apy,
            tx.status
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historial_staking.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function filterHistory() {
    alert('Filtros de historial próximamente');
}

function setMaxStake() {
    document.getElementById('stakeAmount').value = '100000';
    window.rscStaking.updateStakingSummary();
}

function setMaxUnstake() {
    document.getElementById('unstakeAmount').value = window.rscStaking.stakedAmount.toFixed(2);
    window.rscStaking.updateUnstakingSummary();
}

// Initialize staking when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.rscStaking = new RSCStaking();
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
