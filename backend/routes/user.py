# backend/routes/user.py
import json
from urllib.parse import parse_qs
from backend.db.connection import get_db_connection
from backend.utils.security import hash_password

def register_user(request_body):
    try:
        data = json.loads(request_body)

        full_name = data.get("full_name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "User")  # default to 'User'
        department_id = data.get("department_id")

        if not all([full_name, email, password]):
            return 400, {"error": "Missing required fields"}

        hashed_password = hash_password(password)

        conn = get_db_connection()
        if not conn:
            return 500, {"error": "Database connection failed"}

        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user (full_name, email, password_hash, role, department_id)
            VALUES (%s, %s, %s, %s, %s)
        """, (full_name, email, hashed_password, role, department_id))

        conn.commit()
        cursor.close()
        conn.close()

        return 201, {"message": "User registered successfully"}

    except json.JSONDecodeError:
        return 400, {"error": "Invalid JSON"}
    except Exception as e:
        print("[REGISTER ERROR]", e)
        return 500, {"error": "Internal server error"}
