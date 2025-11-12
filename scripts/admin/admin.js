const ADMIN_CONFIG = {
    allowedEmails: window.FollowBonusAdminConfig?.allowedEmails || [],
    eventReward: 100,
    eventBonusType: 'follow_bonus'
};

class AdminDashboard {
    constructor() {
        this.state = {
            filter: 'pending',
            requests: [],
            summary: {
                pending: 0,
                approved: 0,
                rejected: 0,
                total: 0
            },
            metrics: {
                approvalRate: 0,
                rejectionRate: 0,
                averageProofs: '0.0',
                lastSubmission: null
            }
        };

        this.commandPalette = {
            isOpen: false,
            commands: [],
            filtered: [],
            activeIndex: 0
        };

        this.elements = {
            guard: document.getElementById('adminGuard'),
            content: document.getElementById('adminContent'),
            userInfo: document.getElementById('adminUserInfo'),
            connectionStatus: document.getElementById('adminConnectionStatus'),
            logoutBtn: document.getElementById('adminLogoutBtn'),
            openLoginBtn: document.getElementById('adminOpenLogin'),
            tabs: document.getElementById('adminTabs'),
            filters: document.getElementById('followBonusFilters'),
            refreshBtn: document.getElementById('refreshFollowBonus'),
            tableBody: document.getElementById('followBonusTableBody'),
            summaryCards: document.querySelector('[id="followBonusSummary"]'),
            metrics: document.getElementById('followBonusMetrics'),
            proofModal: document.getElementById('proofModal'),
            proofModalBody: document.getElementById('proofModalBody'),
            adminYear: document.getElementById('adminYear'),
            buildVersion: document.getElementById('adminBuildVersion'),
            quickActions: document.getElementById('quickActions'),
            liveFeedTimeline: document.getElementById('liveFeedTimeline'),
            commandPalette: document.getElementById('commandPalette'),
            commandSearch: document.getElementById('commandSearch'),
            commandList: document.getElementById('commandList'),
            closeCommandPalette: document.getElementById('closeCommandPalette'),
            openCommandPalette: document.getElementById('openCommandPalette')
        };

        this.isAuthorizedSession = false;
        this.guardToastShown = false;
        this.adminAuth = window.adminAuth;
        this.init();
    }

    async init() {
        this.elements.adminYear.textContent = new Date().getFullYear();
        this.elements.buildVersion.textContent = window.FollowBonusAdminConfig?.buildVersion || '1.0.0';

        this.registerCommands();
        this.bindUI();
        await this.ensureAdminAuth();
        this.updateConnectionStatus();
        this.checkAccess();
    }

    registerCommands() {
        this.commandPalette.commands = [
            {
                id: 'approveNext',
                label: 'Approve next pending request',
                hint: 'Shift + A',
                handler: () => this.approveNextPending()
            },
            {
                id: 'rejectNext',
                label: 'Reject next pending request (duplicate)',
                hint: 'Shift + R',
                handler: () => this.rejectNextPending('Auto rejection (duplicate entry)')
            },
            {
                id: 'openProof',
                label: 'Open proof gallery for latest submission',
                hint: 'Shift + O',
                handler: () => this.openLatestProof()
            },
            {
                id: 'refresh',
                label: 'Refresh follow bonus queue',
                hint: 'Shift + F',
                handler: () => this.fetchRequests()
            },
            {
                id: 'exportCsv',
                label: 'Export current queue to CSV',
                hint: 'Shift + E',
                handler: () => this.exportCsv()
            },
            {
                id: 'copySummary',
                label: 'Copy approval summary to clipboard',
                hint: 'Shift + C',
                handler: () => this.copySummaryToClipboard()
            }
        ];
        this.commandPalette.filtered = this.commandPalette.commands;
    }

