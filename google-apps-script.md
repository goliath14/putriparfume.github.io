# Google Apps Script for Putri Parfume

Jika Anda ingin menggunakan Google Sheets sebagai database, gunakan kode berikut di editor Google Apps Script Anda.

## 1. Struktur Google Sheets

Buat Spreadsheet baru dengan dua sheet:

### Sheet: `Katalog`
Kolom (Baris 1):
- `Nama Aroma`
- `Ukuran (ml)`
- `Harga`
- `Stok Ready`

### Sheet: `Pesanan`
Kolom (Baris 1):
- `Data Pembeli`
- `Aroma`
- `Ukuran`
- `Tanggal Pesan`
- `Status Pesanan`
- `Tanggal Estimasi Pengiriman`

---

## 2. Kode Backend (`Code.gs`)

```javascript
/**
 * Google Apps Script Backend for Putri Parfume
 */

function doGet(e) {
  var page = e.parameter.page || 'index';
  return HtmlService.createHtmlOutputFromFile(page)
      .setTitle('Putri Parfume')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Ambil data katalog
function getCatalog() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Katalog');
  var data = sheet.getDataRange().getValues();
  var headers = data.shift();
  
  return data.map(function(row) {
    return {
      name: row[0],
      size: row[1],
      price: row[2],
      stock: row[3]
    };
  });
}

// Simpan pesanan baru
function createOrder(orderData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Pesanan');
  var catalogSheet = ss.getSheetByName('Katalog');
  
  // Tambah ke sheet Pesanan
  sheet.appendRow([
    orderData.buyer_name,
    orderData.aroma,
    orderData.size,
    new Date(),
    'Pending',
    ''
  ]);
  
  // Update Stok di Katalog
  var catalogData = catalogSheet.getDataRange().getValues();
  for (var i = 1; i < catalogData.length; i++) {
    if (catalogData[i][0] == orderData.aroma && catalogData[i][1] == orderData.size) {
      catalogSheet.getRange(i + 1, 4).setValue(catalogData[i][3] - 1);
      break;
    }
  }
  
  return { success: true };
}

// Ambil semua pesanan (untuk Admin)
function getOrders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Pesanan');
  var data = sheet.getDataRange().getValues();
  var headers = data.shift();
  
  return data.map(function(row, index) {
    return {
      id: index + 2, // Baris di sheet
      buyer_name: row[0],
      aroma: row[1],
      size: row[2],
      order_date: row[3],
      status: row[4],
      delivery_date: row[5]
    };
  });
}

// Update status pesanan
function updateOrder(id, status, deliveryDate) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Pesanan');
  sheet.getRange(id, 5).setValue(status);
  sheet.getRange(id, 6).setValue(deliveryDate);
  return { success: true };
}

// Update/Tambah Katalog
function saveCatalogItem(item) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Katalog');
  var data = sheet.getDataRange().getValues();
  
  var found = false;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == item.name && data[i][1] == item.size) {
      sheet.getRange(i + 1, 3).setValue(item.price);
      sheet.getRange(i + 1, 4).setValue(item.stock);
      found = true;
      break;
    }
  }
  
  if (!found) {
    sheet.appendRow([item.name, item.size, item.price, item.stock]);
  }
  
  return { success: true };
}
```

---

## 3. Cara Deploy

1. Buka [Google Sheets](https://sheets.new).
2. Klik menu **Extensions** > **Apps Script**.
3. Hapus kode yang ada, lalu tempelkan kode `Code.gs` di atas.
4. Buat file HTML baru (Klik `+` > `HTML`) beri nama `index` dan `admin`.
5. Klik tombol **Deploy** > **New Deployment**.
6. Pilih type **Web App**.
7. Set "Execute as" ke **Me** dan "Who has access" ke **Anyone**.
8. Klik **Deploy** dan salin URL yang diberikan.
