# backend/routes/system.py

import json
from decimal import Decimal
from datetime import datetime
from backend.db.connection import get_db_connection
from backend.routes.log import log_action
from urllib.parse import parse_qs

def add_system(request_body):
    try:
        data = json.loads(request_body)
        fields = [
            "hostname", "os_name", "os_version", "ram_size_gb",
            "cpu_model", "storage_size_gb", "ip_address", "mac_address",
            "antivirus_status", "user_id", "network_id"
        ]
        values = [data.get(field) for field in fields]

        if not data.get("hostname") or not data.get("ip_address") or not data.get("os_name"):
            return 400, {"error": "Missing required fields"}

        conn = get_db_connection()
        if not conn:
            return 500, {"error": "Database connection failed"}

        cursor = conn.cursor()
        cursor.execute(f"""
            INSERT INTO `system` ({", ".join(fields)})
            VALUES ({", ".join(["%s"] * len(fields))})
        """, values)

        conn.commit()
        cursor.close()
        conn.close()
        if data.get("user_id"):  # Only log if user_id is available
            log_action(
                user_id=data["user_id"],
                action="Added system",
                resource_type="system",
                resource_id=cursor.lastrowid,
                context=f"Hostname: {data.get('hostname')}"
            )


        return 201, {"message": "System added successfully"}

    except json.JSONDecodeError:
        return 400, {"error": "Invalid JSON"}
    except Exception as e:
        print("[ADD SYSTEM ERROR]", e)
        return 500, {"error": "Internal server error"}


def convert_types(obj):
    """Convert Decimal and datetime objects in dicts/lists."""
    if isinstance(obj, list):
        return [convert_types(item) for item in obj]
    elif isinstance(obj, dict):
        return {
            k: convert_types(v) for k, v in obj.items()
        }
    elif isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, datetime):
        return obj.isoformat()
    return obj


def get_systems(query_string=""):
    try:
        filters = parse_qs(query_string)
        department_id = filters.get("department_id", [None])[0]
        network_id = filters.get("network_id", [None])[0]

        query = """
            SELECT s.*, u.full_name AS user_name, d.name AS department, n.name AS network
            FROM `system` s
            LEFT JOIN `user` u ON s.user_id = u.user_id
            LEFT JOIN department d ON u.department_id = d.department_id
            LEFT JOIN network n ON s.network_id = n.network_id
        """

        conditions = []
        values = []

        if department_id:
            conditions.append("u.department_id = %s")
            values.append(department_id)
        if network_id:
            conditions.append("s.network_id = %s")
            values.append(network_id)

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, values)
        systems = cursor.fetchall()
        cursor.close()
        conn.close()

        return 200, {"systems": convert_types(systems)}

    except Exception as e:
        print("[GET SYSTEMS ERROR]", e)
        return 500, {"error": "Internal server error"}

    

def update_system(system_id, request_body, user_id=None):
    try:
        data = json.loads(request_body)

        if not data:
            return 400, {"error": "No data provided"}

        allowed_fields = [
            "hostname", "os_name", "os_version", "ram_size_gb", "cpu_model",
            "storage_size_gb", "ip_address", "mac_address", "antivirus_status",
            "user_id", "network_id"
        ]

        updates = []
        values = []

        for field in allowed_fields:
            if field in data:
                updates.append(f"{field} = %s")
                values.append(data[field])

        if not updates:
            return 400, {"error": "No valid fields to update"}

        values.append(system_id)  # For WHERE clause

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(f"""
            UPDATE `system`
            SET {', '.join(updates)}
            WHERE system_id = %s
        """, values)

        conn.commit()
        cursor.close()
        conn.close()
        if user_id:
            log_action(
                user_id=user_id,
                action="Updated system",
                resource_type="system",
                resource_id=system_id,
                context=f"System ID {system_id} updated"
            )


        return 200, {"message": "System updated successfully"}

    except json.JSONDecodeError:
        return 400, {"error": "Invalid JSON"}
    except Exception as e:
        print("[UPDATE SYSTEM ERROR]", e)
        return 500, {"error": "Internal server error"}


def delete_system(system_id, user_id=None):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM `system` WHERE system_id = %s", (system_id,))
        conn.commit()
        cursor.close()
        conn.close()

        if cursor.rowcount == 0:
            return 404, {"error": "System not found"}
        if user_id:
            log_action(
                user_id=user_id,
                action="Deleted system",
                resource_type="system",
                resource_id=system_id,
                context=f"System deleted"
            )


        return 200, {"message": "System deleted successfully"}

    except Exception as e:
        print("[DELETE SYSTEM ERROR]", e)
        return 500, {"error": "Internal server error"}