    bindUI() {
        this.elements.openLoginBtn?.addEventListener('click', () => this.openLogin());
        this.elements.logoutBtn?.addEventListener('click', () => this.logout());

        this.elements.tabs?.addEventListener('click', (event) => {
            const tab = event.target.closest('.admin-tab');
            if (!tab) return;
            this.switchTab(tab.dataset.tab);
        });

        this.elements.filters?.addEventListener('click', (event) => {
            const filterBtn = event.target.closest('.filter-btn');
            if (!filterBtn || filterBtn.classList.contains('active')) return;
            this.elements.filters.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            filterBtn.classList.add('active');
            this.state.filter = filterBtn.dataset.filter;
            this.renderTable();
        });

        this.elements.refreshBtn?.addEventListener('click', () => this.fetchRequests());

        document.querySelectorAll('[data-admin-close]').forEach(btn => {
            btn.addEventListener('click', () => this.hideProofModal());
        });

        this.elements.proofModal?.addEventListener('click', (event) => {
            if (event.target === this.elements.proofModal) {
                this.hideProofModal();
            }
        });

        this.elements.quickActions?.addEventListener('click', (event) => {
            const actionBtn = event.target.closest('[data-action]');
            if (!actionBtn) return;
            this.handleQuickAction(actionBtn.dataset.action);
        });

        this.elements.openCommandPalette?.addEventListener('click', () => this.openCommandPalette());
        this.elements.closeCommandPalette?.addEventListener('click', () => this.closeCommandPalette());
        this.elements.commandPalette?.addEventListener('click', (event) => {
            if (event.target === this.elements.commandPalette) {
                this.closeCommandPalette();
            }
        });
        this.elements.commandSearch?.addEventListener('input', () => this.filterCommands());
        this.elements.commandSearch?.addEventListener('keydown', (event) => this.navigateCommands(event));

        window.addEventListener('keydown', (event) => this.handleKeyShortcuts(event));
    }

