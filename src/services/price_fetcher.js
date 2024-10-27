import axios from 'axios'
import dotenv from 'dotenv'
import { create } from 'ipfs-http-client'
import fs from 'fs/promises'

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
    CoinGecko: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=jpy&order=market_cap_desc&per_page=250&page=1',
    CryptoCompare: process.env.CRYPTOCOMPARE_API_KEY ? `https://min-api.cryptocompare.com/data/price?fsym={}&tsyms=JPY&api_key=${process.env.CRYPTOCOMPARE_API_KEY}` : null,
    Binance: 'https://api.binance.com/api/v3/ticker/price'
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
];

// 取得する暗号通貨のリスト
const CRYPTOCURRENCIES = [
  "BTC", "ETH", "XRP", "LTC", "BCH", "ADA", 
  "DOT", "LINK", "XLM", "DOGE", "UNI", "USDT", 
  "USDC", "BNB", "SOL", "LUNA", "AVAX", "MATIC", 
  "ALGO", "ATOM", "VET", "XTZ", "FIL", "AAVE", 
  "EOS", "THETA", "XMR", "NEO", "MIOTA", "CAKE",
  "COMP", "MKR", "SNX", "GRT", "YFI", "SUSHI", 
  "ZEC", "DASH", "BAT", "WAVES"
];

// APIからデータを取得する関数
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
        return 1 / data.rates[assetId]
      case "CoinGecko":
        const coin = data.find(coin => coin.symbol.toUpperCase() === assetId)
        return coin ? coin.current_price : null
      case "CryptoCompare":
        return data.JPY
      case "Binance":
        return parseFloat(data.price)
      default:
        throw new Error(`Unknown API: ${apiName}`)
    }
  } catch (error) {
    console.error(`Error parsing price for ${assetId} from ${apiName}:`, error)
    return null
  }
}

// 価格データを保存する関数
async function savePrices(prices) {
  try {
    let existingData = []
    try {
      const data = await fs.readFile('prices.json', 'utf-8')
      existingData = JSON.parse(data)
    } catch (error) {
      // ファイルが存在しない場合は無視
    }
    existingData.push(prices)
    await fs.writeFile('prices.json', JSON.stringify(existingData))
  } catch (error) {
    console.error('価格データの保存エラー:', error)
  }
}

// 最新の価格データを取得する関数
async function getLatestPrice(assetType, assetId) {
  try {
    const data = await fs.readFile('prices.json', 'utf-8')
    const prices = JSON.parse(data)
    if (prices && prices.prices && prices.prices[assetType] && prices.prices[assetType][assetId] !== undefined) {
      return {
        asset_type: assetType,
        asset_id: assetId,
        price: prices.prices[assetType][assetId],
        timestamp: prices.timestamp
      }
    } else {
      console.warn(`価格データが見つかりません: ${assetType} ${assetId}`)
      return null
    }
  } catch (error) {
    console.error('価格データの読み込みエラー:', error)
    return null
  }
}

// 価格を取得して保存する関数
async function fetchAndSavePrices() {
  try {
    const prices = await fetchPrices()
    const medianPrices = calculateMedian(prices)
    
    const timestamp = new Date().toISOString()
    const entry = {
      timestamp,
      prices: medianPrices
    }

    await fs.writeFile('prices.json', JSON.stringify(entry, null, 2))
    console.log('Price data saved to file')

    // IPFSにデータを保存
    const result = await ipfs.add(JSON.stringify(entry))
    console.log('IPFS CID:', result.cid.toString())
  } catch (error) {
    console.error('Error fetching and saving price data:', error)
  }
}

async function fetchPrices() {
  const prices = { currency: {}, crypto: {} }

  for (const type in API_URLS) {
    for (const api in API_URLS[type]) {
      if (API_URLS[type][api]) {
        try {
          const response = await axios.get(API_URLS[type][api]);
          prices[type][api] = parseResponse(response.data, api);
          console.log(`Successfully fetched data from ${api}`);
        } catch (error) {
          console.error(`Error fetching data from ${api}:`, error.response ? error.response.data : error.message);
        }
      }
    }
  }

  return prices;
}

function parseResponse(data, api) {
  switch (api) {
    case 'FreecurrencyAPI':
      return data.data
    case 'ExchangeRateAPI':
      return data.conversion_rates
    case 'CurrencyFreaks':
      return data.rates
    case 'CoinGecko':
      return data.reduce((acc, coin) => {
        acc[coin.symbol.toUpperCase()] = coin.current_price;
        return acc;
      }, {});
    case 'CryptoCompare':
      return data
    case 'Binance':
      return data.filter(item => item.symbol.endsWith('JPY'))
        .reduce((acc, item) => {
          acc[item.symbol.replace('JPY', '')] = parseFloat(item.price);
          return acc;
        }, {});
    default:
      console.error(`Unknown API: ${api}`)
      return {}
  }
}

function calculateMedian(prices) {
  const medianPrices = { currency: {}, crypto: {} }

  for (const type in prices) {
    for (const asset in prices[type]) {
      const values = Object.values(prices[type][asset]).filter(value => value !== null && value !== undefined)
      if (values.length > 0) {
        if (values.length === 1) {
          medianPrices[type][asset] = values[0]
        } else {
          values.sort((a, b) => a - b)
          const mid = Math.floor(values.length / 2)
          medianPrices[type][asset] = values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2
        }
      }
    }
  }

  return medianPrices
}

// メイン関数
async function main() {
  await fetchAndSavePrices()
  setInterval(fetchAndSavePrices, 3600000)
}

// エラーハンドリング付きでメイン関数を実行
main().catch(console.error)

export { fetchAndSavePrices, getLatestPrice, CURRENCIES, CRYPTOCURRENCIES }
