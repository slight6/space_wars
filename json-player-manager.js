// JSON-Based Player Registration System
// Pure file-based data storage with no localStorage dependency

class JSONPlayerManager {
    constructor() {
        this.playersFile = './data/players.json';
        this.shipMasterFile = './data/ship_master.json';
        this.shipsFile = './data/ships.json';
    }

    // === REGISTRATION ===

    async registerPlayer(playerName, password) {
        try {
            console.log(`🚀 Starting registration for: ${playerName}`);

            // Validate player name
            const validation = this.validatePlayerName(playerName);
            if (!validation.valid) {
                return { success: false, error: validation.error };
            }

            // Load and check existing players
            const playersData = await this.loadJSON(this.playersFile);
            const existingPlayer = playersData.players.find(p => 
                p.player_name.toLowerCase() === playerName.toLowerCase()
            );

            if (existingPlayer) {
                return { success: false, error: 'Player name already exists' };
            }

            // Create new player
            const newPlayerId = playersData.next_player_id;
            const timestamp = new Date().toISOString();

            const newPlayer = {
                player_id: newPlayerId,
                player_name: playerName.toLowerCase(),
                display_name: playerName,
                password_hash: this.hashPassword(password),
                registration_timestamp: timestamp,
                last_login_timestamp: timestamp,
                status: 'online'
            };

            // Update players.json
            playersData.players.push(newPlayer);
            playersData.next_player_id++;
            playersData.system_info.total_registered_players++;
            playersData.system_info.last_updated = timestamp;

            await this.saveJSON(this.playersFile, playersData);

            // Create individual player file
            await this.createPlayerFile(newPlayerId, playerName);

            // Grant starter ship
            const starterShip = await this.grantStarterShip(newPlayerId);

            console.log(`✅ Player registered successfully: ${playerName} (ID: ${newPlayerId})`);
            console.log(`🚀 Starter ship granted: ${starterShip.ship_name} (ID: ${starterShip.ship_id})`);

            return {
                success: true,
                player_id: newPlayerId,
                message: 'Registration successful',
                starter_ship: starterShip
            };

        } catch (error) {
            console.error('❌ Registration failed:', error);
            return { success: false, error: 'Registration system error' };
        }
    }

    // === PLAYER FILE CREATION ===

    async createPlayerFile(playerId, playerName) {
        const timestamp = new Date().toISOString();
        
        const playerData = {
            // Core Identity
            player_id: playerId,
            player_name: playerName.toLowerCase(),
            display_name: playerName,
            registration_timestamp: timestamp,
            last_login_timestamp: timestamp,
            last_save_timestamp: timestamp,

            // Starting Resources
            credits: 2000, // Starting credits as requested

            // Starting Location (fixed at 0,0,0 for now)
            current_location: { x: 0, y: 0, z: 0 },
            base_coordinates: { x: 0, y: 0, z: 0 },

            // Fleet Information
            owned_ship_ids: [], // Will be populated when starter ship is granted
            active_ship_id: null,
            fleet_capacity: 1, // Start with capacity for 1 ship

            // Game Progress
            player_level: 1,
            experience_points: 0,
            missions_completed: 0,
            achievements: [],

            // Game State
            tutorial_completed: false,
            first_login: true,
            status: 'online',

            // Statistics
            total_playtime_minutes: 0,
            battles_fought: 0,
            distance_traveled: 0,
            credits_earned: 2000,
            credits_spent: 0,

            // Settings
            game_settings: {
                auto_save: true,
                notifications: true,
                difficulty: 'normal'
            }
        };

        const filename = `./data/players/player_${playerId}.json`;
        
        // Create directory if needed
        await this.ensureDirectory('./data/players');
        
        await this.saveJSON(filename, playerData);
        console.log(`📁 Created player file: ${filename}`);

        return playerData;
    }

    // === SHIP GRANTING ===

