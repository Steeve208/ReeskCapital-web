// =====================
// WALLET FUNCTIONALITY
// =====================

class RSCWallet {
    constructor() {
        // Usar clave privada de localStorage si existe
        const stored = localStorage.getItem('rsc_wallet');
        if (stored) {
            const { privateKey } = JSON.parse(stored);
            this.privateKey = privateKey;
            // Simular derivación de dirección (en producción usar librería)
            this.address = '0x' + privateKey.slice(-40);
        } else {
            this.privateKey = null;
            this.address = null;
        }
        this.balance = 125847.32;
        this.transactions = [];
        this.isBalanceHidden = false;
        
        this.init();
    }

    async init() {
        await this.loadBalance();
        await this.loadTransactions();
        this.setupEventListeners();
        this.initChart();
        this.generateQRCode();
    }

    async loadBalance() {
        if (!this.address) return;
        try {
            const res = await fetch(`/api/wallet/balance?address=${this.address}`);
            if (!res.ok) throw new Error('No se pudo obtener el balance');
            const data = await res.json();
            this.balance = data.balance || 0;
            if (!this.isBalanceHidden) {
                document.getElementById('balanceAmount').innerHTML = `<span class="amount">${this.balance.toLocaleString()}</span><span class="currency">RSC</span>`;
            }
        } catch (err) {
            this.showNotification('Error al obtener balance', 'error');
        }
    }

    async loadTransactions() {
        if (!this.address) return;
        try {
            const res = await fetch(`/api/wallet/transactions?address=${this.address}`);
            if (!res.ok) throw new Error('No se pudo obtener el historial');
            const data = await res.json();
            this.transactions = Array.isArray(data.transactions) ? data.transactions : [];
        } catch (err) {
            this.transactions = [];
            this.showNotification('Error al obtener transacciones', 'error');
        }
        this.renderTransactions();
    }

    async refreshBalance() {
        const refreshBtn = document.getElementById('refreshBalance');
        refreshBtn.style.transform = 'rotate(360deg)';
        await this.loadBalance();
        refreshBtn.style.transform = 'rotate(0deg)';
        this.showNotification('Balance actualizado', 'success');
    }

