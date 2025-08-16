// Location and Travel System for Space Explorer
// Handles player location, docking status, and travel between locations

class LocationTravelSystem {
    constructor() {
        this.locations = {
            'space-station-nexus': {
                id: 'space-station-nexus',
                name: 'Space Station Nexus',
                type: 'space_station',
                description: 'The central hub of the Keldar system, orbiting the main planet.',
                services: ['marketplace', 'shipyard', 'refinery', 'specialists', 'appraisal'],
                canDock: true,
                coordinates: { x: 0, y: 0, z: 1000 }
            },
            'keldar-prime': {
                id: 'keldar-prime',
                name: 'Keldar Prime (Planet Surface)',
                type: 'planet',
                description: 'The main planet surface with rich mineral deposits and atmospheric mining opportunities.',
                services: ['marketplace', 'outpost', 'appraisal', 'basic_refinery'],
                canDock: true,
                coordinates: { x: 0, y: 0, z: 0 },
                miningData: {
                    primaryElements: ['iron', 'copper', 'aluminum', 'silicon'],
                    rareElements: ['gold', 'platinum', 'uranium'],
                    abundance: 'high',
                    difficulty: 'medium'
                }
            },
            'moon-aurora': {
                id: 'moon-aurora',
                name: 'Aurora (Moon 1)',
                type: 'moon',
                description: 'Ice-rich moon with unique crystalline formations and rare gas deposits.',
                services: ['moon_base', 'appraisal', 'storage'],
                canDock: true,
                coordinates: { x: -500, y: 300, z: 100 },
                miningData: {
                    primaryElements: ['hydrogen', 'helium', 'oxygen', 'nitrogen'],
                    rareElements: ['xenon', 'krypton', 'radon'],
                    abundance: 'medium',
                    difficulty: 'easy',
                    specialty: 'gases'
                }
            },
            'moon-titan': {
                id: 'moon-titan',
                name: 'Titan (Moon 2)',
                type: 'moon',
                description: 'Heavy industrial moon with dense metallic core and established mining operations.',
                services: ['moon_base', 'appraisal', 'industrial_refinery'],
                canDock: true,
                coordinates: { x: 600, y: -200, z: 200 },
                miningData: {
                    primaryElements: ['titanium', 'tungsten', 'molybdenum', 'vanadium'],
                    rareElements: ['rhodium', 'palladium', 'iridium'],
                    abundance: 'very_high',
                    difficulty: 'hard',
                    specialty: 'heavy_metals'
                }
            },
            'moon-crystal': {
                id: 'moon-crystal',
                name: 'Crystal Moon (Moon 3)',
                type: 'moon',
                description: 'Crystalline formations contain rare earth elements and exotic materials.',
                services: ['moon_base', 'appraisal', 'specialized_refinery'],
                canDock: true,
                coordinates: { x: -300, y: -400, z: 150 },
                miningData: {
                    primaryElements: ['lithium', 'beryllium', 'boron', 'carbon'],
                    rareElements: ['neodymium', 'europium', 'terbium'],
                    abundance: 'low',
                    difficulty: 'very_hard',
                    specialty: 'rare_earth'
                }
            },
            'open-space': {
                id: 'open-space',
                name: 'Open Space',
                type: 'space',
                description: 'Drifting in the void between celestial bodies.',
                services: [],
                canDock: false,
                coordinates: { x: 0, y: 0, z: 500 }
            }
        };

        this.playerLocation = 'space-station-nexus';
        this.playerDocked = true;
        this.travelInProgress = false;
    }

    // Get current player location data
    getCurrentLocation() {
        return this.locations[this.playerLocation];
    }

    // Get all available locations for travel
    getAvailableDestinations() {
        return Object.values(this.locations).filter(location => 
            location.id !== this.playerLocation && location.canDock
        );
    }

    // Check if player is currently docked
    isDocked() {
        return this.playerDocked;
    }

    // Check if player is in open space
    isInOpenSpace() {
        return this.playerLocation === 'open-space';
    }

