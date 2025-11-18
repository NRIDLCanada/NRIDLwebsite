// Common JavaScript Utilities and Animations

// Scroll Reveal Animation
class ScrollReveal {
    constructor() {
        this.elements = document.querySelectorAll('.reveal');
        this.windowHeight = window.innerHeight;
        this.init();
    }

    init() {
        this.checkElements();
        window.addEventListener('scroll', () => this.checkElements());
        window.addEventListener('resize', () => {
            this.windowHeight = window.innerHeight;
        });
    }

    checkElements() {
        this.elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < this.windowHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    }
}

// Smooth Scroll for Anchor Links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const navHeight = document.querySelector('.main-navigation')?.offsetHeight || 80;
                    const targetPosition = target.offsetTop - navHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Parallax Effect for Hero Sections
class ParallaxEffect {
    constructor(selector) {
        this.elements = document.querySelectorAll(selector);
        this.init();
    }

    init() {
        if (this.elements.length === 0) return;
        
        window.addEventListener('scroll', () => {
            this.elements.forEach(element => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * 0.5;
                element.style.transform = `translate3d(0, ${rate}px, 0)`;
            });
        });
    }
}

// Counter Animation
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = Math.round(target);
            clearInterval(timer);
        } else {
            element.textContent = Math.round(start);
        }
    }, 16);
}

// Intersection Observer for Lazy Loading
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize all common features
function initCommonFeatures() {
    new ScrollReveal();
    initSmoothScroll();
    new ParallaxEffect('.parallax');
    initLazyLoading();
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommonFeatures);
} else {
    initCommonFeatures();
}

// Utility Functions
const utils = {
    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Check if element is in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // Get scroll percentage
    getScrollPercentage() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        return (scrollTop / scrollHeight) * 100;
    }
};

// Export for use in other scripts
window.NRIDL = {
    utils,
    ScrollReveal,
    ParallaxEffect,
    animateCounter
};
