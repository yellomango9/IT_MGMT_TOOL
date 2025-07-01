// Peripherals Module

const Peripherals = {
    // Initialize peripherals module
    init() {
        this.setupEventListeners();
        this.loadPeripherals();
    },
    
    // Set up event listeners
    setupEventListeners() {
        const addPeripheralBtn = document.getElementById('addPeripheralBtn');
        const peripheralForm = document.getElementById('peripheralForm');
        
        // Add peripheral button
        addPeripheralBtn.addEventListener('click', () => {
            this.showAddPeripheralModal();
        });
        
        // Peripheral form submission
        peripheralForm.addEventListener('submit', (event) => {
            event.preventDefault();
            this.savePeripheral();
        });
    },
    
    // Load peripherals from API
    async loadPeripherals() {
        if (!Auth.isLoggedIn()) {
            return;
        }
        
        try {
            const response = await fetch(`${CONFIG.API_URL}/peripherals`, {
                headers: Auth.getHeaders()
            });
            
            if (response.ok) {
                const data = await response.json();
                this.renderPeripherals(data.peripherals);
                
                // Load systems for the assigned system dropdown
                await this.loadSystemsForDropdown();
            } else {
                const error = await response.json();
                UI.showToast(error.error || 'Failed to load peripherals', 'error');
            }
        } catch (error) {
            console.error('Error loading peripherals:', error);
            UI.showToast('Failed to load peripherals', 'error');
        }
    },
    
    // Load systems for the assigned system dropdown
    async loadSystemsForDropdown() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/systems`, {
                headers: Auth.getHeaders()
            });
            
            if (response.ok) {
                const data = await response.json();
                const systemSelect = document.getElementById('assignedSystem');
                
                // Populate system select
                UI.populateSelect(systemSelect, data.systems, 'system_id', 'hostname', null);
            }
        } catch (error) {
            console.error('Error loading systems for dropdown:', error);
        }
    },
    
    // Render peripherals table
    renderPeripherals(peripherals) {
        const tableBody = document.querySelector('#peripheralsTable tbody');
        tableBody.innerHTML = '';
        
        if (peripherals.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 5;
            cell.textContent = 'No peripherals found';
            cell.style.textAlign = 'center';
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }
        
        peripherals.forEach(peripheral => {
            const row = document.createElement('tr');
            
            // Type
            const typeCell = document.createElement('td');
            typeCell.textContent = peripheral.type;
            row.appendChild(typeCell);
            
            // Model
            const modelCell = document.createElement('td');
            modelCell.textContent = peripheral.model || 'N/A';
            row.appendChild(modelCell);
            
            // Serial Number
            const serialCell = document.createElement('td');
            serialCell.textContent = peripheral.serial_number || 'N/A';
            row.appendChild(serialCell);
            
            // Assigned To
            const assignedCell = document.createElement('td');
            assignedCell.textContent = peripheral.assigned_to_hostname || 'Unassigned';
            row.appendChild(assignedCell);
            
            // Actions
            const actionsCell = document.createElement('td');
            actionsCell.className = 'action-buttons';
            
            // Edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'btn-secondary';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => {
                this.showEditPeripheralModal(peripheral);
            });
            actionsCell.appendChild(editBtn);
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-danger';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => {
                this.deletePeripheral(peripheral.peripheral_id);
            });
            actionsCell.appendChild(deleteBtn);
            
            row.appendChild(actionsCell);
            tableBody.appendChild(row);
        });
    },
    
    // Show add peripheral modal
    showAddPeripheralModal() {
        const modal = document.getElementById('peripheralModal');
        const form = document.getElementById('peripheralForm');
        const title = document.getElementById('peripheralModalTitle');
        
        // Set modal title
        title.textContent = 'Add Peripheral';
        
        // Reset form
        form.reset();
        document.getElementById('peripheralId').value = '';
        
        // Show modal
        UI.openModal(modal);
    },
    
    // Show edit peripheral modal
    showEditPeripheralModal(peripheral) {
        const modal = document.getElementById('peripheralModal');
        const form = document.getElementById('peripheralForm');
        const title = document.getElementById('peripheralModalTitle');
        
        // Set modal title
        title.textContent = 'Edit Peripheral';
        
        // Fill form with peripheral data
        document.getElementById('peripheralId').value = peripheral.peripheral_id;
        document.getElementById('peripheralType').value = peripheral.type;
        document.getElementById('peripheralModel').value = peripheral.model || '';
        document.getElementById('serialNumber').value = peripheral.serial_number || '';
        
        // Set assigned system
        if (peripheral.assigned_to_system_id) {
            document.getElementById('assignedSystem').value = peripheral.assigned_to_system_id;
        } else {
            document.getElementById('assignedSystem').value = '';
        }
        
        // Show modal
        UI.openModal(modal);
    },
    
    // Save peripheral (create or update)
    async savePeripheral() {
        try {
            // Disable form during submission
            const submitButton = document.querySelector('#peripheralForm button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Saving...';
            
            const peripheralId = document.getElementById('peripheralId').value;
            
            // Prepare peripheral data
            const peripheralData = {
                type: document.getElementById('peripheralType').value,
                model: document.getElementById('peripheralModel').value,
                serial_number: document.getElementById('serialNumber').value,
                assigned_to_system_id: document.getElementById('assignedSystem').value || null
            };
            
            console.log('Saving peripheral with data:', peripheralData);
            console.log('Using headers:', Auth.getHeaders());
            
            let response;
            
            if (peripheralId) {
                // Update existing peripheral
                console.log(`Updating peripheral ${peripheralId}`);
                response = await fetch(`${CONFIG.API_URL}/peripheral/${peripheralId}`, {
                    method: 'PUT',
                    headers: Auth.getHeaders(),
                    body: JSON.stringify(peripheralData)
                });
            } else {
                // Create new peripheral
                console.log('Creating new peripheral');
                response = await fetch(`${CONFIG.API_URL}/add-peripheral`, {
                    method: 'POST',
                    headers: Auth.getHeaders(),
                    body: JSON.stringify(peripheralData)
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
                UI.showToast(peripheralId ? 'Peripheral updated successfully' : 'Peripheral added successfully', 'success');
                UI.closeModal(document.getElementById('peripheralModal'));
                this.loadPeripherals();
                
                // Refresh dashboard data
                Dashboard.loadData();
            } else {
                UI.showToast(data.error || 'Failed to save peripheral', 'error');
                
                // Re-enable form
                submitButton.disabled = false;
                submitButton.textContent = peripheralId ? 'Update' : 'Add';
            }
        } catch (error) {
            console.error('Error saving peripheral:', error);
            UI.showToast('Failed to save peripheral', 'error');
            
            // Re-enable form
            const submitButton = document.querySelector('#peripheralForm button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = document.getElementById('peripheralId').value ? 'Update' : 'Add';
        }
    },
    
    // Delete peripheral
    async deletePeripheral(peripheralId) {
        if (!UI.confirm('Are you sure you want to delete this peripheral?')) {
            return;
        }
        
        try {
            const response = await fetch(`${CONFIG.API_URL}/peripheral/${peripheralId}`, {
                method: 'DELETE',
                headers: Auth.getHeaders()
            });
            
            if (response.ok) {
                UI.showToast('Peripheral deleted successfully', 'success');
                this.loadPeripherals();
                
                // Refresh dashboard data
                Dashboard.loadData();
            } else {
                const error = await response.json();
                UI.showToast(error.error || 'Failed to delete peripheral', 'error');
            }
        } catch (error) {
            console.error('Error deleting peripheral:', error);
            UI.showToast('Failed to delete peripheral', 'error');
        }
    }
};