// ========================================
// GENISYS TORPEDO ALGORITHM SYSTEM
// Solar Dynamics Corporation
// ========================================

class GenisysTorpedoSystem {
    constructor() {
        // Basic elements for planet generation
        this.elements = [
            'Iron', 'Carbon', 'Silicon', 'Aluminum', 'Oxygen', 'Nitrogen', 'Hydrogen',
            'Titanium', 'Copper', 'Gold', 'Silver', 'Platinum', 'Uranium', 'Lithium',
            'Nickel', 'Zinc', 'Lead', 'Tungsten', 'Chromium', 'Cobalt'
        ];

        // Planet types
        this.planetTypes = {
            ROCKY: 'Rocky',
            GAS_GIANT: 'Gas Giant',
            ICE: 'Ice',
            VOLCANIC: 'Volcanic',
            EARTH_LIKE: 'Earth-like',
            DESERT: 'Desert'
        };

        // Active formations storage
        this.activeFormations = new Map();
        
        // Coordinate system configuration
        this.coordinateSystem = {
            // Starting position for new players
            startingPosition: { x: 0, y: 0, z: 0 },
            
            // Maximum coordinate range (expandable)
            bounds: {
                min: { x: -1000, y: -1000, z: -1000 },
                max: { x: 1000, y: 1000, z: 1000 }
            }
        };
        
        // Storage key for persistent formations
        this.storageKey = 'genisys_formations';
        
        // Load existing formations from localStorage
        this.loadFormations();
        
        // Resume any incomplete formations
        this.resumeFormations();
    }

    // ========================================
    // MAIN TORPEDO LAUNCH FUNCTION
    // ========================================
    launchTorpedo(coordinates, playerID) {
        // Validate coordinates first
        const validation = this.validateCoordinates(coordinates);
        if (!validation.valid) {
            throw new Error(`Invalid coordinates: ${validation.error}`);
        }
        
        // Check if coordinates are already occupied
        const occupied = this.getOccupiedCoordinates();
        const isOccupied = occupied.some(coord => 
            coord.x === coordinates.x && 
            coord.y === coordinates.y && 
            coord.z === coordinates.z
        );
        
        if (isOccupied) {
            throw new Error('Coordinates already occupied by another formation');
        }
        
        const launchTime = Date.now();
        const formationId = `formation_${playerID}_${coordinates.x}_${coordinates.y}_${coordinates.z}_${launchTime}`;
        
        // Formation time: 2 minutes exactly (120 seconds = 120,000 milliseconds)
        const formationDuration = 2 * 60 * 1000; // 2 minutes
        const completionTime = launchTime + formationDuration;
        
        // Create formation record
        const formation = {
            id: formationId,
            playerID: playerID,
            coordinates: coordinates,
            launchTime: launchTime,
            completionTime: completionTime,
            cooldownDuration: formationDuration, // Add this property for UI compatibility
            status: 'FORMING',
            planet: null, // Will be generated when formation completes
            neighbors: this.getNeighborCoordinates(coordinates) // Store neighbor info
        };
        
        // Store in active formations
        this.activeFormations.set(formationId, formation);
        
        // Save to localStorage for persistence
        this.saveFormations();
        
        // Set timer to complete formation
        setTimeout(() => {
            this.completeFormation(formationId);
        }, formationDuration);
        
        return formation;
    }

    // Legacy method for compatibility with torpedo-launch.html
    launchGenisysTorpedo(launchData) {
        const formation = this.launchTorpedo(launchData.coordinates, launchData.playerID);
        
        // Initialize all possibilities for progressive revelation
        formation.allPossibilities = this.generateAllPossibilities();
        formation.eliminationTimer = null;
        formation.eliminatedCount = 0;
        formation.totalPossibilities = this.countTotalPossibilities(formation.allPossibilities);
        
        // Start the progressive elimination process
        this.startProgressiveElimination(formation);
        
        return formation;
    }

