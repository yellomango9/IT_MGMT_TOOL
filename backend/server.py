# backend/server.py

import json
import os
import mimetypes
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
from backend.routes.user import register_user, login_user
from backend.routes.system import add_system, get_systems, update_system, delete_system
from backend.routes.log import get_logs
from backend.routes.complaint import add_complaint, get_complaints, update_complaint
from backend.routes.pdf_export import generate_complaint_pdf
from backend.routes.pdf_export import generate_complaint_pdf
from backend.routes.pdf_export import generate_complaint_pdf, generate_system_pdf
from backend.routes.pdf_export import generate_log_pdf
from backend.routes.peripheral import add_peripheral, get_peripherals
from backend.routes.peripheral import update_peripheral, delete_peripheral, export_peripherals

class MyHandler(BaseHTTPRequestHandler):
    def _parse_user_id(self):
        # First try to get from headers
        user_id = self.headers.get("X-User-ID")
        if user_id and user_id.isdigit():
            return int(user_id)
        
        # Then try to get from query parameters
        parsed_path = urlparse(self.path)
        query_params = parse_qs(parsed_path.query)
        if 'user_id' in query_params and query_params['user_id'][0].isdigit():
            return int(query_params['user_id'][0])
        
        return None

    def _parse_role(self):
        # First try to get from headers
        role = self.headers.get("X-User-Role")
        if role:
            return role
        
        # Then try to get from query parameters
        parsed_path = urlparse(self.path)
        query_params = parse_qs(parsed_path.query)
        if 'user_role' in query_params:
            return query_params['user_role'][0]
        
        return "User"  # Default to 'User'

    def _read_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        return self.rfile.read(content_length).decode()

    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept, X-User-ID, X-User-Role")

    def _send_json(self, status, response):
        self.send_response(status)
        self._set_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())
        
    def _serve_static_file(self, file_path):
        """Serve a static file from the webapp directory"""
        # Get the absolute path to the webapp directory
        webapp_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'webapp')
        
        # Normalize the file path to prevent directory traversal attacks
        normalized_path = os.path.normpath(file_path)
        if normalized_path.startswith('/'):
            normalized_path = normalized_path[1:]
            
        # Get the full path to the requested file
        full_path = os.path.join(webapp_dir, normalized_path)
        
        # Check if the file exists
        if not os.path.exists(full_path) or not os.path.isfile(full_path):
            # If the path doesn't exist, try serving index.html
            if file_path == '/' or file_path == '':
                full_path = os.path.join(webapp_dir, 'index.html')
                if not os.path.exists(full_path):
                    self.send_response(404)
                    self.end_headers()
                    self.wfile.write(b'File not found')
                    return
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b'File not found')
                return
        
        # Determine the content type
        content_type, _ = mimetypes.guess_type(full_path)
        if content_type is None:
            content_type = 'application/octet-stream'
        
        # Serve the file
        try:
            with open(full_path, 'rb') as file:
                self.send_response(200)
                self.send_header('Content-Type', content_type)
                self.end_headers()
                self.wfile.write(file.read())
        except Exception as e:
            print(f"Error serving file {full_path}: {e}")
            self.send_response(500)
            self.end_headers()
            self.wfile.write(b'Internal server error')
    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()


    def do_POST(self):
        request_body = self._read_body()
        path = self.path
        
        print(f"POST request to {path}")
        print(f"Headers: {dict(self.headers)}")
        print(f"Body: {request_body}")

        if path == "/register":
            status, response = register_user(request_body)
        elif path == "/login":
            status, response = login_user(request_body)
        elif path == "/add-system":
            status, response = add_system(request_body)
        elif path == "/add-complaint":
            status, response = add_complaint(request_body)
        elif path == "/add-peripheral":
            print("Processing add-peripheral request")
            status, response = add_peripheral(request_body)
            print(f"add-peripheral response: {status}, {response}")

        else:
            status, response = 404, {"error": "Route not found"}

        self._send_json(status, response)

    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query = parsed_path.query  # Parse the query string once
        
        # API endpoints
        if path == "/systems":
            status, response = get_systems(query)

        elif path.startswith("/complaints"):
            status, response = get_complaints(query)

        elif path == "/logs":
            status, response = get_logs()

        elif path == "/export-complaints":
            if self._parse_role() != "Admin":
                self._send_json(403, {"error": "Only Admins can export complaints"})
                return
            status, pdf_bytes, content_type = generate_complaint_pdf(query)
            self.send_response(status)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Disposition", "attachment; filename=complaints.pdf")
            self.end_headers()
            self.wfile.write(pdf_bytes)
            return

        elif path == "/export-systems":
            if self._parse_role() != "Admin":
                self._send_json(403, {"error": "Only Admins can export systems"})
                return
            status, pdf_bytes, content_type = generate_system_pdf(query)
            self.send_response(status)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Disposition", "attachment; filename=systems.pdf")
            self.end_headers()
            self.wfile.write(pdf_bytes)
            return

        elif path == "/export-logs":
            if self._parse_role() != "Admin":
                self._send_json(403, {"error": "Only Admins can export logs"})
                return
            status, pdf_bytes, content_type = generate_log_pdf()
            self.send_response(status)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Disposition", "attachment; filename=logs.pdf")
            self.end_headers()
            self.wfile.write(pdf_bytes)
            return

        elif path == "/peripherals":
            status, response = get_peripherals()

        elif path == "/export/peripherals":
            status, response = export_peripherals()

        elif path == "/export/system-pdf":
            query_string = parsed_path.query
            status, content, content_type = generate_system_pdf(query_string)
            self.send_response(status)
            self.send_header("Content-Type", content_type)
            self.end_headers()
            self.wfile.write(content)
            return
            
        # If not an API endpoint, try to serve a static file
        elif path.startswith('/js/') or path.startswith('/css/') or path.startswith('/img/') or path == '/' or path == '/index.html' or path == '/login.html':
            self._serve_static_file(path)
            return

        else:
            # Try to serve as a static file first
            try:
                self._serve_static_file(path)
                return
            except:
                # If that fails, return a 404 API response
                status, response = 404, {"error": "Route not found"}

        self._send_json(status, response)


    def do_PUT(self):
        parsed_path = urlparse(self.path)
        path_parts = parsed_path.path.strip("/").split("/")
        request_body = self._read_body()
        user_id = self._parse_user_id()
        
        print(f"PUT request to {parsed_path.path}")
        print(f"Headers: {dict(self.headers)}")
        print(f"Body: {request_body}")

        if len(path_parts) == 2 and path_parts[0] == "system":
            try:
                system_id = int(path_parts[1])
                print(f"Updating system {system_id}")
                status, response = update_system(system_id, request_body, user_id=user_id)
                print(f"Update system response: {status}, {response}")
            except ValueError:
                status, response = 400, {"error": "Invalid system ID"}

        elif len(path_parts) == 2 and path_parts[0] == "complaint":
            try:
                complaint_id = int(path_parts[1])
                print(f"Updating complaint {complaint_id}")
                status, response = update_complaint(complaint_id, request_body, user_id=user_id)
                print(f"Update complaint response: {status}, {response}")
            except ValueError:
                status, response = 400, {"error": "Invalid complaint ID"}
        elif len(path_parts) == 2 and path_parts[0] == "peripheral":
            try:
                peripheral_id = int(path_parts[1])
                print(f"Updating peripheral {peripheral_id}")
                status, response = update_peripheral(peripheral_id, request_body, user_id=user_id)
                print(f"Update peripheral response: {status}, {response}")
            except ValueError:
                status, response = 400, {"error": "Invalid peripheral ID"}
        else:
            status, response = 404, {"error": "Route not found"}

        self._send_json(status, response)

    def do_DELETE(self):
        parsed_path = urlparse(self.path)
        path_parts = parsed_path.path.strip("/").split("/")
        user_id = self._parse_user_id()

        if len(path_parts) == 2 and path_parts[0] == "system":
            try:
                system_id = int(path_parts[1])
                status, response = delete_system(system_id, user_id=user_id)
            except ValueError:
                status, response = 400, {"error": "Invalid system ID"}
        elif len(path_parts) == 2 and path_parts[0] == "peripheral":
            try:
                peripheral_id = int(path_parts[1])
                status, response = delete_peripheral(peripheral_id, user_id=user_id)
            except ValueError:
                status, response = 400, {"error": "Invalid peripheral ID"}
        else:
            status, response = 404, {"error": "Route not found"}

        self._send_json(status, response)


def run(host='0.0.0.0', port=8000):
    server_address = (host, port)
    httpd = HTTPServer(server_address, MyHandler)
    print(f"🚀 Server running at http://{host}:{port}/")
    httpd.serve_forever()

if __name__ == "__main__":
    run()
