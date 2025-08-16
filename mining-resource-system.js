// Mining and Resource System for Space Explorer
// Handles surface scanning, mining operations, ore management, and refining

class MiningResourceSystem {
    constructor() {
        // Basic ore types that can be mined (will be expanded with JSON data later)
        this.oreTypes = {
            // Common metals
            'iron': { name: 'Iron Ore', baseValue: 10, abundance: 'common', refinedProduct: 'steel_ingot' },
            'copper': { name: 'Copper Ore', baseValue: 15, abundance: 'common', refinedProduct: 'copper_wire' },
            'aluminum': { name: 'Aluminum Ore', baseValue: 12, abundance: 'common', refinedProduct: 'aluminum_plate' },
            'silicon': { name: 'Silicon Ore', baseValue: 8, abundance: 'common', refinedProduct: 'silicon_chip' },
            
            // Precious metals
            'gold': { name: 'Gold Ore', baseValue: 100, abundance: 'rare', refinedProduct: 'gold_bar' },
            'platinum': { name: 'Platinum Ore', baseValue: 150, abundance: 'rare', refinedProduct: 'platinum_bar' },
            'uranium': { name: 'Uranium Ore', baseValue: 200, abundance: 'very_rare', refinedProduct: 'uranium_rod' },
            
            // Gases (from Aurora moon)
            'hydrogen': { name: 'Hydrogen Gas', baseValue: 5, abundance: 'common', refinedProduct: 'liquid_hydrogen' },
            'helium': { name: 'Helium Gas', baseValue: 20, abundance: 'uncommon', refinedProduct: 'helium_canister' },
            'xenon': { name: 'Xenon Gas', baseValue: 80, abundance: 'rare', refinedProduct: 'xenon_cell' },
            
            // Heavy metals (from Titan moon)
            'titanium': { name: 'Titanium Ore', baseValue: 50, abundance: 'uncommon', refinedProduct: 'titanium_alloy' },
            'tungsten': { name: 'Tungsten Ore', baseValue: 75, abundance: 'uncommon', refinedProduct: 'tungsten_carbide' },
            'rhodium': { name: 'Rhodium Ore', baseValue: 300, abundance: 'very_rare', refinedProduct: 'rhodium_catalyst' },
            
            // Rare earth elements (from Crystal moon)
            'lithium': { name: 'Lithium Crystal', baseValue: 25, abundance: 'uncommon', refinedProduct: 'lithium_battery' },
            'neodymium': { name: 'Neodymium Crystal', baseValue: 120, abundance: 'rare', refinedProduct: 'neodymium_magnet' },
            'europium': { name: 'Europium Crystal', baseValue: 250, abundance: 'very_rare', refinedProduct: 'europium_phosphor' }
        };

        // Refined products with higher values
        this.refinedProducts = {
            'steel_ingot': { name: 'Steel Ingot', sourceOre: 'iron', baseValueMultiplier: 2.5 },
            'copper_wire': { name: 'Copper Wire', sourceOre: 'copper', baseValueMultiplier: 2.8 },
            'aluminum_plate': { name: 'Aluminum Plate', sourceOre: 'aluminum', baseValueMultiplier: 3.0 },
            'silicon_chip': { name: 'Silicon Chip', sourceOre: 'silicon', baseValueMultiplier: 4.0 },
            'gold_bar': { name: 'Gold Bar', sourceOre: 'gold', baseValueMultiplier: 2.2 },
            'platinum_bar': { name: 'Platinum Bar', sourceOre: 'platinum', baseValueMultiplier: 2.5 },
            'uranium_rod': { name: 'Uranium Rod', sourceOre: 'uranium', baseValueMultiplier: 3.5 },
            'liquid_hydrogen': { name: 'Liquid Hydrogen', sourceOre: 'hydrogen', baseValueMultiplier: 3.8 },
            'helium_canister': { name: 'Helium Canister', sourceOre: 'helium', baseValueMultiplier: 2.6 },
            'xenon_cell': { name: 'Xenon Cell', sourceOre: 'xenon', baseValueMultiplier: 2.4 },
            'titanium_alloy': { name: 'Titanium Alloy', sourceOre: 'titanium', baseValueMultiplier: 3.2 },
            'tungsten_carbide': { name: 'Tungsten Carbide', sourceOre: 'tungsten', baseValueMultiplier: 2.9 },
            'rhodium_catalyst': { name: 'Rhodium Catalyst', sourceOre: 'rhodium', baseValueMultiplier: 2.8 },
            'lithium_battery': { name: 'Lithium Battery', sourceOre: 'lithium', baseValueMultiplier: 3.5 },
            'neodymium_magnet': { name: 'Neodymium Magnet', sourceOre: 'neodymium', baseValueMultiplier: 2.7 },
            'europium_phosphor': { name: 'Europium Phosphor', sourceOre: 'europium', baseValueMultiplier: 2.3 }
        };

        this.playerInventory = {
            ores: {},
            refinedProducts: {},
            credits: 1000 // Starting credits
        };

        this.miningInProgress = false;
        this.scanningInProgress = false;
        this.refiningInProgress = false;
    }

