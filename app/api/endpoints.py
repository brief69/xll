from fastapi import APIRouter, HTTPException
from app.database import database
from app.models import prices

router = APIRouter()

@router.get("/price/{asset_type}/{asset_id}")
async def get_price(asset_type: str, asset_id: str):
    query = prices.select().where(prices.c.asset_type == asset_type).where(prices.c.asset_id == asset_id).order_by(prices.c.timestamp.desc()).limit(1)
    result = await database.fetch_one(query)
    if result is None:
        raise HTTPException(status_code=404, detail="Price not found")
    return {"asset_type": result["asset_type"], "asset_id": result["asset_id"], "price": result["price"], "timestamp": result["timestamp"]}