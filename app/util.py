import base64
import os
import hashlib
from .settings import settings

def hash_password(password):
    salt = os.urandom(32)
    key = hashlib.pbkdf2_hmac("sha256", password.encode(
        'utf-8'), salt, settings.pbkdf2_iterations)
    return base64.b64encode(salt+key)


def verify_password(hash, password):
    hash = base64.b64decode(hash)
    salt = hash[:32]
    tmp = hash[32:]
    tmp2 = hashlib.pbkdf2_hmac("sha256", password.encode(
        'utf-8'), salt, settings.pbkdf2_iterations)
    return tmp == tmp2
