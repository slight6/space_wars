/**
 * Ship-Mining Integration System
 * Connects the advanced ship management system with mining operations
 * to provide equipment bonuses and progression tracking
 */

class ShipMiningIntegration {
    constructor() {
        this.shipManager = null;
        this.miningSystem = null;
        this.initialized = false;
    }

    initialize(shipManager, miningSystem) {
        this.shipManager = shipManager;
        this.miningSystem = miningSystem;
        this.initialized = true;
        console.log('Ship-Mining Integration initialized');
    }

    // Calculate mining bonuses based on ship equipment
    calculateMiningBonuses(shipInstanceId) {
        if (!this.initialized || !this.shipManager) {
            return { speed: 1.0, yield: 1.0, efficiency: 1.0 };
        }

        const ship = this.shipManager.shipInstances.get(shipInstanceId);
        if (!ship) {
            return { speed: 1.0, yield: 1.0, efficiency: 1.0 };
        }

        let bonuses = { speed: 1.0, yield: 1.0, efficiency: 1.0 };

        // Mining laser bonuses
        const miningLaser = ship.installedEquipment.mining_laser;
        if (miningLaser) {
            const equipment = this.shipManager.findEquipmentById(miningLaser);
            if (equipment) {
                bonuses.speed *= (equipment.bonuses?.mining_speed || 1.0);
                bonuses.yield *= (equipment.bonuses?.mining_yield || 1.0);
            }
        }

        // Scanner bonuses for better ore detection
        const scanner = ship.installedEquipment.scanner;
        if (scanner) {
            const equipment = this.shipManager.findEquipmentById(scanner);
            if (equipment && equipment.bonuses?.ore_detection) {
                bonuses.yield *= equipment.bonuses.ore_detection;
            }
        }

        // Refinery bonuses for processing
        const refinery = ship.installedEquipment.refinery;
        if (refinery) {
            const equipment = this.shipManager.findEquipmentById(refinery);
            if (equipment) {
                bonuses.efficiency *= (equipment.bonuses?.refinery_efficiency || 1.0);
            }
        }

        // Power system bonuses
        const powerCore = ship.installedEquipment.power;
        if (powerCore) {
            const equipment = this.shipManager.findEquipmentById(powerCore);
            if (equipment && equipment.bonuses?.system_efficiency) {
                bonuses.efficiency *= equipment.bonuses.system_efficiency;
            }
        }

        // Loadout bonuses
        if (ship.currentLoadout?.name === 'Mining Operations') {
            bonuses.speed *= 1.25;
            bonuses.efficiency *= 1.15;
        }

        // Ship condition affects efficiency
        const conditionFactor = ship.currentStatus.condition / 100;
        bonuses.efficiency *= (0.5 + (conditionFactor * 0.5)); // 50% to 100% efficiency based on condition

        return bonuses;
    }

    // Update ship statistics after mining operation
    updateShipAfterMining(shipInstanceId, miningResults) {
        if (!this.initialized || !this.shipManager) return;

        const ship = this.shipManager.shipInstances.get(shipInstanceId);
        if (!ship) return;

        // Update statistics
        ship.statistics.totalMined += miningResults.totalYield || 0;
        ship.statistics.operationsCompleted += 1;
        ship.statistics.creditsEarned += miningResults.creditsEarned || 0;

        // Add to operation log
        this.shipManager.addOperationLog(ship, 'mining_operation', {
            location: miningResults.location,
            yield: miningResults.totalYield,
            duration: miningResults.duration,
            efficiency: miningResults.efficiency
        });

        // Increase operating hours
        ship.currentStatus.operatingHours += (miningResults.duration || 1) / 60; // Convert minutes to hours

        // Equipment wear based on operation intensity
        const wearFactor = (miningResults.totalYield || 0) / 1000; // Wear based on yield
        this.addEquipmentWear(ship, wearFactor);

        // Update ship condition based on operation stress
        const conditionLoss = Math.random() * 2 + (wearFactor * 0.5); // 0.5-2.5% condition loss
        ship.currentStatus.condition = Math.max(0, ship.currentStatus.condition - conditionLoss);

        // Save changes
        this.shipManager.saveShipData();
    }

    // Add wear to ship equipment
    addEquipmentWear(ship, wearFactor) {
        // Increase maintenance needs
        ship.maintenanceNeeded.equipment += wearFactor * 2;
        ship.maintenanceNeeded.systems += wearFactor * 1.5;
        ship.maintenanceNeeded.overall = Math.min(100, 
            (ship.maintenanceNeeded.equipment + ship.maintenanceNeeded.systems + ship.maintenanceNeeded.hull) / 3
        );
    }

    // Get current ship for player (utility function)
    getCurrentPlayerShip(playerName) {
        if (!this.initialized || !this.shipManager) return null;

        const playerShips = this.shipManager.getPlayerShips(playerName);
        if (playerShips.length === 0) return null;

        // Return first active ship or first ship if none active
        return playerShips.find(ship => ship.currentStatus.active) || playerShips[0];
    }

