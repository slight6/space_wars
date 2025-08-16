// Location Migration Utility
// Moves all game objects from origin (0,0,0) to new testing area (621,621,621)

class LocationMigration {
    constructor() {
        this.oldOrigin = { x: 0, y: 0, z: 0 };
        this.newOrigin = { x: 621, y: 621, z: 621 };
        this.migrationRadius = 50; // Migrate everything within 50 units of old origin
    }

    // === COORDINATE TRANSFORMATION ===

    transformCoordinates(oldCoords) {
        return {
            x: oldCoords.x + this.newOrigin.x - this.oldOrigin.x,
            y: oldCoords.y + this.newOrigin.y - this.oldOrigin.y,
            z: oldCoords.z + this.newOrigin.z - this.oldOrigin.z
        };
    }

    isInMigrationArea(coords) {
        const distance = Math.sqrt(
            Math.pow(coords.x - this.oldOrigin.x, 2) +
            Math.pow(coords.y - this.oldOrigin.y, 2) +
            Math.pow(coords.z - this.oldOrigin.z, 2)
        );
        return distance <= this.migrationRadius;
    }

    // === PLAYER DATA MIGRATION ===

    async migrateAllPlayers() {
        const fs = require('fs').promises;
        console.log('🔄 Starting player data migration...');
        
        try {
            // Load players registry
            const playersData = JSON.parse(await fs.readFile('./data/players.json', 'utf8'));
            let playersUpdated = 0;

            // Migrate each player's data
            for (const player of playersData.players) {
                const updated = await this.migratePlayerData(player.player_id);
                if (updated) playersUpdated++;
            }

            console.log(`✅ Migrated ${playersUpdated} players to new testing area`);
            return { success: true, players_migrated: playersUpdated };

        } catch (error) {
            console.error('❌ Player migration failed:', error);
            return { success: false, error: error.message };
        }
    }

    async migratePlayerData(playerId) {
        const fs = require('fs').promises;
        
        try {
            const filename = `./data/players/player_${playerId}.json`;
            const playerData = JSON.parse(await fs.readFile(filename, 'utf8'));
            let updated = false;

            // Migrate current location
            if (this.isInMigrationArea(playerData.current_location)) {
                playerData.current_location = this.transformCoordinates(playerData.current_location);
                updated = true;
                console.log(`📍 Migrated player ${playerId} location to ${JSON.stringify(playerData.current_location)}`);
            }

            // Migrate base coordinates
            if (this.isInMigrationArea(playerData.base_coordinates)) {
                playerData.base_coordinates = this.transformCoordinates(playerData.base_coordinates);
                updated = true;
                console.log(`🏠 Migrated player ${playerId} base to ${JSON.stringify(playerData.base_coordinates)}`);
            }

            // Save updated player data
            if (updated) {
                playerData.last_save_timestamp = new Date().toISOString();
                await fs.writeFile(filename, JSON.stringify(playerData, null, 2));
            }

            return updated;

        } catch (error) {
            console.error(`Error migrating player ${playerId}:`, error);
            return false;
        }
    }

    // === SHIP DATA MIGRATION ===

    async migrateAllShips() {
        const fs = require('fs').promises;
        console.log('🚀 Starting ship data migration...');
        
        try {
            const shipData = JSON.parse(await fs.readFile('./data/ship_masterlist.json', 'utf8'));
            let shipsUpdated = 0;

            for (const ship of shipData.ships) {
                if (this.isInMigrationArea(ship.location)) {
                    ship.location = this.transformCoordinates(ship.location);
                    shipsUpdated++;
                    console.log(`🚀 Migrated ship ${ship.ship_id} (${ship.ship_name}) to ${JSON.stringify(ship.location)}`);
                }
            }

            // Save updated ship data
            if (shipsUpdated > 0) {
                await fs.writeFile('./data/ship_masterlist.json', JSON.stringify(shipData, null, 2));
            }

            console.log(`✅ Migrated ${shipsUpdated} ships to new testing area`);
            return { success: true, ships_migrated: shipsUpdated };

        } catch (error) {
            console.error('❌ Ship migration failed:', error);
            return { success: false, error: error.message };
        }
    }

