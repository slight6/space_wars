// Advanced Ship Management System for Space Explorer
// Handles detailed ship configurations, loadouts, equipment, and progression

class AdvancedShipManager {
    constructor() {
        this.playerShips = new Map(); // playerId -> [shipInstanceIds]
        this.shipInstances = new Map(); // shipInstanceId -> detailed ship data
        this.loadouts = new Map(); // shipInstanceId -> [loadout1, loadout2, loadout3]
        this.equipmentCatalog = this.initializeEquipmentCatalog();
        this.storageKey = 'advanced_ship_data';
        this.loadShipData();
    }

    // Initialize comprehensive equipment catalog
    initializeEquipmentCatalog() {
        return {
            // Mining Equipment
            mining: {
                'basic_mining_laser': {
                    name: 'Basic Mining Laser',
                    type: 'mining_laser',
                    tier: 1,
                    effects: { miningSpeed: 1.0, efficiency: 0.8, powerDraw: 15 },
                    cost: 5000,
                    description: 'Standard mining laser for basic ore extraction'
                },
                'advanced_mining_laser': {
                    name: 'Advanced Mining Laser',
                    type: 'mining_laser',
                    tier: 2,
                    effects: { miningSpeed: 1.5, efficiency: 1.2, powerDraw: 22 },
                    cost: 25000,
                    requirements: { miningOperations: 50 },
                    description: 'High-efficiency laser for faster ore extraction'
                },
                'quantum_mining_array': {
                    name: 'Quantum Mining Array',
                    type: 'mining_laser',
                    tier: 3,
                    effects: { miningSpeed: 2.5, efficiency: 1.8, powerDraw: 35, rareChance: 0.15 },
                    cost: 75000,
                    requirements: { miningOperations: 200, reputation: 50 },
                    description: 'Military-grade mining system with rare element detection'
                },
                'ore_processing_unit': {
                    name: 'Ore Processing Unit',
                    type: 'refinery',
                    tier: 1,
                    effects: { refineryCapacity: 50, processingSpeed: 1.0, corruption: 0.05 },
                    cost: 50000,
                    description: 'Basic onboard ore refining capability'
                },
                'molecular_refinery': {
                    name: 'Molecular Refinery',
                    type: 'refinery',
                    tier: 2,
                    effects: { refineryCapacity: 150, processingSpeed: 1.8, corruption: 0.02 },
                    cost: 150000,
                    requirements: { refinedProducts: 100 },
                    description: 'Advanced refinery with minimal corruption'
                }
            },

            // Scanner Equipment
            scanners: {
                'basic_spatial_scanner': {
                    name: 'Basic Spatial Scanner',
                    type: 'scanner',
                    tier: 1,
                    effects: { scanRange: 100, scanAccuracy: 0.7, powerDraw: 8 },
                    cost: 3000,
                    description: 'Standard space scanning array'
                },
                'deep_space_scanner': {
                    name: 'Deep Space Scanner',
                    type: 'scanner',
                    tier: 2,
                    effects: { scanRange: 250, scanAccuracy: 0.9, powerDraw: 15, detectsRare: true },
                    cost: 15000,
                    description: 'Long-range scanner with enhanced detection'
                },
                'geological_scanner': {
                    name: 'Geological Scanner',
                    type: 'surface_scanner',
                    tier: 1,
                    effects: { surfaceDetail: 1.5, mineralDetection: 1.2, powerDraw: 12 },
                    cost: 8000,
                    description: 'Specialized scanner for surface mineral analysis'
                },
                'quantum_resonance_scanner': {
                    name: 'Quantum Resonance Scanner',
                    type: 'surface_scanner',
                    tier: 3,
                    effects: { surfaceDetail: 3.0, mineralDetection: 2.5, powerDraw: 25, subsurfaceDepth: 5 },
                    cost: 45000,
                    requirements: { scansCompleted: 100 },
                    description: 'Military scanner capable of deep subsurface analysis'
                }
            },

            // Cargo Systems
            cargo: {
                'standard_cargo_bay': {
                    name: 'Standard Cargo Bay',
                    type: 'cargo',
                    tier: 1,
                    effects: { cargoCapacity: 100, security: 'basic' },
                    cost: 0,
                    description: 'Basic cargo storage'
                },
                'expanded_cargo_bay': {
                    name: 'Expanded Cargo Bay',
                    type: 'cargo',
                    tier: 2,
                    effects: { cargoCapacity: 200, security: 'basic' },
                    cost: 20000,
                    description: 'Increased cargo capacity'
                },
                'secure_cargo_vault': {
                    name: 'Secure Cargo Vault',
                    type: 'cargo',
                    tier: 2,
                    effects: { cargoCapacity: 150, security: 'high', tamperResistant: true },
                    cost: 35000,
                    description: 'Highly secure cargo storage'
                },
                'specialized_ore_containers': {
                    name: 'Specialized Ore Containers',
                    type: 'cargo',
                    tier: 2,
                    effects: { cargoCapacity: 180, oreStorage: 1.5, contamination: 0.02 },
                    cost: 30000,
                    description: 'Optimized containers for ore storage'
                },
                'black_market_compartment': {
                    name: 'Black Market Compartment',
                    type: 'cargo',
                    tier: 3,
                    effects: { hiddenCapacity: 50, security: 'stealth', scanResistant: true },
                    cost: 75000,
                    requirements: { reputation: -25 },
                    description: 'Hidden compartment undetectable by standard scans',
                    hidden: true
                }
            },

            // Power & Propulsion
            power: {
                'basic_reactor': {
                    name: 'Basic Fusion Reactor',
                    type: 'power',
                    tier: 1,
                    effects: { powerOutput: 100, fuelEfficiency: 1.0 },
                    cost: 0,
                    description: 'Standard ship reactor'
                },
                'enhanced_reactor': {
                    name: 'Enhanced Fusion Reactor',
                    type: 'power',
                    tier: 2,
                    effects: { powerOutput: 175, fuelEfficiency: 1.3 },
                    cost: 40000,
                    description: 'Improved reactor with better efficiency'
                },
                'quantum_core': {
                    name: 'Quantum Power Core',
                    type: 'power',
                    tier: 3,
                    effects: { powerOutput: 300, fuelEfficiency: 1.8, emergencyPower: 50 },
                    cost: 100000,
                    requirements: { operatingHours: 500 },
                    description: 'Advanced quantum power generation'
                }
            },

            // Defense Systems
            defense: {
                'basic_shields': {
                    name: 'Basic Shield Generator',
                    type: 'shields',
                    tier: 1,
                    effects: { shieldStrength: 100, rechargeRate: 5, powerDraw: 20 },
                    cost: 0,
                    description: 'Standard defensive shielding'
                },
                'adaptive_shields': {
                    name: 'Adaptive Shield Matrix',
                    type: 'shields',
                    tier: 2,
                    effects: { shieldStrength: 180, rechargeRate: 8, powerDraw: 30, adaptation: 0.1 },
                    cost: 50000,
                    description: 'Shields that adapt to damage types'
                },
                'gravitational_shields': {
                    name: 'Gravitational Field Generator',
                    type: 'shields',
                    tier: 3,
                    effects: { shieldStrength: 300, rechargeRate: 12, powerDraw: 45, gravityField: true },
                    cost: 120000,
                    requirements: { combatExperience: 25 },
                    description: 'Advanced gravity-based defensive system'
                }
            },

            // Utility Systems
            utility: {
                'auto_repair_nanobots': {
                    name: 'Auto-Repair Nanobots',
                    type: 'repair',
                    tier: 2,
                    effects: { hullRepairRate: 2, systemRepairRate: 1, nanobotsCapacity: 100 },
                    cost: 60000,
                    description: 'Automated repair systems for hull and components'
                },
                'cloaking_device': {
                    name: 'Cloaking Device',
                    type: 'stealth',
                    tier: 3,
                    effects: { cloakDuration: 300, powerDraw: 80, detection: 0.05 },
                    cost: 200000,
                    requirements: { reputation: 75, stealthMissions: 10 },
                    description: 'Advanced cloaking technology'
                },
                'life_support_upgrade': {
                    name: 'Enhanced Life Support',
                    type: 'life_support',
                    tier: 2,
                    effects: { crewCapacity: 1.5, oxygenEfficiency: 1.4, emergencyDuration: 48 },
                    cost: 25000,
                    description: 'Improved life support systems'
                }
            }
        };
    }

