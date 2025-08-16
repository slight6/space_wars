/**
 * Advanced Manufacturing System - Combat-Aware Architecture
 * Supports civilian equipment, weapon components, and strategic materials
 * Designed for integration with future combat systems
 */

class AdvancedManufacturingSystem {
    constructor() {
        this.manufacturingFacilities = new Map();
        this.productionQueues = new Map();
        this.blueprints = new Map();
        this.materialInventory = new Map();
        this.qualityGrades = ['Standard', 'High', 'Premium', 'Military', 'Classified'];
        this.securityLevels = ['Civilian', 'Commercial', 'Military', 'Special Projects'];
        
        this.initializeBlueprints();
        this.initializeManufacturingFacilities();
    }

    initializeBlueprints() {
        // Civilian Equipment Blueprints
        const civilianBlueprints = {
            'basic_scanner': {
                name: 'Basic Scanner',
                category: 'civilian',
                securityLevel: 'Civilian',
                materials: {
                    'silicon': 25,
                    'copper': 15,
                    'rare_earth': 5
                },
                productionTime: 300000, // 5 minutes
                qualityImpact: {
                    'Standard': 1.0,
                    'High': 1.2,
                    'Premium': 1.5
                },
                description: 'Basic sensor array for ship operations'
            },
            'mining_laser_mk1': {
                name: 'Mining Laser Mk1',
                category: 'civilian',
                securityLevel: 'Civilian',
                materials: {
                    'aluminum': 20,
                    'copper': 30,
                    'silicon': 10,
                    'titanium': 5
                },
                productionTime: 450000, // 7.5 minutes
                qualityImpact: {
                    'Standard': 1.0,
                    'High': 1.3,
                    'Premium': 1.6
                },
                description: 'Standard mining equipment for ore extraction'
            },
            'cargo_expansion_module': {
                name: 'Cargo Expansion Module',
                category: 'civilian',
                securityLevel: 'Civilian',
                materials: {
                    'aluminum': 40,
                    'titanium': 15,
                    'carbon': 20
                },
                productionTime: 600000, // 10 minutes
                qualityImpact: {
                    'Standard': 1.0,
                    'High': 1.25,
                    'Premium': 1.5
                },
                description: 'Expands ship cargo capacity'
            }
        };

        // Combat Equipment Blueprints (Foundation)
        const combatBlueprints = {
            'shield_generator_mk1': {
                name: 'Shield Generator Mk1',
                category: 'combat',
                securityLevel: 'Military',
                materials: {
                    'titanium': 30,
                    'platinum': 10,
                    'rare_earth': 15,
                    'energy_crystals': 5
                },
                productionTime: 900000, // 15 minutes
                qualityImpact: {
                    'Standard': 1.0,
                    'High': 1.4,
                    'Premium': 1.8,
                    'Military': 2.2
                },
                description: 'Basic defensive energy shield system',
                licenseRequired: true
            },
            'laser_turret_component': {
                name: 'Laser Turret Component',
                category: 'combat',
                securityLevel: 'Military',
                materials: {
                    'titanium': 25,
                    'copper': 40,
                    'focusing_crystals': 8,
                    'targeting_computer': 2
                },
                productionTime: 1200000, // 20 minutes
                qualityImpact: {
                    'Standard': 1.0,
                    'High': 1.5,
                    'Premium': 2.0,
                    'Military': 2.5
                },
                description: 'Core component for laser weapon systems',
                licenseRequired: true
            },
            'limpet_mine_basic': {
                name: 'Basic Limpet Mine',
                category: 'combat',
                securityLevel: 'Special Projects',
                materials: {
                    'aluminum': 15,
                    'tracking_device': 1,
                    'magnetic_clamp': 2,
                    'stealth_coating': 3
                },
                productionTime: 1800000, // 30 minutes
                qualityImpact: {
                    'Standard': 1.0,
                    'High': 1.3,
                    'Premium': 1.6,
                    'Military': 2.0,
                    'Classified': 2.5
                },
                description: 'Tracking device that attaches to ship hulls',
                licenseRequired: true,
                specialPermission: 'Intelligence'
            }
        };

        // Strategic Components
        const strategicBlueprints = {
            'targeting_computer': {
                name: 'Targeting Computer',
                category: 'component',
                securityLevel: 'Military',
                materials: {
                    'silicon': 20,
                    'rare_earth': 10,
                    'quantum_processors': 2
                },
                productionTime: 1500000, // 25 minutes
                qualityImpact: {
                    'Standard': 1.0,
                    'High': 1.6,
                    'Premium': 2.2,
                    'Military': 3.0
                },
                description: 'Advanced targeting system for weapons',
                licenseRequired: true
            },
            'focusing_crystals': {
                name: 'Focusing Crystals',
                category: 'component',
                securityLevel: 'Commercial',
                materials: {
                    'silicon': 30,
                    'rare_earth': 20,
                    'energy_crystals': 5
                },
                productionTime: 900000, // 15 minutes
                qualityImpact: {
                    'Standard': 1.0,
                    'High': 1.4,
                    'Premium': 1.8,
                    'Military': 2.3
                },
                description: 'Precision crystals for energy weapon systems'
            },
            'stealth_coating': {
                name: 'Stealth Coating',
                category: 'component',
                securityLevel: 'Special Projects',
                materials: {
                    'carbon': 25,
                    'rare_earth': 15,
                    'quantum_materials': 8
                },
                productionTime: 2700000, // 45 minutes
                qualityImpact: {
                    'Standard': 1.0,
                    'High': 1.5,
                    'Premium': 2.0,
                    'Military': 2.8,
                    'Classified': 3.5
                },
                description: 'Advanced material for stealth applications',
                licenseRequired: true,
                specialPermission: 'Special Operations'
            }
        };

        // Combine all blueprints
        this.blueprints = new Map([
            ...Object.entries(civilianBlueprints),
            ...Object.entries(combatBlueprints),
            ...Object.entries(strategicBlueprints)
        ]);
    }

