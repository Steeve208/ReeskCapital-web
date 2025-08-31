// RSC Chain GitBook Custom JavaScript

(function() {
    'use strict';

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeRSCChain();
    });

    function initializeRSCChain() {
        // Add smooth scrolling
        addSmoothScrolling();
        
        // Add copy code functionality
        addCopyCodeButtons();
        
        // Add search functionality
        addSearchEnhancement();
        
        // Add table of contents
        addTableOfContents();
        
        // Add syntax highlighting
        addSyntaxHighlighting();
        
        // Add interactive elements
        addInteractiveElements();
        
        // Add progress indicator
        addProgressIndicator();
        
        // Add theme switcher
        addThemeSwitcher();
    }

    // Smooth scrolling for anchor links
    function addSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Add copy button to code blocks
    function addCopyCodeButtons() {
        const codeBlocks = document.querySelectorAll('pre code');
        
        codeBlocks.forEach((codeBlock, index) => {
            const pre = codeBlock.parentElement;
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-code-btn';
            copyButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
            copyButton.title = 'Copy code';
            
            copyButton.addEventListener('click', function() {
                const text = codeBlock.textContent;
                navigator.clipboard.writeText(text).then(() => {
                    this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"></polyline></svg>';
                    this.title = 'Copied!';
                    
                    setTimeout(() => {
                        this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                        this.title = 'Copy code';
                    }, 2000);
                });
            });
            
            pre.style.position = 'relative';
            pre.appendChild(copyButton);
        });
    }

    // Enhanced search functionality
    function addSearchEnhancement() {
        const searchInput = document.querySelector('.book-search input');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const query = this.value.toLowerCase();
                const searchResults = document.querySelectorAll('.book-search-results li');
                
                searchResults.forEach(result => {
                    const text = result.textContent.toLowerCase();
                    if (text.includes(query)) {
                        result.style.display = 'block';
                        // Highlight matching text
                        const title = result.querySelector('a');
                        if (title) {
                            title.innerHTML = title.textContent.replace(
                                new RegExp(query, 'gi'),
                                match => `<mark>${match}</mark>`
                            );
                        }
                    } else {
                        result.style.display = 'none';
                    }
                });
            });
        }
    }

    // Add table of contents
    function addTableOfContents() {
        const content = document.querySelector('.book-body');
        if (!content) return;
        
        const headings = content.querySelectorAll('h1, h2, h3');
        if (headings.length < 3) return;
        
        const toc = document.createElement('div');
        toc.className = 'table-of-contents';
        toc.innerHTML = '<h4>Table of Contents</h4><ul></ul>';
        
        const tocList = toc.querySelector('ul');
        
        headings.forEach((heading, index) => {
            if (!heading.id) {
                heading.id = `heading-${index}`;
            }
            
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${heading.id}`;
            a.textContent = heading.textContent;
            a.className = `toc-${heading.tagName.toLowerCase()}`;
            
            li.appendChild(a);
            tocList.appendChild(li);
        });
        
        content.insertBefore(toc, content.firstChild);
    }

    // Syntax highlighting enhancement
    function addSyntaxHighlighting() {
        // Add language detection for code blocks
        const codeBlocks = document.querySelectorAll('pre code');
        
        codeBlocks.forEach(codeBlock => {
            const pre = codeBlock.parentElement;
            const text = codeBlock.textContent;
            
            // Detect language based on content
            let language = 'text';
            if (text.includes('fn ') || text.includes('pub ') || text.includes('use ')) {
                language = 'rust';
            } else if (text.includes('function') || text.includes('const ') || text.includes('let ')) {
                language = 'javascript';
            } else if (text.includes('def ') || text.includes('import ') || text.includes('print(')) {
                language = 'python';
            } else if (text.includes('package ') || text.includes('public class') || text.includes('System.out')) {
                language = 'java';
            } else if (text.includes('GET ') || text.includes('POST ') || text.includes('HTTP/')) {
                language = 'http';
            }
            
            pre.className = `language-${language}`;
            codeBlock.className = `language-${language}`;
        });
    }

    // Add interactive elements
    function addInteractiveElements() {
        // Add collapsible sections
        const collapsibleSections = document.querySelectorAll('h2, h3');
        collapsibleSections.forEach(heading => {
            const nextElement = heading.nextElementSibling;
            if (nextElement && (nextElement.tagName === 'P' || nextElement.tagName === 'DIV')) {
                const toggleButton = document.createElement('button');
                toggleButton.className = 'collapse-toggle';
                toggleButton.innerHTML = '▼';
                toggleButton.title = 'Toggle section';
                
                toggleButton.addEventListener('click', function() {
                    const content = this.parentElement.nextElementSibling;
                    if (content.style.display === 'none') {
                        content.style.display = 'block';
                        this.innerHTML = '▼';
                    } else {
                        content.style.display = 'none';
                        this.innerHTML = '▶';
                    }
                });
                
                heading.appendChild(toggleButton);
            }
        });

        // Add tooltips
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', function() {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = this.getAttribute('data-tooltip');
                document.body.appendChild(tooltip);
                
                const rect = this.getBoundingClientRect();
                tooltip.style.left = rect.left + 'px';
                tooltip.style.top = (rect.bottom + 5) + 'px';
            });
            
            element.addEventListener('mouseleave', function() {
                const tooltip = document.querySelector('.tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            });
        });
    }

    // Add reading progress indicator
    function addProgressIndicator() {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.innerHTML = '<div class="progress-fill"></div>';
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            const progressFill = progressBar.querySelector('.progress-fill');
            progressFill.style.width = scrollPercent + '%';
        });
    }

    // Add theme switcher
    function addThemeSwitcher() {
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = '🌙';
        themeToggle.title = 'Toggle dark mode';
        
        themeToggle.addEventListener('click', function() {
            const body = document.body;
            if (body.classList.contains('dark-theme')) {
                body.classList.remove('dark-theme');
                this.innerHTML = '🌙';
                localStorage.setItem('rsc-theme', 'light');
            } else {
                body.classList.add('dark-theme');
                this.innerHTML = '☀️';
                localStorage.setItem('rsc-theme', 'dark');
            }
        });
        
        // Add to header
        const header = document.querySelector('.book-header');
        if (header) {
            header.appendChild(themeToggle);
        }
        
        // Load saved theme
        const savedTheme = localStorage.getItem('rsc-theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = '☀️';
        }
    }

    // Add CSS for new elements
    const style = document.createElement('style');
    style.textContent = `
        .copy-code-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 5px;
            border-radius: 4px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s;
        }
        
        pre:hover .copy-code-btn {
            opacity: 1;
        }
        
        .table-of-contents {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 2rem;
        }
        
        .table-of-contents h4 {
            margin-top: 0;
            color: #2563eb;
        }
        
        .table-of-contents ul {
            list-style: none;
            padding: 0;
        }
        
        .table-of-contents li {
            margin: 0.5rem 0;
        }
        
        .table-of-contents a {
            text-decoration: none;
            color: #374151;
            padding: 0.25rem 0;
            display: block;
        }
        
        .table-of-contents a:hover {
            color: #2563eb;
        }
        
        .toc-h1 { padding-left: 0; font-weight: 600; }
        .toc-h2 { padding-left: 1rem; }
        .toc-h3 { padding-left: 2rem; }
        
        .collapse-toggle {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 0.8em;
            margin-left: 0.5rem;
            color: #6b7280;
        }
        
        .reading-progress {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: rgba(0, 0, 0, 0.1);
            z-index: 1000;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #2563eb, #7c3aed);
            width: 0%;
            transition: width 0.1s;
        }
        
        .theme-toggle {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 4px;
            color: white;
        }
        
        .theme-toggle:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .tooltip {
            position: absolute;
            background: #1f2937;
            color: white;
            padding: 0.5rem;
            border-radius: 4px;
            font-size: 0.875rem;
            z-index: 1000;
            pointer-events: none;
        }
        
        .dark-theme {
            --rsc-light: #1f2937;
            --rsc-dark: #f8fafc;
            --rsc-text: #e5e7eb;
            --rsc-text-light: #9ca3af;
            --rsc-border: #374151;
        }
        
        .dark-theme body {
            background: #111827;
            color: var(--rsc-text);
        }
        
        .dark-theme .book-body {
            background: #1f2937;
        }
        
        .dark-theme .card {
            background: #374151;
            border-color: var(--rsc-border);
        }
        
        .dark-theme code {
            background: #374151;
            color: #fbbf24;
        }
        
        .dark-theme tr:hover {
            background: #374151;
        }
        
        mark {
            background: #fbbf24;
            color: #1f2937;
            padding: 0.1rem 0.2rem;
            border-radius: 2px;
        }
    `;
    document.head.appendChild(style);

})();
