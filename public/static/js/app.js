// XLLの基準値を設定
const XLL_BASE = 100;

// テーブルを作成する関数
function createTable() {
  // テーブル要素を作成
  const table = document.createElement('table');
  table.id = 'xllTable';
  
  // テーブルヘッダーを作成
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>資産タイプ</th>
      <th>資産ID</th>
      <th>価格 (JPY)</th>
      <th>xll 価値</th>
      <th>最終更新日時</th>
    </tr>
  `;
  
  // テーブルにヘッダーとボディを追加
  table.appendChild(thead);
  table.appendChild(document.createElement('tbody'));
  
  return table;
}

// テーブルを更新する関数
function updateTable(data) {
  // テーブルボディを取得してクリア
  const tableBody = document.querySelector('#xllTable tbody');
  tableBody.innerHTML = '';
  
  // 行を追加する内部関数
  function addRow(item) {
    const row = tableBody.insertRow();
    row.insertCell(0).textContent = item.asset_type;
    row.insertCell(1).textContent = item.asset_id;
    row.insertCell(2).textContent = item.price ? item.price.toFixed(2) : 'N/A';
    const xllValue = item.price ? XLL_BASE / item.price : 'N/A';
    row.insertCell(3).textContent = typeof xllValue === 'number' ? xllValue.toFixed(8) : xllValue;
    row.insertCell(4).textContent = new Date(item.timestamp).toLocaleString();
  }
  
  // 法定通貨と暗号通貨のデータを追加
  data.fiat_currencies.forEach(addRow);
  data.cryptocurrencies.forEach(addRow);
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
      // データを取得したらテーブルと最終更新日時を更新
      updateTable(data);
      updateLastUpdated(data.last_updated);
    })
    .catch(error => {
      // エラーが発生した場合、コンソールにエラーを表示し、テーブルにエラーメッセージを表示
      console.error('データの取得中にエラーが発生しました:', error);
      const tableBody = document.querySelector('#xllTable tbody');
      tableBody.innerHTML = '<tr><td colspan="5">データの取得中にエラーが発生しました。後でもう一度お試しください。</td></tr>';
    });
}

// 初期化関数
function init() {
  const app = document.getElementById('app');
  
  // タイトルを追加
  const h1 = document.createElement('h1');
  h1.textContent = 'リアルタイムxllパラメータ';
  app.appendChild(h1);
  
  // テーブルを追加
  app.appendChild(createTable());
  
  // 最終更新日時の要素を追加
  const lastUpdated = document.createElement('p');
  lastUpdated.id = 'lastUpdated';
  app.appendChild(lastUpdated);
  
  // 初回データ取得
  fetchData();
  // 1分ごとにデータを更新
  setInterval(fetchData, 60000);
}

// DOMの読み込みが完了したら初期化関数を実行
document.addEventListener('DOMContentLoaded', init);
