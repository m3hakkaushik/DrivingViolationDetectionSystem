import asyncio
from sqlalchemy import select
from app.database import async_session
from app.auth.models import User

async def list_users():
    async with async_session() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()
        for u in users:
            print(f"ID: {u.id}, Email: {u.email}, Role: {u.role}, Active: {u.is_active}")

if __name__ == "__main__":
    asyncio.run(list_users())
