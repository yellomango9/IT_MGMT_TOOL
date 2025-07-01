// UI Module for handling common UI operations

const UI = {
    // Initialize UI components
    init() {
        this.setupNavigation();
        this.setupModals();
        this.setupAuthForms();
    },
    
    // Set up navigation between pages
    setupNavigation() {
        const menuItems = document.querySelectorAll('.menu-item');
        const contentPages = document.querySelectorAll('.content-page');
        const pageTitle = document.getElementById('page-title');
        
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetPage = item.getAttribute('data-page');
                
                // Update active menu item
                menuItems.forEach(mi => mi.classList.remove('active'));
                item.classList.add('active');
                
                // Show target page
                contentPages.forEach(page => {
                    if (page.id === `${targetPage}-page`) {
                        page.classList.add('active');
                        pageTitle.textContent = targetPage.charAt(0).toUpperCase() + targetPage.slice(1);
                    } else {
                        page.classList.remove('active');
                    }
                });
            });
        });
    },
    
    // Set up modal dialogs
    setupModals() {
        const modals = document.querySelectorAll('.modal');
        const closeButtons = document.querySelectorAll('.close');
        
        // Close modal when clicking the close button
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                this.closeModal(modal);
            });
        });
        
        // Close modal when clicking outside the modal content
        modals.forEach(modal => {
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
    },
    
    // Set up authentication buttons
    setupAuthForms() {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        // Handle login button click - redirect to login page
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        }
        
        // Handle logout button click
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                Auth.logout();
            });
        }
    },
    
    // Open a modal dialog
    openModal(modal) {
        modal.style.display = 'block';
    },
    
    // Close a modal dialog
    closeModal(modal) {
        modal.style.display = 'none';
    },
    
    // Show a toast notification
    showToast(message, type = 'info') {
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
    },
    
    // Format a date string
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString();
    },
    
    // Create a simple confirmation dialog
    confirm(message) {
        return window.confirm(message);
    },
    
    // Load data into a select element
    populateSelect(selectElement, options, valueKey, textKey, selectedValue = null) {
        // Clear existing options
        selectElement.innerHTML = '';
        
        // Add empty option if needed
        if (selectElement.hasAttribute('data-empty-option')) {
            const emptyText = selectElement.getAttribute('data-empty-option') || 'Select...';
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = emptyText;
            selectElement.appendChild(emptyOption);
        }
        
        // Add options from data
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option[valueKey];
            optionElement.textContent = option[textKey];
            
            if (selectedValue !== null && option[valueKey] == selectedValue) {
                optionElement.selected = true;
            }
            
            selectElement.appendChild(optionElement);
        });
    }
};