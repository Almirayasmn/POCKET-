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

  // Helper formatting for values with explicit space between currency and amount
  const formatVal = (v) =>
    isChinaPeriod
      ? `¥ ${Number(v || 0).toFixed(2)}`
      : `Rp ${Math.round(Number(v || 0)).toLocaleString('id-ID')}`;

  // 1. Generate Category Budget vs Actual Evaluation Rows (8-column aligned)
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
    const statusColor = isOver ? '#b91c1c' : (isSaved ? '#15803d' : (budgetVal > 0 ? '#0369a1' : '#64748b'));
    const statusBg = isOver ? '#fee2e2' : (isSaved ? '#dcfce7' : (budgetVal > 0 ? '#e0f2fe' : '#f1f5f9'));
    const rowBg = idx % 2 === 0 ? '#ffffff' : '#fdf2f8'; // alternating soft pastel pink

    catRowsHtml += `
      <tr style="background-color: ${rowBg};">
        <td style="text-align: center; border: 1px solid #cbd5e1; padding: 7px 6px;">${idx + 1}</td>
        <td colspan="2" style="font-weight: bold; border: 1px solid #cbd5e1; color: #831843; padding: 7px 10px;">${cat.name}</td>
        <td style="text-align: right; font-weight: bold; border: 1px solid #cbd5e1; color: #0369a1; padding: 7px 8px; white-space: nowrap; mso-number-format:'\\@';">${formatVal(budgetVal)}</td>
        <td style="text-align: right; font-weight: bold; border: 1px solid #cbd5e1; color: #be185d; padding: 7px 8px; white-space: nowrap; mso-number-format:'\\@';">${formatVal(spentVal)}</td>
        <td style="text-align: right; font-weight: bold; border: 1px solid #cbd5e1; color: ${remainingVal >= 0 ? '#15803d' : '#b91c1c'}; padding: 7px 8px; white-space: nowrap; mso-number-format:'\\@';">
          ${formatVal(remainingVal)}
        </td>
        <td style="text-align: center; border: 1px solid #cbd5e1; font-weight: bold; padding: 7px 6px;">${percentUsed}%</td>
        <td style="text-align: center; font-weight: bold; border: 1px solid #cbd5e1; color: ${statusColor}; background-color: ${statusBg}; padding: 7px 6px;">${statusLabel}</td>
      </tr>
    `;
  });

  const grandRemaining = grandTotalBudget - grandTotalSpent;

  // 2. Generate Transactions Rows (8-column aligned)
  let txRowsHtml = '';
  transactions.forEach((tx, idx) => {
    const cat = categories.find(c => c.id === tx.category)?.name || tx.category || '-';
    const isIncome = tx.type === 'Masuk';
    const typeLabel = isIncome ? 'Pemasukan' : 'Pengeluaran';
    const amountStr = isChinaPeriod
      ? `¥ ${(tx.amountCny || 0).toFixed(2)} (Rp ${Math.round(tx.amountIdr || 0).toLocaleString('id-ID')})`
      : `Rp ${Math.round(tx.amountIdr || 0).toLocaleString('id-ID')}`;
    const rowBg = idx % 2 === 0 ? '#ffffff' : '#f0f9ff'; // alternating soft pastel blue

    txRowsHtml += `
      <tr style="background-color: ${rowBg};">
        <td style="text-align: center; border: 1px solid #cbd5e1; padding: 7px 6px; mso-number-format:'\\@';">${idx + 1}</td>
        <td style="text-align: center; border: 1px solid #cbd5e1; padding: 7px 6px; mso-number-format:'yyyy\\-mm\\-dd';">${tx.date || '-'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 7px 10px; font-weight: 500;">${tx.title || '-'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 7px 10px;">${cat}</td>
        <td style="text-align: center; border: 1px solid #cbd5e1; font-weight: bold; color: ${isIncome ? '#15803d' : '#e11d48'}; background-color: ${isIncome ? '#dcfce7' : '#ffe4e6'}; padding: 7px 6px;">
          ${typeLabel}
        </td>
        <td style="text-align: right; border: 1px solid #cbd5e1; font-weight: bold; color: ${isIncome ? '#15803d' : '#be185d'}; padding: 7px 8px; white-space: nowrap; mso-number-format:'\\@';">
          ${amountStr}
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 7px 10px;">${tx.paymentMethod || '-'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 7px 10px; color: #475569;">${tx.notes || '-'}</td>
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
        body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 10pt; color: #1e293b; background-color: #ffffff; }
        table { border-collapse: collapse; table-layout: fixed; width: 100%; margin-bottom: 20px; }
        th { font-weight: bold; text-align: center; }
        td { vertical-align: middle; }
      </style>
    </head>
    <body>
      <table style="width: 100%; border-collapse: collapse;">
        <!-- UNIFIED 8-COLUMN LAYOUT WITH GENEROUS NUMERIC WIDTHS -->
        <colgroup>
          <col style="width: 45px;" />
          <col style="width: 105px;" />
          <col style="width: 200px;" />
          <col style="width: 160px;" />
          <col style="width: 160px;" />
          <col style="width: 160px;" />
          <col style="width: 110px;" />
          <col style="width: 160px;" />
        </colgroup>

        <!-- 1. HEADER BANNER (SPANS ALL 8 COLUMNS) -->
        <tr>
          <td colspan="8" style="background-color: #fdf2f8; border: 1.5px solid #f472b6; padding: 14px 18px; text-align: left;">
            <div style="font-size: 15pt; font-weight: bold; color: #be185d; letter-spacing: 0.5px;">
              🌸 POCKET DUO · LAPORAN KEUANGAN BULANAN
            </div>
            <div style="font-size: 12pt; font-weight: bold; color: #0284c7; margin-top: 3px;">
              ${userName.toUpperCase()} · PERIODE ${monthLabel.toUpperCase()}
            </div>
            <div style="font-size: 9pt; color: #64748b; margin-top: 4px;">
              Mata Uang: <b>${currency}</b> | Dicetak pada: <b>${exportDate}</b>
            </div>
          </td>
        </tr>

        <!-- SPACING ROW -->
        <tr style="height: 10px;"><td colspan="8" style="border: none;"></td></tr>

        <!-- 2. CATATAN RINGKAS ROLLING BALANCE (SPANS ALL 8 COLUMNS) -->
        <tr>
          <td colspan="8" style="background-color: #f0f9ff; border: 1px solid #bae6fd; padding: 9px 14px; font-size: 9pt; color: #0369a1; line-height: 1.5;">
            💡 <b>LOGIKA PERGANTIAN BULAN (ROLLING BALANCE):</b> Sisa saldo kas akhir bulan ini otomatis terbawa menjadi <b>Saldo Awal Kas</b> di bulan berikutnya. Pengeluaran yang hemat akan otomatis tersimpan utuh di saldo kas kamu (menjadi tabungan kas aman).
          </td>
        </tr>

        <!-- SPACING ROW -->
        <tr style="height: 14px;"><td colspan="8" style="border: none;"></td></tr>

        <!-- 3. SECTION 1: RINGKASAN ARUS KAS & ALOKASI DANA (8 COLUMNS BALANCED) -->
        <tr>
          <th colspan="8" style="background-color: #bae6fd; color: #0369a1; border: 1.5px solid #0284c7; text-align: left; font-size: 11pt; padding: 9px 12px;">
            1. RINGKASAN ARUS KAS & ALOKASI DANA (${monthLabel.toUpperCase()})
          </th>
        </tr>
        <tr>
          <td colspan="3" style="font-weight: bold; background-color: #fdf2f8; color: #9d174d; border: 1px solid #cbd5e1; padding: 8px 10px;">Saldo Awal Bulan:</td>
          <td style="font-weight: bold; text-align: right; color: #0284c7; border: 1px solid #cbd5e1; padding: 8px 8px; white-space: nowrap; mso-number-format:'\\@';">${summary.startBalance || '-'}</td>
          <td colspan="3" style="font-weight: bold; background-color: #f0f9ff; color: #0369a1; border: 1px solid #cbd5e1; padding: 8px 10px;">Total Alokasi Pagu Pos:</td>
          <td style="font-weight: bold; text-align: right; color: #ea580c; border: 1px solid #cbd5e1; padding: 8px 8px; white-space: nowrap; mso-number-format:'\\@';">${summary.totalBudget || '-'}</td>
        </tr>
        <tr>
          <td colspan="3" style="font-weight: bold; background-color: #fdf2f8; color: #9d174d; border: 1px solid #cbd5e1; padding: 8px 10px;">Pemasukan Masuk Bulan Ini:</td>
          <td style="font-weight: bold; text-align: right; color: #15803d; border: 1px solid #cbd5e1; padding: 8px 8px; white-space: nowrap; mso-number-format:'\\@';">${summary.monthIncome || '-'}</td>
          <td colspan="3" style="font-weight: bold; background-color: #f0f9ff; color: #0369a1; border: 1px solid #cbd5e1; padding: 8px 10px;">Total Pengeluaran Riil:</td>
          <td style="font-weight: bold; text-align: right; color: #dc2626; border: 1px solid #cbd5e1; padding: 8px 8px; white-space: nowrap; mso-number-format:'\\@';">${summary.totalOutflow || '-'}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td colspan="3" style="font-weight: bold; border: 1px solid #cbd5e1; color: #0f172a; padding: 8px 10px;">TOTAL DANA TERSEDIA:</td>
          <td style="font-weight: bold; text-align: right; border: 1px solid #cbd5e1; color: #0f172a; font-size: 11pt; padding: 8px 8px; white-space: nowrap; mso-number-format:'\\@';">${summary.totalInflow || '-'}</td>
          <td colspan="3" style="font-weight: bold; border: 1px solid #cbd5e1; color: #15803d; padding: 8px 10px;">SISA PAGU POS BELANJA (HEMAT):</td>
          <td style="font-weight: bold; text-align: right; border: 1px solid #cbd5e1; color: #15803d; font-size: 11pt; padding: 8px 8px; white-space: nowrap; mso-number-format:'\\@';">${summary.remainingBudget || '-'}</td>
        </tr>
        <tr>
          <td colspan="3" style="font-weight: bold; background-color: #e0f2fe; color: #0369a1; border: 1.5px solid #0284c7; padding: 9px 10px;">
            SISA SALDO KAS AKHIR BULAN:
          </td>
          <td style="font-weight: bold; text-align: right; background-color: #e0f2fe; color: #0369a1; font-size: 11.5pt; border: 1.5px solid #0284c7; padding: 9px 8px; white-space: nowrap; mso-number-format:'\\@';">
            ${summary.netBalance || '-'}
          </td>
          <td colspan="3" style="font-weight: bold; background-color: #fce7f3; color: #9d174d; border: 1.5px solid #ec4899; padding: 9px 10px;">
            SIMPANAN BERSIH (TABUNGAN AMAN):
          </td>
          <td style="font-weight: bold; text-align: right; background-color: #fce7f3; color: #9d174d; font-size: 11.5pt; border: 1.5px solid #ec4899; padding: 9px 8px; white-space: nowrap; mso-number-format:'\\@';">
            ${summary.plannedSavings || '-'}
          </td>
        </tr>
        <tr>
          <td colspan="8" style="font-size: 8.5pt; color: #64748b; font-style: italic; background-color: #fafafa; border: 1px solid #cbd5e1; padding: 6px 12px;">
            * Saldo Kas Akhir (${summary.netBalance || '-'}) adalah kas riil yang otomatis terbawa menjadi Saldo Awal di bulan berikutnya.
          </td>
        </tr>

        <!-- SPACING ROW -->
        <tr style="height: 16px;"><td colspan="8" style="border: none;"></td></tr>

        <!-- 4. SECTION 2: EVALUASI TARGET PAGU ANGGARAN VS REALISASI PER POS PENGELUARAN (EXACT 8 COLUMNS) -->
        <tr>
          <th colspan="8" style="background-color: #fbcfe8; color: #831843; border: 1.5px solid #ec4899; text-align: left; font-size: 11pt; padding: 9px 12px;">
            2. EVALUASI TARGET PAGU ANGGARAN VS REALISASI PER POS PENGELUARAN
          </th>
        </tr>
        <tr style="background-color: #fce7f3; color: #831843; font-weight: bold;">
          <th style="border: 1px solid #cbd5e1; padding: 8px 6px;">No</th>
          <th colspan="2" style="border: 1px solid #cbd5e1; text-align: left; padding: 8px 10px;">Nama Pos Pengeluaran</th>
          <th style="border: 1px solid #cbd5e1; text-align: right; padding: 8px 8px;">Target Pagu</th>
          <th style="border: 1px solid #cbd5e1; text-align: right; padding: 8px 8px;">Realisasi Terpakai</th>
          <th style="border: 1px solid #cbd5e1; text-align: right; padding: 8px 8px;">Sisa Pagu (Hemat)</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px 6px;">% Terpakai</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px 6px;">Status</th>
        </tr>
        ${catRowsHtml}
        <tr style="background-color: #fdf2f8; font-weight: bold; border-top: 2px solid #ec4899; border-bottom: 2px solid #ec4899;">
          <td colspan="3" style="text-align: right; border: 1px solid #cbd5e1; color: #831843; padding: 8px 10px;">TOTAL EVALUASI PAGU:</td>
          <td style="text-align: right; border: 1px solid #cbd5e1; color: #0369a1; padding: 8px 8px; white-space: nowrap; mso-number-format:'\\@';">${formatVal(grandTotalBudget)}</td>
          <td style="text-align: right; border: 1px solid #cbd5e1; color: #be185d; padding: 8px 8px; white-space: nowrap; mso-number-format:'\\@';">${formatVal(grandTotalSpent)}</td>
          <td style="text-align: right; border: 1px solid #cbd5e1; color: ${grandRemaining >= 0 ? '#15803d' : '#b91c1c'}; padding: 8px 8px; white-space: nowrap; mso-number-format:'\\@';">${formatVal(grandRemaining)}</td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px 6px;">${grandTotalBudget > 0 ? Math.round((grandTotalSpent / grandTotalBudget) * 100) : 0}%</td>
          <td style="text-align: center; border: 1px solid #cbd5e1; color: ${grandRemaining >= 0 ? '#15803d' : '#b91c1c'}; background-color: ${grandRemaining >= 0 ? '#dcfce7' : '#fee2e2'}; padding: 8px 6px;">
            ${grandRemaining >= 0 ? 'HEMAT' : 'OVER BUDGET'}
          </td>
        </tr>

        <!-- SPACING ROW -->
        <tr style="height: 16px;"><td colspan="8" style="border: none;"></td></tr>

        <!-- 5. SECTION 3: BUKU TRANSAKSI RINCI (LOG AKTIVITAS KEUANGAN) -->
        <tr>
          <th colspan="8" style="background-color: #bae6fd; color: #0369a1; border: 1.5px solid #0284c7; text-align: left; font-size: 11pt; padding: 9px 12px;">
            3. BUKU TRANSAKSI RINCI (LOG AKTIVITAS KEUANGAN)
          </th>
        </tr>
        <tr style="background-color: #e0f2fe; color: #0369a1; font-weight: bold;">
          <th style="border: 1px solid #cbd5e1; padding: 8px 6px;">No</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px 6px;">Tanggal</th>
          <th style="border: 1px solid #cbd5e1; text-align: left; padding: 8px 10px;">Keterangan</th>
          <th style="border: 1px solid #cbd5e1; text-align: left; padding: 8px 10px;">Pos Kategori</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px 6px;">Tipe</th>
          <th style="border: 1px solid #cbd5e1; text-align: right; padding: 8px 8px;">Nominal</th>
          <th style="border: 1px solid #cbd5e1; padding: 8px 10px;">Akun / Metode</th>
          <th style="border: 1px solid #cbd5e1; text-align: left; padding: 8px 10px;">Catatan</th>
        </tr>
        ${txRowsHtml || '<tr><td colspan="8" style="text-align: center; color: #64748b; padding: 14px; border: 1px solid #cbd5e1;">Belum ada transaksi tercatat di bulan ini.</td></tr>'}
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
