import OrbitDB from 'orbit-db'
import { create } from 'ipfs-http-client'
import { createOrbitDB } from '@orbitdb/core'
import axios from 'axios'
import dotenv from 'dotenv'

// 環境変数の読み込み
dotenv.config()

// IPFSクライアントの初期化
const ipfs = create('/ip4/127.0.0.1/tcp/5001')

// XLLの基準値を設定
const XLL_BASE = 100

// 各APIのURLを定義
const API_URLS = {
  currency: {
    FreecurrencyAPI: process.env.FREECURRENCYAPI_API_KEY ? `https://api.freecurrencyapi.com/v1/latest?apikey=${process.env.FREECURRENCYAPI_API_KEY}&base_currency=JPY&currencies={}` : null,
    ExchangeRateAPI: process.env.EXCHANGERATE_API_KEY ? `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGERATE_API_KEY}/latest/JPY` : null,
    CurrencyFreaks: process.env.CURRENCYFREAKS_API_KEY ? `https://api.currencyfreaks.com/latest?apikey=${process.env.CURRENCYFREAKS_API_KEY}&base=JPY` : null
  },
  crypto: {
    CoinGecko: process.env.COINGECKO_API_KEY ? `https://api.coingecko.com/api/v3/simple/price?ids={}&vs_currencies=jpy&x_cg_demo_api_key=${process.env.COINGECKO_API_KEY}` : null,
    CryptoCompare: process.env.CRYPTOCOMPARE_API_KEY ? `https://min-api.cryptocompare.com/data/price?fsym={}&tsyms=JPY&api_key=${process.env.CRYPTOCOMPARE_API_KEY}` : null,
    Binance: process.env.BINANCE_API_KEY ? `https://api.binance.com/api/v3/ticker/price?symbol={}JPY` : null
  }
}

// 各APIのキーを環境変数から取得
const API_KEYS = {
  freecurrencyapi: process.env.FREECURRENCYAPI_API_KEY,
  exchangerateapi: process.env.EXCHANGERATE_API_KEY,
  currencyfreaks: process.env.CURRENCYFREAKS_API_KEY,
  coingecko: process.env.COINGECKO_API_KEY,
  cryptocompare: process.env.CRYPTOCOMPARE_API_KEY,
  binance: process.env.BINANCE_API_KEY
}

// 取得する通貨のリスト
const CURRENCIES = [
  "USD", "EUR", "GBP", "AUD", "CAD", "CHF", 
  "CNY", "HKD", "NZD", "SEK", "KRW", "SGD", 
  "NOK", "MXN", "INR", "RUB", "ZAR", "TRY",
  "BRL", "TWD"
]

// 取得する暗号通貨のリスト
const CRYPTOCURRENCIES = [
  "BTC", "ETH", "XRP", "LTC", "BCH", "ADA", 
  "DOT", "LINK", "XLM", "DOGE", "UNI", "USDT", 
  "USDC", "BNB", "SOL", "LUNA", "AVAX", "MATIC", 
  "ALGO", "ATOM", "VET", "XTZ", "FIL", "AAVE", 
  "EOS", "THETA", "XMR", "NEO", "MIOTA", "CAKE",
  "COMP", "MKR", "SNX", "GRT", "YFI", "SUSHI", 
  "ZEC", "DASH", "BAT", "WAVES"
]

// OrbitDBの初期化関数
async function initOrbitDB(orbitdb) {
  const pricesDb = await orbitdb.open('prices', { type: 'eventlog' })
  return pricesDb
}

// APIかデータを取得する関数
async function fetchData(url, apiName) {
  try {
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    console.error(`Error fetching data from ${apiName}:`, error)
    return null
  }
}