    // Scan the surface of current location for available resources
    scanSurface(locationData) {
        if (this.scanningInProgress) {
            throw new Error('Scanning already in progress');
        }

        if (!locationData || !locationData.miningData) {
            throw new Error('No mining data available for this location');
        }

        this.scanningInProgress = true;

        // Simulate scanning delay
        return new Promise((resolve) => {
            setTimeout(() => {
                const scanResults = this.generateScanResults(locationData.miningData);
                this.scanningInProgress = false;
                resolve(scanResults);
            }, 2000); // 2 second scan
        });
    }

    // Generate scan results based on location mining data
    generateScanResults(miningData) {
        const results = {
            timestamp: Date.now(),
            location: miningData,
            detectedElements: [],
            estimatedYield: {},
            difficulty: miningData.difficulty || 'medium'
        };

        // Generate available elements based on location
        const allElements = [...miningData.primaryElements, ...miningData.rareElements];
        
        allElements.forEach(elementType => {
            if (this.oreTypes[elementType]) {
                const abundance = this.getElementAbundance(elementType, miningData);
                const estimatedYield = this.calculateEstimatedYield(elementType, abundance);
                
                results.detectedElements.push({
                    type: elementType,
                    name: this.oreTypes[elementType].name,
                    abundance: abundance,
                    estimatedValue: this.oreTypes[elementType].baseValue
                });

                results.estimatedYield[elementType] = estimatedYield;
            }
        });

        return results;
    }

    // Calculate element abundance at location
    getElementAbundance(elementType, miningData) {
        const baseAbundance = this.oreTypes[elementType].abundance;
        const locationAbundance = miningData.abundance;
        
        // Modify abundance based on location and randomness
        const abundanceScore = this.getAbundanceScore(baseAbundance) + 
                              this.getAbundanceScore(locationAbundance) +
                              (Math.random() * 2 - 1); // ±1 random factor

        if (abundanceScore >= 4) return 'very_high';
        if (abundanceScore >= 3) return 'high';
        if (abundanceScore >= 2) return 'medium';
        if (abundanceScore >= 1) return 'low';
        return 'trace';
    }

    // Convert abundance string to numeric score
    getAbundanceScore(abundanceStr) {
        switch(abundanceStr) {
            case 'very_high': return 4;
            case 'high': return 3;
            case 'medium': return 2;
            case 'low': return 1;
            case 'trace': return 0.5;
            default: return 2;
        }
    }

    // Calculate estimated yield for mining operation
    calculateEstimatedYield(elementType, abundance) {
        const baseYield = 10; // Base mining yield
        const abundanceMultiplier = this.getAbundanceScore(abundance);
        const randomFactor = 0.8 + (Math.random() * 0.4); // 80%-120% of expected
        
        return Math.floor(baseYield * abundanceMultiplier * randomFactor);
    }

    // Mine specific element type at current location
    mineElement(elementType, locationData, quantity = 1) {
        if (this.miningInProgress) {
            throw new Error('Mining operation already in progress');
        }

        if (!locationData || !locationData.miningData) {
            throw new Error('No mining data available for this location');
        }

        if (!this.oreTypes[elementType]) {
            throw new Error(`Unknown element type: ${elementType}`);
        }

        this.miningInProgress = true;

        // Simulate mining operation
        return new Promise((resolve) => {
            const miningTime = this.calculateMiningTime(elementType, locationData.miningData, quantity);
            
            setTimeout(() => {
                const miningResults = this.performMiningOperation(elementType, locationData.miningData, quantity);
                this.miningInProgress = false;
                resolve(miningResults);
            }, miningTime);
        });
    }

    // Calculate mining operation time
    calculateMiningTime(elementType, miningData, quantity) {
        const baseTime = 3000; // 3 seconds base
        const difficultyMultiplier = this.getDifficultyMultiplier(miningData.difficulty);
        const quantityMultiplier = Math.sqrt(quantity); // Diminishing returns for bulk mining
        
        return Math.floor(baseTime * difficultyMultiplier * quantityMultiplier);
    }

    // Get difficulty multiplier for mining time
    getDifficultyMultiplier(difficulty) {
        switch(difficulty) {
            case 'easy': return 0.7;
            case 'medium': return 1.0;
            case 'hard': return 1.5;
            case 'very_hard': return 2.0;
            default: return 1.0;
        }
    }

