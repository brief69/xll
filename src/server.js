import { createLibp2p } from 'libp2p'
import { createHelia } from 'helia'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import KeyResolver from 'key-did-resolver'
import app from './app.js'
import { fetchAndSavePrices } from './services/price_fetcher.js'
import cron from 'node-cron'

// サーバーのポート番号を設定（環境変数またはデフォルト値）
const PORT = process.env.PORT || 3000

// IPFSノード用の変数を宣言
let ipfs

// サーバーを起動する非同期関数
const startServer = async () => {
  try {
    // Libp2pノードを作成
    const libp2p = await createLibp2p({ /* Libp2pオプション */ })
    // IPFSノードを作成
    ipfs = await createHelia({ libp2p })

    // IPFSのピアIDをログに出力
    console.log('IPFS PeerID:', ipfs.libp2p.peerId.toString())

    // Expressアプリケーションを指定されたポートで起動
    app.listen(PORT, () => {
      console.log(`サーバーがポート${PORT}で起動しました`)
    })

    // 初回の価格データを取得して保存
    await fetchAndSavePrices(ipfs)
    
    // 毎時0分��実行するようにスケジュール
    cron.schedule('0 * * * *', () => {
      console.log('Fetching and saving prices...');
      fetchAndSavePrices(ipfs);
    });
  } catch (error) {
    // エラーが発生した場合、ログに出力して終了
    console.error('サーバーの起動に失敗しました:', error)
    process.exit(1)
  }
}

// サーバー起動関数を呼び出し
startServer()

// 最新の価格データを取得する関数
async function getLatestPrice(assetType, assetId) {
  try {
    // IPFSから最新の価格データを取得
    const chunks = []
    for await (const chunk of ipfs.cat('/latest_prices.json')) {
      chunks.push(chunk)
    }
    const data = JSON.parse(Buffer.concat(chunks).toString())
    return data.prices[assetType][assetId]
  } catch (error) {
    console.error('価格データの取得中にエラーが発生しました:', error)
    return null
  }
}

// getLatestPrice関数をエクスポート
export { getLatestPrice }
