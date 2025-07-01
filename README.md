🛠️ IT Management Tool – Backend

A minimal-dependency, framework-free backend system built with Python and MySQL. This system provides a production-ready, modular API for managing users, PCs, complaints, logs, and exports within an IT environment.
🧱 Tech Stack

Layer
	

Technology
	

Language

Server
	

http.server (built-in)
	

Python 3.12+

Database
	

MySQL
	


PDF Export
	

reportlab
	


API Testing
	

Thunder Client
	


Dependencies
	

None (manual SQL & JSON handling)
	


📂 Project Structure

it_mgmt_tool/
│
├── backend/
│   ├── server.py                   # Main HTTP server (custom routing)
│   ├── db/
│   │   └── connection.py           # MySQL DB connection helper
│   ├── routes/
│   │   ├── user.py                 # Registration & login
│   │   ├── system.py               # PC inventory APIs
│   │   ├── complaint.py            # Complaint module
│   │   ├── log.py                  # Action logging
│   │   └── pdf_export.py           # PDF generation
│
├── db/
│   └── schema.sql                  # Complete schema definition
└── README.md

✅ Features Implemented
🔐 Authentication

    POST /register: Registers a new user with full name, email, password, role, and department.

    POST /login: Authenticates a user and returns a success status (currently basic authentication; JWT not yet implemented).

💻 PC/System Inventory

    POST /add-system: Adds a new system to the inventory.

    GET /systems: Lists all systems, including associated user, department, and network information.

        Supports filters: ?department=<DepartmentName> and ?network=<NetworkName>

    PUT /system/<id>: Updates existing system information.

    DELETE /system/<id>: Deletes a system entry.

    Logging: All add, update, and delete actions for systems are recorded.

    GET /export/system-pdf: Generates a PDF report of all systems, supporting filters.

🛠️ Peripheral Management

    POST /add-peripheral: Adds a new peripheral (e.g., printer, router, switch).

    GET /peripherals: Lists all peripherals and their associated systems.

    PUT /peripheral/<id>: Updates peripheral information.

    DELETE /peripheral/<id>: Deletes a peripheral entry.

    GET /export/peripheral-pdf: Exports peripheral data as a PDF.

🧾 Complaint Management

    POST /add-complaint: Submits a new complaint (with subject, description, and priority).

    GET /complaints: Fetches complaints.

        Supports filters: ?status=<Status> and ?user_id=<UserID>

    PUT /complaint/<id>: Updates a complaint's status or priority.

    Logging: Complaint updates are saved in the logs.

    GET /export/complaint-pdf: Exports filtered complaints to a PDF.

📋 Logging

    GET /logs: Lists all user activity logs.

    Logged Actions:

        System Add/Update/Delete

        Complaint Updates

    GET /export/log-pdf: Exports activity logs to a PDF.

🔐 Security Practices in Use

    SQL Injection Protection: All database queries use parameterized statements.

    Password Hashing: Passwords are hashed using SHA256 (or a similar secure hashing algorithm).

    Safe JSON Serialization: Handles Decimal and datetime types for consistent JSON output.

🔎 Filters Supported

Module
	

Filters

Complaint
	

status, priority, user_id

System
	

department, network

PDF Export
	

Same filters as their respective modules
🗂️ Database Schema Summary

Tables:

    user (Roles: Admin, IT_Personnel, User)

    department

    network

    system

    peripheral

    complaint

    log_entry

Design Practices:

    Foreign keys with ON UPDATE CASCADE and ON DELETE SET NULL.

    Indexes on frequently filtered fields (e.g., email, status, priority).

    ENUM types for roles, statuses, and types.

🧾 PDF Export Modules

Leverages the reportlab library to generate comprehensive PDF reports for:

    Complaint Reports

    System Inventory

    Logs

    Peripherals

Features:

    Multi-page layouts

    Filtering via query string parameters

    Inclusion of timestamps, status, and assignments

🧪 API Testing Done Using

    Thunder Client: Used for comprehensive API testing.

    Manual Validation: Verified all endpoints for correct status codes, error messages, and consistent responses.

🚧 Remaining Work (Backend)

Task
	

Status
	

Notes

JWT Auth (Token-based)
	

❌ Not yet
	

Implementing secure token-based authentication

Role-based route control
	

❌ Not yet
	

Restricting API access based on user roles

Email notifications
	

❌ Not yet
	

For updates, new complaints, etc.

File attachments for complaints
	

❌ Optional
	

Adding support for attachments

Final deployment (gunicorn/nginx)
	

❌ Later
	

Preparing for production deployment