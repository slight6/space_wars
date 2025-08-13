/**
 * Dynamic Page Template System
 * Automatically pulls and displays information from player, location, and market JSON files
 * Provides consistent design patterns across all pages
 */

class PageTemplate {
    constructor() {
        this.data = {
            player: null,
            location: null,
            market: null,
            ships: null,
            keldarSystem: null
        };
        this.theme = {
            colors: {
                primary: '#3B82F6',      // Blue
                secondary: '#8B5CF6',    // Purple
                success: '#10B981',      // Green
                warning: '#F59E0B',      // Yellow
                danger: '#EF4444',       // Red
                info: '#06B6D4',         // Cyan
                dark: '#1F2937',         // Dark gray
                darker: '#111827',       // Darker gray
                light: '#F9FAFB',        // Light gray
                background: 'linear-gradient(to bottom, #0f0f23, #1a1a2e, #16213e)'
            },
            typography: {
                fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
                fontSize: {
                    xs: '0.75rem',
                    sm: '0.875rem',
                    base: '1rem',
                    lg: '1.125rem',
                    xl: '1.25rem',
                    '2xl': '1.5rem',
                    '3xl': '1.875rem',
                    '4xl': '2.25rem'
                }
            },
            spacing: {
                xs: '0.25rem',
                sm: '0.5rem',
                md: '1rem',
                lg: '1.5rem',
                xl: '2rem',
                '2xl': '2.5rem',
                '3xl': '3rem'
            }
        };
        this.init();
    }

    async init() {
        await this.loadStaticData();
        this.loadPlayerData();
        this.setupEventListeners();
    }

    async loadStaticData() {
        try {
            // Load Keldar system data
            const response = await fetch('./data/keldar-system.json');
            this.data.keldarSystem = await response.json();
            
            // Load ships data
            const shipsResponse = await fetch('./ships.json');
            this.data.ships = await shipsResponse.json();
            
            console.log('Static data loaded:', {
                keldarSystem: !!this.data.keldarSystem,
                ships: !!this.data.ships
            });
        } catch (error) {
            console.warn('Could not load static data:', error);
        }
    }

    loadPlayerData() {
        const currentPlayer = localStorage.getItem('currentPlayer');
        if (currentPlayer) {
            this.data.player = JSON.parse(currentPlayer);
            this.updatePlayerLocation();
        }
    }

    updatePlayerLocation() {
        if (!this.data.player || !this.data.keldarSystem) return;
        
        // Determine current location based on player data
        const currentLocation = this.data.player.currentLocation || 'nexus_station';
        
        // Find location in Keldar system data
        if (currentLocation === 'nexus_station') {
            this.data.location = this.data.keldarSystem.celestialBodies.stations.nexus;
        } else if (this.data.keldarSystem.celestialBodies.moons[currentLocation]) {
            this.data.location = this.data.keldarSystem.celestialBodies.moons[currentLocation];
        } else {
            this.data.location = this.data.keldarSystem.celestialBodies.stations.nexus; // Default
        }
    }

    setupEventListeners() {
        // Listen for player data changes
        window.addEventListener('playerDataChanged', () => {
            this.loadPlayerData();
            this.refreshUI();
        });

        // Listen for location changes
        window.addEventListener('locationChanged', (event) => {
            if (event.detail && event.detail.location) {
                this.data.player.currentLocation = event.detail.location;
                this.updatePlayerLocation();
                this.refreshUI();
            }
        });
    }

    // Template generation methods
    generatePageHeader(title, subtitle = null) {
        const location = this.data.location;
        const locationName = location ? location.name : 'Unknown Location';
        const specialization = location ? location.specialization : '';
        
        return `
            <header class="bg-gray-900 bg-opacity-80 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-4">
                        <h1 class="text-2xl font-bold text-white">
                            🚀 ${title} - ${locationName}
                        </h1>
                        ${subtitle ? `<span class="text-gray-400 text-sm">${subtitle}</span>` : ''}
                    </div>
                    <div class="flex items-center space-x-6">
                        ${this.generateHeaderActions()}
                    </div>
                </div>
                ${specialization ? `
                    <div class="mt-2">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            ${this.formatSpecialization(specialization)}
                        </span>
                    </div>
                ` : ''}
            </header>
        `;
    }

