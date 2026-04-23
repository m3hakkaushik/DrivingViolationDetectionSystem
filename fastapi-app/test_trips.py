import asyncio
from sqlalchemy import select
from app.database import async_session
from app.trips.models import Trip

async def test():
    async with async_session() as session:
        result = await session.execute(select(Trip))
        for t in result.scalars():
            print(f"ID: {t.id}, Status: {t.status}")

if __name__ == "__main__":
    asyncio.run(test())
