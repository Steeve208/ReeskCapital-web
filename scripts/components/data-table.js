// ===== DATA TABLE COMPONENT - REUTILIZABLE =====

(function() {
    'use strict';
    
    class DataTable {
        constructor(tableId, options = {}) {
            this.table = document.getElementById(tableId);
            this.options = {
                pageSize: options.pageSize || 25,
                sortable: options.sortable !== false,
                searchable: options.searchable !== false,
                ...options
            };
            
            this.data = [];
            this.filteredData = [];
            this.currentPage = 1;
            this.sortColumn = null;
            this.sortDirection = 'asc';
            this.filters = {};
            
            if (this.table) {
                this.init();
            }
        }
        
        init() {
            this.setupEventListeners();
            this.loadData();
        }
        
        setupEventListeners() {
            // Sort headers
            if (this.options.sortable) {
                const headers = this.table.querySelectorAll('thead th[data-sort]');
                headers.forEach(header => {
                    header.addEventListener('click', () => {
                        const column = header.getAttribute('data-sort');
                        this.sort(column);
                    });
                });
            }
            
            // Search
            const searchInput = document.getElementById('tableSearch');
            if (searchInput && this.options.searchable) {
                searchInput.addEventListener('input', (e) => {
                    this.search(e.target.value);
                });
            }
        }
        
        loadData() {
            // This should be overridden or data should be set via setData()
            if (this.options.data) {
                this.setData(this.options.data);
            }
        }
        
        setData(data) {
            this.data = data;
            this.filteredData = [...data];
            this.currentPage = 1;
            this.render();
        }
        
        sort(column) {
            if (this.sortColumn === column) {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortColumn = column;
                this.sortDirection = 'asc';
            }
            
            this.filteredData.sort((a, b) => {
                let aVal = a[column];
                let bVal = b[column];
                
                // Handle different data types
                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }
                
                if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
            
            this.updateSortHeaders();
            this.render();
        }
        
        updateSortHeaders() {
            const headers = this.table.querySelectorAll('thead th[data-sort]');
            headers.forEach(header => {
                header.classList.remove('sort-asc', 'sort-desc');
                if (header.getAttribute('data-sort') === this.sortColumn) {
                    header.classList.add(`sort-${this.sortDirection}`);
                }
            });
        }
        
        search(query) {
            if (!query.trim()) {
                this.filteredData = [...this.data];
            } else {
                const lowerQuery = query.toLowerCase();
                this.filteredData = this.data.filter(row => {
                    return Object.values(row).some(val => 
                        String(val).toLowerCase().includes(lowerQuery)
                    );
                });
            }
            
            this.currentPage = 1;
            this.render();
        }
        
        applyFilters(filters) {
            this.filters = { ...this.filters, ...filters };
            this.filterData();
        }
        
        filterData() {
            this.filteredData = this.data.filter(row => {
                for (const [key, value] of Object.entries(this.filters)) {
                    if (value && value !== 'all') {
                        if (key === 'dateFrom' || key === 'dateTo') {
                            const rowDate = new Date(row.date);
                            if (key === 'dateFrom' && rowDate < new Date(value)) return false;
                            if (key === 'dateTo' && rowDate > new Date(value)) return false;
                        } else if (row[key] !== value) {
                            return false;
                        }
                    }
                }
                return true;
            });
            
            this.currentPage = 1;
            this.render();
        }
        
        render() {
            const tbody = this.table.querySelector('tbody');
            if (!tbody) return;
            
            const start = (this.currentPage - 1) * this.options.pageSize;
            const end = start + this.options.pageSize;
            const pageData = this.filteredData.slice(start, end);
            
            if (pageData.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="${this.getColumnCount()}" class="empty-state">
                            <i class="fas fa-inbox"></i>
                            <p>No se encontraron resultados</p>
                        </td>
                    </tr>
                `;
            } else {
                tbody.innerHTML = pageData.map(row => this.renderRow(row)).join('');
            }
            
            this.renderPagination();
            this.updateCount();
        }
        
        renderRow(row) {
            // This should be overridden by the specific table implementation
            return '';
        }
        
        getColumnCount() {
            return this.table.querySelectorAll('thead th').length;
        }
        
        renderPagination() {
            const pagination = document.getElementById('tablePagination');
            if (!pagination) return;
            
            const totalPages = Math.ceil(this.filteredData.length / this.options.pageSize);
            
            if (totalPages <= 1) {
                pagination.innerHTML = '';
                return;
            }
            
            let html = `
                <div class="pagination-info">
                    Mostrando ${(this.currentPage - 1) * this.options.pageSize + 1} - 
                    ${Math.min(this.currentPage * this.options.pageSize, this.filteredData.length)} 
                    de ${this.filteredData.length}
                </div>
                <div class="pagination-controls">
            `;
            
            // Previous button
            html += `
                <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="window.dataTableInstance?.goToPage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;
            
            // Page numbers
            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                    html += `
                        <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                            onclick="window.dataTableInstance?.goToPage(${i})">
                            ${i}
                        </button>
                    `;
                } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                    html += `<span class="pagination-ellipsis">...</span>`;
                }
            }
            
            // Next button
            html += `
                <button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="window.dataTableInstance?.goToPage(${this.currentPage + 1})">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
            
            html += '</div>';
            pagination.innerHTML = html;
        }
        
        goToPage(page) {
            const totalPages = Math.ceil(this.filteredData.length / this.options.pageSize);
            if (page >= 1 && page <= totalPages) {
                this.currentPage = page;
                this.render();
            }
        }
        
        updateCount() {
            const countEl = document.getElementById('tableCount');
            if (countEl) {
                countEl.textContent = this.filteredData.length;
            }
        }
        
        export(format = 'csv') {
            if (format === 'csv') {
                this.exportCSV();
            } else if (format === 'json') {
                this.exportJSON();
            }
        }
        
        exportCSV() {
            const headers = Array.from(this.table.querySelectorAll('thead th'))
                .map(th => th.textContent.trim())
                .filter(h => h && !h.includes('Acciones'));
            
            const rows = this.filteredData.map(row => {
                return headers.map(header => {
                    const key = this.getColumnKey(header);
                    return row[key] || '';
                });
            });
            
            const csv = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
        
        exportJSON() {
            const json = JSON.stringify(this.filteredData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transactions_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
        
        getColumnKey(headerText) {
            // Map header text to data keys
            const map = {
                'Fecha': 'date',
                'Tipo': 'type',
                'Monto': 'amount',
                'Estado': 'status',
                'Hash': 'hash',
                'Confirmaciones': 'confirmations'
            };
            return map[headerText] || headerText.toLowerCase();
        }
    }
    
    // Export for use in other scripts
    window.DataTable = DataTable;
    
    console.log('✅ DataTable component loaded');
})();

