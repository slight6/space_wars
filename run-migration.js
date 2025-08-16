// Migration Runner Script
// Easy way to execute the location migration

const LocationMigration = require('./location-migration.js');

async function runMigration() {
    console.log('🚀 Space Explorer Location Migration Tool');
    console.log('==========================================');
    console.log('');
    console.log('This will move all current testing data from (0,0,0) to (621,621,621)');
    console.log('A backup will be created automatically before migration.');
    console.log('');
    
    // Confirm migration
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Do you want to proceed with the migration? (yes/no): ', async (answer) => {
            rl.close();
            
            if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
                console.log('');
                console.log('🔄 Starting migration...');
                
                const migration = new LocationMigration();
                const results = await migration.performFullMigration();
                
                if (results.success !== false) {
                    console.log('');
                    console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
                    console.log('');
                    console.log('📊 Summary:');
                    console.log(`   • Players migrated: ${results.results.players.players_migrated || 0}`);
                    console.log(`   • Ships migrated: ${results.results.ships.ships_migrated || 0}`);
                    console.log(`   • Space navigation updated: ${results.results.space_navigation.updated ? 'Yes' : 'No'}`);
                    console.log('');
                    console.log('🎯 Next Steps:');
                    console.log('   1. Test the 3D navigation at the new location (621,621,621)');
                    console.log('   2. Verify all player data is correctly positioned');
                    console.log('   3. Enable testing mode for new players with:');
                    console.log('      playerManager.enableTestingMode()');
                    console.log('');
                    console.log('💡 The origin (0,0,0) is now clear for public release!');
                } else {
                    console.log('');
                    console.log('❌ MIGRATION FAILED!');
                    console.log(`Error: ${results.error}`);
                    console.log('');
                    console.log('🔄 If needed, you can rollback using the backup created.');
                }
            } else {
                console.log('');
                console.log('❌ Migration cancelled by user.');
            }
            
            resolve();
        });
    });
}

// Run if called directly
if (require.main === module) {
    runMigration().then(() => {
        process.exit(0);
    }).catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { runMigration };
