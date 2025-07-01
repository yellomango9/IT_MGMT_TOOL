// Logs Module

const Logs = {
    // Initialize logs module
    init() {
        this.setupEventListeners();
        this.loadLogs();
    },
    
    // Set up event listeners
    setupEventListeners() {
        const logActionFilter = document.getElementById('logActionFilter');
        
        // Filter by action
        if (logActionFilter) {
            logActionFilter.addEventListener('change', () => {
                this.loadLogs();
            });
        }
    },
    
    // Load logs from API
    async loadLogs() {
        if (!Auth.isLoggedIn()) {
            return;
        }
        
        // Only admin and IT personnel can view logs
        if (Auth.currentUser.role !== 'Admin' && Auth.currentUser.role !== 'IT_Personnel') {
            const tableBody = document.querySelector('#logsTable tbody');
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">You do not have permission to view logs</td></tr>';
            return;
        }
        
        try {
            // Show loading state
            const tableBody = document.querySelector('#logsTable tbody');
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Loading logs...</td></tr>';
            
            // Get filter value
            const actionFilter = document.getElementById('logActionFilter')?.value || '';
            
            // Build query string
            let queryString = '';
            if (actionFilter) {
                queryString = `?action=${actionFilter}`;
            }
            
            console.log('Loading logs with query:', queryString);
            
            // Fetch logs
            const url = `${CONFIG.API_URL}/logs${queryString}`;
            console.log('Fetching logs from URL:', url);
            
            const response = await fetch(url, {
                headers: Auth.getHeaders()
            });
            
            const data = await response.json();
            console.log('Logs response:', data);
            
            if (response.ok) {
                // Handle empty or undefined logs array
                const logs = data.logs || [];
                this.renderLogs(logs);
            } else {
                UI.showToast(data.error || 'Failed to load logs', 'error');
                
                // Show error in table
                tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Failed to load logs</td></tr>';
            }
        } catch (error) {
            console.error('Error loading logs:', error);
            UI.showToast('Failed to load logs', 'error');
            
            // Show error in table
            const tableBody = document.querySelector('#logsTable tbody');
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Failed to load logs</td></tr>';
        }
    },
    
    // Render logs table
    renderLogs(logs) {
        const tableBody = document.querySelector('#logsTable tbody');
        tableBody.innerHTML = '';
        
        if (!logs || logs.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 4;
            cell.textContent = 'No logs found';
            cell.style.textAlign = 'center';
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }
        
        logs.forEach(log => {
            const row = document.createElement('tr');
            
            // User
            const userCell = document.createElement('td');
            userCell.textContent = log.user_name || 'System';
            row.appendChild(userCell);
            
            // Action
            const actionCell = document.createElement('td');
            actionCell.textContent = log.action;
            row.appendChild(actionCell);
            
            // Resource
            const resourceCell = document.createElement('td');
            if (log.resource_type && log.resource_id) {
                resourceCell.textContent = `${log.resource_type} #${log.resource_id}`;
            } else {
                resourceCell.textContent = 'N/A';
            }
            row.appendChild(resourceCell);
            
            // Date/Time
            const dateCell = document.createElement('td');
            dateCell.textContent = UI.formatDate(log.created_at);
            row.appendChild(dateCell);
            
            tableBody.appendChild(row);
        });
    }
};