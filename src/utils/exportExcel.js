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

  // 1. Generate Transactions Rows
  let txRowsHtml = '';
  transactions.forEach((tx, idx) => {
    const cat = categories.find(c => c.id === tx.category)?.name || tx.category || '-';
    const isIncome = tx.type === 'Masuk';
    const typeLabel = isIncome ? 'Pemasukan' : 'Pengeluaran';
    const amountStr = isChinaPeriod
      ? `¥${(tx.amountCny || 0).toFixed(2)} (Rp ${Math.round(tx.amountIdr || 0).toLocaleString('id-ID')})`
      : `Rp ${Math.round(tx.amountIdr || 0).toLocaleString('id-ID')}`;

    txRowsHtml += `
      <tr>
        <td style="text-align: center; mso-number-format:'\\@';">${idx + 1}</td>
        <td style="mso-number-format:'yyyy\\-mm\\-dd'; text-align: center;">${tx.date || '-'}</td>
        <td>${tx.title || '-'}</td>
        <td>${cat}</td>
        <td style="text-align: center; font-weight: bold; color: ${isIncome ? '#059669' : '#e11d48'};">${typeLabel}</td>
        <td style="text-align: right; font-weight: bold;">${amountStr}</td>
        <td>${tx.paymentMethod || '-'}</td>
        <td>${tx.notes || '-'}</td>
      </tr>
    `;
  });

  // 2. Generate Category Budget vs Actual Evaluation Rows
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

    const formatVal = (v) => isChinaPeriod ? `¥${v.toFixed(2)}` : `Rp ${Math.round(v).toLocaleString('id-ID')}`;

    catRowsHtml += `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td style="font-weight: bold;">${cat.name}</td>
        <td style="text-align: right; font-weight: bold;">${formatVal(budgetVal)}</td>
        <td style="text-align: right; color: #dc2626; font-weight: bold;">${formatVal(spentVal)}</td>
        <td style="text-align: right; color: ${remainingVal >= 0 ? '#047857' : '#b91c1c'}; font-weight: bold;">
          ${formatVal(remainingVal)}
        </td>
        <td style="text-align: center;">${percentUsed}%</td>
        <td style="text-align: center; font-weight: bold; color: ${statusColor};">${statusLabel}</td>
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
        body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 10pt; color: #1e293b; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th { background-color: #0284c7; color: #ffffff; border: 1px solid #0369a1; padding: 7px 10px; font-weight: bold; text-align: center; }
        td { border: 1px solid #cbd5e1; padding: 6px 9px; }
        .section-header { background-color: #f1f5f9; font-weight: bold; font-size: 11pt; color: #0f172a; padding: 8px 10px; }
        .title { font-size: 16pt; font-weight: bold; color: #0369a1; }
        .sub { font-size: 10pt; color: #64748b; margin-bottom: 12px; }
        .note-box { background-color: #ecfdf5; border: 1px dashed #10b981; padding: 8px 12px; font-size: 9.5pt; color: #065f46; margin-bottom: 14px; }
      </style>
    </head>
    <body>
      <div class="title">LAPORAN KEUANGAN BULANAN - ${userName.toUpperCase()}</div>
      <div class="sub">Periode: <strong>${monthLabel}</strong> | Mata Uang: <strong>${currency}</strong> | Dicetak pada: ${exportDate}</div>

      <div class="note-box">
        💡 <strong>LOGIKA PERGANTIAN BULAN (ROLLING BALANCE):</strong><br/>
        • Sisa saldo kas pada akhir bulan ini <strong>TIDAK AKAN HILANG ATAU DIRESET</strong>. Saldo kas akhir otomatis mengalir menjadi <strong>Saldo Awal Kas</strong> di bulan berikutnya.<br/>
        • Jika ada pos pengeluaran yang tidak habis terpakai, sisa uangnya tetap tersimpan utuh di saldo kas kamu (otomatis menjadi tabungan/modal tambahan bulan depan).
      </div>

      <!-- 1. RINGKASAN ALOKASI DAN SALDO KAS -->
      <table>
        <thead>
          <tr>
            <th colspan="4" style="background-color: #0f172a; text-align: left; font-size: 11pt;">
              1. RINGKASAN ARUS KAS & ALOKASI DANA (${monthLabel.toUpperCase()})
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="width: 220px; font-weight: bold; background-color: #f8fafc;">Saldo Awal Bulan:</td>
            <td style="width: 200px; font-weight: bold; color: #0284c7;">${summary.startBalance || '-'}</td>
            <td style="width: 240px; font-weight: bold; background-color: #f8fafc;">Total Alokasi Pagu Pos:</td>
            <td style="width: 200px; font-weight: bold; color: #ea580c;">${summary.totalBudget || '-'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background-color: #f8fafc;">Pemasukan Masuk Bulan Ini:</td>
            <td style="font-weight: bold; color: #059669;">${summary.monthIncome || '-'}</td>
            <td style="font-weight: bold; background-color: #f8fafc;">Total Pengeluaran Riil:</td>
            <td style="font-weight: bold; color: #dc2626;">${summary.totalOutflow || '-'}</td>
          </tr>
          <tr style="background-color: #f1f5f9;">
            <td style="font-weight: bold;">TOTAL DANA TERSEDIA:</td>
            <td style="font-weight: bold; color: #0f172a; font-size: 11pt;">${summary.totalInflow || '-'}</td>
            <td style="font-weight: bold; color: #047857;">SISA PAGU POS BELANJA (HEMAT):</td>
            <td style="font-weight: bold; color: #047857; font-size: 11pt;">${summary.remainingBudget || '-'}</td>
          </tr>
          <tr style="background-color: #e0f2fe;">
            <td style="font-weight: bold; color: #0369a1;">SISA SALDO KAS AKHIR BULAN:</td>
            <td style="font-weight: bold; color: #0369a1; font-size: 12pt;">${summary.netBalance || '-'}</td>
            <td style="font-weight: bold; color: #047857;">SIMPANAN BERSIH (TABUNGAN AMAN):</td>
            <td style="font-weight: bold; color: #047857; font-size: 12pt;">${summary.plannedSavings || '-'}</td>
          </tr>
          <tr>
            <td colspan="4" style="font-size: 9pt; color: #64748b; font-style: italic; background-color: #fafafa;">
              * Saldo Akhir Kas (${summary.netBalance || '-'}) adalah uang riil yang akan langsung terbawa sebagai Saldo Awal di bulan berikutnya.
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 2. EVALUASI TARGET PAGU VS REALISASI PER POS -->
      <table>
        <thead>
          <tr>
            <th colspan="7" style="background-color: #0369a1; text-align: left; font-size: 11pt;">
              2. EVALUASI PAGU ANGGARAN VS REALISASI PER POS PENGELUARAN
            </th>
          </tr>
          <tr style="background-color: #f8fafc; color: #1e293b;">
            <th style="width: 40px; background-color: #e2e8f0; color: #1e293b;">No</th>
            <th style="width: 220px; background-color: #e2e8f0; color: #1e293b; text-align: left;">Nama Pos Pengeluaran</th>
            <th style="width: 150px; background-color: #e2e8f0; color: #1e293b; text-align: right;">Target Pagu</th>
            <th style="width: 150px; background-color: #e2e8f0; color: #1e293b; text-align: right;">Realisasi Terpakai</th>
            <th style="width: 150px; background-color: #e2e8f0; color: #1e293b; text-align: right;">Sisa Pagu (Hemat)</th>
            <th style="width: 90px; background-color: #e2e8f0; color: #1e293b;">% Terpakai</th>
            <th style="width: 130px; background-color: #e2e8f0; color: #1e293b;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${catRowsHtml}
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td colspan="2" style="text-align: right;">TOTAL:</td>
            <td style="text-align: right; color: #0f172a;">${formatGrand(grandTotalBudget)}</td>
            <td style="text-align: right; color: #dc2626;">${formatGrand(grandTotalSpent)}</td>
            <td style="text-align: right; color: ${grandRemaining >= 0 ? '#047857' : '#b91c1c'};">${formatGrand(grandRemaining)}</td>
            <td style="text-align: center;">${grandTotalBudget > 0 ? Math.round((grandTotalSpent / grandTotalBudget) * 100) : 0}%</td>
            <td style="text-align: center; color: ${grandRemaining >= 0 ? '#047857' : '#b91c1c'};">
              ${grandRemaining >= 0 ? 'HEMAT' : 'OVER BUDGET'}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 3. BUKU TRANSAKSI DETAIL -->
      <table>
        <thead>
          <tr>
            <th colspan="8" style="background-color: #334155; text-align: left; font-size: 11pt;">
              3. BUKU TRANSAKSI RINCI (LOG AKTIVITAS KEUANGAN)
            </th>
          </tr>
          <tr style="background-color: #f8fafc; color: #1e293b;">
            <th style="width: 40px; background-color: #e2e8f0; color: #1e293b;">No</th>
            <th style="width: 100px; background-color: #e2e8f0; color: #1e293b;">Tanggal</th>
            <th style="width: 220px; background-color: #e2e8f0; color: #1e293b; text-align: left;">Keterangan</th>
            <th style="width: 150px; background-color: #e2e8f0; color: #1e293b; text-align: left;">Pos Kategori</th>
            <th style="width: 100px; background-color: #e2e8f0; color: #1e293b;">Tipe</th>
            <th style="width: 160px; background-color: #e2e8f0; color: #1e293b; text-align: right;">Nominal</th>
            <th style="width: 130px; background-color: #e2e8f0; color: #1e293b;">Akun / Metode</th>
            <th style="width: 200px; background-color: #e2e8f0; color: #1e293b; text-align: left;">Catatan</th>
          </tr>
        </thead>
        <tbody>
          ${txRowsHtml || '<tr><td colspan="8" style="text-align: center; color: #64748b; padding: 12px;">Belum ada transaksi tercatat di bulan ini.</td></tr>'}
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