    // Perform the actual mining operation
    performMiningOperation(elementType, miningData, quantity) {
        const abundance = this.getElementAbundance(elementType, miningData);
        const actualYield = this.calculateActualYield(elementType, abundance, quantity);
        
        // Add to player inventory
        if (!this.playerInventory.ores[elementType]) {
            this.playerInventory.ores[elementType] = 0;
        }
        this.playerInventory.ores[elementType] += actualYield;

        return {
            success: true,
            elementType: elementType,
            elementName: this.oreTypes[elementType].name,
            quantityMined: actualYield,
            totalInInventory: this.playerInventory.ores[elementType],
            baseValue: this.oreTypes[elementType].baseValue,
            estimatedValue: actualYield * this.oreTypes[elementType].baseValue
        };
    }

    // Calculate actual mining yield (with randomness)
    calculateActualYield(elementType, abundance, targetQuantity) {
        const abundanceMultiplier = this.getAbundanceScore(abundance);
        const baseYield = targetQuantity * abundanceMultiplier;
        const randomFactor = 0.7 + (Math.random() * 0.6); // 70%-130% variance
        
        return Math.max(1, Math.floor(baseYield * randomFactor));
    }

    // Get appraisal of ores in inventory
    getAppraisal(marketFluctuation = true) {
        const appraisal = {
            timestamp: Date.now(),
            ores: {},
            refinedProducts: {},
            totalValue: 0,
            marketConditions: marketFluctuation ? this.generateMarketConditions() : {}
        };

        // Appraise ores
        for (const [oreType, quantity] of Object.entries(this.playerInventory.ores)) {
            if (quantity > 0 && this.oreTypes[oreType]) {
                const baseValue = this.oreTypes[oreType].baseValue;
                const marketMultiplier = marketFluctuation ? 
                    (appraisal.marketConditions[oreType] || 1.0) : 1.0;
                const currentValue = Math.floor(baseValue * marketMultiplier);
                const totalValue = currentValue * quantity;

                appraisal.ores[oreType] = {
                    name: this.oreTypes[oreType].name,
                    quantity: quantity,
                    baseValue: baseValue,
                    currentValue: currentValue,
                    totalValue: totalValue,
                    marketChange: Math.floor((marketMultiplier - 1) * 100)
                };

                appraisal.totalValue += totalValue;
            }
        }

        // Appraise refined products
        for (const [productType, quantity] of Object.entries(this.playerInventory.refinedProducts)) {
            if (quantity > 0 && this.refinedProducts[productType]) {
                const sourceOre = this.refinedProducts[productType].sourceOre;
                const baseOreValue = this.oreTypes[sourceOre].baseValue;
                const multiplier = this.refinedProducts[productType].baseValueMultiplier;
                const marketMultiplier = marketFluctuation ? 
                    (appraisal.marketConditions[productType] || 1.0) : 1.0;
                const currentValue = Math.floor(baseOreValue * multiplier * marketMultiplier);
                const totalValue = currentValue * quantity;

                appraisal.refinedProducts[productType] = {
                    name: this.refinedProducts[productType].name,
                    quantity: quantity,
                    baseValue: Math.floor(baseOreValue * multiplier),
                    currentValue: currentValue,
                    totalValue: totalValue,
                    marketChange: Math.floor((marketMultiplier - 1) * 100)
                };

                appraisal.totalValue += totalValue;
            }
        }

        return appraisal;
    }

    // Generate random market conditions
    generateMarketConditions() {
        const conditions = {};
        
        // Random market fluctuations for each ore/product type
        [...Object.keys(this.oreTypes), ...Object.keys(this.refinedProducts)].forEach(item => {
            // Market can fluctuate ±25%
            conditions[item] = 0.75 + (Math.random() * 0.5);
        });

        return conditions;
    }

    // Refine ore into refined products
    refineOre(oreType, quantity, isPlayerOwnedRefinery = false) {
        if (this.refiningInProgress) {
            throw new Error('Refining operation already in progress');
        }

        if (!this.oreTypes[oreType]) {
            throw new Error(`Unknown ore type: ${oreType}`);
        }

        if (!this.playerInventory.ores[oreType] || this.playerInventory.ores[oreType] < quantity) {
            throw new Error(`Insufficient ${this.oreTypes[oreType].name} in inventory`);
        }

        const refinedProductType = this.oreTypes[oreType].refinedProduct;
        if (!this.refinedProducts[refinedProductType]) {
            throw new Error(`No refined product available for ${oreType}`);
        }

        this.refiningInProgress = true;

        // Simulate refining process
        return new Promise((resolve) => {
            const refiningTime = this.calculateRefiningTime(oreType, quantity);
            
            setTimeout(() => {
                const refiningResults = this.performRefiningOperation(
                    oreType, quantity, refinedProductType, isPlayerOwnedRefinery
                );
                this.refiningInProgress = false;
                resolve(refiningResults);
            }, refiningTime);
        });
    }