    async grantStarterShip(playerId) {
        try {
            // Load ship data
            const shipMasterData = await this.loadJSON(this.shipMasterFile);
            const shipsData = await this.loadJSON(this.shipsFile);

            // Get basic_scout blueprint
            const blueprint = shipsData.ship_blueprints.basic_scout;
            if (!blueprint) {
                throw new Error('Basic scout blueprint not found');
            }

            // Create new ship based on template
            const newShipId = shipMasterData.next_ship_id;
            const timestamp = new Date().toISOString();

            const newShip = JSON.parse(JSON.stringify(shipsData.ship_template)); // Deep copy template
            
            // Customize the ship
            newShip.ship_id = newShipId;
            newShip.owner_player_id = playerId;
            newShip.ship_name = "Starter Vessel";
            newShip.ship_class = "basic_scout";
            newShip.blueprint_id = "basic_scout";
            newShip.created_timestamp = timestamp;
            newShip.last_modified_timestamp = timestamp;
            newShip.location = { x: 0, y: 0, z: 0 }; // Starting location

            // Copy blueprint specifications to current specifications
            Object.assign(newShip.current_specifications, blueprint.base_specifications);
            Object.assign(newShip.current_capabilities, blueprint.capabilities);

            // Add to ship master registry
            shipMasterData.ships.push(newShip);
            shipMasterData.next_ship_id++;
            shipMasterData.system_info.total_ships_created++;
            shipMasterData.system_info.active_ships++;
            shipMasterData.system_info.last_updated = timestamp;

            await this.saveJSON(this.shipMasterFile, shipMasterData);

            // Update player data with ship ownership
            const playerData = await this.loadJSON(`./data/players/player_${playerId}.json`);
            playerData.owned_ship_ids.push(newShipId);
            playerData.active_ship_id = newShipId;
            playerData.last_save_timestamp = timestamp;

            await this.saveJSON(`./data/players/player_${playerId}.json`, playerData);

            return newShip;

        } catch (error) {
            console.error('❌ Error granting starter ship:', error);
            throw error;
        }
    }

    // === UTILITY FUNCTIONS ===

    validatePlayerName(name) {
        if (!name || typeof name !== 'string') {
            return { valid: false, error: 'Player name is required' };
        }

        if (name.length < 3) {
            return { valid: false, error: 'Player name must be at least 3 characters' };
        }

        if (name.length > 16) {
            return { valid: false, error: 'Player name must be 16 characters or less' };
        }

        const validPattern = /^[a-zA-Z0-9_-]+$/;
        if (!validPattern.test(name)) {
            return { valid: false, error: 'Player name can only contain letters, numbers, underscore, and hyphen' };
        }

        return { valid: true };
    }

    hashPassword(password) {
        // Simple hash for demo - in production use proper hashing
        return btoa(password + 'salt_string');
    }

    async loadJSON(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error loading ${filePath}:`, error);
            // Return default structure if file doesn't exist
            if (filePath.includes('players.json')) {
                return {
                    players: [],
                    next_player_id: 1,
                    system_info: {
                        created: new Date().toISOString(),
                        last_updated: new Date().toISOString(),
                        total_registered_players: 0
                    }
                };
            }
            throw error;
        }
    }

    async saveJSON(filePath, data) {
        // Note: This is a simplified version for demo
        // In a real implementation, you'd need a backend API to handle file writes
        console.log(`📝 Would save to ${filePath}:`, data);
        
        // For demo purposes, we'll simulate the save
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`✅ Simulated save to ${filePath}`);
                resolve(true);
            }, 100);
        });
    }

    async ensureDirectory(dirPath) {
        // In a real implementation, this would create the directory on the server
        console.log(`📁 Ensuring directory exists: ${dirPath}`);
    }

    // === LOGIN ===

    async loginPlayer(playerName, password) {
        try {
            const playersData = await this.loadJSON(this.playersFile);
            const player = playersData.players.find(p => 
                p.player_name.toLowerCase() === playerName.toLowerCase()
            );

            if (!player) {
                return { success: false, error: 'Player not found' };
            }

            if (player.password_hash !== this.hashPassword(password)) {
                return { success: false, error: 'Invalid password' };
            }

            // Update last login
            player.last_login_timestamp = new Date().toISOString();
            player.status = 'online';

            await this.saveJSON(this.playersFile, playersData);

            // Load full player data
            const playerData = await this.loadJSON(`./data/players/player_${player.player_id}.json`);

            return {
                success: true,
                player_id: player.player_id,
                player_data: playerData
            };

        } catch (error) {
            console.error('❌ Login failed:', error);
            return { success: false, error: 'Login system error' };
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JSONPlayerManager;
}