    // Lift off from current docked location into open space
    liftOff() {
        if (!this.playerDocked) {
            throw new Error('Cannot lift off - ship is not currently docked');
        }

        if (this.travelInProgress) {
            throw new Error('Cannot lift off - travel already in progress');
        }

        this.playerDocked = false;
        this.playerLocation = 'open-space';
        
        return {
            success: true,
            message: `Lifted off into open space`,
            newLocation: this.getCurrentLocation(),
            status: 'in_space'
        };
    }

    // Travel to a specific location
    travelTo(destinationId) {
        const destination = this.locations[destinationId];
        
        if (!destination) {
            throw new Error(`Invalid destination: ${destinationId}`);
        }

        if (!destination.canDock) {
            throw new Error(`Cannot dock at ${destination.name}`);
        }

        if (this.travelInProgress) {
            throw new Error('Travel already in progress');
        }

        if (this.playerLocation === destinationId) {
            throw new Error('Already at that location');
        }

        // Simulate instantaneous travel for now
        this.travelInProgress = true;
        
        // If currently docked, lift off first
        if (this.playerDocked) {
            this.playerDocked = false;
        }

        // Travel and dock at destination
        this.playerLocation = destinationId;
        this.playerDocked = true;
        this.travelInProgress = false;

        return {
            success: true,
            message: `Traveled to ${destination.name} and docked successfully`,
            newLocation: this.getCurrentLocation(),
            status: 'docked'
        };
    }

    // Get services available at current location
    getAvailableServices() {
        const currentLocation = this.getCurrentLocation();
        return currentLocation.services || [];
    }

    // Check if a specific service is available at current location
    hasService(serviceName) {
        return this.getAvailableServices().includes(serviceName);
    }

    // Get mining data for current location (if applicable)
    getMiningData() {
        const currentLocation = this.getCurrentLocation();
        return currentLocation.miningData || null;
    }

    // Get detailed location status for UI
    getLocationStatus() {
        const currentLocation = this.getCurrentLocation();
        return {
            location: currentLocation,
            docked: this.playerDocked,
            inSpace: this.isInOpenSpace(),
            availableDestinations: this.getAvailableDestinations(),
            availableServices: this.getAvailableServices(),
            miningData: this.getMiningData(),
            canLiftOff: this.playerDocked,
            travelInProgress: this.travelInProgress
        };
    }

    // Calculate travel time (for future use when we add travel mechanics)
    calculateTravelTime(destinationId) {
        const destination = this.locations[destinationId];
        const currentLocation = this.getCurrentLocation();
        
        if (!destination || !currentLocation.coordinates) {
            return 0; // Instantaneous for now
        }

        // Calculate distance (for future travel time mechanics)
        const dx = destination.coordinates.x - currentLocation.coordinates.x;
        const dy = destination.coordinates.y - currentLocation.coordinates.y;
        const dz = destination.coordinates.z - currentLocation.coordinates.z;
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        // For now, return 0 (instantaneous), but this could be used later
        return 0;
    }

    // Save current location state
    saveLocationState() {
        return {
            playerLocation: this.playerLocation,
            playerDocked: this.playerDocked,
            timestamp: Date.now()
        };
    }

    // Load location state
    loadLocationState(state) {
        if (state && state.playerLocation && this.locations[state.playerLocation]) {
            this.playerLocation = state.playerLocation;
            this.playerDocked = state.playerDocked !== undefined ? state.playerDocked : true;
        }
    }

    // Get location for display in UI
    getLocationDisplayInfo() {
        const currentLocation = this.getCurrentLocation();
        const status = this.playerDocked ? 'Docked' : 'In Space';
        
        return {
            name: currentLocation.name,
            type: currentLocation.type,
            description: currentLocation.description,
            status: status,
            statusIcon: this.playerDocked ? '🔗' : '🚀',
            coordinates: currentLocation.coordinates
        };
    }
}

// Initialize the location travel system
if (typeof window !== 'undefined') {
    window.LocationTravelSystem = LocationTravelSystem;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocationTravelSystem;
}