// APIからの応答を解析して価格を取得する関数
async function parsePrice(data, apiName, assetId) {
  try {
    switch (apiName) {
      case "FreecurrencyAPI":
        return 1 / data.data[assetId]
      case "ExchangeRateAPI":
        return 1 / data.conversion_rates[assetId]
      case "CurrencyFreaks":
        return 1 / parseFloat(data.rates[assetId])
      case "CoinGecko":
        return data[assetId.toLowerCase()].jpy
      case "CryptoCompare":
        return data.JPY
      case "Binance":
        return parseFloat(data.price)
      default:
        console.error(`Unknown API: ${apiName}`)
        return null
    }
  } catch (error) {
    console.error(`Error parsing price for ${assetId} from ${apiName}:`, error)
    return null
  }
}

// 資産の価格を取得する関数
async function getAssetPrice(assetType, assetId) {
  const validPrices = []
  for (const [apiName, url] of Object.entries(API_URLS[assetType])) {
    const apiKey = API_KEYS[apiName.toLowerCase()]
    if (apiKey) {
      const formattedUrl = url.replace('{}', apiKey).replace('{}', assetId)
      const data = await fetchData(formattedUrl, apiName)
      if (data) {
        const price = await parsePrice(data, apiName, assetId)
        if (price !== null) {
          validPrices.push(price)
        }
      }
    }
  }

  if (validPrices.length >= 2) {
    const price = validPrices.sort((a, b) => a - b)[Math.floor(validPrices.length / 2)]
    const xllValue = XLL_BASE / price
    return { price, xllValue }
  } else {
    console.warn(`Not enough valid price data for ${assetType} ${assetId}`)
    return null
  }
}

// 価格を取得してOrbitDBに保存する関数
async function fetchAndSavePrices(db) {
  try {
    const prices = await fetchPrices();
    const medianPrices = calculateMedian(prices);
    
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      prices: medianPrices
    };

    await db.add(entry);
    console.log('Price data saved to OrbitDB');
  } catch (error) {
    console.error('Error fetching and saving price data:', error);
  }
}

// 最新の価格データを取得する関数
async function getLatestPrice(assetType, assetId) {
  const events = await pricesDb.iterator({ limit: 100 }).collect()
  const filteredEvents = events.filter(e => 
    e.payload.value.asset_type === assetType && 
    e.payload.value.asset_id === assetId
  )
  if (filteredEvents.length > 0) {
    return filteredEvents.sort((a, b) => 
      new Date(b.payload.value.timestamp) - new Date(a.payload.value.timestamp)
    )[0].payload.value
  }
  return null
}

// メイン関数
async function main(pricesDb) {
  await fetchAndSavePrices(pricesDb)
  setInterval(() => fetchAndSavePrices(pricesDb), 3600000)
}

// エラーハンドリング付きでメイン関数を実行
main().catch(console.error)

export { fetchAndSavePrices, getLatestPrice, CURRENCIES, CRYPTOCURRENCIES, initOrbitDB };

async function fetchPrices() {
  const prices = { currency: {}, crypto: {} };

  for (const type in API_URLS) {
    for (const api in API_URLS[type]) {
      if (API_URLS[type][api]) {
        try {
          const response = await axios.get(API_URLS[type][api]);
          prices[type][api] = parseResponse(response.data, api);
        } catch (error) {
          console.error(`Error fetching data from ${api}:`, error);
        }
      }
    }
  }

  return prices;
}

function parseResponse(data, api) {
  // APIごとにレスポンスの構造が異なるため、適切にパースする必要があります
  // この関数は各APIのレスポンス構造に合わせて実装する必要があります
  // 例：
  switch (api) {
    case 'FreecurrencyAPI':
      return data.data;
    case 'ExchangeRateAPI':
      return data.conversion_rates;
    // 他のAPIも同様に実装
    default:
      console.error(`Unknown API: ${api}`);
      return null;
  }
}

function calculateMedian(prices) {
  const medianPrices = { currency: {}, crypto: {} };

  for (const type in prices) {
    for (const asset in prices[type]) {
      const values = Object.values(prices[type][asset]);
      if (values.length > 0) {
        values.sort((a, b) => a - b);
        const mid = Math.floor(values.length / 2);
        medianPrices[type][asset] = values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
      }
    }
  }

  return medianPrices;
}
