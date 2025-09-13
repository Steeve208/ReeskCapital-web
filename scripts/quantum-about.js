/* ===== QUANTUM ABOUT PAGE JAVASCRIPT ===== */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initQuantumParticles();
    initQuantumNodes();
    initQuantumStats();
    initScrollIndicator();
    initTechTabs();
    initAOS();
});

/* ===== QUANTUM PARTICLES ===== */
function initQuantumParticles() {
    const particlesContainer = document.getElementById('quantum-particles');
    if (!particlesContainer) return;

    // Create quantum particles
    for (let i = 0; i < 50; i++) {
        createQuantumParticle(particlesContainer);
    }
}

function createQuantumParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'quantum-particle';
    
    // Random properties
    const size = Math.random() * 4 + 1;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const duration = Math.random() * 20 + 10;
    const delay = Math.random() * 5;
    
    // Random color
    const colors = ['#00d4ff', '#ff00ff', '#00ff88'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        left: ${x}%;
        top: ${y}%;
        opacity: ${Math.random() * 0.8 + 0.2};
        animation: quantumParticleFloat ${duration}s ease-in-out infinite;
        animation-delay: ${delay}s;
        box-shadow: 0 0 ${size * 2}px ${color};
    `;
    
    container.appendChild(particle);
}

/* ===== QUANTUM NODES INTERACTION ===== */
function initQuantumNodes() {
    const nodes = document.querySelectorAll('.quantum-node');
    
    nodes.forEach(node => {
        node.addEventListener('mouseenter', function() {
            const tech = this.getAttribute('data-tech');
            showTechTooltip(this, tech);
            highlightConnections(this);
        });
        
        node.addEventListener('mouseleave', function() {
            hideTechTooltip();
            removeHighlightConnections();
        });
        
        node.addEventListener('click', function() {
            const tech = this.getAttribute('data-tech');
            showTechModal(tech);
        });
    });
}

function showTechTooltip(node, tech) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tech-tooltip';
    tooltip.innerHTML = getTechDescription(tech);
    
    document.body.appendChild(tooltip);
    
    // Position tooltip
    const rect = node.getBoundingClientRect();
    tooltip.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top - 10}px;
        transform: translateX(-50%) translateY(-100%);
        background: rgba(0, 0, 0, 0.9);
        color: #00d4ff;
        padding: 1rem;
        border-radius: 10px;
        border: 1px solid rgba(0, 212, 255, 0.3);
        backdrop-filter: blur(10px);
        z-index: 1000;
        max-width: 300px;
        font-size: 0.9rem;
        line-height: 1.4;
        animation: tooltipFadeIn 0.3s ease;
    `;
}

function hideTechTooltip() {
    const tooltip = document.querySelector('.tech-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

function getTechDescription(tech) {
    const descriptions = {
        'AI': 'Artificial Intelligence layer with neural networks, federated learning, and anomaly detection',
        'Quantum': 'Post-quantum cryptography with XMSS, SPHINCS+, and Dilithium algorithms',
        'Consensus': 'Hybrid consensus combining PoW, PoS, and VRF for maximum security',
        'Security': 'Advanced security with zero-knowledge proofs and behavioral analysis',
        'P2P': 'Kademlia DHT network with QUIC/Noise protocol and geographic optimization',
        'Storage': 'RocksDB with intelligent caching, compression, and automated backups'
    };
    return descriptions[tech] || 'Advanced blockchain technology component';
}

function highlightConnections(node) {
    const core = document.querySelector('.core-center');
    const nodeRect = node.getBoundingClientRect();
    const coreRect = core.getBoundingClientRect();
    
    // Create connection line
    const line = document.createElement('div');
    line.className = 'connection-line';
    
    const angle = Math.atan2(
        nodeRect.top + nodeRect.height / 2 - (coreRect.top + coreRect.height / 2),
        nodeRect.left + nodeRect.width / 2 - (coreRect.left + coreRect.width / 2)
    );
    
    const distance = Math.sqrt(
        Math.pow(nodeRect.left + nodeRect.width / 2 - (coreRect.left + coreRect.width / 2), 2) +
        Math.pow(nodeRect.top + nodeRect.height / 2 - (coreRect.top + coreRect.height / 2), 2)
    );
    
    line.style.cssText = `
        position: fixed;
        left: ${coreRect.left + coreRect.width / 2}px;
        top: ${coreRect.top + coreRect.height / 2}px;
        width: ${distance}px;
        height: 2px;
        background: linear-gradient(90deg, #00d4ff, #ff00ff);
        transform-origin: 0 0;
        transform: rotate(${angle}rad);
        z-index: 999;
        animation: connectionPulse 1s ease-in-out infinite;
    `;
    
    document.body.appendChild(line);
}

function removeHighlightConnections() {
    const lines = document.querySelectorAll('.connection-line');
    lines.forEach(line => line.remove());
}

/* ===== TECH MODAL ===== */
function showTechModal(tech) {
    const modal = document.createElement('div');
    modal.className = 'tech-modal';
    modal.innerHTML = getTechModalContent(tech);
    
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Close modal on click outside or escape key
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeTechModal();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeTechModal();
        }
    });
}

