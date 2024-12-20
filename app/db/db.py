from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

async_engine = create_async_engine(settings.DB_URL, echo=True)

AsyncSessionPostgres = async_sessionmaker(bind=async_engine, expire_on_commit=False)
SessionLocal = sessionmaker(bind=async_engine, class_=AsyncSession, expire_on_commit=False)


Base = declarative_base()


async def get_db():
    async with SessionLocal() as session:
        yield session
