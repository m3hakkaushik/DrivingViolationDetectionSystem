import asyncio
from sqlalchemy import select
from app.database import async_session
from app.clips.models import Clip

async def test():
    async with async_session() as session:
        result = await session.execute(select(Clip))
        for c in result.scalars():
            print(f"ID: {c.id}, Trip: {c.trip_id}, Path: {c.storage_path}")

if __name__ == "__main__":
    asyncio.run(test())
