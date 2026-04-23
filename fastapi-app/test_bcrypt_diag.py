from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

password = "password123"
hashed = pwd_context.hash(password)
print(f"Hashed: {hashed}")

is_valid = pwd_context.verify(password, hashed)
print(f"Is valid: {is_valid}")

# Try verifying against a known hash pattern if possible, or just check if it works at all.
try:
    import bcrypt
    print(f"Bcrypt version: {bcrypt.__version__}")
except ImportError:
    print("Bcrypt package not found")
