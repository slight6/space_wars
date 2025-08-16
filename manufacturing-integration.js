/**
 * Manufacturing Integration System
 * Connects manufacturing with existing inventory, credits, and ship systems
 */

class ManufacturingIntegration {
    constructor() {
        this.gameDataManager = null;
        this.shipManager = null;
        this.manufacturingSystem = null;
        this.miningSystem = null;
        
        this.initialized = false;
    }

    async initialize() {
        // Wait for other systems to be available
        await this.waitForSystems();
        
        // Initialize integration
        this.setupIntegration();
        this.initialized = true;
        
        console.log('Manufacturing Integration System initialized');
    }

    async waitForSystems() {
        const checkSystems = () => {
            return window.gameDataManager && 
                   window.advancedShipManager && 
                   window.advancedManufacturing &&
                   window.miningSystem;
        };

        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (checkSystems()) {
                    this.gameDataManager = window.gameDataManager;
                    this.shipManager = window.advancedShipManager;
                    this.manufacturingSystem = window.advancedManufacturing;
                    this.miningSystem = window.miningSystem;
                    
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }

    setupIntegration() {
        // Integrate material inventory with mining system
        this.synchronizeMaterialInventory();
        
        // Set up ship equipment production
        this.setupShipEquipmentProduction();
        
        // Initialize credit integration
        this.setupCreditIntegration();
        
        // Set up automatic material sourcing
        this.setupMaterialSourcing();
    }

    synchronizeMaterialInventory() {
        // Get materials from mining system
        const miningInventory = this.miningSystem.getPlayerInventory('player1') || [];
        
        // Convert ore samples to manufacturing materials
        const materialConversion = {
            'iron_ore': 'iron',
            'copper_ore': 'copper',
            'aluminum_ore': 'aluminum',
            'titanium_ore': 'titanium',
            'silicon_ore': 'silicon',
            'rare_earth_ore': 'rare_earth',
            'platinum_ore': 'platinum',
            'gold_ore': 'gold',
            'uranium_ore': 'uranium',
            'crystal_ore': 'crystal'
        };

        // Add materials to manufacturing inventory
        miningInventory.forEach(ore => {
            if (materialConversion[ore.type]) {
                const materialType = materialConversion[ore.type];
                const currentQuantity = this.manufacturingSystem.getMaterialQuantity(materialType) || 0;
                const oreQuantity = ore.quantity || 1;
                
                this.manufacturingSystem.addMaterial(materialType, currentQuantity + oreQuantity);
            }
        });

        // Add basic materials for immediate production
        const basicMaterials = {
            'iron': 100,
            'copper': 80,
            'aluminum': 60,
            'silicon': 40,
            'titanium': 20,
            'rare_earth': 10,
            'carbon_fiber': 15,
            'quantum_crystal': 5,
            'plasma_cell': 8,
            'stealth_alloy': 3
        };

        Object.entries(basicMaterials).forEach(([material, quantity]) => {
            const current = this.manufacturingSystem.getMaterialQuantity(material) || 0;
            if (current < 10) { // Only add if running low
                this.manufacturingSystem.addMaterial(material, quantity);
            }
        });
    }

    setupShipEquipmentProduction() {
        // Connect ship equipment blueprints with ship management system
        const shipEquipment = this.shipManager.getEquipmentCatalog();
        
        // Create manufacturing blueprints for ship equipment
        Object.entries(shipEquipment).forEach(([equipmentId, equipment]) => {
            if (!this.manufacturingSystem.blueprints.has(equipmentId)) {
                const blueprint = this.createEquipmentBlueprint(equipment);
                this.manufacturingSystem.addBlueprint(equipmentId, blueprint);
            }
        });
    }

    createEquipmentBlueprint(equipment) {
        // Generate material requirements based on equipment tier and type
        const baseMaterials = this.getBaseMaterialsForEquipment(equipment);
        const tierMultiplier = this.getTierMultiplier(equipment.tier);
        
        const materials = {};
        Object.entries(baseMaterials).forEach(([material, quantity]) => {
            materials[material] = Math.floor(quantity * tierMultiplier);
        });

        return {
            name: equipment.name,
            category: equipment.category || 'civilian',
            securityLevel: equipment.tier === 3 ? 'Military' : 'Civilian',
            materials: materials,
            productionTime: this.calculateProductionTime(equipment),
            qualityImpact: {
                'Standard': 1.0,
                'High': 1.1,
                'Premium': 1.25,
                'Military': 1.5
            },
            description: equipment.description,
            equipmentData: equipment // Store original equipment data
        };
    }

    getBaseMaterialsForEquipment(equipment) {
        const materialsByType = {
            'mining_laser': { 'aluminum': 20, 'copper': 25, 'silicon': 15, 'titanium': 10 },
            'scanner': { 'silicon': 30, 'copper': 20, 'rare_earth': 10 },
            'cargo_bay': { 'iron': 50, 'aluminum': 30, 'titanium': 15 },
            'power_core': { 'uranium': 5, 'titanium': 25, 'copper': 20, 'quantum_crystal': 3 },
            'shield_generator': { 'plasma_cell': 10, 'titanium': 30, 'rare_earth': 15 },
            'weapon_system': { 'titanium': 40, 'uranium': 8, 'rare_earth': 12, 'plasma_cell': 6 }
        };

        // Determine equipment type from name or category
        for (const [type, materials] of Object.entries(materialsByType)) {
            if (equipment.name.toLowerCase().includes(type.replace('_', ' ')) ||
                equipment.category === type) {
                return materials;
            }
        }

        // Default materials for unknown equipment
        return { 'iron': 20, 'copper': 15, 'aluminum': 10 };
    }

    getTierMultiplier(tier) {
        const multipliers = { 1: 1.0, 2: 1.5, 3: 2.2 };
        return multipliers[tier] || 1.0;
    }

    calculateProductionTime(equipment) {
        const baseTime = 300000; // 5 minutes
        const tierMultiplier = this.getTierMultiplier(equipment.tier);
        return Math.floor(baseTime * tierMultiplier);
    }

    setupCreditIntegration() {
        // Override manufacturing system methods to handle credits
        const originalStartProduction = this.manufacturingSystem.startProduction.bind(this.manufacturingSystem);
        
        this.manufacturingSystem.startProduction = (facilityId, blueprintId, quantity = 1, qualityGrade = 'Standard') => {
            const blueprint = this.manufacturingSystem.blueprints.get(blueprintId);
            if (!blueprint) return { success: false, message: 'Blueprint not found' };

            // Calculate credit cost
            const creditCost = this.calculateProductionCost(blueprint, quantity, qualityGrade);
            
            // Check if player has enough credits
            const currentCredits = this.getCurrentCredits();
            if (currentCredits < creditCost) {
                return { 
                    success: false, 
                    message: `Insufficient credits. Need ${creditCost.toLocaleString()} CR, have ${currentCredits.toLocaleString()} CR` 
                };
            }

            // Deduct credits
            this.deductCredits(creditCost);
            
            // Start production
            const result = originalStartProduction(facilityId, blueprintId, quantity, qualityGrade);
            
            if (result.success) {
                // Add credit cost info to result
                result.creditCost = creditCost;
                result.message += ` (Cost: ${creditCost.toLocaleString()} CR)`;
            }
            
            return result;
        };
    }

    calculateProductionCost(blueprint, quantity, qualityGrade) {
        // Base cost calculation
        let baseCost = 0;
        
        Object.entries(blueprint.materials).forEach(([material, amount]) => {
            const materialCost = this.getMaterialCost(material);
            baseCost += materialCost * amount * quantity;
        });

        // Quality grade multiplier
        const qualityMultipliers = {
            'Standard': 1.0,
            'High': 1.3,
            'Premium': 1.8,
            'Military': 2.5,
            'Classified': 4.0
        };

        const multiplier = qualityMultipliers[qualityGrade] || 1.0;
        
        // Labor and facility costs
        const laborCost = Math.floor(baseCost * 0.2);
        const facilityCost = Math.floor(baseCost * 0.1);
        
        return Math.floor((baseCost + laborCost + facilityCost) * multiplier);
    }

    getMaterialCost(material) {
        // Material value in credits per unit
        const materialCosts = {
            'iron': 10,
            'copper': 15,
            'aluminum': 25,
            'silicon': 30,
            'titanium': 100,
            'rare_earth': 200,
            'uranium': 500,
            'platinum': 800,
            'gold': 600,
            'crystal': 1000,
            'carbon_fiber': 150,
            'quantum_crystal': 2000,
            'plasma_cell': 800,
            'stealth_alloy': 1500,
            'exotic_matter': 5000,
            'nanobots': 1200
        };

        return materialCosts[material] || 50;
    }

    getCurrentCredits() {
        // Get credits from main game system
        if (window.spaceGame && window.spaceGame.player) {
            return window.spaceGame.player.credits || 0;
        }
        return 0;
    }

    deductCredits(amount) {
        if (window.spaceGame && window.spaceGame.player) {
            window.spaceGame.player.credits = Math.max(0, (window.spaceGame.player.credits || 0) - amount);
            
            // Update display
            if (window.statusBar) {
                window.statusBar.updateDisplay();
            }
        }
    }

    addCredits(amount) {
        if (window.spaceGame && window.spaceGame.player) {
            window.spaceGame.player.credits = (window.spaceGame.player.credits || 0) + amount;
            
            // Update display
            if (window.statusBar) {
                window.statusBar.updateDisplay();
            }
        }
    }

    setupMaterialSourcing() {
        // Automatic material purchasing when running low
        this.manufacturingSystem.purchaseMaterials = (material, quantity) => {
            const cost = this.getMaterialCost(material) * quantity;
            const currentCredits = this.getCurrentCredits();
            
            if (currentCredits >= cost) {
                this.deductCredits(cost);
                this.manufacturingSystem.addMaterial(material, quantity);
                return { success: true, cost: cost };
            }
            
            return { success: false, message: 'Insufficient credits for material purchase' };
        };
    }

    // Ship equipment integration
    installManufacturedEquipment(equipmentId, shipId = 'player_ship') {
        const equipment = this.manufacturingSystem.getCompletedProduct(equipmentId);
        if (!equipment) {
            return { success: false, message: 'Equipment not found in completed products' };
        }

        // Convert manufactured equipment to ship equipment format
        const shipEquipment = this.convertToShipEquipment(equipment);
        
        // Install on ship
        const installResult = this.shipManager.installEquipment(shipId, equipmentId, shipEquipment);
        
        if (installResult.success) {
            // Remove from manufacturing inventory
            this.manufacturingSystem.removeCompletedProduct(equipmentId);
        }
        
        return installResult;
    }

    convertToShipEquipment(manufacturedEquipment) {
        const blueprint = manufacturedEquipment.blueprint;
        const quality = manufacturedEquipment.quality;
        
        // Apply quality bonuses to equipment stats
        const qualityMultiplier = blueprint.qualityImpact[quality] || 1.0;
        
        if (blueprint.equipmentData) {
            const equipment = { ...blueprint.equipmentData };
            
            // Apply quality bonuses to numerical properties
            if (equipment.bonus) {
                Object.keys(equipment.bonus).forEach(key => {
                    if (typeof equipment.bonus[key] === 'number') {
                        equipment.bonus[key] = Math.floor(equipment.bonus[key] * qualityMultiplier);
                    }
                });
            }
            
            if (equipment.stats) {
                Object.keys(equipment.stats).forEach(key => {
                    if (typeof equipment.stats[key] === 'number') {
                        equipment.stats[key] = Math.floor(equipment.stats[key] * qualityMultiplier);
                    }
                });
            }
            
            equipment.quality = quality;
            equipment.manufactured = true;
            
            return equipment;
        }
        
        return null;
    }

    // Get manufacturing status for UI integration
    getManufacturingStatus() {
        return {
            facilities: Array.from(this.manufacturingSystem.manufacturingFacilities.values()),
            activeProduction: Array.from(this.manufacturingSystem.productionQueues.values()),
            materials: Array.from(this.manufacturingSystem.materialInventory.entries()),
            completedProducts: this.manufacturingSystem.getCompletedProducts(),
            availableBlueprints: Array.from(this.manufacturingSystem.blueprints.values())
        };
    }

    // Material sourcing from mining
    convertMinedOresToMaterials(playerId = 'player1') {
        const miningInventory = this.miningSystem.getPlayerInventory(playerId) || [];
        let convertedCount = 0;
        
        miningInventory.forEach(ore => {
            if (ore.type && ore.type.endsWith('_ore')) {
                const materialType = ore.type.replace('_ore', '');
                const quantity = ore.quantity || 1;
                
                // Add to manufacturing materials
                this.manufacturingSystem.addMaterial(materialType, quantity);
                convertedCount++;
            }
        });
        
        if (convertedCount > 0) {
            // Clear converted ores from mining inventory
            this.miningSystem.clearPlayerInventory(playerId);
            return { success: true, converted: convertedCount };
        }
        
        return { success: false, message: 'No ores available for conversion' };
    }
}

// Initialize integration system
window.manufacturingIntegration = new ManufacturingIntegration();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.manufacturingIntegration.initialize(), 1000);
    });
} else {
    setTimeout(() => window.manufacturingIntegration.initialize(), 1000);
}
