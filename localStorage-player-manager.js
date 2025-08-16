// LocalStorage-Based Player Registration System
// Browser-friendly data storage for testing and development

class LocalStoragePlayerManager {
    constructor() {
        this.playersKey = 'keldar_players';
        this.currentPlayerKey = 'keldar_current_player';
        this.shipCounterKey = 'keldar_ship_counter';
        this.playerShipsKey = 'keldar_player_ships';
    }

    // === REGISTRATION ===

    registerPlayer(playerName, password) {
        try {
            console.log(`🚀 Starting registration for: ${playerName}`);

            // Validate player name
            const validation = this.validatePlayerName(playerName);
            if (!validation.valid) {
                return { success: false, error: validation.error };
            }

            // Get existing players
            const players = this.getPlayers();
            
            // Check if player already exists
            const existingPlayer = players.find(p => 
                p.player_name.toLowerCase() === playerName.toLowerCase()
            );

            if (existingPlayer) {
                return { success: false, error: 'Player name already exists' };
            }

            // Create new player
            const newPlayerId = players.length > 0 ? Math.max(...players.map(p => p.player_id)) + 1 : 1;
            const timestamp = new Date().toISOString();

            const newPlayer = {
                player_id: newPlayerId,
                player_name: playerName.toLowerCase(),
                display_name: playerName,
                password_hash: this.hashPassword(password),
                registration_timestamp: timestamp,
                last_login_timestamp: timestamp,
                status: 'online',
                
                // Player Progress
                player_level: 1,
                experience_points: 0,
                total_playtime_minutes: 0,
                
                // Starting Resources
                credits: 2000, // Starting credits as requested
                
                // Location Data
                current_location: { x: 0, y: 0, z: 0 },
                base_coordinates: { x: 0, y: 0, z: 0 },
                
                // Progression
                missions_completed: 0,
                reputation_level: 'unknown',
                
                // Game Statistics
                statistics: {
                    total_distance_traveled: 0,
                    missions_completed: 0,
                    ships_destroyed: 0,
                    credits_earned_lifetime: 2000,
                    time_in_combat: 0,
                    successful_trades: 0
                }
            };

            // Save player
            players.push(newPlayer);
            localStorage.setItem(this.playersKey, JSON.stringify(players));

            // Grant starter ship
            this.grantStarterShip(newPlayerId);

            console.log(`✅ Player registered successfully: ${playerName}`);
            return { 
                success: true, 
                message: 'Registration successful!',
                player: newPlayer 
            };

        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'Registration failed: ' + error.message };
        }
    }

    // === SHIP MANAGEMENT ===

    grantStarterShip(playerId) {
        try {
            // Get ship data from static files (we'll load this separately)
            const shipId = this.getNextShipId();
            const timestamp = new Date().toISOString();

            const starterShip = {
                ship_id: shipId,
                owner_id: playerId,
                ship_type: 'basic_scout',
                ship_name: 'Pioneer',
                acquisition_timestamp: timestamp,
                
                // Ship Status
                current_location: { x: 0, y: 0, z: 0 },
                hull_integrity: 100,
                fuel_level: 100,
                cargo_capacity: 50,
                cargo_used: 0,
                
                // Equipment
                weapons: [],
                defensive_systems: [],
                utility_modules: [],
                
                // Upgrades
                hull_upgrades: [],
                engine_upgrades: [],
                system_upgrades: [],
                
                // Experience
                ship_level: 1,
                experience_points: 0,
                
                // Statistics
                total_distance_traveled: 0,
                missions_completed: 0,
                combat_encounters: 0
            };

            // Save ship to player ships
            const playerShips = this.getPlayerShips();
            if (!playerShips[playerId]) {
                playerShips[playerId] = [];
            }
            playerShips[playerId].push(starterShip);
            localStorage.setItem(this.playerShipsKey, JSON.stringify(playerShips));

            console.log(`🚢 Starter ship granted to player ${playerId}: ${starterShip.ship_name}`);
            return starterShip;

        } catch (error) {
            console.error('Error granting starter ship:', error);
            throw error;
        }
    }

    // === LOGIN ===

    loginPlayer(playerName, password) {
        try {
            const players = this.getPlayers();
            const player = players.find(p => 
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
            
            const players_updated = players.map(p => 
                p.player_id === player.player_id ? player : p
            );
            localStorage.setItem(this.playersKey, JSON.stringify(players_updated));

            // Set current player
            localStorage.setItem(this.currentPlayerKey, JSON.stringify(player));

            console.log(`🎮 Player logged in: ${player.display_name}`);
            return { 
                success: true, 
                message: 'Login successful!',
                player: player 
            };

        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Login failed: ' + error.message };
        }
    }

    // === DATA HELPERS ===

    getPlayers() {
        const data = localStorage.getItem(this.playersKey);
        return data ? JSON.parse(data) : [];
    }

    getPlayerShips() {
        const data = localStorage.getItem(this.playerShipsKey);
        return data ? JSON.parse(data) : {};
    }

    getCurrentPlayer() {
        const data = localStorage.getItem(this.currentPlayerKey);
        return data ? JSON.parse(data) : null;
    }

    getNextShipId() {
        let counter = localStorage.getItem(this.shipCounterKey);
        counter = counter ? parseInt(counter) + 1 : 1;
        localStorage.setItem(this.shipCounterKey, counter.toString());
        return counter;
    }

    // === VALIDATION ===

    validatePlayerName(playerName) {
        if (!playerName || playerName.trim().length === 0) {
            return { valid: false, error: 'Player name cannot be empty' };
        }

        if (playerName.length < 3) {
            return { valid: false, error: 'Player name must be at least 3 characters' };
        }

        if (playerName.length > 20) {
            return { valid: false, error: 'Player name cannot exceed 20 characters' };
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(playerName)) {
            return { valid: false, error: 'Player name can only contain letters, numbers, underscores, and hyphens' };
        }

        return { valid: true };
    }

    // === UTILITIES ===

    hashPassword(password) {
        // Simple hash for testing - use proper hashing in production
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    // === DEBUG METHODS ===

    clearAllData() {
        localStorage.removeItem(this.playersKey);
        localStorage.removeItem(this.currentPlayerKey);
        localStorage.removeItem(this.shipCounterKey);
        localStorage.removeItem(this.playerShipsKey);
        console.log('🧹 All player data cleared from localStorage');
    }

    exportData() {
        return {
            players: this.getPlayers(),
            playerShips: this.getPlayerShips(),
            currentPlayer: this.getCurrentPlayer()
        };
    }

    importData(data) {
        if (data.players) {
            localStorage.setItem(this.playersKey, JSON.stringify(data.players));
        }
        if (data.playerShips) {
            localStorage.setItem(this.playerShipsKey, JSON.stringify(data.playerShips));
        }
        if (data.currentPlayer) {
            localStorage.setItem(this.currentPlayerKey, JSON.stringify(data.currentPlayer));
        }
        console.log('📥 Data imported to localStorage');
    }
}

// Global instance
window.playerManager = new LocalStoragePlayerManager();
