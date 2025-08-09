/**
 * Ship Management System
 * Handles ship data, purchasing, upgrades, and ownership
 */

class ShipManager {
    constructor() {
        this.ships = [];
        this.playerShips = new Map(); // playerId -> [shipIds]
        this.shipInstances = new Map(); // shipInstanceId -> shipData
        this.storageKey = 'ship_data';
        this.loadShipData();
    }

    async loadShipData() {
        try {
            // Load ship definitions from ships.json
            const response = await fetch('./ships.json');
            this.ships = await response.json();
            console.log(`Loaded ${this.ships.length} ship definitions`);
            
            // Load player ship instances from localStorage
            this.loadPlayerShips();
        } catch (error) {
            console.error('Error loading ship data:', error);
            // Fallback to basic ship if file not found
            this.ships = this.getDefaultShips();
        }
    }

    loadPlayerShips() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                this.playerShips = new Map(data.playerShips || []);
                this.shipInstances = new Map(data.shipInstances || []);
                console.log(`Loaded ${this.shipInstances.size} player ship instances`);
            }
        } catch (error) {
            console.error('Error loading player ships:', error);
        }
    }

    savePlayerShips() {
        try {
            const data = {
                playerShips: Array.from(this.playerShips.entries()),
                shipInstances: Array.from(this.shipInstances.entries())
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving player ships:', error);
        }
    }

    // Get all available ship definitions
    getAllShips() {
        return this.ships;
    }

    // Get ship definition by ID
    getShipDefinition(shipId) {
        return this.ships.find(ship => ship.id === shipId);
    }

    // Get ships available for purchase by player
    getAvailableShips(player) {
        return this.ships.filter(ship => this.canPlayerAccessShip(player, ship));
    }

    // Get all ships regardless of requirements (for admin mode)
    getAllShips() {
        return [...this.ships];
    }

    // Check if player meets requirements for a ship
    canPlayerAccessShip(player, ship) {
        const req = ship.requirements;
        
        // Check credits
        if (player.credits < req.credits) return false;
        
        // Check reputation
        if (player.reputation < req.reputation) return false;
        
        // Check licenses
        if (req.licenses) {
            for (const license of req.licenses) {
                if (!this.hasLicense(player, license)) return false;
            }
        }
        
        // Check special requirements
        if (req.military_service && !player.militaryService) return false;
        if (req.faction_membership && !player.factionMembership) return false;
        if (req.government_clearance && !player.governmentClearance) return false;
        if (req.corporate_ceo && !player.corporateCEO) return false;
        if (req.faction_leader && !player.factionLeader) return false;
        if (req.military_rank && player.militaryRank !== req.military_rank) return false;
        
        return true;
    }

    hasLicense(player, licenseType) {
        return player.licenses && 
               player.licenses[licenseType] && 
               player.licenses[licenseType].status === 'active';
    }

    // Purchase a ship for a player
    purchaseShip(playerId, shipId, customName = null, adminMode = false) {
        const shipDef = this.getShipDefinition(shipId);
        if (!shipDef) {
            throw new Error(`Ship ${shipId} not found`);
        }

        const player = this.getPlayer(playerId);
        
        // Skip requirements check in admin mode
        if (!adminMode && !this.canPlayerAccessShip(player, shipDef)) {
            throw new Error('Player does not meet ship requirements');
        }

        if (player.credits < shipDef.base_price) {
            throw new Error('Insufficient credits');
        }

        // Create ship instance
        const instanceId = this.generateShipInstanceId();
        const shipInstance = {
            instanceId: instanceId,
            shipId: shipId,
            playerId: playerId,
            customName: customName || shipDef.name,
            purchaseDate: new Date().toISOString(),
            currentCondition: 100,
            upgrades: [],
            modifications: {},
            operatingHours: 0,
            maintenanceLog: [],
            location: player.currentLocation || { x: 0, y: 0, z: 0 }
        };

        // Deduct credits
        player.credits -= shipDef.base_price;
        
        // Add to player's ships
        if (!this.playerShips.has(playerId)) {
            this.playerShips.set(playerId, []);
        }
        this.playerShips.get(playerId).push(instanceId);
        this.shipInstances.set(instanceId, shipInstance);
        
        // Save changes
        this.savePlayerShips();
        this.savePlayer(player);
        
        // Transaction logging
        if (window.GameDataManager) {
            window.GameDataManager.saveTransaction({
                playerId: playerId,
                type: 'purchase',
                itemName: shipDef.name,
                totalAmount: shipDef.requirements.credits,
                creditsBefore: player.credits + shipDef.requirements.credits,
                creditsAfter: player.credits,
                description: `Purchased ship: ${shipDef.name}`,
                metadata: { shipInstanceId: instanceId, shipId: shipId }
            });
        }

        return shipInstance;
    }

    // Get player's ships
    getPlayerShips(playerId) {
        const shipIds = this.playerShips.get(playerId) || [];
        return shipIds.map(id => this.getShipInstance(id)).filter(Boolean);
    }

    // Get ship instance
    getShipInstance(instanceId) {
        return this.shipInstances.get(instanceId);
    }

    // Get full ship data (definition + instance)
    getFullShipData(instanceId) {
        const instance = this.getShipInstance(instanceId);
        if (!instance) return null;
        
        const definition = this.getShipDefinition(instance.shipId);
        return {
            ...definition,
            instance: instance
        };
    }

    // Calculate operating costs for a ship
    calculateOperatingCosts(shipId, operatingHours = 1) {
        const ship = this.getShipDefinition(shipId);
        if (!ship) return 0;
        
        const costs = ship.operating_costs;
        return (costs.maintenance_cost * operatingHours / 24) + // Daily maintenance
               (costs.crew_wages * operatingHours / 24) + // Daily wages
               (costs.fuel_consumption * operatingHours * 10); // Fuel cost per hour
    }

    // Ship comparison utility
    compareShips(shipIds) {
        return shipIds.map(id => this.getShipDefinition(id)).filter(Boolean);
    }

    // Get ships by class
    getShipsByClass(className) {
        return this.ships.filter(ship => ship.class === className);
    }

    // Get ships by role
    getShipsByRole(role) {
        return this.ships.filter(ship => ship.role === role);
    }

    // Generate ship progression recommendations
    getUpgradeRecommendations(playerId) {
        const playerShips = this.getPlayerShips(playerId);
        const player = this.getPlayer(playerId);
        const available = this.getAvailableShips(player);
        
        const recommendations = [];
        
        for (const currentShip of playerShips) {
            const currentDef = this.getShipDefinition(currentShip.shipId);
            
            // Find better ships in same role
            const betterShips = available.filter(ship => 
                ship.role === currentDef.role && 
                ship.power_output > currentDef.power_output
            );
            
            if (betterShips.length > 0) {
                recommendations.push({
                    currentShip: currentDef,
                    upgradeOptions: betterShips.slice(0, 3), // Top 3 options
                    reason: `Better ${currentDef.role.toLowerCase()} options available`
                });
            }
        }
        
        return recommendations;
    }

    // Utility methods
    generateShipInstanceId() {
        return 'ship_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getPlayer(playerId) {
        const currentPlayer = localStorage.getItem('currentPlayer');
        if (currentPlayer) {
            const player = JSON.parse(currentPlayer);
            if (player.username === playerId || player.id === playerId) {
                return player;
            }
        }
        throw new Error('Player not found');
    }

    savePlayer(player) {
        localStorage.setItem('currentPlayer', JSON.stringify(player));
    }

    // Default ships for fallback
    getDefaultShips() {
        return [
            {
                id: "scout_explorer_01",
                name: "Starling Explorer",
                class: "Scout",
                role: "Explorer",
                speed: 8,
                defense: 3,
                cargo_capacity: 20,
                crew_capacity: 5,
                range: 15,
                power_output: 100,
                life_support: "Basic",
                propulsion: "Ion Drive",
                special_bonus: "Enhanced sensor range",
                base_price: 50000,
                requirements: { credits: 50000, reputation: 0, licenses: [] },
                operating_costs: { fuel_consumption: 3, maintenance_cost: 500, crew_wages: 250 }
            }
        ];
    }

    // Ship filtering and sorting
    filterShips(criteria) {
        return this.ships.filter(ship => {
            if (criteria.class && ship.class !== criteria.class) return false;
            if (criteria.role && ship.role !== criteria.role) return false;
            if (criteria.maxPrice && ship.base_price > criteria.maxPrice) return false;
            if (criteria.minPower && ship.power_output < criteria.minPower) return false;
            if (criteria.availability && ship.availability !== criteria.availability) return false;
            return true;
        });
    }

    sortShips(ships, sortBy = 'power_output', ascending = false) {
        return [...ships].sort((a, b) => {
            let valueA = a[sortBy];
            let valueB = b[sortBy];
            
            if (sortBy === 'base_price' || sortBy === 'requirements.credits') {
                valueA = sortBy.includes('.') ? a.requirements.credits : valueA;
                valueB = sortBy.includes('.') ? b.requirements.credits : valueB;
            }
            
            if (ascending) {
                return valueA - valueB;
            } else {
                return valueB - valueA;
            }
        });
    }
}

// Global instance
if (typeof window !== 'undefined') {
    window.ShipManager = new ShipManager();
}
