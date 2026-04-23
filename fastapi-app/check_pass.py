import asyncio
from sqlalchemy import select
from app.database import async_session
from app.auth.models import User
from app.auth.service import verify_password, hash_password

async def check_palak_password():
    async with async_session() as session:
        result = await session.execute(select(User).where(User.email == "palak@example.com"))
        user = result.scalar_one_or_none()
        if user:
            print(f"User: {user.email}")
            print(f"Password Hash: {user.password_hash}")
            
            # Check against password123
            test_pass = "password123"
            matches = verify_password(test_pass, user.password_hash)
            print(f"Matches 'password123': {matches}")
            
            # Show what a fresh hash of 'password123' looks like
            fresh_hash = hash_password(test_pass)
            print(f"Fresh hash of 'password123': {fresh_hash}")
        else:
            print("User palak@example.com not found")

if __name__ == "__main__":
    asyncio.run(check_palak_password())
