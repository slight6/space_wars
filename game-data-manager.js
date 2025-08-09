/**
 * Game Data Manager
 * Handles JSON storage with PostgreSQL migration readiness
 * All data structures are designed to be database-table compatible
 */

class GameDataManager {
    constructor() {
        this.storageKeys = {
            players: 'game_players',
            torpedoFormations: 'torpedo_formations',
            gameSettings: 'game_settings',
            chatMessages: 'chat_messages',
            transactions: 'transactions',
            explorationData: 'exploration_data'
        };
        
        this.initializeStorage();
    }
    
    initializeStorage() {
        // Initialize empty arrays for each data type if they don't exist
        Object.values(this.storageKeys).forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });
        
        // Initialize game settings
        if (!localStorage.getItem(this.storageKeys.gameSettings)) {
            const defaultSettings = {
                version: '1.0.0',
                lastUpdated: new Date().toISOString(),
                gameMode: 'development',
                features: {
                    torpedoSystem: true,
                    chat: true,
                    trading: true,
                    exploration: true
                }
            };
            localStorage.setItem(this.storageKeys.gameSettings, JSON.stringify(defaultSettings));
        }
    }
    
    // Player Management (Compatible with PostgreSQL users table)
    savePlayer(playerData) {
        const players = this.getPlayers();
        const existingIndex = players.findIndex(p => p.username === playerData.username);
        
        const playerRecord = {
            id: playerData.id || this.generateId(),
            username: playerData.username,
            email: playerData.email || null,
            password_hash: playerData.password || null, // In production, this would be hashed
            credits: playerData.credits || 100000,
            experience: playerData.experience || 0,
            level: playerData.level || 1,
            ship_name: playerData.shipName || 'Star Wanderer',
            ship_type: playerData.shipType || 'Explorer',
            current_location: JSON.stringify(playerData.currentLocation || { x: 0, y: 0, z: 0 }),
            inventory: JSON.stringify(playerData.inventory || []),
            stats: JSON.stringify(playerData.stats || {}),
            created_at: playerData.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            is_active: true
        };
        
        if (existingIndex !== -1) {
            players[existingIndex] = playerRecord;
        } else {
            players.push(playerRecord);
        }
        
        localStorage.setItem(this.storageKeys.players, JSON.stringify(players));
        return playerRecord;
    }
    
    getPlayer(username) {
        const players = this.getPlayers();
        return players.find(p => p.username === username);
    }
    
    getPlayers() {
        return JSON.parse(localStorage.getItem(this.storageKeys.players) || '[]');
    }
    
    // Torpedo Formation Management (Compatible with PostgreSQL torpedo_formations table)
    saveTorpedoFormation(formationData) {
        const formations = this.getTorpedoFormations();
        
        const formationRecord = {
            id: formationData.id || this.generateId(),
            player_id: formationData.playerID,
            coordinates: JSON.stringify(formationData.coordinates),
            torpedo_type: formationData.torpedoType || 'STANDARD',
            launch_timestamp: formationData.launchTimestamp || Date.now(),
            completion_time: formationData.completionTime,
            cooldown_duration: formationData.cooldownDuration,
            status: formationData.status || 'FORMING',
            is_complete: formationData.isComplete || false,
            scan_results: JSON.stringify(formationData.scanResults || []),
            all_possibilities: JSON.stringify(formationData.allPossibilities || {}),
            actual_outcome: JSON.stringify(formationData.actualOutcome || null),
            created_at: formationData.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        const existingIndex = formations.findIndex(f => f.id === formationRecord.id);
        if (existingIndex !== -1) {
            formations[existingIndex] = formationRecord;
        } else {
            formations.push(formationRecord);
        }
        
        localStorage.setItem(this.storageKeys.torpedoFormations, JSON.stringify(formations));
        return formationRecord;
    }
    
    getTorpedoFormations(playerId = null) {
        const formations = JSON.parse(localStorage.getItem(this.storageKeys.torpedoFormations) || '[]');
        
        if (playerId) {
            return formations.filter(f => f.player_id === playerId);
        }
        
        return formations;
    }
    
    updateTorpedoFormation(formationId, updates) {
        const formations = this.getTorpedoFormations();
        const formationIndex = formations.findIndex(f => f.id === formationId);
        
        if (formationIndex !== -1) {
            formations[formationIndex] = {
                ...formations[formationIndex],
                ...updates,
                updated_at: new Date().toISOString()
            };
            localStorage.setItem(this.storageKeys.torpedoFormations, JSON.stringify(formations));
            return formations[formationIndex];
        }
        
        return null;
    }
    
    // Transaction Management (Compatible with PostgreSQL transactions table)
    saveTransaction(transactionData) {
        const transactions = this.getTransactions();
        
        const transactionRecord = {
            id: this.generateId(),
            player_id: transactionData.playerId,
            transaction_type: transactionData.type, // 'purchase', 'sale', 'transfer', 'reward'
            item_id: transactionData.itemId || null,
            item_name: transactionData.itemName || null,
            quantity: transactionData.quantity || 1,
            unit_price: transactionData.unitPrice || 0,
            total_amount: transactionData.totalAmount || 0,
            credits_before: transactionData.creditsBefore || 0,
            credits_after: transactionData.creditsAfter || 0,
            location: JSON.stringify(transactionData.location || { x: 0, y: 0, z: 0 }),
            description: transactionData.description || '',
            metadata: JSON.stringify(transactionData.metadata || {}),
            created_at: new Date().toISOString()
        };
        
        transactions.push(transactionRecord);
        localStorage.setItem(this.storageKeys.transactions, JSON.stringify(transactions));
        return transactionRecord;
    }
    
    getTransactions(playerId = null, limit = 100) {
        const transactions = JSON.parse(localStorage.getItem(this.storageKeys.transactions) || '[]');
        
        let filtered = transactions;
        if (playerId) {
            filtered = transactions.filter(t => t.player_id === playerId);
        }
        
        // Sort by created_at descending and limit
        return filtered
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, limit);
    }
    
    // Chat Message Management (Compatible with PostgreSQL chat_messages table)
    saveChatMessage(messageData) {
        const messages = this.getChatMessages();
        
        const messageRecord = {
            id: this.generateId(),
            player_id: messageData.playerId,
            username: messageData.username,
            message: messageData.message,
            message_type: messageData.type || 'public', // 'public', 'private', 'system'
            target_player_id: messageData.targetPlayerId || null,
            location: JSON.stringify(messageData.location || { x: 0, y: 0, z: 0 }),
            created_at: messageData.timestamp || new Date().toISOString()
        };
        
        messages.push(messageRecord);
        
        // Keep only last 500 messages to prevent storage bloat
        if (messages.length > 500) {
            messages.splice(0, messages.length - 500);
        }
        
        localStorage.setItem(this.storageKeys.chatMessages, JSON.stringify(messages));
        return messageRecord;
    }
    
    getChatMessages(limit = 50, messageType = null) {
        const messages = JSON.parse(localStorage.getItem(this.storageKeys.chatMessages) || '[]');
        
        let filtered = messages;
        if (messageType) {
            filtered = messages.filter(m => m.message_type === messageType);
        }
        
        return filtered
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, limit)
            .reverse(); // Most recent at bottom for chat display
    }
    
    // Exploration Data Management (Compatible with PostgreSQL exploration_data table)
    saveExplorationData(explorationData) {
        const explorations = this.getExplorationData();
        
        const explorationRecord = {
            id: this.generateId(),
            player_id: explorationData.playerId,
            location: JSON.stringify(explorationData.location),
            scan_type: explorationData.scanType || 'basic',
            results: JSON.stringify(explorationData.results),
            resources_found: JSON.stringify(explorationData.resourcesFound || []),
            threats_detected: JSON.stringify(explorationData.threatsDetected || []),
            cost: explorationData.cost || 0,
            experience_gained: explorationData.experienceGained || 0,
            created_at: new Date().toISOString()
        };
        
        explorations.push(explorationRecord);
        localStorage.setItem(this.storageKeys.explorationData, JSON.stringify(explorations));
        return explorationRecord;
    }
    
    getExplorationData(playerId = null, location = null) {
        const explorations = JSON.parse(localStorage.getItem(this.storageKeys.explorationData) || '[]');
        
        let filtered = explorations;
        
        if (playerId) {
            filtered = filtered.filter(e => e.player_id === playerId);
        }
        
        if (location) {
            const locationStr = JSON.stringify(location);
            filtered = filtered.filter(e => e.location === locationStr);
        }
        
        return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    // Utility Methods
    generateId() {
        return 'gd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    exportAllData() {
        const allData = {};
        Object.entries(this.storageKeys).forEach(([key, storageKey]) => {
            allData[key] = JSON.parse(localStorage.getItem(storageKey) || '[]');
        });
        return allData;
    }
    
    importAllData(data) {
        Object.entries(data).forEach(([key, value]) => {
            if (this.storageKeys[key]) {
                localStorage.setItem(this.storageKeys[key], JSON.stringify(value));
            }
        });
    }
    
    clearAllData() {
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
        this.initializeStorage();
    }
    
    // PostgreSQL Migration Helpers
    generatePostgreSQLSchema() {
        return `
-- Game Data PostgreSQL Schema
-- Generated on ${new Date().toISOString()}

-- Players table
CREATE TABLE players (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255),
    credits BIGINT DEFAULT 100000,
    experience BIGINT DEFAULT 0,
    level INTEGER DEFAULT 1,
    ship_name VARCHAR(100) DEFAULT 'Star Wanderer',
    ship_type VARCHAR(50) DEFAULT 'Explorer',
    current_location JSONB DEFAULT '{"x":0,"y":0,"z":0}',
    inventory JSONB DEFAULT '[]',
    stats JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Torpedo formations table
CREATE TABLE torpedo_formations (
    id VARCHAR(50) PRIMARY KEY,
    player_id VARCHAR(50) REFERENCES players(id),
    coordinates JSONB NOT NULL,
    torpedo_type VARCHAR(20) DEFAULT 'STANDARD',
    launch_timestamp BIGINT NOT NULL,
    completion_time BIGINT NOT NULL,
    cooldown_duration BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'FORMING',
    is_complete BOOLEAN DEFAULT false,
    scan_results JSONB DEFAULT '[]',
    all_possibilities JSONB DEFAULT '{}',
    actual_outcome JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id VARCHAR(50) PRIMARY KEY,
    player_id VARCHAR(50) REFERENCES players(id),
    transaction_type VARCHAR(20) NOT NULL,
    item_id VARCHAR(50),
    item_name VARCHAR(100),
    quantity INTEGER DEFAULT 1,
    unit_price BIGINT DEFAULT 0,
    total_amount BIGINT DEFAULT 0,
    credits_before BIGINT DEFAULT 0,
    credits_after BIGINT DEFAULT 0,
    location JSONB DEFAULT '{"x":0,"y":0,"z":0}',
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE chat_messages (
    id VARCHAR(50) PRIMARY KEY,
    player_id VARCHAR(50) REFERENCES players(id),
    username VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'public',
    target_player_id VARCHAR(50) REFERENCES players(id),
    location JSONB DEFAULT '{"x":0,"y":0,"z":0}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exploration data table
CREATE TABLE exploration_data (
    id VARCHAR(50) PRIMARY KEY,
    player_id VARCHAR(50) REFERENCES players(id),
    location JSONB NOT NULL,
    scan_type VARCHAR(20) DEFAULT 'basic',
    results JSONB DEFAULT '{}',
    resources_found JSONB DEFAULT '[]',
    threats_detected JSONB DEFAULT '[]',
    cost BIGINT DEFAULT 0,
    experience_gained INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_players_last_login ON players(last_login);
CREATE INDEX idx_torpedo_formations_player_id ON torpedo_formations(player_id);
CREATE INDEX idx_torpedo_formations_status ON torpedo_formations(status);
CREATE INDEX idx_transactions_player_id ON transactions(player_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_player_id ON chat_messages(player_id);
CREATE INDEX idx_exploration_data_player_id ON exploration_data(player_id);
CREATE INDEX idx_exploration_data_location ON exploration_data USING GIN(location);
        `;
    }
    
    // Generate migration script from current localStorage data
    generateMigrationScript() {
        const allData = this.exportAllData();
        let script = "-- Migration script from localStorage to PostgreSQL\n\n";
        
        // Generate INSERT statements for each table
        Object.entries(allData).forEach(([tableName, records]) => {
            if (records.length > 0) {
                script += `-- Insert data into ${tableName}\n`;
                records.forEach(record => {
                    const columns = Object.keys(record).join(', ');
                    const values = Object.values(record).map(value => {
                        if (typeof value === 'string') {
                            return `'${value.replace(/'/g, "''")}'`;
                        } else if (value === null) {
                            return 'NULL';
                        } else if (typeof value === 'object') {
                            return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
                        }
                        return value;
                    }).join(', ');
                    
                    script += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`;
                });
                script += '\n';
            }
        });
        
        return script;
    }
}

// Global instance
window.GameDataManager = new GameDataManager();
