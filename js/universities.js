/**
 * Universities Module
 * Handles interactive map and university cards for Top 30 US Universities page
 * and Top 30 Liberal Arts Colleges section
 */

const UniversitiesApp = (function() {
    // Private state
    let universitiesData = [];
    let liberalArtsData = [];
    let map = null;
    let liberalArtsMap = null;
    let markers = {};
    let liberalArtsMarkers = {};
    
    // Active filters state
    let activeFilters = {
        search: '',
        schoolType: 'all',
        appType: 'all'
    };
    
    // Active filters state for Liberal Arts
    let liberalArtsFilters = {
        search: '',
        schoolType: 'all',
        appType: 'all'
    };
    
    // Configuration
    const config = {
        dataUrl: 'data/universities.json',
        liberalArtsDataUrl: 'data/liberal-arts-colleges.json',
        mapContainerId: 'universities-map',
        liberalArtsMapContainerId: 'liberal-arts-map',
        gridContainerId: 'universities-grid',
        liberalArtsGridContainerId: 'liberal-arts-grid',
        searchInputId: 'universities-search',
        liberalArtsSearchInputId: 'liberal-arts-search',
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
            
            // Initialize Liberal Arts section if it exists
            if (document.getElementById(config.liberalArtsMapContainerId)) {
                await loadLiberalArtsData();
                initLiberalArtsMap();
                renderLiberalArtsMarkers();
                renderLiberalArtsCards();
                initLiberalArtsSearch();
                initLiberalArtsFilterButtons();
            }
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
     * Load liberal arts colleges data from JSON file
     */
    async function loadLiberalArtsData() {
        const response = await fetch(config.liberalArtsDataUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        liberalArtsData = json.colleges;
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
     * Initialize the Liberal Arts Leaflet map
     */
    function initLiberalArtsMap() {
        liberalArtsMap = L.map(config.liberalArtsMapContainerId, {
            center: config.mapCenter,
            zoom: config.mapZoom,
            scrollWheelZoom: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(liberalArtsMap);
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
     * Create a custom marker icon for liberal arts colleges (green theme)
     */
    function createLiberalArtsMarkerIcon(rank) {
        return L.divIcon({
            className: 'liberal-arts-marker',
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
                    <div class="popup-header-top">
                        <span class="popup-rank">#${uni.rank}</span>
                        <span class="popup-type-badge" style="background: ${badgeStyle.bg}; color: ${badgeStyle.color};">${appTypeLabel}</span>
                    </div>
                    <h3 class="popup-name">${uni.name}</h3>
                    <p class="popup-location">${uni.location.city}, ${uni.location.state}</p>
                </div>
                <div class="popup-content">
                    <div class="popup-rates">
                        <div class="popup-rate">
                            <span class="popup-rate-label">Early</span>
                            <span class="popup-rate-value early">${uni.admissions.earlyRate}</span>
                        </div>
                        <div class="popup-rate">
                            <span class="popup-rate-label">Regular</span>
                            <span class="popup-rate-value regular">${uni.admissions.rdRate}</span>
                        </div>
                        <div class="popup-rate">
                            <span class="popup-rate-label">Type</span>
                            <span class="popup-rate-value">${uni.details.type}</span>
                        </div>
                    </div>
                    <div class="popup-campus">
                        <div class="popup-campus-row">
                            <span class="popup-campus-item"><strong>${uni.details.setting}</strong></span>
                            <span class="popup-campus-item">${uni.details.ratio} ratio</span>
                            <span class="popup-campus-item">${uni.details.campusSize}</span>
                        </div>
                        <p class="popup-vibe">"${uni.details.vibe}"</p>
                    </div>
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
     * Render all markers on the liberal arts map
     */
    function renderLiberalArtsMarkers() {
        liberalArtsData.forEach(college => {
            const marker = L.marker(
                [college.location.lat, college.location.lng],
                { icon: createLiberalArtsMarkerIcon(college.rank) }
            ).addTo(liberalArtsMap);

            marker.bindPopup(createPopupContent(college), {
                maxWidth: 450,
                className: 'university-popup-wrapper liberal-arts-popup'
            });

            liberalArtsMarkers[college.rank] = marker;
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
     * Render all liberal arts college cards
     */
    function renderLiberalArtsCards() {
        const container = document.getElementById(config.liberalArtsGridContainerId);
        if (!container) return;

        const html = liberalArtsData.map(college => createLiberalArtsCardHTML(college)).join('');
        container.innerHTML = html;
    }

    /**
     * Generate HTML for a liberal arts college card
     */
    function createLiberalArtsCardHTML(college) {
        const appTypeCategory = getAppTypeCategory(college.admissions.earlyOption);
        return `
            <div class="university-card liberal-arts-card" data-rank="${college.rank}" data-type="${college.details.type.toLowerCase()}" data-app-type="${appTypeCategory}" data-name="${college.name.toLowerCase()}">
                <div class="university-card-header" onclick="UniversitiesApp.toggleCard(this)">
                    <div class="university-card-rank liberal-arts-rank">${college.rank}</div>
                    <div class="university-card-info">
                        <div class="university-card-name">${college.name}</div>
                        <div class="university-card-location">${college.location.city}, ${college.location.state}</div>
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
                            College Details
                        </div>
                        <div class="university-card-details-grid">
                            <div class="university-card-detail">
                                <div class="university-card-detail-label">Founded</div>
                                <div class="university-card-detail-value">${college.details.founded}</div>
                            </div>
                            <div class="university-card-detail">
                                <div class="university-card-detail-label">Students</div>
                                <div class="university-card-detail-value">${college.details.students}</div>
                            </div>
                            <div class="university-card-detail">
                                <div class="university-card-detail-label">Type</div>
                                <div class="university-card-detail-value">${college.details.type}</div>
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
                                <div class="university-card-admission-value">${college.admissions.earlyOption}</div>
                            </div>
                            <div class="university-card-admission-item">
                                <div class="university-card-admission-label">Early Deadline</div>
                                <div class="university-card-admission-value">${college.admissions.earlyDeadline}</div>
                            </div>
                            <div class="university-card-admission-item">
                                <div class="university-card-admission-label">RD Deadline</div>
                                <div class="university-card-admission-value">${college.admissions.rdDeadline}</div>
                            </div>
                            <div class="university-card-admission-item">
                                <div class="university-card-admission-label">Early Decision</div>
                                <div class="university-card-admission-value">${college.admissions.earlyDecision}</div>
                            </div>
                            <div class="university-card-admission-item">
                                <div class="university-card-admission-label">RD Decision</div>
                                <div class="university-card-admission-value">${college.admissions.rdDecision}</div>
                            </div>
                            <div class="university-card-admission-item">
                                <div class="university-card-admission-label">Early Rate</div>
                                <div class="university-card-admission-value">${college.admissions.earlyRate}</div>
                            </div>
                            <div class="university-card-admission-item">
                                <div class="university-card-admission-label">RD Rate</div>
                                <div class="university-card-admission-value">${college.admissions.rdRate}</div>
                            </div>
                            ${college.admissions.rateNote ? `
                            <div class="university-card-admission-item" style="grid-column: span 2;">
                                <div class="university-card-admission-label">Note</div>
                                <div class="university-card-admission-value" style="font-style: italic;">${college.admissions.rateNote}</div>
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
                        <div class="university-card-notable">${college.notable}</div>
                    </div>
                    <div class="university-card-actions">
                        <button class="university-card-btn university-card-btn-map liberal-arts-btn" onclick="UniversitiesApp.showOnLiberalArtsMap(${college.rank})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            Show on Map
                        </button>
                        <a href="${college.website}" target="_blank" rel="noopener" class="university-card-btn university-card-btn-website liberal-arts-btn">
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
     * Show liberal arts college on map
     */
    function showOnLiberalArtsMap(rank) {
        const marker = liberalArtsMarkers[rank];
        if (marker && liberalArtsMap) {
            liberalArtsMap.setView(marker.getLatLng(), 10, { animate: true });
            setTimeout(() => marker.openPopup(), 300);
            
            // Scroll to map
            document.getElementById(config.liberalArtsMapContainerId).scrollIntoView({
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
     * Initialize Liberal Arts search functionality
     */
    function initLiberalArtsSearch() {
        const searchInput = document.getElementById(config.liberalArtsSearchInputId);
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            liberalArtsFilters.search = e.target.value.toLowerCase().trim();
            applyLiberalArtsFilters();
        });
    }

    /**
     * Apply all active filters to cards
     */
    function applyFilters() {
        const cards = document.querySelectorAll('#universities-grid .university-card');
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
        updateNoResultsMessage(visibleCount, config.gridContainerId, 'universities');
    }

    /**
     * Apply all active filters to liberal arts cards
     */
    function applyLiberalArtsFilters() {
        const cards = document.querySelectorAll('#liberal-arts-grid .university-card');
        let visibleCount = 0;
        
        cards.forEach(card => {
            const name = card.dataset.name;
            const cardType = card.dataset.type;
            const cardAppType = card.dataset.appType;
            
            const matchesSearch = !liberalArtsFilters.search || name.includes(liberalArtsFilters.search);
            const matchesSchoolType = liberalArtsFilters.schoolType === 'all' || cardType === liberalArtsFilters.schoolType;
            const matchesAppType = liberalArtsFilters.appType === 'all' || cardAppType === liberalArtsFilters.appType;
            
            const isVisible = matchesSearch && matchesSchoolType && matchesAppType;
            card.style.display = isVisible ? 'block' : 'none';
            if (isVisible) visibleCount++;
        });
        
        // Update no results message
        updateNoResultsMessage(visibleCount, config.liberalArtsGridContainerId, 'colleges');
    }
    
    /**
     * Show/hide no results message
     */
    function updateNoResultsMessage(visibleCount, containerId, type) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
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
                    <p style="font-size: 1.1rem; color: #4a5568; margin: 0;">No ${type} match your current filters.</p>
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
        const filterBtns = document.querySelectorAll('.universities-controls .universities-filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filterType = btn.dataset.filterType;
                const filterValue = btn.dataset.filter;
                
                // Update active state only within the same filter group
                const siblingBtns = document.querySelectorAll(`.universities-controls .universities-filter-btn[data-filter-type="${filterType}"]`);
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
     * Initialize Liberal Arts filter buttons
     */
    function initLiberalArtsFilterButtons() {
        const filterBtns = document.querySelectorAll('.liberal-arts-controls .universities-filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filterType = btn.dataset.filterType;
                const filterValue = btn.dataset.filter;
                
                // Update active state only within the same filter group
                const siblingBtns = document.querySelectorAll(`.liberal-arts-controls .universities-filter-btn[data-filter-type="${filterType}"]`);
                siblingBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active filters
                if (filterType === 'school') {
                    liberalArtsFilters.schoolType = filterValue;
                } else if (filterType === 'app') {
                    liberalArtsFilters.appType = filterValue;
                }
                
                // Apply all filters
                applyLiberalArtsFilters();
            });
        });
    }

    /**
     * Get universities data (for external access if needed)
     */
    function getData() {
        return universitiesData;
    }

    /**
     * Get liberal arts data (for external access if needed)
     */
    function getLiberalArtsData() {
        return liberalArtsData;
    }

    // Public API
    return {
        init,
        toggleCard,
        showOnMap,
        showOnLiberalArtsMap,
        getData,
        getLiberalArtsData
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', UniversitiesApp.init);
