# backend/utils/security.py
import hashlib
import os

def hash_password(password: str, salt: bytes = None):
    if salt is None:
        salt = os.urandom(16)
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
    return salt.hex() + ':' + hashed.hex()

def verify_password(stored_password: str, provided_password: str) -> bool:
    salt_hex, hashed_hex = stored_password.split(':')
    salt = bytes.fromhex(salt_hex)
    hashed = hashlib.pbkdf2_hmac('sha256', provided_password.encode(), salt, 100000)
    return hashed.hex() == hashed_hex