    // Generate comprehensive list of all possibilities for a formation
    generateAllPossibilities() {
        return {
            planetTypes: [
                'Rocky', 'Gas Giant', 'Ice World', 'Volcanic', 'Earth-like', 'Desert', 
                'Ocean World', 'Lava Planet', 'Crystal World', 'Metal Core', 'Frozen Gas', 
                'Radioactive', 'Plasma Storm', 'Dark Matter', 'Quantum Fluctuation'
            ],
            sizeClasses: [
                'Asteroid (100-500 km)', 'Dwarf Planet (500-2000 km)', 
                'Small Planet (2000-8000 km)', 'Medium Planet (8000-15000 km)',
                'Large Planet (15000-30000 km)', 'Super Planet (30000-50000 km)',
                'Gas Dwarf (5000-12000 km)', 'Gas Giant (20000-80000 km)',
                'Super Giant (80000+ km)'
            ],
            moonCounts: ['0 moons', '1 moon', '2-3 moons', '4-6 moons', '7-12 moons', '13-25 moons', '26-50 moons'],
            atmosphereTypes: [
                'None (Vacuum)', 'Thin Oxygen', 'Dense Oxygen', 'Methane', 'Ammonia',
                'Carbon Dioxide', 'Hydrogen', 'Noble Gases', 'Toxic Sulfur',
                'Corrosive Acid', 'Plasma Field', 'Quantum Mist', 'Dark Energy'
            ],
            temperatures: [
                'Absolute Zero (-273°C)', 'Frozen (-200 to -100°C)', 'Cold (-100 to 0°C)',
                'Temperate (0 to 50°C)', 'Hot (50 to 200°C)', 'Scorching (200 to 1000°C)',
                'Molten (1000 to 5000°C)', 'Plasma (5000°C+)', 'Solar Core (Millions°C)'
            ],
            surfaceFeatures: [
                'Smooth Plains', 'Mountain Ranges', 'Deep Canyons', 'Crater Fields',
                'Volcanic Activity', 'Ice Caps', 'Liquid Oceans', 'Methane Lakes',
                'Crystal Formations', 'Metal Veins', 'Floating Islands', 'Quantum Rifts',
                'Temporal Anomalies', 'Gravity Wells', 'Energy Storms'
            ],
            mineralWealth: [
                'Barren', 'Poor', 'Modest', 'Moderate', 'Rich', 'Very Rich', 
                'Extremely Rich', 'Legendary Deposits', 'Exotic Materials', 'Unique Elements'
            ],
            habitability: [
                'Completely Hostile', 'Barely Survivable', 'Harsh Environment',
                'Challenging', 'Liveable with Equipment', 'Naturally Habitable',
                'Paradise World', 'Utopian Conditions'
            ],
            magneticField: [
                'None', 'Weak', 'Moderate', 'Strong', 'Extreme', 'Fluctuating',
                'Reversed Polarity', 'Multi-Polar', 'Quantum Entangled'
            ],
            orbitalCharacteristics: [
                'Stable Circular', 'Elliptical', 'Highly Eccentric', 'Retrograde',
                'Tidally Locked', 'Wobbling Axis', 'Binary System', 'Trojan Orbit',
                'Lagrange Point', 'Unstable Decay'
            ],
            specialProperties: [
                'Standard Physics', 'Time Dilation Effects', 'Gravity Anomalies',
                'Dimensional Rifts', 'Quantum Tunneling', 'Anti-Matter Traces',
                'Dark Matter Influence', 'Psionic Resonance', 'Life Signs',
                'Ancient Artifacts', 'Energy Beings', 'Sentient Planet'
            ]
        };
    }

    // Count total possibilities across all categories
    countTotalPossibilities(possibilities) {
        let total = 0;
        Object.values(possibilities).forEach(category => {
            total += category.length;
        });
        return total;
    }

    // Start progressive elimination of possibilities
    startProgressiveElimination(formation) {
        // Clear any existing timer first
        if (formation.eliminationTimer) {
            clearInterval(formation.eliminationTimer);
        }
        
        const currentTime = Date.now();
        const remainingTime = formation.completionTime - currentTime;
        
        // Don't start if formation is already complete or should be complete
        if (remainingTime <= 0) return;
        
        const remainingPossibilities = formation.totalPossibilities - (formation.eliminatedCount || 0);
        if (remainingPossibilities <= 10) return; // Keep at least 10 possibilities
        
        // Much faster elimination - eliminate every 2-5 seconds instead of spreading over entire duration
        const eliminationInterval = 2000 + Math.random() * 3000; // 2-5 seconds between eliminations
        
        console.log(`Starting elimination for formation ${formation.id}`);
        console.log(`Remaining time: ${Math.round(remainingTime/1000)}s, Eliminating every ${Math.round(eliminationInterval/1000)}s`);
        
        formation.eliminationTimer = setInterval(() => {
            this.eliminateRandomPossibility(formation);
            
            // Check if formation is complete
            if (Date.now() >= formation.completionTime) {
                clearInterval(formation.eliminationTimer);
                this.completeFormation(formation.id);
            }
        }, eliminationInterval);
    }

