// Login Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the login page
    initLoginPage();
    
    // Check if user is already logged in
    checkLoginStatus();
});

// Initialize login page components
function initLoginPage() {
    setupAuthTabs();
    setupLoginForm();
    setupRegisterForm();
    loadDepartments();
}

// Set up authentication tabs
function setupAuthTabs() {
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetForm = tab.getAttribute('data-tab');
            
            // Update active tab
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show target form
            authForms.forEach(form => {
                if (form.id === `${targetForm}Form`) {
                    form.classList.add('active');
                } else {
                    form.classList.remove('active');
                }
            });
        });
    });
}

// Set up login form submission
function setupLoginForm() {
    const loginForm = document.getElementById('loginFormElement');
    
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Disable form during submission
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            // Direct fetch to match backend API structure
            const response = await fetch(`${CONFIG.API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            console.log('Login response:', data);
            
            if (response.ok) {
                // The backend returns user data in a nested "user" object
                const userData = data.user;
                
                if (userData) {
                    // Store user information in local storage
                    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_ID, userData.id);
                    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_NAME, userData.name);
                    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_EMAIL, userData.email);
                    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_ROLE, userData.role);
                    
                    console.log('User role stored:', userData.role);
                    
                    showToast('Login successful! Redirecting...', 'success');
                    
                    // Redirect to dashboard
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    showToast('Invalid response from server', 'error');
                    submitButton.disabled = false;
                    submitButton.textContent = 'Login';
                }
            } else {
                showToast(data.error || 'Login failed', 'error');
                
                // Re-enable form
                submitButton.disabled = false;
                submitButton.textContent = 'Login';
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('Login failed. Please try again.', 'error');
            
            // Re-enable form
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
        }
    });
}

// Set up register form submission
function setupRegisterForm() {
    const registerForm = document.getElementById('registerFormElement');
    
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Disable form during submission
        const submitButton = registerForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Registering...';
        
        const userData = {
            full_name: document.getElementById('registerName').value,
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value,
            role: document.getElementById('registerRole').value,
            department_id: document.getElementById('registerDepartment').value
        };
        
        try {
            const result = await ApiService.auth.register(userData);
            
            if (result.ok) {
                showToast('Registration successful! You can now log in.', 'success');
                
                // Reset form
                registerForm.reset();
                
                // Switch to login tab
                document.querySelector('.auth-tab[data-tab="login"]').click();
            } else {
                showToast(result.data.error || 'Registration failed', 'error');
                
                // Re-enable form
                submitButton.disabled = false;
                submitButton.textContent = 'Register';
            }
        } catch (error) {
            console.error('Registration error:', error);
            showToast('Registration failed. Please try again.', 'error');
            
            // Re-enable form
            submitButton.disabled = false;
            submitButton.textContent = 'Register';
        }
    });
}

// Load departments for the register form
async function loadDepartments() {
    try {
        // In a real application, you would fetch departments from the API
        // For now, we'll use placeholder data
        const departments = [
            { department_id: 1, name: 'IT' },
            { department_id: 2, name: 'HR' },
            { department_id: 3, name: 'Finance' },
            { department_id: 4, name: 'Marketing' },
            { department_id: 5, name: 'Operations' }
        ];
        
        const departmentSelect = document.getElementById('registerDepartment');
        departmentSelect.innerHTML = '';
        
        departments.forEach(department => {
            const option = document.createElement('option');
            option.value = department.department_id;
            option.textContent = department.name;
            departmentSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading departments:', error);
    }
}

// Check if user is already logged in
function checkLoginStatus() {
    const userId = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_ID);
    
    if (userId) {
        // User is already logged in, redirect to dashboard
        window.location.href = 'index.html';
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    
    // Set message and type
    toast.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type);
    toast.classList.add('show');
    
    // Auto-hide after duration
    setTimeout(() => {
        toast.classList.remove('show');
    }, CONFIG.TOAST_DURATION);
}