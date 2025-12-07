/**
 * Universities Module
 * Handles interactive map and university cards for Top 30 US Universities page
 */

const UniversitiesApp = (function() {
    // Private state
    let universitiesData = [];
    let map = null;
    let markers = {};
    
    // Active filters state
    let activeFilters = {
        search: '',
        schoolType: 'all',
        appType: 'all'
    };
    
    // Configuration
    const config = {
        dataUrl: 'data/universities.json',
        mapContainerId: 'universities-map',
        gridContainerId: 'universities-grid',
        searchInputId: 'universities-search',
        mapCenter: [39.8283, -98.5795], // Center of US
        mapZoom: 4,
        markerSize: 28
    };
    
    // Application type mapping from JSON earlyOption values to filter values
    const appTypeMapping = {
        'ed': ['ED (Early Decision)', 'ED I / ED II'],
        'ed2': ['ED I / ED II'],
        'ea': ['EA (Early Action)'],
        'rea': ['REA (Restrictive Early Action)', 'SCEA (Single-Choice Early Action)'],
        'rd': ['RD Only (No Early Option)']
    };

    /**
     * Initialize the application
     */
    async function init() {
        try {
            await loadData();
            initMap();
            renderMarkers();
            renderCards();
            initSearch();
            initFilterButtons();
        } catch (error) {
            console.error('Failed to initialize universities app:', error);
        }
    }

    /**
     * Load university data from JSON file
     */
    async function loadData() {
        const response = await fetch(config.dataUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        universitiesData = json.universities;
    }

    /**
     * Initialize the Leaflet map
     */
    function initMap() {
        map = L.map(config.mapContainerId, {
            center: config.mapCenter,
            zoom: config.mapZoom,
            scrollWheelZoom: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(map);
    }

    /**
     * Create a custom marker icon
     */
    function createMarkerIcon(rank) {
        return L.divIcon({
            className: 'university-marker',
            html: `<span>${rank}</span>`,
            iconSize: [config.markerSize, config.markerSize],
            iconAnchor: [config.markerSize / 2, config.markerSize / 2]
        });
    }

    /**
     * Generate popup HTML content for a university
     */
    function createPopupContent(uni) {
        // Determine the application type badge color
        const appTypeColors = {
            'ED': { bg: '#fed7d7', color: '#c53030' },
            'EA': { bg: '#c6f6d5', color: '#276749' },
            'REA': { bg: '#feebc8', color: '#c05621' },
            'SCEA': { bg: '#feebc8', color: '#c05621' },
            'RD': { bg: '#e2e8f0', color: '#4a5568' }
        };
        
        let badgeStyle = appTypeColors['RD']; // default
        for (const [key, style] of Object.entries(appTypeColors)) {
            if (uni.admissions.earlyOption.includes(key)) {
                badgeStyle = style;
                break;
            }
        }
        
        // Get short app type label
        let appTypeLabel = uni.admissions.earlyOption;
        if (appTypeLabel.includes('ED I / ED II')) appTypeLabel = 'ED I & II';
        else if (appTypeLabel.includes('SCEA')) appTypeLabel = 'SCEA';
        else if (appTypeLabel.includes('REA')) appTypeLabel = 'REA';
        else if (appTypeLabel.includes('ED')) appTypeLabel = 'ED';
        else if (appTypeLabel.includes('EA')) appTypeLabel = 'EA';
        else if (appTypeLabel.includes('RD Only')) appTypeLabel = 'RD Only';
        
        return `
            <div class="university-popup">
                <div class="popup-header">
                    <span class="popup-rank">#${uni.rank} Nationally</span>
                    <h3 class="popup-name">${uni.name}</h3>
                    <p class="popup-location">📍 ${uni.location.city}, ${uni.location.state}</p>
                </div>
                <div class="popup-content">
                    <div class="popup-section">
                        <div class="popup-grid">
                            <div class="popup-item">
                                <div class="popup-item-label">Founded</div>
                                <div class="popup-item-value">${uni.details.founded}</div>
                            </div>
                            <div class="popup-item">
                                <div class="popup-item-label">Students</div>
                                <div class="popup-item-value">${uni.details.students}</div>
                            </div>
                            <div class="popup-item">
                                <div class="popup-item-label">Type</div>
                                <div class="popup-item-value">${uni.details.type}</div>
                            </div>
                            <div class="popup-item">
                                <div class="popup-item-label">Early Option</div>
                                <div class="popup-item-value">
                                    <span style="background: ${badgeStyle.bg}; color: ${badgeStyle.color}; padding: 2px 8px; border-radius: 10px; font-size: 0.7rem; font-weight: 600;">${appTypeLabel}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="popup-section">
                        <div class="popup-section-title">Acceptance Rates</div>
                        <div class="popup-grid">
                            <div class="popup-item">
                                <div class="popup-item-label">Early Rate</div>
                                <div class="popup-item-value" style="color: #38a169; font-weight: 700;">${uni.admissions.earlyRate}</div>
                            </div>
                            <div class="popup-item">
                                <div class="popup-item-label">Regular Rate</div>
                                <div class="popup-item-value" style="color: #e53e3e; font-weight: 700;">${uni.admissions.rdRate}</div>
                            </div>
                        </div>
                        ${uni.admissions.rateNote ? `<div style="font-size: 0.7rem; color: #666; margin-top: 6px; font-style: italic; padding: 0 4px;">Note: ${uni.admissions.rateNote}</div>` : ''}
                    </div>
                    <div class="popup-section">
                        <div class="popup-notable">${uni.notable}</div>
                    </div>
                    ${uni.aiInitiative ? `
                    <div class="popup-section popup-ai-section">
                        <div class="popup-section-title">🤖 AI Learning Initiative</div>
                        <div class="popup-ai-content">
                            <div class="popup-ai-name">${uni.aiInitiative.name}</div>
                            <div class="popup-ai-desc">${uni.aiInitiative.description}</div>
                            ${uni.aiInitiative.link ? `<a href="${uni.aiInitiative.link}" target="_blank" rel="noopener" class="popup-ai-link">Learn More →</a>` : ''}
                        </div>
                    </div>
                    ` : ''}
                </div>
                <div class="popup-footer">
                    <a href="${uni.website}" target="_blank" rel="noopener" class="popup-link">
                        Visit Official Website →
                    </a>
                </div>
            </div>
        `;
    }

    /**
     * Render all markers on the map
     */
    function renderMarkers() {
        universitiesData.forEach(uni => {
            const marker = L.marker(
                [uni.location.lat, uni.location.lng],
                { icon: createMarkerIcon(uni.rank) }
            ).addTo(map);

            marker.bindPopup(createPopupContent(uni), {
                maxWidth: 450,
                className: 'university-popup-wrapper'
            });

            markers[uni.rank] = marker;
        });
    }

    /**
     * Get the application type category from earlyOption value
     */
    function getAppTypeCategory(earlyOption) {
        if (earlyOption.includes('ED I / ED II')) return 'ed2';
        if (earlyOption.includes('ED (Early Decision)')) return 'ed';
        if (earlyOption.includes('EA (Early Action)')) return 'ea';
        if (earlyOption.includes('REA') || earlyOption.includes('SCEA')) return 'rea';
        if (earlyOption.includes('RD Only')) return 'rd';
        return 'other';
    }

    /**
     * Generate HTML for a university card
     */
    function createCardHTML(uni) {
        const appTypeCategory = getAppTypeCategory(uni.admissions.earlyOption);
        return `
            <div class="university-card" data-rank="${uni.rank}" data-type="${uni.details.type.toLowerCase()}" data-app-type="${appTypeCategory}" data-name="${uni.name.toLowerCase()}">
                <div class="university-card-header" onclick="UniversitiesApp.toggleCard(this)">
                    <div class="university-card-rank">${uni.rank}</div>
                    <div class="university-card-info">
                        <div class="university-card-name">${uni.name}</div>
                        <div class="university-card-location">${uni.location.city}, ${uni.location.state}</div>
                    </div>
                    <div class="university-card-toggle">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                </div>
                <div class="university-card-content">
                    <div class="university-card-section">
                        <div class="university-card-section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
                            </svg>
                            University Details
                        </div>
                        <div class="university-card-details-grid">
                            <div class="university-card-detail">
                                <div class="university-card-detail-label">Founded</div>
                                <div class="university-card-detail-value">${uni.details.founded}</div>
                            </div>
                            <div class="university-card-detail">
                                <div class="university-card-detail-label">Students</div>
                                <div class="university-card-detail-value">${uni.details.students}</div>
                            </div>
                            <div class="university-card-detail">
                                <div class="university-card-detail-label">Type</div>
                                <div class="university-card-detail-value">${uni.details.type}</div>
                            </div>
                        </div>
                    </div>
                    <div class="university-card-section">
                        <div class="university-card-section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            Application Information
                        </div>
                        <div class="university-card-admission-grid">
                            <div class="university-card-admission-item">
                                <div class="university-card-admission-label">Early Option</div>
                                <div class="university-card-admission-value">${uni.admissions.earlyOption}</div>
                            </div>
                            <div class="university-card-admission-item">
                                <div class="university-card-admission-label">Early Deadline</div>
                                <div class="university-card-admission-value">${uni.admissions.earlyDeadline}</div>
                            </div>
                            <div class="university-card-admission-item">
                                <div class="university-card-admission-label">RD Deadline</div>
                                <div class="university-card-admission-value">${uni.admissions.rdDeadline}</div>
                            </div>
                            <div class="university-card-admission-item">
                                <div class="university-card-admission-label">Early Decision</div>
                                <div class="university-card-admission-value">${uni.admissions.earlyDecision}</div>
                            </div>
                            <div class="university-card-admission-item">
                                <div class="university-card-admission-label">RD Decision</div>
                                <div class="university-card-admission-value">${uni.admissions.rdDecision}</div>
                            </div>
                            <div class="university-card-admission-item">
                                <div class="university-card-admission-label">Early Rate</div>
                                <div class="university-card-admission-value">${uni.admissions.earlyRate}</div>
                            </div>
                            <div class="university-card-admission-item">
                                <div class="university-card-admission-label">RD Rate</div>
                                <div class="university-card-admission-value">${uni.admissions.rdRate}</div>
                            </div>
                            ${uni.admissions.rateNote ? `
                            <div class="university-card-admission-item" style="grid-column: span 2;">
                                <div class="university-card-admission-label">Note</div>
                                <div class="university-card-admission-value" style="font-style: italic;">${uni.admissions.rateNote}</div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="university-card-section">
                        <div class="university-card-section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            Notable
                        </div>
                        <div class="university-card-notable">${uni.notable}</div>
                    </div>
                    ${uni.aiInitiative ? `
                    <div class="university-card-section university-card-ai-section">
                        <div class="university-card-section-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="4" y="4" width="16" height="16" rx="2"/>
                                <circle cx="9" cy="9" r="1.5"/>
                                <circle cx="15" cy="9" r="1.5"/>
                                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                            </svg>
                            AI Learning Initiative
                        </div>
                        <div class="university-card-ai-content">
                            <div class="university-card-ai-name">${uni.aiInitiative.name}</div>
                            <div class="university-card-ai-desc">${uni.aiInitiative.description}</div>
                            ${uni.aiInitiative.link ? `<a href="${uni.aiInitiative.link}" target="_blank" rel="noopener" class="university-card-ai-link">Learn More About This Program →</a>` : ''}
                        </div>
                    </div>
                    ` : ''}
                    <div class="university-card-actions">
                        <button class="university-card-btn university-card-btn-map" onclick="UniversitiesApp.showOnMap(${uni.rank})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            Show on Map
                        </button>
                        <a href="${uni.website}" target="_blank" rel="noopener" class="university-card-btn university-card-btn-website">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="2" y1="12" x2="22" y2="12"/>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                            </svg>
                            Visit Website
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render all university cards
     */
    function renderCards() {
        const container = document.getElementById(config.gridContainerId);
        if (!container) return;

        const html = universitiesData.map(uni => createCardHTML(uni)).join('');
        container.innerHTML = html;
    }

    /**
     * Toggle card expansion
     */
    function toggleCard(headerElement) {
        const card = headerElement.closest('.university-card');
        card.classList.toggle('expanded');
    }

    /**
     * Show university on map
     */
    function showOnMap(rank) {
        const marker = markers[rank];
        if (marker && map) {
            map.setView(marker.getLatLng(), 10, { animate: true });
            setTimeout(() => marker.openPopup(), 300);
            
            // Scroll to map
            document.getElementById(config.mapContainerId).scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    /**
     * Initialize search functionality
     */
    function initSearch() {
        const searchInput = document.getElementById(config.searchInputId);
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            activeFilters.search = e.target.value.toLowerCase().trim();
            applyFilters();
        });
    }

    /**
     * Apply all active filters to cards
     */
    function applyFilters() {
        const cards = document.querySelectorAll('.university-card');
        let visibleCount = 0;
        
        cards.forEach(card => {
            const name = card.dataset.name;
            const cardType = card.dataset.type;
            const cardAppType = card.dataset.appType;
            
            const matchesSearch = !activeFilters.search || name.includes(activeFilters.search);
            const matchesSchoolType = activeFilters.schoolType === 'all' || cardType === activeFilters.schoolType;
            const matchesAppType = activeFilters.appType === 'all' || cardAppType === activeFilters.appType;
            
            const isVisible = matchesSearch && matchesSchoolType && matchesAppType;
            card.style.display = isVisible ? 'block' : 'none';
            if (isVisible) visibleCount++;
        });
        
        // Update no results message
        updateNoResultsMessage(visibleCount);
    }
    
    /**
     * Show/hide no results message
     */
    function updateNoResultsMessage(visibleCount) {
        const container = document.getElementById(config.gridContainerId);
        let noResultsEl = container.querySelector('.no-results-message');
        
        if (visibleCount === 0) {
            if (!noResultsEl) {
                noResultsEl = document.createElement('div');
                noResultsEl.className = 'no-results-message';
                noResultsEl.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px; margin-bottom: 1rem; opacity: 0.5;">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <p style="font-size: 1.1rem; color: #4a5568; margin: 0;">No universities match your current filters.</p>
                    <p style="font-size: 0.9rem; color: #718096; margin-top: 0.5rem;">Try adjusting your search or filter criteria.</p>
                `;
                noResultsEl.style.cssText = 'text-align: center; padding: 3rem; grid-column: 1 / -1;';
                container.appendChild(noResultsEl);
            }
            noResultsEl.style.display = 'block';
        } else if (noResultsEl) {
            noResultsEl.style.display = 'none';
        }
    }

    /**
     * Initialize filter buttons
     */
    function initFilterButtons() {
        const filterBtns = document.querySelectorAll('.universities-filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filterType = btn.dataset.filterType;
                const filterValue = btn.dataset.filter;
                
                // Update active state only within the same filter group
                const siblingBtns = document.querySelectorAll(`.universities-filter-btn[data-filter-type="${filterType}"]`);
                siblingBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active filters
                if (filterType === 'school') {
                    activeFilters.schoolType = filterValue;
                } else if (filterType === 'app') {
                    activeFilters.appType = filterValue;
                }
                
                // Apply all filters
                applyFilters();
            });
        });
    }

    /**
     * Get universities data (for external access if needed)
     */
    function getData() {
        return universitiesData;
    }

    // Public API
    return {
        init,
        toggleCard,
        showOnMap,
        getData
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', UniversitiesApp.init);
