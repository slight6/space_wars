// ========================================
// UNIVERSE MANAGEMENT SYSTEM
// ========================================

class UniverseManager {
    constructor() {
        this.universeConfig = null;
        this.loadUniverseConfig();
    }

    async loadUniverseConfig() {
        try {
            const response = await fetch('./data/universe-config.json');
            this.universeConfig = await response.json();
            console.log('Universe configuration loaded:', this.universeConfig);
        } catch (error) {
            console.error('Failed to load universe configuration:', error);
            this.universeConfig = null;
        }
    }

    // Ensure config is loaded before proceeding
    async ensureConfigLoaded() {
        if (!this.universeConfig) {
            await this.loadUniverseConfig();
        }
        return this.universeConfig !== null;
    }

    // Determine which sector a player should access
    getPlayerSector(username) {
        if (!this.universeConfig) {
            console.warn('Universe config not loaded, defaulting to new player sector');
            return 'new_player_sector';
        }

        const { sectors } = this.universeConfig.universe;
        const { playerAccess } = this.universeConfig;

        // Check if user is an admin
        if (playerAccess.adminUsers.includes(username)) {
            return 'admin_sector';
        }

        // Check for explicitly excluded users from new player sector
        const newPlayerSector = sectors.new_player_sector;
        if (newPlayerSector.excludedUsers && newPlayerSector.excludedUsers.includes(username)) {
            // If excluded from new player sector but not admin, they need special handling
            console.warn(`User ${username} excluded from new player sector but not admin`);
            return 'admin_sector'; // Fallback for now
        }

        // Default to new player sector
        return playerAccess.defaultSector;
    }

    // Get sector information
    getSectorInfo(sectorKey) {
        if (!this.universeConfig) return null;
        return this.universeConfig.universe.sectors[sectorKey];
    }

    // Calculate distance between two sectors
    calculateSectorDistance(sector1Key, sector2Key) {
        if (!this.universeConfig) return 0;

        const sectors = this.universeConfig.universe.sectors;
        const sector1 = sectors[sector1Key];
        const sector2 = sectors[sector2Key];

        if (!sector1 || !sector2) return 0;

        const coord1 = sector1.coordinates;
        const coord2 = sector2.coordinates;

        // Calculate galaxy-level distance
        const galaxyDiff = Math.sqrt(
            Math.pow(coord2.galaxy.x - coord1.galaxy.x, 2) +
            Math.pow(coord2.galaxy.y - coord1.galaxy.y, 2) +
            Math.pow(coord2.galaxy.z - coord1.galaxy.z, 2)
        );

        // Calculate solar system level distance
        const systemDiff = Math.sqrt(
            Math.pow(coord2.solarSystem.x - coord1.solarSystem.x, 2) +
            Math.pow(coord2.solarSystem.y - coord1.solarSystem.y, 2) +
            Math.pow(coord2.solarSystem.z - coord1.solarSystem.z, 2)
        );

        // Convert to light-years using the scale factors
        const { galaxyUnit, solarSystemUnit } = this.universeConfig.universe.distanceCalculation;
        const totalDistance = (galaxyDiff * galaxyUnit) + (systemDiff * solarSystemUnit);

        return totalDistance;
    }

    // Check if a player can access a sector
    canAccessSector(username, sectorKey) {
        if (!this.universeConfig) return true; // Fallback to allow access

        const sector = this.universeConfig.universe.sectors[sectorKey];
        if (!sector) return false;

        // Check allowed users
        if (sector.allowedUsers) {
            if (sector.allowedUsers.includes('*')) {
                // Allow all users except excluded ones
                if (sector.excludedUsers && sector.excludedUsers.includes(username)) {
                    return false;
                }
                return true;
            } else {
                // Only allow specific users
                return sector.allowedUsers.includes(username);
            }
        }

        return false;
    }

    // Get starting location for a player
    getStartingLocation(username) {
        const sectorKey = this.getPlayerSector(username);
        const sector = this.getSectorInfo(sectorKey);
        
        if (!sector) {
            return {
                sector: 'new_player_sector',
                systemData: 'frontier-system.json',
                location: 'frontier_hub_station'
            };
        }

        // Determine starting location based on sector
        let startingLocation;
        if (sectorKey === 'admin_sector') {
            startingLocation = 'nexus_station';
        } else {
            startingLocation = 'frontier_hub_station';
        }

        return {
            sector: sectorKey,
            systemData: sector.systemData,
            location: startingLocation
        };
    }

    // Load system data for a sector
    async loadSystemData(sectorKey) {
        const sector = this.getSectorInfo(sectorKey);
        if (!sector) return null;

        try {
            const response = await fetch(`./data/${sector.systemData}`);
            return await response.json();
        } catch (error) {
            console.error(`Failed to load system data for sector ${sectorKey}:`, error);
            return null;
        }
    }

    // Initialize universe for a player (called during login)
    async initializePlayerUniverse(username) {
        const startingInfo = this.getStartingLocation(username);
        const systemData = await this.loadSystemData(startingInfo.sector);

        return {
            playerSector: startingInfo.sector,
            currentLocation: startingInfo.location,
            systemData: systemData,
            universeInfo: {
                currentSector: startingInfo.sector,
                accessibleSectors: this.getAccessibleSectors(username),
                position: this.getSectorInfo(startingInfo.sector)?.coordinates
            }
        };
    }

    // Get list of sectors a player can access
    getAccessibleSectors(username) {
        if (!this.universeConfig) return ['new_player_sector'];

        const accessibleSectors = [];
        const sectors = this.universeConfig.universe.sectors;

        Object.keys(sectors).forEach(sectorKey => {
            if (this.canAccessSector(username, sectorKey)) {
                accessibleSectors.push(sectorKey);
            }
        });

        return accessibleSectors;
    }
}

// Global universe manager instance
window.UniverseManager = new UniverseManager();
