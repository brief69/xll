from databases import Database
from sqlalchemy import create_engine, MetaData
import os
from dotenv import load_dotenv
import logging
import asyncio

load_dotenv()

DATABASE_URL = os.getenv("POSTGRES_URL", "sqlite:///./test.db")
if DATABASE_URL is None:
    raise ValueError("POSTGRES_URL environment variable is not set")

# PostgreSQL support in Vercel environment
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create the database connection object
database = Database(DATABASE_URL, min_size=5, max_size=20)

# Create the metadata object (used for table definitions, etc.)
metadata = MetaData()

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)

async def connect_db():
    try:
        await database.connect()
        logging.info("Database connected successfully")
    except Exception as e:
        logging.error(f"Database connection failed: {str(e)}")
        raise

async def connect_with_retry(max_retries=3, delay=1):
    for attempt in range(max_retries):
        try:
            await database.connect()
            logging.info("Database connected successfully")
            return
        except Exception as e:
            logging.error(f"Database connection attempt {attempt + 1} failed: {str(e)}")
            if attempt < max_retries - 1:
                await asyncio.sleep(delay)
    raise Exception("Failed to connect to the database after multiple attempts")

def init_db():
    try:
        metadata.create_all(engine)
        logging.info("Database tables created successfully")
    except Exception as e:
        logging.error(f"Failed to create database tables: {str(e)}")
        raise
