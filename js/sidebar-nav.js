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
        this.isNavigating = false;

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
        
        // Check for problems/challenges section (on index page)
        const problemsSection = document.querySelector('.problems-section');
        if (problemsSection) {
            const problemsIntro = problemsSection.querySelector('.problems-intro h2');
            if (problemsIntro) {
                sections.push({
                    id: 'challenges-section',
                    title: 'The Challenges',
                    number: '⚠',
                    element: problemsSection,
                    type: 'challenges'
                });
            }
        }
        
        // Get the main section title first
        const mainTitle = document.querySelector('.section-title');
        if (mainTitle) {
            sections.push({
                id: 'main-intro',
                title: mainTitle.textContent.trim(),
                number: '●',
                element: mainTitle.closest('.section-header'),
                type: 'intro'
            });
        }
        
        // Get sections from tabs
        const tabs = document.querySelectorAll('.strategic-tab');
        const cards = document.querySelectorAll(this.options.sectionSelector);

        if (tabs.length > 0 && cards.length > 0) {
            tabs.forEach((tab, index) => {
                const title = tab.querySelector('.tab-title')?.textContent || `Section ${index + 1}`;
                const number = tab.querySelector('.tab-number')?.textContent || `0${index + 1}`;
                
                sections.push({
                    id: `tab-section-${index}`,
                    title: title,
                    number: number,
                    element: cards[index],
                    tabElement: tab,
                    type: 'tab'
                });
            });
        }
        
        // Get glossary section if it exists
        const glossarySection = document.querySelector('.glossary-container');
        if (glossarySection) {
            const glossaryTitle = glossarySection.closest('.timeline-section')?.querySelector('h3');
            if (glossaryTitle) {
                sections.push({
                    id: 'glossary-section',
                    title: 'Glossary',
                    number: '📖',
                    element: glossarySection.closest('.timeline-section'),
                    type: 'glossary'
                });
            }
        }
        
        // Get 2030 Goals / conclusion section
        const conclusionSections = document.querySelectorAll('.timeline-section');
        conclusionSections.forEach((section, index) => {
            const heading = section.querySelector('h3');
            if (heading && !section.querySelector('.glossary-container')) {
                const titleText = heading.textContent.trim();
                // Skip if it's the glossary section
                if (!titleText.toLowerCase().includes('glossary')) {
                    sections.push({
                        id: `conclusion-${index}`,
                        title: titleText.length > 40 ? '2030 Goals' : titleText,
                        number: '★',
                        element: section,
                        type: 'conclusion'
                    });
                }
            }
        });

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
        
        const headerText = document.createElement('span');
        headerText.textContent = 'Navigation';
        header.appendChild(headerText);
        
        const minimizeBtn = document.createElement('button');
        minimizeBtn.className = 'sidebar-nav-minimize';
        minimizeBtn.setAttribute('aria-label', 'Minimize sidebar');
        minimizeBtn.innerHTML = '−';
        header.appendChild(minimizeBtn);
        
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

        // Scroll detection for active section and sidebar visibility
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.updateActiveSection();
                    this.updateSidebarVisibility();
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        // Initial visibility check
        this.updateSidebarVisibility();

        // Desktop minimize button
        const minimizeBtn = this.sidebar.querySelector('.sidebar-nav-minimize');
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.sidebar.classList.toggle('sidebar-nav-minimized');
                minimizeBtn.innerHTML = this.sidebar.classList.contains('sidebar-nav-minimized') ? '+' : '−';
            });
        }
        
        // Click on minimized sidebar to restore
        this.sidebar.addEventListener('click', (e) => {
            if (this.sidebar.classList.contains('sidebar-nav-minimized') && 
                !e.target.classList.contains('sidebar-nav-minimize')) {
                this.sidebar.classList.remove('sidebar-nav-minimized');
                if (minimizeBtn) minimizeBtn.innerHTML = '−';
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
    
    updateSidebarVisibility() {
        // Hide sidebar during hero section
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
            const scrollPos = window.pageYOffset;
            
            if (scrollPos < heroBottom - 100) {
                this.sidebar.style.opacity = '0';
                this.sidebar.style.pointerEvents = 'none';
            } else {
                this.sidebar.style.opacity = '1';
                this.sidebar.style.pointerEvents = 'auto';
            }
        }
    }

    navigateToSection(index) {
        const section = this.sections[index];
        if (!section) return;

        // Set flag to prevent updateActiveSection from overriding during navigation
        this.isNavigating = true;
        
        // Immediately update active state
        this.setActiveSection(index);

        // Handle different section types
        if (section.type === 'tab' && section.tabElement) {
            // If there's a tab element, click it to switch tabs
            section.tabElement.click();
            
            // Wait for tab animation, then scroll to the active card
            setTimeout(() => {
                const activeCard = document.querySelector('.strategic-content-card.active');
                if (activeCard) {
                    const rect = activeCard.getBoundingClientRect();
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const targetPosition = rect.top + scrollTop - 120;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
                
                // Re-enable automatic updates after scroll completes
                setTimeout(() => {
                    this.isNavigating = false;
                }, 800);
            }, 200);
        } else if (section.type === 'intro') {
            // Scroll to the introduction section
            const targetElement = section.element;
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const targetPosition = rect.top + scrollTop - 100;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Re-enable automatic updates after scroll completes
                setTimeout(() => {
                    this.isNavigating = false;
                }, 800);
            }
        } else if (section.type === 'challenges') {
            // Scroll to the challenges/problems section
            const targetElement = section.element;
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const targetPosition = rect.top + scrollTop - 80;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Re-enable automatic updates after scroll completes
                setTimeout(() => {
                    this.isNavigating = false;
                }, 800);
            }
        } else {
            // Direct scroll to element (glossary, 2030 Goals, etc.)
            const targetElement = section.element;
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const targetPosition = rect.top + scrollTop - 120;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Re-enable automatic updates after scroll completes
                setTimeout(() => {
                    this.isNavigating = false;
                }, 800);
            }
        }

        // Close mobile menu
        if (window.innerWidth <= 768) {
            this.sidebar.classList.remove('sidebar-nav-open');
        }
    }

    updateActiveSection() {
        // Don't update if we're currently navigating programmatically
        if (this.isNavigating) return;
        
        const scrollPos = window.pageYOffset + 150;
        
        // Special handling for tab sections - check which tab is currently active
        const activeCard = document.querySelector('.strategic-content-card.active');
        if (activeCard) {
            // Find which section index corresponds to this active card
            for (let i = 0; i < this.sections.length; i++) {
                const section = this.sections[i];
                if (section.type === 'tab' && section.element === activeCard) {
                    // Check if we're in the tabs area
                    const tabsContainer = document.querySelector('.strategic-tabs');
                    if (tabsContainer) {
                        const tabsTop = tabsContainer.getBoundingClientRect().top + window.pageYOffset;
                        const cardBottom = activeCard.getBoundingClientRect().bottom + window.pageYOffset;
                        
                        // If we're between the tabs and the end of the active card, highlight this tab
                        if (scrollPos >= tabsTop - 200 && scrollPos <= cardBottom) {
                            this.setActiveSection(i);
                            return;
                        }
                    }
                }
            }
        }
        
        // For non-tab sections, check normally
        for (let i = this.sections.length - 1; i >= 0; i--) {
            const section = this.sections[i];
            // Skip tab sections in this loop since we handled them above
            if (section.type === 'tab') continue;
            
            if (section.element) {
                const rect = section.element.getBoundingClientRect();
                const elementTop = rect.top + window.pageYOffset;
                
                if (elementTop <= scrollPos) {
                    this.setActiveSection(i);
                    return;
                }
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
                top: 50%;
                transform: translateY(-50%);
                width: 260px;
                background: #ffffff;
                border: 1px solid #e0e0e0;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                z-index: 900;
                max-height: calc(100vh - 200px);
                overflow-y: auto;
                transition: opacity 0.3s ease, transform 0.3s ease;
                border-radius: 8px;
                opacity: 0;
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
                color: #ffffff;
                background: #333333;
                position: sticky;
                top: 0;
                z-index: 10;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .sidebar-nav-minimize {
                width: 28px;
                height: 28px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: #ffffff;
                border-radius: 4px;
                cursor: pointer;
                font-size: 1.25rem;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                padding: 0;
                font-weight: 300;
            }
            
            .sidebar-nav-minimize:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.05);
            }
            
            .sidebar-nav-minimized {
                width: 48px !important;
                cursor: pointer;
            }
            
            .sidebar-nav-minimized .sidebar-nav-header span {
                display: none;
            }
            
            .sidebar-nav-minimized .sidebar-nav-list {
                display: none;
            }
            
            .sidebar-nav-minimized .sidebar-nav-minimize {
                margin: 0 auto;
            }

            .sidebar-nav-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .sidebar-nav-item {
                border-bottom: 1px solid #f0f0f0;
            }
            
            .sidebar-nav-item.section-group-start {
                margin-top: 0.5rem;
                border-top: 2px solid #e0e0e0;
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
                border-left: 4px solid #000000;
                font-weight: 500;
            }

            .sidebar-nav-link.active .sidebar-nav-number {
                color: #ffffff;
            }

            .sidebar-nav-number {
                font-size: 0.8rem;
                font-weight: 600;
                color: #999999;
                min-width: 28px;
                text-align: center;
            }
            
            .sidebar-nav-link.active .sidebar-nav-number {
                color: #ffffff;
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
                .sidebar-nav-minimize {
                    display: none;
                }
                
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
                    transform: none;
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
