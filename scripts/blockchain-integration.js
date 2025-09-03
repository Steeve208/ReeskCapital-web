// ===== RSC CHAIN - BLOCKCHAIN INTEGRATION SYSTEM =====

class BlockchainIntegration {
    constructor() {
        this.web3 = null;
        this.accounts = [];
        this.networkId = null;
        this.contracts = new Map();
        this.isConnected = false;
        this.eventBus = new EventTarget();
        this.initialized = false;
    }

    // Initialize blockchain integration
    async init() {
        if (this.initialized) return;
        
        try {
            await this.detectWeb3();
            await this.setupEventListeners();
            await this.loadContracts();
            this.initialized = true;
            
            console.log('🚀 RSC Chain Blockchain Integration Initialized');
            this.emit('blockchain:ready', { status: 'connected' });
        } catch (error) {
            console.error('Failed to initialize blockchain integration:', error);
            this.emit('blockchain:error', { error: error.message });
        }
    }

    // Detect and initialize Web3
    async detectWeb3() {
        if (typeof window.ethereum !== 'undefined') {
            this.web3 = new Web3(window.ethereum);
            
            try {
                // Request account access
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                this.accounts = await this.web3.eth.getAccounts();
                this.networkId = await this.web3.eth.net.getId();
                this.isConnected = true;
                
                console.log('Web3 connected:', {
                    accounts: this.accounts,
                    networkId: this.networkId
                });
                
                this.emit('wallet:connected', {
                    accounts: this.accounts,
                    networkId: this.networkId
                });
            } catch (error) {
                console.error('User denied account access:', error);
                throw new Error('User denied account access');
            }
        } else {
            throw new Error('Web3 not detected. Please install MetaMask or another Web3 wallet.');
        }
    }

    // Setup event listeners
    async setupEventListeners() {
        if (window.ethereum) {
            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                this.accounts = accounts;
                this.emit('wallet:accountsChanged', { accounts });
            });

            // Listen for network changes
            window.ethereum.on('chainChanged', (chainId) => {
                this.networkId = parseInt(chainId, 16);
                this.emit('wallet:networkChanged', { networkId: this.networkId });
            });

            // Listen for connection status
            window.ethereum.on('connect', (connectInfo) => {
                this.isConnected = true;
                this.emit('wallet:connected', connectInfo);
            });

