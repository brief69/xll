const CURRENCIES = [
  "USD", "EUR", "GBP", "AUD", "CAD", "CHF", 
  "CNY", "HKD", "NZD", "SEK", "KRW", "SGD", 
  "NOK", "MXN", "INR", "RUB", "ZAR", "TRY",
  "BRL", "TWD"
];

const CRYPTOCURRENCIES = [
  "BTC", "ETH", "XRP", "LTC", "BCH", "ADA", 
  "DOT", "LINK", "XLM", "DOGE", "UNI", "USDT", 
  "USDC", "BNB", "SOL", "LUNA", "AVAX", "MATIC", 
  "ALGO", "ATOM", "VET", "XTZ", "FIL", "AAVE", 
  "EOS", "THETA", "XMR", "NEO", "MIOTA", "CAKE",
  "COMP", "MKR", "SNX", "GRT", "YFI", "SUSHI", 
  "ZEC", "DASH", "BAT", "WAVES"
];

// XLLの基準値を設定
const XLL_BASE = 100;

// テーブルを作成する関数
function createTable() {
  const table = document.createElement('table');
  table.id = 'xllTable';
  table.className = 'table table-striped table-hover';
  
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>資産タイプ</th>
      <th>通貨名</th>
      <th>価格 (JPY)</th>
      <th>xll 価値</th>
      <th>最終更新日時</th>
    </tr>
  `;
  
  table.appendChild(thead);
  table.appendChild(document.createElement('tbody'));
  
  return table;
}

// テーブルを更新する関数
function updateTable(data) {
  const tableBody = document.querySelector('#xllTable tbody');
  tableBody.innerHTML = '';
  
  const allCurrencies = [...CURRENCIES, ...CRYPTOCURRENCIES];
  
  allCurrencies.forEach(currency => {
    const item = data.fiat_currencies.find(c => c.asset_id === currency) || 
                 data.cryptocurrencies.find(c => c.asset_id === currency) ||
                 { asset_type: currency.length === 3 ? 'currency' : 'crypto', asset_id: currency };
    
    const row = tableBody.insertRow();
    row.innerHTML = `
      <td>${item.asset_type}</td>
      <td>${item.asset_id}</td>
      <td>${item.price ? item.price.toFixed(2) : 'N/A'}</td>
      <td>${item.price ? (XLL_BASE / item.price).toFixed(8) : 'N/A'}</td>
      <td>${item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}</td>
    `;
  });
}

// 最終更新日時を更新する関数
function updateLastUpdated(timestamp) {
  const lastUpdated = document.getElementById('lastUpdated');
  lastUpdated.textContent = `最終更新: ${new Date(timestamp).toLocaleString()}`;
}

// APIからデータを取得する関数
function fetchData() {
  fetch('/api/prices')
    .then(response => {
      if (!response.ok) {
        throw new Error('ネットワークレスポンスが正常ではありません');
      }
      return response.json();
    })
    .then(data => {
      console.log('Fetched data:', data);
      updateTable(data);
      updateLastUpdated(data.last_updated);
    })
    .catch(error => {
      console.error('データの取得中にエラーが発生しました:', error);
      const tableBody = document.querySelector('#xllTable tbody');
      tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">データの取得中にエラーが発生しました。後でもう一度お試しください。</td></tr>';
    });
}

// 初期化関数
function init() {
  const app = document.getElementById('app');
  
  const container = document.createElement('div');
  container.className = 'container mt-5';
  
  const h1 = document.createElement('h1');
  h1.textContent = 'xll dashboard';
  h1.className = 'mb-4';
  container.appendChild(h1);
  
  container.appendChild(createTable());
  
  const lastUpdated = document.createElement('p');
  lastUpdated.id = 'lastUpdated';
  lastUpdated.className = 'mt-3';
  container.appendChild(lastUpdated);
  
  app.appendChild(container);
  
  fetchData();
  setInterval(fetchData, 60000);
}

// DOMの読み込みが完了したらinitを実行
document.addEventListener('DOMContentLoaded', init);
