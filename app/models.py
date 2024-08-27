from sqlalchemy import Table, Column, Integer, String, Float, DateTime, MetaData
from .database import metadata

prices = Table(
    "prices",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("asset_type", String),
    Column("asset_id", String),
    Column("price", Float),
    Column("xll_value", Float),
    Column("timestamp", DateTime)
)
