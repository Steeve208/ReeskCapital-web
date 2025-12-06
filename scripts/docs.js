// ===== DOCS NAVIGATION JAVASCRIPT =====

class DocsManager {
    constructor() {
        this.currentPage = 'whitepaper';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupSearch();
        this.setupSmoothScroll();
    }

    setupNavigation() {
        // Navigation links
        const navLinks = document.querySelectorAll('.neurosearch-docs-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                if (section) {
                    this.navigateToSection(section);
                }
            });
        });

        // Handle hash navigation
        if (window.location.hash) {
            const hash = window.location.hash.substring(1);
            this.navigateToSection(hash);
        }
    }

    navigateToSection(section) {
        // Map section names to page IDs
        const sectionMap = {
            'whitepaper': 'whitepaper-page',
            'api': 'api-page',
            'sdk': 'sdk-page',
            'quickstart': 'quickstart-page',
            'tutorials': 'tutorials-page',
            'examples': 'examples-page',
            'integration': 'integration-page',
            'smart-contracts': 'smart-contracts-page',
            'dapps': 'dapps-page',
            'mining': 'mining-page',
            'staking': 'staking-page'
        };

        const pageId = sectionMap[section] || 'whitepaper-page';

        // Hide all pages
        document.querySelectorAll('.neurosearch-docs-page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update active nav link
        document.querySelectorAll('.neurosearch-docs-nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[data-section="${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Update current page
        this.currentPage = section;

        // Update URL without reload
        window.history.pushState({}, '', `#${section}`);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setupSearch() {
        const searchInput = document.getElementById('docsSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                if (query.length > 2) {
                    this.performSearch(query);
                }
            });
        }
    }

    performSearch(query) {
        // Simple search implementation
        const sections = document.querySelectorAll('.neurosearch-docs-section');
        sections.forEach(section => {
            const text = section.textContent.toLowerCase();
            if (text.includes(query)) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    }

    setupSmoothScroll() {
        // Smooth scroll for TOC links
        document.querySelectorAll('.neurosearch-docs-toc a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DocsManager();
});
