/* ===== LEADERBOARD MANAGER ===== */

class LeaderboardManager {
    constructor() {
        this.currentTab = 'miners';
        this.leaderboardData = {
            miners: [],
            validators: [],
            stakers: []
        };
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadLeaderboardData();
    }
    
    setupEventListeners() {
        // Use event delegation for better performance
        document.addEventListener('click', (e) => {
            // Tab switching
            if (e.target.matches('.tab-btn')) {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            }
            
            // Refresh button
            if (e.target.matches('#refreshLeaderboard') || e.target.closest('#refreshLeaderboard')) {
                this.refreshLeaderboard();
            }
        });
    }
    
    switchTab(tab) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        this.currentTab = tab;
        this.displayLeaderboardData();
    }
    
    async loadLeaderboardData() {
        try {
            // Show loading state
            this.showLoadingState();
            
            // Load data for all tabs
            await Promise.all([
                this.loadMinersData(),
                this.loadValidatorsData(),
                this.loadStakersData()
            ]);
            
            // Display current tab data
            this.displayLeaderboardData();
            this.updateStats();
            
        } catch (error) {
            console.error('Failed to load leaderboard data:', error);
            this.showErrorState();
        }
    }
    
    async loadMinersData() {
        // Simulate API call - replace with actual backend endpoint
        // const response = await fetch('/api/leaderboard/miners');
        // this.leaderboardData.miners = await response.json();
        
        // Mock data for miners
        this.leaderboardData.miners = [
            { rank: 1, username: 'CryptoMiner2025', address: '0x1234...5678', hashrate: '15.2 TH/s', totalMined: '2,847.32 RSC', efficiency: '98.5%' },
            { rank: 2, username: 'BlockChainPro', address: '0x8765...4321', hashrate: '12.8 TH/s', totalMined: '2,156.78 RSC', efficiency: '97.2%' },
            { rank: 3, username: 'DigitalGold', address: '0x9876...5432', hashrate: '11.5 TH/s', totalMined: '1,987.45 RSC', efficiency: '96.8%' },
            { rank: 4, username: 'HashMaster', address: '0x5432...1098', hashrate: '10.2 TH/s', totalMined: '1,756.23 RSC', efficiency: '95.9%' },
            { rank: 5, username: 'RSCHunter', address: '0x2109...8765', hashrate: '9.8 TH/s', totalMined: '1,654.87 RSC', efficiency: '94.7%' }
        ];
    }
    
    async loadValidatorsData() {
        // Simulate API call - replace with actual backend endpoint
        // const response = await fetch('/api/leaderboard/validators');
        // this.leaderboardData.validators = await response.json();
        
        // Mock data for validators
        this.leaderboardData.validators = [
            { rank: 1, username: 'ValidatorKing', address: '0x1111...2222', staked: '50,000 RSC', rewards: '3,245.67 RSC', uptime: '99.9%' },
            { rank: 2, username: 'StakeMaster', address: '0x3333...4444', staked: '45,000 RSC', rewards: '2,987.34 RSC', uptime: '99.7%' },
            { rank: 3, username: 'BlockValidator', address: '0x5555...6666', staked: '40,000 RSC', rewards: '2,654.21 RSC', uptime: '99.5%' },
            { rank: 4, username: 'ChainGuardian', address: '0x7777...8888', staked: '35,000 RSC', rewards: '2,321.89 RSC', uptime: '99.2%' },
            { rank: 5, username: 'SecureNode', address: '0x9999...0000', staked: '30,000 RSC', rewards: '1,987.56 RSC', uptime: '98.9%' }
        ];
    }
    
    async loadStakersData() {
        // Simulate API call - replace with actual backend endpoint
        // const response = await fetch('/api/leaderboard/stakers');
        // this.leaderboardData.stakers = await response.json();
        
        // Mock data for stakers
        this.leaderboardData.stakers = [
            { rank: 1, username: 'StakeLord', address: '0xaaaa...bbbb', staked: '100,000 RSC', rewards: '8,765.43 RSC', apy: '8.76%' },
            { rank: 2, username: 'YieldFarmer', address: '0xcccc...dddd', staked: '85,000 RSC', rewards: '7,432.10 RSC', apy: '8.74%' },
            { rank: 3, username: 'PassiveIncome', address: '0xeeee...ffff', staked: '70,000 RSC', rewards: '6,123.45 RSC', apy: '8.72%' },
            { rank: 4, username: 'StakeHolder', address: '0x1111...aaaa', staked: '55,000 RSC', rewards: '4,876.32 RSC', apy: '8.70%' },
            { rank: 5, username: 'RewardSeeker', address: '0xbbbb...cccc', staked: '40,000 RSC', rewards: '3,654.21 RSC', apy: '8.68%' }
        ];
    }
    
    displayLeaderboardData() {
        const leaderboardTable = document.getElementById('leaderboardTable');
        if (!leaderboardTable) return;
        
        const data = this.leaderboardData[this.currentTab];
        if (!data || data.length === 0) {
            leaderboardTable.innerHTML = '<div class="no-data">No data available</div>';
            return;
        }
        
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
            const tableHTML = this.generateTableHTML(data);
            leaderboardTable.innerHTML = tableHTML;
        });
    }
    
    generateTableHTML(data) {
        const headers = this.getTableHeaders();
        const rows = data.map(item => this.generateTableRow(item)).join('');
        
        return `
            <table class="leaderboard-table-content">
                <thead>
                    <tr>
                        ${headers.map(header => `<th>${header}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }
    
    getTableHeaders() {
        switch (this.currentTab) {
            case 'miners':
                return ['Rank', 'Username', 'Address', 'Hashrate', 'Total Mined', 'Efficiency'];
            case 'validators':
                return ['Rank', 'Username', 'Address', 'Staked', 'Rewards', 'Uptime'];
            case 'stakers':
                return ['Rank', 'Username', 'Address', 'Staked', 'Rewards', 'APY'];
            default:
                return ['Rank', 'Username', 'Address', 'Score'];
        }
    }
    
    generateTableRow(item) {
        const cells = [];
        
        // Rank with medal emoji
        const rankEmoji = item.rank <= 3 ? ['🥇', '🥈', '🥉'][item.rank - 1] : '';
        cells.push(`<td class="rank-cell"><span class="rank-number">${rankEmoji} ${item.rank}</span></td>`);
        
        // Username
        cells.push(`<td class="username-cell"><span class="username">${item.username}</span></td>`);
        
        // Address (truncated)
        cells.push(`<td class="address-cell"><span class="address" title="${item.address}">${item.address}</span></td>`);
        
        // Dynamic columns based on tab
        switch (this.currentTab) {
            case 'miners':
                cells.push(`<td class="hashrate-cell">${item.hashrate}</td>`);
                cells.push(`<td class="mined-cell">${item.totalMined}</td>`);
                cells.push(`<td class="efficiency-cell">${item.efficiency}</td>`);
                break;
            case 'validators':
                cells.push(`<td class="staked-cell">${item.staked}</td>`);
                cells.push(`<td class="rewards-cell">${item.rewards}</td>`);
                cells.push(`<td class="uptime-cell">${item.uptime}</td>`);
                break;
            case 'stakers':
                cells.push(`<td class="staked-cell">${item.staked}</td>`);
                cells.push(`<td class="rewards-cell">${item.rewards}</td>`);
                cells.push(`<td class="apy-cell">${item.apy}</td>`);
                break;
        }
        
        return `<tr>${cells.join('')}</tr>`;
    }
    
    updateStats() {
        // Update total participants
        const totalParticipants = Object.values(this.leaderboardData).reduce((total, data) => total + data.length, 0);
        const totalParticipantsElement = document.getElementById('totalParticipants');
        if (totalParticipantsElement) {
            totalParticipantsElement.textContent = totalParticipants;
        }
        
        // Update total rewards (sum of all rewards)
        const totalRewards = Object.values(this.leaderboardData).reduce((total, data) => {
            return total + data.reduce((sum, item) => {
                const rewards = parseFloat(item.rewards?.replace(/[^\d.]/g, '') || '0');
                return sum + rewards;
            }, 0);
        }, 0);
        
        const totalRewardsElement = document.getElementById('totalLeaderboardRewards');
        if (totalRewardsElement) {
            totalRewardsElement.textContent = `${totalRewards.toFixed(2)} RSC`;
        }
    }
    
    showLoadingState() {
        const leaderboardTable = document.getElementById('leaderboardTable');
        if (leaderboardTable) {
            leaderboardTable.innerHTML = `
                <div class="loading-placeholder">
                    <div class="loading-spinner"></div>
                    <p>Loading leaderboard data...</p>
                </div>
            `;
        }
    }
    
    showErrorState() {
        const leaderboardTable = document.getElementById('leaderboardTable');
        if (leaderboardTable) {
            leaderboardTable.innerHTML = `
                <div class="error-placeholder">
                    <div class="error-icon">⚠️</div>
                    <p>Failed to load leaderboard data</p>
                    <button class="retry-btn" onclick="window.leaderboardManager.loadLeaderboardData()">Retry</button>
                </div>
            `;
        }
    }
    
    async refreshLeaderboard() {
        const refreshBtn = document.getElementById('refreshLeaderboard');
        if (refreshBtn) {
            // Show refreshing state
            const originalContent = refreshBtn.innerHTML;
            refreshBtn.innerHTML = `
                <span class="refresh-icon spinning">🔄</span>
                <span>Refreshing...</span>
            `;
            refreshBtn.disabled = true;
            
            try {
                await this.loadLeaderboardData();
                this.showNotification('success', 'Leaderboard refreshed successfully!');
            } catch (error) {
                this.showNotification('error', 'Failed to refresh leaderboard');
            } finally {
                // Reset button
                refreshBtn.innerHTML = originalContent;
                refreshBtn.disabled = false;
            }
        }
    }
    
    showNotification(type, message) {
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(type, 'Leaderboard', message);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize leaderboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.leaderboardManager = new LeaderboardManager();
});

// Export for use in other modules
window.LeaderboardManager = LeaderboardManager;