    generateStatusBar() {
        const player = this.data.player;
        if (!player) return '';

        return `
            <div class="bg-gray-800 bg-opacity-90 backdrop-blur-sm border-b border-gray-600 px-6 py-3">
                <div class="container mx-auto">
                    <div class="flex items-center justify-between">
                        <!-- Left Side: Ship and Pilot Information -->
                        <div class="flex items-center space-x-6">
                            <!-- Ship Icon and Name -->
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span class="text-white text-sm font-bold">🚀</span>
                                </div>
                                <div>
                                    <div class="text-white font-semibold text-sm">
                                        Commander ${player.username}
                                    </div>
                                    <div class="text-blue-400 font-medium text-sm">
                                        ${this.getCurrentShipName()}
                                    </div>
                                    <div class="text-gray-400 text-xs">
                                        Location: ${this.getCurrentLocationName()}
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Ship Status Indicators -->
                            <div class="hidden md:flex items-center space-x-4 text-sm">
                                ${this.generateShipStatusIndicators()}
                            </div>
                        </div>
                        
                        <!-- Right Side: Credits and Status -->
                        <div class="text-right">
                            <div class="text-sm font-semibold text-green-400">
                                All Systems Nominal
                            </div>
                            <div class="text-yellow-400 font-mono text-sm">
                                Credits: ${this.formatNumber(player.credits || 0)}
                            </div>
                            <div class="text-gray-400 text-xs">
                                Level ${player.level || 1} • ${this.formatNumber(player.experience || 0)} XP
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateNavigationDropdowns() {
        return `
            <div class="lg:col-span-1 space-y-4">
                ${this.generateShipInfoDropdown()}
                ${this.generateShipOptionsDropdown()}
                ${this.generateShipActionsDropdown()}
                ${this.generateStationLocationsDropdown()}
            </div>
        `;
    }

    generateShipInfoDropdown() {
        return `
            <div class="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-lg border border-gray-700">
                <div class="dropdown">
                    <button onclick="window.pageTemplate.toggleDropdown('shipInfo')" 
                            class="w-full p-4 text-left flex justify-between items-center hover:bg-gray-800 transition-colors">
                        <span class="font-semibold text-blue-400">🚀 Ship Information</span>
                        <span class="text-gray-400" id="shipInfoToggle">▶</span>
                    </button>
                    <div id="shipInfoContent" class="dropdown-menu border-t border-gray-700 hidden">
                        <a href="#" onclick="window.pageTemplate.showCargoManifest()" 
                           class="block px-4 py-2 hover:bg-gray-800 text-sm">📦 Cargo Manifest</a>
                        <a href="#" onclick="window.pageTemplate.showCrewInfo()" 
                           class="block px-4 py-2 hover:bg-gray-800 text-sm">👥 Crew Information</a>
                        <a href="#" onclick="window.pageTemplate.showUpgrades()" 
                           class="block px-4 py-2 hover:bg-gray-800 text-sm">⚡ List Upgrades</a>
                        <a href="#" onclick="window.pageTemplate.showShipLogs()" 
                           class="block px-4 py-2 hover:bg-gray-800 text-sm">📋 Ship Logs</a>
                        <a href="inventory.html" class="block px-4 py-2 hover:bg-gray-800 text-sm">ℹ️ Complete Ship Status</a>
                    </div>
                </div>
            </div>
        `;
    }

    generateShipOptionsDropdown() {
        return `
            <div class="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-lg border border-gray-700">
                <div class="dropdown">
                    <button onclick="window.pageTemplate.toggleDropdown('shipOptions')" 
                            class="w-full p-4 text-left flex justify-between items-center hover:bg-gray-800 transition-colors">
                        <span class="font-semibold text-cyan-400">⚙️ Ship Options</span>
                        <span class="text-gray-400" id="shipOptionsToggle">▶</span>
                    </button>
                    <div id="shipOptionsContent" class="dropdown-menu border-t border-gray-700 hidden">
                        <a href="#" onclick="window.pageTemplate.configureWeapons()" 
                           class="block px-4 py-2 hover:bg-gray-800 text-sm">⚔️ Weapons Systems</a>
                        <a href="#" onclick="window.pageTemplate.configureCargo()" 
                           class="block px-4 py-2 hover:bg-gray-800 text-sm">📦 Cargo Options</a>
                        <a href="#" onclick="window.pageTemplate.configureShields()" 
                           class="block px-4 py-2 hover:bg-gray-800 text-sm">🛡️ Shields & Defense</a>
                        <a href="#" onclick="window.pageTemplate.configureCommunications()" 
                           class="block px-4 py-2 hover:bg-gray-800 text-sm">📡 Communications</a>
                        <div class="border-t border-gray-600 mt-2 pt-2">
                            <a href="#" onclick="window.pageTemplate.manageLoadouts()" 
                               class="block px-4 py-2 hover:bg-gray-800 text-sm font-semibold text-yellow-400">⚡ Manage Loadouts</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateShipActionsDropdown() {
        return `
            <div class="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-lg border border-gray-700">
                <div class="dropdown">
                    <button onclick="window.pageTemplate.toggleDropdown('shipActions')" 
                            class="w-full p-4 text-left flex justify-between items-center hover:bg-gray-800 transition-colors">
                        <span class="font-semibold text-green-400">🎯 Ship Actions</span>
                        <span class="text-gray-400" id="shipActionsToggle">▶</span>
                    </button>
                    <div id="shipActionsContent" class="dropdown-menu border-t border-gray-700 hidden">
                        <div class="px-4 py-2 text-xs text-gray-400 font-semibold">SCANNER OPTIONS</div>
                        <a href="#" onclick="window.pageTemplate.useSpatialScanner()" 
                           class="block px-4 py-2 hover:bg-gray-800 text-sm">🌌 Spatial Scanners</a>
                        <a href="#" onclick="window.pageTemplate.useSurfaceScanner()" 
                           class="block px-4 py-2 hover:bg-gray-800 text-sm">🏔️ Surface Scanners</a>
                        <a href="#" onclick="window.pageTemplate.useProspectingScanner()" 
                           class="block px-4 py-2 hover:bg-gray-800 text-sm">⛏️ Prospecting Scanners</a>
                        <div class="border-t border-gray-600 mt-2 pt-2">
                            <div class="px-4 py-2 text-xs text-gray-400 font-semibold">OPERATIONS</div>
                            <a href="#" onclick="window.pageTemplate.manageMovement()" 
                               class="block px-4 py-2 hover:bg-gray-800 text-sm">🚀 Movement Options</a>
                            <a href="torpedo-launch.html" class="block px-4 py-2 hover:bg-gray-800 text-sm text-red-400">🚀 Torpedo Launch</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateStationLocationsDropdown() {
        const location = this.data.location;
        const locationSpecificLinks = this.getLocationSpecificLinks();

        return `
            <div class="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-lg border border-gray-700">
                <div class="dropdown">
                    <button onclick="window.pageTemplate.toggleDropdown('stationLocations')" 
                            class="w-full p-4 text-left flex justify-between items-center hover:bg-gray-800 transition-colors">
                        <span class="font-semibold text-purple-400">🏢 ${location ? location.name : 'Station'} Locations</span>
                        <span class="text-gray-400" id="stationLocationsToggle">▶</span>
                    </button>
                    <div id="stationLocationsContent" class="dropdown-menu border-t border-gray-700 hidden">
                        <!-- Core Services (Available Everywhere) -->
                        <a href="shipyard.html" class="block px-4 py-2 hover:bg-gray-800 text-sm">🏭 Shipyard</a>
                        <a href="marketplace.html" class="block px-4 py-2 hover:bg-gray-800 text-sm">🛒 Marketplace</a>
                        <a href="trade-center.html" class="block px-4 py-2 hover:bg-gray-800 text-sm">🏦 Trading Zone</a>
                        
                        <!-- Location-Specific Services -->
                        ${locationSpecificLinks}
                        
                        <!-- Common Services -->
                        <div class="border-t border-gray-600 mt-2 pt-2">
                            <a href="specialists.html" class="block px-4 py-2 hover:bg-gray-800 text-sm">👥 State Specialists</a>
                            <a href="system-map.html" class="block px-4 py-2 hover:bg-gray-800 text-sm">🗺️ Local Maps</a>
                            <a href="mission-log.html" class="block px-4 py-2 hover:bg-gray-800 text-sm">📋 Mission Log</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateMainContentArea(title, content) {
        return `
            <div class="lg:col-span-3">
                <!-- Current View Display -->
                <div class="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-6">
                    <h2 class="text-xl font-bold mb-4 text-white">${title}</h2>
                    <div class="text-gray-300">${content}</div>
                </div>
                
                <!-- Dynamic Content Area -->
                <div id="dynamicContentArea" class="hidden bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                    <h3 id="dynamicContentTitle" class="text-lg font-bold mb-4 text-cyan-400"></h3>
                    <div id="dynamicContentBody"></div>
                </div>
            </div>
        `;
    }

    // Helper methods
    getCurrentShipName() {
        const player = this.data.player;
        if (player && player.starterShip) {
            return player.starterShip.customName || player.starterShip.name || 'Standard Explorer';
        }
        return player ? (player.currentShip || 'Standard Explorer') : 'No Ship';
    }

    getCurrentLocationName() {
        const location = this.data.location;
        return location ? location.name : 'Unknown Location';
    }

    generateShipStatusIndicators() {
        const player = this.data.player;
        const hull = player?.hullIntegrity || 100;
        const shields = player?.shieldStrength || 100;
        const fuel = player?.fuel || 75;
        const power = player?.powerLevel || 90;

        return `
            <div class="flex items-center space-x-1">
                <span class="text-gray-400">Hull:</span>
                <span class="text-cyan-400 font-semibold">${hull}%</span>
            </div>
            <div class="flex items-center space-x-1">
                <span class="text-gray-400">Shields:</span>
                <span class="text-purple-400 font-semibold">${shields}%</span>
            </div>
            <div class="flex items-center space-x-1">
                <span class="text-gray-400">Fuel:</span>
                <span class="text-orange-400 font-semibold">${fuel}%</span>
            </div>
            <div class="flex items-center space-x-1">
                <span class="text-gray-400">Power:</span>
                <span class="text-red-400 font-semibold">${power}%</span>
            </div>
        `;
    }

    generateHeaderActions() {
        return `
            <button onclick="window.pageTemplate.logout()" 
                    class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm transition-colors text-white">
                Logout
            </button>
        `;
    }

    getLocationSpecificLinks() {
        const location = this.data.location;
        if (!location) return '';

        const specialization = location.specialization;
        
        switch (specialization) {
            case 'research_and_industry':
                return `
                    <a href="#" onclick="window.pageTemplate.visitResearch()" class="block px-4 py-2 hover:bg-gray-800 text-sm">🔬 Research Lab</a>
                    <a href="#" onclick="window.pageTemplate.visitManufacturing()" class="block px-4 py-2 hover:bg-gray-800 text-sm">🏭 Manufacturing</a>
                `;
            case 'agriculture_and_food_production':
                return `
                    <a href="#" onclick="window.pageTemplate.visitAgriculture()" class="block px-4 py-2 hover:bg-gray-800 text-sm">🌱 Agricultural Center</a>
                    <a href="#" onclick="window.pageTemplate.visitNutrition()" class="block px-4 py-2 hover:bg-gray-800 text-sm">🍽️ Nutrition Center</a>
                `;
            case 'mining_and_resource_extraction':
                return `
                    <a href="#" onclick="window.pageTemplate.visitMining()" class="block px-4 py-2 hover:bg-gray-800 text-sm">⛏️ Mining Operations</a>
                    <a href="#" onclick="window.pageTemplate.visitRefinement()" class="block px-4 py-2 hover:bg-gray-800 text-sm">🔥 Refinement Complex</a>
                `;
            case 'training_hub_and_commerce':
            default:
                return `
                    <a href="#" onclick="window.pageTemplate.visitTavern()" class="block px-4 py-2 hover:bg-gray-800 text-sm">🍺 Tavern</a>
                    <a href="#" onclick="window.pageTemplate.visitGovernment()" class="block px-4 py-2 hover:bg-gray-800 text-sm">🏛️ Government Services</a>
                    <a href="#" onclick="window.pageTemplate.visitMuseum()" class="block px-4 py-2 hover:bg-gray-800 text-sm">🏛️ Museum</a>
                `;
        }
    }

    formatSpecialization(specialization) {
        return specialization
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    formatNumber(num) {
        return num.toLocaleString();
    }

    // Utility methods
    toggleDropdown(dropdownId) {
        const content = document.getElementById(`${dropdownId}Content`);
        const toggle = document.getElementById(`${dropdownId}Toggle`);
        
        if (content && toggle) {
            const isHidden = content.classList.contains('hidden');
            content.classList.toggle('hidden');
            toggle.textContent = isHidden ? '▼' : '▶';
        }
    }

    showContent(title, content) {
        const area = document.getElementById('dynamicContentArea');
        const titleEl = document.getElementById('dynamicContentTitle');
        const bodyEl = document.getElementById('dynamicContentBody');
        
        if (area && titleEl && bodyEl) {
            titleEl.textContent = title;
            bodyEl.innerHTML = content;
            area.classList.remove('hidden');
        }
    }

    refreshUI() {
        // Trigger a custom event for pages to listen to
        window.dispatchEvent(new CustomEvent('uiRefreshRequested', {
            detail: { data: this.data }
        }));
    }

    // Navigation actions (to be implemented by individual pages)
    showCargoManifest() { this.showContent('📦 Cargo Manifest', 'Cargo management interface coming soon...'); }
    showCrewInfo() { this.showContent('👥 Crew Information', 'Crew management interface coming soon...'); }
    showUpgrades() { this.showContent('⚡ Ship Upgrades', 'Upgrade management interface coming soon...'); }
    showShipLogs() { this.showContent('📋 Ship Logs', 'Ship log interface coming soon...'); }
    
    configureWeapons() { this.showContent('⚔️ Weapons Configuration', 'Weapons configuration interface coming soon...'); }
    configureCargo() { this.showContent('📦 Cargo Configuration', 'Cargo configuration interface coming soon...'); }
    configureShields() { this.showContent('🛡️ Shield Configuration', 'Shield configuration interface coming soon...'); }
    configureCommunications() { this.showContent('📡 Communications Setup', 'Communications setup interface coming soon...'); }
    manageLoadouts() { this.showContent('⚡ Loadout Management', 'Loadout management interface coming soon...'); }
    
    useSpatialScanner() { this.showContent('🌌 Spatial Scanner', 'Spatial scanning interface coming soon...'); }
    useSurfaceScanner() { this.showContent('🏔️ Surface Scanner', 'Surface scanning interface coming soon...'); }
    useProspectingScanner() { this.showContent('⛏️ Prospecting Scanner', 'Prospecting scanner interface coming soon...'); }
    manageMovement() { this.showContent('🚀 Movement Control', 'Movement control interface coming soon...'); }
    
    visitTavern() { this.showContent('🍺 The Stellar Cantina', 'Tavern interface coming soon...'); }
    visitGovernment() { this.showContent('🏛️ Government Services', 'Government services interface coming soon...'); }
    visitMuseum() { this.showContent('🏛️ Museum & History', 'Museum interface coming soon...'); }
    visitResearch() { this.showContent('🔬 Research Laboratory', 'Research lab interface coming soon...'); }
    visitManufacturing() { this.showContent('🏭 Manufacturing Center', 'Manufacturing interface coming soon...'); }
    visitAgriculture() { this.showContent('🌱 Agricultural Center', 'Agricultural center interface coming soon...'); }
    visitNutrition() { this.showContent('🍽️ Nutrition Center', 'Nutrition center interface coming soon...'); }
    visitMining() { this.showContent('⛏️ Mining Operations', 'Mining operations interface coming soon...'); }
    visitRefinement() { this.showContent('🔥 Refinement Complex', 'Refinement complex interface coming soon...'); }

    logout() {
        localStorage.removeItem('currentPlayer');
        window.location.href = 'index.html';
    }
}

// Global template instance
window.pageTemplate = new PageTemplate();

// CSS injection for consistent styling
const templateStyles = `
<style>
    /* Page Template Styles */
    .dropdown-menu {
        transition: all 0.2s ease-in-out;
    }
    
    .dropdown-menu.hidden {
        opacity: 0;
        max-height: 0;
        overflow: hidden;
    }
    
    .dropdown-menu:not(.hidden) {
        opacity: 1;
        max-height: 500px;
        overflow: visible;
    }
    
    /* Smooth hover transitions */
    .hover\\:bg-gray-800:hover {
        background-color: #1f2937;
        transition: background-color 0.15s ease-in-out;
    }
    
    /* Custom scrollbar */
    .dropdown-menu::-webkit-scrollbar {
        width: 4px;
    }
    
    .dropdown-menu::-webkit-scrollbar-track {
        background: #374151;
    }
    
    .dropdown-menu::-webkit-scrollbar-thumb {
        background: #6b7280;
        border-radius: 2px;
    }
    
    /* Status indicator animations */
    .status-indicator {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: .8;
        }
    }
    
    /* Background gradient */
    body {
        background: linear-gradient(to bottom, #0f0f23, #1a1a2e, #16213e);
        min-height: 100vh;
    }
</style>
`;

// Inject styles into page head
document.head.insertAdjacentHTML('beforeend', templateStyles);
