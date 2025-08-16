// Player Management System
// Handles registration, authentication, and player data management

class PlayerManager {
    constructor() {
        this.playersFile = './data/players.json';
        this.shipMasterlistFile = './data/ship_masterlist.json';
        this.activeSessions = new Map(); // Track active sessions
        this.autoSaveInterval = 30000; // Auto-save every 30 seconds
        
        // Default starting locations
        this.defaultStartingLocation = { x: 0, y: 0, z: 0 }; // Public release area
        this.testingStartingLocation = { x: 621, y: 621, z: 621 }; // Testing area
        this.useTestingArea = false; // Toggle for testing vs public
        
        this.init();
    }

    async init() {
        console.log('🎮 Initializing Player Management System...');
        this.startAutoSave();
        this.scheduleBackup();
    }

    // === REGISTRATION & AUTHENTICATION ===

    async registerPlayer(playerName, password) {
        try {
            // Validate player name
            const validation = this.validatePlayerName(playerName);
            if (!validation.valid) {
                return { success: false, error: validation.error };
            }

            // Check if name already exists (case-insensitive)
            const existingPlayer = await this.findPlayerByName(playerName);
            if (existingPlayer) {
                return { success: false, error: 'Player name already exists' };
            }

            // Hash password
            const passwordHash = await this.hashPassword(password);

            // Load current players data
            const playersData = await this.loadPlayersData();
            
            // Create new player entry
            const newPlayer = {
                player_id: playersData.next_player_id,
                player_name: playerName.toLowerCase(), // Store lowercase for consistency
                display_name: playerName, // Store original case for display
                password_hash: passwordHash,
                registration_timestamp: new Date().toISOString(),
                last_login_timestamp: new Date().toISOString(),
                status: 'online'
            };

            // Add to players array
            playersData.players.push(newPlayer);
            playersData.next_player_id++;
            playersData.system_info.total_registered_players++;

            // Save players data
            await this.savePlayersData(playersData);

            // Create individual player file
            await this.createPlayerFile(newPlayer.player_id, playerName);

            // Create starter ship for player
            await this.createStarterShip(newPlayer.player_id);

            console.log(`✅ Player registered: ${playerName} (ID: ${newPlayer.player_id})`);
            
            return { 
                success: true, 
                player_id: newPlayer.player_id,
                message: 'Player registered successfully'
            };

        } catch (error) {
            console.error('❌ Registration error:', error);
            return { success: false, error: 'Registration failed' };
        }
    }

    async loginPlayer(playerName, password) {
        try {
            // Find player (case-insensitive)
            const player = await this.findPlayerByName(playerName);
            if (!player) {
                return { success: false, error: 'Player not found' };
            }

            // Verify password
            const passwordValid = await this.verifyPassword(password, player.password_hash);
            if (!passwordValid) {
                return { success: false, error: 'Invalid password' };
            }

            // Check for existing session and kick if found
            if (this.activeSessions.has(player.player_id)) {
                this.kickPlayer(player.player_id, 'Duplicate login detected');
            }

            // Update last login timestamp
            await this.updatePlayerLastLogin(player.player_id);

            // Create new session
            const sessionToken = this.generateSessionToken();
            this.activeSessions.set(player.player_id, {
                session_token: sessionToken,
                login_time: new Date().toISOString(),
                player_name: player.display_name,
                status: 'online'
            });

            console.log(`🎯 Player logged in: ${player.display_name} (ID: ${player.player_id})`);

            return {
                success: true,
                player_id: player.player_id,
                session_token: sessionToken,
                player_data: await this.loadPlayerData(player.player_id)
            };

        } catch (error) {
            console.error('❌ Login error:', error);
            return { success: false, error: 'Login failed' };
        }
    }

    // === VALIDATION & SECURITY ===

    validatePlayerName(name) {
        if (!name || typeof name !== 'string') {
            return { valid: false, error: 'Player name is required' };
        }

        // Check length (max 16 characters)
        if (name.length > 16) {
            return { valid: false, error: 'Player name must be 16 characters or less' };
        }

        // Check for valid characters (letters, numbers, underscore, hyphen)
        const validPattern = /^[a-zA-Z0-9_-]+$/;
        if (!validPattern.test(name)) {
            return { valid: false, error: 'Player name can only contain letters, numbers, underscore, and hyphen' };
        }

        // Check minimum length
        if (name.length < 3) {
            return { valid: false, error: 'Player name must be at least 3 characters' };
        }

        return { valid: true };
    }

    async hashPassword(password) {
        // Simple hash implementation - in production, use bcrypt or similar
        const crypto = require('crypto');
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        return `${salt}:${hash}`;
    }

    async verifyPassword(password, hashedPassword) {
        const crypto = require('crypto');
        const [salt, originalHash] = hashedPassword.split(':');
        const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
        return hash === originalHash;
    }

    generateSessionToken() {
        const crypto = require('crypto');
        return crypto.randomBytes(32).toString('hex');
    }