    // Eliminate a random possibility from the list
    eliminateRandomPossibility(formation) {
        if (formation.eliminatedCount >= formation.totalPossibilities) return;
        
        // Find categories that still have items to eliminate
        const availableCategories = Object.keys(formation.allPossibilities).filter(
            category => formation.allPossibilities[category].length > 1
        );
        
        if (availableCategories.length === 0) return;
        
        // Sometimes eliminate multiple possibilities at once for more dramatic effect
        const eliminationCount = Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 2 : 1; // 30% chance to eliminate 2-4 at once
        
        for (let i = 0; i < eliminationCount; i++) {
            // Re-check available categories each iteration
            const currentAvailableCategories = Object.keys(formation.allPossibilities).filter(
                category => formation.allPossibilities[category].length > 1
            );
            
            if (currentAvailableCategories.length === 0) break;
            
            // Pick a random category
            const category = currentAvailableCategories[Math.floor(Math.random() * currentAvailableCategories.length)];
            const categoryArray = formation.allPossibilities[category];
            
            // Remove a random item from that category (but keep at least one)
            if (categoryArray.length > 1) {
                const randomIndex = Math.floor(Math.random() * categoryArray.length);
                const eliminated = categoryArray.splice(randomIndex, 1)[0];
                formation.eliminatedCount++;
                
                console.log(`Eliminated from ${category}: ${eliminated} (${formation.eliminatedCount}/${formation.totalPossibilities})`);
                
                // Stop if we've eliminated enough to keep some mystery
                if (formation.eliminatedCount >= formation.totalPossibilities - 15) break;
            }
        }
        
        // Save updated formation
        this.saveFormations();
    }

    // ========================================
    // FORMATION COMPLETION
    // ========================================
    completeFormation(formationId) {
        const formation = this.activeFormations.get(formationId);
        if (!formation) return;
        
        // Generate the planet system
        formation.planet = this.generatePlanet();
        formation.status = 'COMPLETE';
        
        // Save to localStorage
        this.saveFormations();
        
        console.log(`Formation ${formationId} completed!`, formation.planet);
    }

    // ========================================
    // PLANET GENERATION
    // ========================================
    generatePlanet() {
        const planetTypes = Object.values(this.planetTypes);
        const type = planetTypes[Math.floor(Math.random() * planetTypes.length)];
        
        const planet = {
            name: this.generatePlanetName(),
            type: type,
            diameter: 1000 + Math.floor(Math.random() * 49000), // 1000-50000 km
            moons: this.generateMoons(),
            elements: this.generateElements(),
            temperature: this.generateTemperature(type),
            atmosphere: this.generateAtmosphere(type),
            features: this.generateFeatures(type)
        };
        
        return planet;
    }

    generatePlanetName() {
        const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Nova', 'Stellar', 'Cosmic', 'Orbital'];
        const suffixes = ['Prime', 'Major', 'Minor', 'Central', 'Core', 'Edge', 'Rim', 'Base'];
        const numbers = Math.floor(Math.random() * 999) + 1;
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        
        return `${prefix} ${suffix} ${numbers}`;
    }

    generateMoons() {
        const moonCount = Math.floor(Math.random() * 5); // 0-4 moons
        const moons = [];
        
        for (let i = 0; i < moonCount; i++) {
            moons.push({
                name: `Moon ${i + 1}`,
                diameter: 100 + Math.floor(Math.random() * 2000), // 100-2100 km
                elements: this.generateElements(5) // Fewer elements on moons
            });
        }
        
        return moons;
    }

    generateElements(maxCount = 10) {
        const count = 3 + Math.floor(Math.random() * (maxCount - 2)); // 3 to maxCount elements
        const selectedElements = [];
        
        for (let i = 0; i < count; i++) {
            const element = this.elements[Math.floor(Math.random() * this.elements.length)];
            if (!selectedElements.includes(element)) {
                selectedElements.push(element);
            }
        }
        
        return selectedElements;
    }

    generateTemperature(type) {
        const baseTemps = {
            'Rocky': 20,
            'Gas Giant': -150,
            'Ice': -40,
            'Volcanic': 80,
            'Earth-like': 15,
            'Desert': 45
        };
        
        const base = baseTemps[type] || 0;
        return base + (Math.random() - 0.5) * 50; // ±25 degree variation
    }

    generateAtmosphere(type) {
        const atmospheres = {
            'Rocky': ['Thin Carbon Dioxide'],
            'Gas Giant': ['Hydrogen', 'Helium'],
            'Ice': ['Methane', 'Nitrogen'],
            'Volcanic': ['Sulfur Dioxide', 'Ash'],
            'Earth-like': ['Nitrogen', 'Oxygen'],
            'Desert': ['Thin Atmosphere', 'Carbon Dioxide']
        };
        
        return atmospheres[type] || ['Unknown Atmosphere'];
    }

