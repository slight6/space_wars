// Mining and Refining System for Keldar Deep Space Trading Game
// Handles resource extraction, ore processing, and territory management

class MiningSystem {
    constructor() {
        this.activeMiningOperations = new Map(); // Track ongoing mining
        this.playerInventory = new Map(); // Player's raw ore inventory
        this.refinedInventory = new Map(); // Player's refined materials
        this.miningLocations = new Map(); // Track claimed mining spots
        this.refineries = new Map(); // Track player-built refineries
        
        // Mining capabilities by ship type
        this.shipMiningCapabilities = {
            'Scout Ship': {
                maxMiningLevel: 1,
                miningSpeed: 1.0,
                cargoCapacity: 50,
                energyPerMining: 15,
                scanRequirement: 'spatial-stage1'
            },
            'Attack Ship': {
                maxMiningLevel: 2,
                miningSpeed: 1.2,
                cargoCapacity: 75,
                energyPerMining: 20,
                scanRequirement: 'spatial-stage1'
            },
            'Heavy Hauler': {
                maxMiningLevel: 3,
                miningSpeed: 0.8,
                cargoCapacity: 200,
                energyPerMining: 25,
                scanRequirement: 'spatial-stage2'
            }
        };
        
        // Keldar system mining locations
        this.keldorSystemLocations = {
            'Quilt Belt': {
                type: 'asteroid_belt',
                coordinates: { x: 15, y: 20, z: 5 },
                miningDifficulty: 1,
                resources: ['iron', 'silicon', 'carbon', 'aluminum', 'copper'],
                rareMaterials: ['titanium', 'platinum', 'rare_earth'],
                maxMiningSpots: 25,
                description: 'Local asteroid belt with abundant basic resources'
            },
            'Keldar Planet': {
                type: 'planet_surface',
                coordinates: { x: 0, y: 0, z: 0 },
                miningDifficulty: 2,
                resources: ['iron', 'copper', 'aluminum', 'precious_metals', 'crystals'],
                rareMaterials: ['diamond', 'exotic_crystals', 'keldar_ore'],
                maxMiningSpots: 15,
                refinerySpots: 8,
                description: 'Home planet surface mining operations'
            },
            'Keldar Moon Alpha': {
                type: 'moon',
                coordinates: { x: 2, y: 1, z: 0 },
                miningDifficulty: 1,
                resources: ['silicon', 'aluminum', 'rare_earth', 'helium3'],
                rareMaterials: ['lunar_crystals', 'zero_g_alloys'],
                maxMiningSpots: 10,
                refinerySpots: 3,
                description: 'First moon with specialized materials'
            },
            'Keldar Moon Beta': {
                type: 'moon',
                coordinates: { x: -1, y: 2, z: 1 },
                miningDifficulty: 1,
                resources: ['ice', 'methane', 'ammonia', 'organic_compounds'],
                rareMaterials: ['bio_crystals', 'frozen_gases'],
                maxMiningSpots: 8,
                refinerySpots: 2,
                description: 'Ice moon with organic and gas resources'
            },
            'Keldar Moon Gamma': {
                type: 'moon',
                coordinates: { x: 1, y: -2, z: 2 },
                miningDifficulty: 2,
                resources: ['uranium', 'thorium', 'heavy_metals', 'radioactives'],
                rareMaterials: ['weapons_grade_uranium', 'exotic_matter'],
                maxMiningSpots: 5,
                refinerySpots: 1,
                description: 'Dangerous mining moon with radioactive materials'
            }
        };
        
        // Resource market values and refining multipliers
        this.resourceValues = {
            // Basic materials (raw ore prices)
            'iron': { baseValue: 10, volatility: 0.1, refinedMultiplier: 1.5 },
            'copper': { baseValue: 15, volatility: 0.15, refinedMultiplier: 1.4 },
            'aluminum': { baseValue: 12, volatility: 0.12, refinedMultiplier: 1.6 },
            'silicon': { baseValue: 8, volatility: 0.08, refinedMultiplier: 1.3 },
            'carbon': { baseValue: 5, volatility: 0.05, refinedMultiplier: 2.0 },
            
            // Intermediate materials
            'titanium': { baseValue: 45, volatility: 0.2, refinedMultiplier: 1.8 },
            'platinum': { baseValue: 120, volatility: 0.3, refinedMultiplier: 1.4 },
            'rare_earth': { baseValue: 35, volatility: 0.25, refinedMultiplier: 2.2 },
            'precious_metals': { baseValue: 80, volatility: 0.22, refinedMultiplier: 1.3 },
            
            // Advanced materials
            'diamond': { baseValue: 200, volatility: 0.4, refinedMultiplier: 1.2 },
            'exotic_crystals': { baseValue: 300, volatility: 0.5, refinedMultiplier: 1.6 },
            'keldar_ore': { baseValue: 150, volatility: 0.3, refinedMultiplier: 2.5 },
            'weapons_grade_uranium': { baseValue: 500, volatility: 0.6, refinedMultiplier: 1.1 },
            'exotic_matter': { baseValue: 1000, volatility: 0.8, refinedMultiplier: 1.5 }
        };
        
        // Refinery types and costs
        this.refineryTypes = {
            'Basic Refinery': {
                cost: 50000,
                buildTime: 3600000, // 1 hour
                efficiency: 1.0,
                maxThroughput: 100,
                canRefine: ['iron', 'copper', 'aluminum', 'silicon', 'carbon']
            },
            'Advanced Refinery': {
                cost: 150000,
                buildTime: 7200000, // 2 hours
                efficiency: 1.3,
                maxThroughput: 250,
                canRefine: ['titanium', 'platinum', 'rare_earth', 'precious_metals']
            },
            'Exotic Refinery': {
                cost: 500000,
                buildTime: 14400000, // 4 hours
                efficiency: 1.5,
                maxThroughput: 500,
                canRefine: ['diamond', 'exotic_crystals', 'keldar_ore', 'weapons_grade_uranium', 'exotic_matter']
            }
        };
        
        this.miningDuration = 10000; // 10 seconds for testing
        this.cooldownPeriod = 5000; // 5 seconds between mining operations
    }
    
