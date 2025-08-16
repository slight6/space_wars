// ========================================
// DATA LOADER UTILITY
// Centralizes all JSON data loading for the game
// ========================================

class DataLoader {
    constructor() {
        this.cache = new Map();
        this.basePath = './data/';
    }

    // Load and cache JSON data
    async loadData(filename) {
        if (this.cache.has(filename)) {
            return this.cache.get(filename);
        }

        try {
            const response = await fetch(`${this.basePath}${filename}`);
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}: ${response.status}`);
            }
            
            const data = await response.json();
            this.cache.set(filename, data);
            console.log(`📁 Loaded data: ${filename}`);
            return data;
        } catch (error) {
            console.error(`❌ Error loading ${filename}:`, error);
            throw error;
        }
    }

    // Clear cache (useful for development/debugging)
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Data cache cleared');
    }

    // Reload specific data file
    async reloadData(filename) {
        this.cache.delete(filename);
        return await this.loadData(filename);
    }

    // Get cached data without loading
    getCached(filename) {
        return this.cache.get(filename);
    }

    // Check if data is cached
    isCached(filename) {
        return this.cache.has(filename);
    }

    // Preload multiple data files
    async preloadData(filenames) {
        const promises = filenames.map(filename => this.loadData(filename));
        try {
            const results = await Promise.all(promises);
            console.log(`📦 Preloaded ${filenames.length} data files`);
            return results;
        } catch (error) {
            console.error('❌ Error during preload:', error);
            throw error;
        }
    }

    // Load all game data files
    async loadAllGameData() {
        const dataFiles = [
            'keldar-system.json',
            'specialists-system.json', 
            'ships.json',
            'torpedo-system-config.json'
        ];

        return await this.preloadData(dataFiles);
    }
}

// Create global instance
window.DataLoader = new DataLoader();

// Auto-preload on script load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.DataLoader.loadAllGameData();
        console.log('🚀 All game data loaded successfully');
    } catch (error) {
        console.error('🔥 Failed to load game data:', error);
    }
});
