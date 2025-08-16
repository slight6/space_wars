// Admin Toolkit for Space Explorer
// Administrative functions for managing players and game data

class AdminToolkit {
    constructor(playerManager) {
        this.playerManager = playerManager;
        this.adminLevel = 'super_admin'; // super_admin, admin, moderator
    }

    // === PLAYER MANAGEMENT ===

    async getAllPlayers() {
        const playersData = await this.playerManager.loadPlayersData();
        return playersData.players.map(player => ({
            player_id: player.player_id,
            display_name: player.display_name,
            registration_timestamp: player.registration_timestamp,
            last_login_timestamp: player.last_login_timestamp,
            status: player.status
        }));
    }

    async getPlayerDetails(playerId) {
        const playerData = await this.playerManager.loadPlayerData(playerId);
        return playerData;
    }

    async updatePlayerCredits(playerId, amount, reason = 'Admin adjustment') {
        const playerData = await this.playerManager.loadPlayerData(playerId);
        if (!playerData) return { success: false, error: 'Player not found' };

        const oldCredits = playerData.credits;
        playerData.credits = Math.max(0, playerData.credits + amount);
        
        await this.playerManager.savePlayerData(playerId, playerData);
        
        console.log(`💰 Admin: Updated player ${playerId} credits: ${oldCredits} → ${playerData.credits} (${reason})`);
        
        return { 
            success: true, 
            old_credits: oldCredits, 
            new_credits: playerData.credits 
        };
    }

    async setPlayerLevel(playerId, newLevel) {
        const playerData = await this.playerManager.loadPlayerData(playerId);
        if (!playerData) return { success: false, error: 'Player not found' };

        const oldLevel = playerData.player_level;
        playerData.player_level = Math.max(1, newLevel);
        
        await this.playerManager.savePlayerData(playerId, playerData);
        
        console.log(`⭐ Admin: Updated player ${playerId} level: ${oldLevel} → ${playerData.player_level}`);
        
        return { 
            success: true, 
            old_level: oldLevel, 
            new_level: playerData.player_level 
        };
    }

    async resetPlayerProgress(playerId, areas = ['all']) {
        const playerData = await this.playerManager.loadPlayerData(playerId);
        if (!playerData) return { success: false, error: 'Player not found' };

        const resetAreas = [];

        if (areas.includes('all') || areas.includes('missions')) {
            playerData.missions_completed = 0;
            playerData.achievements_unlocked = [];
            resetAreas.push('missions');
        }

        if (areas.includes('all') || areas.includes('combat')) {
            playerData.battles_won = 0;
            playerData.battles_lost = 0;
            resetAreas.push('combat');
        }

        if (areas.includes('all') || areas.includes('research')) {
            playerData.research_completed = [];
            playerData.research_points = 100;
            resetAreas.push('research');
        }

        if (areas.includes('all') || areas.includes('tutorial')) {
            playerData.tutorial_progress = {
                basic_movement: false,
                ship_management: false,
                combat_basics: false,
                trading_basics: false
            };
            resetAreas.push('tutorial');
        }

        await this.playerManager.savePlayerData(playerId, playerData);
        
        console.log(`🔄 Admin: Reset player ${playerId} progress in areas: ${resetAreas.join(', ')}`);
        
        return { success: true, reset_areas: resetAreas };
    }

    async changePlayerName(playerId, newName) {
        // Validate new name
        const validation = this.playerManager.validatePlayerName(newName);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        // Check if name already exists
        const existingPlayer = await this.playerManager.findPlayerByName(newName);
        if (existingPlayer && existingPlayer.player_id !== playerId) {
            return { success: false, error: 'Name already exists' };
        }

        // Update player data
        const playerData = await this.playerManager.loadPlayerData(playerId);
        if (!playerData) return { success: false, error: 'Player not found' };

        const oldName = playerData.display_name;
        playerData.player_name = newName.toLowerCase();
        playerData.display_name = newName;

        await this.playerManager.savePlayerData(playerId, playerData);

        // Update players.json
        const playersData = await this.playerManager.loadPlayersData();
        const player = playersData.players.find(p => p.player_id === playerId);
        if (player) {
            player.player_name = newName.toLowerCase();
            player.display_name = newName;
            await this.playerManager.savePlayersData(playersData);
        }

        console.log(`📝 Admin: Changed player ${playerId} name: ${oldName} → ${newName}`);
        
        return { success: true, old_name: oldName, new_name: newName };
    }

    // === SHIP MANAGEMENT ===

    async getAllShips() {
        const fs = require('fs').promises;
        const shipData = await fs.readFile(this.playerManager.shipMasterlistFile, 'utf8');
        const shipMasterlist = JSON.parse(shipData);
        return shipMasterlist.ships;
    }

