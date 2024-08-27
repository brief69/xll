import aiohttp
import asyncio
import os
from dotenv import load_dotenv
import logging
import statistics
import time
from datetime import datetime
from app.database import database
from app.models import prices

load_dotenv()

logging.basicConfig(filename='xll_data_fetcher.log', level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

XLL_BASE = 100

API_URLS = {
    "currency": [
        "https://openexchangerates.org/api/latest.json?app_id={}&base=JPY",
        "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=JPY&to_currency={}&apikey={}",
        "http://api.currencylayer.com/live?access_key={}&source=JPY&currencies={}"
    ],
    "crypto": [
        "https://api.coingecko.com/api/v3/simple/price?ids={}&vs_currencies=jpy",
        "https://min-api.cryptocompare.com/data/price?fsym={}&tsyms=JPY&api_key={}",
        "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol={}&convert=JPY"
    ]
}

API_KEYS = {
    "openexchangerates": os.getenv("OPENEXCHANGERATES_API_KEY"),
    "alphavantage": os.getenv("ALPHAVANTAGE_API_KEY"),
    "currencylayer": os.getenv("CURRENCYLAYER_API_KEY"),
    "cryptocompare": os.getenv("CRYPTOCOMPARE_API_KEY"),
    "coinmarketcap": os.getenv("COINMARKETCAP_API_KEY")
}

CURRENCIES = ["USD", "EUR", "GBP", "AUD", "CAD", "CHF", "CNY", "HKD", "NZD", "SEK", "KRW", "SGD", "NOK", "MXN", "INR", "RUB", "ZAR", "TRY", "BRL", "TWD"]
CRYPTOCURRENCIES = [
    "BTC", "ETH", "XRP", "LTC", "BCH", "ADA", "DOT", "LINK", "XLM", "DOGE",
    "UNI", "USDT", "USDC", "BNB", "SOL", "LUNA", "AVAX", "MATIC", "ALGO", "ATOM",
    "VET", "XTZ", "FIL", "AAVE", "EOS", "THETA", "XMR", "NEO", "MIOTA", "CAKE",
    "COMP", "MKR", "SNX", "GRT", "YFI", "SUSHI", "ZEC", "DASH", "BAT", "WAVES"
]

async def fetch_data(session, url):
    async with session.get(url) as response:
        return await response.json()

async def parse_price(data, api_name, asset_id):
    if api_name == "openexchangerates":
        return 1 / data["rates"][asset_id]
    elif api_name == "alphavantage":
        return float(data["Realtime Currency Exchange Rate"]["5. Exchange Rate"])
    elif api_name == "currencylayer":
        return 1 / data["quotes"][f"JPY{asset_id}"]
    elif api_name == "coingecko":
        return data[asset_id.lower()]["jpy"]
    elif api_name == "cryptocompare":
        return data["JPY"]
    elif api_name == "coinmarketcap":
        return data["data"][asset_id]["quote"]["JPY"]["price"]
    else:
        logging.error(f"Unknown API: {api_name}")
        return None

def calculate_median_price(valid_prices):
    if valid_prices:
        return statistics.median(valid_prices)
    return None

async def get_asset_price(asset_type, asset_id):
    async with aiohttp.ClientSession() as session:
        tasks = []
        for i, url in enumerate(API_URLS[asset_type]):
            api_name = list(API_KEYS.keys())[i]
            tasks.append(fetch_data(session, url.format(API_KEYS.get(api_name), asset_id)))
        responses = await asyncio.gather(*tasks)

    valid_prices = []
    for i, data in enumerate(responses):
        try:
            price = await parse_price(data, list(API_KEYS.keys())[i], asset_id)
            if price is not None:
                valid_prices.append(price)
        except Exception as e:
            logging.error(f"Error parsing price for {asset_id} from {list(API_KEYS.keys())[i]}: {str(e)}")

    if valid_prices:
        if len(valid_prices) >= 3:
            price = calculate_median_price(valid_prices)
        else:
            price = valid_prices[0]
        xll_value = XLL_BASE / price
        return {"price": price, "xll_value": xll_value}
    else:
        logging.error(f"No valid price data for {asset_type} {asset_id}")
        return None

async def save_price_to_db(asset_type, asset_id, price_data):
    query = prices.insert().values(
        asset_type=asset_type,
        asset_id=asset_id,
        price=price_data['price'],
        xll_value=price_data['xll_value'],
        timestamp=datetime.utcnow()
    )
    await database.execute(query)

async def main():
    await database.connect()
    try:
        for currency in CURRENCIES:
            price_data = await get_asset_price("currency", currency)
            if price_data:
                await save_price_to_db("currency", currency, price_data)
                logging.info(f"Saved {currency}: {price_data}")
        
        for crypto in CRYPTOCURRENCIES:
            price_data = await get_asset_price("crypto", crypto)
            if price_data:
                await save_price_to_db("crypto", crypto, price_data)
                logging.info(f"Saved {crypto}: {price_data}")
    finally:
        await database.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