            window.ethereum.on('disconnect', (error) => {
                this.isConnected = false;
                this.emit('wallet:disconnected', { error });
            });
        }
    }

    // Load smart contracts
    async loadContracts() {
        // RSC Token Contract
        const rscTokenABI = [
            {
                "constant": true,
                "inputs": [],
                "name": "name",
                "outputs": [{"name": "", "type": "string"}],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "symbol",
                "outputs": [{"name": "", "type": "string"}],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "decimals",
                "outputs": [{"name": "", "type": "uint8"}],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "totalSupply",
                "outputs": [{"name": "", "type": "uint256"}],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {"name": "_to", "type": "address"},
                    {"name": "_value", "type": "uint256"}
                ],
                "name": "transfer",
                "outputs": [{"name": "", "type": "bool"}],
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {"name": "_spender", "type": "address"},
                    {"name": "_value", "type": "uint256"}
                ],
                "name": "approve",
                "outputs": [{"name": "", "type": "bool"}],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {"name": "_owner", "type": "address"},
                    {"name": "_spender", "type": "address"}
                ],
                "name": "allowance",
                "outputs": [{"name": "", "type": "uint256"}],
                "type": "function"
            },
            {
                "anonymous": false,
                "inputs": [
                    {"indexed": true, "name": "owner", "type": "address"},
                    {"indexed": true, "name": "spender", "type": "address"},
                    {"indexed": false, "name": "value", "type": "uint256"}
                ],
                "name": "Approval",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {"indexed": true, "name": "from", "type": "address"},
                    {"indexed": true, "name": "to", "type": "address"},
                    {"indexed": false, "name": "value", "type": "uint256"}
                ],
                "name": "Transfer",
                "type": "event"
            }
        ];

        // Mining Contract ABI
        const miningABI = [
            {
                "constant": false,
                "inputs": [{"name": "nonce", "type": "uint256"}],
                "name": "mine",
                "outputs": [{"name": "", "type": "bool"}],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [],
                "name": "getMiningReward",
                "outputs": [{"name": "", "type": "uint256"}],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [{"name": "miner", "type": "address"}],
                "name": "getMinerStats",
                "outputs": [
                    {"name": "hashRate", "type": "uint256"},
                    {"name": "totalMined", "type": "uint256"},
                    {"name": "lastMineTime", "type": "uint256"}
                ],
                "type": "function"
            },
            {
                "anonymous": false,
                "inputs": [
                    {"indexed": true, "name": "miner", "type": "address"},
                    {"indexed": false, "name": "reward", "type": "uint256"},
                    {"indexed": false, "name": "nonce", "type": "uint256"}
                ],
                "name": "MiningReward",
                "type": "event"
            }
        ];

        // Staking Contract ABI
        const stakingABI = [
            {
                "constant": false,
                "inputs": [{"name": "amount", "type": "uint256"}],
                "name": "stake",
                "outputs": [{"name": "", "type": "bool"}],
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [{"name": "amount", "type": "uint256"}],
                "name": "unstake",
                "outputs": [{"name": "", "type": "bool"}],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [{"name": "staker", "type": "address"}],
                "name": "getStakeInfo",
                "outputs": [
                    {"name": "stakedAmount", "type": "uint256"},
                    {"name": "rewards", "type": "uint256"},
                    {"name": "stakeTime", "type": "uint256"}
                ],
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [],
                "name": "claimRewards",
                "outputs": [{"name": "", "type": "bool"}],
                "type": "function"
            }
        ];

        // Contract addresses (these would be real addresses in production)
        const contractAddresses = {
            rscToken: '0x1234567890123456789012345678901234567890',
            mining: '0x2345678901234567890123456789012345678901',
            staking: '0x3456789012345678901234567890123456789012'
        };

        try {
            // Initialize contracts
            this.contracts.set('rscToken', new this.web3.eth.Contract(rscTokenABI, contractAddresses.rscToken));
            this.contracts.set('mining', new this.web3.eth.Contract(miningABI, contractAddresses.mining));
            this.contracts.set('staking', new this.web3.eth.Contract(stakingABI, contractAddresses.staking));

            console.log('Smart contracts loaded successfully');
        } catch (error) {
            console.error('Failed to load contracts:', error);
        }
    }

    // Get account balance
    async getBalance(address = null) {
        try {
            const account = address || this.accounts[0];
            if (!account) throw new Error('No account available');

            const balance = await this.web3.eth.getBalance(account);
            const balanceInEth = this.web3.utils.fromWei(balance, 'ether');
            
            return {
                wei: balance,
                ether: balanceInEth,
                formatted: parseFloat(balanceInEth).toFixed(4)
            };
        } catch (error) {
            console.error('Failed to get balance:', error);
            throw error;
        }
    }

    // Get RSC token balance
    async getRSCBalance(address = null) {
        try {
            const account = address || this.accounts[0];
            if (!account) throw new Error('No account available');

            const rscContract = this.contracts.get('rscToken');
            const balance = await rscContract.methods.balanceOf(account).call();
            const decimals = await rscContract.methods.decimals().call();
            
            const formattedBalance = balance / Math.pow(10, decimals);
            
            return {
                raw: balance,
                formatted: formattedBalance.toFixed(4),
                decimals: decimals
            };
        } catch (error) {
            console.error('Failed to get RSC balance:', error);
            throw error;
        }
    }

    // Send transaction
    async sendTransaction(to, value, data = null) {
        try {
            const transaction = {
                from: this.accounts[0],
                to: to,
                value: this.web3.utils.toWei(value.toString(), 'ether'),
                gas: 21000
            };

            if (data) {
                transaction.data = data;
                transaction.gas = 100000; // Higher gas limit for contract interactions
            }

            const receipt = await this.web3.eth.sendTransaction(transaction);
            
            this.emit('transaction:sent', {
                hash: receipt.transactionHash,
                to: to,
                value: value
            });

            return receipt;
        } catch (error) {
            console.error('Transaction failed:', error);
            throw error;
        }
    }

    // Transfer RSC tokens
    async transferRSC(to, amount) {
        try {
            const rscContract = this.contracts.get('rscToken');
            const decimals = await rscContract.methods.decimals().call();
            const amountInWei = (amount * Math.pow(10, decimals)).toString();

            const transaction = rscContract.methods.transfer(to, amountInWei);
            const gasEstimate = await transaction.estimateGas({ from: this.accounts[0] });

            const receipt = await transaction.send({
                from: this.accounts[0],
                gas: gasEstimate
            });

            this.emit('token:transferred', {
                hash: receipt.transactionHash,
                to: to,
                amount: amount
            });

            return receipt;
        } catch (error) {
            console.error('Token transfer failed:', error);
            throw error;
        }
    }

    // Start mining
    async startMining() {
        try {
            const miningContract = this.contracts.get('mining');
            const nonce = Math.floor(Math.random() * 1000000);

            const transaction = miningContract.methods.mine(nonce);
            const gasEstimate = await transaction.estimateGas({ from: this.accounts[0] });

            const receipt = await transaction.send({
                from: this.accounts[0],
                gas: gasEstimate
            });

            this.emit('mining:started', {
                hash: receipt.transactionHash,
                nonce: nonce
            });

            return receipt;
        } catch (error) {
            console.error('Mining failed:', error);
            throw error;
        }
    }

    // Get mining stats
    async getMiningStats(address = null) {
        try {
            const account = address || this.accounts[0];
            if (!account) throw new Error('No account available');

            const miningContract = this.contracts.get('mining');
            const stats = await miningContract.methods.getMinerStats(account).call();

            return {
                hashRate: stats[0],
                totalMined: stats[1],
                lastMineTime: stats[2]
            };
        } catch (error) {
            console.error('Failed to get mining stats:', error);
            throw error;
        }
    }

    // Stake tokens
    async stakeTokens(amount) {
        try {
            const stakingContract = this.contracts.get('staking');
            const decimals = 18; // Assuming 18 decimals for RSC
            const amountInWei = (amount * Math.pow(10, decimals)).toString();

            const transaction = stakingContract.methods.stake(amountInWei);
            const gasEstimate = await transaction.estimateGas({ from: this.accounts[0] });

            const receipt = await transaction.send({
                from: this.accounts[0],
                gas: gasEstimate
            });

            this.emit('staking:staked', {
                hash: receipt.transactionHash,
                amount: amount
            });

            return receipt;
        } catch (error) {
            console.error('Staking failed:', error);
            throw error;
        }
    }

    // Unstake tokens
    async unstakeTokens(amount) {
        try {
            const stakingContract = this.contracts.get('staking');
            const decimals = 18;
            const amountInWei = (amount * Math.pow(10, decimals)).toString();

            const transaction = stakingContract.methods.unstake(amountInWei);
            const gasEstimate = await transaction.estimateGas({ from: this.accounts[0] });

            const receipt = await transaction.send({
                from: this.accounts[0],
                gas: gasEstimate
            });

            this.emit('staking:unstaked', {
                hash: receipt.transactionHash,
                amount: amount
            });

            return receipt;
        } catch (error) {
            console.error('Unstaking failed:', error);
            throw error;
        }
    }

    // Get staking info
    async getStakingInfo(address = null) {
        try {
            const account = address || this.accounts[0];
            if (!account) throw new Error('No account available');

            const stakingContract = this.contracts.get('staking');
            const info = await stakingContract.methods.getStakeInfo(account).call();

            return {
                stakedAmount: info[0],
                rewards: info[1],
                stakeTime: info[2]
            };
        } catch (error) {
            console.error('Failed to get staking info:', error);
            throw error;
        }
    }

    // Claim staking rewards
    async claimStakingRewards() {
        try {
            const stakingContract = this.contracts.get('staking');
            const gasEstimate = await stakingContract.methods.claimRewards().estimateGas({ from: this.accounts[0] });

            const receipt = await stakingContract.methods.claimRewards().send({
                from: this.accounts[0],
                gas: gasEstimate
            });

            this.emit('staking:rewardsClaimed', {
                hash: receipt.transactionHash
            });

            return receipt;
        } catch (error) {
            console.error('Failed to claim rewards:', error);
            throw error;
        }
    }

    // Get network info
    async getNetworkInfo() {
        try {
            const networkId = await this.web3.eth.net.getId();
            const blockNumber = await this.web3.eth.getBlockNumber();
            const gasPrice = await this.web3.eth.getGasPrice();

            return {
                networkId: networkId,
                blockNumber: blockNumber,
                gasPrice: this.web3.utils.fromWei(gasPrice, 'gwei'),
                networkName: this.getNetworkName(networkId)
            };
        } catch (error) {
            console.error('Failed to get network info:', error);
            throw error;
        }
    }

    // Get network name from ID
    getNetworkName(networkId) {
        const networks = {
            1: 'Ethereum Mainnet',
            3: 'Ropsten Testnet',
            4: 'Rinkeby Testnet',
            5: 'Goerli Testnet',
            42: 'Kovan Testnet',
            1337: 'Local Development',
            31337: 'RSC Chain Testnet'
        };
        return networks[networkId] || `Unknown Network (${networkId})`;
    }

    // Listen to contract events
    async listenToEvents() {
        try {
            // Listen to RSC token transfers
            const rscContract = this.contracts.get('rscToken');
            rscContract.events.Transfer()
                .on('data', (event) => {
                    this.emit('token:transfer', {
                        from: event.returnValues.from,
                        to: event.returnValues.to,
                        value: event.returnValues.value
                    });
                })
                .on('error', (error) => {
                    console.error('Error listening to transfer events:', error);
                });

            // Listen to mining rewards
            const miningContract = this.contracts.get('mining');
            miningContract.events.MiningReward()
                .on('data', (event) => {
                    this.emit('mining:reward', {
                        miner: event.returnValues.miner,
                        reward: event.returnValues.reward,
                        nonce: event.returnValues.nonce
                    });
                })
                .on('error', (error) => {
                    console.error('Error listening to mining events:', error);
                });

        } catch (error) {
            console.error('Failed to setup event listeners:', error);
        }
    }

    // Utility methods
    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    formatAmount(amount, decimals = 4) {
        return parseFloat(amount).toFixed(decimals);
    }

    // Emit events
    emit(eventName, data) {
        this.eventBus.dispatchEvent(new CustomEvent(eventName, { detail: data }));
    }

    // Add event listener
    on(eventName, handler) {
        this.eventBus.addEventListener(eventName, handler);
    }

    // Remove event listener
    off(eventName, handler) {
        this.eventBus.removeEventListener(eventName, handler);
    }
}

