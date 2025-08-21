// Minimal Marketplace for onboarding
class Marketplace {
    getAppraisalValue(type) {
        const values = { 'iron_ore': 15, 'iron_ingot': 50 };
        return values[type] || 10;
    }
    getSellValue(type) {
        const values = { 'iron_ingot': 50 };
        return values[type] || 10;
    }
}
if (typeof window !== 'undefined') {
    window.marketplace = new Marketplace();
}