    setupEventListeners() {
        // Toggle balance visibility
        document.getElementById('toggleBalance').addEventListener('click', () => {
            this.toggleBalanceVisibility();
        });

        // Refresh balance
        document.getElementById('refreshBalance').addEventListener('click', () => {
            this.refreshBalance();
        });

        // Send form
        document.getElementById('sendForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendTransaction();
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

        // Set max amount
        document.getElementById('sendAmount').addEventListener('input', () => {
            this.updateTransactionSummary();
        });

        document.getElementById('gasPrice').addEventListener('input', () => {
            this.updateTransactionSummary();
        });
    }

    toggleBalanceVisibility() {
        this.isBalanceHidden = !this.isBalanceHidden;
        const balanceElement = document.getElementById('balanceAmount');
        const toggleBtn = document.getElementById('toggleBalance');
        
        if (this.isBalanceHidden) {
            balanceElement.innerHTML = '<span class="amount">••••••••</span><span class="currency">RSC</span>';
            toggleBtn.textContent = '👁️‍🗨️';
        } else {
            balanceElement.innerHTML = `<span class="amount">${this.balance.toLocaleString()}</span><span class="currency">RSC</span>`;
            toggleBtn.textContent = '👁️';
        }
    }

    initChart() {
        const ctx = document.getElementById('balanceChart').getContext('2d');
        
        // Generate sample data
        const data = [];
        const labels = [];
        let value = 100000;
        
        for (let i = 0; i < 30; i++) {
            value += (Math.random() - 0.5) * 10000;
            data.push(value);
            labels.push(`Día ${i + 1}`);
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Balance RSC',
                    data: data,
                    borderColor: '#7657fc',
                    backgroundColor: 'rgba(117, 87, 252, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#3fd8c2'
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

    renderTransactions() {
        const container = document.getElementById('transactionsList');
        container.innerHTML = '';

        this.transactions.forEach(tx => {
            const txElement = document.createElement('div');
            txElement.className = 'transaction-item';
            
            const icon = tx.type === 'send' ? '📤' : '📥';
            const iconClass = tx.type === 'send' ? 'send' : 'receive';
            const amountColor = tx.type === 'send' ? '#e35060' : '#24db81';
            const amountPrefix = tx.type === 'send' ? '-' : '+';

            txElement.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-icon ${iconClass}">${icon}</div>
                    <div class="transaction-details">
                        <h4>${tx.type === 'send' ? 'Enviado' : 'Recibido'}</h4>
                        <p>${tx.address}</p>
                    </div>
                </div>
                <div class="transaction-amount">
                    <span class="amount" style="color: ${amountColor}">${amountPrefix}${tx.amount.toLocaleString()} RSC</span>
                    <span class="time">${this.formatTime(tx.timestamp)}</span>
                </div>
            `;

            container.appendChild(txElement);
        });
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        return `${days}d`;
    }

    generateQRCode() {
        const qrContainer = document.getElementById('qrCode');
        new QRCode(qrContainer, {
            text: this.address,
            width: 160,
            height: 160,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    }

    updateTransactionSummary() {
        const amount = parseFloat(document.getElementById('sendAmount').value) || 0;
        const gasPrice = parseFloat(document.getElementById('gasPrice').value) || 20;
        const gasLimit = 21000; // Standard ETH gas limit
        const networkFee = (gasPrice * gasLimit) / 1e9; // Convert to RSC equivalent
        
        document.getElementById('networkFee').textContent = `${networkFee.toFixed(6)} RSC`;
        document.getElementById('totalAmount').textContent = `${(amount + networkFee).toFixed(6)} RSC`;
    }

    sendTransaction() {
        const amount = parseFloat(document.getElementById('sendAmount').value);
        const address = document.getElementById('recipientAddress').value;
        
        if (!amount || !address) {
            this.showNotification('Por favor completa todos los campos', 'error');
            return;
        }

        if (amount > this.balance) {
            this.showNotification('Saldo insuficiente', 'error');
            return;
        }

        // Simulate transaction
        this.showNotification('Transacción enviada...', 'info');
        
        setTimeout(() => {
            this.balance -= amount;
            this.transactions.unshift({
                id: Date.now(),
                type: 'send',
                amount: amount,
                address: address,
                timestamp: new Date(),
                status: 'confirmed'
            });
            
            this.renderTransactions();
            this.closeSendModal();
            this.showNotification('Transacción confirmada', 'success');
        }, 2000);
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

// Modal functions
function openSendModal() {
    document.getElementById('sendModal').style.display = 'block';
}

function closeSendModal() {
    document.getElementById('sendModal').style.display = 'none';
    document.getElementById('sendForm').reset();
}

function openReceiveModal() {
    document.getElementById('receiveModal').style.display = 'block';
}

function closeReceiveModal() {
    document.getElementById('receiveModal').style.display = 'none';
}

function openSwapModal() {
    alert('Funcionalidad de intercambio próximamente');
}

function openStakeModal() {
    window.location.href = 'staking.html';
}

function copyAddress() {
    const address = document.getElementById('walletAddress').textContent;
    navigator.clipboard.writeText(address).then(() => {
        // Show copy notification
        const notification = document.createElement('div');
        notification.textContent = 'Dirección copiada';
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #24db81;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            z-index: 10000;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    });
}

function scanQR() {
    alert('Funcionalidad de escaneo QR próximamente');
}

function setMaxAmount() {
    const wallet = window.rscWallet;
    document.getElementById('sendAmount').value = wallet.balance.toFixed(2);
    wallet.updateTransactionSummary();
}

function toggleFilters() {
    alert('Filtros próximamente');
}

function exportTransactions() {
    const wallet = window.rscWallet;
    const csv = [
        ['Fecha', 'Tipo', 'Cantidad', 'Dirección', 'Estado'],
        ...wallet.transactions.map(tx => [
            tx.timestamp.toLocaleDateString(),
            tx.type === 'send' ? 'Enviado' : 'Recibido',
            tx.amount,
            tx.address,
            tx.status
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transacciones_rsc.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Settings functions
function changePassword() {
    alert('Cambio de contraseña próximamente');
}

function enable2FA() {
    alert('Configuración 2FA próximamente');
}

function backupWallet() {
    alert('Respaldar wallet próximamente');
}

function viewPrivateKey() {
    alert('Ver clave privada próximamente');
}

function changeCurrency() {
    alert('Cambiar moneda próximamente');
}

function setGasLimit() {
    alert('Configurar límite de gas próximamente');
}

function customizeFees() {
    alert('Personalizar comisiones próximamente');
}

function networkSettings() {
    alert('Configuración de red próximamente');
}

function viewAnalytics() {
    alert('Análisis próximamente');
}

function taxReport() {
    alert('Reporte de impuestos próximamente');
}

function portfolioHistory() {
    alert('Historial de portfolio próximamente');
}

function performanceMetrics() {
    alert('Métricas de rendimiento próximamente');
}

// Onboarding/Creación de wallet
function generatePrivateKey() {
  // Simulación de clave privada (en producción usar librería segura)
  const chars = 'abcdef0123456789';
  let key = '0x';
  for (let i = 0; i < 64; i++) key += chars[Math.floor(Math.random() * chars.length)];
  return key;
}
function showOnboarding() {
  const modal = document.getElementById('walletOnboarding');
  const keyInput = document.getElementById('onboardingPrivateKey');
  const copyBtn = document.getElementById('copyPrivateKey');
  const confirmBtn = document.getElementById('confirmOnboarding');
  let privateKey = generatePrivateKey();
  keyInput.value = privateKey;
  modal.style.display = 'block';
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(privateKey);
    copyBtn.textContent = '¡Copiado!';
    setTimeout(() => { copyBtn.textContent = 'Copiar'; }, 1200);
  };
  confirmBtn.onclick = () => {
    // Guardar wallet en localStorage (no-custodial)
    localStorage.setItem('rsc_wallet', JSON.stringify({ privateKey, created: Date.now() }));
    modal.style.display = 'none';
    location.reload();
  };
}

// Initialize wallet when DOM is loaded
window.addEventListener('DOMContentLoaded', async () => {
  if (!localStorage.getItem('rsc_wallet')) {
    showOnboarding();
  } else {
    window.rscWallet = new RSCWallet();
    if (window.rscWallet.init instanceof Function) {
      await window.rscWallet.init();
    }
  }
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
