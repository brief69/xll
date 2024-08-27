from fastapi import APIRouter, HTTPException
from app.database import database
from app.models import prices
from sqlalchemy import select
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/api/prices")
async def get_prices():
    query = select([prices]).where(
        prices.c.timestamp > datetime.utcnow() - timedelta(hours=1)
    ).order_by(prices.c.timestamp.desc())
    
    results = await database.fetch_all(query)
    
    if not results:
        # 最新のデータがない場合、最後に取得したデータを返す
        query = select([prices]).order_by(prices.c.timestamp.desc()).limit(1)
        results = await database.fetch_all(query)
        if not results:
            raise HTTPException(status_code=404, detail="No price data found")
    
    fiat_currencies = [dict(r) for r in results if r['asset_type'] == 'currency']
    cryptocurrencies = [dict(r) for r in results if r['asset_type'] == 'crypto']
    
    return {
        "fiat_currencies": fiat_currencies,
        "cryptocurrencies": cryptocurrencies,
        "last_updated": results[0]['timestamp']
    }