import React from 'react';
import { usePocket } from '../context/PocketContext';
import { FolderUp, ExternalLink, CheckCircle2, X, FileSpreadsheet } from 'lucide-react';

export default function PostExportDrivePrompt({
  isOpen,
  onClose,
  fileName,
  monthLabel
}) {
  const { googleDriveUrl } = usePocket();

  if (!isOpen) return null;

  const activeUrl = googleDriveUrl || 'https://drive.google.com/drive/my-drive';

  const handleOpenDrive = () => {
    window.open(activeUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 overflow-hidden">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner">
            <CheckCircle2 size={26} />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Excel Rekapan Berhasil Diunduh!
            </h3>
            <p className="text-xs text-slate-500">
              Periode: <strong className="text-slate-800">{monthLabel}</strong>
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
          <FileSpreadsheet size={18} className="text-emerald-600 shrink-0" />
          <span className="font-mono text-xs text-slate-700 truncate font-semibold">
            {fileName}
          </span>
        </div>

        <p className="mt-3 text-xs text-slate-500 leading-relaxed">
          File rekapan bulanan sudah tersimpan di komputermu. Buka <b>Folder Google Drive</b> sekarang untuk mengunggah file ini ke arsip?
        </p>

        <div className="mt-5 flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenDrive}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
          >
            <FolderUp size={15} />
            <span>Buka Google Drive</span>
            <ExternalLink size={13} />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-all"
          >
            Nanti Saja
          </button>
        </div>

      </div>
    </div>
  );
}