    async ensureAdminAuth() {
        if (this.adminAuth && this.adminAuth.isAuthenticated()) {
            return;
        }

        // Wait for admin auth to initialize
        await new Promise((resolve) => {
            const interval = setInterval(() => {
                if (window.adminAuth && window.adminAuth.isAuthenticated()) {
                    clearInterval(interval);
                    this.adminAuth = window.adminAuth;
                    resolve();
                }
            }, 200);

            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(interval);
                resolve();
            }, 5000);
        });
    }

    updateConnectionStatus(isOnline = true) {
        if (!this.elements.connectionStatus) return;
        this.elements.connectionStatus.textContent = isOnline ? 'Connected to API' : 'API unavailable';
        this.elements.connectionStatus.classList.toggle('is-online', isOnline);
    }

    async checkAccess() {
        const user = this.adminAuth?.getUser();

        if (user && this.isAuthorized(user)) {
            this.isAuthorizedSession = true;
            this.showContent(user);
            await this.fetchRequests();
            return;
        }

        this.isAuthorizedSession = false;
        if (this.elements.connectionStatus) {
            this.elements.connectionStatus.textContent = 'Authorization required';
            this.elements.connectionStatus.classList.remove('is-online');
        }
        this.showGuard('Access denied', 'This page is restricted to approved RSC administrators. Please sign in with a verified staff account.');
    }

    isAuthorized(user) {
        if (!user) return false;

        const allowedEmails = ADMIN_CONFIG.allowedEmails.map(email => email.toLowerCase());
        if (allowedEmails.length && allowedEmails.includes((user.email || '').toLowerCase())) {
            return true;
        }

        const roles = new Set();
        if (Array.isArray(user.roles)) roles.add(...user.roles);
        if (Array.isArray(user.permissions)) roles.add(...user.permissions);
        if (Array.isArray(user?.app_metadata?.roles)) roles.add(...user.app_metadata.roles);
        if (user.role) roles.add(user.role);
        if (user.isAdmin || user.is_admin) return true;

        return roles.has('admin') || roles.has('staff') || roles.has('rsc_admin');
    }

    requireAuthorization() {
        if (this.isAuthorizedSession) {
            return true;
        }

        const user = this.adminAuth?.getUser();
        if (user && this.isAuthorized(user)) {
            this.isAuthorizedSession = true;
            return true;
        }

        if (!this.guardToastShown) {
            this.showToast('Admin authorization required. Please sign in with an approved account.', 'error');
            this.guardToastShown = true;
        }

        this.showGuard('Access denied', 'This page is restricted to approved RSC administrators. Please sign in with a verified staff account.');
        throw new Error('Admin authorization required');
    }

    showGuard(title, message) {
        this.isAuthorizedSession = false;
        this.elements.guard?.classList.remove('hidden');
        this.elements.content?.classList.add('hidden');
        if (title) {
            const heading = this.elements.guard.querySelector('h2');
            const paragraph = this.elements.guard.querySelector('p');
            if (heading) heading.textContent = title;
            if (paragraph) paragraph.textContent = message;
        }
    }

    showContent(user) {
        this.isAuthorizedSession = true;
        this.guardToastShown = false;
        this.elements.guard?.classList.add('hidden');
        this.elements.content?.classList.remove('hidden');
        if (this.elements.userInfo) {
            const displayName = user?.firstName
                ? `${user.firstName} ${user.lastName || ''}`.trim()
                : user?.email || 'Admin User';
            this.elements.userInfo.textContent = displayName;
        }
    }

    openLogin() {
        window.location.href = '../admin-login.html';
    }

    logout() {
        this.isAuthorizedSession = false;
        this.guardToastShown = false;
        if (this.adminAuth) {
            this.adminAuth.logout();
        } else {
            // Fallback
            localStorage.removeItem('rsc_admin_token');
            localStorage.removeItem('rsc_admin_user');
            window.location.href = '../admin-login.html';
        }
    }

    async fetchRequests() {
        try {
            this.requireAuthorization();
        } catch (error) {
            return;
        }

        try {
            if (!this.adminAuth) {
                throw new Error('Admin authentication not available.');
            }

            this.setTableLoading(true);
            const response = await this.adminAuth.makeAuthenticatedRequest('/api/graphql', {
                method: 'POST',
                body: JSON.stringify({
                    query: `
                        query FollowBonusQueue($page: Int, $pageSize: Int) {
                            followBonusQueue(page: $page, pageSize: $pageSize) {
                                requests {
                                    id
                                    userId
                                    fullName
                                    contactEmail
                                    xHandle
                                    telegramUsername
                                    walletAddress
                                    status
                                    attachments
                                    amount
                                    reviewedBy
                                    reviewedAt
                                    reviewNotes
                                    createdAt
                                    user {
                                        id
                                        email
                                        username
                                        balance
                                    }
                                }
                                pagination {
                                    page
                                    pageSize
                                    total
                                    totalPages
                                }
                            }
                        }
                    `,
                    variables: { page: 1, pageSize: 50 }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API error: ${errorText}`);
            }

            const result = await response.json();
            if (result.errors) {
                throw new Error(`GraphQL error: ${result.errors[0].message}`);
            }

            this.state.requests = result.data.followBonusQueue.requests || [];
            this.computeSummary();
            this.renderSummary();
            this.renderMetrics();
            this.renderLiveFeed();
            this.renderTable();
            this.updateConnectionStatus(true);
            this.setTableLoading(false);
            this.showToast('Requests updated successfully.', 'success');
        } catch (error) {
            console.error('Error fetching follow bonus requests:', error);
            this.setTableLoading(false);
            this.showToast('Could not load follow bonus requests. Check console for details.', 'error');
            this.updateConnectionStatus(false);
        }
    }

    computeSummary() {
        const summary = { pending: 0, approved: 0, rejected: 0, total: 0 };
        let totalAttachments = 0;
        let mostRecent = null;

        this.state.requests.forEach((request) => {
            const status = (request.status || 'pending').toLowerCase();
            if (status === 'approved') summary.approved += 1;
            else if (status === 'rejected') summary.rejected += 1;
            else summary.pending += 1;

            totalAttachments += Array.isArray(request.attachments) ? request.attachments.length : 0;

            if (request.created_at) {
                const createdAt = new Date(request.created_at);
                if (!mostRecent || createdAt > mostRecent) {
                    mostRecent = createdAt;
                }
            }
        });
        summary.total = this.state.requests.length;
        this.state.summary = summary;

        const total = summary.total || 0;
        this.state.metrics = {
            approvalRate: total ? Math.round((summary.approved / total) * 100) : 0,
            rejectionRate: total ? Math.round((summary.rejected / total) * 100) : 0,
            averageProofs: total ? (totalAttachments / total).toFixed(1) : '0.0',
            lastSubmission: mostRecent
        };
    }

    renderSummary() {
        Object.entries(this.state.summary).forEach(([key, value]) => {
            const target = document.querySelector(`[data-summary="${key}"]`);
            if (target) target.textContent = value;
        });

        const total = this.state.summary.total || 0;
        ['pending', 'approved', 'rejected'].forEach((key) => {
            const bar = document.querySelector(`[data-progress="${key}"] .summary-progress__bar`);
            if (bar) {
                const width = total ? Math.min(100, (this.state.summary[key] / total) * 100) : 0;
                bar.style.width = `${width}%`;
            }
        });
        const totalBar = document.querySelector('[data-progress="total"] .summary-progress__bar');
        if (totalBar) {
            totalBar.style.width = '100%';
        }

        let dominantKey = 'pending';
        let dominantValue = this.state.summary[dominantKey];
        ['approved', 'rejected'].forEach((key) => {
            if (this.state.summary[key] > dominantValue) {
                dominantKey = key;
                dominantValue = this.state.summary[key];
            }
        });

        document.querySelectorAll('[data-summary-card]').forEach((card) => {
            card.classList.toggle('summary-card--active', card.dataset.summaryCard === dominantKey);
        });
    }

    renderMetrics() {
        const metrics = this.state.metrics;
        const approval = document.querySelector('[data-metric="approvalRate"]');
        if (approval) approval.textContent = `${metrics.approvalRate}%`;

        const rejection = document.querySelector('[data-metric="rejectionRate"]');
        if (rejection) rejection.textContent = `${metrics.rejectionRate}%`;

        const averageProofs = document.querySelector('[data-metric="averageProofs"]');
        if (averageProofs) averageProofs.textContent = metrics.averageProofs;

        const lastSubmission = document.querySelector('[data-metric="lastSubmission"]');
        if (lastSubmission) {
            if (metrics.lastSubmission) {
                lastSubmission.textContent = `${metrics.lastSubmission.toLocaleDateString()} ${metrics.lastSubmission.toLocaleTimeString()}`;
            } else {
                lastSubmission.textContent = '—';
            }
        }
    }

    renderLiveFeed() {
        if (!this.elements.liveFeedTimeline) return;
        const events = this.state.requests.slice(0, 8);
        if (!events.length) {
            this.elements.liveFeedTimeline.innerHTML = '<li class="timeline-empty">No activity recorded yet.</li>';
            return;
        }

        const timeline = events.map((request) => {
            const status = (request.status || 'pending').toLowerCase();
            const tag = `<span class="timeline-tag">${status}</span>`;
            const createdAt = request.created_at ? new Date(request.created_at) : null;
            const relative = createdAt ? this.formatRelativeTime(createdAt) : 'Unknown time';
            const proofLabel = Array.isArray(request.attachments) ? `${request.attachments.length} proof${request.attachments.length === 1 ? '' : 's'}` : 'No proof';

            return `
                <li>
                    ${tag}
                    <div>${request.full_name || 'Anonymous user'} &mdash; ${request.x_handle || '@unknown'}</div>
                    <div class="muted">${proofLabel} · ${request.wallet_address || 'no wallet'}</div>
                    <span class="timeline-meta">${relative}</span>
                </li>
            `;
        }).join('');

        this.elements.liveFeedTimeline.innerHTML = timeline;
    }

    renderTable() {
        if (!this.elements.tableBody) return;

        const rows = this.getFilteredRequests();
        if (!rows.length) {
            this.elements.tableBody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="7">No requests found for the selected filter.</td>
                </tr>
            `;
            return;
        }

        const rowHTML = rows.map(request => this.renderRow(request)).join('');
        this.elements.tableBody.innerHTML = rowHTML;

        this.elements.tableBody.querySelectorAll('[data-proof]').forEach(btn => {
            btn.addEventListener('click', () => this.showProofModal(btn.dataset.proofId));
        });

        this.elements.tableBody.querySelectorAll('[data-approve]').forEach(btn => {
            btn.addEventListener('click', () => this.handleApprove(btn.dataset.approve));
        });

        this.elements.tableBody.querySelectorAll('[data-reject]').forEach(btn => {
            btn.addEventListener('click', () => this.handleReject(btn.dataset.reject));
        });
    }

    getFilteredRequests() {
        if (this.state.filter === 'all') {
            return this.state.requests;
        }
        return this.state.requests.filter(request => (request.status || 'pending').toLowerCase() === this.state.filter);
    }

    renderRow(request) {
        const createdAt = new Date(request.created_at || Date.now());
        const status = (request.status || 'pending').toLowerCase();
        const hasAttachments = Array.isArray(request.attachments) && request.attachments.length > 0;

        return `
            <tr data-request-id="${request.id}">
                <td>
                    <strong>${createdAt.toLocaleDateString()}</strong>
                    <span class="muted">${createdAt.toLocaleTimeString()}</span>
                </td>
                <td>
                    <div>${request.full_name || 'Unknown'}</div>
                    <span class="muted">${request.contact_email || '—'}</span>
                </td>
                <td>
                    <div>${request.x_handle || '—'}</div>
                    <span class="muted">${request.telegram_username || '—'}</span>
                </td>
                <td>
                    <code>${request.wallet_address || '—'}</code>
                </td>
                <td>
                    ${hasAttachments ? `<button class="action-btn view" data-proof data-proof-id="${request.id}"><i class="fas fa-images"></i><span>View (${request.attachments.length})</span></button>` : '<span class="muted">No proof</span>'}
                </td>
                <td>
                    <span class="badge badge-${status}">${status}</span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn approve" data-approve="${request.id}" ${status === 'approved' ? 'disabled' : ''}>
                            <i class="fas fa-check"></i>
                            <span>Approve</span>
                        </button>
                        <button class="action-btn reject" data-reject="${request.id}" ${status === 'rejected' ? 'disabled' : ''}>
                            <i class="fas fa-times"></i>
                            <span>Reject</span>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    showProofModal(requestId) {
        const request = this.state.requests.find(item => item.id === requestId);
        if (!request || !Array.isArray(request.attachments)) return;

        this.elements.proofModalBody.innerHTML = '';
        const template = document.getElementById('attachmentTemplate');

        request.attachments.forEach((attachment, index) => {
            const clone = template.content.cloneNode(true);
            const img = clone.querySelector('img');
            const caption = clone.querySelector('figcaption');
            const downloadLink = clone.querySelector('a');
            const mime = attachment.mimeType || 'image/png';
            const name = attachment.filename || `proof-${index + 1}.png`;
            const dataUrl = `data:${mime};base64,${attachment.base64}`;

            img.src = dataUrl;
            caption.textContent = name;
            downloadLink.href = dataUrl;
            downloadLink.download = name;

            this.elements.proofModalBody.appendChild(clone);
        });

        this.elements.proofModal.classList.remove('hidden');
        this.elements.proofModal.setAttribute('aria-hidden', 'false');
    }

    hideProofModal() {
        this.elements.proofModal.classList.add('hidden');
        this.elements.proofModal.setAttribute('aria-hidden', 'true');
    }

    async handleApprove(requestId) {
        try {
            this.requireAuthorization();
        } catch (error) {
            return;
        }

        const request = this.state.requests.find(item => item.id === requestId);
        if (!request) return;

        const note = prompt('Add an approval note (optional):', 'Verified and approved');
        try {
            await this.updateRequestStatus(request, 'approved', note);
            if (request.user_id) {
                await this.createBonusRecord(request.user_id, request.amount || ADMIN_CONFIG.eventReward);
            }
            this.showToast('Request approved and bonus recorded.', 'success');
            await this.fetchRequests();
        } catch (error) {
            console.error('Failed to approve request:', error);
            this.showToast('Could not approve the request. Check console for details.', 'error');
        }
    }

    async handleReject(requestId) {
        try {
            this.requireAuthorization();
        } catch (error) {
            return;
        }

        const request = this.state.requests.find(item => item.id === requestId);
        if (!request) return;

        const note = prompt('Reason for rejection (required):');
        if (!note) {
            this.showToast('Rejection cancelled — reason is required.', 'warning');
            return;
        }

        try {
            await this.updateRequestStatus(request, 'rejected', note);
            this.showToast('Request rejected.', 'success');
            await this.fetchRequests();
        } catch (error) {
            console.error('Failed to reject request:', error);
            this.showToast('Could not reject the request. Check console for details.', 'error');
        }
    }

    async updateRequestStatus(request, status, note) {
        if (!this.adminAuth) {
            throw new Error('Admin authentication not ready.');
        }

        const mutation = status === 'approved'
            ? `
                mutation ApproveFollowBonusRequest($requestId: ID!, $notes: String) {
                    approveFollowBonusRequest(requestId: $requestId, notes: $notes) {
                        id
                        status
                        reviewedAt
                        reviewNotes
                    }
                }
            `
            : `
                mutation RejectFollowBonusRequest($requestId: ID!, $notes: String!) {
                    rejectFollowBonusRequest(requestId: $requestId, notes: $notes) {
                        id
                        status
                        reviewedAt
                        reviewNotes
                    }
                }
            `;

        const response = await this.adminAuth.makeAuthenticatedRequest('/api/graphql', {
            method: 'POST',
            body: JSON.stringify({
                query: mutation,
                variables: { requestId: request.id, notes: note || null }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${errorText}`);
        }

        const result = await response.json();
        if (result.errors) {
            throw new Error(`GraphQL error: ${result.errors[0].message}`);
        }
    }

    async createBonusRecord(userId, amount) {
        // Note: Bonus creation is handled automatically by the GraphQL mutation
        // This function is kept for compatibility but the actual bonus creation
        // happens in the backend when approving requests
        console.log(`Bonus record for user ${userId} will be created automatically by the backend`);
    }

    setTableLoading(isLoading) {
        if (!this.elements.tableBody) return;
        if (isLoading) {
            this.elements.tableBody.innerHTML = `
                <tr class="empty-row"><td colspan="7">Loading requests…</td></tr>
            `;
        }
    }

    switchTab(tab) {
        document.querySelectorAll('.admin-tab').forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tab);
        });
        document.querySelectorAll('.admin-panel').forEach(panel => {
            panel.classList.toggle('hidden', panel.dataset.panel !== tab);
        });
    }

    showToast(message, type = 'info') {
        const containerId = 'adminToastContainer';
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.className = 'admin-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `admin-toast ${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button aria-label="Dismiss">✕</button>
        `;

        toast.querySelector('button').addEventListener('click', () => {
            container.removeChild(toast);
        });

        container.appendChild(toast);
        setTimeout(() => {
            if (toast.parentElement === container) {
                container.removeChild(toast);
            }
        }, 6000);
    }

    handleQuickAction(action) {
        try {
            this.requireAuthorization();
        } catch (error) {
            return;
        }

        switch (action) {
            case 'approveNext':
                this.approveNextPending();
                break;
            case 'rejectNext':
                this.rejectNextPending('Auto rejection (duplicate entry)');
                break;
            case 'openProof':
                if (!this.openLatestProof()) {
                    this.showToast('No submissions with proof available.', 'warning');
                }
                break;
            case 'refresh':
                this.fetchRequests();
                break;
            case 'exportCsv':
                this.exportCsv();
                break;
            case 'copySummary':
                this.copySummaryToClipboard();
                break;
            default:
                break;
        }
    }

    approveNextPending() {
        try {
            this.requireAuthorization();
        } catch (error) {
            return;
        }

        const pending = this.state.requests.find((request) => (request.status || 'pending').toLowerCase() === 'pending');
        if (!pending) {
            this.showToast('No pending requests to approve.', 'warning');
            return;
        }
        this.handleApprove(pending.id);
    }

    rejectNextPending(reason = 'Rejected via quick action') {
        try {
            this.requireAuthorization();
        } catch (error) {
            return;
        }

        const pending = this.state.requests.find((request) => (request.status || 'pending').toLowerCase() === 'pending');
        if (!pending) {
            this.showToast('No pending requests to reject.', 'warning');
            return;
        }
        this.handleRejectQuick(pending.id, reason);
    }

    handleRejectQuick(requestId, reason) {
        try {
            this.requireAuthorization();
        } catch (error) {
            return;
        }

        const request = this.state.requests.find(item => item.id === requestId);
        if (!request) return;
        this.updateRequestStatus(request, 'rejected', reason)
            .then(() => {
                this.showToast('Request rejected.', 'success');
                this.fetchRequests();
            })
            .catch((error) => {
                console.error('Failed to reject request via quick action:', error);
                this.showToast('Could not reject the request. Check console for details.', 'error');
            });
    }

    openLatestProof() {
        try {
            this.requireAuthorization();
        } catch (error) {
            return false;
        }

        const withProof = this.state.requests.find((request) => Array.isArray(request.attachments) && request.attachments.length > 0);
        if (!withProof) {
            return false;
        }
        this.showProofModal(withProof.id);
        return true;
    }

    exportCsv() {
        try {
            this.requireAuthorization();
        } catch (error) {
            return;
        }

        if (!this.state.requests.length) {
            this.showToast('No data to export.', 'warning');
            return;
        }
        const header = ['id', 'created_at', 'full_name', 'contact_email', 'x_handle', 'telegram_username', 'wallet_address', 'status', 'attachments'];
        const rows = this.state.requests.map((request) => header.map((key) => {
            if (key === 'attachments') {
                return Array.isArray(request.attachments) ? request.attachments.length : 0;
            }
            return request[key] ?? '';
        }));
        const csvContent = [header.join(','), ...rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `follow-bonus-${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        this.showToast('CSV exported successfully.', 'success');
    }

    async copySummaryToClipboard() {
        try {
            this.requireAuthorization();
        } catch (error) {
            return;
        }

        const { pending, approved, rejected, total } = this.state.summary;
        const message = `Follow Bonus Summary\nPending: ${pending}\nApproved: ${approved}\nRejected: ${rejected}\nTotal: ${total}\nApproval rate: ${this.state.metrics.approvalRate}%\nRejection rate: ${this.state.metrics.rejectionRate}%`;
        try {
            await navigator.clipboard.writeText(message);
            this.showToast('Summary copied to clipboard.', 'success');
        } catch (error) {
            console.error('Clipboard error:', error);
            this.showToast('Clipboard unavailable in this browser.', 'error');
        }
    }

    openCommandPalette() {
        if (this.commandPalette.isOpen) return;
        this.commandPalette.isOpen = true;
        this.elements.commandPalette?.classList.remove('hidden');
        this.elements.commandPalette?.setAttribute('aria-hidden', 'false');
        this.filterCommands('');
        this.commandPalette.activeIndex = 0;
        if (this.elements.commandSearch) {
            this.elements.commandSearch.value = '';
            setTimeout(() => this.elements.commandSearch.focus(), 50);
        }
    }

    closeCommandPalette() {
        this.commandPalette.isOpen = false;
        this.elements.commandPalette?.classList.add('hidden');
        this.elements.commandPalette?.setAttribute('aria-hidden', 'true');
    }

    filterCommands(query = this.elements.commandSearch?.value || '') {
        const normalized = query.toLowerCase();
        this.commandPalette.filtered = this.commandPalette.commands.filter((command) =>
            command.label.toLowerCase().includes(normalized)
        );
        this.renderCommandList();
    }

    renderCommandList() {
        if (!this.elements.commandList) return;
        if (!this.commandPalette.filtered.length) {
            this.elements.commandList.innerHTML = '<li class="timeline-empty">No commands found</li>';
            return;
        }
        this.elements.commandList.innerHTML = this.commandPalette.filtered.map((command, index) => `
            <li data-command="${command.id}" class="${index === this.commandPalette.activeIndex ? 'active' : ''}">
                <i class="fas fa-chevron-right"></i>
                <span>${command.label}</span>
                ${command.hint ? `<kbd>${command.hint}</kbd>` : ''}
            </li>
        `).join('');

        this.elements.commandList.querySelectorAll('li[data-command]').forEach((item, index) => {
            item.addEventListener('mouseenter', () => this.setActiveCommand(index));
            item.addEventListener('click', () => this.runCommand(index));
        });
    }

    setActiveCommand(index) {
        this.commandPalette.activeIndex = index;
        this.elements.commandList?.querySelectorAll('li[data-command]').forEach((item, idx) => {
            item.classList.toggle('active', idx === index);
        });
    }

    runCommand(index = this.commandPalette.activeIndex) {
        const command = this.commandPalette.filtered[index];
        if (!command) return;
        this.closeCommandPalette();
        command.handler();
    }

    navigateCommands(event) {
        if (!this.commandPalette.isOpen) return;
        const { key } = event;
        if (key === 'ArrowDown') {
            event.preventDefault();
            this.commandPalette.activeIndex = (this.commandPalette.activeIndex + 1) % this.commandPalette.filtered.length;
            this.setActiveCommand(this.commandPalette.activeIndex);
        }
        if (key === 'ArrowUp') {
            event.preventDefault();
            this.commandPalette.activeIndex = (this.commandPalette.activeIndex - 1 + this.commandPalette.filtered.length) % this.commandPalette.filtered.length;
            this.setActiveCommand(this.commandPalette.activeIndex);
        }
        if (key === 'Enter') {
            event.preventDefault();
            this.runCommand();
        }
        if (key === 'Escape') {
            event.preventDefault();
            this.closeCommandPalette();
        }
    }

    handleKeyShortcuts(event) {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const metaKey = isMac ? event.metaKey : event.ctrlKey;
        if (metaKey && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            if (this.commandPalette.isOpen) {
                this.closeCommandPalette();
            } else {
                this.openCommandPalette();
            }
            return;
        }

        if (event.shiftKey) {
            switch (event.key.toLowerCase()) {
                case 'a':
                    event.preventDefault();
                    this.approveNextPending();
                    break;
                case 'r':
                    event.preventDefault();
                    this.rejectNextPending('Auto rejection (duplicate entry)');
                    break;
                case 'f':
                    event.preventDefault();
                    this.fetchRequests();
                    break;
                case 'e':
                    event.preventDefault();
                    this.exportCsv();
                    break;
                case 'c':
                    event.preventDefault();
                    this.copySummaryToClipboard();
                    break;
                case 'o':
                    event.preventDefault();
                    this.openLatestProof();
                    break;
                default:
                    break;
            }
        }

        if (event.key === 'Escape' && this.commandPalette.isOpen) {
            this.closeCommandPalette();
        }
    }

    formatRelativeTime(date) {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
        if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
        if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
        return 'moments ago';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.followBonusAdmin = new AdminDashboard();
});