    // Predefined loadout configurations
    getLoadoutPresets() {
        return {
            mining: {
                name: 'Mining Operations',
                description: 'Optimized for resource extraction and processing',
                icon: '⛏️',
                equipment: {
                    mining_laser: 'advanced_mining_laser',
                    scanner: 'geological_scanner',
                    cargo: 'specialized_ore_containers',
                    refinery: 'ore_processing_unit',
                    power: 'enhanced_reactor'
                },
                powerAllocation: {
                    mining: 40,
                    scanners: 25,
                    propulsion: 20,
                    shields: 10,
                    life_support: 5
                }
            },
            exploration: {
                name: 'Deep Space Exploration',
                description: 'Long-range scanning and navigation',
                icon: '🔍',
                equipment: {
                    scanner: 'deep_space_scanner',
                    surface_scanner: 'quantum_resonance_scanner',
                    cargo: 'expanded_cargo_bay',
                    power: 'quantum_core',
                    life_support: 'life_support_upgrade'
                },
                powerAllocation: {
                    scanners: 45,
                    propulsion: 25,
                    life_support: 15,
                    shields: 10,
                    mining: 5
                }
            },
            combat: {
                name: 'Combat Ready',
                description: 'Maximum defensive and offensive capabilities',
                icon: '⚔️',
                equipment: {
                    shields: 'gravitational_shields',
                    power: 'quantum_core',
                    cargo: 'secure_cargo_vault',
                    stealth: 'cloaking_device',
                    repair: 'auto_repair_nanobots'
                },
                powerAllocation: {
                    shields: 35,
                    weapons: 30,
                    propulsion: 20,
                    stealth: 10,
                    life_support: 5
                }
            }
        };
    }

