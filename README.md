# xll: ユニバーサル価値パラメータ

xllは、複数の通貨（法定通貨と暗号通貨）の価値を統一的に表現するシステムです。各資産の価値をxll単位で表し、リアルタイムの更新と比較を可能にします。

## プロジェクトの目的

xllの目的は、異なる通貨間の価値比較を独自に表現し、グローバルな経済活動における価値の表現を統一することです。

## 主な機能

- 複数の通貨（法定通貨と暗号通貨）の価格データの取得
- xll価値の計算と表示
- 1時間以内の最新データの提供
- データが利用できない場合、最後に取得したデータの返却
- RESTful APIによるデータアクセス

## 技術スタック

- バックエンド：Node.js（Express）
- データベース：OrbitDB（IPFS上に構築された分散データベース）
- デプロイメント：IPFSにこれからする
- フロントエンド：JavaScript

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

3. OrbitDBとIPFSをインストールする：

   ```bash
   npm install @orbitdb/core helia
   ```

4. 環境変数を設定する：
   `.env`ファイルを作成し、必要なAPIキーを設定します。

5. OrbitDBとIPFSの初期化コードを`src/server.js`に追加する：

   ```javascript
   import { createLibp2p } from 'libp2p'
   import { createHelia } from 'helia'
   import { createOrbitDB } from '@orbitdb/core'

   const libp2p = await createLibp2p({ /* Libp2p options */ })
   const ipfs = await createHelia({ libp2p })
   const orbitdb = await createOrbitDB({ ipfs })
   ```

6. アプリケーションをローカルで実行する：

   ```bash
   npm start
   ```

7. アプリケーションにアクセスする：
   ブラウザで`http://localhost:3000`を開きます。

## デプロイメント

プロジェクトはVercelを使用してデプロイされています。プロジェクトルートの`vercel.json`ファイルにデプロイメントに必要な設定が含まれています。

## データ更新

データ更新は`price_fetcher.js`によって自動的に行われ、OrbitDBに保存されます。このプロセスは定期的に実行され、最新の価格情報を維持します。

## 貢献ガイドライン

1. このリポジトリをフォークします。
2. 新しい機能ブランチを作成します（`git checkout -b feature/素晴らしい機能`）。
3. 変更をコミットします（`git commit -m '素晴らしい機能を追加'`）。
4. ブランチにプッシュします（`git push origin feature/素晴らしい機能`）。
5. プルリクエストを作成します。

## 連絡先

質問や提案がある場合は、以下の方法でお問い合わせください：

1. GitHub Issueを作成する
2. GitHub Discussionsを使用する

コミュニティのメンバーとしてプロジェクトを改善するための皆様の貢献をお待ちしています。