    initializeManufacturingFacilities() {
        const facilities = {
            'nexus_civilian_fab': {
                name: 'Nexus Civilian Fabrication',
                location: 'Nexus Station',
                securityClearance: ['Civilian', 'Commercial'],
                capabilities: ['civilian', 'component'],
                maxQuality: 'Premium',
                productionSlots: 3,
                efficiency: 1.0,
                specialization: 'civilian'
            },
            'nexus_military_fab': {
                name: 'Nexus Military Manufacturing',
                location: 'Nexus Station - Restricted',
                securityClearance: ['Military', 'Special Projects'],
                capabilities: ['combat', 'component'],
                maxQuality: 'Classified',
                productionSlots: 2,
                efficiency: 1.2,
                specialization: 'combat',
                accessRequirement: 'Military License'
            },
            'orbital_research_fab': {
                name: 'Orbital Research Facility',
                location: 'Keldar Orbit',
                securityClearance: ['Special Projects'],
                capabilities: ['component', 'combat'],
                maxQuality: 'Classified',
                productionSlots: 1,
                efficiency: 1.5,
                specialization: 'experimental',
                accessRequirement: 'Research Clearance'
            }
        };

        this.manufacturingFacilities = new Map(Object.entries(facilities));
    }

    // Start production of an item
    startProduction(playerId, facilityId, blueprintId, quantity = 1, requestedQuality = 'Standard') {
        const facility = this.manufacturingFacilities.get(facilityId);
        const blueprint = this.blueprints.get(blueprintId);

        if (!facility || !blueprint) {
            return { success: false, error: 'Invalid facility or blueprint' };
        }

        // Check security clearance
        if (!facility.securityClearance.includes(blueprint.securityLevel)) {
            return { success: false, error: 'Insufficient security clearance for this facility' };
        }

        // Check access requirements
        if (facility.accessRequirement && !this.hasPlayerAccess(playerId, facility.accessRequirement)) {
            return { success: false, error: `Requires ${facility.accessRequirement}` };
        }

        // Check if quality is available at this facility
        const qualityIndex = this.qualityGrades.indexOf(requestedQuality);
        const maxQualityIndex = this.qualityGrades.indexOf(facility.maxQuality);
        if (qualityIndex > maxQualityIndex) {
            return { success: false, error: `This facility cannot produce ${requestedQuality} quality` };
        }

        // Check material requirements
        const materialCheck = this.checkMaterialRequirements(playerId, blueprint, quantity, requestedQuality);
        if (!materialCheck.canProduce) {
            return { success: false, error: 'Insufficient materials', missing: materialCheck.missing };
        }

        // Check production slots
        const currentQueue = this.getProductionQueue(facilityId);
        if (currentQueue.length >= facility.productionSlots) {
            return { success: false, error: 'Production facility at capacity' };
        }

        // Calculate production time with facility efficiency
        const baseTime = blueprint.productionTime * quantity;
        const adjustedTime = baseTime / facility.efficiency;
        const qualityMultiplier = this.getQualityTimeMultiplier(requestedQuality);
        const totalTime = adjustedTime * qualityMultiplier;

        // Consume materials
        this.consumeMaterials(playerId, blueprint, quantity, requestedQuality);

        // Create production job
        const productionJob = {
            id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            playerId: playerId,
            facilityId: facilityId,
            blueprintId: blueprintId,
            quantity: quantity,
            quality: requestedQuality,
            startTime: Date.now(),
            completionTime: Date.now() + totalTime,
            status: 'in_progress',
            estimatedCompletion: new Date(Date.now() + totalTime).toISOString()
        };

        // Add to production queue
        this.addToProductionQueue(facilityId, productionJob);

        // Schedule completion
        setTimeout(() => {
            this.completeProduction(productionJob.id);
        }, totalTime);

        return {
            success: true,
            productionId: productionJob.id,
            estimatedCompletion: productionJob.estimatedCompletion,
            totalTime: totalTime
        };
    }