function closeTechModal() {
    const modal = document.querySelector('.tech-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function getTechModalContent(tech) {
    const content = {
        'AI': {
            title: 'Artificial Intelligence',
            description: 'RSC Chain integrates advanced AI in every component, providing intelligent optimization, anomaly detection, and predictive analytics.',
            features: [
                'Neural Networks (LSTM, Transformers, ConvNets, GNN)',
                'Federated Learning with privacy preservation',
                'Anomaly Detection with autoencoders',
                'Predictive Analytics for network optimization',
                'Behavioral Analysis for security'
            ]
        },
        'Quantum': {
            title: 'Post-Quantum Cryptography',
            description: 'Military-grade security with quantum-resistant algorithms to protect against future quantum computing threats.',
            features: [
                'XMSS - Extended Merkle Signature Scheme',
                'SPHINCS+ - Spherical signatures',
                'Dilithium - Lattice-based cryptography',
                'Kyber - Key encapsulation mechanism',
                'Zero-knowledge proofs integration'
            ]
        },
        'Consensus': {
            title: 'Hybrid Consensus',
            description: 'The world\'s first hybrid consensus combining PoW, PoS, and VRF for maximum security and efficiency.',
            features: [
                'Proof of Work with multiple algorithms',
                'Proof of Stake with intelligent validator selection',
                'Verifiable Random Function for fairness',
                'AI-powered consensus optimization',
                'Cross-chain consensus capabilities'
            ]
        },
        'Security': {
            title: 'Advanced Security',
            description: 'Multi-layered security system with behavioral analysis, threat detection, and adaptive protection.',
            features: [
                'Firewall L7 with intelligent filtering',
                'Behavioral analysis and user profiling',
                'Real-time threat detection',
                'Automated response system',
                'Confidential transactions support'
            ]
        },
        'P2P': {
            title: 'P2P Network',
            description: 'Next-generation peer-to-peer network with geographic optimization and intelligent routing.',
            features: [
                'Kademlia DHT for efficient lookups',
                'Gossip protocol for message propagation',
                'QUIC/Noise for secure connections',
                'Geographic analysis and optimization',
                'AI-powered load balancing'
            ]
        },
        'Storage': {
            title: 'Intelligent Storage',
            description: 'High-performance storage system with intelligent caching, compression, and automated backups.',
            features: [
                'RocksDB with LSM tree optimization',
                'TTL cache with intelligent eviction',
                'Advanced compression algorithms',
                'Automated backup and recovery',
                'AI-powered storage optimization'
            ]
        }
    };
    
    const techData = content[tech] || content['AI'];
    
    return `
        <div class="tech-modal-overlay">
            <div class="tech-modal-content">
                <div class="tech-modal-header">
                    <h2>${techData.title}</h2>
                    <button class="tech-modal-close">&times;</button>
                </div>
                <div class="tech-modal-body">
                    <p class="tech-modal-description">${techData.description}</p>
                    <div class="tech-modal-features">
                        <h3>Key Features:</h3>
                        <ul>
                            ${techData.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/* ===== QUANTUM STATS ANIMATION ===== */
function initQuantumStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const start = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(progress * target);
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    
    requestAnimationFrame(updateCounter);
}

/* ===== SCROLL INDICATOR ===== */
function initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (!scrollIndicator) return;
    
    scrollIndicator.addEventListener('click', function() {
        const nextSection = document.querySelector('#architecture') || document.querySelector('.technology-section');
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

/* ===== TECH TABS ===== */
function initTechTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            this.classList.add('active');
            const targetPanel = document.getElementById(targetTab + '-panel');
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

/* ===== AOS INITIALIZATION ===== */
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }
}

/* ===== ADDITIONAL CSS FOR MODALS AND TOOLTIPS ===== */
const additionalStyles = `
<style>
.tech-tooltip {
    pointer-events: none;
}

@keyframes tooltipFadeIn {
    from { opacity: 0; transform: translateX(-50%) translateY(-100%) scale(0.8); }
    to { opacity: 1; transform: translateX(-50%) translateY(-100%) scale(1); }
}

@keyframes connectionPulse {
    0%, 100% { opacity: 0.5; transform: scaleX(1); }
    50% { opacity: 1; transform: scaleX(1.1); }
}

.tech-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.tech-modal.show {
    opacity: 1;
    visibility: visible;
}

.tech-modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.tech-modal-content {
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 20px;
    max-width: 600px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
    from { transform: translateY(50px) scale(0.9); opacity: 0; }
    to { transform: translateY(0) scale(1); opacity: 1; }
}

.tech-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 2rem 1rem;
    border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.tech-modal-header h2 {
    color: #00d4ff;
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0;
}

.tech-modal-close {
    background: none;
    border: none;
    color: #00d4ff;
    font-size: 2rem;
    cursor: pointer;
    padding: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.tech-modal-close:hover {
    background: rgba(0, 212, 255, 0.1);
    transform: scale(1.1);
}

.tech-modal-body {
    padding: 2rem;
}

.tech-modal-description {
    color: #b0b0b0;
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 2rem;
}

.tech-modal-features h3 {
    color: #00d4ff;
    font-size: 1.2rem;
    margin-bottom: 1rem;
}

.tech-modal-features ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.tech-modal-features li {
    color: #ffffff;
    padding: 0.5rem 0;
    padding-left: 1.5rem;
    position: relative;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tech-modal-features li:before {
    content: '▶';
    position: absolute;
    left: 0;
    color: #00d4ff;
    font-size: 0.8rem;
}

.tech-modal-features li:last-child {
    border-bottom: none;
}

@keyframes quantumParticleFloat {
    0%, 100% { 
        transform: translateY(0px) translateX(0px) rotate(0deg);
        opacity: 0.3;
    }
    25% { 
        transform: translateY(-20px) translateX(10px) rotate(90deg);
        opacity: 0.8;
    }
    50% { 
        transform: translateY(-10px) translateX(-10px) rotate(180deg);
        opacity: 0.5;
    }
    75% { 
        transform: translateY(-30px) translateX(5px) rotate(270deg);
        opacity: 0.7;
    }
}
</style>
`;

// Inject additional styles
document.head.insertAdjacentHTML('beforeend', additionalStyles);
