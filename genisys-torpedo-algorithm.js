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
    async launchGenisysTorpedo(launchData) {
        const formation = this.launchTorpedo(launchData.coordinates, launchData.playerID);
        
        // Initialize all possibilities for progressive revelation
        formation.allPossibilities = await this.generateAllPossibilities();
        formation.eliminationTimer = null;
        formation.eliminatedCount = 0;
        formation.totalPossibilities = this.countTotalPossibilities(formation.allPossibilities);
        
        // Start the progressive elimination process
        this.startProgressiveElimination(formation);
        
        return formation;
    }

    // Generate comprehensive list of all possibilities for a formation
    async generateAllPossibilities() {
        // Ensure characteristics are loaded
        if (!this.planetCharacteristics) {
            await this.loadCharacteristics();
        }

        if (this.planetCharacteristics && this.planetCharacteristics.planetCharacteristics) {
            const characteristics = this.planetCharacteristics.planetCharacteristics;
            return {
                planetTypes: characteristics.planetTypes.map(p => p.name),
                sizeClasses: characteristics.sizeClasses.map(s => s.name),
                moonCounts: characteristics.moonCounts.map(m => m.name),
                atmosphereTypes: characteristics.atmosphereTypes.map(a => a.name),
                temperatures: characteristics.temperatures.map(t => t.name),
                surfaceFeatures: characteristics.surfaceFeatures.map(sf => sf.name),
                mineralWealth: characteristics.mineralWealth.map(mw => mw.name),
                habitability: characteristics.habitability.map(h => h.name),
                magneticField: characteristics.magneticField.map(mf => mf.name),
                specialProperties: characteristics.specialProperties.map(sp => sp.name)
            };
        }

        // Fallback to hardcoded if JSON fails
        return this.getHardcodedCharacteristics();
    }

    // Load planet characteristics from JSON
    async loadCharacteristics() {
        try {
            const response = await fetch('./data/planet-characteristics.json');
            if (response.ok) {
                this.planetCharacteristics = await response.json();
                console.log('Planet characteristics loaded successfully');
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to load planet characteristics:', error);
            this.planetCharacteristics = null;
        }
    }

    // Fallback hardcoded characteristics
    getHardcodedCharacteristics() {
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
        
        // Calculate elimination strategy to end with exactly 1 item per category
        formation.eliminationPlan = this.createEliminationPlan(formation.allPossibilities);
        const totalEliminationsNeeded = formation.eliminationPlan.totalEliminations;
        
        if (totalEliminationsNeeded <= 0) {
            // Already at target state
            return;
        }
        
        // Log the elimination plan
        this.logEliminationPlan(formation.eliminationPlan);
        
        // Calculate elimination interval to spread eliminations over the remaining time
        const eliminationInterval = Math.max(1000, Math.floor(remainingTime / totalEliminationsNeeded * 0.8)); // Use 80% of time for eliminations
        
        console.log(`Starting elimination for formation ${formation.id}`);
        console.log(`Total eliminations needed: ${totalEliminationsNeeded}`);
        console.log(`Elimination interval: ${Math.round(eliminationInterval/1000)}s`);
        console.log(`Remaining time: ${Math.round(remainingTime/1000)}s`);
        
        formation.eliminationTimer = setInterval(() => {
            this.eliminateBasedOnPlan(formation);
            
            // Check if formation is complete or elimination plan is finished
            if (Date.now() >= formation.completionTime || this.isEliminationPlanComplete(formation)) {
                clearInterval(formation.eliminationTimer);
                this.completeFormation(formation.id);
            }
        }, eliminationInterval);
    }

    // Create elimination plan to end with 1 item per category
    createEliminationPlan(possibilities) {
        const plan = {
            categories: {},
            totalEliminations: 0,
            eliminationOrder: []
        };

        // Calculate how many items need to be eliminated from each category
        Object.entries(possibilities).forEach(([category, items]) => {
            const currentCount = items.length;
            const targetCount = 1;
            const eliminationsNeeded = Math.max(0, currentCount - targetCount);
            
            plan.categories[category] = {
                current: currentCount,
                target: targetCount,
                toEliminate: eliminationsNeeded,
                eliminated: 0
            };
            
            plan.totalEliminations += eliminationsNeeded;
        });

        // Create elimination order by distributing eliminations evenly
        this.generateEliminationOrder(plan);
        
        return plan;
    }

    // Generate a balanced elimination order
    generateEliminationOrder(plan) {
        const categoriesWithEliminations = Object.entries(plan.categories)
            .filter(([_, data]) => data.toEliminate > 0)
            .map(([category, data]) => ({ category, remaining: data.toEliminate }));

        // Distribute eliminations as evenly as possible
        while (categoriesWithEliminations.some(c => c.remaining > 0)) {
            categoriesWithEliminations.forEach(categoryData => {
                if (categoryData.remaining > 0) {
                    plan.eliminationOrder.push(categoryData.category);
                    categoryData.remaining--;
                }
            });
        }

        // Shuffle the order slightly for more natural feeling
        for (let i = plan.eliminationOrder.length - 1; i > 0; i--) {
            if (Math.random() < 0.3) { // 30% chance to swap
                const j = Math.floor(Math.random() * (i + 1));
                [plan.eliminationOrder[i], plan.eliminationOrder[j]] = [plan.eliminationOrder[j], plan.eliminationOrder[i]];
            }
        }
    }

    // Eliminate based on the planned order
    eliminateBasedOnPlan(formation) {
        if (!formation.eliminationPlan || formation.eliminationPlan.eliminationOrder.length === 0) {
            return;
        }

        const plan = formation.eliminationPlan;
        const currentElimination = formation.eliminatedCount || 0;
        
        if (currentElimination >= plan.eliminationOrder.length) {
            return; // Plan complete
        }

        const categoryToEliminate = plan.eliminationOrder[currentElimination];
        const categoryArray = formation.allPossibilities[categoryToEliminate];
        
        // Only eliminate if we have more than 1 item in this category
        if (categoryArray && categoryArray.length > 1) {
            const randomIndex = Math.floor(Math.random() * categoryArray.length);
            const eliminated = categoryArray.splice(randomIndex, 1)[0];
            formation.eliminatedCount = (formation.eliminatedCount || 0) + 1;
            plan.categories[categoryToEliminate].eliminated++;
            
            console.log(`Eliminated from ${categoryToEliminate}: ${eliminated} (${formation.eliminatedCount}/${plan.totalEliminations})`);
            console.log(`${categoryToEliminate} now has ${categoryArray.length} items remaining`);
            
            // Notify UI of the change if callback is set
            if (this.eliminationCallback) {
                this.eliminationCallback(formation, categoryToEliminate, eliminated);
            }
        }
        
        // Save updated formation
        this.saveFormations();
    }

    // Log elimination plan for debugging
    logEliminationPlan(plan) {
        console.log('\n=== ELIMINATION PLAN ===');
        Object.entries(plan.categories).forEach(([category, data]) => {
            console.log(`${category}: ${data.current} → ${data.target} (eliminate ${data.toEliminate})`);
        });
        console.log(`Total eliminations: ${plan.totalEliminations}`);
        console.log(`Elimination order: ${plan.eliminationOrder.slice(0, 10).join(', ')}${plan.eliminationOrder.length > 10 ? '...' : ''}`);
        console.log('========================\n');
    }

    // Check if elimination plan is complete
    isEliminationPlanComplete(formation) {
        if (!formation.eliminationPlan) return true;
        
        return (formation.eliminatedCount || 0) >= formation.eliminationPlan.totalEliminations;
    }

    // Set a callback for UI updates when characteristics are eliminated
    setEliminationCallback(callback) {
        this.eliminationCallback = callback;
    }

    // Get effects for a specific characteristic
    getCharacteristicEffects(category, characteristicName) {
        if (!this.planetCharacteristics || !this.planetCharacteristics.planetCharacteristics) {
            return null;
        }

        const characteristics = this.planetCharacteristics.planetCharacteristics;
        const categoryData = characteristics[category];
        
        if (!categoryData) return null;
        
        const characteristic = categoryData.find(item => item.name === characteristicName);
        return characteristic ? characteristic.effects : null;
    }

    // Get effect descriptions
    getEffectDescription(effectType, effectName) {
        if (!this.planetCharacteristics || !this.planetCharacteristics.effectDescriptions) {
            return `${effectName} (no description available)`;
        }

        const descriptions = this.planetCharacteristics.effectDescriptions[effectType];
        return descriptions && descriptions[effectName] ? 
            descriptions[effectName] : 
            `${effectName} (description not found)`;
    }

    // Get all effects for a formed planet
    getPlanetEffects(planet) {
        const allEffects = {
            playerEffects: [],
            atmosphereEffects: [],
            spatialEffects: [],
            timeEffects: []
        };

        // Collect effects from all characteristics
        const characteristics = {
            planetTypes: planet.type,
            sizeClasses: planet.size,
            moonCounts: planet.moons?.toString() + ' moons',
            atmosphereTypes: planet.atmosphere,
            temperatures: planet.temperature,
            surfaceFeatures: planet.surfaceFeature,
            mineralWealth: planet.mineralWealth,
            habitability: planet.habitability,
            magneticField: planet.magneticField,
            specialProperties: planet.specialProperty
        };

        Object.entries(characteristics).forEach(([category, value]) => {
            if (value) {
                const effects = this.getCharacteristicEffects(category, value);
                if (effects) {
                    Object.entries(effects).forEach(([effectType, effectList]) => {
                        if (allEffects[effectType] && Array.isArray(effectList)) {
                            allEffects[effectType].push(...effectList);
                        }
                    });
                }
            }
        });

        return allEffects;
    }

    // ========================================
    // FORMATION COMPLETION
    // ========================================
    completeFormation(formationId) {
        const formation = this.activeFormations.get(formationId);
        if (!formation) return;
        
        // Generate the planet system based on remaining possibilities
        formation.planet = this.generatePlanetFromPossibilities(formation.allPossibilities);
        formation.status = 'COMPLETE';
        
        // Calculate effects for the formed planet
        formation.planet.effects = this.getPlanetEffects(formation.planet);
        
        // Save to localStorage
        this.saveFormations();
        
        console.log(`Formation ${formationId} completed!`, formation.planet);
    }

    // Generate planet based on remaining possibilities
    generatePlanetFromPossibilities(possibilities) {
        const planet = {
            name: this.generatePlanetName(),
            type: this.selectRandomFromArray(possibilities.planetTypes),
            size: this.selectRandomFromArray(possibilities.sizeClasses),
            moons: this.selectRandomFromArray(possibilities.moonCounts),
            atmosphere: this.selectRandomFromArray(possibilities.atmosphereTypes),
            temperature: this.selectRandomFromArray(possibilities.temperatures),
            surfaceFeature: this.selectRandomFromArray(possibilities.surfaceFeatures),
            mineralWealth: this.selectRandomFromArray(possibilities.mineralWealth),
            habitability: this.selectRandomFromArray(possibilities.habitability),
            magneticField: this.selectRandomFromArray(possibilities.magneticField),
            specialProperty: this.selectRandomFromArray(possibilities.specialProperties),
            diameter: 1000 + Math.floor(Math.random() * 49000), // 1000-50000 km
            elements: this.generateElements()
        };
        
        return planet;
    }

    // Helper to select random item from array
    selectRandomFromArray(array) {
        if (!array || array.length === 0) return 'Unknown';
        return array[Math.floor(Math.random() * array.length)];
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