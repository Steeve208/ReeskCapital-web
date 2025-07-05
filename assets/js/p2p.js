// =====================
// P2P FUNCTIONALITY
// =====================

class RSCP2P {
    constructor() {
        this.currentPrice = 0.85;
        this.priceChange = 0.12;
        this.priceChangePercent = 16.5;
        this.buyOrders = [];
        this.sellOrders = [];
        this.transactions = [];
        this.currentView = 'list';
        
        this.init();
    }

    init() {
        this.loadOrders();
        this.loadTransactions();
        this.initPriceChart();
        this.setupEventListeners();
        this.startPriceUpdates();
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('searchTrader').addEventListener('input', (e) => {
            this.filterOrders();
        });

        // View toggle
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-view').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentView = e.target.dataset.view;
                this.renderOrders();
            });
        });

        // Create order form
        document.getElementById('createOrderForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createOrder();
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
        document.getElementById('orderAmount').addEventListener('input', () => {
            this.updateOrderSummary();
        });

        document.getElementById('orderPrice').addEventListener('input', () => {
            this.updateOrderSummary();
        });
    }

    initPriceChart() {
        const ctx = document.getElementById('priceChart').getContext('2d');
        
        // Generate sample price data
        const data = [];
        const labels = [];
        let price = 0.73;
        
        for (let i = 0; i < 24; i++) {
            price += (Math.random() - 0.5) * 0.02;
            data.push(price);
            labels.push(`${i}:00`);
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'RSC/USDT',
                    data: data,
                    borderColor: '#3fd8c2',
                    backgroundColor: 'rgba(63, 216, 194, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
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

    async loadOrders() {
        try {
            const res = await fetch('/api/p2p/orders');
            if (!res.ok) throw new Error('No se pudo obtener las órdenes');
            const data = await res.json();
            this.buyOrders = Array.isArray(data.orders) ? data.orders.filter(o => o.type === 'buy') : [];
            this.sellOrders = Array.isArray(data.orders) ? data.orders.filter(o => o.type === 'sell') : [];
        } catch (err) {
            // Fallback a órdenes simuladas si la API no responde
            this.buyOrders = [
                { id: 1, trader: { name: 'CryptoTrader_2024', avatar: '🚀', rating: 4.9, trades: 1250, completion: 99.8 }, amount: 5000, price: 0.84, paymentMethods: ['bank', 'paypal'], terms: 'Transferencia inmediata requerida', type: 'buy' },
                { id: 2, trader: { name: 'RSC_Master', avatar: '💎', rating: 4.7, trades: 890, completion: 98.5 }, amount: 2500, price: 0.83, paymentMethods: ['bank', 'cash'], terms: 'Pago en efectivo solo en persona', type: 'buy' },
                { id: 3, trader: { name: 'DigitalNomad', avatar: '🌍', rating: 4.8, trades: 2100, completion: 99.5 }, amount: 10000, price: 0.82, paymentMethods: ['paypal', 'crypto'], terms: 'PayPal Friends & Family', type: 'buy' }
            ];
            this.sellOrders = [
                { id: 4, trader: { name: 'RSC_Holder', avatar: '🏆', rating: 4.9, trades: 1800, completion: 99.9 }, amount: 3000, price: 0.86, paymentMethods: ['bank'], terms: 'Transferencia bancaria SEPA', type: 'sell' },
                { id: 5, trader: { name: 'CryptoVault', avatar: '🔒', rating: 4.6, trades: 1100, completion: 98.9 }, amount: 1500, price: 0.87, paymentMethods: ['paypal', 'crypto'], terms: 'Solo cripto', type: 'sell' }
            ];
        }
        this.renderOrders();
    }

    renderOrders() {
        this.renderOrderSection('buyOrdersContainer', this.buyOrders);
        this.renderOrderSection('sellOrdersContainer', this.sellOrders);
    }

    renderOrderSection(containerId, orders) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-card';
            
            const paymentMethodsText = order.paymentMethods.map(method => {
                const methods = {
                    'bank': 'Transferencia',
                    'paypal': 'PayPal',
                    'cash': 'Efectivo',
                    'crypto': 'Criptos'
                };
                return methods[method];
            }).join(', ');

            orderElement.innerHTML = `
                <div class="order-header">
                    <div class="trader-info">
                        <div class="trader-avatar">${order.trader.avatar}</div>
                        <div class="trader-details">
                            <h4>${order.trader.name}</h4>
                            <p>⭐ ${order.trader.rating} (${order.trader.trades}) • ${order.trader.completion}%</p>
                        </div>
                    </div>
                    <span class="order-type ${order.type}">${order.type === 'buy' ? 'Comprar' : 'Vender'}</span>
                </div>
                <div class="order-details">
                    <div class="order-detail">
                        <span class="label">Cantidad</span>
                        <span class="value">${order.amount.toLocaleString()} RSC</span>
                    </div>
                    <div class="order-detail">
                        <span class="label">Precio</span>
                        <span class="value">$${order.price} USDT</span>
                    </div>
                    <div class="order-detail">
                        <span class="label">Total</span>
                        <span class="value">$${(order.amount * order.price).toLocaleString()} USDT</span>
                    </div>
                    <div class="order-detail">
                        <span class="label">Métodos</span>
                        <span class="value">${paymentMethodsText}</span>
                    </div>
                </div>
                <div class="order-actions">
                    <button class="btn-trade" onclick="startTrade(${order.id})">Iniciar Trade</button>
                    <button class="btn-chat" onclick="openChat('${order.trader.name}')">Chat</button>
                </div>
            `;

            container.appendChild(orderElement);
        });
    }

    loadTransactions() {
        this.transactions = [
            {
                id: 1,
                date: new Date(Date.now() - 3600000),
                type: 'buy',
                amount: 1000,
                price: 0.85,
                total: 850,
                counterparty: 'CryptoTrader_2024',
                status: 'completed'
            },
            {
                id: 2,
                date: new Date(Date.now() - 7200000),
                type: 'sell',
                amount: 2500,
                price: 0.86,
                total: 2150,
                counterparty: 'RSC_Holder',
                status: 'completed'
            },
            {
                id: 3,
                date: new Date(Date.now() - 10800000),
                type: 'buy',
                amount: 500,
                price: 0.84,
                total: 420,
                counterparty: 'DigitalNomad',
                status: 'pending'
            }
        ];

        this.renderTransactions();
    }

    renderTransactions() {
        const tbody = document.getElementById('transactionsTableBody');
        tbody.innerHTML = '';

        this.transactions.forEach(tx => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${tx.date.toLocaleDateString()}</td>
                <td>${tx.type === 'buy' ? 'Compra' : 'Venta'}</td>
                <td>${tx.amount.toLocaleString()} RSC</td>
                <td>$${tx.price} USDT</td>
                <td>$${tx.total.toLocaleString()} USDT</td>
                <td>${tx.counterparty}</td>
                <td><span class="status ${tx.status}">${tx.status}</span></td>
                <td>
                    <button onclick="viewTransaction(${tx.id})" class="btn-view-tx">Ver</button>
                </td>
            `;

            tbody.appendChild(row);
        });
    }

    filterOrders() {
        const searchTerm = document.getElementById('searchTrader').value.toLowerCase();
        const paymentMethod = document.getElementById('paymentMethod').value;
        const orderType = document.getElementById('orderType').value;

        let filteredBuyOrders = this.buyOrders.filter(order => {
            const matchesSearch = order.trader.name.toLowerCase().includes(searchTerm);
            const matchesPayment = !paymentMethod || order.paymentMethods.includes(paymentMethod);
            const matchesType = !orderType || order.type === orderType;
            return matchesSearch && matchesPayment && matchesType;
        });

        let filteredSellOrders = this.sellOrders.filter(order => {
            const matchesSearch = order.trader.name.toLowerCase().includes(searchTerm);
            const matchesPayment = !paymentMethod || order.paymentMethods.includes(paymentMethod);
            const matchesType = !orderType || order.type === orderType;
            return matchesSearch && matchesPayment && matchesType;
        });

        this.renderOrderSection('buyOrdersContainer', filteredBuyOrders);
        this.renderOrderSection('sellOrdersContainer', filteredSellOrders);
    }

    sortOrders() {
        const sortBy = document.getElementById('sortBy').value;
        
        const sortFunction = (a, b) => {
            switch(sortBy) {
                case 'price':
                    return a.price - b.price;
                case 'volume':
                    return b.amount - a.amount;
                case 'rating':
                    return b.trader.rating - a.trader.rating;
                case 'time':
                    return b.id - a.id;
                default:
                    return 0;
            }
        };

        this.buyOrders.sort(sortFunction);
        this.sellOrders.sort(sortFunction);
        this.renderOrders();
    }

    updateOrderSummary() {
        const amount = parseFloat(document.getElementById('orderAmount').value) || 0;
        const price = parseFloat(document.getElementById('orderPrice').value) || 0;
        const total = amount * price;
        const fee = total * 0.005; // 0.5% fee

        document.getElementById('orderTotal').textContent = `$${total.toFixed(2)} USDT`;
        document.getElementById('orderFee').textContent = `$${fee.toFixed(2)} USDT`;
    }

    async createOrder() {
        // Validar wallet
        const wallet = localStorage.getItem('rsc_wallet');
        if (!wallet) {
            this.showNotification('Debes crear una wallet antes de crear una orden.', 'error');
            setTimeout(() => { window.location.href = 'wallet.html'; }, 1800);
            return;
        }
        const { privateKey } = JSON.parse(wallet);
        const address = '0x' + privateKey.slice(-40);
        // Obtener datos del formulario
        const type = document.getElementById('orderTypeForm').value;
        const amount = parseFloat(document.getElementById('orderAmount').value);
        const price = parseFloat(document.getElementById('orderPrice').value);
        if (!type || !amount || !price) {
            this.showNotification('Completa todos los campos para crear la orden.', 'error');
            return;
        }
        try {
            const res = await fetch('/api/p2p/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, type, amount, price })
            });
            if (!res.ok) throw new Error('No se pudo crear la orden');
            const data = await res.json();
            this.showNotification('Orden creada con éxito', 'success');
            // Refrescar órdenes
            await this.loadOrders();
        } catch (err) {
            this.showNotification('Error al crear la orden', 'error');
        }
    }

    startPriceUpdates() {
        setInterval(() => {
            // Simulate price changes
            const change = (Math.random() - 0.5) * 0.01;
            this.currentPrice += change;
            this.currentPrice = Math.max(0.7, Math.min(1.0, this.currentPrice));
            
            this.priceChange = this.currentPrice - 0.73;
            this.priceChangePercent = (this.priceChange / 0.73) * 100;
            
            this.updatePriceDisplay();
        }, 30000); // Update every 30 seconds
    }

    updatePriceDisplay() {
        const priceElement = document.querySelector('.price-value');
        const changeElement = document.querySelector('.price-change');
        
        if (priceElement) {
            priceElement.textContent = `$${this.currentPrice.toFixed(2)}`;
        }
        
        if (changeElement) {
            const isPositive = this.priceChange >= 0;
            changeElement.textContent = `${isPositive ? '+' : ''}$${this.priceChange.toFixed(2)} (${isPositive ? '+' : ''}${this.priceChangePercent.toFixed(1)}%)`;
            changeElement.className = `price-change ${isPositive ? 'positive' : 'negative'}`;
        }
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
function openCreateOrderModal() {
    document.getElementById('createOrderModal').style.display = 'block';
}

function closeCreateOrderModal() {
    document.getElementById('createOrderModal').style.display = 'none';
    document.getElementById('createOrderForm').reset();
}

function startTrade(orderId) {
    const allOrders = [...window.rscP2P.buyOrders, ...window.rscP2P.sellOrders];
    const order = allOrders.find(o => o.id === orderId);
    
    if (order) {
        document.getElementById('traderName').textContent = order.trader.name;
        document.getElementById('transactionType').textContent = order.type === 'buy' ? 'Comprar RSC' : 'Vender RSC';
        document.getElementById('transactionAmount').textContent = `${order.amount.toLocaleString()} RSC`;
        document.getElementById('transactionPrice').textContent = `$${order.price} USDT`;
        document.getElementById('transactionTotal').textContent = `$${(order.amount * order.price).toLocaleString()} USDT`;
        document.getElementById('paymentMethodName').textContent = order.paymentMethods.map(method => {
            const methods = {
                'bank': 'Transferencia Bancaria',
                'paypal': 'PayPal',
                'cash': 'Efectivo',
                'crypto': 'Otras Criptos'
            };
            return methods[method];
        }).join(', ');
        
        document.getElementById('transactionModal').style.display = 'block';
    }
}

function closeTransactionModal() {
    document.getElementById('transactionModal').style.display = 'none';
}

function confirmTransaction() {
    window.rscP2P.showNotification('Transacción iniciada...', 'info');
    
    setTimeout(() => {
        window.rscP2P.transactions.unshift({
            id: Date.now(),
            date: new Date(),
            type: 'buy',
            amount: 1000,
            price: 0.85,
            total: 850,
            counterparty: 'CryptoTrader_2024',
            status: 'pending'
        });
        
        window.rscP2P.renderTransactions();
        closeTransactionModal();
        window.rscP2P.showNotification('Transacción confirmada', 'success');
    }, 2000);
}

function openChat(traderName) {
    document.getElementById('chatTraderName').textContent = traderName;
    document.getElementById('chatModal').style.display = 'block';
    loadChatMessages();
}

function closeChatModal() {
    document.getElementById('chatModal').style.display = 'none';
}

function loadChatMessages() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';
    
    const sampleMessages = [
        { text: 'Hola! ¿Estás interesado en mi orden?', sent: false, time: '10:30' },
        { text: 'Sí, me interesa. ¿Puedes explicarme los términos?', sent: true, time: '10:32' },
        { text: 'Claro, acepto transferencia bancaria inmediata. ¿Te parece bien?', sent: false, time: '10:35' },
        { text: 'Perfecto, procedo con la transacción', sent: true, time: '10:37' }
    ];
    
    sampleMessages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${msg.sent ? 'sent' : 'received'}`;
        
        messageElement.innerHTML = `
            <div class="message-content">${msg.text}</div>
            <div class="message-time">${msg.time}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
    });
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        messageElement.className = 'message sent';
        
        const now = new Date();
        const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        messageElement.innerHTML = `
            <div class="message-content">${message}</div>
            <div class="message-time">${time}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        input.value = '';
        
        // Simulate response
        setTimeout(() => {
            const responseElement = document.createElement('div');
            responseElement.className = 'message received';
            
            responseElement.innerHTML = `
                <div class="message-content">Mensaje recibido, te respondo en un momento.</div>
                <div class="message-time">${time}</div>
            `;
            
            messagesContainer.appendChild(responseElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);
    }
}

function refreshPrice() {
    const btn = document.querySelector('.btn-refresh');
    btn.style.transform = 'rotate(360deg)';
    
    setTimeout(() => {
        btn.style.transform = 'rotate(0deg)';
        window.rscP2P.showNotification('Precio actualizado', 'success');
    }, 1000);
}

function toggleChart() {
    const chartContainer = document.getElementById('priceChart');
    chartContainer.style.display = chartContainer.style.display === 'none' ? 'block' : 'none';
}

function switchView(view) {
    window.rscP2P.currentView = view;
    window.rscP2P.renderOrders();
}

function filterOrders() {
    window.rscP2P.filterOrders();
}

function sortOrders() {
    window.rscP2P.sortOrders();
}

function viewMyOrders() {
    alert('Mis órdenes próximamente');
}

function openDepositModal() {
    alert('Depósito próximamente');
}

function openWithdrawModal() {
    alert('Retiro próximamente');
}

function openSettingsModal() {
    alert('Configuración próximamente');
}

function exportTransactions() {
    const transactions = window.rscP2P.transactions;
    const csv = [
        ['Fecha', 'Tipo', 'Cantidad', 'Precio', 'Total', 'Contraparte', 'Estado'],
        ...transactions.map(tx => [
            tx.date.toLocaleDateString(),
            tx.type === 'buy' ? 'Compra' : 'Venta',
            tx.amount,
            tx.price,
            tx.total,
            tx.counterparty,
            tx.status
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transacciones_p2p.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function filterTransactions() {
    alert('Filtros de transacciones próximamente');
}

function viewTransaction(id) {
    const transaction = window.rscP2P.transactions.find(tx => tx.id === id);
    if (transaction) {
        alert(`Transacción #${id}\nFecha: ${transaction.date.toLocaleDateString()}\nTipo: ${transaction.type}\nCantidad: ${transaction.amount} RSC\nPrecio: $${transaction.price} USDT\nTotal: $${transaction.total} USDT\nContraparte: ${transaction.counterparty}\nEstado: ${transaction.status}`);
    }
}

// Initialize P2P when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.rscP2P = new RSCP2P();
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
    
    .btn-view-tx {
        background: rgba(117, 87, 252, 0.2);
        border: 1px solid rgba(117, 87, 252, 0.3);
        border-radius: 4px;
        padding: 4px 8px;
        color: #fff;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.3s ease;
    }
    
    .btn-view-tx:hover {
        background: rgba(117, 87, 252, 0.4);
    }
`;
document.head.appendChild(style);
