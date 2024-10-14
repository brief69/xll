// 必要なモジュールをインポート
import express from 'express';  // Expressフレームワークをインポート
import cors from 'cors';  // CORSミドルウェアをインポート
import { fetchAndSavePrices, getLatestPrice, CURRENCIES, CRYPTOCURRENCIES } from './services/price_fetcher.js';  // 価格取得・保存関数をインポート

// Expressアプリケーションを作成
const app = express();

// CORSミドルウェアを使用（クロスオリジンリクエストを許可）
app.use(cors());
// JSONボディパーサーミドルウェアを使用（リクエストボディをJSONとして解析）
app.use(express.json());

// ルートパス（'/'）へのGETリクエストを処理
app.get('/', (req, res) => {ぜ
  // ウェルカムメッセージとバージョン情報をJSON形式で返す
  res.json({ message: "Welcome to XLL Data Service. Visit /static/index.html for the dashboard.", version: "1.0.0" });
});

// ここに他のルートを追加

// 静的ファイルを提供する
app.use('/static', express.static('public/static'));

// 1時間（3600000ミリ秒）ごとに価格を更新する関数を実行
setInterval(fetchAndSavePrices, 3600000);

// アプリケーションをエクスポート（他のファイルで使用できるようにする）
export default app;
