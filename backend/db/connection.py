# backend/db/connection.py
import mysql.connector
from mysql.connector import Error

def get_db_connection():
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',          # Replace with your DB user
            password='Adrde07@',
            database='it_management'
        )
        return conn
    except Error as e:
        print(f"[DB ERROR] {e}")
        return None
