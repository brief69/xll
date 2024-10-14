// TODO: orbit-db-identity-providerモジュールのインポートエラーを解決する
// 試みた解決策：
// 1. パッケージのバージョンを最新版にアップデート
// 2. ドキュメントを確認してDIDIdentityProviderの正しいインポート方法を確認
// 3. インポート文の修正
// 4. 依存関係の再インストール
// 5. Node.jsのバージョン確認と更新
// 
// 上記の解決策を試しても問題が解決しない場合：
// - orbit-db-identity-providerの開発者に問い合わせる
// - 一時的な回避策として、DIDIdentityProviderを使用しない代替実装を検討する
// - プロジェクトの依存関係全体を見直し、互換性の問題がないか確認する

import { createLibp2p } from 'libp2p'
import { createHelia } from 'helia'
import { createOrbitDB } from '@orbitdb/core'
import Identities, { DIDIdentityProvider } from 'orbit-db-identity-provider'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import KeyResolver from 'key-did-resolver'
import app from './app.js'
import { fetchAndSavePrices } from './services/price_fetcher.js'

const PORT = process.env.PORT || 3000

let db

const startServer = async () => {
  try {
    DIDIdentityProvider.setDIDResolver(KeyResolver.getResolver())

    const seed = new Uint8Array(32)
    const didProvider = new Ed25519Provider(seed)
    const identity = await Identities.createIdentity({ type: 'DID', didProvider })

    const libp2p = await createLibp2p({ /* Libp2pオプション */ })
    const ipfs = await createHelia({ libp2p })

    console.log('IPFS PeerID:', ipfs.libp2p.peerId.toString())

    const orbitdb = await createOrbitDB({ ipfs, identity })

    db = await orbitdb.open('prices', { type: 'eventlog' })

    console.log(db.address.toString())

    app.listen(PORT, () => {
      console.log(`サーバーがポート${PORT}で起動しました`)
    })

    await fetchAndSavePrices(db)
    
    setInterval(() => fetchAndSavePrices(db), 3600000)
  } catch (error) {
    console.error('サーバーの起動に失敗しました:', error)
    process.exit(1)
  }
}

startServer()

async function getLatestPrice(assetType, assetId) {
  const events = await db.iterator({ limit: 1 }).collect()
  if (events.length > 0) {
    const latestEntry = events[0].payload.value
    return latestEntry.prices[assetType][assetId]
  }
  return null
}

export { getLatestPrice }
