// Minimal Refinery System for onboarding
class RefinerySystem {
    constructor() {
        this.refinedInventory = new Map();
    }
    addRefinedMaterial(playerId, material) {
        if (!this.refinedInventory.has(playerId)) {
            this.refinedInventory.set(playerId, []);
        }
        const inventory = this.refinedInventory.get(playerId);
        inventory.push(material);
    }
    getPlayerInventory(playerId) {
        return this.refinedInventory.get(playerId) || [];
    }
}
if (typeof window !== 'undefined') {
    window.refinerySystem = new RefinerySystem();
}
