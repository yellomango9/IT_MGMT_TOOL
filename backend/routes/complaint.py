# backend/routes/complaint.py

import json
from datetime import datetime
from decimal import Decimal
from backend.db.connection import get_db_connection
from urllib.parse import parse_qs
from backend.routes.log import log_action
from datetime import datetime


def convert_types(obj):
    """Convert Decimal/datetime to float/ISO format for JSON."""
    if isinstance(obj, list):
        return [convert_types(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_types(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, datetime):
        return obj.isoformat()
    return obj


def add_complaint(request_body):
    try:
        data = json.loads(request_body)

        required_fields = ["user_id", "subject", "description"]
        if not all(field in data for field in required_fields):
            return 400, {"error": "Missing required fields"}

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO complaint (user_id, subject, description, status, priority)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            data["user_id"],
            data["subject"],
            data["description"],
            data.get("status", "Open"),
            data.get("priority", "Medium")
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return 201, {"message": "Complaint submitted successfully"}

    except json.JSONDecodeError:
        return 400, {"error": "Invalid JSON"}
    except Exception as e:
        print("[ADD COMPLAINT ERROR]", e)
        return 500, {"error": "Internal server error"}


def get_complaints(query_string=""):
    try:
        filters = parse_qs(query_string)
        where_clauses = []
        values = []

        if "status" in filters:
            where_clauses.append("c.status = %s")
            values.append(filters["status"][0])

        if "priority" in filters:
            where_clauses.append("c.priority = %s")
            values.append(filters["priority"][0])

        if "user_id" in filters:
            where_clauses.append("c.user_id = %s")
            values.append(filters["user_id"][0])

        where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(f"""
            SELECT c.*, u.full_name AS user_name
            FROM complaint c
            LEFT JOIN user u ON c.user_id = u.user_id
            {where_sql}
            ORDER BY c.created_at DESC
        """, values)

        complaints = cursor.fetchall()
        cursor.close()
        conn.close()

        return 200, {"complaints": convert_types(complaints)}

    except Exception as e:
        print("[FILTERED GET COMPLAINTS ERROR]", e)
        return 500, {"error": "Internal server error"}
    
    
def update_complaint(complaint_id, request_body, user_id=None):
    try:
        data = json.loads(request_body)

        allowed_fields = ["status", "priority"]
        updates = []
        values = []

        for field in allowed_fields:
            if field in data:
                updates.append(f"{field} = %s")
                values.append(data[field])

        if not updates:
            return 400, {"error": "No valid fields to update"}

        # Add resolved_at if status is set to 'Resolved'
        if data.get("status") == "Resolved":
            updates.append("resolved_at = %s")
            values.append(datetime.now())

        values.append(complaint_id)

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(f"""
            UPDATE complaint
            SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP
            WHERE complaint_id = %s
        """, values)

        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return 404, {"error": "Complaint not found"}

        conn.commit()
        cursor.close()
        conn.close()

        # Logging context
        log_context = []
        if "status" in data:
            log_context.append(f"Status changed to {data['status']}")
        if "priority" in data:
            log_context.append(f"Priority changed to {data['priority']}")

        if user_id:
            log_action(
                user_id=user_id,
                action="Updated complaint",
                resource_type="complaint",
                resource_id=complaint_id,
                context="; ".join(log_context)
            )

        return 200, {"message": "Complaint updated successfully"}

    except json.JSONDecodeError:
        return 400, {"error": "Invalid JSON"}
    except Exception as e:
        print("[UPDATE COMPLAINT ERROR]", e)
        return 500, {"error": "Internal server error"}
