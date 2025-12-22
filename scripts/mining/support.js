// ===== SUPPORT PAGE LOGIC =====

(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        initializeSupport();
        setupEventListeners();
        loadTickets();
        loadFAQ();
    });
    
    function initializeSupport() {
        console.log('❓ Initializing Support page...');
    }
    
    function setupEventListeners() {
        // Create ticket button
        const createTicketBtn = document.getElementById('createTicketBtn');
        const createTicketModal = document.getElementById('createTicketModal');
        const closeTicketModal = document.getElementById('closeTicketModal');
        const cancelTicketBtn = document.getElementById('cancelTicketBtn');
        const submitTicketBtn = document.getElementById('submitTicketBtn');
        
        if (createTicketBtn && createTicketModal) {
            createTicketBtn.addEventListener('click', () => {
                createTicketModal.classList.add('active');
            });
        }
        
        if (closeTicketModal) {
            closeTicketModal.addEventListener('click', () => {
                createTicketModal.classList.remove('active');
            });
        }
        
        if (cancelTicketBtn) {
            cancelTicketBtn.addEventListener('click', () => {
                createTicketModal.classList.remove('active');
            });
        }
        
        if (submitTicketBtn) {
            submitTicketBtn.addEventListener('click', submitTicket);
        }
        
        // FAQ accordion
        setupFAQAccordion();
    }
    
    async function loadTickets() {
        const ticketsList = document.getElementById('ticketsList');
        if (!ticketsList) return;
        
        // Load from Supabase
        if (window.miningSupabaseAdapter && window.miningSupabaseAdapter.initialized) {
            try {
                const response = await window.miningSupabaseAdapter.supabase.makeRequest(
                    'GET',
                    `/rest/v1/support_tickets?user_id=eq.${window.miningSupabaseAdapter.supabase.user.id}&order=created_at.desc`
                );
                
                if (response.ok) {
                    const tickets = await response.json();
                    displayTickets(tickets);
                    return;
                }
            } catch (error) {
                console.error('Error cargando tickets:', error);
            }
        }
        
        // Fallback: empty state
        ticketsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-ticket-alt"></i>
                <p>No tienes tickets de soporte</p>
            </div>
        `;
    }
    
    function displayTickets(tickets) {
        const ticketsList = document.getElementById('ticketsList');
        if (!ticketsList) return;
        
        if (tickets.length === 0) {
            ticketsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-ticket-alt"></i>
                    <p>No tienes tickets de soporte</p>
                </div>
            `;
            return;
        }
        
        ticketsList.innerHTML = tickets.map(ticket => {
            const created = new Date(ticket.created_at);
            const updated = new Date(ticket.updated_at || ticket.created_at);
            const preview = ticket.message.substring(0, 100) + (ticket.message.length > 100 ? '...' : '');
            
            return `
                <div class="ticket-card">
                    <div class="ticket-header">
                        <div class="ticket-info">
                            <div class="ticket-id">#${ticket.id.substring(0, 8)}</div>
                            <div class="ticket-subject">${ticket.subject}</div>
                            <div class="ticket-meta">
                                <span>Creado: ${created.toLocaleDateString('es-ES')}</span>
                                <span>Última actualización: ${updated.toLocaleDateString('es-ES')}</span>
                            </div>
                        </div>
                        <div class="ticket-status ${ticket.status}">${getStatusText(ticket.status)}</div>
                    </div>
                    <div class="ticket-preview">${preview}</div>
                    <div class="ticket-actions">
                        <button class="btn btn-primary btn-sm" onclick="viewTicket('${ticket.id}')">
                            <i class="fas fa-eye"></i>
                            <span>Ver Ticket</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    function loadFAQ() {
        const faqList = document.getElementById('faqList');
        if (!faqList) return;
        
        const faqs = [
            {
                question: '¿Cómo empiezo a minar?',
                answer: 'Para empezar a minar, simplemente ve a la sección "Mining Control" y haz clic en "Iniciar Minería". Asegúrate de tener configurado un pool válido en la configuración.'
            },
            {
                question: '¿Cuál es la comisión del pool?',
                answer: 'La comisión del pool oficial de RSC es del 1%. Esta comisión se deduce de las recompensas del bloque antes de distribuir entre los mineros.'
            },
            {
                question: '¿Cuánto tiempo tarda en llegar un pago?',
                answer: 'Los pagos se procesan automáticamente cuando alcanzas el mínimo de retiro (0.1 RSC). El tiempo de confirmación en la blockchain es de aproximadamente 1-2 minutos.'
            },
            {
                question: '¿Puedo minar desde múltiples dispositivos?',
                answer: 'Sí, puedes minar desde múltiples dispositivos usando la misma cuenta. Todos los hashrates se sumarán y las ganancias se acumularán en tu balance.'
            },
            {
                question: '¿Qué pasa si mi conexión se cae?',
                answer: 'Si tu conexión se interrumpe, la minería se detendrá automáticamente. Cuando vuelvas a conectarte, puedes reanudar la minería desde donde se detuvo.'
            },
            {
                question: '¿Cómo funcionan las comisiones de referidos?',
                answer: 'Ganas el 10% de todas las ganancias de minería de tus referidos. Las comisiones se calculan en tiempo real y se añaden a tu balance automáticamente.'
            }
        ];
        
        faqList.innerHTML = faqs.map((faq, index) => `
            <div class="faq-item" data-index="${index}">
                <div class="faq-question" onclick="toggleFAQ(${index})">
                    <span>${faq.question}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="faq-answer">
                    <div class="faq-answer-content">
                        ${faq.answer}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    function setupFAQAccordion() {
        // Handled by toggleFAQ function
    }
    
    window.toggleFAQ = function(index) {
        const faqItem = document.querySelector(`.faq-item[data-index="${index}"]`);
        if (faqItem) {
            const isActive = faqItem.classList.contains('active');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                faqItem.classList.add('active');
            }
        }
    };
    
    async function submitTicket() {
        const subject = document.getElementById('ticketSubject').value;
        const category = document.getElementById('ticketCategory')?.value || 'general';
        const description = document.getElementById('ticketDescription')?.value || document.getElementById('ticketMessage')?.value;
        
        if (!subject || !description) {
            window.miningNotifications?.error('Por favor completa el asunto y la descripción');
            return;
        }
        
        // Submit ticket via Supabase
        if (window.miningSupabaseAdapter && window.miningSupabaseAdapter.initialized) {
            try {
                const ticket = await window.miningSupabaseAdapter.createSupportTicket({
                    subject,
                    message: description,
                    category: category || 'general',
                    priority: 'medium'
                });
                
                if (ticket) {
                    // Close modal
                    document.getElementById('createTicketModal').classList.remove('active');
                    
                    // Clear form
                    document.getElementById('ticketSubject').value = '';
                    if (document.getElementById('ticketDescription')) document.getElementById('ticketDescription').value = '';
                    if (document.getElementById('ticketMessage')) document.getElementById('ticketMessage').value = '';
                    
                    window.miningNotifications?.success('Ticket creado exitosamente');
                    loadTickets();
                } else {
                    throw new Error('Error al crear el ticket');
                }
            } catch (error) {
                console.error('Error creando ticket:', error);
                window.miningNotifications?.error('Error al crear el ticket. Intenta de nuevo.');
            }
        } else {
            window.miningNotifications?.error('Sistema no disponible. Intenta más tarde.');
        }
    }
    
    window.viewTicket = function(ticketId) {
        alert('Ver ticket: ' + ticketId);
    };
    
    window.scrollToSection = function(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    
    function getStatusText(status) {
        const statusMap = {
            'open': 'Abierto',
            'pending': 'Pendiente',
            'closed': 'Cerrado'
        };
        return statusMap[status] || status;
    }
    
    function showNotification(message, type) {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }
    
    console.log('✅ Support page initialized');
})();

