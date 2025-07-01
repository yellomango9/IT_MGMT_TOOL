// Configuration settings for the application

// Get the server URL from the current page
function getServerUrl() {
    // Get the current URL's origin (protocol + hostname + port)
    const origin = window.location.origin;
    
    // If we're running from a file:// URL, use the hardcoded IP
    if (origin.startsWith('file://')) {
        return 'http://10.1.0.211:8000';
    }
    
    // Otherwise, use the same origin as the page
    return origin;
}

const CONFIG = {
    // API endpoint (change this to match your backend server)
    API_URL: getServerUrl(),
    
    // Local storage keys with namespace to avoid conflicts
    STORAGE_KEYS: {
        USER_ID: 'it_mgmt_user_id',
        USER_NAME: 'it_mgmt_user_name',
        USER_ROLE: 'it_mgmt_user_role',
        USER_EMAIL: 'it_mgmt_user_email'
    },
    
    // Default pagination settings
    PAGINATION: {
        ITEMS_PER_PAGE: 10,
        PAGE_SIZES: [5, 10, 25, 50]
    },
    
    // Toast notification duration (in milliseconds)
    TOAST_DURATION: 3000,
    
    // Request timeout (in milliseconds)
    REQUEST_TIMEOUT: 30000
};