from backend.db.connection import get_db_connection
from decimal import Decimal
from datetime import datetime

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


def log_action(user_id, action, resource_type, resource_id, context=""):
    if not user_id:
        print("[LOGGING WARNING] Skipping log: No valid user_id")
        return
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO log_entry (user_id, action, resource_type, resource_id, context)
            VALUES (%s, %s, %s, %s, %s)
        """, (user_id, action, resource_type, resource_id, context))
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print("[LOGGING ERROR]", e)
        
def get_logs():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT l.*, u.full_name AS user_name
            FROM log_entry l
            LEFT JOIN user u ON l.user_id = u.user_id
            ORDER BY l.created_at DESC
        """)
        logs = cursor.fetchall()
        cursor.close()
        conn.close()

        return 200, {"logs": convert_types(logs)}
    except Exception as e:
        print("[GET LOGS ERROR]", e)
        return 500, {"error": "Internal server error"}
