// Reports Module

const Reports = {
    // Initialize reports module
    init() {
        this.setupEventListeners();
        this.loadFilters();
    },
    
    // Set up event listeners
    setupEventListeners() {
        // System report
        const exportSystemsBtn = document.getElementById('exportSystemsBtn');
        if (exportSystemsBtn) {
            exportSystemsBtn.addEventListener('click', () => {
                this.exportSystemsPDF();
            });
        }
        
        // Complaints report
        const exportComplaintsBtn = document.getElementById('exportComplaintsBtn');
        if (exportComplaintsBtn) {
            exportComplaintsBtn.addEventListener('click', () => {
                this.exportComplaintsPDF();
            });
        }
        
        // Peripherals report
        const exportPeripheralsBtn = document.getElementById('exportPeripheralsBtn');
        if (exportPeripheralsBtn) {
            exportPeripheralsBtn.addEventListener('click', () => {
                this.exportPeripheralsPDF();
            });
        }
        
        // Logs report
        const exportLogsBtn = document.getElementById('exportLogsBtn');
        if (exportLogsBtn) {
            exportLogsBtn.addEventListener('click', () => {
                this.exportLogsPDF();
            });
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
            
            // Populate department filter for system report
            const systemReportDepartment = document.getElementById('systemReportDepartment');
            if (systemReportDepartment) {
                UI.populateSelect(systemReportDepartment, departments, 'name', 'name');
            }
            
            // Populate network filter for system report
            const systemReportNetwork = document.getElementById('systemReportNetwork');
            if (systemReportNetwork) {
                UI.populateSelect(systemReportNetwork, networks, 'name', 'name');
            }
        } catch (error) {
            console.error('Error loading report filters:', error);
        }
    },
    
    // Export systems as PDF
    async exportSystemsPDF() {
        if (!Auth.isLoggedIn()) {
            UI.showToast('You must be logged in to export reports', 'error');
            return;
        }
        
        // Only admin can export systems
        console.log('Current user role for export:', Auth.currentUser.role);
        if (Auth.currentUser.role !== 'Admin') {
            UI.showToast('Only Admins can export systems', 'error');
            return;
        }
        
        try {
            // Get filter values
            const department = document.getElementById('systemReportDepartment').value;
            const network = document.getElementById('systemReportNetwork').value;
            
            // Build query string
            let queryString = '';
            if (department) {
                queryString += `department=${department}`;
            }
            
            if (network) {
                if (queryString) queryString += '&';
                queryString += `network=${network}`;
            }
            
            // Build URL with query parameters for headers
            let url = `${CONFIG.API_URL}/export-systems`;
            
            // Add query parameters
            const params = new URLSearchParams();
            if (department) params.append('department', department);
            if (network) params.append('network', network);
            
            // Add user ID and role as query parameters
            params.append('user_id', Auth.currentUser.id);
            params.append('user_role', Auth.currentUser.role);
            
            // Append parameters to URL
            if (params.toString()) {
                url += '?' + params.toString();
            }
            
            console.log('Exporting systems PDF with URL:', url);
            
            // Open in new window
            window.open(url, '_blank');
            
            UI.showToast('Generating systems report...', 'info');
        } catch (error) {
            console.error('Error exporting systems PDF:', error);
            UI.showToast('Failed to export systems report', 'error');
        }
    },
    
    // Export complaints as PDF
    async exportComplaintsPDF() {
        if (!Auth.isLoggedIn()) {
            UI.showToast('You must be logged in to export reports', 'error');
            return;
        }
        
        // Only admin can export complaints
        if (Auth.currentUser.role !== 'Admin') {
            UI.showToast('Only Admins can export complaints', 'error');
            return;
        }
        
        try {
            // Get filter values
            const status = document.getElementById('complaintReportStatus').value;
            const priority = document.getElementById('complaintReportPriority').value;
            
            // Prepare filters
            const filters = {};
            if (status) filters.status = status;
            if (priority) filters.priority = priority;
            
            // Build URL with query parameters for headers
            let url = `${CONFIG.API_URL}/export-complaints`;
            
            // Add query parameters
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            if (priority) params.append('priority', priority);
            
            // Add user ID and role as query parameters
            params.append('user_id', Auth.currentUser.id);
            params.append('user_role', Auth.currentUser.role);
            
            // Append parameters to URL
            if (params.toString()) {
                url += '?' + params.toString();
            }
            
            console.log('Exporting complaints PDF with URL:', url);
            
            // Open in new window
            window.open(url, '_blank');
            
            UI.showToast('Generating complaints report...', 'info');
        } catch (error) {
            console.error('Error exporting complaints PDF:', error);
            UI.showToast('Failed to export complaints report', 'error');
        }
    },
    
    // Export peripherals as PDF
    async exportPeripheralsPDF() {
        if (!Auth.isLoggedIn()) {
            UI.showToast('You must be logged in to export reports', 'error');
            return;
        }
        
        // Only admin can export peripherals
        console.log('Current user role for export:', Auth.currentUser.role);
        if (Auth.currentUser.role !== 'Admin') {
            UI.showToast('Only Admins can export peripherals', 'error');
            return;
        }
        
        try {
            // Build URL with query parameters for headers
            let url = `${CONFIG.API_URL}/export/peripherals`;
            
            // Add user ID and role as query parameters
            const params = new URLSearchParams();
            params.append('user_id', Auth.currentUser.id);
            params.append('user_role', Auth.currentUser.role);
            
            // Append parameters to URL
            if (params.toString()) {
                url += '?' + params.toString();
            }
            
            console.log('Exporting peripherals PDF with URL:', url);
            
            // Open in new window
            window.open(url, '_blank');
            
            UI.showToast('Generating peripherals report...', 'info');
        } catch (error) {
            console.error('Error exporting peripherals PDF:', error);
            UI.showToast('Failed to export peripherals report', 'error');
        }
    },
    
    // Export logs as PDF
    async exportLogsPDF() {
        if (!Auth.isLoggedIn()) {
            UI.showToast('You must be logged in to export reports', 'error');
            return;
        }
        
        // Only admin can export logs
        if (Auth.currentUser.role !== 'Admin') {
            UI.showToast('Only Admins can export logs', 'error');
            return;
        }
        
        try {
            // Build URL with query parameters for headers
            let url = `${CONFIG.API_URL}/export-logs`;
            
            // Add user ID and role as query parameters
            const params = new URLSearchParams();
            params.append('user_id', Auth.currentUser.id);
            params.append('user_role', Auth.currentUser.role);
            
            // Append parameters to URL
            if (params.toString()) {
                url += '?' + params.toString();
            }
            
            console.log('Exporting logs PDF with URL:', url);
            
            // Open in new window
            window.open(url, '_blank');
            
            UI.showToast('Generating logs report...', 'info');
        } catch (error) {
            console.error('Error exporting logs PDF:', error);
            UI.showToast('Failed to export logs report', 'error');
        }
    }
};