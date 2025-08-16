/**
 * Universal Game Footer Component
 * Provides navigation links to all pages in the Space Explorer game
 */

function createUniversalFooter() {
    const footer = document.createElement('div');
    footer.id = 'universal-game-footer';
    footer.className = 'fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-600 text-white z-50';
    footer.style.cssText = `
        background: rgba(17, 24, 39, 0.95);
        backdrop-filter: blur(10px);
        border-top: 1px solid #4B5563;
        padding: 8px 16px;
        font-size: 12px;
        max-height: 60px;
        overflow-y: auto;
    `;

    const pages = [
        { name: '🏠 Main Game', url: 'game.html', category: 'core' },
        { name: '🚀 Ship Management', url: 'ship-management.html', category: 'core' },
        { name: '🏪 Marketplace', url: 'marketplace.html', category: 'core' },
        { name: '🔄 Trade Center', url: 'trade-center.html', category: 'core' },
        { name: '🏗️ Shipyard', url: 'shipyard.html', category: 'core' },
        { name: '📦 Inventory', url: 'inventory.html', category: 'core' },
        { name: '👥 Specialists', url: 'specialists.html', category: 'core' },
        { name: '📋 Mission Log', url: 'mission-log.html', category: 'core' },
        { name: '🗺️ System Map', url: 'system-map.html', category: 'core' },
        { name: '🏭 Manufacturing', url: 'manufacturing-center.html', category: 'core' },
        { name: '⛏️ Mining Ops', url: 'mining-operations-complete.html', category: 'operations' },
        { name: '📡 Scanners', url: 'scanner-interface.html', category: 'operations' },
        { name: '🚀 Torpedo Launch', url: 'torpedo-launch.html', category: 'operations' },
        { name: '🌌 3D Navigation', url: 'space-navigation.html', category: 'operations' },
        { name: '🔧 Mining Interface', url: 'mining-interface.html', category: 'test' },
        { name: '🧪 Integration Test', url: 'integration-complete.html', category: 'test' },
        { name: '🔐 Login', url: 'index.html', category: 'auth' },
        { name: '👤 Player Auth', url: 'player-auth.html', category: 'auth' }
    ];

    // Group pages by category
    const categories = {
        core: { name: 'Core Game', color: 'text-blue-400' },
        operations: { name: 'Operations', color: 'text-green-400' },
        test: { name: 'Testing', color: 'text-yellow-400' },
        auth: { name: 'Auth', color: 'text-purple-400' }
    };

    let footerHTML = '<div class="flex flex-wrap items-center gap-1 text-xs">';
    
    // Add toggle button
    footerHTML += `
        <button onclick="toggleFooterExpansion()" class="mr-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 hover:text-white transition-colors">
            <span id="footer-toggle-icon">▲</span>
        </button>
    `;

    // Add current page indicator
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    footerHTML += `<span class="text-gray-400 mr-2">Current: <span class="text-white">${currentPage}</span></span>`;

    // Add page links grouped by category
    Object.entries(categories).forEach(([categoryKey, categoryInfo]) => {
        const categoryPages = pages.filter(page => page.category === categoryKey);
        if (categoryPages.length > 0) {
            footerHTML += `<span class="mr-1 ${categoryInfo.color} font-semibold">${categoryInfo.name}:</span>`;
            categoryPages.forEach((page, index) => {
                const isCurrentPage = currentPage === page.url;
                const linkClass = isCurrentPage 
                    ? 'text-yellow-300 font-semibold bg-gray-700 px-1 rounded' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700 px-1 rounded transition-colors';
                
                footerHTML += `<a href="${page.url}" class="${linkClass}">${page.name}</a>`;
                if (index < categoryPages.length - 1) footerHTML += ' ';
            });
            footerHTML += '<span class="text-gray-600 mx-2">|</span>';
        }
    });

    footerHTML += '</div>';
    footer.innerHTML = footerHTML;

    return footer;
}

function toggleFooterExpansion() {
    const footer = document.getElementById('universal-game-footer');
    const toggleIcon = document.getElementById('footer-toggle-icon');
    
    if (footer.style.maxHeight === '60px' || !footer.style.maxHeight) {
        footer.style.maxHeight = '120px';
        footer.style.overflowY = 'auto';
        toggleIcon.textContent = '▼';
    } else {
        footer.style.maxHeight = '60px';
        footer.style.overflowY = 'auto';
        toggleIcon.textContent = '▲';
    }
}

function addUniversalFooter() {
    // Remove existing footer if present
    const existingFooter = document.getElementById('universal-game-footer');
    if (existingFooter) {
        existingFooter.remove();
    }

    // Add footer to body
    const footer = createUniversalFooter();
    document.body.appendChild(footer);

    // Add bottom padding to body to prevent content overlap
    document.body.style.paddingBottom = '70px';

    console.log('✅ Universal footer added to page:', window.location.pathname);
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addUniversalFooter);
} else {
    addUniversalFooter();
}

// Export for manual initialization if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { addUniversalFooter, createUniversalFooter };
}
