import asyncio
from sqlalchemy import select
from app.database import async_session
from app.auth.models import User
from app.auth.service import authenticate_user

async def try_auth():
    async with async_session() as session:
        try:
            user = await authenticate_user(session, "palak@example.com", "password123")
            print(f"Authenticated successfully: {user.name}")
        except Exception as e:
            print(f"Authentication failed: {e}")

if __name__ == "__main__":
    asyncio.run(try_auth())
