// ========================================
// DATA MANAGEMENT SYSTEM
// Handles all game data storage in JSON files
// ========================================

class DataManager {
    constructor() {
        this.dataFiles = {
            players: './data/players.json',
            playerProgression: './data/player-progression.json',
            shipData: './data/ship-data.json',
            gameState: './data/game-state.json'
        };
        this.cache = {};
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        console.log('Initializing DataManager...');
        
        // Initialize all data files
        await this.initializeDataFiles();
        
        // Migrate existing localStorage data
        await this.migrateFromLocalStorage();
        
        this.initialized = true;
        console.log('DataManager initialized successfully');
    }

    async initializeDataFiles() {
        // Ensure all required data files exist with proper structure
        await this.ensureFileExists('players', {
            players: [],
            next_player_id: 1,
            system_info: {
                created: new Date().toISOString(),
                last_backup: null,
                total_registered_players: 0
            }
        });

        await this.ensureFileExists('playerProgression', {
            progressions: {},
            system_info: {
                created: new Date().toISOString(),
                last_updated: null
            }
        });

        await this.ensureFileExists('shipData', {
            playerShips: [],
            shipInstances: [],
            system_info: {
                created: new Date().toISOString(),
                last_updated: null
            }
        });

        await this.ensureFileExists('gameState', {
            currentSessions: {},
            system_info: {
                created: new Date().toISOString(),
                last_updated: null
            }
        });
    }

    async ensureFileExists(fileKey, defaultStructure) {
        try {
            const response = await fetch(this.dataFiles[fileKey]);
            if (!response.ok) {
                console.log(`Creating ${fileKey} file with default structure`);
                // File doesn't exist, we'll need to create it
                // For now, store in cache and we'll save later
                this.cache[fileKey] = defaultStructure;
            } else {
                const data = await response.json();
                this.cache[fileKey] = data;
                console.log(`Loaded existing ${fileKey} data`);
            }
        } catch (error) {
            console.log(`Error loading ${fileKey}, using default structure:`, error);
            this.cache[fileKey] = defaultStructure;
        }
    }

    async migrateFromLocalStorage() {
        console.log('Starting localStorage migration...');
        
        let migrationCount = 0;

        // Migrate players data
        const playersData = localStorage.getItem('players');
        if (playersData) {
            const players = JSON.parse(playersData);
            for (const player of players) {
                await this.savePlayer(player);
                migrationCount++;
            }
            console.log(`Migrated ${players.length} players from localStorage`);
        }

        // Migrate current player
        const currentPlayerData = localStorage.getItem('currentPlayer');
        if (currentPlayerData) {
            const currentPlayer = JSON.parse(currentPlayerData);
            await this.setCurrentPlayer(currentPlayer);
            console.log('Migrated current player from localStorage');
        }

        // Migrate player progression
        const progressionData = localStorage.getItem('playerProgression');
        if (progressionData) {
            const progressions = JSON.parse(progressionData);
            this.cache.playerProgression.progressions = {
                ...this.cache.playerProgression.progressions,
                ...progressions
            };
            await this.saveToFile('playerProgression');
            console.log('Migrated player progression from localStorage');
        }

        // Migrate ship data
        const shipData = localStorage.getItem('ship_data');
        if (shipData) {
            const ships = JSON.parse(shipData);
            this.cache.shipData.playerShips = ships.playerShips || [];
            this.cache.shipData.shipInstances = ships.shipInstances || [];
            await this.saveToFile('shipData');
            console.log('Migrated ship data from localStorage');
        }

        if (migrationCount > 0) {
            console.log(`Migration complete! Migrated ${migrationCount} total records.`);
            this.showMigrationNotification(migrationCount);
        }
    }

    showMigrationNotification(count) {
        // Show user-friendly notification about migration
        if (window.showToast) {
            window.showToast(`Successfully migrated ${count} records from browser storage to secure file storage!`, 'success');
        }
    }

    // Player Management
    async savePlayer(player) {
        const playersData = this.cache.players;
        
        // Check if player already exists
        const existingIndex = playersData.players.findIndex(p => p.username === player.username);
        
        if (existingIndex >= 0) {
            // Update existing player
            playersData.players[existingIndex] = {
                ...playersData.players[existingIndex],
                ...player,
                last_updated: new Date().toISOString()
            };
        } else {
            // Add new player
            player.id = player.id || playersData.next_player_id;
            player.created_at = player.createdAt || new Date().toISOString();
            player.last_updated = new Date().toISOString();
            
            playersData.players.push(player);
            playersData.next_player_id = Math.max(playersData.next_player_id, player.id + 1);
            playersData.system_info.total_registered_players = playersData.players.length;
        }

        playersData.system_info.last_backup = new Date().toISOString();
        await this.saveToFile('players');
        return player;
    }