    // Create new ship instance for player
    createShipInstance(playerId, shipBlueprint, customName = null) {
        const instanceId = this.generateShipInstanceId();
        const timestamp = new Date().toISOString();
        
        const shipInstance = {
            instanceId: instanceId,
            playerId: playerId,
            shipName: customName || shipBlueprint.display_name || 'Unnamed Ship',
            blueprintId: shipBlueprint.ship_class,
            status: 'docked',
            createdDate: timestamp,
            lastModified: timestamp,
            
            // Current ship status
            currentStatus: {
                location: { x: 0, y: 0, z: 0, name: 'Space Station Nexus' },
                docked: true,
                fuel: 100,
                hull: 100,
                shields: 100,
                power: 100,
                operatingHours: 0,
                condition: 100
            },

            // Installed equipment
            installedEquipment: {
                mining_laser: 'basic_mining_laser',
                scanner: 'basic_spatial_scanner',
                cargo: 'standard_cargo_bay',
                power: 'basic_reactor',
                shields: 'basic_shields'
            },

            // Current loadout (0, 1, or 2)
            activeLoadout: 0,
            
            // Three saveable loadout configurations
            loadouts: [
                { ...this.getLoadoutPresets().mining, name: 'Mining Config' },
                { ...this.getLoadoutPresets().exploration, name: 'Exploration Config' },
                { ...this.getLoadoutPresets().combat, name: 'Combat Config' }
            ],

            // Cargo and inventory
            cargoInventory: {
                ores: {},
                refinedProducts: {},
                equipment: {},
                general: {}
            },
            cargoUsed: 0,

            // Ship logs and history
            maintenanceLog: [],
            operationLog: [],
            upgradeHistory: [],
            
            // Performance statistics
            statistics: {
                totalMined: 0,
                totalRefined: 0,
                scansCompleted: 0,
                distanceTraveled: 0,
                operationsCompleted: 0,
                creditsEarned: 0,
                efficiency: {
                    mining: 1.0,
                    scanning: 1.0,
                    fuel: 1.0,
                    overall: 1.0
                }
            },

            // Current power allocation
            powerAllocation: {
                mining: 30,
                scanners: 20,
                propulsion: 25,
                shields: 15,
                life_support: 10
            }
        };

        // Add to player's ships
        if (!this.playerShips.has(playerId)) {
            this.playerShips.set(playerId, []);
        }
        this.playerShips.get(playerId).push(instanceId);
        this.shipInstances.set(instanceId, shipInstance);

        this.saveShipData();
        return shipInstance;
    }

