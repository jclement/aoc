from hashlib import pbkdf2_hmac
from pydantic import BaseSettings

class Settings(BaseSettings):
    secret_key: str = "development"
    admin_password: str = "admin"
    database_uri: str = "sqlite:///development.sqlite"
    restrict_domain: str = ""  # i.e. "@gmail.com"
    pbkdf2_iterations: int = 10000

settings = Settings()