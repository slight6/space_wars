// ========================================
// GENISYS TORPEDO ALGORITHM SYSTEM
// Solar Dynamics Corporation
// ========================================

class GenisysTorpedoSystem {
    constructor() {
        // Data will be loaded dynamically from torpedo-system-config.json
        this.elements = [];
        this.planetTypes = {};
        this.planetCharacteristics = {};
        this.coordinateSystem = {};
        this.formationSettings = {};
        
        // Active formations storage
        this.activeFormations = new Map();
        
        // Storage key for persistent formations
        this.storageKey = 'genisys_formations';
        
        // Initialize the system
        this.initialize();
    }

    async initialize() {
        try {
            // Load configuration data
            await this.loadConfigData();
            
            // Try to load custom configuration (overrides defaults)
            this.loadCustomConfiguration();
            
            // Load existing formations from localStorage
            this.loadFormations();
            
            // Resume any incomplete formations
            this.resumeFormations();
            
            console.log('🚀 GenisysTorpedoSystem initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing GenisysTorpedoSystem:', error);
            // Load fallback data if config fails
            this.loadFallbackData();
        }
    }

    async loadConfigData() {
        if (window.DataLoader) {
            const config = await window.DataLoader.loadData('torpedo-system-config.json');
            this.elements = config.elements || [];
            this.planetTypes = config.planetTypes || {};
            this.planetCharacteristics = config.planetCharacteristics || {};
            this.coordinateSystem = config.coordinateSystem || {};
            this.formationSettings = config.formationSettings || {};
            
            console.log('✅ Torpedo system configuration loaded from JSON');
        } else {
            throw new Error('DataLoader not available');
        }
    }

    loadFallbackData() {
        console.log('⚠️ Loading fallback torpedo system data');
        
        // Basic elements for planet generation (fallback)
        this.elements = [
            'Iron', 'Carbon', 'Silicon', 'Aluminum', 'Oxygen', 'Nitrogen', 'Hydrogen',
            'Titanium', 'Copper', 'Gold', 'Silver', 'Platinum', 'Uranium', 'Lithium',
            'Nickel', 'Zinc', 'Lead', 'Tungsten', 'Chromium', 'Cobalt'
        ];

        // Planet types (fallback)
        this.planetTypes = {
            ROCKY: 'Rocky',
            GAS_GIANT: 'Gas Giant',
            ICE: 'Ice',
            VOLCANIC: 'Volcanic',
            EARTH_LIKE: 'Earth-like',
            DESERT: 'Desert'
        };
        
        // Coordinate system configuration (fallback)
        this.coordinateSystem = {
            startingPosition: { x: 0, y: 0, z: 0 },
            bounds: {
                min: { x: -1000, y: -1000, z: -1000 },
                max: { x: 1000, y: 1000, z: 1000 }
            }
        };
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
        
        // Initialize the sophisticated elimination plan
        formation.eliminationPlan = this.generateEliminationPlan(formation);
        
        // Start the enhanced progressive elimination process
        this.startProgressiveElimination(formation);
        
        console.log(`🚀 Launched Genisys Torpedo with enhanced elimination system`);
        console.log(`📊 Total possibilities: ${formation.totalPossibilities}`);
        console.log(`⏰ Formation time: ${Math.round((formation.completionTime - formation.launchTime) / 1000)}s`);
        
        return formation;
    }

