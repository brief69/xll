import express from 'express';
import fs from 'fs';
// price_fetcherサービスからgetLatestPrice関数をインポート
import { getLatestPrice } from '../services/price_fetcher.js';

// Expressルーターを作成
const router = express.Router();

// '/api/prices'エンドポイントへのGETリクエストを処理するルートを定義
router.get('/api/prices', async (req, res) => {
  try {
    const data = await fs.readFile('prices.json', 'utf-8')
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
    console.error('価格の取得中にエラーが発生しました:', error);
    res.status(500).json({ error: 'サーバー内部エラー' });
  }
});

// 作成したルーターをエクスポート
export default router;
