// Scanner System for Keldar Deep Space Trading Game
// Handles all scanning operations: Spatial, Surface, Prospecting, Skimming, and Ship scanners

class ScannerSystem {
    constructor() {
        this.activeScanners = new Map(); // Track running scans
        this.scanCooldowns = new Map(); // Track cooldown timers
        this.scanResults = new Map(); // Store scan results
        this.playerLocation = { x: 0, y: 0, z: 0 }; // Current player position
        this.shipState = 'floating'; // floating, docked, tractor_beam, etc.
        
        // Scanner types and their capabilities (shortened for testing)
        this.scannerTypes = {
            spatial: {
                stage1: { range: 1, duration: 5000, energyCost: 5 }, // 5 seconds for testing
                stage2: { range: 2, duration: 8000, energyCost: 12 }, // 8 seconds for testing
                stage3: { range: 3, duration: 12000, energyCost: 20 } // 12 seconds for testing
            },
            surface: {
                stage1: { duration: 3000, energyCost: 3 }, // 3 seconds for testing
                stage2: { duration: 6000, energyCost: 8 }, // 6 seconds for testing
                stage3: { duration: 10000, energyCost: 15 } // 10 seconds for testing
            },
            prospecting: {
                stage1: { depth: 0.01, duration: 8000, energyCost: 25 }, // 8 seconds for testing
                stage2: { depth: 0.03, duration: 15000, energyCost: 50 }, // 15 seconds for testing
                stage3: { depth: 0.05, duration: 20000, energyCost: 75 } // 20 seconds for testing
            },
            skimming: {
                stage1: { duration: 7000, energyCost: 10 } // 7 seconds for testing
            },
            ship: {
                longRange: { range: 10, duration: 4000, energyCost: 2 }, // 4 seconds for testing
                shortRange: { range: 2, duration: 2000, energyCost: 1 } // 2 seconds for testing
            }
        };
        
        this.cooldownPeriod = 2000; // 2 seconds between scans for testing
    }

    // Check if player can use scanners
    canUseSpatialScanner() {
        const restrictedStates = ['docked', 'tractor_beam', 'port', 'station'];
        return !restrictedStates.includes(this.shipState);
    }

    // Initialize a scan
    startScan(scannerType, stage, targetLocation = null, altitude = null) {
        const scannerId = `${scannerType}_${stage}_${Date.now()}`;
        
        // Check cooldown
        if (this.isOnCooldown(scannerType)) {
            return {
                success: false,
                error: `${scannerType} scanner is on cooldown`,
                remainingTime: this.getRemainingCooldown(scannerType)
            };
        }

        // Check ship state for spatial scanners
        if (scannerType === 'spatial' && !this.canUseSpatialScanner()) {
            return {
                success: false,
                error: 'Spatial scanners cannot be used while docked or in tractor beam'
            };
        }

        // Check if scanner exists on ship
        if (!this.hasScanner(scannerType, stage)) {
            return {
                success: false,
                error: `No ${scannerType} scanner stage ${stage} equipped`
            };
        }

        // Check energy requirements
        const energyCost = this.scannerTypes[scannerType][stage].energyCost;
        if (!this.hasEnoughEnergy(energyCost)) {
            return {
                success: false,
                error: `Insufficient energy. Need ${energyCost} units.`
            };
        }

        // Start the scan
        const scanData = {
            id: scannerId,
            type: scannerType,
            stage: stage,
            startTime: Date.now(),
            duration: this.scannerTypes[scannerType][stage].duration,
            targetLocation: targetLocation || this.playerLocation,
            altitude: altitude,
            status: 'running'
        };

        this.activeScanners.set(scannerId, scanData);
        this.setCooldown(scannerType);
        this.consumeEnergy(energyCost);

        console.log(`🔍 Started ${scannerType} scan (Stage ${stage}): ${scannerId}`);

        // Set completion timer
        setTimeout(() => {
            this.completeScan(scannerId);
        }, scanData.duration);

        return {
            success: true,
            scanId: scannerId,
            estimatedCompletion: new Date(Date.now() + scanData.duration),
            message: `${scannerType} scanner initiated. Scan will complete in ${Math.round(scanData.duration / 1000)} seconds.`
        };
    }

