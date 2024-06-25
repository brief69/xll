from sqlalchemy import Table, Column, Integer, String, Float, DateTime
from .database import metadata
import datetime

prices = Table(
    "prices",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("asset_type", String(50)),
    Column("asset_id", String(50)),
    Column("price", Float),
    Column("timestamp", DateTime, default=datetime.datetime.utcnow)
)