    // Complete production and add items to inventory
    completeProduction(productionId) {
        let productionJob = null;
        let facilityId = null;

        // Find the production job
        for (const [fId, queue] of this.productionQueues.entries()) {
            const jobIndex = queue.findIndex(job => job.id === productionId);
            if (jobIndex !== -1) {
                productionJob = queue[jobIndex];
                facilityId = fId;
                queue.splice(jobIndex, 1);
                break;
            }
        }

        if (!productionJob) return;

        const blueprint = this.blueprints.get(productionJob.blueprintId);
        const facility = this.manufacturingFacilities.get(facilityId);

        // Calculate final quality and performance
        const qualityMultiplier = blueprint.qualityImpact[productionJob.quality] || 1.0;
        const facilityBonus = facility.specialization === blueprint.category ? 1.1 : 1.0;
        const finalPerformance = qualityMultiplier * facilityBonus;

        // Create manufactured item
        const manufacturedItem = {
            blueprintId: productionJob.blueprintId,
            name: blueprint.name,
            category: blueprint.category,
            quality: productionJob.quality,
            performance: finalPerformance,
            manufacturer: facility.name,
            productionDate: new Date().toISOString(),
            serialNumber: `${facilityId.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
        };

        // Add to player inventory
        this.addToPlayerInventory(productionJob.playerId, manufacturedItem, productionJob.quantity);

        // Log completion
        console.log(`✅ Production completed: ${productionJob.quantity}x ${blueprint.name} (${productionJob.quality})`);

        // Notify player
        this.notifyProductionComplete(productionJob, manufacturedItem);
    }

    // Check if player has required materials
    checkMaterialRequirements(playerId, blueprint, quantity, quality) {
        const playerMaterials = this.getPlayerMaterials(playerId);
        const qualityMultiplier = this.getQualityMaterialMultiplier(quality);
        const missing = [];
        let canProduce = true;

        for (const [material, baseAmount] of Object.entries(blueprint.materials)) {
            const requiredAmount = Math.ceil(baseAmount * quantity * qualityMultiplier);
            const availableAmount = playerMaterials[material] || 0;

            if (availableAmount < requiredAmount) {
                missing.push({
                    material: material,
                    required: requiredAmount,
                    available: availableAmount,
                    shortage: requiredAmount - availableAmount
                });
                canProduce = false;
            }
        }

        return { canProduce, missing };
    }

    // Get quality multipliers
    getQualityMaterialMultiplier(quality) {
        const multipliers = {
            'Standard': 1.0,
            'High': 1.5,
            'Premium': 2.0,
            'Military': 3.0,
            'Classified': 4.0
        };
        return multipliers[quality] || 1.0;
    }

    getQualityTimeMultiplier(quality) {
        const multipliers = {
            'Standard': 1.0,
            'High': 1.3,
            'Premium': 1.6,
            'Military': 2.0,
            'Classified': 2.5
        };
        return multipliers[quality] || 1.0;
    }

    // Utility functions
    getProductionQueue(facilityId) {
        if (!this.productionQueues.has(facilityId)) {
            this.productionQueues.set(facilityId, []);
        }
        return this.productionQueues.get(facilityId);
    }

    addToProductionQueue(facilityId, job) {
        const queue = this.getProductionQueue(facilityId);
        queue.push(job);
    }

    hasPlayerAccess(playerId, requirement) {
        // TODO: Implement player permission system
        // For now, return true for basic testing
        return true;
    }

    getPlayerMaterials(playerId) {
        // TODO: Integrate with existing inventory system
        // Mock data for testing
        return {
            'silicon': 1000,
            'copper': 800,
            'aluminum': 600,
            'titanium': 200,
            'rare_earth': 150,
            'platinum': 50,
            'carbon': 400,
            'energy_crystals': 25,
            'quantum_processors': 10,
            'tracking_device': 5,
            'magnetic_clamp': 8,
            'quantum_materials': 15
        };
    }

    consumeMaterials(playerId, blueprint, quantity, quality) {
        // TODO: Implement material consumption
        console.log(`🔧 Consuming materials for ${blueprint.name} production`);
    }

    addToPlayerInventory(playerId, item, quantity) {
        // TODO: Integrate with existing inventory system
        console.log(`📦 Added ${quantity}x ${item.name} to player inventory`);
    }

    notifyProductionComplete(job, item) {
        // TODO: Implement notification system
        console.log(`🔔 Production complete: ${job.quantity}x ${item.name} (${item.quality})`);
    }

    // Get available blueprints for player at facility
    getAvailableBlueprints(playerId, facilityId) {
        const facility = this.manufacturingFacilities.get(facilityId);
        if (!facility) return [];

        const available = [];
        for (const [blueprintId, blueprint] of this.blueprints.entries()) {
            // Check if facility can produce this category
            if (!facility.capabilities.includes(blueprint.category)) continue;

            // Check security clearance
            if (!facility.securityClearance.includes(blueprint.securityLevel)) continue;

            // Check access requirements
            if (facility.accessRequirement && !this.hasPlayerAccess(playerId, facility.accessRequirement)) continue;

            available.push({
                id: blueprintId,
                ...blueprint,
                availableQualities: this.getAvailableQualities(facility, blueprint)
            });
        }

        return available;
    }

    getAvailableQualities(facility, blueprint) {
        const maxQualityIndex = this.qualityGrades.indexOf(facility.maxQuality);
        const availableQualities = [];

        for (let i = 0; i <= maxQualityIndex; i++) {
            const quality = this.qualityGrades[i];
            if (blueprint.qualityImpact[quality]) {
                availableQualities.push({
                    name: quality,
                    multiplier: blueprint.qualityImpact[quality],
                    materialMultiplier: this.getQualityMaterialMultiplier(quality),
                    timeMultiplier: this.getQualityTimeMultiplier(quality)
                });
            }
        }

        return availableQualities;
    }

    // Get current production status for all facilities
    getProductionStatus() {
        const status = {};
        for (const [facilityId, facility] of this.manufacturingFacilities.entries()) {
            const queue = this.getProductionQueue(facilityId);
            status[facilityId] = {
                facility: facility,
                activeJobs: queue.length,
                maxSlots: facility.productionSlots,
                queue: queue.map(job => ({
                    id: job.id,
                    item: this.blueprints.get(job.blueprintId)?.name,
                    quantity: job.quantity,
                    quality: job.quality,
                    completion: job.estimatedCompletion,
                    progress: Math.min(1, (Date.now() - job.startTime) / (job.completionTime - job.startTime))
                }))
            };
        }
        return status;
    }
}

// Global instance
const advancedManufacturingSystem = new AdvancedManufacturingSystem();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedManufacturingSystem;
}
