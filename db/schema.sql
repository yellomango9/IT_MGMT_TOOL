-- db/schema.sql

-- 1. Department Table
CREATE TABLE department (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Network Table
CREATE TABLE network (
    network_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    subnet VARCHAR(50) NOT NULL,
    vlan_id VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. User Table
CREATE TABLE user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'IT_Personnel', 'User') NOT NULL DEFAULT 'User',
    designation VARCHAR(100),
    department_id INT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES department(department_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. System Table
CREATE TABLE system (
    system_id INT AUTO_INCREMENT PRIMARY KEY,
    hostname VARCHAR(100) NOT NULL UNIQUE,
    os_name VARCHAR(50) NOT NULL,
    os_version VARCHAR(50),
    ram_size_gb DECIMAL(5,2) NOT NULL,
    cpu_model VARCHAR(150),
    storage_size_gb DECIMAL(7,2),
    ip_address VARCHAR(45) NOT NULL,
    mac_address VARCHAR(50) NOT NULL,
    antivirus_status ENUM('Installed', 'Not Installed', 'Unknown') DEFAULT 'Unknown',
    user_id INT,
    network_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY (network_id) REFERENCES network(network_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Peripheral Table
CREATE TABLE peripheral (
    peripheral_id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('Printer', 'Router', 'Switch', 'UPS', 'Other') NOT NULL,
    model VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    assigned_to_system_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to_system_id) REFERENCES system(system_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Complaint Table
CREATE TABLE complaint (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('Open', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Open',
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Log Entry Table
CREATE TABLE log_entry (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INT,
    context TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- 8. Indexing for performance
CREATE INDEX idx_user_email ON user (email);
CREATE INDEX idx_system_user ON system (user_id);
CREATE INDEX idx_complaint_status_priority ON complaint (status, priority);
CREATE INDEX idx_log_action ON log_entry (action);