    // Generate comprehensive list of all possibilities for a formation
    generateAllPossibilities() {
        // Use loaded configuration data if available, otherwise fall back to hardcoded values
        if (this.planetCharacteristics && Object.keys(this.planetCharacteristics).length > 0) {
            return { ...this.planetCharacteristics };
        }
        
        // Fallback hardcoded data (for compatibility)
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

    // ========================================
    // DYNAMIC CONFIGURATION METHODS
    // ========================================
    
    // Add new characteristic option to a category
    addCharacteristicOption(category, newOption) {
        if (!this.planetCharacteristics[category]) {
            console.warn(`Category '${category}' does not exist`);
            return false;
        }
        
        if (!this.planetCharacteristics[category].includes(newOption)) {
            this.planetCharacteristics[category].push(newOption);
            console.log(`✅ Added '${newOption}' to ${category}`);
            return true;
        } else {
            console.warn(`'${newOption}' already exists in ${category}`);
            return false;
        }
    }
    
    // Remove characteristic option from a category
    removeCharacteristicOption(category, option) {
        if (!this.planetCharacteristics[category]) {
            console.warn(`Category '${category}' does not exist`);
            return false;
        }
        
        const index = this.planetCharacteristics[category].indexOf(option);
        if (index > -1) {
            this.planetCharacteristics[category].splice(index, 1);
            console.log(`🗑️ Removed '${option}' from ${category}`);
            return true;
        } else {
            console.warn(`'${option}' not found in ${category}`);
            return false;
        }
    }
    
    // Add new category of characteristics
    addCharacteristicCategory(categoryName, options = []) {
        if (this.planetCharacteristics[categoryName]) {
            console.warn(`Category '${categoryName}' already exists`);
            return false;
        }
        
        this.planetCharacteristics[categoryName] = [...options];
        console.log(`✅ Added new category '${categoryName}' with ${options.length} options`);
        return true;
    }
    
    // Get all available categories
    getAvailableCategories() {
        return Object.keys(this.planetCharacteristics);
    }
    
    // Get options for a specific category
    getCategoryOptions(category) {
        return this.planetCharacteristics[category] || [];
    }
    
    // Export current configuration for saving
    exportConfiguration() {
        return {
            version: "1.0.0",
            lastUpdated: new Date().toISOString(),
            elements: [...this.elements],
            planetTypes: { ...this.planetTypes },
            planetCharacteristics: JSON.parse(JSON.stringify(this.planetCharacteristics)),
            coordinateSystem: { ...this.coordinateSystem },
            formationSettings: { ...this.formationSettings }
        };
    }
    
    // Save current configuration to localStorage (for persistence)
    saveConfigurationToStorage() {
        const config = this.exportConfiguration();
        localStorage.setItem('torpedo_system_custom_config', JSON.stringify(config));
        console.log('💾 Configuration saved to localStorage');
    }
    
    // Load custom configuration from localStorage
    loadCustomConfiguration() {
        try {
            const saved = localStorage.getItem('torpedo_system_custom_config');
            if (saved) {
                const config = JSON.parse(saved);
                this.elements = config.elements || this.elements;
                this.planetTypes = config.planetTypes || this.planetTypes;
                this.planetCharacteristics = config.planetCharacteristics || this.planetCharacteristics;
                this.coordinateSystem = config.coordinateSystem || this.coordinateSystem;
                this.formationSettings = config.formationSettings || this.formationSettings;
                console.log('✅ Custom configuration loaded from localStorage');
                return true;
            }
        } catch (error) {
            console.error('❌ Error loading custom configuration:', error);
        }
        return false;
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
        
        // Initialize elimination tracking if not present
        if (!formation.eliminationPlan) {
            formation.eliminationPlan = this.generateEliminationPlan(formation);
        }
        
        // Calculate steady elimination interval based on remaining time
        const totalEliminationSteps = formation.eliminationPlan.totalSteps;
        const eliminationInterval = Math.max(1000, Math.floor(remainingTime / totalEliminationSteps)); // At least 1 second per step
        
        console.log(`🎯 Starting enhanced elimination for formation ${formation.id}`);
        console.log(`📊 Elimination plan: ${totalEliminationSteps} steps over ${Math.round(remainingTime/1000)}s`);
        console.log(`⏱️ Eliminating every ${Math.round(eliminationInterval/1000)}s for steady progression`);
        
        formation.eliminationTimer = setInterval(() => {
            this.executeEliminationStep(formation);
            
            // Check if formation is complete
            if (Date.now() >= formation.completionTime || formation.eliminationPlan.currentStep >= formation.eliminationPlan.totalSteps) {
                clearInterval(formation.eliminationTimer);
                this.completeFormation(formation.id);
            }
        }, eliminationInterval);
    }

    // Generate elimination plan for sophisticated progressive narrowing
    generateEliminationPlan(formation) {
        const plan = {
            currentStep: 0,
            totalSteps: 0,
            eliminationSequence: [],
            targetRetention: {
                elements: 0.25, // 25% retention for elements
                standard: 0.10, // 10% retention for all other categories
                finalReveal: 2   // Final reveal shows only 2 options per category (requires scanners)
            },
            scannerRequirements: {
                'GT-1': 'Global Type Scanner - reveals final 2 options per category',
                'GC-1': 'Global Composition Scanner - reveals element quantities'
            }
        };

        // Calculate elimination steps for each category
        Object.keys(formation.allPossibilities).forEach(category => {
            const currentCount = formation.allPossibilities[category].length;
            let targetCount;
            
            if (category === 'elements') {
                // Elements get 25% retention
                targetCount = Math.max(1, Math.ceil(currentCount * plan.targetRetention.elements));
            } else {
                // All other categories get 10% retention
                targetCount = Math.max(1, Math.ceil(currentCount * plan.targetRetention.standard));
            }
            
            const eliminationsNeeded = currentCount - targetCount;
            
            if (eliminationsNeeded > 0) {
                // Create elimination sequence with random order but controlled quantity
                for (let i = 0; i < eliminationsNeeded; i++) {
                    plan.eliminationSequence.push({
                        category: category,
                        step: plan.totalSteps + i,
                        targetCount: targetCount,
                        remainingEliminations: eliminationsNeeded - i
                    });
                }
                plan.totalSteps += eliminationsNeeded;
            }
        });

        // Randomize elimination order for unpredictability
        plan.eliminationSequence = this.shuffleArray(plan.eliminationSequence);
        
        console.log(`📋 Generated elimination plan:`, {
            totalSteps: plan.totalSteps,
            categories: Object.keys(formation.allPossibilities).length,
            elementRetention: `${Math.round(plan.targetRetention.elements * 100)}%`,
            standardRetention: `${Math.round(plan.targetRetention.standard * 100)}%`
        });

        return plan;
    }

    // Execute a single elimination step following the plan
    executeEliminationStep(formation) {
        const plan = formation.eliminationPlan;
        
        if (plan.currentStep >= plan.eliminationSequence.length) {
            console.log('🏁 All elimination steps completed');
            return;
        }

        const step = plan.eliminationSequence[plan.currentStep];
        const category = step.category;
        const categoryArray = formation.allPossibilities[category];
        
        // Ensure we don't eliminate more than planned
        if (categoryArray.length > step.targetCount) {
            const randomIndex = Math.floor(Math.random() * categoryArray.length);
            const eliminated = categoryArray.splice(randomIndex, 1)[0];
            formation.eliminatedCount = (formation.eliminatedCount || 0) + 1;
            
            // Calculate real-time possibility count
            let currentTotal = 0;
            Object.values(formation.allPossibilities).forEach(cat => currentTotal += cat.length);
            
            // Calculate progress percentage
            const stepProgress = Math.round((plan.currentStep / plan.totalSteps) * 100);
            const eliminationProgress = Math.round(((formation.totalPossibilities - currentTotal) / formation.totalPossibilities) * 100);
            
            console.log(`� ELIMINATION STEP ${plan.currentStep + 1}/${plan.totalSteps}`);
            console.log(`   ❌ Eliminated: "${eliminated}" from ${category}`);
            console.log(`   📊 Current totals: ${currentTotal}/${formation.totalPossibilities} remaining (${formation.totalPossibilities - currentTotal} eliminated)`);
            console.log(`   📈 Progress: ${Math.max(stepProgress, eliminationProgress)}% complete`);
            
            // Special logging for elements (different retention rate)
            if (category === 'elements') {
                const elementsLeft = categoryArray.length;
                const originalElements = this.elements ? this.elements.length : 88;
                const retentionPercent = Math.round((elementsLeft / originalElements) * 100);
                console.log(`   🧪 Elements: ${elementsLeft}/${originalElements} remaining (${retentionPercent}% retention, target: 25%)`);
            }
        }
        
        plan.currentStep++;
        
        // Save updated formation with progress
        this.saveFormations();
    }

    // Utility function to shuffle array (Fisher-Yates algorithm)
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Get current elimination status for UI display
    getEliminationStatus(formationId) {
        const formation = this.activeFormations.get(formationId);
        if (!formation || !formation.eliminationPlan) {
            return { error: 'Formation not found or elimination not started' };
        }

        const plan = formation.eliminationPlan;
        
        // Calculate real-time remaining possibilities by counting actual items
        let currentPossibilities = 0;
        if (formation.allPossibilities) {
            Object.values(formation.allPossibilities).forEach(category => {
                currentPossibilities += category.length;
            });
        }
        
        const eliminated = formation.totalPossibilities - currentPossibilities;
        const progress = plan.totalSteps > 0 ? Math.round((plan.currentStep / plan.totalSteps) * 100) : 0;
        
        // Calculate more accurate progress based on actual eliminations
        const targetEliminations = Math.floor(formation.totalPossibilities * 0.9); // Target 90% elimination
        const actualProgress = targetEliminations > 0 ? Math.round((eliminated / targetEliminations) * 100) : 0;
        
        return {
            formationId: formationId,
            progress: Math.max(progress, actualProgress), // Use the higher of step-based or elimination-based progress
            currentStep: plan.currentStep,
            totalSteps: plan.totalSteps,
            remainingPossibilities: currentPossibilities,
            totalPossibilities: formation.totalPossibilities,
            eliminatedCount: eliminated,
            categoriesStatus: this.getCategoriesStatus(formation),
            scannerInfo: plan.scannerRequirements,
            isComplete: plan.currentStep >= plan.totalSteps
        };
    }

    // Get detailed status for each category
    getCategoriesStatus(formation) {
        const status = {};
        Object.keys(formation.allPossibilities).forEach(category => {
            const current = formation.allPossibilities[category].length;
            const plan = formation.eliminationPlan;
            let targetRetention;
            
            if (category === 'elements') {
                targetRetention = plan.targetRetention.elements;
            } else {
                targetRetention = plan.targetRetention.standard;
            }
            
            status[category] = {
                currentCount: current,
                targetRetention: Math.round(targetRetention * 100) + '%',
                requiresScanner: category !== 'elements' ? 'GT-1' : 'GC-1',
                finalRevealCount: category !== 'elements' ? plan.targetRetention.finalReveal : 'quantity hidden'
            };
        });
        return status;
    }

    // ========================================
    // SCANNER SYSTEM FOR FINAL REVEALS
    // ========================================
    
    // Simulate GT-1 Scanner (Global Type Scanner) - reveals final planet characteristics
    performGT1Scan(formationId, scanCost = 1500) {
        const formation = this.activeFormations.get(formationId);
        if (!formation) {
            return { error: 'Formation not found', scanType: 'GT-1' };
        }

        if (formation.status !== 'COMPLETE') {
            return { error: 'Formation must be complete before scanning', scanType: 'GT-1' };
        }

        // GT-1 Scanner reveals final 2 options per category (except elements)
        const scanResults = {};
        Object.keys(formation.allPossibilities).forEach(category => {
            if (category !== 'elements') {
                const possibilities = formation.allPossibilities[category];
                // Randomly select final 2 options from remaining possibilities
                const finalOptions = this.selectRandomItems(possibilities, Math.min(2, possibilities.length));
                scanResults[category] = {
                    revealedOptions: finalOptions,
                    totalFound: finalOptions.length,
                    scannerUsed: 'GT-1'
                };
            }
        });

        formation.GT1ScanResult = scanResults;
        formation.GT1ScanTimestamp = Date.now();
        this.saveFormations();

        console.log('🔬 GT-1 Scanner Results:', scanResults);
        return {
            success: true,
            scanType: 'GT-1',
            cost: scanCost,
            results: scanResults,
            timestamp: Date.now(),
            message: 'GT-1 Scanner has revealed the final planetary characteristics'
        };
    }

    // Simulate GC-1 Scanner (Global Composition Scanner) - reveals element quantities
    performGC1Scan(formationId, scanCost = 2000) {
        const formation = this.activeFormations.get(formationId);
        if (!formation) {
            return { error: 'Formation not found', scanType: 'GC-1' };
        }

        if (formation.status !== 'COMPLETE') {
            return { error: 'Formation must be complete before scanning', scanType: 'GC-1' };
        }

        // GC-1 Scanner reveals quantities of the 25% retained elements
        const elementPossibilities = formation.allPossibilities.elements || [];
        const elementComposition = {};
        
        elementPossibilities.forEach(element => {
            // Generate realistic quantities (percentage of planet composition)
            const abundance = this.generateElementAbundance(element);
            elementComposition[element] = {
                abundance: abundance.percentage,
                classification: abundance.classification,
                extractionDifficulty: abundance.difficulty,
                economicValue: abundance.value
            };
        });

        formation.GC1ScanResult = elementComposition;
        formation.GC1ScanTimestamp = Date.now();
        this.saveFormations();

        console.log('🧪 GC-1 Scanner Results:', elementComposition);
        return {
            success: true,
            scanType: 'GC-1',
            cost: scanCost,
            results: elementComposition,
            elementCount: Object.keys(elementComposition).length,
            timestamp: Date.now(),
            message: 'GC-1 Scanner has revealed detailed elemental composition and quantities'
        };
    }

    // Generate realistic element abundance data
    generateElementAbundance(element) {
        // Base abundance varies by element type
        const commonElements = ['Iron', 'Silicon', 'Oxygen', 'Aluminum', 'Carbon', 'Nitrogen', 'Hydrogen'];
        const rareElements = ['Gold', 'Platinum', 'Uranium', 'Titanium'];
        const exoticElements = ['Plutonium', 'Americium', 'Curium'];

        let baseAbundance, classification, difficulty, value;

        if (commonElements.includes(element)) {
            baseAbundance = 0.5 + Math.random() * 15; // 0.5-15.5%
            classification = 'Common';
            difficulty = 'Easy';
            value = 'Standard';
        } else if (rareElements.includes(element)) {
            baseAbundance = 0.01 + Math.random() * 0.5; // 0.01-0.51%
            classification = 'Rare';
            difficulty = 'Moderate';
            value = 'Valuable';
        } else if (exoticElements.includes(element)) {
            baseAbundance = 0.001 + Math.random() * 0.01; // 0.001-0.011%
            classification = 'Exotic';
            difficulty = 'Extreme';
            value = 'Priceless';
        } else {
            baseAbundance = 0.1 + Math.random() * 2; // 0.1-2.1%
            classification = 'Uncommon';
            difficulty = 'Moderate';
            value = 'Good';
        }

        return {
            percentage: Math.round(baseAbundance * 1000) / 1000, // 3 decimal places
            classification: classification,
            difficulty: difficulty,
            value: value
        };
    }

    // Utility function to select random items from array
    selectRandomItems(array, count) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, count);
    }

    // Check if scanners are available for purchase/use
    getScannerAvailability() {
        return {
            'GT-1': {
                name: 'Global Type Scanner',
                description: 'Reveals final 2 characteristics per category after formation completion',
                baseCost: 1500,
                availability: 'Available at most shipyards',
                repairCost: 300,
                durability: 'High'
            },
            'GC-1': {
                name: 'Global Composition Scanner', 
                description: 'Reveals detailed elemental composition and quantities',
                baseCost: 2000,
                availability: 'Available at most shipyards',
                repairCost: 450,
                durability: 'High'
            }
        };
    }

    // ========================================
    // FORMATION COMPLETION
    // ========================================
    completeFormation(formationId) {
        const formation = this.activeFormations.get(formationId);
        if (!formation) return;
        
        // Clear elimination timer if running
        if (formation.eliminationTimer) {
            clearInterval(formation.eliminationTimer);
        }
        
        // Mark formation as complete
        formation.status = 'COMPLETE';
        formation.completionTime = Date.now();
        
        // Generate the planet system based on remaining possibilities
        formation.planet = this.generatePlanetFromPossibilities(formation);
        
        // Save to localStorage
        this.saveFormations();
        
        console.log(`🌍 Formation ${formationId} completed!`);
        console.log(`📊 Final elimination stats:`, {
            eliminated: formation.eliminatedCount,
            total: formation.totalPossibilities,
            categories: Object.keys(formation.allPossibilities).length
        });
        
        // Log scanner requirements
        console.log(`🔬 Scanners needed for full revelation:`, formation.eliminationPlan.scannerRequirements);
    }

    // Generate planet based on refined possibilities after elimination
    generatePlanetFromPossibilities(formation) {
        const possibilities = formation.allPossibilities;
        
        const planet = {
            name: this.generatePlanetName(),
            formationId: formation.id,
            coordinates: formation.coordinates,
            
            // Select characteristics from remaining possibilities
            characteristics: {},
            
            // Elements will be included but quantities hidden until GC-1 scan
            elements: possibilities.elements || [],
            
            // Basic physical properties
            diameter: 1000 + Math.floor(Math.random() * 49000), // 1000-50000 km
            moons: this.generateMoons(),
            
            // Scanner status
            scannerData: {
                GT1Required: true,  // For final characteristic revelation
                GC1Required: true,  // For element quantities
                scansPerformed: []
            },
            
            // Formation metadata
            formationTime: formation.completionTime - formation.launchTime,
            eliminationSummary: {
                totalEliminated: formation.eliminatedCount,
                categoriesProcessed: Object.keys(possibilities).length,
                retentionRates: {
                    elements: '25%',
                    characteristics: '10%'
                }
            }
        };

        // Add characteristics from each category (but note they're partially hidden)
        Object.keys(possibilities).forEach(category => {
            if (category !== 'elements') {
                planet.characteristics[category] = {
                    remainingOptions: possibilities[category].length,
                    requiresGT1Scan: true,
                    status: 'Partially revealed - GT-1 Scanner needed for final details'
                };
            }
        });

        return planet;
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
        
        // Count formations before clearing
        let clearedCount = this.activeFormations.size;
        
        // Also count any stored formations in localStorage
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const savedFormations = JSON.parse(saved);
                if (Array.isArray(savedFormations)) {
                    clearedCount = Math.max(clearedCount, savedFormations.length);
                }
            }
        } catch (error) {
            console.warn('Error counting saved formations:', error);
        }
        
        // Clear the activeFormations Map
        this.activeFormations.clear();
        
        // Clear from localStorage using the correct storage key
        localStorage.removeItem(this.storageKey);
        localStorage.setItem(this.storageKey, '[]');
        
        // Also save formations to ensure persistence
        this.saveFormations();
        
        console.log(`Cleared ${clearedCount} formations from torpedo system and localStorage`);
        console.log('ActiveFormations Map size:', this.activeFormations.size);
        return clearedCount;
    }
}

// Export for use in game
if (typeof window !== 'undefined') {
    window.GenisysTorpedoSystem = GenisysTorpedoSystem;
}