    // Check if player can mine at location
    canMineAtLocation(playerShip, location, miningLevel = 1) {
        const shipCapabilities = this.shipMiningCapabilities[playerShip.type];
        const locationData = this.keldorSystemLocations[location];
        
        if (!shipCapabilities || !locationData) {
            return { canMine: false, reason: 'Invalid ship or location' };
        }
        
        if (miningLevel > shipCapabilities.maxMiningLevel) {
            return { canMine: false, reason: `Ship can only handle level ${shipCapabilities.maxMiningLevel} mining` };
        }
        
        if (locationData.miningDifficulty > shipCapabilities.maxMiningLevel) {
            return { canMine: false, reason: `Location too difficult for ${playerShip.type}` };
        }
        
        // Check if location has available mining spots
        const claimedSpots = this.getClaimedSpots(location);
        if (claimedSpots >= locationData.maxMiningSpots) {
            return { canMine: false, reason: 'No available mining spots at this location' };
        }
        
        return { canMine: true, reason: 'Ready to mine' };
    }
    
    // Start mining operation
    startMining(playerId, playerShip, location, miningLevel = 1) {
        const canMineCheck = this.canMineAtLocation(playerShip, location, miningLevel);
        if (!canMineCheck.canMine) {
            return { success: false, error: canMineCheck.reason };
        }
        
        const shipCapabilities = this.shipMiningCapabilities[playerShip.type];
        const locationData = this.keldorSystemLocations[location];
        
        // Get ship bonuses from ship management system
        let shipBonuses = { speed: 1.0, yield: 1.0, efficiency: 1.0 };
        if (typeof shipMiningIntegration !== 'undefined' && shipMiningIntegration.initialized) {
            const currentShip = shipMiningIntegration.getCurrentPlayerShip(playerId);
            if (currentShip) {
                shipBonuses = shipMiningIntegration.calculateMiningBonuses(currentShip.instanceId);
            }
        }
        
        // Check energy requirements (modified by efficiency bonus)
        const energyRequired = Math.ceil(shipCapabilities.energyPerMining / shipBonuses.efficiency);
        if (playerShip.energy < energyRequired) {
            return { success: false, error: 'Insufficient energy for mining operation' };
        }
        
        // Check cargo space (with ship capacity bonus)
        let maxCargoCapacity = shipCapabilities.cargoCapacity;
        if (typeof shipMiningIntegration !== 'undefined' && shipMiningIntegration.initialized) {
            const currentShip = shipMiningIntegration.getCurrentPlayerShip(playerId);
            if (currentShip) {
                const cargoBonus = shipMiningIntegration.getCargoCapacityBonus(currentShip.instanceId);
                maxCargoCapacity = Math.floor(maxCargoCapacity * cargoBonus);
            }
        }
        
        if (this.getCargoUsed(playerId) >= maxCargoCapacity) {
            return { success: false, error: 'Cargo hold full - return to station to sell ore' };
        }
        
        // Create mining operation with ship bonuses applied
        const miningId = `mine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const baseDuration = this.miningDuration / shipCapabilities.miningSpeed;
        const adjustedDuration = baseDuration / shipBonuses.speed; // Ship equipment speeds up mining
        
        const miningOp = {
            id: miningId,
            playerId: playerId,
            location: location,
            level: miningLevel,
            startTime: Date.now(),
            duration: adjustedDuration,
            shipType: playerShip.type,
            expectedYield: this.calculateExpectedYield(locationData, miningLevel, shipBonuses.yield),
            status: 'active',
            shipBonuses: shipBonuses // Store bonuses for completion
        };
        
        this.activeMiningOperations.set(miningId, miningOp);
        
        // Consume energy (reduced by efficiency)
        playerShip.energy -= energyRequired;
        
        // Claim mining spot temporarily
        this.claimMiningSpot(playerId, location, miningId);
        
        // Schedule completion
        setTimeout(() => {
            this.completeMining(miningId);
        }, miningOp.duration);
        
        return {
            success: true,
            miningId: miningId,
            duration: miningOp.duration,
            shipBonuses: shipBonuses,
            message: `Mining operation started at ${location}. Estimated completion: ${Math.round(miningOp.duration / 1000)} seconds.`
        };
    }
    
    // Complete mining operation and generate ore
    completeMining(miningId) {
        const miningOp = this.activeMiningOperations.get(miningId);
        if (!miningOp) return;
        
        console.log(`⛏️ Completing mining operation: ${miningId}`);
        
        const locationData = this.keldorSystemLocations[miningOp.location];
        const shipBonuses = miningOp.shipBonuses || { speed: 1.0, yield: 1.0, efficiency: 1.0 };
        const oreYield = this.generateOreYield(locationData, miningOp.level, shipBonuses);
        
        // Add ore to player inventory
        this.addOreToInventory(miningOp.playerId, oreYield);
        
        // Update ship statistics if ship management integration is available
        if (typeof shipMiningIntegration !== 'undefined' && shipMiningIntegration.initialized) {
            const currentShip = shipMiningIntegration.getCurrentPlayerShip(miningOp.playerId);
            if (currentShip) {
                const totalYield = oreYield.reduce((total, ore) => total + ore.amount, 0);
                const miningResults = {
                    location: miningOp.location,
                    totalYield: totalYield,
                    duration: (Date.now() - miningOp.startTime) / 1000, // Duration in seconds
                    efficiency: shipBonuses.efficiency,
                    creditsEarned: 0 // Will be updated when ore is sold
                };
                
                shipMiningIntegration.updateShipAfterMining(currentShip.instanceId, miningResults);
            }
        }
        
        // Release mining spot
        this.releaseMiningSpot(miningOp.playerId, miningOp.location, miningId);
        
        // Update operation status
        miningOp.status = 'completed';
        miningOp.actualYield = oreYield;
        miningOp.completionTime = Date.now();
        
        this.activeMiningOperations.delete(miningId);
        
        // Notify player
        this.notifyMiningComplete(miningId, oreYield);
    }
    
    // Generate random ore yield based on location and level
    generateOreYield(locationData, miningLevel, shipBonuses = { speed: 1.0, yield: 1.0, efficiency: 1.0 }) {
        const baseYield = 5 + (miningLevel * 3);
        const variance = Math.floor(Math.random() * baseYield * 0.5);
        const totalAmount = Math.floor((baseYield + variance) * shipBonuses.yield); // Apply yield bonus
        
        const oreYield = [];
        
        // Generate basic resources (guaranteed)
        const numBasicResources = Math.min(3, locationData.resources.length);
        for (let i = 0; i < numBasicResources; i++) {
            const resource = locationData.resources[Math.floor(Math.random() * locationData.resources.length)];
            const baseAmount = Math.floor(Math.random() * 8) + 2;
            const bonusAmount = Math.floor(baseAmount * shipBonuses.yield); // Apply yield bonus
            oreYield.push({
                type: resource,
                amount: bonusAmount,
                grade: 'raw',
                quality: Math.random() > 0.7 ? 'high' : 'standard'
            });
        }
        
        // Chance for rare materials (level and location dependent, improved by efficiency)
        let rareChance = (miningLevel * 0.1) + (locationData.miningDifficulty * 0.05);
        rareChance *= shipBonuses.efficiency; // Ship efficiency improves rare material discovery
        
        if (Math.random() < rareChance && locationData.rareMaterials.length > 0) {
            const rareMaterial = locationData.rareMaterials[Math.floor(Math.random() * locationData.rareMaterials.length)];
            const baseRareAmount = Math.floor(Math.random() * 3) + 1;
            const bonusRareAmount = Math.max(1, Math.floor(baseRareAmount * shipBonuses.yield));
            oreYield.push({
                type: rareMaterial,
                amount: bonusRareAmount,
                grade: 'raw',
                quality: Math.random() > 0.5 ? 'high' : 'premium'
            });
        }
        
        return oreYield;
    }
    
    // Add ore to player inventory
    addOreToInventory(playerId, oreYield) {
        if (!this.playerInventory.has(playerId)) {
            this.playerInventory.set(playerId, []);
        }
        
        const inventory = this.playerInventory.get(playerId);
        
        oreYield.forEach(ore => {
            // Add timestamp and unique ID for tracking
            ore.id = `ore_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            ore.minedTime = Date.now();
            ore.appraised = false; // Unknown value until appraised
            inventory.push(ore);
        });
        
        console.log(`📦 Added ${oreYield.length} ore samples to player ${playerId} inventory`);
    }
    
    // Get ore appraisal at market
    appraiseOre(playerId, oreId) {
        const inventory = this.playerInventory.get(playerId) || [];
        const ore = inventory.find(item => item.id === oreId);
        
        if (!ore) {
            return { success: false, error: 'Ore sample not found' };
        }
        
        if (ore.appraised) {
            return { success: false, error: 'Ore already appraised' };
        }
        
        // Calculate market value with volatility
        const resourceData = this.resourceValues[ore.type];
        const qualityMultiplier = ore.quality === 'premium' ? 1.5 : ore.quality === 'high' ? 1.2 : 1.0;
        const marketFluctuation = 1 + ((Math.random() - 0.5) * resourceData.volatility);
        
        ore.marketValue = Math.floor(resourceData.baseValue * qualityMultiplier * marketFluctuation * ore.amount);
        ore.pricePerUnit = Math.floor(ore.marketValue / ore.amount);
        ore.appraised = true;
        ore.appraisalTime = Date.now();
        
        return {
            success: true,
            ore: ore,
            appraisalFee: 50, // Flat fee for appraisal
            message: `${ore.amount}x ${ore.type} (${ore.quality}) appraised at ${ore.marketValue} credits total`
        };
    }
    
    // Sell ore at market
    sellOre(playerId, oreId) {
        const inventory = this.playerInventory.get(playerId) || [];
        const oreIndex = inventory.findIndex(item => item.id === oreId);
        
        if (oreIndex === -1) {
            return { success: false, error: 'Ore sample not found' };
        }
        
        const ore = inventory[oreIndex];
        
        if (!ore.appraised) {
            return { success: false, error: 'Ore must be appraised before selling' };
        }
        
        // Remove from inventory
        inventory.splice(oreIndex, 1);
        
        return {
            success: true,
            credits: ore.marketValue,
            ore: ore,
            message: `Sold ${ore.amount}x ${ore.type} for ${ore.marketValue} credits`
        };
    }
    
    // Build refinery at location
    buildRefinery(playerId, location, refineryType) {
        const locationData = this.keldorSystemLocations[location];
        const refineryData = this.refineryTypes[refineryType];
        
        if (!locationData || !refineryData) {
            return { success: false, error: 'Invalid location or refinery type' };
        }
        
        if (!locationData.refinerySpots) {
            return { success: false, error: 'No refinery construction allowed at this location' };
        }
        
        const existingRefineries = this.getRefineryCount(location);
        if (existingRefineries >= locationData.refinerySpots) {
            return { success: false, error: 'No available refinery spots at this location' };
        }
        
        const refineryId = `refinery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const refinery = {
            id: refineryId,
            ownerId: playerId,
            location: location,
            type: refineryType,
            buildStartTime: Date.now(),
            buildDuration: refineryData.buildTime,
            status: 'under_construction',
            efficiency: refineryData.efficiency,
            maxThroughput: refineryData.maxThroughput,
            canRefine: refineryData.canRefine
        };
        
        this.refineries.set(refineryId, refinery);
        
        // Schedule completion
        setTimeout(() => {
            this.completeRefineryConstruction(refineryId);
        }, refineryData.buildTime);
        
        return {
            success: true,
            refineryId: refineryId,
            buildTime: refineryData.buildTime,
            cost: refineryData.cost,
            message: `${refineryType} construction started at ${location}. Completion in ${Math.round(refineryData.buildTime / 1000)} seconds.`
        };
    }
    
    // Helper methods
    calculateExpectedYield(locationData, miningLevel, yieldBonus = 1.0) {
        const baseMin = Math.floor((3 + miningLevel) * yieldBonus);
        const baseMax = Math.floor((8 + (miningLevel * 2)) * yieldBonus);
        return `${baseMin}-${baseMax} ore samples (yield bonus: ${Math.round((yieldBonus - 1) * 100)}%)`;
    }
    
    getClaimedSpots(location) {
        return Array.from(this.miningLocations.values())
            .filter(spot => spot.location === location && spot.active).length;
    }
    
    claimMiningSpot(playerId, location, miningId) {
        this.miningLocations.set(miningId, {
            playerId: playerId,
            location: location,
            claimTime: Date.now(),
            active: true
        });
    }
    
    releaseMiningSpot(playerId, location, miningId) {
        const spot = this.miningLocations.get(miningId);
        if (spot) {
            spot.active = false;
            spot.releaseTime = Date.now();
        }
    }
    
    getCargoUsed(playerId) {
        const inventory = this.playerInventory.get(playerId) || [];
        return inventory.reduce((total, ore) => total + ore.amount, 0);
    }
    
    getRefineryCount(location) {
        return Array.from(this.refineries.values())
            .filter(refinery => refinery.location === location).length;
    }
    
    completeRefineryConstruction(refineryId) {
        const refinery = this.refineries.get(refineryId);
        if (refinery) {
            refinery.status = 'operational';
            refinery.completionTime = Date.now();
            this.notifyRefineryComplete(refineryId);
        }
    }
    
    // Get player's current mining operations
    getPlayerMiningOperations(playerId) {
        return Array.from(this.activeMiningOperations.values())
            .filter(op => op.playerId === playerId);
    }
    
    // Get player's ore inventory
    getPlayerInventory(playerId) {
        return this.playerInventory.get(playerId) || [];
    }
    
    // Get available mining locations
    getAvailableLocations() {
        const locations = {};
        Object.keys(this.keldorSystemLocations).forEach(locationName => {
            const location = this.keldorSystemLocations[locationName];
            const claimedSpots = this.getClaimedSpots(locationName);
            locations[locationName] = {
                ...location,
                availableSpots: location.maxMiningSpots - claimedSpots,
                claimedSpots: claimedSpots
            };
        });
        return locations;
    }
    
    // Notification methods
    notifyMiningComplete(miningId, oreYield) {
        console.log(`✅ Mining completed: ${miningId}, yield: ${oreYield.length} samples`);
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('miningComplete', {
                detail: { miningId, oreYield }
            }));
        }
    }
    
    notifyRefineryComplete(refineryId) {
        console.log(`🏭 Refinery construction completed: ${refineryId}`);
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('refineryComplete', {
                detail: { refineryId }
            }));
        }
    }
}

// Initialize global mining system
if (typeof window !== 'undefined') {
    window.miningSystem = new MiningSystem();
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MiningSystem;
}
