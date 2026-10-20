import React, { useState } from 'react';
import { usePocket } from '../context/PocketContext';
import {
  Cloud,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

export default function CloudSyncModal({ isOpen, onClose }) {
  const {
    firebaseDbUrl,
    isCloudConnected,
    isCloudSyncing,
    saveCloudUrl,
    syncFromCloud,
    syncToCloud
  } = usePocket();

  const [inputUrl, setInputUrl] = useState(firebaseDbUrl || '');
  const [statusMsg, setStatusMsg] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleSaveAndConnect = async (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      saveCloudUrl('');
      setStatusMsg('Koneksi cloud dinonaktifkan (kembali ke penyimpanan lokal).');
      return;
    }

    setIsTesting(true);
    setStatusMsg('Menghubungkan ke Firebase Realtime Database...');
    try {
      await saveCloudUrl(inputUrl.trim());
      setStatusMsg('Berhasil terhubung ke Cloud! Data otomatis tersinkronisasi.');
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      setStatusMsg(`Gagal terhubung: ${err.message || 'Periksa kembali URL dan pastikan rules database diset ke test mode (read/write: true)'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handlePush = async () => {
    setIsTesting(true);
    setStatusMsg('Mengunggah data dari HP ini ke Cloud...');
    try {
      await syncToCloud();
      setStatusMsg('Berhasil mengunggah data lokal ke Cloud!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      setStatusMsg(`Gagal unggah: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handlePull = async () => {
    setIsTesting(true);
    setStatusMsg('Mengambil data terbaru dari Cloud...');
    try {
      await syncFromCloud();
      setStatusMsg('Berhasil memperbarui data dari Cloud!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      setStatusMsg(`Gagal unduh: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: isCloudConnected ? '#dcfce7' : '#fef3c7',
                color: isCloudConnected ? '#15803d' : '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Cloud size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Sinkronisasi Antar HP</h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                Firebase Realtime Database · Yasmeen & Adziima
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Status Card */}
        <div
          style={{
            background: isCloudConnected ? '#f0fdf4' : '#fffbeb',
            border: `1.5px solid ${isCloudConnected ? '#86efac' : '#fde68a'}`,
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: isCloudConnected ? '#16a34a' : '#f59e0b',
              flexShrink: 0
            }}
          />
          <div style={{ fontSize: '0.82rem', color: isCloudConnected ? '#166534' : '#92400e', lineHeight: 1.4 }}>
            {isCloudConnected ? (
              <>
                <strong>Status: Terhubung Real-Time!</strong>
                <div>Setiap perubahan di HP Yasmeen atau HP Adziima akan otomatis muncul seketika di HP satunya.</div>
              </>
            ) : (
              <>
                <strong>Status: Masih Mode Lokal (Belum Terhubung)</strong>
                <div>Saat ini data masih tersimpan di memori HP masing-masing. Masukkan URL database Firebase di bawah agar saling terhubung.</div>
              </>
            )}
          </div>
        </div>

        {/* Quick Instructions */}
        <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', marginBottom: '1.2rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
          <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>Cara Menghubungkan (1 Menit):</span>
          </div>
          <ol style={{ paddingLeft: '1.1rem', margin: 0 }}>
            <li style={{ marginBottom: '0.25rem' }}>
              Buka <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'underline' }}>console.firebase.google.com</a> (gratis akun Google).
            </li>
            <li style={{ marginBottom: '0.25rem' }}>
              Buat project bebas (misal: <em>pocket-duo</em>) &gt; pilih menu <strong>Build</strong> &gt; <strong>Realtime Database</strong> &gt; <strong>Create Database</strong>.
            </li>
            <li style={{ marginBottom: '0.25rem' }}>
              Pilih lokasi (misal: <code>asia-southeast1</code> / Singapore) dan centang <strong>Test Mode</strong> (read/write: true).
            </li>
            <li>
              Salin URL database yang muncul (berakhiran <code>.firebasedatabase.app</code>) lalu tempel di bawah.
            </li>
          </ol>
        </div>

        <form onSubmit={handleSaveAndConnect}>
          <div className="form-group">
            <label className="form-label">Firebase Database URL</label>
            <input
              type="text"
              className="form-input"
              placeholder="https://pocket-duo-default-rtdb.asia-southeast1.firebasedatabase.app"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          {statusMsg && (
            <div style={{ fontSize: '0.8rem', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', background: statusMsg.includes('Gagal') ? '#fee2e2' : '#ecfdf5', color: statusMsg.includes('Gagal') ? '#b91c1c' : '#047857', marginBottom: '0.8rem', fontWeight: 600 }}>
              {statusMsg}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              type="submit"
              disabled={isTesting}
              className="btn-enter-profile btn-enter-blue"
              style={{ flex: 1, padding: '0.65rem 1rem', fontSize: '0.88rem' }}
            >
              <Check size={16} />
              <span>{isTesting ? 'Menyambungkan...' : 'Simpan & Sambungkan'}</span>
            </button>
          </div>
        </form>

        {isCloudConnected && (
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.9rem', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
              Sinkronisasi Manual (Jika Diperlukan):
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handlePush}
                disabled={isTesting}
                className="btn-back-home"
                style={{ flex: 1, fontSize: '0.78rem', padding: '0.5rem', justifyContent: 'center' }}
                title="Kirim data dari HP ini untuk menimpa data di Cloud"
              >
                <UploadCloud size={14} />
                <span>Unggah ke Cloud</span>
              </button>
              <button
                type="button"
                onClick={handlePull}
                disabled={isTesting}
                className="btn-back-home"
                style={{ flex: 1, fontSize: '0.78rem', padding: '0.5rem', justifyContent: 'center' }}
                title="Ambil data dari Cloud untuk menimpa data di HP ini"
              >
                <DownloadCloud size={14} />
                <span>Tarik dari Cloud</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