// ===== BLOCKCHAIN UI MANAGER =====
class BlockchainUIManager {
    constructor(blockchain) {
        this.blockchain = blockchain;
        this.elements = new Map();
        this.updateInterval = null;
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.startAutoUpdate();
    }

    setupElements() {
        // Wallet elements
        this.elements.set('walletAddress', document.querySelector('[data-wallet-address]'));
        this.elements.set('walletBalance', document.querySelector('[data-wallet-balance]'));
        this.elements.set('rscBalance', document.querySelector('[data-rsc-balance]'));
        this.elements.set('connectWalletBtn', document.querySelector('[data-connect-wallet]'));

        // Mining elements
        this.elements.set('miningStats', document.querySelector('[data-mining-stats]'));
        this.elements.set('hashRate', document.querySelector('[data-hash-rate]'));
        this.elements.set('totalMined', document.querySelector('[data-total-mined]'));
        this.elements.set('startMiningBtn', document.querySelector('[data-start-mining]'));

        // Staking elements
        this.elements.set('stakingInfo', document.querySelector('[data-staking-info]'));
        this.elements.set('stakedAmount', document.querySelector('[data-staked-amount]'));
        this.elements.set('stakingRewards', document.querySelector('[data-staking-rewards]'));
        this.elements.set('stakeBtn', document.querySelector('[data-stake-btn]'));
        this.elements.set('unstakeBtn', document.querySelector('[data-unstake-btn]'));

        // Network elements
        this.elements.set('networkInfo', document.querySelector('[data-network-info]'));
        this.elements.set('blockNumber', document.querySelector('[data-block-number]'));
        this.elements.set('gasPrice', document.querySelector('[data-gas-price]'));
    }

