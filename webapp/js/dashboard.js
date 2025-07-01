// Dashboard Module

const Dashboard = {
    // Initialize dashboard
    init() {
        this.loadData();
    },
    
    // Load dashboard data
    async loadData() {
        if (!Auth.isLoggedIn()) {
            return;
        }
        
        try {
            // Load counts
            await this.loadSystemCount();
            await this.loadPeripheralCount();
            await this.loadComplaintCount();
            await this.loadDepartmentCount();
            
            // Load charts
            await this.loadComplaintStatusChart();
            await this.loadSystemDepartmentChart();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            UI.showToast('Failed to load dashboard data', 'error');
        }
    },
    
    // Load system count
    async loadSystemCount() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/systems`, {
                headers: Auth.getHeaders()
            });
            
            if (response.ok) {
                const data = await response.json();
                document.getElementById('systemCount').textContent = data.systems.length;
            }
        } catch (error) {
            console.error('Error loading system count:', error);
        }
    },
    
    // Load peripheral count
    async loadPeripheralCount() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/peripherals`, {
                headers: Auth.getHeaders()
            });
            
            if (response.ok) {
                const data = await response.json();
                document.getElementById('peripheralCount').textContent = data.peripherals.length;
            }
        } catch (error) {
            console.error('Error loading peripheral count:', error);
        }
    },
    
    // Load complaint count
    async loadComplaintCount() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/complaints?status=Open`, {
                headers: Auth.getHeaders()
            });
            
            if (response.ok) {
                const data = await response.json();
                document.getElementById('complaintCount').textContent = data.complaints.length;
            }
        } catch (error) {
            console.error('Error loading complaint count:', error);
        }
    },
    
    // Load department count (this is a placeholder as we don't have a direct API for departments)
    async loadDepartmentCount() {
        // In a real implementation, you would fetch this from an API
        // For now, we'll just set a placeholder value
        document.getElementById('departmentCount').textContent = '5';
    },
    
    // Load complaint status chart
    async loadComplaintStatusChart() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/complaints`, {
                headers: Auth.getHeaders()
            });
            
            if (response.ok) {
                const data = await response.json();
                const complaints = data.complaints;
                
                // Count complaints by status
                const statusCounts = {
                    'Open': 0,
                    'In Progress': 0,
                    'Resolved': 0,
                    'Closed': 0
                };
                
                complaints.forEach(complaint => {
                    statusCounts[complaint.status]++;
                });
                
                // Create a simple bar chart
                const chartContainer = document.getElementById('complaintStatusChart');
                chartContainer.innerHTML = '';
                
                const chartBar = document.createElement('div');
                chartBar.className = 'chart-bar';
                
                Object.entries(statusCounts).forEach(([status, count]) => {
                    const bar = document.createElement('div');
                    bar.className = 'bar';
                    
                    // Set height based on count (max height is 250px)
                    const maxHeight = 250;
                    const maxCount = Math.max(...Object.values(statusCounts));
                    const height = maxCount > 0 ? (count / maxCount) * maxHeight : 0;
                    bar.style.height = `${height}px`;
                    
                    // Set color based on status
                    switch (status) {
                        case 'Open':
                            bar.style.backgroundColor = 'var(--danger-color)';
                            break;
                        case 'In Progress':
                            bar.style.backgroundColor = 'var(--warning-color)';
                            break;
                        case 'Resolved':
                            bar.style.backgroundColor = 'var(--success-color)';
                            break;
                        case 'Closed':
                            bar.style.backgroundColor = 'var(--secondary-color)';
                            break;
                    }
                    
                    // Add label and value
                    const label = document.createElement('div');
                    label.className = 'bar-label';
                    label.textContent = status;
                    
                    const value = document.createElement('div');
                    value.className = 'bar-value';
                    value.textContent = count;
                    
                    bar.appendChild(value);
                    bar.appendChild(label);
                    chartBar.appendChild(bar);
                });
                
                chartContainer.appendChild(chartBar);
            }
        } catch (error) {
            console.error('Error loading complaint status chart:', error);
        }
    },
    
    // Load system department chart (placeholder)
    async loadSystemDepartmentChart() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/systems`, {
                headers: Auth.getHeaders()
            });
            
            if (response.ok) {
                const data = await response.json();
                const systems = data.systems;
                
                // Count systems by department
                const departmentCounts = {};
                
                systems.forEach(system => {
                    const department = system.department_name || 'Unassigned';
                    departmentCounts[department] = (departmentCounts[department] || 0) + 1;
                });
                
                // Create a simple pie chart visualization
                const chartContainer = document.getElementById('systemDepartmentChart');
                chartContainer.innerHTML = '';
                
                // Create pie chart container
                const chartWrapper = document.createElement('div');
                chartWrapper.style.display = 'flex';
                chartWrapper.style.justifyContent = 'center';
                chartWrapper.style.alignItems = 'center';
                chartWrapper.style.flexDirection = 'column';
                
                // Create pie chart (simplified representation)
                const pieChart = document.createElement('div');
                pieChart.className = 'pie-chart';
                
                // Create legend
                const legend = document.createElement('div');
                legend.className = 'pie-legend';
                
                // Define colors for departments
                const colors = [
                    'var(--secondary-color)',
                    'var(--success-color)',
                    'var(--warning-color)',
                    'var(--danger-color)',
                    '#9b59b6',
                    '#34495e'
                ];
                
                // Create gradient for pie chart
                let gradientString = '';
                let startPercent = 0;
                let colorIndex = 0;
                
                const totalSystems = Object.values(departmentCounts).reduce((sum, count) => sum + count, 0);
                
                Object.entries(departmentCounts).forEach(([department, count]) => {
                    const percent = (count / totalSystems) * 100;
                    const endPercent = startPercent + percent;
                    const color = colors[colorIndex % colors.length];
                    
                    gradientString += `${color} ${startPercent}% ${endPercent}%, `;
                    
                    // Add to legend
                    const legendItem = document.createElement('div');
                    legendItem.className = 'legend-item';
                    
                    const legendColor = document.createElement('div');
                    legendColor.className = 'legend-color';
                    legendColor.style.backgroundColor = color;
                    
                    const legendText = document.createElement('div');
                    legendText.textContent = `${department}: ${count}`;
                    
                    legendItem.appendChild(legendColor);
                    legendItem.appendChild(legendText);
                    legend.appendChild(legendItem);
                    
                    startPercent = endPercent;
                    colorIndex++;
                });
                
                // Remove trailing comma and space
                gradientString = gradientString.slice(0, -2);
                
                // Apply gradient to pie chart
                pieChart.style.background = `conic-gradient(${gradientString})`;
                
                chartWrapper.appendChild(pieChart);
                chartWrapper.appendChild(legend);
                chartContainer.appendChild(chartWrapper);
            }
        } catch (error) {
            console.error('Error loading system department chart:', error);
        }
    }
};