    // Get detailed ship information
    getShipDetails(instanceId) {
        const ship = this.shipInstances.get(instanceId);
        if (!ship) return null;

        const equipmentDetails = this.calculateShipCapabilities(ship);
        
        return {
            ...ship,
            capabilities: equipmentDetails,
            currentLoadout: ship.loadouts[ship.activeLoadout],
            availableUpgrades: this.getAvailableUpgrades(ship),
            maintenanceNeeded: this.calculateMaintenanceNeeds(ship),
            efficiency: this.calculateOperatingEfficiency(ship)
        };
    }

    // Calculate ship capabilities based on installed equipment
    calculateShipCapabilities(ship) {
        const capabilities = {
            mining: { speed: 1.0, efficiency: 1.0, rareChance: 0.05 },
            scanning: { range: 100, accuracy: 0.7, surfaceDetail: 1.0 },
            cargo: { capacity: 100, security: 'basic', specialization: 'none' },
            power: { output: 100, efficiency: 1.0, emergency: 0 },
            defense: { shields: 100, rechargeRate: 5, special: 'none' },
            refinery: { capacity: 0, speed: 0, corruption: 0.15 }
        };

        // Apply equipment bonuses
        for (const [slot, equipmentId] of Object.entries(ship.installedEquipment)) {
            const equipment = this.findEquipmentById(equipmentId);
            if (equipment && equipment.effects) {
                this.applyEquipmentEffects(capabilities, equipment.effects);
            }
        }

        // Apply power allocation modifiers
        const powerMod = ship.powerAllocation;
        capabilities.mining.speed *= (powerMod.mining / 30);
        capabilities.scanning.range *= (powerMod.scanners / 20);
        capabilities.defense.shields *= (powerMod.shields / 15);

        return capabilities;
    }

    // Find equipment by ID across all categories
    findEquipmentById(equipmentId) {
        for (const category of Object.values(this.equipmentCatalog)) {
            if (category[equipmentId]) {
                return { id: equipmentId, ...category[equipmentId] };
            }
        }
        return null;
    }

    // Apply equipment effects to ship capabilities
    applyEquipmentEffects(capabilities, effects) {
        if (effects.miningSpeed) capabilities.mining.speed *= effects.miningSpeed;
        if (effects.efficiency) capabilities.mining.efficiency *= effects.efficiency;
        if (effects.rareChance) capabilities.mining.rareChance += effects.rareChance;
        if (effects.scanRange) capabilities.scanning.range = Math.max(capabilities.scanning.range, effects.scanRange);
        if (effects.scanAccuracy) capabilities.scanning.accuracy = Math.max(capabilities.scanning.accuracy, effects.scanAccuracy);
        if (effects.cargoCapacity) capabilities.cargo.capacity = Math.max(capabilities.cargo.capacity, effects.cargoCapacity);
        if (effects.powerOutput) capabilities.power.output = Math.max(capabilities.power.output, effects.powerOutput);
        if (effects.shieldStrength) capabilities.defense.shields = Math.max(capabilities.defense.shields, effects.shieldStrength);
        if (effects.refineryCapacity) capabilities.refinery.capacity = Math.max(capabilities.refinery.capacity, effects.refineryCapacity);
        if (effects.corruption !== undefined) capabilities.refinery.corruption = Math.min(capabilities.refinery.corruption, effects.corruption);
    }