    // Calculate refining time
    calculateRefiningTime(oreType, quantity) {
        const baseTime = 5000; // 5 seconds base
        const rarityMultiplier = this.oreTypes[oreType].abundance === 'rare' ? 1.5 : 1.0;
        const quantityMultiplier = Math.sqrt(quantity);
        
        return Math.floor(baseTime * rarityMultiplier * quantityMultiplier);
    }

    // Perform refining operation with corruption mechanics
    performRefiningOperation(oreType, quantity, refinedProductType, isPlayerOwnedRefinery) {
        // Remove ore from inventory
        this.playerInventory.ores[oreType] -= quantity;

        // Calculate base refined output (1x to 4x multiplier)
        const baseMultiplier = 1 + (Math.random() * 3); // 1x to 4x
        let refinedQuantity = Math.floor(quantity * baseMultiplier);

        // Calculate corruption (0% to 15% loss)
        let corruptionRate = 0;
        let corruptionLoss = 0;
        
        if (!isPlayerOwnedRefinery) {
            corruptionRate = Math.random() * 0.15; // 0% to 15%
            corruptionLoss = Math.floor(refinedQuantity * corruptionRate);
            refinedQuantity = Math.max(1, refinedQuantity - corruptionLoss);
        }

        // Add refined product to inventory
        if (!this.playerInventory.refinedProducts[refinedProductType]) {
            this.playerInventory.refinedProducts[refinedProductType] = 0;
        }
        this.playerInventory.refinedProducts[refinedProductType] += refinedQuantity;

        return {
            success: true,
            oreType: oreType,
            oreName: this.oreTypes[oreType].name,
            oreQuantityUsed: quantity,
            refinedProductType: refinedProductType,
            refinedProductName: this.refinedProducts[refinedProductType].name,
            refinedQuantity: refinedQuantity,
            baseMultiplier: Math.round(baseMultiplier * 100) / 100,
            corruptionRate: Math.round(corruptionRate * 100),
            corruptionLoss: corruptionLoss,
            isPlayerOwnedRefinery: isPlayerOwnedRefinery,
            totalRefinedInInventory: this.playerInventory.refinedProducts[refinedProductType]
        };
    }

    // Sell ores or refined products
    sellItems(itemType, category, quantity, marketPrice) {
        if (category === 'ore') {
            if (!this.playerInventory.ores[itemType] || this.playerInventory.ores[itemType] < quantity) {
                throw new Error(`Insufficient ${itemType} in inventory`);
            }
            this.playerInventory.ores[itemType] -= quantity;
        } else if (category === 'refined') {
            if (!this.playerInventory.refinedProducts[itemType] || this.playerInventory.refinedProducts[itemType] < quantity) {
                throw new Error(`Insufficient ${itemType} in inventory`);
            }
            this.playerInventory.refinedProducts[itemType] -= quantity;
        } else {
            throw new Error(`Invalid category: ${category}`);
        }

        const totalCredits = quantity * marketPrice;
        this.playerInventory.credits += totalCredits;

        return {
            success: true,
            itemType: itemType,
            category: category,
            quantitySold: quantity,
            pricePerUnit: marketPrice,
            totalCredits: totalCredits,
            newCreditBalance: this.playerInventory.credits
        };
    }

    // Get player inventory summary
    getInventory() {
        return {
            ...this.playerInventory,
            totalOreTypes: Object.keys(this.playerInventory.ores).length,
            totalRefinedTypes: Object.keys(this.playerInventory.refinedProducts).length,
            totalOreQuantity: Object.values(this.playerInventory.ores).reduce((sum, qty) => sum + qty, 0),
            totalRefinedQuantity: Object.values(this.playerInventory.refinedProducts).reduce((sum, qty) => sum + qty, 0)
        };
    }

    // Save mining system state
    saveMiningState() {
        return {
            playerInventory: this.playerInventory,
            timestamp: Date.now()
        };
    }

    // Load mining system state
    loadMiningState(state) {
        if (state && state.playerInventory) {
            this.playerInventory = {
                ores: state.playerInventory.ores || {},
                refinedProducts: state.playerInventory.refinedProducts || {},
                credits: state.playerInventory.credits || 1000
            };
        }
    }
}

// Initialize the mining resource system
if (typeof window !== 'undefined') {
    window.MiningResourceSystem = MiningResourceSystem;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MiningResourceSystem;
}
