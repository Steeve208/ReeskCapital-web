/* ===== WHITEPAPER DOWNLOAD SYSTEM ===== */

class WhitepaperDownloadManager {
    constructor() {
        this.whitepaperUrl = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkWhitepaperAvailability();
    }
    
    setupEventListeners() {
        // Use event delegation for better performance
        document.addEventListener('click', (e) => {
            // Whitepaper download button
            if (e.target.matches('#downloadWhitepaper') || e.target.closest('#downloadWhitepaper')) {
                e.preventDefault();
                this.handleDownload();
            }
            
            // Copy button functionality
            if (e.target.matches('.copy-btn')) {
                this.copyToClipboard(e.target.dataset.text);
            }
        });
    }
    
    async checkWhitepaperAvailability() {
        try {
            // Check if whitepaper is available on server
            // This would typically check against your backend API
            const response = await this.checkServerAvailability();
            
            if (response.available) {
                this.whitepaperUrl = response.url;
                this.updateDownloadButton(true);
            } else {
                this.updateDownloadButton(false, response.message);
            }
        } catch (error) {
            console.error('Failed to check whitepaper availability:', error);
            this.updateDownloadButton(false, 'Service temporarily unavailable');
        }
    }
    
    async checkServerAvailability() {
        // Simulate API call - replace with actual backend endpoint
        // const response = await fetch('/api/whitepaper/status');
        // return response.json();
        
        // Mock response for now
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate server check
                const isAvailable = Math.random() > 0.3; // 70% chance of being available
                
                if (isAvailable) {
                    resolve({
                        available: true,
                        url: '/assets/docs/rsc-chain-whitepaper-v1.0.pdf',
                        filename: 'rsc-chain-whitepaper-v1.0.pdf',
                        size: '2.4 MB',
                        lastUpdated: '2025-01-15'
                    });
                } else {
                    resolve({
                        available: false,
                        message: 'Whitepaper is being updated. Please check back later.'
                    });
                }
            }, 300); // Reduced from 500ms for better UX
        });
    }
    
    updateDownloadButton(available, message = '') {
        const downloadBtn = document.getElementById('downloadWhitepaper');
        if (!downloadBtn) return;
        
        if (available) {
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = `
                <span class="download-icon">⬇️</span>
                <span>Download PDF</span>
            `;
            downloadBtn.classList.remove('disabled');
            downloadBtn.title = 'Click to download whitepaper';
        } else {
            downloadBtn.disabled = true;
            downloadBtn.innerHTML = `
                <span class="download-icon">⏳</span>
                <span>Unavailable</span>
            `;
            downloadBtn.classList.add('disabled');
            downloadBtn.title = message;
        }
        
        // Update info if available
        if (available) {
            this.updateWhitepaperInfo();
        }
    }
    
    async handleDownload() {
        if (!this.whitepaperUrl) {
            this.showNotification('error', 'Whitepaper not available for download');
            return;
        }
        
        try {
            // Show download progress
            this.showDownloadProgress();
            
            // Simulate download process
            await this.downloadWhitepaper();
            
            this.showNotification('success', 'Whitepaper downloaded successfully!');
        } catch (error) {
            console.error('Download failed:', error);
            this.showNotification('error', 'Download failed. Please try again.');
        }
    }
    
    async downloadWhitepaper() {
        // Simulate download process - replace with actual download logic
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate download success/failure
                const success = Math.random() > 0.1; // 90% success rate
                
                if (success) {
                    // Create a mock download link
                    this.createDownloadLink();
                    resolve();
                } else {
                    reject(new Error('Download failed'));
                }
            }, 1500); // Reduced from 2000ms for better UX
        });
    }
    
    createDownloadLink() {
        // Create a temporary download link
        const link = document.createElement('a');
        link.href = this.whitepaperUrl;
        link.download = 'rsc-chain-whitepaper-v1.0.pdf';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    showDownloadProgress() {
        const downloadBtn = document.getElementById('downloadWhitepaper');
        if (!downloadBtn) return;
        
        const originalContent = downloadBtn.innerHTML;
        
        downloadBtn.innerHTML = `
            <span class="download-icon">⏳</span>
            <span>Downloading...</span>
        `;
        downloadBtn.disabled = true;
        
        // Reset button after download completes
        setTimeout(() => {
            downloadBtn.innerHTML = originalContent;
            downloadBtn.disabled = false;
        }, 2000); // Reduced from 3000ms for better UX
    }
    
    updateWhitepaperInfo() {
        // Update version and last updated info
        const versionElement = document.querySelector('.version');
        const lastUpdatedElement = document.querySelector('.last-updated');
        
        if (versionElement) {
            versionElement.textContent = 'Version 1.0';
        }
        
        if (lastUpdatedElement) {
            lastUpdatedElement.textContent = 'Last updated: Q1 2025';
        }
    }
    
    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('success', 'Copied to clipboard!');
            }).catch(() => {
                this.fallbackCopyToClipboard(text);
            });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    }
    
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('success', 'Copied to clipboard!');
        } catch (err) {
            this.showNotification('error', 'Failed to copy to clipboard');
        }
        
        document.body.removeChild(textArea);
    }
    
    showNotification(type, message) {
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(type, 'Whitepaper', message);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize whitepaper download when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.whitepaperDownloadManager = new WhitepaperDownloadManager();
});

// Export for use in other modules
window.WhitepaperDownloadManager = WhitepaperDownloadManager;
