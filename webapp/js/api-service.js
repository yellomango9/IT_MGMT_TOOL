// API Service Module
// Handles all API requests with consistent error handling and response formatting

const ApiService = {
    /**
     * Make a fetch request with standardized error handling
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} - Response data
     */
    async fetch(endpoint, options = {}) {
        try {
            // Add default headers
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };
            
            // Add auth headers if user is logged in
            if (Auth && Auth.isLoggedIn()) {
                headers['X-User-ID'] = Auth.currentUser.id;
                headers['X-User-Role'] = Auth.currentUser.role;
            }
            
            // Prepare URL
            const url = endpoint.startsWith('http') 
                ? endpoint 
                : `${CONFIG.API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
            
            console.log(`API Request: ${options.method || 'GET'} ${url}`);
            
            // Set up request timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT || 30000);
            
            // Make the request
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal
            });
            
            // Clear timeout
            clearTimeout(timeoutId);
            
            // Handle 401 Unauthorized (redirect to login)
            if (response.status === 401) {
                // Clear auth data
                if (Auth) Auth.logout(false); // Logout without redirect
                
                // Show error message
                if (UI) UI.showToast('Session expired. Please log in again.', 'error');
                
                // Redirect to login page
                window.location.href = 'login.html';
                return null;
            }
            
            // Parse response
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }
            
            console.log(`API Response (${response.status}):`, data);
            
            // Return standardized response
            return {
                ok: response.ok,
                status: response.status,
                data,
                response
            };
        } catch (error) {
            // Handle abort error (timeout)
            if (error.name === 'AbortError') {
                console.error('API request timed out');
                if (UI) UI.showToast('Request timed out. Please try again.', 'error');
                return {
                    ok: false,
                    status: 0,
                    data: { error: 'Request timed out' },
                    timeout: true
                };
            }
            
            // Handle network errors
            console.error('API request failed:', error);
            if (UI) UI.showToast('Network error. Please check your connection.', 'error');
            
            return {
                ok: false,
                status: 0,
                data: { error: error.message },
                networkError: true
            };
        }
    },
    
    /**
     * Make a GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Response data
     */
    async get(endpoint, params = {}) {
        // Build query string
        const queryString = Object.keys(params)
            .filter(key => params[key] !== null && params[key] !== undefined && params[key] !== '')
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
        
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.fetch(url, { method: 'GET' });
    },
    
    /**
     * Make a POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @returns {Promise<Object>} - Response data
     */
    async post(endpoint, data = {}) {
        return this.fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    /**
     * Make a PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @returns {Promise<Object>} - Response data
     */
    async put(endpoint, data = {}) {
        return this.fetch(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    /**
     * Make a DELETE request
     * @param {string} endpoint - API endpoint
     * @returns {Promise<Object>} - Response data
     */
    async delete(endpoint) {
        return this.fetch(endpoint, { method: 'DELETE' });
    },
    
    // API endpoints
    auth: {
        /**
         * Login user
         * @param {Object} credentials - User credentials
         * @returns {Promise<Object>} - Response data
         */
        async login(credentials) {
            return ApiService.post('/login', credentials);
        },
        
        /**
         * Register new user
         * @param {Object} userData - User data
         * @returns {Promise<Object>} - Response data
         */
        async register(userData) {
            return ApiService.post('/register', userData);
        }
    },
    
    systems: {
        /**
         * Get all systems with optional filters
         * @param {Object} filters - Filter parameters
         * @returns {Promise<Object>} - Response data
         */
        async getAll(filters = {}) {
            return ApiService.get('/systems', filters);
        },
        
        /**
         * Get system by ID
         * @param {number} id - System ID
         * @returns {Promise<Object>} - Response data
         */
        async getById(id) {
            return ApiService.get(`/system/${id}`);
        },
        
        /**
         * Create new system
         * @param {Object} systemData - System data
         * @returns {Promise<Object>} - Response data
         */
        async create(systemData) {
            return ApiService.post('/add-system', systemData);
        },
        
        /**
         * Update system
         * @param {number} id - System ID
         * @param {Object} systemData - System data
         * @returns {Promise<Object>} - Response data
         */
        async update(id, systemData) {
            return ApiService.put(`/system/${id}`, systemData);
        },
        
        /**
         * Delete system
         * @param {number} id - System ID
         * @returns {Promise<Object>} - Response data
         */
        async delete(id) {
            return ApiService.delete(`/system/${id}`);
        }
    },
    
    peripherals: {
        /**
         * Get all peripherals
         * @returns {Promise<Object>} - Response data
         */
        async getAll() {
            return ApiService.get('/peripherals');
        },
        
        /**
         * Create new peripheral
         * @param {Object} peripheralData - Peripheral data
         * @returns {Promise<Object>} - Response data
         */
        async create(peripheralData) {
            return ApiService.post('/add-peripheral', peripheralData);
        },
        
        /**
         * Update peripheral
         * @param {number} id - Peripheral ID
         * @param {Object} peripheralData - Peripheral data
         * @returns {Promise<Object>} - Response data
         */
        async update(id, peripheralData) {
            return ApiService.put(`/peripheral/${id}`, peripheralData);
        },
        
        /**
         * Delete peripheral
         * @param {number} id - Peripheral ID
         * @returns {Promise<Object>} - Response data
         */
        async delete(id) {
            return ApiService.delete(`/peripheral/${id}`);
        }
    },
    
    complaints: {
        /**
         * Get all complaints with optional filters
         * @param {Object} filters - Filter parameters
         * @returns {Promise<Object>} - Response data
         */
        async getAll(filters = {}) {
            return ApiService.get('/complaints', filters);
        },
        
        /**
         * Create new complaint
         * @param {Object} complaintData - Complaint data
         * @returns {Promise<Object>} - Response data
         */
        async create(complaintData) {
            return ApiService.post('/add-complaint', complaintData);
        },
        
        /**
         * Update complaint
         * @param {number} id - Complaint ID
         * @param {Object} complaintData - Complaint data
         * @returns {Promise<Object>} - Response data
         */
        async update(id, complaintData) {
            return ApiService.put(`/complaint/${id}`, complaintData);
        }
    },
    
    logs: {
        /**
         * Get all logs with optional filters
         * @param {Object} filters - Filter parameters
         * @returns {Promise<Object>} - Response data
         */
        async getAll(filters = {}) {
            return ApiService.get('/logs', filters);
        }
    },
    
    reports: {
        /**
         * Export systems report
         * @param {Object} filters - Filter parameters
         * @returns {string} - Report URL
         */
        getSystemsReportUrl(filters = {}) {
            // Build query string
            const queryString = Object.keys(filters)
                .filter(key => filters[key] !== null && filters[key] !== undefined && filters[key] !== '')
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`)
                .join('&');
            
            return `${CONFIG.API_URL}/export-systems${queryString ? '?' + queryString : ''}`;
        },
        
        /**
         * Export complaints report
         * @param {Object} filters - Filter parameters
         * @returns {string} - Report URL
         */
        getComplaintsReportUrl(filters = {}) {
            // Build query string
            const queryString = Object.keys(filters)
                .filter(key => filters[key] !== null && filters[key] !== undefined && filters[key] !== '')
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`)
                .join('&');
            
            return `${CONFIG.API_URL}/export-complaints${queryString ? '?' + queryString : ''}`;
        },
        
        /**
         * Export peripherals report
         * @returns {string} - Report URL
         */
        getPeripheralsReportUrl() {
            return `${CONFIG.API_URL}/export/peripherals`;
        },
        
        /**
         * Export logs report
         * @returns {string} - Report URL
         */
        getLogsReportUrl() {
            return `${CONFIG.API_URL}/export-logs`;
        }
    }
};