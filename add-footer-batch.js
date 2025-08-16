/**
 * Batch Footer Addition Script
 * Adds universal footer to all HTML files in the project
 */

// List of all HTML files that need the footer
const htmlFiles = [
    'marketplace.html',
    'trade-center.html',
    'shipyard.html',
    'inventory.html',
    'specialists.html',
    'mission-log.html',
    'system-map.html',
    'scanner-interface.html',
    'torpedo-launch.html',
    'space-navigation.html',
    'mining-interface.html',
    'integration-complete.html',
    'player-auth.html',
    'specialist-system-test.html',
    'torpedo-config.html',
    'shipyard_new.html',
    'shipyard_old.html',
    'update_credits.html'
];

// Function to add footer script tag to HTML content
function addFooterScript(htmlContent) {
    // Check if footer script is already included
    if (htmlContent.includes('universal-footer.js')) {
        console.log('Footer script already present');
        return htmlContent;
    }

    // Find the head section and add the script
    const headCloseIndex = htmlContent.indexOf('</head>');
    if (headCloseIndex !== -1) {
        const beforeHead = htmlContent.substring(0, headCloseIndex);
        const afterHead = htmlContent.substring(headCloseIndex);
        
        // Add the script tag before closing head
        return beforeHead + '    <script src="universal-footer.js"></script>\n' + afterHead;
    }

    // Fallback: add before closing body tag
    const bodyCloseIndex = htmlContent.lastIndexOf('</body>');
    if (bodyCloseIndex !== -1) {
        const beforeBody = htmlContent.substring(0, bodyCloseIndex);
        const afterBody = htmlContent.substring(bodyCloseIndex);
        
        return beforeBody + '    <script src="universal-footer.js"></script>\n' + afterBody;
    }

    return htmlContent;
}

// Instructions for manual addition
console.log('🚀 Universal Footer Implementation Guide');
console.log('=====================================');
console.log('');
console.log('✅ Footer script created: universal-footer.js');
console.log('✅ Already added to:');
console.log('   - game.html');
console.log('   - ship-management.html');
console.log('   - index.html');
console.log('   - mining-operations-complete.html');
console.log('');
console.log('📋 To add footer to remaining files, add this line to the <head> section:');
console.log('   <script src="universal-footer.js"></script>');
console.log('');
console.log('🎯 Remaining files to update:');
htmlFiles.forEach(file => console.log(`   - ${file}`));
console.log('');
console.log('🎨 Footer Features:');
console.log('   - Collapsible/expandable design');
console.log('   - Current page highlighting');
console.log('   - Organized by categories (Core, Operations, Testing, Auth)');
console.log('   - Fixed bottom position with backdrop blur');
console.log('   - Auto-padding adjustment for body content');
console.log('');
console.log('🔧 Footer automatically initializes when DOM loads');
console.log('💡 Toggle expansion with the arrow button in footer');

module.exports = { addFooterScript, htmlFiles };
