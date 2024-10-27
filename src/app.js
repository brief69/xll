import express from 'express'
import cors from 'cors'
import { fetchAndSavePrices, getLatestPrice } from './services/price_fetcher.js'
import cron from 'node-cron'
import router from './routes/index.js'
import fs from 'fs'

// Expressアプリケーションを作成
const app = express();

// CORSミドルウェアを使用（クロスオリジンリクエストを許可）
app.use(cors());
// JSONボディパーサーミドルウェアを使用（リクエストボディをJSONとして解析）
app.use(express.json());

// ルートパス（'/'）へのGETリクエストを処理
app.get('/', (req, res) => {
  // ウェルカムメッセージとバージョン情報をJSON形式で返す
  res.json({ message: "Welcome to XLL Data Service. Visit /static/index.html for the dashboard.", version: "1.0.0" });
});

// 静的ファイルを提供する
app.use('/static', express.static('public/static'));

// 毎時0分に実行するようにスケジュール
cron.schedule('0 * * * *', () => {
  console.log('Fetching and saving prices...');
  fetchAndSavePrices();
});

// アプリケーションをエクスポート（他のファイルで使用できるようにする）
export default app;

app.get('/static/index.html', (req, res) => {
  res.sendFile('index.html', { root: 'public/static' });
});

app.get('/api/prices', async (req, res) => {
  try {
    const data = await fs.promises.readFile('prices.json', 'utf-8')
    const prices = JSON.parse(data)
    
    res.json({
      fiat_currencies: Object.entries(prices.prices.currency || {}).map(([id, price]) => ({
        asset_type: 'currency',
        asset_id: id,
        price: price,
        timestamp: prices.timestamp
      })),
      cryptocurrencies: Object.entries(prices.prices.crypto || {}).map(([id, price]) => ({
        asset_type: 'crypto',
        asset_id: id,
        price: price,
        timestamp: prices.timestamp
      })),
      last_updated: prices.timestamp
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use(router);
