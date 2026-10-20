// Utility for Exporting Monthly Financial Reports to Excel (.xls) compatible with Microsoft Excel and Google Sheets

export function exportMonthToExcel({
  userName,
  monthLabel,
  transactions,
  categories,
  summary,
  currency = 'IDR',
  exchangeRate = 2750,
  isChinaPeriod = false
}) {
  const safeFileName = `Laporan_Keuangan_${userName}_${monthLabel.replace(/[^a-zA-Z0-9]/g, '_')}.xls`;

  let rowsHtml = '';
  transactions.forEach((tx, idx) => {
    const cat = categories.find(c => c.id === tx.category)?.name || tx.category;
    const isIncome = tx.type === 'Masuk';
    const typeLabel = isIncome ? 'Pemasukan' : 'Pengeluaran';
    const amountStr = isChinaPeriod
      ? `¥${tx.amountCny.toFixed(2)} (Rp ${Math.round(tx.amountIdr).toLocaleString('id-ID')})`
      : `Rp ${Math.round(tx.amountIdr).toLocaleString('id-ID')}`;

    rowsHtml += `
      <tr>
        <td style="text-align: center; mso-number-format:'\\@';">${idx + 1}</td>
        <td style="mso-number-format:'yyyy\\-mm\\-dd'; text-align: center;">${tx.date}</td>
        <td>${tx.title || '-'}</td>
        <td>${cat}</td>
        <td style="text-align: center; font-weight: bold; color: ${isIncome ? '#059669' : '#e11d48'};">${typeLabel}</td>
        <td style="text-align: right; font-weight: bold;">${amountStr}</td>
        <td>${tx.paymentMethod || '-'}</td>
        <td>${tx.notes || '-'}</td>
      </tr>
    `;
  });

  const excelTemplate = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>${userName} - ${monthLabel}</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      <style>
        body { font-family: Calibri, sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        th { background-color: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; padding: 8px 12px; font-weight: bold; }
        td { border: 1px solid #e2e8f0; padding: 6px 10px; }
        .header-title { font-size: 16pt; font-weight: bold; color: #0f172a; }
        .meta-text { font-size: 11pt; color: #475569; }
        .summary-box { background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header-title">LAPORAN KEUANGAN BULANAN - ${userName.toUpperCase()}</div>
      <div class="meta-text">Periode: ${monthLabel} | Lokasi: ${isChinaPeriod ? 'Nanning, China (Yuan ¥ & IDR)' : 'Indonesia (Rupiah Rp)'}</div>
      <div class="meta-text">Dicetak otomatis dari aplikasi Pocket Duo</div>
      <br/>

      <table>
        <tr style="background-color: #e2e8f0;">
          <td colspan="4" style="font-weight: bold;">RINGKASAN KEUANGAN BULAN INI</td>
        </tr>
        <tr>
          <td style="width: 200px;">Total Saldo Masuk:</td>
          <td style="font-weight: bold; color: #059669;">${summary.totalInflow}</td>
          <td style="width: 200px;">Total Pengeluaran:</td>
          <td style="font-weight: bold; color: #e11d48;">${summary.totalOutflow}</td>
        </tr>
        <tr>
          <td>Sisa Saldo Akhir:</td>
          <td style="font-weight: bold; color: #0284c7;">${summary.netBalance}</td>
          <td>Cadangan Aman:</td>
          <td>${summary.reserve}</td>
        </tr>
      </table>
      <br/>

      <table>
        <thead>
          <tr>
            <th style="width: 40px;">No</th>
            <th style="width: 100px;">Tanggal</th>
            <th style="width: 220px;">Keterangan</th>
            <th style="width: 150px;">Kategori</th>
            <th style="width: 110px;">Jenis</th>
            <th style="width: 160px;">Nominal</th>
            <th style="width: 140px;">Metode Bayar</th>
            <th style="width: 200px;">Catatan</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="8" style="text-align: center; color: #64748b;">Belum ada transaksi di bulan ini.</td></tr>'}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
