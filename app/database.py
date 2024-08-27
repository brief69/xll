from databases import Database
from sqlalchemy import create_engine, MetaData
import os
from dotenv import load_dotenv
import logging

load_dotenv()

# Define the database URL (using PostgreSQL)
DATABASE_URL = os.getenv("POSTGRES_URL")
if DATABASE_URL is None:
    raise ValueError("POSTGRES_URL environment variable is not set")

# PostgreSQL support in Vercel environment
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create the database connection object
database = Database(DATABASE_URL)

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

def init_db():
    try:
        metadata.create_all(engine)
        logging.info("Database tables created successfully")
    except Exception as e:
        logging.error(f"Failed to create database tables: {str(e)}")
        raise
