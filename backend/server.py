# backend/server.py
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from backend.routes.user import register_user

class MyHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        request_body = self.rfile.read(content_length).decode()

        if self.path == "/register":
            status, response = register_user(request_body)
        else:
            status, response = 404, {"error": "Route not found"}

        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())

if __name__ == "__main__":
    server = HTTPServer(('0.0.0.0', 8000), MyHandler)
    print("🚀 Server running at http://localhost:8000/")
    server.serve_forever()
