import io
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from backend.db.connection import get_db_connection
from urllib.parse import parse_qs

def generate_complaint_pdf(query_string):
    try:
        filters = parse_qs(query_string)
        conditions = []
        values = []

        if "status" in filters:
            conditions.append("c.status = %s")
            values.append(filters["status"][0])
        if "priority" in filters:
            conditions.append("c.priority = %s")
            values.append(filters["priority"][0])
        if "user_id" in filters:
            conditions.append("c.user_id = %s")
            values.append(filters["user_id"][0])

        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(f"""
            SELECT c.*, u.full_name
            FROM complaint c
            JOIN user u ON c.user_id = u.user_id
            {where_clause}
            ORDER BY c.created_at DESC
        """, values)

        complaints = cursor.fetchall()
        cursor.close()
        conn.close()

        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        y = height - 40

        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(50, y, "Complaint Report")
        y -= 30
        pdf.setFont("Helvetica", 10)

        for complaint in complaints:
            if y < 100:
                pdf.showPage()
                y = height - 40
                pdf.setFont("Helvetica", 10)

            pdf.drawString(50, y, f"ID: {complaint['complaint_id']} | User: {complaint['full_name']}")
            y -= 15
            pdf.drawString(50, y, f"Subject: {complaint['subject']}")
            y -= 15
            pdf.drawString(50, y, f"Status: {complaint['status']}, Priority: {complaint['priority']}, Created: {complaint['created_at']}")
            y -= 15
            pdf.drawString(50, y, f"Description: {complaint['description'][:100]}...")
            y -= 25

        pdf.save()
        buffer.seek(0)
        return 200, buffer.getvalue(), "application/pdf"

    except Exception as e:
        print("[PDF EXPORT ERROR]", e)
        return 500, b"Internal server error", "text/plain"


def generate_system_pdf(query_string=""):
    try:
        filters = parse_qs(query_string)
        conditions = []
        values = []

        if "department_id" in filters:
            conditions.append("d.department_id = %s")
            values.append(filters["department_id"][0])
        if "network_id" in filters:
            conditions.append("n.network_id = %s")
            values.append(filters["network_id"][0])

        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(f"""
            SELECT s.*, u.full_name AS user_name, d.name AS department, n.name AS network
            FROM `system` s
            LEFT JOIN `user` u ON s.user_id = u.user_id
            LEFT JOIN department d ON u.department_id = d.department_id
            LEFT JOIN network n ON s.network_id = n.network_id
            {where_clause}
            ORDER BY s.hostname
        """, values)

        systems = cursor.fetchall()
        cursor.close()
        conn.close()

        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        y = height - 40

        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(50, y, "System Inventory Report")
        y -= 30
        pdf.setFont("Helvetica", 10)

        for sys in systems:
            if y < 100:
                pdf.showPage()
                y = height - 40
                pdf.setFont("Helvetica", 10)

            pdf.drawString(50, y, f"Host: {sys['hostname']} | IP: {sys['ip_address']} | MAC: {sys['mac_address']}")
            y -= 15
            pdf.drawString(50, y, f"OS: {sys['os_name']} {sys['os_version']}, RAM: {sys['ram_size_gb']} GB, CPU: {sys['cpu_model']}")
            y -= 15
            pdf.drawString(50, y, f"User: {sys.get('user_name')}, Dept: {sys.get('department')}, Network: {sys.get('network')}")
            y -= 25

        pdf.save()
        buffer.seek(0)
        return 200, buffer.getvalue(), "application/pdf"

    except Exception as e:
        print("[SYSTEM PDF EXPORT ERROR]", e)
        return 500, b"Internal server error", "text/plain"


def generate_log_pdf():
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

        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        y = height - 40

        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(50, y, "Activity Log Report")
        y -= 30
        pdf.setFont("Helvetica", 10)

        for log in logs:
            if y < 100:
                pdf.showPage()
                y = height - 40
                pdf.setFont("Helvetica", 10)

            time_str = log['created_at'].strftime('%Y-%m-%d %H:%M:%S')
            pdf.drawString(50, y, f"{time_str} | User: {log.get('user_name', 'N/A')} | Action: {log['action']}")
            y -= 15
            pdf.drawString(70, y, f"Resource: {log['resource_type']}#{log['resource_id']} | Context: {log.get('context', '')}")
            y -= 25

        pdf.save()
        buffer.seek(0)
        return 200, buffer.getvalue(), "application/pdf"

    except Exception as e:
        print("[LOG PDF EXPORT ERROR]", e)
        return 500, b"Internal server error", "text/plain"

