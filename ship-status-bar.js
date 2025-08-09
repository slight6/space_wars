// Unified Ship Status Bar Component
// This component displays consistent ship information across all pages using only player data

function createUnifiedStatusBar() {
    return {
        // Status bar data - pulls from player object only
        getShipName() {
            if (!this.player) return 'No Ship Assigned';
            
            // Use starter ship custom name if available
            if (this.player.starterShip && this.player.starterShip.customName) {
                return this.player.starterShip.customName;
            }
            
            // Fallback to currentShip property
            return this.player.currentShip || 'No Ship Assigned';
        },

        getShipClass() {
            if (!this.player) return '';
            
            // Use starter ship type if available
            if (this.player.starterShip && this.player.starterShip.shipType) {
                return this.player.starterShip.shipType;
            }
            
            // Default for starter ships
            return 'Starling Explorer';
        },

        getPilotInfo() {
            if (!this.player) return '';
            return `Pilot: ${this.player.username}`;
        },

        getCurrentLocation() {
            if (!this.player) return 'Main Deck';
            return this.player.currentLocation || 'Main Deck';
        },

        getCurrentShipLabel() {
            if (!this.player) return 'Current Ship: No Ship Assigned';
            
            // Use starter ship custom name if available
            if (this.player.starterShip && this.player.starterShip.customName) {
                return `Current Ship: ${this.player.starterShip.customName}`;
            }
            
            // Fallback to currentShip property
            const shipName = this.player.currentShip || 'No Ship Assigned';
            return `Current Ship: ${shipName}`;
        },

        getHullIntegrity() {
            return this.player?.hullIntegrity || 100;
        },

        getShieldStrength() {
            return this.player?.shieldStrength || 100;
        },

        getFuelLevel() {
            return this.player?.fuel || 67;
        },

        getPowerLevel() {
            return this.player?.powerLevel || 89;
        },

        getCredits() {
            return this.player?.credits || 0;
        },

        getSystemStatus() {
            // Simple status based on ship systems
            const hull = this.getHullIntegrity();
            const shields = this.getShieldStrength();
            const fuel = this.getFuelLevel();
            const power = this.getPowerLevel();
            
            if (hull < 25 || shields < 25 || fuel < 10 || power < 20) {
                return { status: 'Critical Systems', color: 'text-red-400' };
            } else if (hull < 50 || shields < 50 || fuel < 25 || power < 40) {
                return { status: 'Systems Warning', color: 'text-yellow-400' };
            } else {
                return { status: 'All Systems Nominal', color: 'text-green-400' };
            }
        },

        // Component template - returns HTML string for the unified status bar
        renderStatusBar() {
            const systemStatus = this.getSystemStatus();
            
            return `
                <div class="bg-gray-800 bg-opacity-90 backdrop-blur-sm border-b border-gray-600 px-6 py-3">
                    <div class="container mx-auto">
                        <div class="flex items-center justify-between">
                            <!-- Left Side: Ship and Pilot Information -->
                            <div class="flex items-center space-x-6">
                                <!-- Ship Icon and Name -->
                                <div class="flex items-center space-x-3">
                                    <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                        <span class="text-white text-sm font-bold">🚀</span>
                                    </div>
                                    <div>
                                        <div class="text-white font-semibold text-sm" x-text="statusBar.getPilotInfo()"></div>
                                        <div class="text-blue-400 font-medium text-sm" x-text="statusBar.getCurrentShipLabel()"></div>
                                        <div class="text-gray-400 text-xs" x-text="'Location: ' + statusBar.getCurrentLocation()"></div>
                                    </div>
                                </div>
                                
                                <!-- Ship Status Indicators -->
                                <div class="hidden md:flex items-center space-x-4 text-sm">
                                    <div class="flex items-center space-x-1">
                                        <span class="text-gray-400">Hull:</span>
                                        <span class="text-cyan-400 font-semibold" x-text="statusBar.getHullIntegrity() + '%'"></span>
                                    </div>
                                    <div class="flex items-center space-x-1">
                                        <span class="text-gray-400">Shields:</span>
                                        <span class="text-purple-400 font-semibold" x-text="statusBar.getShieldStrength() + '%'"></span>
                                    </div>
                                    <div class="flex items-center space-x-1">
                                        <span class="text-gray-400">Fuel:</span>
                                        <span class="text-orange-400 font-semibold" x-text="statusBar.getFuelLevel() + '%'"></span>
                                    </div>
                                    <div class="flex items-center space-x-1">
                                        <span class="text-gray-400">Power:</span>
                                        <span class="text-red-400 font-semibold" x-text="statusBar.getPowerLevel() + '%'"></span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Right Side: Status and Credits -->
                            <div class="text-right">
                                <div class="text-sm font-semibold" :class="statusBar.getSystemStatus().color" x-text="statusBar.getSystemStatus().status"></div>
                                <div class="text-yellow-400 font-mono text-sm" x-text="'Credits: ' + statusBar.getCredits().toLocaleString()"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    };
}

// Global function to initialize status bar in any page
function initializeStatusBar(appInstance) {
    if (!appInstance.statusBar) {
        appInstance.statusBar = createUnifiedStatusBar();
        // Bind the player data to the status bar
        appInstance.statusBar.player = appInstance.player;
    }
}
