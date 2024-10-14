// Expressフレームワークをインポート
import express from 'express';
// price_fetcherサービスからgetLatestPrice関数をインポート
import { getLatestPrice, CURRENCIES, CRYPTOCURRENCIES } from '../services/price_fetcher.js';

// Expressルーターを作成
const router = express.Router();

// '/api/prices'エンドポイントへのGETリクエストを処理するルートを定義
router.get('/api/prices', async (req, res) => {
  try {
    // 法定通貨の最新価格を取得
    const fiatCurrencies = await Promise.all(CURRENCIES.map(async (currency) => {
      return await getLatestPrice('currency', currency);
    }));

    // 暗号通貨の最新価格を取得
    const cryptocurrencies = await Promise.all(CRYPTOCURRENCIES.map(async (crypto) => {
      return await getLatestPrice('crypto', crypto);
    }));

    // 取得した価格データをJSONレスポンスとして送信
    res.json({
      // nullでない法定通貨の価格データを含める
      fiat_currencies: fiatCurrencies.filter(Boolean),
      // nullでない暗号通貨の価格データを含める
      cryptocurrencies: cryptocurrencies.filter(Boolean),
      // 最終更新時刻を現在の日時で設定
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    // エラーが発生した場合はコンソールにエラーを出力
    console.error('価格の取得中にエラーが発生しました:', error);
    // クライアントに500エラーレスポンスを送信
    res.status(500).json({ error: 'サーバー内部エラー' });
  }
});

// 作成したルーターをエクスポート
export default router;
