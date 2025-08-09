// Unified Header Component
// This component provides consistent header layout across all pages without credits display

function createUnifiedHeader() {
    return {
        // Generate header HTML for different page types
        renderGameHeader(pageTitle, currentLocation = null) {
            const locationText = currentLocation ? ` - <span x-text="${currentLocation}"></span>` : '';
            return `
                <header class="bg-gray-900 bg-opacity-80 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center space-x-4">
                            <h1 class="text-2xl font-bold">🚀 ${pageTitle}${locationText}</h1>
                        </div>
                        <div class="flex items-center space-x-6">
                            <button @click="logout()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm transition-colors">
                                Logout
                            </button>
                        </div>
                    </div>
                </header>
            `;
        },

        renderSubPageHeader(pageTitle, backUrl = 'game.html') {
            return `
                <header class="bg-gray-900 bg-opacity-80 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center space-x-4">
                            <button @click="goBack('${backUrl}')" class="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded-md text-sm transition-colors">
                                ← Back
                            </button>
                            <h1 class="text-2xl font-bold">${pageTitle}</h1>
                        </div>
                        <div class="flex items-center space-x-6">
                            <button @click="logout()" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm transition-colors">
                                Logout
                            </button>
                        </div>
                    </div>
                </header>
            `;
        },

        // Common navigation functions to include in page apps
        getNavigationFunctions() {
            return {
                goBack(url = 'game.html') {
                    window.location.href = url;
                },

                logout() {
                    localStorage.removeItem('currentPlayer');
                    window.location.href = 'index.html';
                }
            };
        }
    };
}

// Global function to initialize header in any page
function initializeUnifiedHeader(appInstance, headerType = 'game', pageTitle = '', options = {}) {
    if (!appInstance.unifiedHeader) {
        appInstance.unifiedHeader = createUnifiedHeader();
        
        // Add navigation functions to the app instance
        const navFunctions = appInstance.unifiedHeader.getNavigationFunctions();
        Object.assign(appInstance, navFunctions);
    }
    
    // Store header configuration for use in templates
    appInstance.headerConfig = {
        type: headerType,
        title: pageTitle,
        ...options
    };
}
