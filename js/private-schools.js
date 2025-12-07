/**
 * Canadian Private Schools Module
 * Handles interactive map and school cards for Top Canadian Private Schools page
 */

const PrivateSchoolsApp = (function() {
    // Private state
    let schoolsData = [];
    let allSchools = [];
    let map = null;
    let markers = {};
    let currentCity = 'toronto';
    
    // Active filters state
    let activeFilters = {
        search: '',
        schoolType: 'all',
        boarding: 'all',
        program: 'all'
    };
    
    // Configuration
    const config = {
        dataUrl: 'data/canadian-private-schools.json',
        mapContainerId: 'schools-map',
        gridContainerId: 'schools-grid',
        searchInputId: 'schools-search',
        mapCenter: [43.6532, -79.3832], // Toronto center
        mapZoom: 10,
        markerSize: 28
    };
    
    // City coordinates for map centering
    const cityCoordinates = {
        toronto: { center: [43.7001, -79.4163], zoom: 10 },
        vancouver: { center: [49.2827, -123.1207], zoom: 11 },
        montreal: { center: [45.5017, -73.5673], zoom: 11 },
        calgary: { center: [51.0447, -114.0719], zoom: 11 },
        ottawa: { center: [45.4215, -75.6972], zoom: 11 }
    };

    // School type colors
    const typeColors = {
        'All-Boys': { bg: '#2b6cb0', border: '#1a365d' },
        'All-Girls': { bg: '#d53f8c', border: '#97266d' },
        'Co-Ed': { bg: '#38a169', border: '#276749' }
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
            initCityTabs();
        } catch (error) {
            console.error('Failed to initialize private schools app:', error);
        }
    }

    /**
     * Load school data from JSON file
     */
    async function loadData() {
        const response = await fetch(config.dataUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        schoolsData = json.schools;
        // Flatten all schools for total count
        allSchools = Object.values(schoolsData).flat();
    }

    /**
     * Initialize the Leaflet map
     */
    function initMap() {
        const cityConfig = cityCoordinates[currentCity];
        map = L.map(config.mapContainerId, {
            center: cityConfig.center,
            zoom: cityConfig.zoom,
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
    function createMarkerIcon(rank, type) {
        const colors = typeColors[type] || typeColors['Co-Ed'];
        return L.divIcon({
            className: 'school-marker',
            html: `<div class="school-marker-inner" style="background: ${colors.bg}; border-color: ${colors.border}"><span>${rank}</span></div>`,
            iconSize: [config.markerSize, config.markerSize],
            iconAnchor: [config.markerSize / 2, config.markerSize / 2]
        });
    }

    /**
     * Generate popup HTML content for a school (simple version for map)
     */
    function createPopupContent(school) {
        const typeColor = typeColors[school.type] || typeColors['Co-Ed'];
        const boardingBadge = school.boarding ? 
            '<span class="popup-badge boarding">Boarding Available</span>' : 
            '<span class="popup-badge day-only">Day School</span>';
        
        return `
            <div class="school-popup">
                <div class="popup-header">
                    <div class="popup-header-top">
                        <span class="popup-rank">#${school.rank}</span>
                        <span class="popup-type-badge" style="background: ${typeColor.bg};">${school.type}</span>
                    </div>
                    <h3 class="popup-name">${school.name}</h3>
                    <p class="popup-location">${school.location.address}</p>
                </div>
                <div class="popup-content">
                    <div class="popup-quick-info">
                        <div class="popup-info-row">
                            <span class="popup-label">Grades:</span>
                            <span class="popup-value">${school.grades}</span>
                        </div>
                        <div class="popup-info-row">
                            <span class="popup-label">Students:</span>
                            <span class="popup-value">${school.students}</span>
                        </div>
                        <div class="popup-info-row">
                            <span class="popup-label">Founded:</span>
                            <span class="popup-value">${school.founded}</span>
                        </div>
                    </div>
                    <div class="popup-badges">
                        ${boardingBadge}
                        ${school.academics.ibProgram ? '<span class="popup-badge ib">IB Programme</span>' : ''}
                        ${school.academics.apCourses ? '<span class="popup-badge ap">AP Courses</span>' : ''}
                    </div>
                    <div class="popup-tuition">
                        <span class="popup-label">Day Tuition:</span>
                        <span class="popup-value tuition">${school.tuition.day}</span>
                    </div>
                    <p class="popup-vibe">"${school.vibe}"</p>
                </div>
            </div>
        `;
    }

    /**
     * Render all markers on the map
     */
    function renderMarkers() {
        // Clear existing markers
        Object.values(markers).forEach(marker => map.removeLayer(marker));
        markers = {};
        
        const citySchools = schoolsData[currentCity] || [];
        
        citySchools.forEach(school => {
            const marker = L.marker(
                [school.location.lat, school.location.lng],
                { icon: createMarkerIcon(school.rank, school.type) }
            ).addTo(map);

            marker.bindPopup(createPopupContent(school), {
                maxWidth: 350,
                className: 'school-popup-wrapper'
            });

            markers[school.rank] = marker;
        });
    }

    /**
     * Generate HTML for a school card (detailed version)
     */
    function createCardHTML(school) {
        const typeColor = typeColors[school.type] || typeColors['Co-Ed'];
        const boardingClass = school.boarding ? 'boarding' : 'day';
        const programType = school.academics.ibProgram ? 'ib' : (school.academics.apCourses ? 'ap' : 'ontario');
        
        return `
            <div class="school-card" data-rank="${school.rank}" data-type="${school.type.toLowerCase().replace('-', '').replace(' ', '')}" data-boarding="${boardingClass}" data-program="${programType}" data-name="${school.name.toLowerCase()}">
                <div class="card-header">
                    <div class="card-rank" style="background: ${typeColor.bg};">${school.rank}</div>
                    <div class="card-content">
                        <h3 class="card-name">${school.name}</h3>
                        <p class="card-location">${school.city}, ON</p>
                    </div>
                    <div class="card-badges-row">
                        <span class="card-type-badge" style="background: ${typeColor.bg};">${school.type}</span>
                        ${school.boarding ? '<span class="card-badge boarding">Boarding</span>' : ''}
                    </div>
                    <div class="card-toggle">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"/>
                        </svg>
                    </div>
                </div>
                <div class="card-expanded-content">
                    <!-- Quick Stats -->
                    <div class="expanded-stats-grid">
                        <div class="stat-box">
                            <span class="stat-label">Founded</span>
                            <span class="stat-value">${school.founded}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Grades</span>
                            <span class="stat-value">${school.grades}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Students</span>
                            <span class="stat-value">${school.students}</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-label">Class Size</span>
                            <span class="stat-value">${school.academics.avgClassSize}</span>
                        </div>
                    </div>

                    <!-- Tuition -->
                    <div class="expanded-section">
                        <h4 class="expanded-section-title">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                            Tuition
                        </h4>
                        <div class="tuition-grid">
                            <div class="tuition-box">
                                <span class="tuition-label">Day Student</span>
                                <span class="tuition-value">${school.tuition.day}</span>
                            </div>
                            ${school.boarding ? `
                            <div class="tuition-box boarding">
                                <span class="tuition-label">Boarding</span>
                                <span class="tuition-value">${school.tuition.boarding}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Admissions -->
                    <div class="expanded-section">
                        <h4 class="expanded-section-title">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                            </svg>
                            Admissions
                        </h4>
                        <div class="admissions-info">
                            <div class="admission-row">
                                <span class="admission-label">Entry Grades:</span>
                                <span class="admission-value highlight">${school.admissions.openGrades}</span>
                            </div>
                            <div class="admission-row">
                                <span class="admission-label">Application Deadline:</span>
                                <span class="admission-value">${school.admissions.applicationDeadline}</span>
                            </div>
                            <div class="admission-row">
                                <span class="admission-label">Acceptance Rate:</span>
                                <span class="admission-value">${school.admissions.acceptanceRate}</span>
                            </div>
                            <div class="admission-requirements">
                                ${school.admissions.assessmentRequired ? '<span class="req-badge">Assessment Required</span>' : ''}
                                ${school.admissions.interviewRequired ? '<span class="req-badge">Interview Required</span>' : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Academics -->
                    <div class="expanded-section">
                        <h4 class="expanded-section-title">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                            </svg>
                            Academics
                        </h4>
                        <div class="academics-info">
                            <div class="academic-row">
                                <span class="academic-label">Curriculum:</span>
                                <span class="academic-value">${school.academics.curriculum}</span>
                            </div>
                            <div class="academic-row">
                                <span class="academic-label">Student:Teacher Ratio:</span>
                                <span class="academic-value">${school.academics.studentTeacherRatio}</span>
                            </div>
                            <div class="program-badges">
                                ${school.academics.ibProgram ? '<span class="program-badge ib">IB Programme</span>' : ''}
                                ${school.academics.apCourses ? '<span class="program-badge ap">AP Courses</span>' : ''}
                                ${school.academics.frenchImmersion ? '<span class="program-badge french">French Immersion</span>' : ''}
                            </div>
                        </div>
                    </div>

                    <!-- University Placement -->
                    <div class="expanded-section university-section">
                        <h4 class="expanded-section-title">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                            </svg>
                            University Placement
                        </h4>
                        <div class="university-stats">
                            <div class="uni-stat ivy">
                                <span class="uni-stat-value">${school.university.ivyLeaguePlacement}</span>
                                <span class="uni-stat-label">US Ivy League</span>
                            </div>
                            <div class="uni-stat canadian">
                                <span class="uni-stat-value">${school.university.topCanadianPlacement}</span>
                                <span class="uni-stat-label">Top Canadian</span>
                            </div>
                        </div>
                        <div class="uni-destinations">
                            <span class="destinations-label">Notable Destinations:</span>
                            <span class="destinations-list">${school.university.notableDestinations.join(', ')}</span>
                        </div>
                    </div>

                    <!-- Special Programs & Athletics -->
                    <div class="expanded-section">
                        <h4 class="expanded-section-title">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            Special Programs
                        </h4>
                        <div class="special-programs">
                            ${school.specialPrograms.map(prog => `<span class="special-badge">${prog}</span>`).join('')}
                        </div>
                    </div>

                    <!-- Athletics -->
                    <div class="expanded-section">
                        <h4 class="expanded-section-title">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 16v-4"/>
                                <path d="M12 8h.01"/>
                            </svg>
                            Athletics
                        </h4>
                        <div class="athletics-list">
                            ${school.athletics.map(sport => `<span class="sport-badge">${sport}</span>`).join('')}
                        </div>
                    </div>

                    <!-- Notable & Vibe -->
                    <div class="expanded-notable">
                        <p class="notable-text">${school.notable}</p>
                        <p class="vibe-text">"${school.vibe}"</p>
                    </div>

                    <!-- Actions -->
                    <div class="expanded-actions">
                        <a href="${school.website}" target="_blank" rel="noopener noreferrer" class="expanded-link primary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15 3 21 3 21 9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                            Visit Website
                        </a>
                        <button class="expanded-link secondary map-focus-btn" data-rank="${school.rank}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            View on Map
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render all school cards
     */
    function renderCards() {
        const container = document.getElementById(config.gridContainerId);
        if (!container) return;

        const citySchools = schoolsData[currentCity] || [];
        const filteredSchools = filterSchools(citySchools);
        
        if (filteredSchools.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <p>No schools match your filters. Try adjusting your search criteria.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredSchools.map(school => createCardHTML(school)).join('');
        
        // Add click handlers for card expansion
        container.querySelectorAll('.school-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't toggle if clicking on a link or button
                if (e.target.closest('a') || e.target.closest('button')) return;
                card.classList.toggle('expanded');
            });
        });
        
        // Add click handlers for map focus buttons
        container.querySelectorAll('.map-focus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const rank = parseInt(btn.dataset.rank);
                focusMarker(rank);
            });
        });
    }

    /**
     * Filter schools based on active filters
     */
    function filterSchools(schools) {
        return schools.filter(school => {
            // Search filter
            if (activeFilters.search) {
                const searchLower = activeFilters.search.toLowerCase();
                const nameMatch = school.name.toLowerCase().includes(searchLower);
                const cityMatch = school.city.toLowerCase().includes(searchLower);
                if (!nameMatch && !cityMatch) return false;
            }
            
            // School type filter
            if (activeFilters.schoolType !== 'all') {
                const typeMap = {
                    'allboys': 'All-Boys',
                    'allgirls': 'All-Girls',
                    'coed': 'Co-Ed'
                };
                if (school.type !== typeMap[activeFilters.schoolType]) return false;
            }
            
            // Boarding filter
            if (activeFilters.boarding !== 'all') {
                if (activeFilters.boarding === 'boarding' && !school.boarding) return false;
                if (activeFilters.boarding === 'day' && school.boarding) return false;
            }
            
            // Program filter
            if (activeFilters.program !== 'all') {
                if (activeFilters.program === 'ib' && !school.academics.ibProgram) return false;
                if (activeFilters.program === 'ap' && !school.academics.apCourses) return false;
            }
            
            return true;
        });
    }

    /**
     * Initialize search functionality
     */
    function initSearch() {
        const searchInput = document.getElementById(config.searchInputId);
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            activeFilters.search = e.target.value;
            renderCards();
        });
    }

    /**
     * Initialize filter buttons
     */
    function initFilterButtons() {
        // School type filters
        document.querySelectorAll('[data-filter-type="school"]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-filter-type="school"]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeFilters.schoolType = btn.dataset.filter;
                renderCards();
            });
        });
        
        // Boarding filters
        document.querySelectorAll('[data-filter-type="boarding"]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-filter-type="boarding"]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeFilters.boarding = btn.dataset.filter;
                renderCards();
            });
        });
        
        // Program filters
        document.querySelectorAll('[data-filter-type="program"]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-filter-type="program"]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeFilters.program = btn.dataset.filter;
                renderCards();
            });
        });
    }

    /**
     * Initialize city tabs
     */
    function initCityTabs() {
        document.querySelectorAll('.city-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.city-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                currentCity = tab.dataset.city;
                const cityConfig = cityCoordinates[currentCity];
                
                // Update map view
                map.setView(cityConfig.center, cityConfig.zoom);
                
                // Re-render markers and cards
                renderMarkers();
                renderCards();
                
                // Update section title
                updateSectionTitle();
            });
        });
    }

    /**
     * Update section title based on current city
     */
    function updateSectionTitle() {
        const titleEl = document.querySelector('.rankings-section h2');
        if (!titleEl) return;
        
        const cityNames = {
            toronto: 'Top 25 Private Schools in Toronto',
            vancouver: 'Top 20 Private Schools in Vancouver',
            montreal: 'Top 15 Private Schools in Montreal',
            calgary: 'Top 5 Private Schools in Calgary',
            ottawa: 'Top 4 Private Schools in Ottawa'
        };
        
        titleEl.textContent = cityNames[currentCity] || 'Private Schools';
    }

    /**
     * Focus on a specific marker on the map
     */
    function focusMarker(rank) {
        const marker = markers[rank];
        if (marker) {
            map.setView(marker.getLatLng(), 14);
            marker.openPopup();
            
            // Scroll to map section
            document.querySelector('.map-section').scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Public API
    return {
        init: init,
        focusMarker: focusMarker
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    PrivateSchoolsApp.init();
});