    // === DATA MANAGEMENT ===

    async loadPlayersData() {
        const fs = require('fs').promises;
        try {
            const data = await fs.readFile(this.playersFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading players data:', error);
            return { players: [], next_player_id: 1, system_info: {} };
        }
    }

    async savePlayersData(data) {
        const fs = require('fs').promises;
        try {
            await fs.writeFile(this.playersFile, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving players data:', error);
            return false;
        }
    }

    async findPlayerByName(playerName) {
        const playersData = await this.loadPlayersData();
        return playersData.players.find(p => 
            p.player_name.toLowerCase() === playerName.toLowerCase()
        );
    }

    async updatePlayerLastLogin(playerId) {
        const playersData = await this.loadPlayersData();
        const player = playersData.players.find(p => p.player_id === playerId);
        
        if (player) {
            player.last_login_timestamp = new Date().toISOString();
            player.status = 'online';
            await this.savePlayersData(playersData);
            
            // Also update individual player file
            const playerData = await this.loadPlayerData(playerId);
            if (playerData) {
                playerData.last_login_timestamp = new Date().toISOString();
                await this.savePlayerData(playerId, playerData);
            }
        }
    }

    async createPlayerFile(playerId, playerName) {
        const fs = require('fs').promises;
        
        // Determine starting location based on mode
        const startingLocation = this.useTestingArea ? 
            this.testingStartingLocation : 
            this.defaultStartingLocation;
        
        const playerData = {
            // Core Identity & Stats
            player_id: playerId,
            player_name: playerName.toLowerCase(),
            display_name: playerName,
            email: null,
            registration_timestamp: new Date().toISOString(),
            last_login_timestamp: new Date().toISOString(),
            total_playtime_minutes: 0,
            player_level: 1,
            experience_points: 0,

            // Resources & Economy
            credits: 10000, // Starting credits
            premium_currency: 0,
            reputation_points: 0,
            research_points: 100,
            materials_inventory: {
                metal: 100,
                energy_cells: 50,
                rare_minerals: 10
            },
            blueprints_owned: ['basic_scout'],

            // Fleet & Assets
            owned_ship_ids: [], // Will be populated when starter ship is created
            active_ship_id: null,
            fleet_size_limit: 1, // Start with 1 ship limit
            hangar_capacity: 3,
            base_coordinates: { ...startingLocation }, // Use selected starting area

            // Progress & Achievements
            missions_completed: 0,
            battles_won: 0,
            battles_lost: 0,
            distance_traveled: 0,
            achievements_unlocked: [],
            research_completed: [],

            // Game State & Preferences
            current_location: { ...startingLocation }, // Use selected starting area
            tutorial_progress: {
                basic_movement: false,
                ship_management: false,
                combat_basics: false,
                trading_basics: false
            },
            settings_preferences: {
                auto_save: true,
                notifications: true,
                sound_effects: true,
                music: true
            },
            alliance_id: null,
            last_save_timestamp: new Date().toISOString(),

            // Additional tracking
            status: 'online',
            first_login: true,
            starting_area: this.useTestingArea ? 'testing' : 'public' // Track which area they started in
        };

        const filename = `./data/players/player_${playerId}.json`;
        
        // Create players directory if it doesn't exist
        try {
            await fs.mkdir('./data/players', { recursive: true });
        } catch (error) {
            // Directory might already exist
        }

        await fs.writeFile(filename, JSON.stringify(playerData, null, 2));
        console.log(`📁 Created player file: ${filename}`);
        
        return playerData;
    }

    async loadPlayerData(playerId) {
        const fs = require('fs').promises;
        try {
            const filename = `./data/players/player_${playerId}.json`;
            const data = await fs.readFile(filename, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error loading player data for ID ${playerId}:`, error);
            return null;
        }
    }

    async savePlayerData(playerId, playerData) {
        const fs = require('fs').promises;
        try {
            playerData.last_save_timestamp = new Date().toISOString();
            const filename = `./data/players/player_${playerId}.json`;
            await fs.writeFile(filename, JSON.stringify(playerData, null, 2));
            return true;
        } catch (error) {
            console.error(`Error saving player data for ID ${playerId}:`, error);
            return false;
        }
    }

    // === SHIP MANAGEMENT ===

    async createStarterShip(playerId) {
        const fs = require('fs').promises;
        
        try {
            // Load ship masterlist
            const shipData = await fs.readFile(this.shipMasterlistFile, 'utf8');
            const shipMasterlist = JSON.parse(shipData);

            // Determine starting location based on mode
            const startingLocation = this.useTestingArea ? 
                this.testingStartingLocation : 
                this.defaultStartingLocation;

            // Create starter ship
            const newShip = {
                ship_id: shipMasterlist.next_ship_id,
                owner_player_id: playerId,
                ship_name: "Starter Vessel",
                ship_class: "basic_scout",
                hull_integrity: 100,
                max_hull: 100,
                shields: 50,
                max_shields: 50,
                location: { ...startingLocation }, // Use selected starting area
                status: "active",
                created_timestamp: new Date().toISOString(),
                equipment: {
                    engines: "basic_thruster",
                    weapons: ["basic_laser"],
                    modules: ["life_support", "navigation"]
                },
                cargo_capacity: 100,
                cargo_used: 0,
                fuel: 100,
                max_fuel: 100
            };

            // Add to masterlist
            shipMasterlist.ships.push(newShip);
            shipMasterlist.next_ship_id++;
            shipMasterlist.system_info.total_ships_created++;
            shipMasterlist.system_info.active_ships++;

            // Save masterlist
            await fs.writeFile(this.shipMasterlistFile, JSON.stringify(shipMasterlist, null, 2));

            // Update player data with ship
            const playerData = await this.loadPlayerData(playerId);
            if (playerData) {
                playerData.owned_ship_ids.push(newShip.ship_id);
                playerData.active_ship_id = newShip.ship_id;
                await this.savePlayerData(playerId, playerData);
            }

            console.log(`🚀 Created starter ship for player ${playerId}: Ship ID ${newShip.ship_id}`);
            return newShip;

        } catch (error) {
            console.error('Error creating starter ship:', error);
            return null;
        }
    }

    // === SESSION MANAGEMENT ===

    kickPlayer(playerId, reason = 'Kicked by system') {
        if (this.activeSessions.has(playerId)) {
            console.log(`👢 Kicking player ${playerId}: ${reason}`);
            this.activeSessions.delete(playerId);
            // In a real implementation, you'd send a disconnect message to the client
        }
    }

    logoutPlayer(playerId) {
        if (this.activeSessions.has(playerId)) {
            this.activeSessions.delete(playerId);
            console.log(`👋 Player ${playerId} logged out`);
        }
    }

    isPlayerOnline(playerId) {
        return this.activeSessions.has(playerId);
    }

    getOnlinePlayerCount() {
        return this.activeSessions.size;
    }

    // === AUTO-SAVE & BACKUP ===

    startAutoSave() {
        setInterval(() => {
            this.autoSaveAllPlayers();
        }, this.autoSaveInterval);
        console.log(`⚡ Auto-save started (every ${this.autoSaveInterval/1000} seconds)`);
    }

    async autoSaveAllPlayers() {
        const onlinePlayers = Array.from(this.activeSessions.keys());
        for (const playerId of onlinePlayers) {
            // Auto-save logic would trigger when players perform actions
            // For now, just update their last activity
            const playerData = await this.loadPlayerData(playerId);
            if (playerData) {
                playerData.last_save_timestamp = new Date().toISOString();
                await this.savePlayerData(playerId, playerData);
            }
        }
    }

    scheduleBackup() {
        // Schedule daily backup at 3 AM
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(3, 0, 0, 0);
        
        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        
        const timeUntilBackup = scheduledTime.getTime() - now.getTime();
        
        setTimeout(() => {
            this.performBackup();
            // Schedule next backup in 24 hours
            setInterval(() => {
                this.performBackup();
            }, 24 * 60 * 60 * 1000);
        }, timeUntilBackup);
        
        console.log(`💾 Backup scheduled for: ${scheduledTime.toISOString()}`);
    }

    async performBackup() {
        console.log('🔄 Starting daily backup...');
        const fs = require('fs').promises;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        try {
            // Create backup directory
            const backupDir = `./backups/backup_${timestamp}`;
            await fs.mkdir(backupDir, { recursive: true });
            
            // Copy all data files
            await fs.copyFile('./data/players.json', `${backupDir}/players.json`);
            await fs.copyFile('./data/ship_masterlist.json', `${backupDir}/ship_masterlist.json`);
            
            // Copy player files
            const playerFiles = await fs.readdir('./data/players');
            await fs.mkdir(`${backupDir}/players`, { recursive: true });
            
            for (const file of playerFiles) {
                await fs.copyFile(`./data/players/${file}`, `${backupDir}/players/${file}`);
            }
            
            // Update system info
            const playersData = await this.loadPlayersData();
            playersData.system_info.last_backup = new Date().toISOString();
            await this.savePlayersData(playersData);
            
            console.log(`✅ Backup completed: ${backupDir}`);
            
        } catch (error) {
            console.error('❌ Backup failed:', error);
        }
    }

    // === TESTING MODE MANAGEMENT ===

    enableTestingMode() {
        this.useTestingArea = true;
        console.log(`🧪 Testing mode enabled - new players start at ${JSON.stringify(this.testingStartingLocation)}`);
    }

    enablePublicMode() {
        this.useTestingArea = false;
        console.log(`🌍 Public mode enabled - new players start at ${JSON.stringify(this.defaultStartingLocation)}`);
    }

    getCurrentStartingLocation() {
        return this.useTestingArea ? this.testingStartingLocation : this.defaultStartingLocation;
    }

    getGameMode() {
        return this.useTestingArea ? 'testing' : 'public';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlayerManager;
}