    async transferShip(shipId, fromPlayerId, toPlayerId) {
        const fs = require('fs').promises;
        
        // Load ship masterlist
        const shipData = await fs.readFile(this.playerManager.shipMasterlistFile, 'utf8');
        const shipMasterlist = JSON.parse(shipData);
        
        const ship = shipMasterlist.ships.find(s => s.ship_id === shipId);
        if (!ship) return { success: false, error: 'Ship not found' };
        
        if (ship.owner_player_id !== fromPlayerId) {
            return { success: false, error: 'Ship not owned by specified player' };
        }

        // Update ship ownership
        ship.owner_player_id = toPlayerId;
        await fs.writeFile(this.playerManager.shipMasterlistFile, JSON.stringify(shipMasterlist, null, 2));

        // Update player data
        const fromPlayerData = await this.playerManager.loadPlayerData(fromPlayerId);
        const toPlayerData = await this.playerManager.loadPlayerData(toPlayerId);

        if (fromPlayerData) {
            fromPlayerData.owned_ship_ids = fromPlayerData.owned_ship_ids.filter(id => id !== shipId);
            if (fromPlayerData.active_ship_id === shipId) {
                fromPlayerData.active_ship_id = fromPlayerData.owned_ship_ids[0] || null;
            }
            await this.playerManager.savePlayerData(fromPlayerId, fromPlayerData);
        }

        if (toPlayerData) {
            toPlayerData.owned_ship_ids.push(shipId);
            if (!toPlayerData.active_ship_id) {
                toPlayerData.active_ship_id = shipId;
            }
            await this.playerManager.savePlayerData(toPlayerId, toPlayerData);
        }

        console.log(`🚀 Admin: Transferred ship ${shipId} from player ${fromPlayerId} to player ${toPlayerId}`);
        
        return { success: true };
    }

    // === SYSTEM MANAGEMENT ===

    async getSystemStats() {
        const playersData = await this.playerManager.loadPlayersData();
        const onlineCount = this.playerManager.getOnlinePlayerCount();
        
        const fs = require('fs').promises;
        const shipData = await fs.readFile(this.playerManager.shipMasterlistFile, 'utf8');
        const shipMasterlist = JSON.parse(shipData);

        return {
            total_players: playersData.system_info.total_registered_players,
            online_players: onlineCount,
            total_ships: shipMasterlist.system_info.total_ships_created,
            active_ships: shipMasterlist.system_info.active_ships,
            last_backup: playersData.system_info.last_backup,
            system_uptime: process.uptime ? Math.floor(process.uptime()) : 'N/A'
        };
    }

    async forceBackup() {
        await this.playerManager.performBackup();
        return { success: true, message: 'Backup completed successfully' };
    }

    async kickAllPlayers(reason = 'Server maintenance') {
        const onlinePlayers = Array.from(this.playerManager.activeSessions.keys());
        onlinePlayers.forEach(playerId => {
            this.playerManager.kickPlayer(playerId, reason);
        });
        
        console.log(`👢 Admin: Kicked all players (${onlinePlayers.length}) - ${reason}`);
        
        return { success: true, kicked_count: onlinePlayers.length };
    }

    // === ECONOMY MANAGEMENT ===

    async adjustGlobalEconomy(adjustments) {
        const playersData = await this.playerManager.loadPlayersData();
        let affectedPlayers = 0;

        for (const player of playersData.players) {
            const playerData = await this.playerManager.loadPlayerData(player.player_id);
            if (!playerData) continue;

            let updated = false;

            if (adjustments.credits_multiplier) {
                playerData.credits = Math.floor(playerData.credits * adjustments.credits_multiplier);
                updated = true;
            }

            if (adjustments.materials_multiplier) {
                for (const material in playerData.materials_inventory) {
                    playerData.materials_inventory[material] = Math.floor(
                        playerData.materials_inventory[material] * adjustments.materials_multiplier
                    );
                }
                updated = true;
            }

            if (updated) {
                await this.playerManager.savePlayerData(player.player_id, playerData);
                affectedPlayers++;
            }
        }

        console.log(`💰 Admin: Applied economy adjustments to ${affectedPlayers} players`);
        
        return { success: true, affected_players: affectedPlayers };
    }

    // === LOGGING & MONITORING ===

    async getPlayerActivity(hours = 24) {
        const playersData = await this.playerManager.loadPlayersData();
        const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
        
        const recentActivity = playersData.players.filter(player => {
            const lastLogin = new Date(player.last_login_timestamp);
            return lastLogin >= cutoffTime;
        });

        return {
            active_players_count: recentActivity.length,
            total_players: playersData.players.length,
            activity_rate: `${((recentActivity.length / playersData.players.length) * 100).toFixed(1)}%`,
            recent_players: recentActivity.map(p => ({
                player_id: p.player_id,
                display_name: p.display_name,
                last_login: p.last_login_timestamp
            }))
        };
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminToolkit;
}
