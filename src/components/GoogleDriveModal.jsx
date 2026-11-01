import React, { useState } from 'react';
import { usePocket } from '../context/PocketContext';
import { ALL_MONTH_OPTIONS } from './MonthNavigator';
import { exportMonthToExcel } from '../utils/exportExcel';
import { formatIdr } from '../utils/formatters';
import {
  FolderUp,
  ExternalLink,
  Download,
  Copy,
  Check,
  Edit2,
  Save,
  X,
  FileSpreadsheet,
  Calendar,
  Sparkles,
  Info,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function GoogleDriveModal({
  isOpen,
  onClose,
  userName = 'Yasmeen Almira',
  userId = 'yasmeen',
  transactions = [],
  currentMonth = '2026-11'
}) {
  const {
    googleDriveUrl,
    updateGoogleDriveUrl,
    getCategoriesForMonth,
    yasmeen,
    adziima
  } = usePocket();

  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [customUrl, setCustomUrl] = useState(googleDriveUrl || 'https://drive.google.com/drive/my-drive');
  const [copied, setCopied] = useState(false);
  const [downloadSuccessMonth, setDownloadSuccessMonth] = useState(null);

  if (!isOpen) return null;

  const activeUrl = googleDriveUrl || 'https://drive.google.com/drive/my-drive';

  const handleOpenDrive = () => {
    window.open(activeUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(activeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveUrl = (e) => {
    e.preventDefault();
    if (updateGoogleDriveUrl) {
      updateGoogleDriveUrl(customUrl);
    }
    setIsEditingUrl(false);
  };

  // Helper to trigger single month export for any month
  const handleDownloadMonth = (monthValue) => {
    const label = ALL_MONTH_OPTIONS.find(opt => opt.value === monthValue)?.label || monthValue;
    const mTx = (transactions || []).filter(tx => (tx?.date || '').startsWith(monthValue));
    const mCats = getCategoriesForMonth ? getCategoriesForMonth(userId, monthValue) : [];

    const mSpending = {};
    mCats.forEach(c => { mSpending[c.id] = { totalIdr: 0, count: 0 }; });
    mTx.forEach(tx => {
      if (tx?.type !== 'Masuk' && mSpending[tx?.category]) {
        mSpending[tx.category].totalIdr += (tx.amountIdr || 0);
        mSpending[tx.category].count += 1;
      }
    });

    let mIncome = 0;
    let mOutflow = 0;
    mTx.forEach(tx => {
      if (tx?.type === 'Masuk') mIncome += (tx.amountIdr || 0);
      else mOutflow += (tx.amountIdr || 0);
    });

    const totalBudget = mCats.reduce((sum, c) => sum + (c.budgetIdr || c.budget || 0), 0);
    const remainingBudget = Math.max(0, totalBudget - mOutflow);

    const isCur = monthValue === currentMonth;
    const startBalance = isCur ? (userId === 'yasmeen' ? (yasmeen?.startBalanceIdr || 0) : (adziima?.initialIdr || 0)) : 0;
    const totalInflow = startBalance + mIncome;
    const netBalance = isCur ? (userId === 'yasmeen' ? (yasmeen?.totalBalanceIdr || 0) : (adziima?.totalBalanceIdr || 0)) : (mIncome - mOutflow);
    const plannedSavings = Math.max(0, totalInflow - totalBudget);

    const fileName = exportMonthToExcel({
      userName,
      monthLabel: label,
      selectedMonth: monthValue,
      transactions: mTx,
      categories: mCats,
      categorySpending: mSpending,
      summary: {
        startBalance: formatIdr(startBalance),
        monthIncome: formatIdr(mIncome),
        totalInflow: formatIdr(totalInflow),
        totalBudget: formatIdr(totalBudget),
        totalOutflow: formatIdr(mOutflow),
        remainingBudget: formatIdr(remainingBudget),
        plannedSavings: formatIdr(plannedSavings),
        netBalance: formatIdr(netBalance)
      }
    });

    setDownloadSuccessMonth({
      monthLabel: label,
      fileName
    });
  };

  // Available months to display (from 2026-10 onwards)
  const displayMonths = ALL_MONTH_OPTIONS.filter(m => m.value <= '2027-03');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
            title="Tutup Modal"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <FolderUp size={26} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight text-white">Folder Arsip Google Drive</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/30 text-white border border-emerald-300/40">
                  Otomatis Per Bulan
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5 font-medium">
                Rekapan Excel 1 bulan 1 file rapi, siap diakses dan diunggah ke Google Drive kapan saja.
              </p>
            </div>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* SUCCESS NOTIFICATION TO OPEN DRIVE */}
          {downloadSuccessMonth && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-900">
                    Rekap {downloadSuccessMonth.monthLabel} Berhasil Diunduh!
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    File: <code className="font-mono font-semibold">{downloadSuccessMonth.fileName}</code>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenDrive}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>Buka Drive & Simpan</span>
                <ExternalLink size={13} />
              </button>
            </div>
          )}

          {/* MAIN GOOGLE DRIVE FOLDER CARD */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/30 border border-slate-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Link Folder Drive Kamu
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Klik tombol di bawah untuk langsung membuka folder arsip Google Drive di tab baru.
                </p>
              </div>

              {/* ACTION: OPEN GOOGLE DRIVE */}
              <button
                type="button"
                onClick={handleOpenDrive}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
              >
                <FolderUp size={16} />
                <span>Buka Google Drive</span>
                <ExternalLink size={14} />
              </button>
            </div>

            {/* URL Display / Edit section */}
            <div className="mt-4 pt-3 border-t border-slate-200/60">
              {isEditingUrl ? (
                <form onSubmit={handleSaveUrl} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    required
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Save size={13} />
                    <span>Simpan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsEditingUrl(false); setCustomUrl(activeUrl); }}
                    className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
                  >
                    Batal
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200/80 text-xs text-slate-600">
                  <span className="truncate font-mono text-[11px] text-slate-500 max-w-[320px]">
                    {activeUrl}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Salin Link"
                    >
                      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingUrl(true)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                      title="Ubah Link Folder"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MONTHLY RECAPS LIST (1 MONTH 1 FILE) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-emerald-600" />
                  Daftar Rekapan Excel Per Bulan
                </h4>
                <p className="text-[11px] text-slate-500">
                  Format bersih 1 file per bulan (100% Rupiah, rapi tanpa simbol asing).
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {displayMonths.map((m) => {
                const isCur = m.value === currentMonth;
                const mTx = (transactions || []).filter(tx => (tx?.date || '').startsWith(m.value));
                const countTx = mTx.length;
                let mIncome = 0;
                let mOutflow = 0;
                mTx.forEach(tx => {
                  if (tx?.type === 'Masuk') mIncome += (tx.amountIdr || 0);
                  else mOutflow += (tx.amountIdr || 0);
                });

                return (
                  <div
                    key={m.value}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isCur
                        ? 'bg-emerald-50/40 border-emerald-300/80 shadow-sm'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isCur ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Calendar size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-800">{m.label}</span>
                          {isCur && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Bulan Aktif
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{countTx} Transaksi</span>
                          <span>•</span>
                          <span className="text-rose-600 font-medium">Keluar: {formatIdr(mOutflow)}</span>
                          {mIncome > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 font-medium">Masuk: {formatIdr(mIncome)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleDownloadMonth(m.value)}
                        className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <Download size={13} />
                        <span>Unduh XLS</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenDrive}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                        title="Buka Drive untuk unggah file"
                      >
                        <ExternalLink size={12} />
                        <span>Drive</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3-STEP EASY FLOW GUIDE */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="font-bold text-slate-700 flex items-center gap-1.5">
              <Info size={14} className="text-emerald-600" />
              Alur Rekapan Bulanan Google Drive (Mudah & Otomatis)
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-500 pl-1 leading-relaxed">
              <li>
                <b>Setiap Ganti Bulan:</b> Pocket otomatis merangkum data bulan yang bersangkutan menjadi file Excel rapi.
              </li>
              <li>
                <b>Unduh File XLS:</b> Klik tombol <b>Unduh XLS</b> di samping bulan yang ingin kamu simpan.
              </li>
              <li>
                <b>Simpan ke Drive:</b> Klik tombol <b>Buka Google Drive</b>, lalu seret (drag & drop) file Excel yang sudah kamu unduh ke folder Drive kamu.
              </li>
            </ol>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Tersinkronisasi otomatis di semua perangkat</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-sm"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
}