    // Complete a scan and generate results
    completeScan(scannerId) {
        const scanData = this.activeScanners.get(scannerId);
        if (!scanData) return;

        console.log(`✅ Completing scan: ${scannerId}`);

        let results;
        switch (scanData.type) {
            case 'spatial':
                results = this.generateSpatialResults(scanData);
                break;
            case 'surface':
                results = this.generateSurfaceResults(scanData);
                break;
            case 'prospecting':
                results = this.generateProspectingResults(scanData);
                break;
            case 'skimming':
                results = this.generateSkimmingResults(scanData);
                break;
            case 'ship':
                results = this.generateShipResults(scanData);
                break;
            default:
                results = { error: 'Unknown scanner type' };
        }

        scanData.status = 'completed';
        scanData.results = results;
        scanData.completionTime = Date.now();

        this.scanResults.set(scannerId, scanData);
        this.activeScanners.delete(scannerId);

        // Trigger UI notification
        this.notifyScanComplete(scannerId, results);
    }

    // Generate mock spatial scan results
    generateSpatialResults(scanData) {
        const range = this.scannerTypes.spatial[scanData.stage].range;
        const detectedObjects = [];

        // Generate mock objects based on scanner stage capabilities
        for (let x = -range; x <= range; x++) {
            for (let y = -range; y <= range; y++) {
                for (let z = -range; z <= range; z++) {
                    if (x === 0 && y === 0 && z === 0) continue; // Skip current location

                    const location = {
                        x: this.playerLocation.x + x,
                        y: this.playerLocation.y + y,
                        z: this.playerLocation.z + z
                    };

                    // Random chance of detecting objects
                    if (Math.random() < 0.3) {
                        const object = this.generateRandomSpatialObject(scanData.stage, location);
                        if (object) detectedObjects.push(object);
                    }
                }
            }
        }

        return {
            scanType: 'spatial',
            stage: scanData.stage,
            range: range,
            objectsDetected: detectedObjects.length,
            objects: detectedObjects,
            scanLocation: scanData.targetLocation,
            timestamp: new Date().toISOString()
        };
    }

    // Generate random spatial objects based on scanner capabilities
    generateRandomSpatialObject(stage, location) {
        const objects = {
            stage1: [
                'Asteroid Field', 'Space Station', 'Large Freighter', 'Mining Platform',
                'Planetary Outpost', 'Satellite Array', 'Starport', 'Moon Base'
            ],
            stage2: [
                'Asteroid Field', 'Large Ship', 'Capital Vessel', 'Space Station',
                'Planet', 'Moon', 'Comet'
            ],
            stage3: [
                'Planet', 'Moon', 'Star', 'Asteroid Belt', 'Nebula',
                'Capital Ship', 'Space Station'
            ]
        };

        const objectTypes = objects[stage];
        const randomType = objectTypes[Math.floor(Math.random() * objectTypes.length)];

        return {
            id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: randomType,
            location: location,
            distance: Math.sqrt(Math.pow(location.x, 2) + Math.pow(location.y, 2) + Math.pow(location.z, 2)),
            signature: Math.floor(Math.random() * 100) + 1,
            classification: this.getObjectClassification(randomType),
            details: this.getObjectDetails(randomType)
        };
    }

    // Generate other scan result types (simplified for now)
    generateSurfaceResults(scanData) {
        const surfaceTypes = ['Rocky Planet', 'Gas Giant', 'Ice World', 'Desert Planet', 'Ocean World'];
        const randomType = surfaceTypes[Math.floor(Math.random() * surfaceTypes.length)];

        return {
            scanType: 'surface',
            stage: scanData.stage,
            planetType: randomType,
            atmosphere: Math.random() > 0.5 ? 'Breathable' : 'Toxic',
            landingSafety: scanData.stage >= 2 ? (Math.random() > 0.3 ? 'Safe' : 'Hazardous') : 'Unknown',
            publicInfo: scanData.stage >= 3 ? this.generatePublicInfo() : null,
            timestamp: new Date().toISOString()
        };
    }

    generateProspectingResults(scanData) {
        const minerals = ['Iron', 'Copper', 'Gold', 'Platinum', 'Uranium', 'Crystals', 'Rare Earths'];
        const detected = minerals.filter(() => Math.random() > 0.6);

        return {
            scanType: 'prospecting',
            stage: scanData.stage,
            depthPercentage: this.scannerTypes.prospecting[scanData.stage].depth * 100,
            mineralsDetected: detected,
            estimatedYield: detected.map(mineral => ({
                mineral,
                yield: Math.floor(Math.random() * 1000) + 100
            })),
            timestamp: new Date().toISOString()
        };
    }

    generateSkimmingResults(scanData) {
        const gases = ['Hydrogen', 'Helium', 'Methane', 'Oxygen', 'Nitrogen', 'Carbon Dioxide'];
        const detected = gases.filter(() => Math.random() > 0.4);

        return {
            scanType: 'skimming',
            altitude: scanData.altitude || 'Standard',
            gasesDetected: detected,
            concentrations: detected.map(gas => ({
                gas,
                concentration: (Math.random() * 10).toFixed(2) + '%'
            })),
            timestamp: new Date().toISOString()
        };
    }

