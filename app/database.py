from databases import Database
from sqlalchemy import create_engine, MetaData

DATABASE_URL = "sqlite:///./xll_data.db"
database = Database(DATABASE_URL)
metadata = MetaData()

engine = create_engine(DATABASE_URL)