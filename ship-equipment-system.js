// Ship Equipment and Mining Integration for Main Game Interface
// This file provides mining capabilities to the main game system

class ShipEquipment {
    constructor() {
        this.defaultScoutLoadout = {
            scanners: {
                spatial: { level: 1, installed: true },
                surface: { level: 1, installed: false },
                prospecting: { level: 0, installed: false },
                ship: { level: 1, installed: true }
            },
            mining: {
                basicMiningLaser: { level: 1, installed: true },
                cargoCapacity: 50,
                refineryCapacity: 0
            },
            weapons: {
                basicLasers: { level: 1, installed: true },
                shields: { level: 1, installed: true }
            },
            utilities: {
                navigationComputer: { level: 1, installed: true },
                communicationArray: { level: 1, installed: true },
                emergencyBeacon: { level: 1, installed: true }
            }
        };
        
        this.upgradeableSystems = {
            'Mining Laser Mk2': {
                cost: 15000,
                description: 'Improved mining efficiency, level 2 operations',
                effects: { miningLevel: 2, efficiency: 1.3 },
                requirements: ['Mining Laser Mk1']
            },
            'Cargo Expansion': {
                cost: 8000,
                description: 'Increases cargo capacity by 25 units',
                effects: { cargoCapacity: 25 },
                stackable: true,
                maxStacks: 4
            },
            'Advanced Scanner Array': {
                cost: 25000,
                description: 'Unlocks surface and prospecting scanners',
                effects: { 
                    scanners: {
                        surface: { level: 1 },
                        prospecting: { level: 1 }
                    }
                }
            },
            'Refinery Module': {
                cost: 50000,
                description: 'Allows basic ore refining aboard ship',
                effects: { refineryCapacity: 20 },
                requirements: ['Cargo Expansion']
            }
        };
    }
    
    // Get current ship capabilities for mining system
    getShipMiningCapabilities(shipType) {
        const baseCapabilities = {
            'Scout Ship': {
                maxMiningLevel: 1,
                miningSpeed: 1.0,
                cargoCapacity: 50,
                energyPerMining: 15,
                scanRequirement: 'spatial-stage1'
            }
        };
        
        // Apply any installed upgrades
        return baseCapabilities[shipType] || baseCapabilities['Scout Ship'];
    }
    
    // Get available upgrades for current ship
    getAvailableUpgrades(playerCredits, currentEquipment) {
        return Object.keys(this.upgradeableSystems)
            .filter(upgrade => {
                const upgradeData = this.upgradeableSystems[upgrade];
                return playerCredits >= upgradeData.cost;
            })
            .map(upgradeName => ({
                name: upgradeName,
                ...this.upgradeableSystems[upgradeName]
            }));
    }
    
    // Purchase and install upgrade
    purchaseUpgrade(upgradeName, playerCredits) {
        const upgrade = this.upgradeableSystems[upgradeName];
        if (!upgrade) {
            return { success: false, error: 'Upgrade not found' };
        }
        
        if (playerCredits < upgrade.cost) {
            return { success: false, error: 'Insufficient credits' };
        }
        
        return {
            success: true,
            cost: upgrade.cost,
            upgrade: upgrade,
            message: `${upgradeName} successfully installed`
        };
    }
}

// Ship Actions Integration
class ShipActions {
    constructor() {
        this.currentLocation = { x: 0, y: 0, z: 0 };
        this.shipState = 'floating'; // floating, docked, mining, scanning
        this.equipment = new ShipEquipment();
    }
    
    // Quick mining action from main interface
    quickMine() {
        // Determine best nearby mining location
        const nearbyLocations = this.getNearbyMiningLocations();
        
        if (nearbyLocations.length === 0) {
            return {
                success: false,
                error: 'No mining locations in range. Travel to Quilt Belt or planetary system.'
            };
        }
        
        const bestLocation = nearbyLocations[0];
        
        // Start mining at best location
        return window.miningSystem.startMining('player1', {
            type: 'Scout Ship',
            energy: 85
        }, bestLocation.name, 1);
    }
    
    // Quick scan action
    quickScan() {
        return window.scannerSystem.startScan('spatial', 'stage1', this.currentLocation);
    }
    
    // Navigate to mining interface
    openMiningInterface() {
        window.location.href = 'mining-interface.html';
    }
    
    // Navigate to scanner interface
    openScannerInterface() {
        window.location.href = 'scanner-interface.html';
    }
    
    // Get nearby mining locations based on current position
    getNearbyMiningLocations() {
        const locations = window.miningSystem.getAvailableLocations();
        const nearby = [];
        
        Object.keys(locations).forEach(locationName => {
            const location = locations[locationName];
            const distance = this.calculateDistance(this.currentLocation, location.coordinates);
            
            if (distance <= 5) { // Within 5 units
                nearby.push({
                    name: locationName,
                    distance: distance,
                    ...location
                });
            }
        });
        
        return nearby.sort((a, b) => a.distance - b.distance);
    }
    
    // Move to location
    moveTo(coordinates) {
        this.currentLocation = coordinates;
        this.updateLocationDisplay();
        
        // Update mining and scanning systems
        if (window.miningSystem) {
            window.miningSystem.updatePlayerLocation?.(coordinates.x, coordinates.y, coordinates.z);
        }
        if (window.scannerSystem) {
            window.scannerSystem.updatePlayerLocation(coordinates.x, coordinates.y, coordinates.z);
        }
        
        return {
            success: true,
            message: `Moved to coordinates (${coordinates.x}, ${coordinates.y}, ${coordinates.z})`
        };
    }
    
    calculateDistance(pos1, pos2) {
        return Math.sqrt(
            Math.pow(pos1.x - pos2.x, 2) +
            Math.pow(pos1.y - pos2.y, 2) +
            Math.pow(pos1.z - pos2.z, 2)
        );
    }
    
    updateLocationDisplay() {
        // Update any UI elements showing current location
        const locationElements = document.querySelectorAll('[data-player-location]');
        locationElements.forEach(el => {
            el.textContent = `(${this.currentLocation.x}, ${this.currentLocation.y}, ${this.currentLocation.z})`;
        });
    }
}

// Initialize ship systems for main game
if (typeof window !== 'undefined') {
    window.shipEquipment = new ShipEquipment();
    window.shipActions = new ShipActions();
}

// Add mining quick actions to main game interface
function addMiningActionsToMainGame() {
    // This would be called from the main game interface to add mining buttons
    const gameActionsHTML = `
        <div class="mining-quick-actions bg-gray-800 rounded-lg p-4 mb-4">
            <h3 class="text-lg font-bold text-yellow-400 mb-3">⛏️ Quick Mining</h3>
            <div class="grid grid-cols-2 gap-2">
                <button onclick="window.shipActions.quickMine()" 
                        class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-3 rounded text-sm">
                    Quick Mine
                </button>
                <button onclick="window.shipActions.quickScan()" 
                        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded text-sm">
                    Quick Scan
                </button>
                <button onclick="window.shipActions.openMiningInterface()" 
                        class="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-3 rounded text-sm">
                    Mining Ops
                </button>
                <button onclick="window.shipActions.openScannerInterface()" 
                        class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded text-sm">
                    Scanners
                </button>
            </div>
            
            <div class="mt-3 text-xs text-gray-400">
                <div>Nearby: <span id="nearby-locations">Scanning...</span></div>
                <div>Cargo: <span id="cargo-status">0/50</span></div>
            </div>
        </div>
    `;
    
    return gameActionsHTML;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ShipEquipment, ShipActions, addMiningActionsToMainGame };
}