    // Switch between loadout configurations
    switchLoadout(instanceId, loadoutIndex) {
        const ship = this.shipInstances.get(instanceId);
        if (!ship || loadoutIndex < 0 || loadoutIndex >= ship.loadouts.length) {
            throw new Error('Invalid ship or loadout index');
        }

        const oldLoadout = ship.activeLoadout;
        ship.activeLoadout = loadoutIndex;
        ship.lastModified = new Date().toISOString();

        // Apply new loadout equipment
        const newLoadout = ship.loadouts[loadoutIndex];
        if (newLoadout.equipment) {
            Object.assign(ship.installedEquipment, newLoadout.equipment);
        }
        if (newLoadout.powerAllocation) {
            Object.assign(ship.powerAllocation, newLoadout.powerAllocation);
        }

        // Log the change
        this.addOperationLog(ship, 'loadout_change', {
            from: oldLoadout,
            to: loadoutIndex,
            loadoutName: newLoadout.name
        });

        this.saveShipData();
        return this.getShipDetails(instanceId);
    }

    // Install equipment on ship
    installEquipment(instanceId, equipmentId, slot) {
        const ship = this.shipInstances.get(instanceId);
        const equipment = this.findEquipmentById(equipmentId);
        
        if (!ship || !equipment) {
            throw new Error('Invalid ship or equipment');
        }

        // Check requirements
        if (equipment.requirements && !this.meetsRequirements(ship, equipment.requirements)) {
            throw new Error('Equipment requirements not met');
        }

        const oldEquipment = ship.installedEquipment[slot];
        ship.installedEquipment[slot] = equipmentId;
        ship.lastModified = new Date().toISOString();

        // Add to upgrade history
        ship.upgradeHistory.push({
            timestamp: new Date().toISOString(),
            action: 'install',
            slot: slot,
            equipmentId: equipmentId,
            oldEquipment: oldEquipment
        });

        this.addOperationLog(ship, 'equipment_install', {
            slot: slot,
            equipment: equipment.name,
            replaced: oldEquipment
        });

        this.saveShipData();
        return this.getShipDetails(instanceId);
    }

    // Check if ship meets equipment requirements
    meetsRequirements(ship, requirements) {
        const stats = ship.statistics;
        
        if (requirements.miningOperations && stats.totalMined < requirements.miningOperations) return false;
        if (requirements.refinedProducts && stats.totalRefined < requirements.refinedProducts) return false;
        if (requirements.scansCompleted && stats.scansCompleted < requirements.scansCompleted) return false;
        if (requirements.operatingHours && ship.currentStatus.operatingHours < requirements.operatingHours) return false;
        if (requirements.reputation) {
            // Would need to check player reputation
            return true; // Placeholder
        }
        
        return true;
    }

    // Get available equipment upgrades
    getAvailableUpgrades(ship) {
        const upgrades = [];
        
        for (const [category, equipment] of Object.entries(this.equipmentCatalog)) {
            for (const [equipmentId, equipmentData] of Object.entries(equipment)) {
                if (this.meetsRequirements(ship, equipmentData.requirements || {})) {
                    upgrades.push({
                        id: equipmentId,
                        category: category,
                        ...equipmentData,
                        isUpgrade: this.isUpgradeFromCurrent(ship, equipmentId, equipmentData.type)
                    });
                }
            }
        }
        
        return upgrades.sort((a, b) => a.tier - b.tier);
    }

    // Check if equipment is an upgrade from currently installed
    isUpgradeFromCurrent(ship, equipmentId, equipmentType) {
        const currentEquipment = Object.values(ship.installedEquipment);
        const current = currentEquipment.find(eq => {
            const equipment = this.findEquipmentById(eq);
            return equipment && equipment.type === equipmentType;
        });
        
        if (!current) return true;
        
        const currentData = this.findEquipmentById(current);
        const newData = this.findEquipmentById(equipmentId);
        
        return newData && currentData && newData.tier > currentData.tier;
    }

    // Add operation to ship log
    addOperationLog(ship, operation, details) {
        ship.operationLog.push({
            timestamp: new Date().toISOString(),
            operation: operation,
            details: details
        });

        // Keep only last 100 log entries
        if (ship.operationLog.length > 100) {
            ship.operationLog = ship.operationLog.slice(-100);
        }
    }