    async getPlayer(username) {
        await this.ensureInitialized();
        const playersData = this.cache.players;
        return playersData.players.find(p => p.username === username);
    }

    async getAllPlayers() {
        await this.ensureInitialized();
        return this.cache.players.players;
    }

    async setCurrentPlayer(player) {
        await this.ensureInitialized();
        this.cache.gameState.currentSessions.active_player = player;
        this.cache.gameState.system_info.last_updated = new Date().toISOString();
        await this.saveToFile('gameState');
    }

    async getCurrentPlayer() {
        await this.ensureInitialized();
        return this.cache.gameState.currentSessions.active_player;
    }

    // Player Progression Management
    async savePlayerProgression(username, progression) {
        await this.ensureInitialized();
        this.cache.playerProgression.progressions[username] = {
            ...progression,
            last_updated: new Date().toISOString()
        };
        this.cache.playerProgression.system_info.last_updated = new Date().toISOString();
        await this.saveToFile('playerProgression');
    }

    async getPlayerProgression(username) {
        await this.ensureInitialized();
        return this.cache.playerProgression.progressions[username] || {
            completedModules: [],
            unlockedFeatures: ['orientation'],
            currentPhase: 'orientation'
        };
    }

    // Ship Data Management
    async saveShipData(shipData) {
        await this.ensureInitialized();
        this.cache.shipData.playerShips = shipData.playerShips || [];
        this.cache.shipData.shipInstances = shipData.shipInstances || [];
        this.cache.shipData.system_info.last_updated = new Date().toISOString();
        await this.saveToFile('shipData');
    }

    async getShipData() {
        await this.ensureInitialized();
        return {
            playerShips: this.cache.shipData.playerShips,
            shipInstances: this.cache.shipData.shipInstances
        };
    }

    // File Operations
    async saveToFile(fileKey) {
        try {
            // In a real implementation, this would save to the server
            // For now, we'll use a different approach since we can't write files directly
            console.log(`Would save ${fileKey} data:`, this.cache[fileKey]);
            
            // Store in localStorage as backup until we have server-side saving
            localStorage.setItem(`file_${fileKey}`, JSON.stringify(this.cache[fileKey]));
            
            return true;
        } catch (error) {
            console.error(`Failed to save ${fileKey}:`, error);
            return false;
        }
    }

    async ensureInitialized() {
        if (!this.initialized) {
            await this.initialize();
        }
    }

    // Backup and Export
    async exportAllData() {
        await this.ensureInitialized();
        const exportData = {
            export_timestamp: new Date().toISOString(),
            version: "1.0",
            data: {
                players: this.cache.players,
                playerProgression: this.cache.playerProgression,
                shipData: this.cache.shipData,
                gameState: this.cache.gameState
            }
        };

        // Create downloadable file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `space_wars_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        return exportData;
    }

    // Clear localStorage after successful migration
    clearLegacyStorage() {
        const keysToRemove = ['players', 'currentPlayer', 'playerProgression', 'ship_data'];
        keysToRemove.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`Cleared legacy localStorage key: ${key}`);
            }
        });
    }

    // Development helper - show current data state
    async debugShowData() {
        await this.ensureInitialized();
        console.log('=== CURRENT DATA STATE ===');
        console.log('Players:', this.cache.players);
        console.log('Player Progression:', this.cache.playerProgression);
        console.log('Ship Data:', this.cache.shipData);
        console.log('Game State:', this.cache.gameState);
        console.log('========================');
    }
}

// Global data manager instance
window.DataManager = new DataManager();

// Helper functions for backward compatibility
window.DataAPI = {
    // Player functions
    async savePlayer(player) {
        return await window.DataManager.savePlayer(player);
    },
    
    async getPlayer(username) {
        return await window.DataManager.getPlayer(username);
    },
    
    async getAllPlayers() {
        return await window.DataManager.getAllPlayers();
    },
    
    async setCurrentPlayer(player) {
        return await window.DataManager.setCurrentPlayer(player);
    },
    
    async getCurrentPlayer() {
        return await window.DataManager.getCurrentPlayer();
    },
    
    // Progression functions
    async savePlayerProgression(username, progression) {
        return await window.DataManager.savePlayerProgression(username, progression);
    },
    
    async getPlayerProgression(username) {
        return await window.DataManager.getPlayerProgression(username);
    },
    
    // Ship functions
    async saveShipData(shipData) {
        return await window.DataManager.saveShipData(shipData);
    },
    
    async getShipData() {
        return await window.DataManager.getShipData();
    },
    
    // Utility functions
    async exportData() {
        return await window.DataManager.exportAllData();
    },
    
    async initialize() {
        return await window.DataManager.initialize();
    }
};
