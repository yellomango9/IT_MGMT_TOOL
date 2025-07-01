// Authentication Module

const Auth = {
    // Current user information
    currentUser: {
        id: null,
        name: null,
        email: null,
        role: null
    },
    
    // Initialize authentication state from local storage
    init() {
        this.currentUser.id = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_ID);
        this.currentUser.name = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_NAME);
        this.currentUser.email = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_EMAIL);
        this.currentUser.role = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_ROLE);
        
        console.log('Auth initialized with role:', this.currentUser.role);
        
        // Redirect to login page if not logged in
        if (!this.currentUser.id) {
            window.location.href = 'login.html';
            return;
        }
        
        this.updateUI();
    },
    
    // Register a new user
    async register(userData) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                UI.showToast('Registration successful! You can now log in.', 'success');
                return true;
            } else {
                UI.showToast(data.error || 'Registration failed', 'error');
                return false;
            }
        } catch (error) {
            console.error('Registration error:', error);
            UI.showToast('Registration failed. Please try again.', 'error');
            return false;
        }
    },
    
    // Log in a user
    async login(credentials) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store user information
                this.currentUser.id = data.user_id;
                this.currentUser.name = data.full_name;
                this.currentUser.email = data.email;
                this.currentUser.role = data.role;
                
                // Save to local storage
                localStorage.setItem(CONFIG.STORAGE_KEYS.USER_ID, data.user_id);
                localStorage.setItem(CONFIG.STORAGE_KEYS.USER_NAME, data.full_name);
                localStorage.setItem(CONFIG.STORAGE_KEYS.USER_EMAIL, data.email);
                localStorage.setItem(CONFIG.STORAGE_KEYS.USER_ROLE, data.role);
                
                this.updateUI();
                UI.showToast('Login successful!', 'success');
                return true;
            } else {
                UI.showToast(data.error || 'Login failed', 'error');
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            UI.showToast('Login failed. Please try again.', 'error');
            return false;
        }
    },
    
    // Log out the current user
    logout(redirect = true) {
        // Clear user information
        this.currentUser.id = null;
        this.currentUser.name = null;
        this.currentUser.email = null;
        this.currentUser.role = null;
        
        // Clear local storage
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_ID);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_NAME);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_EMAIL);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_ROLE);
        
        if (redirect) {
            UI.showToast('You have been logged out.', 'success');
            
            // Redirect to login page
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    },
    
    // Check if a user is logged in
    isLoggedIn() {
        return this.currentUser.id !== null;
    },
    
    // Check if the current user has a specific role
    hasRole(role) {
        return this.currentUser.role === role;
    },
    
    // Update UI based on authentication state
    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const currentUserSpan = document.getElementById('currentUser');
        const userNameSpan = document.querySelector('.user-name');
        const userRoleSpan = document.querySelector('.user-role');
        
        if (this.isLoggedIn()) {
            loginBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            currentUserSpan.textContent = this.currentUser.name;
            userNameSpan.textContent = this.currentUser.name;
            userRoleSpan.textContent = this.currentUser.role;
            
            // Show/hide elements based on user role
            document.querySelectorAll('[data-role]').forEach(element => {
                const requiredRole = element.getAttribute('data-role');
                if (requiredRole && this.currentUser.role !== requiredRole) {
                    element.classList.add('hidden');
                } else {
                    element.classList.remove('hidden');
                }
            });
        } else {
            loginBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
            currentUserSpan.textContent = '';
            userNameSpan.textContent = 'Not logged in';
            userRoleSpan.textContent = '';
            
            // Hide role-specific elements
            document.querySelectorAll('[data-role]').forEach(element => {
                element.classList.add('hidden');
            });
        }
    },
    
    // Get auth headers for API requests
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        if (this.isLoggedIn()) {
            headers['X-User-ID'] = this.currentUser.id;
            headers['X-User-Role'] = this.currentUser.role;
            
            console.log('Using auth headers:', headers);
        }
        
        return headers;
    }
};