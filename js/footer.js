// Footer Component
class Footer {
    constructor() {
        this.createFooter();
    }

    createFooter() {
        const footer = document.createElement('footer');
        footer.className = 'main-footer';
        footer.innerHTML = `
            <div class="footer-container">
                <div class="footer-content">
                    <div class="footer-branding">
                        <span class="footer-logo">NRIDL</span>
                        <p class="footer-description">
                            The National Research Institute for Democratized Learning is committed to making 
                            education, digital resources, and AI accessible to all.
                        </p>
                        <p class="footer-mission">
                            Democratizing access to knowledge for a more equitable future.
                        </p>
                    </div>
                    
                    <div class="footer-section">
                        <h6 class="footer-section-title">Explore</h6>
                        <ul class="footer-links">
                            <li><a href="index.html" class="footer-link">Home</a></li>
                            <li><a href="literacy.html" class="footer-link">Literacy Programs</a></li>
                            <li><a href="digital-futures.html" class="footer-link">Digital Futures</a></li>
                            <li><a href="heritage.html" class="footer-link">Cultural Heritage</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-section">
                        <h6 class="footer-section-title">Resources</h6>
                        <ul class="footer-links">
                            <li><a href="#" class="footer-link">Learning Programs</a></li>
                            <li><a href="https://www.storybee.space" class="footer-link" target="_blank" rel="noopener noreferrer">StoryBee Library</a></li>
                            <li><a href="#" class="footer-link">AI Solutions</a></li>
                            <li><a href="#" class="footer-link">Research</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-section">
                        <h6 class="footer-section-title">Contact</h6>
                        <ul class="footer-links">
                            <li><a href="mailto:support@nridl.org" class="footer-link">support@nridl.org</a></li>
                            <li><span class="footer-link" style="cursor: default; color: rgba(255, 255, 255, 0.7);">Toronto, Canada</span></li>
                        </ul>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <nav class="footer-policies">
                        <a href="privacy-policy.html" class="footer-policy-link">Privacy Policy</a>
                        <a href="cookie-policy.html" class="footer-policy-link">Cookie Policy</a>
                        <a href="terms-of-use.html" class="footer-policy-link">Terms of Use</a>
                        <a href="ip-policy.html" class="footer-policy-link">IP Policy</a>
                        <a href="responsible-ai-policy.html" class="footer-policy-link">Responsible AI Policy</a>
                        <a href="sustainability.html" class="footer-policy-link">Sustainability</a>
                    </nav>
                    
                    <div class="footer-copyright">
                        <strong>ALL RIGHTS RESERVED © 2022-2025 THE NATIONAL RESEARCH INSTITUTE FOR DEMOCRATIZED LEARNING</strong>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(footer);
    }
}

// Initialize footer when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new Footer();
    });
} else {
    new Footer();
}
