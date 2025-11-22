/**
 * Sidebar Navigation Component
 * Automatically generates a sticky sidebar navigation based on page content sections
 * Usage: Include this script and add data-sidebar-nav attribute to your container
 */

class SidebarNav {
    constructor(options = {}) {
        this.options = {
            containerSelector: options.containerSelector || '[data-sidebar-nav]',
            sectionSelector: options.sectionSelector || '.strategic-content-card',
            position: options.position || 'right', // 'left' or 'right'
            offset: options.offset || 100,
            ...options
        };

        this.sections = [];
        this.sidebar = null;
        this.activeSection = null;

        this.init();
    }

    init() {
        const container = document.querySelector(this.options.containerSelector);
        if (!container) {
            console.warn('SidebarNav: Container not found');
            return;
        }

        // Get all sections
        this.sections = this.getSections();
        if (this.sections.length === 0) {
            console.warn('SidebarNav: No sections found');
            return;
        }

        // Create and inject sidebar
        this.createSidebar();
        this.attachEventListeners();
        this.updateActiveSection();
    }

    getSections() {
        const sections = [];
        
        // Try to get sections from tabs
        const tabs = document.querySelectorAll('.strategic-tab');
        const cards = document.querySelectorAll(this.options.sectionSelector);

        if (tabs.length > 0 && cards.length > 0) {
            tabs.forEach((tab, index) => {
                const title = tab.querySelector('.tab-title')?.textContent || `Section ${index + 1}`;
                const number = tab.querySelector('.tab-number')?.textContent || `0${index + 1}`;
                
                sections.push({
                    id: `section-${index}`,
                    title: title,
                    number: number,
                    element: cards[index],
                    tabElement: tab
                });
            });
        } else {
            // Fallback: get from H3 headings
            const headings = document.querySelectorAll('h3');
            headings.forEach((heading, index) => {
                if (heading.textContent.trim()) {
                    sections.push({
                        id: `section-${index}`,
                        title: heading.textContent.trim(),
                        number: `0${index + 1}`,
                        element: heading
                    });
                }
            });
        }

        return sections;
    }

    createSidebar() {
        // Create sidebar container
        this.sidebar = document.createElement('nav');
        this.sidebar.className = `sidebar-nav sidebar-nav-${this.options.position}`;
        this.sidebar.setAttribute('role', 'navigation');
        this.sidebar.setAttribute('aria-label', 'Page sections');

        // Create sidebar header
        const header = document.createElement('div');
        header.className = 'sidebar-nav-header';
        header.textContent = 'Navigation';
        this.sidebar.appendChild(header);

        // Create navigation list
        const navList = document.createElement('ul');
        navList.className = 'sidebar-nav-list';

        this.sections.forEach((section, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'sidebar-nav-item';

            const link = document.createElement('a');
            link.href = `#${section.id}`;
            link.className = 'sidebar-nav-link';
            link.setAttribute('data-section-index', index);
            
            const number = document.createElement('span');
            number.className = 'sidebar-nav-number';
            number.textContent = section.number;
            
            const title = document.createElement('span');
            title.className = 'sidebar-nav-title';
            title.textContent = section.title;

            link.appendChild(number);
            link.appendChild(title);
            listItem.appendChild(link);
            navList.appendChild(listItem);
        });

        this.sidebar.appendChild(navList);

        // Add toggle button for mobile
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'sidebar-nav-toggle';
        toggleBtn.setAttribute('aria-label', 'Toggle navigation');
        toggleBtn.innerHTML = '☰';
        this.sidebar.appendChild(toggleBtn);

        // Inject into page
        document.body.appendChild(this.sidebar);

        // Add styles
        this.injectStyles();
    }

