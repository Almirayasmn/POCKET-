// Utility for Exporting Monthly Financial Reports to Excel (.xls) compatible with Microsoft Excel and Google Sheets

export function exportMonthToExcel({
  userName,
  monthLabel,
  transactions = [],
  categories = [],
  categorySpending = {},
  summary = {},
  currency = 'IDR',
  exchangeRate = 2750,
  isChinaPeriod = false
}) {
  const safeFileName = `Laporan_Keuangan_${userName}_${monthLabel.replace(/[^a-zA-Z0-9]/g, '_')}.xls`;
  const exportDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 1. Generate Transactions Rows (with clean gridlines and subtle pastel alternating zebra rows)
  let txRowsHtml = '';
  transactions.forEach((tx, idx) => {
    const cat = categories.find(c => c.id === tx.category)?.name || tx.category || '-';
    const isIncome = tx.type === 'Masuk';
    const typeLabel = isIncome ? 'Pemasukan' : 'Pengeluaran';
    const amountStr = isChinaPeriod
      ? `¥${(tx.amountCny || 0).toFixed(2)} (Rp ${Math.round(tx.amountIdr || 0).toLocaleString('id-ID')})`
      : `Rp ${Math.round(tx.amountIdr || 0).toLocaleString('id-ID')}`;
    const rowBg = idx % 2 === 0 ? '#ffffff' : '#f0f9ff'; // alternating soft pastel blue

    txRowsHtml += `
      <tr style="background-color: ${rowBg};">
        <td style="text-align: center; border: 1px solid #94a3b8; mso-number-format:'\\@';">${idx + 1}</td>
        <td style="text-align: center; border: 1px solid #94a3b8; mso-number-format:'yyyy\\-mm\\-dd';">${tx.date || '-'}</td>
        <td style="border: 1px solid #94a3b8;">${tx.title || '-'}</td>
        <td style="border: 1px solid #94a3b8;">${cat}</td>
        <td style="text-align: center; border: 1px solid #94a3b8; font-weight: bold; color: ${isIncome ? '#047857' : '#db2777'};">
          ${typeLabel}
        </td>
        <td style="text-align: right; border: 1px solid #94a3b8; font-weight: bold; color: ${isIncome ? '#047857' : '#be185d'};">
          ${amountStr}
        </td>
        <td style="border: 1px solid #94a3b8;">${tx.paymentMethod || '-'}</td>
        <td style="border: 1px solid #94a3b8;">${tx.notes || '-'}</td>
      </tr>
    `;
  });

  // 2. Generate Category Budget vs Actual Evaluation Rows (with pastel pink zebra rows and crisp gridlines)
  let catRowsHtml = '';
  let grandTotalBudget = 0;
  let grandTotalSpent = 0;

  categories.forEach((cat, idx) => {
    const sp = categorySpending[cat.id] || { totalIdr: 0, totalCny: 0, count: 0 };
    const budgetVal = isChinaPeriod ? (cat.budgetCny || 0) : (cat.budgetIdr || 0);
    const spentVal = isChinaPeriod ? (sp.totalCny || 0) : (sp.totalIdr || 0);
    const remainingVal = budgetVal - spentVal;
    const percentUsed = budgetVal > 0 ? Math.round((spentVal / budgetVal) * 100) : (spentVal > 0 ? 100 : 0);

    grandTotalBudget += budgetVal;
    grandTotalSpent += spentVal;

    const isOver = budgetVal > 0 && spentVal > budgetVal;
    const isSaved = budgetVal > 0 && spentVal < budgetVal;
    const statusLabel = isOver ? 'OVER BUDGET' : (isSaved ? 'HEMAT (SISA)' : (budgetVal > 0 ? 'HABIS PAS' : 'TANPA PAGU'));
    const statusColor = isOver ? '#b91c1c' : (isSaved ? '#047857' : '#475569');
    const rowBg = idx % 2 === 0 ? '#ffffff' : '#fdf2f8'; // alternating soft pastel pink

    const formatVal = (v) => isChinaPeriod ? `¥${v.toFixed(2)}` : `Rp ${Math.round(v).toLocaleString('id-ID')}`;

    catRowsHtml += `
      <tr style="background-color: ${rowBg};">
        <td style="text-align: center; border: 1px solid #94a3b8;">${idx + 1}</td>
        <td style="font-weight: bold; border: 1px solid #94a3b8; color: #831843;">${cat.name}</td>
        <td style="text-align: right; font-weight: bold; border: 1px solid #94a3b8; color: #0369a1;">${formatVal(budgetVal)}</td>
        <td style="text-align: right; font-weight: bold; border: 1px solid #94a3b8; color: #be185d;">${formatVal(spentVal)}</td>
        <td style="text-align: right; font-weight: bold; border: 1px solid #94a3b8; color: ${remainingVal >= 0 ? '#047857' : '#b91c1c'};">
          ${formatVal(remainingVal)}
        </td>
        <td style="text-align: center; border: 1px solid #94a3b8; font-weight: bold;">${percentUsed}%</td>
        <td style="text-align: center; font-weight: bold; border: 1px solid #94a3b8; color: ${statusColor};">${statusLabel}</td>
      </tr>
    `;
  });

  const grandRemaining = grandTotalBudget - grandTotalSpent;
  const formatGrand = (v) => isChinaPeriod ? `¥${v.toFixed(2)}` : `Rp ${Math.round(v).toLocaleString('id-ID')}`;

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
        body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 10pt; color: #1e293b; background-color: #ffffff; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 22px; }
        th { border: 1px solid #64748b; padding: 8px 10px; font-weight: bold; text-align: center; }
        td { border: 1px solid #94a3b8; padding: 7px 10px; }
      </style>
    </head>
    <body>
      <!-- HEADER BANNER DENGAN KOMBINASI PINK PASTEL & BIRU PASTEL -->
      <table style="border: 2px solid #f472b6; margin-bottom: 14px; background-color: #fdf2f8;">
        <tr>
          <td style="padding: 14px 18px; border: none;">
            <div style="font-size: 16pt; font-weight: bold; color: #db2777;">
              🌸 POCKET DUO · LAPORAN KEUANGAN BULANAN
            </div>
            <div style="font-size: 13pt; font-weight: bold; color: #0284c7; margin-top: 4px;">
              ${userName.toUpperCase()} · PERIODE ${monthLabel.toUpperCase()}
            </div>
            <div style="font-size: 9.5pt; color: #64748b; margin-top: 4px;">
              Mata Uang: <strong>${currency}</strong> | Dicetak pada: <strong>${exportDate}</strong>
            </div>
          </td>
        </tr>
      </table>

      <!-- KOTAK CATATAN LOGIKA ALIRAN KAS (ROLLING BALANCE) -->
      <table style="border: 1.5px solid #38bdf8; margin-bottom: 18px; background-color: #f0f9ff;">
        <tr>
          <td style="padding: 10px 14px; font-size: 9.5pt; color: #0369a1; border: none; line-height: 1.5;">
            💡 <strong>LOGIKA PERGANTIAN BULAN (ROLLING BALANCE):</strong><br/>
            • Sisa saldo kas pada akhir bulan ini <strong>TIDAK HILANG ATAU DIRESET</strong>. Saldo kas akhir otomatis mengalir menjadi <strong>Saldo Awal Kas</strong> di bulan berikutnya.<br/>
            • Jika ada pos belanja yang tidak habis terpakai, sisa uangnya tetap tersimpan utuh di saldo kas kamu (otomatis menjadi tabungan/modal tambahan bulan depan).
          </td>
        </tr>
      </table>

      <!-- 1. RINGKASAN ARUS KAS & ALOKASI DANA (TEMA BIRU PASTEL & PINK PASTEL) -->
      <table>
        <thead>
          <tr>
            <th colspan="4" style="background-color: #bae6fd; color: #0369a1; border: 1.5px solid #0284c7; text-align: left; font-size: 11pt; padding: 9px 12px;">
              1. RINGKASAN ARUS KAS & ALOKASI DANA (${monthLabel.toUpperCase()})
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="width: 220px; font-weight: bold; background-color: #fdf2f8; color: #9d174d; border: 1px solid #94a3b8;">Saldo Awal Bulan:</td>
            <td style="width: 200px; font-weight: bold; color: #0284c7; border: 1px solid #94a3b8;">${summary.startBalance || '-'}</td>
            <td style="width: 240px; font-weight: bold; background-color: #f0f9ff; color: #0369a1; border: 1px solid #94a3b8;">Total Alokasi Pagu Pos:</td>
            <td style="width: 200px; font-weight: bold; color: #ea580c; border: 1px solid #94a3b8;">${summary.totalBudget || '-'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background-color: #fdf2f8; color: #9d174d; border: 1px solid #94a3b8;">Pemasukan Masuk Bulan Ini:</td>
            <td style="font-weight: bold; color: #047857; border: 1px solid #94a3b8;">${summary.monthIncome || '-'}</td>
            <td style="font-weight: bold; background-color: #f0f9ff; color: #0369a1; border: 1px solid #94a3b8;">Total Pengeluaran Riil:</td>
            <td style="font-weight: bold; color: #dc2626; border: 1px solid #94a3b8;">${summary.totalOutflow || '-'}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="font-weight: bold; border: 1px solid #94a3b8; color: #0f172a;">TOTAL DANA TERSEDIA:</td>
            <td style="font-weight: bold; border: 1px solid #94a3b8; color: #0f172a; font-size: 11pt;">${summary.totalInflow || '-'}</td>
            <td style="font-weight: bold; border: 1px solid #94a3b8; color: #047857;">SISA PAGU POS BELANJA (HEMAT):</td>
            <td style="font-weight: bold; border: 1px solid #94a3b8; color: #047857; font-size: 11pt;">${summary.remainingBudget || '-'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background-color: #e0f2fe; color: #0369a1; border: 2px solid #0284c7;">
              SISA SALDO KAS AKHIR BULAN:
            </td>
            <td style="font-weight: bold; background-color: #e0f2fe; color: #0369a1; font-size: 12pt; border: 2px solid #0284c7;">
              ${summary.netBalance || '-'}
            </td>
            <td style="font-weight: bold; background-color: #fce7f3; color: #9d174d; border: 2px solid #ec4899;">
              SIMPANAN BERSIH (TABUNGAN AMAN):
            </td>
            <td style="font-weight: bold; background-color: #fce7f3; color: #9d174d; font-size: 12pt; border: 2px solid #ec4899;">
              ${summary.plannedSavings || '-'}
            </td>
          </tr>
          <tr>
            <td colspan="4" style="font-size: 9pt; color: #475569; font-style: italic; background-color: #fafafa; border: 1px solid #94a3b8;">
              * Saldo Kas Akhir (${summary.netBalance || '-'}) adalah kas riil yang otomatis terbawa menjadi Saldo Awal di bulan berikutnya.
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 2. EVALUASI TARGET PAGU VS REALISASI PER POS (TEMA PINK PASTEL CANTIK DENGAN GARIS-GARIS RAPI) -->
      <table>
        <thead>
          <tr>
            <th colspan="7" style="background-color: #fbcfe8; color: #831843; border: 1.5px solid #ec4899; text-align: left; font-size: 11pt; padding: 9px 12px;">
              2. EVALUASI TARGET PAGU ANGGARAN VS REALISASI PER POS PENGELUARAN
            </th>
          </tr>
          <tr style="background-color: #fce7f3; color: #831843;">
            <th style="width: 40px; border: 1px solid #94a3b8;">No</th>
            <th style="width: 220px; border: 1px solid #94a3b8; text-align: left;">Nama Pos Pengeluaran</th>
            <th style="width: 150px; border: 1px solid #94a3b8; text-align: right;">Target Pagu</th>
            <th style="width: 150px; border: 1px solid #94a3b8; text-align: right;">Realisasi Terpakai</th>
            <th style="width: 150px; border: 1px solid #94a3b8; text-align: right;">Sisa Pagu (Hemat)</th>
            <th style="width: 90px; border: 1px solid #94a3b8;">% Terpakai</th>
            <th style="width: 130px; border: 1px solid #94a3b8;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${catRowsHtml}
          <tr style="background-color: #fce7f3; font-weight: bold; border-top: 2px solid #ec4899; border-bottom: 2px solid #ec4899;">
            <td colspan="2" style="text-align: right; border: 1px solid #94a3b8; color: #831843;">TOTAL EVALUASI PAGU:</td>
            <td style="text-align: right; border: 1px solid #94a3b8; color: #0369a1;">${formatGrand(grandTotalBudget)}</td>
            <td style="text-align: right; border: 1px solid #94a3b8; color: #be185d;">${formatGrand(grandTotalSpent)}</td>
            <td style="text-align: right; border: 1px solid #94a3b8; color: ${grandRemaining >= 0 ? '#047857' : '#b91c1c'};">${formatGrand(grandRemaining)}</td>
            <td style="text-align: center; border: 1px solid #94a3b8;">${grandTotalBudget > 0 ? Math.round((grandTotalSpent / grandTotalBudget) * 100) : 0}%</td>
            <td style="text-align: center; border: 1px solid #94a3b8; color: ${grandRemaining >= 0 ? '#047857' : '#b91c1c'};">
              ${grandRemaining >= 0 ? 'HEMAT' : 'OVER BUDGET'}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 3. BUKU TRANSAKSI DETAIL (TEMA BIRU PASTEL SEGAR DENGAN GARIS-GARIS RAPI) -->
      <table>
        <thead>
          <tr>
            <th colspan="8" style="background-color: #bae6fd; color: #0369a1; border: 1.5px solid #0284c7; text-align: left; font-size: 11pt; padding: 9px 12px;">
              3. BUKU TRANSAKSI RINCI (LOG AKTIVITAS KEUANGAN)
            </th>
          </tr>
          <tr style="background-color: #e0f2fe; color: #0369a1;">
            <th style="width: 40px; border: 1px solid #94a3b8;">No</th>
            <th style="width: 100px; border: 1px solid #94a3b8;">Tanggal</th>
            <th style="width: 220px; border: 1px solid #94a3b8; text-align: left;">Keterangan</th>
            <th style="width: 150px; border: 1px solid #94a3b8; text-align: left;">Pos Kategori</th>
            <th style="width: 100px; border: 1px solid #94a3b8;">Tipe</th>
            <th style="width: 160px; border: 1px solid #94a3b8; text-align: right;">Nominal</th>
            <th style="width: 130px; border: 1px solid #94a3b8;">Akun / Metode</th>
            <th style="width: 200px; border: 1px solid #94a3b8; text-align: left;">Catatan</th>
          </tr>
        </thead>
        <tbody>
          ${txRowsHtml || '<tr><td colspan="8" style="text-align: center; color: #64748b; padding: 12px; border: 1px solid #94a3b8;">Belum ada transaksi tercatat di bulan ini.</td></tr>'}
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