    generateShipResults(scanData) {
        const shipTypes = ['Freighter', 'Scout', 'Patrol Vessel', 'Mining Ship', 'Research Vessel'];
        const randomType = shipTypes[Math.floor(Math.random() * shipTypes.length)];

        return {
            scanType: 'ship',
            range: scanData.stage,
            shipType: randomType,
            crew: scanData.stage === 'shortRange' ? Math.floor(Math.random() * 20) + 1 : 'Unknown',
            cargoHolds: scanData.stage === 'shortRange' ? `${Math.floor(Math.random() * 10)} used` : 'Unknown',
            speed: Math.floor(Math.random() * 100) + 50,
            heading: Math.floor(Math.random() * 360),
            alertedToScan: scanData.stage === 'shortRange',
            timestamp: new Date().toISOString()
        };
    }

    // Helper methods
    getObjectClassification(type) {
        const classifications = {
            'Planet': 'Celestial Body',
            'Moon': 'Celestial Body',
            'Asteroid Field': 'Navigation Hazard',
            'Space Station': 'Artificial Structure',
            'Large Freighter': 'Vessel',
            'Capital Ship': 'Vessel',
            'Mining Platform': 'Industrial Structure'
        };
        return classifications[type] || 'Unknown';
    }

    getObjectDetails(type) {
        return {
            'Planet': 'Large celestial body with possible atmosphere',
            'Space Station': 'Orbital facility for docking and services',
            'Large Freighter': 'Commercial transport vessel',
            'Asteroid Field': 'Dense collection of space debris'
        }[type] || 'No additional details available';
    }

    generatePublicInfo() {
        return {
            owner: 'Keldar Mining Consortium',
            contact: 'Station Commander Alpha-7',
            services: ['Fuel', 'Repairs', 'Trade'],
            dockingFees: Math.floor(Math.random() * 500) + 100
        };
    }

    // Cooldown management
    isOnCooldown(scannerType) {
        const cooldownKey = `${scannerType}_cooldown`;
        const cooldownEnd = this.scanCooldowns.get(cooldownKey);
        return cooldownEnd && Date.now() < cooldownEnd;
    }

    setCooldown(scannerType) {
        const cooldownKey = `${scannerType}_cooldown`;
        this.scanCooldowns.set(cooldownKey, Date.now() + this.cooldownPeriod);
    }

    getRemainingCooldown(scannerType) {
        const cooldownKey = `${scannerType}_cooldown`;
        const cooldownEnd = this.scanCooldowns.get(cooldownKey);
        return cooldownEnd ? Math.max(0, cooldownEnd - Date.now()) : 0;
    }

    // Equipment and energy checks (mock implementation)
    hasScanner(type, stage) {
        // TODO: Check player's ship equipment
        return true; // Mock: assume player has all scanners for testing
    }

    hasEnoughEnergy(amount) {
        // TODO: Check ship's energy reserves
        return true; // Mock: assume unlimited energy for testing
    }

    consumeEnergy(amount) {
        // TODO: Deduct energy from ship
        console.log(`⚡ Consumed ${amount} energy units`);
    }

    // UI notification system
    notifyScanComplete(scanId, results) {
        // This will integrate with the game's notification system
        console.log(`🎯 Scan Complete: ${scanId}`, results);
        
        // Trigger custom event for UI
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('scanComplete', {
                detail: { scanId, results }
            }));
        }
    }

    // Get active scans
    getActiveScans() {
        return Array.from(this.activeScanners.values());
    }

    // Get scan results
    getScanResults(scanId) {
        return this.scanResults.get(scanId);
    }

    // Update ship state and location
    updateShipState(state) {
        this.shipState = state;
        console.log(`🚢 Ship state updated: ${state}`);
    }

    updatePlayerLocation(x, y, z) {
        this.playerLocation = { x, y, z };
        console.log(`📍 Location updated: (${x}, ${y}, ${z})`);
    }

    // Cancel running scan
    cancelScan(scanId) {
        const scanData = this.activeScanners.get(scanId);
        if (scanData) {
            scanData.status = 'cancelled';
            this.activeScanners.delete(scanId);
            console.log(`❌ Scan cancelled: ${scanId}`);
            return true;
        }
        return false;
    }
}

// Global scanner system instance
window.scannerSystem = new ScannerSystem();

console.log('🔍 Scanner System initialized');
