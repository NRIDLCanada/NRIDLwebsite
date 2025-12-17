// Admission Officers Page Application
(function() {
    'use strict';
    
    const AdmissionOfficersApp = {
        map: null,
        data: null,
        markers: [],
        activeFilters: {
            college: 'all',
            region: 'all'
        },
        searchTerm: '',
        
        // Initialize the app
        init: async function() {
            await this.loadData();
            this.initMap();
            this.renderMarkers();
            this.renderCards();
            this.bindEvents();
        },
        
        // Load admission officers data
        loadData: async function() {
            try {
                const response = await fetch('data/admission-officers.json');
                this.data = await response.json();
            } catch (error) {
                console.error('Error loading admission officers data:', error);
            }
        },
        
        // Initialize Leaflet map
        initMap: function() {
            // Center on US
            this.map = L.map('officers-map', {
                scrollWheelZoom: false
            }).setView([39.8283, -98.5795], 4);
            
            // Add tile layer with grayscale style
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 19
            }).addTo(this.map);
        },
        
        // Create custom marker icon
        createMarkerIcon: function(color) {
            return L.divIcon({
                className: 'custom-marker',
                html: `<div style="
                    background: ${color};
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 14px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                    border: 3px solid white;
                ">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                </div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });
        },
        
        // Get college color
        getCollegeColor: function(collegeName) {
            const colors = {
                'Pomona College': '#0057b8',      // Blue
                'Wellesley College': '#002776',   // Navy blue
                'Swarthmore College': '#7e1e2e'   // Maroon
            };
            return colors[collegeName] || '#1a365d';
        },
        
        // Render map markers
        renderMarkers: function() {
            // Clear existing markers
            this.markers.forEach(marker => this.map.removeLayer(marker));
            this.markers = [];
            
            if (!this.data || !this.data.colleges) return;
            
            this.data.colleges.forEach(college => {
                const color = this.getCollegeColor(college.name);
                const marker = L.marker(college.coordinates, {
                    icon: this.createMarkerIcon(color)
                });
                
                // Create popup content
                const popupContent = `
                    <div style="min-width: 200px; font-family: 'Inter', sans-serif;">
                        <h3 style="margin: 0 0 0.5rem 0; color: ${color}; font-size: 1.1rem;">${college.name}</h3>
                        <p style="margin: 0 0 0.5rem 0; color: #666; font-size: 0.85rem;">${college.location}</p>
                        <p style="margin: 0 0 0.5rem 0; color: #333; font-size: 0.9rem;">
                            <strong>${college.officers.length}</strong> Regional Officers
                        </p>
                        <a href="${college.website}" target="_blank" style="color: ${color}; font-size: 0.85rem; text-decoration: none;">
                            Visit Admissions Website →
                        </a>
                    </div>
                `;
                
                marker.bindPopup(popupContent);
                marker.addTo(this.map);
                this.markers.push(marker);
            });
        },
        
        // Render officer cards
        renderCards: function() {
            const container = document.getElementById('officers-grid');
            if (!container || !this.data) return;
            
            let filteredOfficers = [];
            
            this.data.colleges.forEach(college => {
                college.officers.forEach(officer => {
                    // Apply college filter
                    if (this.activeFilters.college !== 'all' && college.name !== this.activeFilters.college) {
                        return;
                    }
                    
                    // Apply region filter
                    if (this.activeFilters.region !== 'all') {
                        const hasRegion = officer.regions.some(region => 
                            region.toLowerCase().includes(this.activeFilters.region.toLowerCase())
                        );
                        if (!hasRegion) return;
                    }
                    
                    // Apply search
                    if (this.searchTerm) {
                        const searchLower = this.searchTerm.toLowerCase();
                        const nameMatch = officer.name.toLowerCase().includes(searchLower);
                        const regionMatch = officer.regions.some(r => r.toLowerCase().includes(searchLower));
                        const collegeMatch = college.name.toLowerCase().includes(searchLower);
                        const titleMatch = officer.title.toLowerCase().includes(searchLower);
                        
                        if (!nameMatch && !regionMatch && !collegeMatch && !titleMatch) return;
                    }
                    
                    filteredOfficers.push({
                        ...officer,
                        collegeName: college.name,
                        collegeLocation: college.location,
                        collegeWebsite: college.website
                    });
                });
            });
            
            // Update count
            const countEl = document.getElementById('officers-count');
            if (countEl) {
                countEl.textContent = `${filteredOfficers.length} officer${filteredOfficers.length !== 1 ? 's' : ''} found`;
            }
            
            if (filteredOfficers.length === 0) {
                container.innerHTML = `
                    <div class="no-results">
                        <div class="no-results-icon">🔍</div>
                        <h3>No officers found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = filteredOfficers.map(officer => this.createOfficerCard(officer)).join('');
        },
        
        // Create single officer card HTML
        createOfficerCard: function(officer) {
            const color = this.getCollegeColor(officer.collegeName);
            const initials = officer.name.split(' ').map(n => n[0]).slice(0, 2).join('');
            
            return `
                <div class="officer-card" data-college="${officer.collegeName}">
                    <div class="officer-card-header" style="background: ${color};">
                        <div class="officer-avatar">
                            ${initials}
                        </div>
                        <div class="officer-info">
                            <h3 class="officer-name">${officer.name}</h3>
                            <p class="officer-title">${officer.title}</p>
                        </div>
                    </div>
                    <div class="officer-card-body">
                        <div class="officer-college">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                            </svg>
                            <span>${officer.collegeName}</span>
                        </div>
                        <div class="officer-regions">
                            <h4>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="2" y1="12" x2="22" y2="12"></line>
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                </svg>
                                Regional Coverage
                            </h4>
                            <div class="region-tags">
                                ${officer.regions.map(region => `<span class="region-tag">${region}</span>`).join('')}
                            </div>
                        </div>
                        <div class="officer-contact">
                            <a href="https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(officer.name + ' ' + officer.collegeName)}" target="_blank" class="linkedin-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                                View on LinkedIn
                            </a>
                        </div>
                    </div>
                </div>
            `;
        },
        
        // Bind event handlers
        bindEvents: function() {
            // Search input
            const searchInput = document.getElementById('officers-search');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.searchTerm = e.target.value;
                    this.renderCards();
                });
            }
            
            // College filter
            const collegeFilter = document.getElementById('college-filter');
            if (collegeFilter) {
                collegeFilter.addEventListener('change', (e) => {
                    this.activeFilters.college = e.target.value;
                    this.renderCards();
                });
            }
            
            // Region filter
            const regionFilter = document.getElementById('region-filter');
            if (regionFilter) {
                regionFilter.addEventListener('change', (e) => {
                    this.activeFilters.region = e.target.value;
                    this.renderCards();
                });
            }
            
            // Clear filters button
            const clearBtn = document.getElementById('clear-filters');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    this.searchTerm = '';
                    this.activeFilters = { college: 'all', region: 'all' };
                    
                    if (searchInput) searchInput.value = '';
                    if (collegeFilter) collegeFilter.value = 'all';
                    if (regionFilter) regionFilter.value = 'all';
                    
                    this.renderCards();
                });
            }
        },
        
        // Show college on map
        showOnMap: function(collegeName) {
            const college = this.data.colleges.find(c => c.name === collegeName);
            if (college) {
                this.map.setView(college.coordinates, 12);
                // Find and open the marker popup
                this.markers.forEach(marker => {
                    const pos = marker.getLatLng();
                    if (pos.lat === college.coordinates[0] && pos.lng === college.coordinates[1]) {
                        marker.openPopup();
                    }
                });
            }
        }
    };
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        AdmissionOfficersApp.init();
    });
    
    // Expose to global scope for onclick handlers
    window.AdmissionOfficersApp = AdmissionOfficersApp;
})();
