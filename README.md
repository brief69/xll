# xll: ユニバーサル価値パラメータ

xllは、複数の通貨（法定通貨と暗号通貨）の価値を統一的に表現するシステムです。各資産の価値をxll単位で表し、特定の期間での更新と比較を行います。

## プロジェクトの目的

xllの目的は、異なる通貨による価値の一意的な価値比較表現です。

## 主な機能

- 複数の通貨（法定通貨と暗号通貨）の価格データの取得
- xll価値の計算と表示
- 1時間以内の最新データの提供
- データが利用できない場合、最後に取得したデータの返却
- RESTful APIによるデータアクセス

## 技術スタック

- バックエンド：Node.js（Express）
- データベース：IPFS
- デプロイメント：IPFS
- フロントエンド：JavaScript

## プロジェクト構造

src/
├── server.js # メインサーバーファイル
├── app.js # Expressアプリケーション設定
├── routes/
│ └── index.js # APIルート定義
├── services/
│ └── price_fetcher.js # 価格データ取得サービス
public/
└── static/
└── js/
└── app.js # フロントエンドJavaScript

## 始め方

1. リポジトリをクローンする：

   ```bash
   git clone https://github.com/brief69/xll.git
   cd xll
   ```

2. 必要なパッケージをインストールする：

   ```bash
   npm install
   ```

3. IPFSをインストールする：

   ```bash
   npm install ipfs-http-client
   ```

4. 環境変数を設定する：
   `.env`ファイルを作成し、必要なAPIキーを設定します。例：

   ```bash
   FREECURRENCYAPI_API_KEY=your_api_key_here
   EXCHANGERATE_API_KEY=your_api_key_here
   CURRENCYFREAKS_API_KEY=your_api_key_here
   CRYPTOCOMPARE_API_KEY=your_api_key_here
   COINGECKO_API_KEY=your_api_key_here
   BINANCE_API_KEY=your_api_key_here
   ```

   詳細は、.env.exampleを参照してください。

5. IPFSデーモンを起動する：

   ```bash
   ipfs daemon
   ```

6. 別のターミナルでアプリケーションを実行する：

   ```bash
   npm start
   ```

IPFSのピア接続を確認するには：

   ```bash
   ipfs swarm peers
   ```

7.アプリケーションにアクセスする：
   ブラウザで`http://localhost:3000`を開きます。

## デプロイメント

IPFSにデプロイします。

## データ更新

データ更新は`price_fetcher.js`によって自動的に行われ、IPFSに保存されます。このプロセスは定期的に実行され、最新の価格情報を維持します。

## 貢献ガイドライン

1. このリポジトリをフォークします。
2. 新しい機能ブランチを作成します（`git checkout -b feature/素晴らしい機能`）。
3. 変更をコミットします（`git commit -m '素晴らしい機能を追加'`）。
4. ブランチにプッシュします（`git push origin feature/素晴らしい機能`）。
5. プルリクエストを作成します。

## 連絡先

質問や提案がある場合は、GitHub Issueをたてるか、GitHub Discussionsしてください。