    // Calculate maintenance needs
    calculateMaintenanceNeeds(ship) {
        const needs = {
            hull: 0,
            systems: 0,
            equipment: 0,
            overall: 0
        };

        const condition = ship.currentStatus.condition;
        const operatingHours = ship.currentStatus.operatingHours;

        // Hull maintenance based on condition and hours
        needs.hull = Math.max(0, (100 - condition) + (operatingHours / 50));
        
        // Systems maintenance based on operating hours
        needs.systems = Math.max(0, operatingHours / 100);
        
        // Equipment maintenance based on usage
        needs.equipment = Object.keys(ship.installedEquipment).length * (operatingHours / 200);
        
        needs.overall = (needs.hull + needs.systems + needs.equipment) / 3;
        
        return needs;
    }

    // Calculate operating efficiency
    calculateOperatingEfficiency(ship) {
        const capabilities = this.calculateShipCapabilities(ship);
        const maintenance = this.calculateMaintenanceNeeds(ship);
        
        // Efficiency decreases with maintenance needs
        const maintenancePenalty = Math.max(0, 1 - (maintenance.overall / 100));
        
        return {
            mining: capabilities.mining.efficiency * maintenancePenalty,
            scanning: capabilities.scanning.accuracy * maintenancePenalty,
            fuel: capabilities.power.efficiency * maintenancePenalty,
            overall: maintenancePenalty
        };
    }

    // Update ship statistics after operations
    updateShipStatistics(instanceId, operation, amount = 1) {
        const ship = this.shipInstances.get(instanceId);
        if (!ship) return;

        const stats = ship.statistics;
        
        switch (operation) {
            case 'mining':
                stats.totalMined += amount;
                stats.operationsCompleted += 1;
                break;
            case 'refining':
                stats.totalRefined += amount;
                stats.operationsCompleted += 1;
                break;
            case 'scanning':
                stats.scansCompleted += amount;
                stats.operationsCompleted += 1;
                break;
            case 'travel':
                stats.distanceTraveled += amount;
                break;
            case 'credits':
                stats.creditsEarned += amount;
                break;
        }

        // Update operating hours
        ship.currentStatus.operatingHours += 0.1; // Small increment per operation

        // Update efficiency based on experience
        stats.efficiency.mining = Math.min(2.0, 1.0 + (stats.totalMined / 1000));
        stats.efficiency.scanning = Math.min(2.0, 1.0 + (stats.scansCompleted / 500));
        stats.efficiency.overall = (stats.efficiency.mining + stats.efficiency.scanning + stats.efficiency.fuel) / 3;

        ship.lastModified = new Date().toISOString();
        this.saveShipData();
    }

    // Get player's ships
    getPlayerShips(playerId) {
        const shipIds = this.playerShips.get(playerId) || [];
        return shipIds.map(id => this.getShipDetails(id)).filter(Boolean);
    }

    // Get player's primary ship
    getPlayerPrimaryShip(playerId) {
        const ships = this.getPlayerShips(playerId);
        return ships.length > 0 ? ships[0] : null;
    }

    // Generate unique ship instance ID
    generateShipInstanceId() {
        return `ship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Save ship data to localStorage
    saveShipData() {
        try {
            const data = {
                playerShips: Array.from(this.playerShips.entries()),
                shipInstances: Array.from(this.shipInstances.entries()),
                timestamp: Date.now()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving ship data:', error);
        }
    }

    // Load ship data from localStorage
    loadShipData() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                this.playerShips = new Map(data.playerShips || []);
                this.shipInstances = new Map(data.shipInstances || []);
                console.log(`Loaded ${this.shipInstances.size} advanced ship instances`);
            }
        } catch (error) {
            console.error('Error loading ship data:', error);
        }
    }
}

// Initialize the advanced ship management system
if (typeof window !== 'undefined') {
    window.AdvancedShipManager = AdvancedShipManager;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedShipManager;
}
