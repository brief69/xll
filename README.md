# xll: Universal Value Parameter

xllは、あらゆる通貨（法定通貨、仮想通貨）、株式、コモディティ、商品などの価値を一貫して表現するパラメータです。

**ご注意：このプロジェクトは、冗談半分のフィンテックです。金融の世界に一石を投じるようなものではなく、せいぜい経済ニュースを読みながら軽く笑えるくらいのものです。本物の金融に関しては、笑顔の少ない本物の金融アドバイザーに相談しましょう。**

## プロジェクトの目的

xllの目的は、異なる資産タイプ間の価値比較を一意的に表現し、グローバルな経済活動における価値の表現を統一することです。

## 主な機能

- リアルタイムの価格データ取得
- 複数のAPIソースからのデータ集約
- 異常値検出
- 履歴データの保存と分析
- RESTful APIによるデータアクセス

## 技術スタック

- Python 3.12+
- FastAPI
- SQLAlchemy
- aiohttp
- SQLite (開発用)

## はじめ方

1. リポジトリをクローン:
   ```
   git clone https://github.com/your-username/xll.git
   cd xll
   ```

2. 仮想環境を作成しアクティベート:
   ```
   python3 -m venv venv
   source venv/bin/activate
   ```

3. 依存パッケージをインストール:
   ```
   pip install -r requirements.txt
   ```

4. 環境変数を設定:
   `.env`ファイルを作成し、必要なAPI keyを設定してください。

5. アプリケーションを実行:
   ```
   uvicorn app.main:app --reload
   ```

## 貢献方法

1. このリポジトリをフォークしてください。
2. 新しい機能ブランチを作成してください (`git checkout -b feature/AmazingFeature`)。
3. 変更をコミットしてください (`git commit -m 'Add some AmazingFeature'`)。
4. ブランチにプッシュしてください (`git push origin feature/AmazingFeature`)。
5. プルリクエストを作成してください。

## お問い合わせ

質問や提案がある場合は、以下の方法でお問い合わせください：

1. GitHubのIssueを作成する
2. GitHubのDiscussionsを使用する

コミュニティの一員として、プロジェクトの改善にご協力いただけることを楽しみにしています。
