// ===== TRANSACTIONS PAGE LOGIC =====

(function() {
    'use strict';
    
    let transactionsTable = null;
    
    document.addEventListener('DOMContentLoaded', function() {
        initializeTransactions();
        setupEventListeners();
        loadTransactions();
    });
    
    function initializeTransactions() {
        console.log('📜 Initializing Transactions page...');
        
        // Initialize DataTable
        transactionsTable = new DataTable('transactionsTable', {
            pageSize: 25,
            sortable: true,
            searchable: true
        });
        
        // Make instance globally accessible
        window.dataTableInstance = transactionsTable;
        
        // Override renderRow method
        transactionsTable.renderRow = function(row) {
            const typeClass = row.type.toLowerCase();
            const statusClass = row.status.toLowerCase();
            
            return `
                <tr>
                    <td>${formatDate(row.date)}</td>
                    <td>
                        <span class="transaction-type ${typeClass}">
                            <i class="fas fa-${getTypeIcon(row.type)}"></i>
                            ${row.type}
                        </span>
                    </td>
                    <td>
                        <span class="amount-value ${row.amount >= 0 ? 'positive' : 'negative'}">
                            ${row.amount >= 0 ? '+' : ''}${row.amount.toFixed(6)} RSC
                        </span>
                    </td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${row.status}
                        </span>
                    </td>
                    <td>
                        <span class="transaction-hash" title="${row.hash}">
                            ${truncateHash(row.hash)}
                        </span>
                    </td>
                    <td>${row.confirmations || 0}</td>
                    <td>
                        <button class="table-action-btn" onclick="showTransactionDetails('${row.hash}')">
                            <i class="fas fa-eye"></i>
                            Ver
                        </button>
                    </td>
                </tr>
            `;
        };
    }
    
    function setupEventListeners() {
        // Apply filters
        const applyBtn = document.getElementById('applyFiltersBtn');
        if (applyBtn) {
            applyBtn.addEventListener('click', applyFilters);
        }
        
        // Clear filters
        const clearBtn = document.getElementById('clearFiltersBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', clearFilters);
        }
        
        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                showExportMenu(exportBtn);
            });
        }
        
        // Modal close
        const closeModal = document.getElementById('closeModal');
        const modal = document.getElementById('transactionModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
        
        if (modal) {
            modal.querySelector('.modal-overlay').addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
    }
    
    function loadTransactions() {
        // Load from Supabase or API
        if (window.miningSupabaseAdapter) {
            loadTransactionsFromSupabase();
        } else if (window.supabaseIntegration) {
            loadTransactionsFromSupabase();
        } else {
            // Mock data for demo
            loadMockTransactions();
        }
    }
    
    async function loadTransactionsFromSupabase() {
        if (window.miningSupabaseAdapter) {
            try {
                const transactions = await window.miningSupabaseAdapter.getTransactions(100);
                displayTransactions(transactions);
            } catch (error) {
                console.error('Error cargando transacciones:', error);
                displayTransactions([]);
            }
        } else {
            console.log('Loading transactions from Supabase...');
        }
    }
    
    function displayTransactions(transactions) {
        const tbody = document.getElementById('transactionsTableBody');
        if (!tbody) return;
        
        if (transactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>No hay transacciones</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = transactions.map(tx => {
            const date = new Date(tx.created_at);
            const typeLabels = {
                'mining': 'Minería',
                'referral_commission': 'Comisión de Referido',
                'withdrawal': 'Retiro',
                'bonus': 'Bono',
                'transfer': 'Transferencia'
            };
            const statusLabels = {
                'pending': 'Pendiente',
                'confirmed': 'Confirmado',
                'failed': 'Fallido'
            };
            
            return `
                <tr>
                    <td>${date.toLocaleString('es-ES')}</td>
                    <td><span class="transaction-type">${typeLabels[tx.type] || tx.type}</span></td>
                    <td>${parseFloat(tx.amount).toFixed(6)} RSC</td>
                    <td>${parseFloat(tx.balance_after || 0).toFixed(6)} RSC</td>
                    <td><span class="status-badge confirmed">${statusLabels[tx.status] || 'Confirmado'}</span></td>
                    <td>
                        <button class="table-action-btn" onclick="viewTransactionDetails('${tx.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    }
    
    function loadMockTransactions() {
        const mockData = [
            {
                date: new Date('2024-01-15T10:30:00'),
                type: 'Mining',
                amount: 0.123456,
                status: 'Confirmed',
                hash: '0x1234567890abcdef1234567890abcdef12345678',
                confirmations: 12
            },
            {
                date: new Date('2024-01-15T09:15:00'),
                type: 'Payout',
                amount: 5.678901,
                status: 'Confirmed',
                hash: '0xabcdef1234567890abcdef1234567890abcdef12',
                confirmations: 24
            },
            {
                date: new Date('2024-01-14T18:45:00'),
                type: 'Commission',
                amount: 0.045678,
                status: 'Confirmed',
                hash: '0x567890abcdef1234567890abcdef1234567890ab',
                confirmations: 48
            },
            {
                date: new Date('2024-01-14T14:20:00'),
                type: 'Mining',
                amount: 0.234567,
                status: 'Pending',
                hash: '0x90abcdef1234567890abcdef1234567890abcdef',
                confirmations: 2
            },
            {
                date: new Date('2024-01-14T08:10:00'),
                type: 'Withdrawal',
                amount: -10.000000,
                status: 'Confirmed',
                hash: '0xcdef1234567890abcdef1234567890abcdef1234',
                confirmations: 36
            }
        ];
        
        // Generate more mock data
        for (let i = 0; i < 20; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            date.setHours(Math.floor(Math.random() * 24));
            
            mockData.push({
                date: date,
                type: ['Mining', 'Payout', 'Commission', 'Withdrawal'][Math.floor(Math.random() * 4)],
                amount: (Math.random() * 10 - 2).toFixed(6),
                status: ['Confirmed', 'Pending', 'Failed'][Math.floor(Math.random() * 3)],
                hash: '0x' + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
                confirmations: Math.floor(Math.random() * 50)
            });
        }
        
        transactionsTable.setData(mockData);
    }
    
    function applyFilters() {
        const filters = {
            dateFrom: document.getElementById('dateFrom').value,
            dateTo: document.getElementById('dateTo').value,
            type: document.getElementById('transactionType').value,
            status: document.getElementById('transactionStatus').value
        };
        
        transactionsTable.applyFilters(filters);
    }
    
    function clearFilters() {
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        document.getElementById('transactionType').value = 'all';
        document.getElementById('transactionStatus').value = 'all';
        
        transactionsTable.filters = {};
        transactionsTable.filteredData = [...transactionsTable.data];
        transactionsTable.currentPage = 1;
        transactionsTable.render();
    }
    
    function showExportMenu(button) {
        // Simple export menu
        const format = confirm('¿Exportar como CSV? (Cancelar para JSON)') ? 'csv' : 'json';
        transactionsTable.export(format);
    }
    
    function showTransactionDetails(hash) {
        const modal = document.getElementById('transactionModal');
        const modalBody = document.getElementById('transactionModalBody');
        
        // Find transaction
        const transaction = transactionsTable.data.find(t => t.hash === hash);
        
        if (transaction) {
            modalBody.innerHTML = `
                <div class="transaction-details">
                    <div class="detail-row">
                        <span class="detail-label">Hash:</span>
                        <span class="detail-value transaction-hash">${transaction.hash}</span>
                        <button class="btn-copy" onclick="copyToClipboard('${transaction.hash}')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Fecha:</span>
                        <span class="detail-value">${formatDate(transaction.date)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Tipo:</span>
                        <span class="detail-value">
                            <span class="transaction-type ${transaction.type.toLowerCase()}">
                                ${transaction.type}
                            </span>
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Monto:</span>
                        <span class="detail-value amount-value ${transaction.amount >= 0 ? 'positive' : 'negative'}">
                            ${transaction.amount >= 0 ? '+' : ''}${transaction.amount.toFixed(6)} RSC
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Estado:</span>
                        <span class="detail-value">
                            <span class="status-badge ${transaction.status.toLowerCase()}">
                                ${transaction.status}
                            </span>
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Confirmaciones:</span>
                        <span class="detail-value">${transaction.confirmations || 0}</span>
                    </div>
                </div>
            `;
        }
        
        modal.classList.add('active');
    }
    
    window.showTransactionDetails = showTransactionDetails;
    
    function formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function truncateHash(hash) {
        if (!hash) return '';
        return hash.substring(0, 10) + '...' + hash.substring(hash.length - 8);
    }
    
    function getTypeIcon(type) {
        const icons = {
            'Mining': 'hammer',
            'Payout': 'coins',
            'Commission': 'hand-holding-usd',
            'Withdrawal': 'arrow-down'
        };
        return icons[type] || 'exchange-alt';
    }
    
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Hash copiado al portapapeles');
        });
    }
    
    window.copyToClipboard = copyToClipboard;
    
    console.log('✅ Transactions page initialized');
})();