    generateFeatures(type) {
        const features = {
            'Rocky': ['Craters', 'Mountains', 'Canyons'],
            'Gas Giant': ['Storm Systems', 'Cloud Bands'],
            'Ice': ['Frozen Seas', 'Ice Sheets'],
            'Volcanic': ['Active Volcanoes', 'Lava Fields'],
            'Earth-like': ['Oceans', 'Continents', 'Forests'],
            'Desert': ['Sand Dunes', 'Rock Formations']
        };
        
        return features[type] || ['Unknown Terrain'];
    }

    // ========================================
    // FORMATION MANAGEMENT
    // ========================================
    getActiveFormations(playerID) {
        const playerFormations = [];
        for (const formation of this.activeFormations.values()) {
            if (formation.playerID === playerID) {
                playerFormations.push(formation);
            }
        }
        return playerFormations;
    }

    getFormation(formationId) {
        return this.activeFormations.get(formationId);
    }

    isFormationComplete(formationId) {
        const formation = this.activeFormations.get(formationId);
        return formation && formation.status === 'COMPLETE';
    }

    getFormationProgress(formationId) {
        const formation = this.activeFormations.get(formationId);
        if (!formation) return 0;
        
        const now = Date.now();
        const elapsed = now - formation.launchTime;
        const total = formation.completionTime - formation.launchTime;
        
        return Math.min(100, (elapsed / total) * 100);
    }

    // Stub method for compatibility - scanning not implemented in simplified version
    performScan(formation, scanType, scanCost) {
        return {
            error: 'Scanning system not available in simplified version',
            scanType: scanType,
            cost: scanCost,
            timestamp: Date.now()
        };
    }

    // ========================================
    // COORDINATE SYSTEM - CUBIC GRID
    // ========================================
    
    // Validate coordinates are within bounds and integers
    validateCoordinates(coords) {
        const { x, y, z } = coords;
        const { min, max } = this.coordinateSystem.bounds;
        
        // Must be integers
        if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(z)) {
            return { valid: false, error: 'Coordinates must be integers' };
        }
        
        // Must be within bounds
        if (x < min.x || x > max.x || y < min.y || y > max.y || z < min.z || z > max.z) {
            return { valid: false, error: 'Coordinates out of bounds' };
        }
        
