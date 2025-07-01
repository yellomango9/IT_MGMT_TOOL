import json
from decimal import Decimal
from backend.db.connection import get_db_connection
from backend.routes.log import log_action
from backend.utils.pdf_export import export_peripherals_pdf

def convert_types(obj):
    if isinstance(obj, list):
        return [convert_types(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_types(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return float(obj)
    return obj

def add_peripheral(request_body):
    try:
        if not request_body.strip():
            return 400, {"error": "Empty request body"}       
        data = json.loads(request_body)
        required_fields = ["type", "serial_number"]

        for field in required_fields:
            if not data.get(field):
                return 400, {"error": f"Missing field: {field}"}

        fields = ["type", "model", "serial_number", "assigned_to_system_id"]
        values = [data.get(field) for field in fields]

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(f"""
            INSERT INTO peripheral ({", ".join(fields)})
            VALUES ({", ".join(["%s"] * len(fields))})
        """, values)
        conn.commit()
        cursor.close()
        conn.close()

        if data.get("user_id"):
            log_action(
                user_id=data["user_id"],
                action="Added peripheral",
                resource_type="peripheral",
                resource_id=cursor.lastrowid,
                context=f"Type: {data.get('type')} | Serial: {data.get('serial_number')}"
            )

        return 201, {"message": "Peripheral added successfully"}
    except Exception as e:
        print("[ADD PERIPHERAL ERROR]", e)
        return 500, {"error": "Internal server error"}

def get_peripherals():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT p.*, s.hostname AS assigned_system
            FROM peripheral p
            LEFT JOIN system s ON p.assigned_to_system_id = s.system_id
            ORDER BY p.created_at DESC
        """)
        peripherals = cursor.fetchall()
        cursor.close()
        conn.close()
        return 200, {"peripherals": convert_types(peripherals)}
    except Exception as e:
        print("[GET PERIPHERALS ERROR]", e)
        return 500, {"error": "Internal server error"}


def update_peripheral(peripheral_id, request_body, user_id=None):
    try:
        data = json.loads(request_body)
        fields = ["type", "model", "serial_number", "assigned_to_system_id"]

        updates = []
        values = []
        for field in fields:
            if field in data:
                updates.append(f"{field} = %s")
                values.append(data[field])

        if not updates:
            return 400, {"error": "No valid fields to update"}

        values.append(peripheral_id)

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(f"""
            UPDATE peripheral SET {', '.join(updates)}
            WHERE peripheral_id = %s
        """, values)
        conn.commit()
        cursor.close()
        conn.close()

        if user_id:
            log_action(user_id, "Updated peripheral", "peripheral", peripheral_id, f"Updated fields: {', '.join(data.keys())}")

        return 200, {"message": "Peripheral updated successfully"}
    except Exception as e:
        print("[UPDATE PERIPHERAL ERROR]", e)
        return 500, {"error": "Internal server error"}
    
def delete_peripheral(peripheral_id, user_id=None):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM peripheral WHERE peripheral_id = %s", (peripheral_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return 404, {"error": "Peripheral not found"}

        cursor.close()
        conn.close()

        if user_id:
            log_action(user_id, "Deleted peripheral", "peripheral", peripheral_id, f"Peripheral deleted")

        return 200, {"message": "Peripheral deleted successfully"}

    except Exception as e:
        print("[DELETE PERIPHERAL ERROR]", e)
        return 500, {"error": "Internal server error"}
    
def export_peripherals():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM peripheral")
        peripherals = cursor.fetchall()
        cursor.close()
        conn.close()

        export_peripherals_pdf(peripherals)
        return 200, {"message": "Peripherals exported successfully", "file": "peripherals.pdf"}

    except Exception as e:
        print("[EXPORT PERIPHERALS ERROR]", e)
        return 500, {"error": "Internal server error"}