    // Calculate cargo capacity bonus
    getCargoCapacityBonus(shipInstanceId) {
        if (!this.initialized || !this.shipManager) return 1.0;

        const ship = this.shipManager.shipInstances.get(shipInstanceId);
        if (!ship) return 1.0;

        let capacityMultiplier = 1.0;

        // Cargo system bonuses
        const cargoSystem = ship.installedEquipment.cargo;
        if (cargoSystem) {
            const equipment = this.shipManager.findEquipmentById(cargoSystem);
            if (equipment?.bonuses?.cargo_capacity) {
                capacityMultiplier *= equipment.bonuses.cargo_capacity;
            }
        }

        return capacityMultiplier;
    }

    // Calculate fuel consumption modifier
    getFuelEfficiencyBonus(shipInstanceId) {
        if (!this.initialized || !this.shipManager) return 1.0;

        const ship = this.shipManager.shipInstances.get(shipInstanceId);
        if (!ship) return 1.0;

        let efficiencyMultiplier = 1.0;

        // Power core efficiency
        const powerCore = ship.installedEquipment.power;
        if (powerCore) {
            const equipment = this.shipManager.findEquipmentById(powerCore);
            if (equipment?.bonuses?.fuel_efficiency) {
                efficiencyMultiplier *= equipment.bonuses.fuel_efficiency;
            }
        }

        // Ship condition affects fuel efficiency
        const conditionFactor = ship.currentStatus.condition / 100;
        efficiencyMultiplier *= (0.7 + (conditionFactor * 0.3)); // 70% to 100% efficiency

        return efficiencyMultiplier;
    }

    // Update ship cargo after selling/trading
    updateShipCargo(shipInstanceId, cargoChanges) {
        if (!this.initialized || !this.shipManager) return;

        const ship = this.shipManager.shipInstances.get(shipInstanceId);
        if (!ship) return;

        // Initialize cargo inventory if needed
        if (!ship.cargoInventory) {
            ship.cargoInventory = {
                ores: {},
                refinedProducts: {},
                equipment: {},
                other: {}
            };
        }

        // Apply cargo changes
        if (cargoChanges.ores) {
            for (const [oreType, quantity] of Object.entries(cargoChanges.ores)) {
                ship.cargoInventory.ores[oreType] = (ship.cargoInventory.ores[oreType] || 0) + quantity;
                if (ship.cargoInventory.ores[oreType] <= 0) {
                    delete ship.cargoInventory.ores[oreType];
                }
            }
        }

        if (cargoChanges.refinedProducts) {
            for (const [productType, quantity] of Object.entries(cargoChanges.refinedProducts)) {
                ship.cargoInventory.refinedProducts[productType] = (ship.cargoInventory.refinedProducts[productType] || 0) + quantity;
                if (ship.cargoInventory.refinedProducts[productType] <= 0) {
                    delete ship.cargoInventory.refinedProducts[productType];
                }
            }
        }

        // Recalculate total cargo used
        this.recalculateCargoUsage(ship);

        // Save changes
        this.shipManager.saveShipData();
    }

    // Recalculate total cargo usage
    recalculateCargoUsage(ship) {
        let totalUsed = 0;

        // Count ores
        for (const quantity of Object.values(ship.cargoInventory?.ores || {})) {
            totalUsed += quantity;
        }

        // Count refined products
        for (const quantity of Object.values(ship.cargoInventory?.refinedProducts || {})) {
            totalUsed += quantity;
        }

        // Count equipment (each piece takes 10 units)
        for (const quantity of Object.values(ship.cargoInventory?.equipment || {})) {
            totalUsed += quantity * 10;
        }

        ship.cargoUsed = totalUsed;
    }

    // Check if ship can carry additional cargo
    canCarryAdditionalCargo(shipInstanceId, additionalUnits) {
        if (!this.initialized || !this.shipManager) return false;

        const ship = this.shipManager.shipInstances.get(shipInstanceId);
        if (!ship) return false;

        const currentUsed = ship.cargoUsed || 0;
        const capacity = (ship.capabilities?.cargo?.capacity || 100) * this.getCargoCapacityBonus(shipInstanceId);
        
        return (currentUsed + additionalUnits) <= capacity;
    }

    // Get ship status for mining UI
    getShipStatusForMining(shipInstanceId) {
        if (!this.initialized || !this.shipManager) return null;

        const ship = this.shipManager.shipInstances.get(shipInstanceId);
        if (!ship) return null;

        const bonuses = this.calculateMiningBonuses(shipInstanceId);
        const cargoBonus = this.getCargoCapacityBonus(shipInstanceId);
        const fuelBonus = this.getFuelEfficiencyBonus(shipInstanceId);

        return {
            shipName: ship.shipName,
            condition: ship.currentStatus.condition,
            fuel: ship.currentStatus.fuel,
            power: ship.currentStatus.power,
            cargoUsed: ship.cargoUsed || 0,
            cargoCapacity: Math.floor((ship.capabilities?.cargo?.capacity || 100) * cargoBonus),
            currentLoadout: ship.currentLoadout?.name || 'Default',
            bonuses: {
                miningSpeed: bonuses.speed,
                miningYield: bonuses.yield,
                efficiency: bonuses.efficiency,
                cargoCapacity: cargoBonus,
                fuelEfficiency: fuelBonus
            },
            maintenanceNeeded: ship.maintenanceNeeded?.overall || 0,
            operatingHours: Math.floor(ship.currentStatus.operatingHours || 0)
        };
    }
}

// Global instance
const shipMiningIntegration = new ShipMiningIntegration();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShipMiningIntegration;
}