        return { valid: true };
    }
    
    // Get all 26 neighboring coordinates (3³ - 1 = 26)
    getNeighborCoordinates(coords) {
        const neighbors = [];
        const { x, y, z } = coords;
        
        // Generate all combinations of -1, 0, +1 for each axis
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dz = -1; dz <= 1; dz++) {
                    // Skip the center point (0,0,0 offset)
                    if (dx === 0 && dy === 0 && dz === 0) continue;
                    
                    const neighbor = {
                        x: x + dx,
                        y: y + dy,
                        z: z + dz,
                        distance: this.calculateDistance(coords, { x: x + dx, y: y + dy, z: z + dz }),
                        neighborType: this.getNeighborType(dx, dy, dz)
                    };
                    
                    // Only include if within bounds
                    if (this.validateCoordinates(neighbor).valid) {
                        neighbors.push(neighbor);
                    }
                }
            }
        }
        
        return neighbors;
    }
    
    // Classify neighbor types for gameplay mechanics
    getNeighborType(dx, dy, dz) {
        const offsets = Math.abs(dx) + Math.abs(dy) + Math.abs(dz);
        
        if (offsets === 1) return 'ADJACENT'; // Face neighbors (6 total)
        if (offsets === 2) return 'EDGE';     // Edge neighbors (12 total)
        if (offsets === 3) return 'CORNER';   // Corner neighbors (8 total)
        
        return 'UNKNOWN';
    }
    
    // Calculate 3D distance between two coordinates
    calculateDistance(coord1, coord2) {
        const dx = coord2.x - coord1.x;
        const dy = coord2.y - coord1.y;
        const dz = coord2.z - coord1.z;
        
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    // Get next available coordinate for exploration
    getNextExplorationTarget(currentCoords, excludeCoords = []) {
        const neighbors = this.getNeighborCoordinates(currentCoords);
        
        // Filter out coordinates that are already explored/occupied
        const available = neighbors.filter(neighbor => {
            return !excludeCoords.some(excluded => 
                excluded.x === neighbor.x && 
                excluded.y === neighbor.y && 
                excluded.z === neighbor.z
            );
        });
        
        if (available.length === 0) {
            return null; // No available neighbors
        }
        
        // Sort by preference: ADJACENT > EDGE > CORNER
        available.sort((a, b) => {
            const priority = { 'ADJACENT': 3, 'EDGE': 2, 'CORNER': 1 };
            return priority[b.neighborType] - priority[a.neighborType];
        });
        
        return available[0];
    }
    
    // Check if two coordinates are neighbors
    areNeighbors(coord1, coord2) {
        const distance = this.calculateDistance(coord1, coord2);
        return distance <= Math.sqrt(3); // Maximum distance for corner neighbors
    }
    
    // Get occupied coordinates from formations
    getOccupiedCoordinates(playerID = null) {
        const occupied = [];
        
        for (const formation of this.activeFormations.values()) {
            if (!playerID || formation.playerID === playerID) {
                occupied.push(formation.coordinates);
            }
        }
        
        return occupied;
    }
    
    // Suggest next torpedo launch coordinates
    suggestNextCoordinates(playerID) {
        const occupied = this.getOccupiedCoordinates(playerID);
        
        if (occupied.length === 0) {
            // First torpedo - suggest starting position
            return this.coordinateSystem.startingPosition;
        }
        
        // Find the best expansion point from existing formations
        for (const coords of occupied) {
            const next = this.getNextExplorationTarget(coords, occupied);
            if (next) {
                return { x: next.x, y: next.y, z: next.z };
            }
        }
        
        // If no neighbors available, suggest a random nearby coordinate
        const lastCoord = occupied[occupied.length - 1];
        return {
            x: lastCoord.x + (Math.random() > 0.5 ? 1 : -1),
            y: lastCoord.y + (Math.random() > 0.5 ? 1 : -1),
            z: lastCoord.z + (Math.random() > 0.5 ? 1 : -1)
        };
    }

    // ========================================
    // PERSISTENCE SYSTEM
    // ========================================
    
    // Save formations to localStorage
    saveFormations() {
        const formationsArray = [];
        for (const formation of this.activeFormations.values()) {
            formationsArray.push(formation);
        }
        localStorage.setItem(this.storageKey, JSON.stringify(formationsArray));
    }
    
    // Load formations from localStorage
    loadFormations() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const formations = JSON.parse(saved);
                formations.forEach(formation => {
                    this.activeFormations.set(formation.id, formation);
                });
                console.log(`Loaded ${formations.length} formations from storage`);
            }
        } catch (error) {
            console.error('Error loading formations:', error);
        }
    }
    
    // Resume incomplete formations after page reload
    resumeFormations() {
        const now = Date.now();
        
        for (const formation of this.activeFormations.values()) {
            if (formation.status === 'FORMING') {
                if (now >= formation.completionTime) {
                    // Formation should have completed while away
                    this.completeFormation(formation.id);
                } else {
                    // Still forming - set timer for remaining time
                    const remainingTime = formation.completionTime - now;
                    setTimeout(() => {
                        this.completeFormation(formation.id);
                    }, remainingTime);
                    
                    // Restart progressive elimination if formation has possibilities
                    if (formation.allPossibilities && formation.totalPossibilities) {
                        this.startProgressiveElimination(formation);
                    }
                    
                    console.log(`Resumed formation ${formation.id}, ${Math.round(remainingTime/1000)}s remaining`);
                }
            }
        }
        
        // Save any updates
        this.saveFormations();
    }
    
    // Clean up old completed formations (optional maintenance)
    cleanupOldFormations(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
        const now = Date.now();
        let cleaned = 0;
        
        for (const [id, formation] of this.activeFormations.entries()) {
            if (formation.status === 'COMPLETE' && 
                (now - formation.completionTime) > maxAge) {
                this.activeFormations.delete(id);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            this.saveFormations();
            console.log(`Cleaned up ${cleaned} old formations`);
        }
    }
    
    clearAllFormations() {
        console.log('Clearing all formations from torpedo system...');
        
        // Clear both the formations array AND the activeFormations Map
        this.formations = [];
        this.activeFormations.clear();
        
        // Clear from localStorage using the correct storage key
        localStorage.removeItem(this.storageKey);
        localStorage.setItem(this.storageKey, '[]');
        
        // Also save formations to ensure persistence
        this.saveFormations();
        
        console.log('All formations cleared from torpedo system and localStorage');
        console.log('Formations array length:', this.formations.length);
        console.log('ActiveFormations Map size:', this.activeFormations.size);
        return true;
    }
}

// Export for use in game
if (typeof window !== 'undefined') {
    window.GenisysTorpedoSystem = GenisysTorpedoSystem;
}