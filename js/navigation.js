// Navigation Component
class Navigation {
    constructor() {
        this.createNavigation();
        this.attachEventListeners();
        this.handleScroll();
    }

    createNavigation() {
        const nav = document.createElement('nav');
        nav.className = 'main-navigation';
        nav.innerHTML = `
            <div class="nav-container">
                <a href="/" class="nav-logo">
                    <div class="nav-logo-text">
                        <span class="nav-logo-main">NRIDL</span>
                        <span class="nav-logo-sub">The National Institute for Democratized Learning</span>
                    </div>
                </a>
                
                <button class="nav-toggle" aria-label="Toggle navigation">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                
                <ul class="nav-menu">
                    <li class="nav-item">
                        <a href="/" class="nav-link" data-page="home">Home</a>
                    </li>
                    <li class="nav-item">
                        <a href="/literacy" class="nav-link" data-page="literacy">Literacy</a>
                    </li>
                    <li class="nav-item">
                        <a href="/digital-futures" class="nav-link" data-page="digital-futures">Digital Futures</a>
                    </li>
                    <li class="nav-item">
                        <a href="/heritage" class="nav-link" data-page="heritage">Heritage</a>
                    </li>
                </ul>
            </div>
        `;
        
        document.body.insertBefore(nav, document.body.firstChild);
        
        // Add padding to body to account for fixed navigation
        document.body.style.paddingTop = '80px';
    }

    attachEventListeners() {
        // Mobile menu toggle
        const toggle = document.querySelector('.nav-toggle');
        const menu = document.querySelector('.nav-menu');
        
        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                menu.classList.toggle('active');
            });
            
            // Close menu when clicking on a link
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    toggle.classList.remove('active');
                    menu.classList.remove('active');
                });
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.nav-container')) {
                    toggle.classList.remove('active');
                    menu.classList.remove('active');
                }
            });
        }
        
        // Set active page
        this.setActivePage();
    }

    handleScroll() {
        const nav = document.querySelector('.main-navigation');
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    setActivePage() {
        // Get current path without .html extension
        let currentPage = window.location.pathname.replace('.html', '').split('/').pop();
        if (currentPage === '' || currentPage === 'index') {
            currentPage = 'home';
        }
        
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            if (page === currentPage) {
                link.classList.add('active');
            }
        });
    }
}

// Initialize navigation when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Navigation();
    });
} else {
    new Navigation();
}