    attachEventListeners() {
        // Click on nav links
        const links = this.sidebar.querySelectorAll('.sidebar-nav-link');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(link.getAttribute('data-section-index'));
                this.navigateToSection(index);
            });
        });

        // Scroll detection
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.updateActiveSection();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Mobile toggle
        const toggleBtn = this.sidebar.querySelector('.sidebar-nav-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.sidebar.classList.toggle('sidebar-nav-open');
            });
        }

        // Close on outside click (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !this.sidebar.contains(e.target) && 
                this.sidebar.classList.contains('sidebar-nav-open')) {
                this.sidebar.classList.remove('sidebar-nav-open');
            }
        });
    }

    navigateToSection(index) {
        const section = this.sections[index];
        if (!section) return;

        // If there's a tab element, click it to switch tabs
        if (section.tabElement) {
            section.tabElement.click();
            
            // Wait for tab animation, then scroll
            setTimeout(() => {
                const targetElement = section.element;
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - this.options.offset;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        } else {
            // Direct scroll to element
            const offsetTop = section.element.offsetTop - this.options.offset;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }

        // Update active state
        this.setActiveSection(index);

        // Close mobile menu
        if (window.innerWidth <= 768) {
            this.sidebar.classList.remove('sidebar-nav-open');
        }
    }

    updateActiveSection() {
        const scrollPos = window.pageYOffset + this.options.offset + 50;
        
        // Find which section is currently in view
        for (let i = this.sections.length - 1; i >= 0; i--) {
            const section = this.sections[i];
            if (section.element && section.element.offsetTop <= scrollPos) {
                this.setActiveSection(i);
                break;
            }
        }
    }

    setActiveSection(index) {
        if (this.activeSection === index) return;
        
        this.activeSection = index;
        
        // Update active class
        const links = this.sidebar.querySelectorAll('.sidebar-nav-link');
        links.forEach((link, i) => {
            if (i === index) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    injectStyles() {
        if (document.getElementById('sidebar-nav-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'sidebar-nav-styles';
        styles.textContent = `
            .sidebar-nav {
                position: fixed;
                top: 120px;
                width: 240px;
                background: #ffffff;
                border: 1px solid #e0e0e0;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                z-index: 900;
                max-height: calc(100vh - 160px);
                overflow-y: auto;
                transition: transform 0.3s ease;
            }

            .sidebar-nav-right {
                right: 20px;
            }

            .sidebar-nav-left {
                left: 20px;
            }

            .sidebar-nav-header {
                padding: 1rem 1.25rem;
                font-weight: 600;
                font-size: 0.875rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: #333333;
                border-bottom: 1px solid #e0e0e0;
                background: #f8f9fa;
            }

            .sidebar-nav-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .sidebar-nav-item {
                border-bottom: 1px solid #f0f0f0;
            }

            .sidebar-nav-item:last-child {
                border-bottom: none;
            }

            .sidebar-nav-link {
                display: flex;
                align-items: center;
                padding: 0.875rem 1.25rem;
                text-decoration: none;
                color: #666666;
                transition: all 0.2s ease;
                gap: 0.75rem;
            }

            .sidebar-nav-link:hover {
                background: #f8f9fa;
                color: #333333;
                padding-left: 1.5rem;
            }

            .sidebar-nav-link.active {
                background: #333333;
                color: #ffffff;
                border-left: 3px solid #000000;
            }

            .sidebar-nav-link.active .sidebar-nav-number {
                color: #ffffff;
            }

            .sidebar-nav-number {
                font-size: 0.75rem;
                font-weight: 600;
                color: #999999;
                min-width: 24px;
            }

            .sidebar-nav-title {
                font-size: 0.875rem;
                line-height: 1.4;
            }

            .sidebar-nav-toggle {
                display: none;
            }

            /* Scrollbar styling */
            .sidebar-nav::-webkit-scrollbar {
                width: 6px;
            }

            .sidebar-nav::-webkit-scrollbar-track {
                background: #f0f0f0;
            }

            .sidebar-nav::-webkit-scrollbar-thumb {
                background: #cccccc;
                border-radius: 3px;
            }

            .sidebar-nav::-webkit-scrollbar-thumb:hover {
                background: #999999;
            }

            /* Mobile styles */
            @media (max-width: 1280px) {
                .sidebar-nav {
                    width: 200px;
                }
            }

            @media (max-width: 768px) {
                .sidebar-nav {
                    position: fixed;
                    top: auto;
                    bottom: 20px;
                    right: 20px;
                    left: auto;
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    max-height: none;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .sidebar-nav-open {
                    width: calc(100vw - 40px);
                    height: auto;
                    max-height: calc(100vh - 100px);
                    border-radius: 12px;
                    overflow-y: auto;
                }

                .sidebar-nav-header {
                    display: none;
                }

                .sidebar-nav-open .sidebar-nav-header {
                    display: block;
                }

                .sidebar-nav-list {
                    display: none;
                }

                .sidebar-nav-open .sidebar-nav-list {
                    display: block;
                }

                .sidebar-nav-toggle {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 56px;
                    height: 56px;
                    background: #333333;
                    color: #ffffff;
                    border: none;
                    border-radius: 50%;
                    font-size: 1.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .sidebar-nav-toggle:hover {
                    background: #000000;
                    transform: scale(1.05);
                }

                .sidebar-nav-open .sidebar-nav-toggle {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    width: 36px;
                    height: 36px;
                    font-size: 1.25rem;
                    border-radius: 50%;
                }

                .sidebar-nav-link {
                    padding: 1rem 1.25rem;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Auto-initialize if data attribute is present
document.addEventListener('DOMContentLoaded', () => {
    const sidebarContainer = document.querySelector('[data-sidebar-nav]');
    if (sidebarContainer) {
        const position = sidebarContainer.getAttribute('data-sidebar-position') || 'right';
        new SidebarNav({ position });
    }
});

// Export for manual initialization
window.SidebarNav = SidebarNav;