    // === SPACE NAVIGATION UPDATES ===

    async updateSpaceNavigationFile() {
        const fs = require('fs').promises;
        console.log('🌌 Updating space navigation coordinates...');
        
        try {
            let content = await fs.readFile('./space-navigation.html', 'utf8');
            let updated = false;

            // Update test planet locations
            const planetLocationPattern = /{ x: (-?\d+), y: (-?\d+), z: (-?\d+), name: '([^']+)', type: '([^']+)', owner: '([^']+)' }/g;
            content = content.replace(planetLocationPattern, (match, x, y, z, name, type, owner) => {
                const oldCoords = { x: parseInt(x), y: parseInt(y), z: parseInt(z) };
                if (this.isInMigrationArea(oldCoords)) {
                    const newCoords = this.transformCoordinates(oldCoords);
                    updated = true;
                    console.log(`🪐 Migrated planet ${name} from ${JSON.stringify(oldCoords)} to ${JSON.stringify(newCoords)}`);
                    return `{ x: ${newCoords.x}, y: ${newCoords.y}, z: ${newCoords.z}, name: '${name}', type: '${type}', owner: '${owner}' }`;
                }
                return match;
            });

            // Update formation locations
            const formationLocationPattern = /{ x: (-?\d+), y: (-?\d+), z: (-?\d+) }/g;
            content = content.replace(formationLocationPattern, (match, x, y, z) => {
                const oldCoords = { x: parseInt(x), y: parseInt(y), z: parseInt(z) };
                if (this.isInMigrationArea(oldCoords)) {
                    const newCoords = this.transformCoordinates(oldCoords);
                    updated = true;
                    console.log(`🚀 Migrated formation from ${JSON.stringify(oldCoords)} to ${JSON.stringify(newCoords)}`);
                    return `{ x: ${newCoords.x}, y: ${newCoords.y}, z: ${newCoords.z} }`;
                }
                return match;
            });

            // Update initial position
            const currentPositionPattern = /currentPosition: { x: (-?\d+), y: (-?\d+), z: (-?\d+) }/;
            content = content.replace(currentPositionPattern, (match, x, y, z) => {
                const oldCoords = { x: parseInt(x), y: parseInt(y), z: parseInt(z) };
                if (this.isInMigrationArea(oldCoords)) {
                    const newCoords = this.transformCoordinates(oldCoords);
                    updated = true;
                    console.log(`📍 Migrated initial position from ${JSON.stringify(oldCoords)} to ${JSON.stringify(newCoords)}`);
                    return `currentPosition: { x: ${newCoords.x}, y: ${newCoords.y}, z: ${newCoords.z} }`;
                }
                return match;
            });

            // Save updated file
            if (updated) {
                await fs.writeFile('./space-navigation.html', content);
                console.log('✅ Updated space navigation file');
            }

            return { success: true, updated };

        } catch (error) {
            console.error('❌ Space navigation update failed:', error);
            return { success: false, error: error.message };
        }
    }

    // === MAIN MIGRATION PROCESS ===

    async performFullMigration() {
        console.log('🔄 Starting full location migration...');
        console.log(`📍 Moving from origin ${JSON.stringify(this.oldOrigin)} to ${JSON.stringify(this.newOrigin)}`);
        
        const results = {
            timestamp: new Date().toISOString(),
            old_origin: this.oldOrigin,
            new_origin: this.newOrigin,
            migration_radius: this.migrationRadius,
            results: {}
        };

        try {
            // Create backup before migration
            await this.createPreMigrationBackup();

            // Migrate players
            results.results.players = await this.migrateAllPlayers();

            // Migrate ships
            results.results.ships = await this.migrateAllShips();

            // Update space navigation
            results.results.space_navigation = await this.updateSpaceNavigationFile();

            // Update other game files if needed
            results.results.other_files = await this.updateOtherGameFiles();

            console.log('✅ Full migration completed successfully!');
            console.log('📊 Migration Summary:');
            console.log(`   Players migrated: ${results.results.players.players_migrated || 0}`);
            console.log(`   Ships migrated: ${results.results.ships.ships_migrated || 0}`);
            console.log(`   Space navigation updated: ${results.results.space_navigation.updated ? 'Yes' : 'No'}`);

            // Save migration log
            await this.saveMigrationLog(results);

            return results;

        } catch (error) {
            console.error('❌ Migration failed:', error);
            return { success: false, error: error.message };
        }
    }

    async createPreMigrationBackup() {
        const fs = require('fs').promises;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = `./backups/pre-migration-backup_${timestamp}`;
        
        console.log('💾 Creating pre-migration backup...');
        
        try {
            await fs.mkdir(backupDir, { recursive: true });
            
            // Backup data files
            await fs.copyFile('./data/players.json', `${backupDir}/players.json`);
            await fs.copyFile('./data/ship_masterlist.json', `${backupDir}/ship_masterlist.json`);
            await fs.copyFile('./space-navigation.html', `${backupDir}/space-navigation.html`);
            
            // Backup player files
            const playerFiles = await fs.readdir('./data/players');
            await fs.mkdir(`${backupDir}/players`, { recursive: true });
            
            for (const file of playerFiles) {
                await fs.copyFile(`./data/players/${file}`, `${backupDir}/players/${file}`);
            }
            
            console.log(`✅ Pre-migration backup created: ${backupDir}`);
            
        } catch (error) {
            console.error('❌ Backup creation failed:', error);
            throw error;
        }
    }

    async updateOtherGameFiles() {
        // Update any other files that might contain coordinate references
        // This is where you'd add updates for other game files as they're created
        console.log('🔧 Checking other game files for coordinate updates...');
        
        const fs = require('fs').promises;
        const filesToCheck = [
            './game.html',
            './torpedo-launch.html',
            './keldar-system.json'
        ];
        
        let updatedFiles = 0;
        
        for (const file of filesToCheck) {
            try {
                // Check if file exists and contains coordinate references
                const content = await fs.readFile(file, 'utf8');
                
                // Look for coordinate patterns and update if needed
                // This would be customized based on actual file content
                console.log(`📄 Checked ${file} for coordinates`);
                
            } catch (error) {
                // File might not exist, that's OK
                console.log(`⚠️  Could not check ${file} (file may not exist)`);
            }
        }
        
        return { success: true, files_checked: filesToCheck.length, files_updated: updatedFiles };
    }

    async saveMigrationLog(results) {
        const fs = require('fs').promises;
        const logFile = `./migration-log-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        
        await fs.writeFile(logFile, JSON.stringify(results, null, 2));
        console.log(`📋 Migration log saved: ${logFile}`);
    }

    // === ROLLBACK FUNCTIONALITY ===

    async rollbackMigration(backupDir) {
        console.log('🔄 Rolling back migration...');
        const fs = require('fs').promises;
        
        try {
            // Restore from backup
            await fs.copyFile(`${backupDir}/players.json`, './data/players.json');
            await fs.copyFile(`${backupDir}/ship_masterlist.json`, './data/ship_masterlist.json');
            await fs.copyFile(`${backupDir}/space-navigation.html`, './space-navigation.html');
            
            // Restore player files
            const playerFiles = await fs.readdir(`${backupDir}/players`);
            for (const file of playerFiles) {
                await fs.copyFile(`${backupDir}/players/${file}`, `./data/players/${file}`);
            }
            
            console.log('✅ Migration rolled back successfully');
            return { success: true };
            
        } catch (error) {
            console.error('❌ Rollback failed:', error);
            return { success: false, error: error.message };
        }
    }
}

// Usage example
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocationMigration;
}

// For direct execution
if (require.main === module) {
    const migration = new LocationMigration();
    migration.performFullMigration().then(results => {
        console.log('Migration completed:', results);
    }).catch(error => {
        console.error('Migration failed:', error);
    });
}