    setupEventListeners() {
        // Wallet connection
        if (this.elements.get('connectWalletBtn')) {
            this.elements.get('connectWalletBtn').addEventListener('click', () => {
                this.connectWallet();
            });
        }

        // Mining
        if (this.elements.get('startMiningBtn')) {
            this.elements.get('startMiningBtn').addEventListener('click', () => {
                this.startMining();
            });
        }

        // Staking
        if (this.elements.get('stakeBtn')) {
            this.elements.get('stakeBtn').addEventListener('click', () => {
                this.stakeTokens();
            });
        }

        if (this.elements.get('unstakeBtn')) {
            this.elements.get('unstakeBtn').addEventListener('click', () => {
                this.unstakeTokens();
            });
        }

        // Blockchain events
        this.blockchain.on('wallet:connected', (event) => {
            this.updateWalletInfo(event.detail);
        });

        this.blockchain.on('mining:reward', (event) => {
            this.showMiningReward(event.detail);
        });

        this.blockchain.on('staking:rewardsClaimed', (event) => {
            this.showStakingReward(event.detail);
        });
    }

    async connectWallet() {
        try {
            await this.blockchain.init();
            this.updateWalletInfo();
        } catch (error) {
            this.showError('Failed to connect wallet: ' + error.message);
        }
    }

