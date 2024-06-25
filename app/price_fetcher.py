import asyncio
import aiohttp
import os
import statistics
import sqlite3
import logging
from dotenv import load_dotenv

load_dotenv()  # .env ファイルから環境変数を読み込む

logging.basicConfig(filename='xll_data_fetcher.log', level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

# APIのエンドポイントとキーを設定
API_ENDPOINTS = {
    "currency": [
        {"url": "https://openexchangerates.org/api/latest.json", "key": os.getenv("OPEN_EXCHANGE_RATES_KEY")},
        {"url": "http://data.fixer.io/api/latest", "key": os.getenv("FIXER_KEY")},
        {"url": "https://xecdapi.xe.com/v1/convert_from.json", "key": os.getenv("XE_KEY")}
    ],
    "crypto": [
        {"url": "https://api.coingecko.com/api/v3/simple/price", "key": None},
        {"url": "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest", "key": os.getenv("COINMARKETCAP_KEY")},
        {"url": "https://api.binance.com/api/v3/ticker/price", "key": None}
    ],
    # 株式とコモディティのAPIエンドポイントも同様に設定
}

async def fetch_data(session, url, params):
    async with session.get(url, params=params) as response:
        return await response.json()

async def get_asset_price(asset_type, asset_id):
    async with aiohttp.ClientSession() as session:
        tasks = []
        for api in API_ENDPOINTS[asset_type]:
            params = {"apikey": api["key"]} if api["key"] else {}
            if asset_type == "currency":
                params["base"] = "USD"
                params["symbols"] = asset_id
            elif asset_type == "crypto":
                params["ids"] = asset_id
            tasks.append(fetch_data(session, api["url"], params))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        valid_prices = []
        for result in results:
            if isinstance(result, dict) and not isinstance(result, Exception):
                # 各APIの結果からpriceを抽出する処理（API固有の処理が必要）
                price = extract_price(result, asset_type, asset_id)
                if price is not None:
                    valid_prices.append(price)
        
        if valid_prices:
            median_price = calculate_and_save_median(asset_type, asset_id, valid_prices)
            logging.info(f"Fetched {asset_type} {asset_id}: {median_price}")
            return median_price
        else:
            error_msg = f"No valid price data for {asset_type} {asset_id}"
            logging.error(error_msg)
            raise ValueError(error_msg)

def extract_price(result, asset_type, asset_id):
    # API固有の結果からpriceを抽出する処理
    # この関数は各APIの応答形式に合わせて実装する必要があります
    pass

def save_to_database(asset_type, asset_id, price):
    conn = sqlite3.connect('xll_data.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS prices
                 (asset_type TEXT, asset_id TEXT, price REAL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    c.execute("INSERT INTO prices (asset_type, asset_id, price) VALUES (?, ?, ?)",
              (asset_type, asset_id, price))
    conn.commit()
    conn.close()

def calculate_and_save_median(asset_type, asset_id, prices):
    median_price = statistics.median(prices)
    save_to_database(asset_type, asset_id, median_price)
    return median_price

def detect_anomaly(price, historical_prices):
    # 簡単な例：過去の価格の標準偏差の3倍を超える価格を異常とみなす
    mean = statistics.mean(historical_prices)
    std_dev = statistics.stdev(historical_prices)
    if abs(price - mean) > 3 * std_dev:
        return True
    return False

async def main():
    asset_types = ["currency", "crypto", "stock", "commodity"]
    asset_ids = {
        "currency": ["EUR", "JPY", "GBP"],
        "crypto": ["bitcoin", "ethereum", "ripple"],
        "stock": ["AAPL", "GOOGL", "MSFT"],
        "commodity": ["GOLD", "OIL", "SILVER"]
    }

    while True:
        for asset_type in asset_types:
            for asset_id in asset_ids[asset_type]:
                try:
                    price = await get_asset_price(asset_type, asset_id)
                    print(f"{asset_type} {asset_id}: {price}")
                except Exception as e:
                    logging.error(f"Error fetching {asset_type} {asset_id}: {str(e)}")
                    print(f"Error fetching {asset_type} {asset_id}: {str(e)}")
        
        await asyncio.sleep(60)  # 1分待機

if __name__ == "__main__":
    asyncio.run(main())