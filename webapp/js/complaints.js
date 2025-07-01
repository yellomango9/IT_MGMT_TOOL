// Complaints Module

const Complaints = {
    // Initialize complaints module
    init() {
        this.setupEventListeners();
        this.loadComplaints();
    },
    
    // Set up event listeners
    setupEventListeners() {
        const addComplaintBtn = document.getElementById('addComplaintBtn');
        const complaintForm = document.getElementById('complaintForm');
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        
        // Add complaint button
        addComplaintBtn.addEventListener('click', () => {
            this.showAddComplaintModal();
        });
        
        // Complaint form submission
        complaintForm.addEventListener('submit', (event) => {
            event.preventDefault();
            this.saveComplaint();
        });
        
        // Filters
        statusFilter.addEventListener('change', () => {
            this.loadComplaints();
        });
        
        priorityFilter.addEventListener('change', () => {
            this.loadComplaints();
        });
    },
    
    // Load complaints from API
    async loadComplaints() {
        if (!Auth.isLoggedIn()) {
            return;
        }
        
        try {
            // Show loading state
            const tableBody = document.querySelector('#complaintsTable tbody');
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading complaints...</td></tr>';
            
            // Get filter values
            const statusFilter = document.getElementById('statusFilter').value;
            const priorityFilter = document.getElementById('priorityFilter').value;
            
            // Build query string
            let queryString = '';
            if (statusFilter) {
                queryString += `status=${statusFilter}`;
            }
            
            if (priorityFilter) {
                if (queryString) queryString += '&';
                queryString += `priority=${priorityFilter}`;
            }
            
            // Add user_id filter if not admin or IT personnel
            console.log('Current user role for complaints:', Auth.currentUser.role);
            if (Auth.currentUser.role === 'User') {
                if (queryString) queryString += '&';
                queryString += `user_id=${Auth.currentUser.id}`;
            }
            
            console.log('Loading complaints with query:', queryString);
            
            // Fetch complaints
            const url = `${CONFIG.API_URL}/complaints${queryString ? '?' + queryString : ''}`;
            console.log('Fetching complaints from URL:', url);
            
            const response = await fetch(url, {
                headers: Auth.getHeaders()
            });
            
            const data = await response.json();
            console.log('Complaints response:', data);
            
            if (response.ok) {
                // Handle empty or undefined complaints array
                const complaints = data.complaints || [];
                this.renderComplaints(complaints);
            } else {
                UI.showToast(data.error || 'Failed to load complaints', 'error');
                
                // Show error in table
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Failed to load complaints</td></tr>';
            }
        } catch (error) {
            console.error('Error loading complaints:', error);
            UI.showToast('Failed to load complaints', 'error');
            
            // Show error in table
            const tableBody = document.querySelector('#complaintsTable tbody');
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Failed to load complaints</td></tr>';
        }
    },
    
    // Render complaints table
    renderComplaints(complaints) {
        const tableBody = document.querySelector('#complaintsTable tbody');
        tableBody.innerHTML = '';
        
        if (complaints.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 6;
            cell.textContent = 'No complaints found';
            cell.style.textAlign = 'center';
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }
        
        complaints.forEach(complaint => {
            const row = document.createElement('tr');
            
            // Subject
            const subjectCell = document.createElement('td');
            subjectCell.textContent = complaint.subject;
            row.appendChild(subjectCell);
            
            // Status
            const statusCell = document.createElement('td');
            const statusBadge = document.createElement('span');
            statusBadge.className = 'badge';
            statusBadge.textContent = complaint.status;
            
            // Add color based on status
            switch (complaint.status) {
                case 'Open':
                    statusBadge.style.backgroundColor = 'var(--danger-color)';
                    break;
                case 'In Progress':
                    statusBadge.style.backgroundColor = 'var(--warning-color)';
                    break;
                case 'Resolved':
                    statusBadge.style.backgroundColor = 'var(--success-color)';
                    break;
                case 'Closed':
                    statusBadge.style.backgroundColor = 'var(--secondary-color)';
                    break;
            }
            
            statusBadge.style.color = 'white';
            statusBadge.style.padding = '3px 8px';
            statusBadge.style.borderRadius = '12px';
            statusBadge.style.fontSize = '0.8em';
            
            statusCell.appendChild(statusBadge);
            row.appendChild(statusCell);
            
            // Priority
            const priorityCell = document.createElement('td');
            const priorityBadge = document.createElement('span');
            priorityBadge.className = 'badge';
            priorityBadge.textContent = complaint.priority;
            
            // Add color based on priority
            switch (complaint.priority) {
                case 'Low':
                    priorityBadge.style.backgroundColor = '#3498db';
                    break;
                case 'Medium':
                    priorityBadge.style.backgroundColor = '#f39c12';
                    break;
                case 'High':
                    priorityBadge.style.backgroundColor = '#e67e22';
                    break;
                case 'Critical':
                    priorityBadge.style.backgroundColor = '#e74c3c';
                    break;
            }
            
            priorityBadge.style.color = 'white';
            priorityBadge.style.padding = '3px 8px';
            priorityBadge.style.borderRadius = '12px';
            priorityBadge.style.fontSize = '0.8em';
            
            priorityCell.appendChild(priorityBadge);
            row.appendChild(priorityCell);
            
            // Submitted By
            const userCell = document.createElement('td');
            userCell.textContent = complaint.user_name || 'Unknown';
            row.appendChild(userCell);
            
            // Created At
            const createdCell = document.createElement('td');
            createdCell.textContent = UI.formatDate(complaint.created_at);
            row.appendChild(createdCell);
            
            // Actions
            const actionsCell = document.createElement('td');
            actionsCell.className = 'action-buttons';
            
            // View/Edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'btn-secondary';
            editBtn.textContent = 'View';
            editBtn.addEventListener('click', () => {
                this.showEditComplaintModal(complaint);
            });
            actionsCell.appendChild(editBtn);
            
            row.appendChild(actionsCell);
            tableBody.appendChild(row);
        });
    },
    
    // Show add complaint modal
    showAddComplaintModal() {
        const modal = document.getElementById('complaintModal');
        const form = document.getElementById('complaintForm');
        const title = document.getElementById('complaintModalTitle');
        const statusGroup = document.querySelector('.status-group');
        
        // Set modal title
        title.textContent = 'Add Complaint';
        
        // Reset form
        form.reset();
        document.getElementById('complaintId').value = '';
        
        // Hide status field for new complaints
        statusGroup.classList.add('hidden');
        
        // Show modal
        UI.openModal(modal);
    },
    
    // Show edit complaint modal
    showEditComplaintModal(complaint) {
        const modal = document.getElementById('complaintModal');
        const form = document.getElementById('complaintForm');
        const title = document.getElementById('complaintModalTitle');
        const statusGroup = document.querySelector('.status-group');
        
        // Set modal title
        title.textContent = 'View Complaint';
        
        // Fill form with complaint data
        document.getElementById('complaintId').value = complaint.complaint_id;
        document.getElementById('subject').value = complaint.subject;
        document.getElementById('description').value = complaint.description;
        document.getElementById('priority').value = complaint.priority;
        
        if (document.getElementById('status')) {
            document.getElementById('status').value = complaint.status;
        }
        
        // Show status field for existing complaints
        statusGroup.classList.remove('hidden');
        
        // Disable fields if user is not admin or IT personnel and not the complaint creator
        const isAdminOrIT = Auth.currentUser.role === 'Admin' || Auth.currentUser.role === 'IT_Personnel';
        const isCreator = Auth.currentUser.id == complaint.user_id;
        
        const readOnly = !isAdminOrIT && !isCreator;
        
        document.getElementById('subject').readOnly = readOnly;
        document.getElementById('description').readOnly = readOnly;
        document.getElementById('priority').disabled = readOnly;
        
        // Only admin or IT personnel can change status
        if (document.getElementById('status')) {
            document.getElementById('status').disabled = !isAdminOrIT;
        }
        
        // Show modal
        UI.openModal(modal);
    },
    
    // Save complaint (create or update)
    async saveComplaint() {
        try {
            // Disable form during submission
            const submitButton = document.querySelector('#complaintForm button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Saving...';
            
            const complaintId = document.getElementById('complaintId').value;
            
            // Prepare complaint data
            const complaintData = {
                subject: document.getElementById('subject').value,
                description: document.getElementById('description').value,
                priority: document.getElementById('priority').value
            };
            
            // Add status if updating
            if (complaintId && document.getElementById('status')) {
                complaintData.status = document.getElementById('status').value;
            }
            
            console.log('Saving complaint:', complaintData);
            
            let response;
            
            if (complaintId) {
                // Update existing complaint
                response = await fetch(`${CONFIG.API_URL}/complaint/${complaintId}`, {
                    method: 'PUT',
                    headers: Auth.getHeaders(),
                    body: JSON.stringify(complaintData)
                });
            } else {
                // Create new complaint
                response = await fetch(`${CONFIG.API_URL}/add-complaint`, {
                    method: 'POST',
                    headers: Auth.getHeaders(),
                    body: JSON.stringify(complaintData)
                });
            }
            
            const data = await response.json();
            console.log('Complaint save response:', data);
            
            if (response.ok) {
                UI.showToast(complaintId ? 'Complaint updated successfully' : 'Complaint added successfully', 'success');
                UI.closeModal(document.getElementById('complaintModal'));
                this.loadComplaints();
                
                // Refresh dashboard data
                Dashboard.loadData();
            } else {
                UI.showToast(data.error || 'Failed to save complaint', 'error');
                
                // Re-enable form
                submitButton.disabled = false;
                submitButton.textContent = complaintId ? 'Update' : 'Submit';
            }
        } catch (error) {
            console.error('Error saving complaint:', error);
            UI.showToast('Failed to save complaint', 'error');
            
            // Re-enable form
            const submitButton = document.querySelector('#complaintForm button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = document.getElementById('complaintId').value ? 'Update' : 'Submit';
        }
    }
};