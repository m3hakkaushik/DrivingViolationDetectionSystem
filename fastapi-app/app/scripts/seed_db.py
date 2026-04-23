import asyncio
import os
import sys

# Ensure the parent app directory is in PATH so imports work
current_dir = os.path.dirname(os.path.abspath(__file__))
app_dir = os.path.abspath(os.path.join(current_dir, "../.."))
if app_dir not in sys.path:
    sys.path.insert(0, app_dir)

from sqlalchemy import select
from app.database import async_session, Base, engine
from app.auth.models import User
from app.auth.service import hash_password
from app.config import get_settings

settings = get_settings()

async def seed_data():
    # Make sure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with async_session() as session:
        print("Checking existing users...")
        result = await session.execute(select(User).where(User.email == "palak@example.com"))
        if result.scalar_one_or_none():
            print("Users already seeded.")
            return

        print("Seeding mock users...")
        
        # 1. Reviewer
        reviewer = User(
            name="Palak (Reviewer)",
            email="palak@example.com",
            password_hash=hash_password("password123"),
            role="REVIEWER"
        )
        # 2. Officer
        officer = User(
            name="Shivam (Officer)",
            email="shivam@example.com",
            password_hash=hash_password("password123"),
            role="OFFICER"
        )
        # 3. Admin
        admin = User(
            name="Tushar (Admin)",
            email="tushar@example.com",
            password_hash=hash_password("password123"),
            role="ADMIN"
        )
        
        # 4. Driver
        driver = User(
            name="Nikhil (Driver)",
            email="nikhil@example.com",
            password_hash=hash_password("password123"),
            role="DRIVER"
        )

        session.add_all([reviewer, officer, admin, driver])
        await session.commit()
        print("Mock users created successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
