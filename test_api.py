

import requests

# APIの設定
api_keys = {
    'coinmarketcap': 'your_coinmarketcap_api_key',
    'coingecko': 'your_coingecko_api_key',
    'cryptocompare': 'your_cryptocompare_api_key',
    # 他のAPIキーも同様に
}

# CoinMarketCapのテスト
cmc_response = requests.get(
    'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
    headers={'X-CMC_PRO_API_KEY': api_keys['coinmarketcap']}
)
print('CoinMarketCap Response:', cmc_response.json())

# CoinGeckoのテスト
cg_response = requests.get('https://api.coingecko.com/api/v3/coins/markets', params={'vs_currency': 'usd'})
print('CoinGecko Response:', cg_response.json())

# CryptoCompareのテスト
cc_response = requests.get(
    'https://min-api.cryptocompare.com/data/top/mktcapfull',
    headers={'authorization': 'Apikey ' + api_keys['cryptocompare']},
    params={'limit': 10, 'tsym': 'USD'}
)
print('CryptoCompare Response:', cc_response.json())

# 他のAPIのテストも同様に追加