    async updateWalletInfo() {
        try {
            if (!this.blockchain.isConnected) return;

            const balance = await this.blockchain.getBalance();
            const rscBalance = await this.blockchain.getRSCBalance();
            const address = this.blockchain.accounts[0];

            if (this.elements.get('walletAddress')) {
                this.elements.get('walletAddress').textContent = this.blockchain.formatAddress(address);
            }

            if (this.elements.get('walletBalance')) {
                this.elements.get('walletBalance').textContent = `${balance.formatted} ETH`;
            }

            if (this.elements.get('rscBalance')) {
                this.elements.get('rscBalance').textContent = `${rscBalance.formatted} RSC`;
            }
        } catch (error) {
            console.error('Failed to update wallet info:', error);
        }
    }

    async startMining() {
        try {
            const receipt = await this.blockchain.startMining();
            this.showSuccess('Mining started successfully!');
            this.updateMiningStats();
        } catch (error) {
            this.showError('Failed to start mining: ' + error.message);
        }
    }

    async updateMiningStats() {
        try {
            if (!this.blockchain.isConnected) return;

            const stats = await this.blockchain.getMiningStats();

            if (this.elements.get('hashRate')) {
                this.elements.get('hashRate').textContent = `${stats.hashRate} H/s`;
            }

            if (this.elements.get('totalMined')) {
                this.elements.get('totalMined').textContent = `${this.blockchain.formatAmount(stats.totalMined)} RSC`;
            }
        } catch (error) {
            console.error('Failed to update mining stats:', error);
        }
    }

    async stakeTokens() {
        try {
            const amount = prompt('Enter amount to stake:');
            if (!amount || isNaN(amount)) return;

            const receipt = await this.blockchain.stakeTokens(parseFloat(amount));
            this.showSuccess('Tokens staked successfully!');
            this.updateStakingInfo();
        } catch (error) {
            this.showError('Failed to stake tokens: ' + error.message);
        }
    }

    async unstakeTokens() {
        try {
            const amount = prompt('Enter amount to unstake:');
            if (!amount || isNaN(amount)) return;

            const receipt = await this.blockchain.unstakeTokens(parseFloat(amount));
            this.showSuccess('Tokens unstaked successfully!');
            this.updateStakingInfo();
        } catch (error) {
            this.showError('Failed to unstake tokens: ' + error.message);
        }
    }

    async updateStakingInfo() {
        try {
            if (!this.blockchain.isConnected) return;

            const info = await this.blockchain.getStakingInfo();

            if (this.elements.get('stakedAmount')) {
                this.elements.get('stakedAmount').textContent = `${this.blockchain.formatAmount(info.stakedAmount)} RSC`;
            }

            if (this.elements.get('stakingRewards')) {
                this.elements.get('stakingRewards').textContent = `${this.blockchain.formatAmount(info.rewards)} RSC`;
            }
        } catch (error) {
            console.error('Failed to update staking info:', error);
        }
    }

    async updateNetworkInfo() {
        try {
            if (!this.blockchain.isConnected) return;

            const networkInfo = await this.blockchain.getNetworkInfo();

            if (this.elements.get('blockNumber')) {
                this.elements.get('blockNumber').textContent = networkInfo.blockNumber.toLocaleString();
            }

            if (this.elements.get('gasPrice')) {
                this.elements.get('gasPrice').textContent = `${networkInfo.gasPrice} Gwei`;
            }
        } catch (error) {
            console.error('Failed to update network info:', error);
        }
    }

    startAutoUpdate() {
        this.updateInterval = setInterval(() => {
            this.updateWalletInfo();
            this.updateMiningStats();
            this.updateStakingInfo();
            this.updateNetworkInfo();
        }, 10000); // Update every 10 seconds
    }

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }

    showSuccess(message) {
        if (window.componentSystem) {
            componentSystem.create('Notification').show(message, 'success');
        }
    }

    showError(message) {
        if (window.componentSystem) {
            componentSystem.create('Notification').show(message, 'error');
        }
    }

    showMiningReward(data) {
        this.showSuccess(`Mining reward: ${this.blockchain.formatAmount(data.reward)} RSC`);
    }

    showStakingReward(data) {
        this.showSuccess('Staking rewards claimed successfully!');
    }
}

// ===== INITIALIZE BLOCKCHAIN INTEGRATION =====
const blockchainIntegration = new BlockchainIntegration();
const blockchainUI = new BlockchainUIManager(blockchainIntegration);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await blockchainIntegration.init();
        blockchainUI.init();
    } catch (error) {
        console.error('Failed to initialize blockchain integration:', error);
    }
});

// Export for global access
window.blockchainIntegration = blockchainIntegration;
window.blockchainUI = blockchainUI;
