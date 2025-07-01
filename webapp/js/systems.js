// Systems Module

const Systems = {
    // Initialize systems module
    init() {
        this.setupEventListeners();
        this.loadSystems();
        this.loadFilters();
    },
    
    // Set up event listeners
    setupEventListeners() {
        const addSystemBtn = document.getElementById('addSystemBtn');
        const systemForm = document.getElementById('systemForm');
        const departmentFilter = document.getElementById('departmentFilter');
        const networkFilter = document.getElementById('networkFilter');
        
        // Add system button
        addSystemBtn.addEventListener('click', () => {
            this.showAddSystemModal();
        });
        
        // System form submission
        systemForm.addEventListener('submit', (event) => {
            event.preventDefault();
            this.saveSystem();
        });
        
        // Filters
        departmentFilter.addEventListener('change', () => {
            this.loadSystems();
        });
        
        networkFilter.addEventListener('change', () => {
            this.loadSystems();
        });
    },
    
    // Load systems from API
    async loadSystems() {
        if (!Auth.isLoggedIn()) {
            return;
        }
        
        try {
            // Get filter values
            const departmentFilter = document.getElementById('departmentFilter').value;
            const networkFilter = document.getElementById('networkFilter').value;
            
            // Build query string
            let queryString = '';
            if (departmentFilter) {
                queryString += `department=${departmentFilter}`;
            }
            
            if (networkFilter) {
                if (queryString) queryString += '&';
                queryString += `network=${networkFilter}`;
            }
            
            // Fetch systems
            const url = `${CONFIG.API_URL}/systems${queryString ? '?' + queryString : ''}`;
            const response = await fetch(url, {
                headers: Auth.getHeaders()
            });
            
            if (response.ok) {
                const data = await response.json();
                this.renderSystems(data.systems);
            } else {
                const error = await response.json();
                UI.showToast(error.error || 'Failed to load systems', 'error');
            }
        } catch (error) {
            console.error('Error loading systems:', error);
            UI.showToast('Failed to load systems', 'error');
        }
    },
    
    // Load filter options
    async loadFilters() {
        try {
            // Load departments (placeholder - in a real app, you'd fetch this from an API)
            const departments = [
                { department_id: 1, name: 'IT' },
                { department_id: 2, name: 'HR' },
                { department_id: 3, name: 'Finance' },
                { department_id: 4, name: 'Marketing' },
                { department_id: 5, name: 'Operations' }
            ];
            
            // Load networks (placeholder - in a real app, you'd fetch this from an API)
            const networks = [
                { network_id: 1, name: 'Main Office' },
                { network_id: 2, name: 'Development' },
                { network_id: 3, name: 'Guest' }
            ];
            
            // Populate department filter
            const departmentFilter = document.getElementById('departmentFilter');
            UI.populateSelect(departmentFilter, departments, 'name', 'name');
            
            // Populate network filter
            const networkFilter = document.getElementById('networkFilter');
            UI.populateSelect(networkFilter, networks, 'name', 'name');
            
            // Populate department select in system form
            const departmentSelect = document.getElementById('departmentSelect');
            if (departmentSelect) {
                UI.populateSelect(departmentSelect, departments, 'department_id', 'name');
            }
            
            // Populate network select in system form
            const networkSelect = document.getElementById('networkId');
            UI.populateSelect(networkSelect, networks, 'network_id', 'name');
            
            // No need to populate user fields - they will be entered manually
        } catch (error) {
            console.error('Error loading filters:', error);
        }
    },
    
    // Render systems table
    renderSystems(systems) {
        const tableBody = document.querySelector('#systemsTable tbody');
        tableBody.innerHTML = '';
        
        if (systems.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 6;
            cell.textContent = 'No systems found';
            cell.style.textAlign = 'center';
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }
        
        systems.forEach(system => {
            const row = document.createElement('tr');
            
            // Hostname
            const hostnameCell = document.createElement('td');
            hostnameCell.textContent = system.hostname;
            row.appendChild(hostnameCell);
            
            // OS
            const osCell = document.createElement('td');
            osCell.textContent = `${system.os_name} ${system.os_version || ''}`;
            row.appendChild(osCell);
            
            // IP Address
            const ipCell = document.createElement('td');
            ipCell.textContent = system.ip_address;
            row.appendChild(ipCell);
            
            // User
            const userCell = document.createElement('td');
            userCell.textContent = system.user_name || 'Unassigned';
            row.appendChild(userCell);
            
            // Department
            const deptCell = document.createElement('td');
            deptCell.textContent = system.department_name || 'Unassigned';
            row.appendChild(deptCell);
            
            // Actions
            const actionsCell = document.createElement('td');
            actionsCell.className = 'action-buttons';
            
            // Edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'btn-secondary';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => {
                this.showEditSystemModal(system);
            });
            actionsCell.appendChild(editBtn);
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-danger';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => {
                this.deleteSystem(system.system_id);
            });
            actionsCell.appendChild(deleteBtn);
            
            row.appendChild(actionsCell);
            tableBody.appendChild(row);
        });
    },
    
    // Show add system modal
    showAddSystemModal() {
        const modal = document.getElementById('systemModal');
        const form = document.getElementById('systemForm');
        const title = document.getElementById('systemModalTitle');
        
        // Set modal title
        title.textContent = 'Add System';
        
        // Reset form
        form.reset();
        document.getElementById('systemId').value = '';
        
        // Show modal
        UI.openModal(modal);
    },
    
    // Show edit system modal
    showEditSystemModal(system) {
        const modal = document.getElementById('systemModal');
        const form = document.getElementById('systemForm');
        const title = document.getElementById('systemModalTitle');
        
        // Set modal title
        title.textContent = 'Edit System';
        
        // Fill form with system data
        document.getElementById('systemId').value = system.system_id;
        document.getElementById('hostname').value = system.hostname;
        document.getElementById('osName').value = system.os_name;
        document.getElementById('osVersion').value = system.os_version || '';
        document.getElementById('ramSize').value = system.ram_size_gb;
        document.getElementById('cpuModel').value = system.cpu_model || '';
        document.getElementById('storageSize').value = system.storage_size_gb || '';
        document.getElementById('ipAddress').value = system.ip_address;
        document.getElementById('macAddress').value = system.mac_address;
        document.getElementById('antivirusStatus').value = system.antivirus_status;
        
        // Set user fields
        if (system.user_id) {
            document.getElementById('userId').value = system.user_id;
            document.getElementById('userName').value = system.user_name || '';
            document.getElementById('userEmail').value = system.user_email || '';
        } else {
            document.getElementById('userId').value = '';
            document.getElementById('userName').value = '';
            document.getElementById('userEmail').value = '';
        }
        
        // Set network value
        if (system.network_id) {
            document.getElementById('networkId').value = system.network_id;
        }
        
        // Show modal
        UI.openModal(modal);
    },
    
    // Save system (create or update)
    async saveSystem() {
        try {
            // Disable form during submission
            const submitButton = document.querySelector('#systemForm button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Saving...';
            
            const systemId = document.getElementById('systemId').value;
            
            // Get user information
            const userName = document.getElementById('userName').value;
            const userEmail = document.getElementById('userEmail').value;
            const userId = document.getElementById('userId').value;
            
            // Prepare system data
            const systemData = {
                hostname: document.getElementById('hostname').value,
                os_name: document.getElementById('osName').value,
                os_version: document.getElementById('osVersion').value,
                ram_size_gb: parseFloat(document.getElementById('ramSize').value),
                cpu_model: document.getElementById('cpuModel').value,
                storage_size_gb: document.getElementById('storageSize').value ? parseFloat(document.getElementById('storageSize').value) : null,
                ip_address: document.getElementById('ipAddress').value,
                mac_address: document.getElementById('macAddress').value,
                antivirus_status: document.getElementById('antivirusStatus').value,
                network_id: document.getElementById('networkId').value
            };
            
            // Add user information if provided
            if (userId) {
                systemData.user_id = userId;
            } else if (userName && userEmail) {
                systemData.user_name = userName;
                systemData.user_email = userEmail;
            }
            
            console.log('Saving system with data:', systemData);
            
            let response;
            
            if (systemId) {
                // Update existing system
                response = await fetch(`${CONFIG.API_URL}/system/${systemId}`, {
                    method: 'PUT',
                    headers: Auth.getHeaders(),
                    body: JSON.stringify(systemData)
                });
            } else {
                // Create new system
                response = await fetch(`${CONFIG.API_URL}/add-system`, {
                    method: 'POST',
                    headers: Auth.getHeaders(),
                    body: JSON.stringify(systemData)
                });
            }
            
            const responseText = await response.text();
            console.log('Response status:', response.status);
            console.log('Response text:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Error parsing JSON response:', e);
                data = { error: 'Invalid response from server' };
            }
            
            if (response.ok) {
                UI.showToast(systemId ? 'System updated successfully' : 'System added successfully', 'success');
                UI.closeModal(document.getElementById('systemModal'));
                this.loadSystems();
                
                // Refresh dashboard data
                Dashboard.loadData();
            } else {
                UI.showToast(data.error || 'Failed to save system', 'error');
                
                // Re-enable form
                submitButton.disabled = false;
                submitButton.textContent = 'Save System';
            }
        } catch (error) {
            console.error('Error saving system:', error);
            UI.showToast('Failed to save system', 'error');
            
            // Re-enable form
            const submitButton = document.querySelector('#systemForm button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = 'Save System';
        }
    },
    
    // Delete system
    async deleteSystem(systemId) {
        if (!UI.confirm('Are you sure you want to delete this system?')) {
            return;
        }
        
        try {
            const response = await fetch(`${CONFIG.API_URL}/system/${systemId}`, {
                method: 'DELETE',
                headers: Auth.getHeaders()
            });
            
            if (response.ok) {
                UI.showToast('System deleted successfully', 'success');
                this.loadSystems();
                
                // Refresh dashboard data
                Dashboard.loadData();
            } else {
                const error = await response.json();
                UI.showToast(error.error || 'Failed to delete system', 'error');
            }
        } catch (error) {
            console.error('Error deleting system:', error);
            UI.showToast('Failed to delete system', 'error');
        }
    }
};