// Main Application Entry Point

// Initialize all modules when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI components
    UI.init();
    
    // Initialize authentication
    Auth.init();
    
    // Initialize modules
    Dashboard.init();
    Systems.init();
    Peripherals.init();
    Complaints.init();
    Logs.init();
    Reports.init();
    
    console.log('IT Management Tool frontend initialized');
});