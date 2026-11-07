import React, { useState } from 'react';
import { PocketProvider, usePocket } from './context/PocketContext';
import LandingPage from './components/LandingPage';
import YasmeenView from './components/YasmeenView';
import AdziimaView from './components/AdziimaView';
import GoldSavingsView from './components/GoldSavingsView';
import BusinessView from './components/BusinessView';
import QuickAddModal from './components/QuickAddModal';
import EditProfileModal from './components/EditProfileModal';
import CloudSyncModal from './components/CloudSyncModal';
import PinLockScreen from './components/PinLockScreen';
import ChangePinModal from './components/ChangePinModal';
import { Heart, Plus, Home, Lock, KeyRound } from 'lucide-react';

function PocketAppContent() {
  const { activeView, setActiveView, isAppUnlocked, unlockApp, lockApp, securityPin, users } = usePocket();

  // Sync active view to document body for pure pastel background switching
  React.useEffect(() => {
    document.body.className = `view-${activeView}`;
  }, [activeView]);

  // Add & Edit Transaction Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [modalDefaultType, setModalDefaultType] = useState('Keluar');
  const [modalInitialData, setModalInitialData] = useState(null);

  // Edit Profile & Photo Modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [targetProfileUser, setTargetProfileUser] = useState('yasmeen');

  // Multi-Device Cloud Sync Modal
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);

  // Change Security PIN Modal
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);

  // If the app is locked, show the cute Pastel PIN Lock Screen!
  if (!isAppUnlocked) {
    return (
      <PinLockScreen
        onUnlock={unlockApp}
        correctPin={securityPin || '1234'}
        users={users}
      />
    );
  }

  const handleOpenAdd = (defaultType = 'Keluar', initialData = null) => {
    setEditingTx(null);
    setModalDefaultType(defaultType || 'Keluar');
    setModalInitialData(initialData || null);
    setIsAddModalOpen(true);
  };

  const handleEditTx = (tx) => {
    setEditingTx(tx);
    setIsAddModalOpen(true);
  };

  const handleOpenEditProfile = (userId) => {
    setTargetProfileUser(userId);
    setIsEditProfileOpen(true);
  };

  return (
    <div className="app-container">
      {/* Route Views */}
      {activeView === 'landing' && (
        <LandingPage
          onOpenEditProfile={handleOpenEditProfile}
          onOpenCloudModal={() => setIsCloudModalOpen(true)}
          onOpenAdd={handleOpenAdd}
          onOpenChangePin={() => setIsChangePinOpen(true)}
          onLockApp={lockApp}
        />
      )}

      {activeView === 'yasmeen' && (
        <YasmeenView
          onOpenAdd={handleOpenAdd}
          onEditTx={handleEditTx}
          onOpenEditProfile={() => handleOpenEditProfile('yasmeen')}
          onOpenCloudModal={() => setIsCloudModalOpen(true)}
        />
      )}

      {activeView === 'adziima' && (
        <AdziimaView
          onOpenAdd={handleOpenAdd}
          onEditTx={handleEditTx}
          onOpenEditProfile={() => handleOpenEditProfile('adziima')}
          onOpenCloudModal={() => setIsCloudModalOpen(true)}
        />
      )}

      {activeView === 'gold' && (
        <GoldSavingsView
          onOpenCloudModal={() => setIsCloudModalOpen(true)}
        />
      )}

      {activeView === 'business' && (
        <BusinessView
          onOpenCloudModal={() => setIsCloudModalOpen(true)}
        />
      )}

      {/* Footer */}
      <footer style={{ marginTop: '3.5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span>Zimeira · Adziima & Yasmeen</span>
        <Heart size={13} color="#f472b6" fill="#f472b6" />
        <span style={{ margin: '0 0.3rem', opacity: 0.4 }}>•</span>
        <button
          onClick={() => setIsCloudModalOpen(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: 'inherit',
            padding: 0
          }}
        >
          ☁️ Sinkronisasi Multi-Device
        </button>
        <span style={{ margin: '0 0.3rem', opacity: 0.4 }}>•</span>
        <button
          onClick={() => setIsChangePinOpen(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: 'inherit',
            padding: 0
          }}
        >
          🔑 Ganti PIN
        </button>
        <span style={{ margin: '0 0.3rem', opacity: 0.4 }}>•</span>
        <button
          onClick={lockApp}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: 'inherit',
            padding: 0
          }}
          title="Kunci aplikasi ini sekarang"
        >
          🔒 Kunci
        </button>
      </footer>

      {/* Quick Add / Edit Transaction Modal */}
      <QuickAddModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTx(null);
          setModalInitialData(null);
        }}
        editingTx={editingTx}
        defaultType={modalDefaultType}
        initialData={modalInitialData}
      />

      {/* Edit Profile & Photo Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        targetUserId={targetProfileUser}
      />

      {/* Cloud Sync Modal */}
      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
      />

      {/* Change Security PIN Modal */}
      <ChangePinModal
        isOpen={isChangePinOpen}
        onClose={() => setIsChangePinOpen(false)}
      />
    </div>
  );
}

// Ubah ke false jika sewaktu-waktu ingin mengaktifkan kembali akses online/publik
const LOCAL_ONLY_MODE = true;

function isLocalhost() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '[::1]' ||
    host.endsWith('.local')
  );
}

export default function App() {
  if (LOCAL_ONLY_MODE && !isLocalhost()) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 100%)',
          padding: '1.5rem',
          fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
        }}
      >
        <div
          style={{
            maxWidth: '400px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(244, 114, 182, 0.18)'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#fce7f3',
              color: '#db2777',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}
          >
            <Lock size={28} />
          </div>
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#1e293b',
              margin: '0 0 0.5rem'
            }}
          >
            Aplikasi Sedang Dinonaktifkan
          </h1>
          <p
            style={{
              fontSize: '0.9rem',
              color: '#64748b',
              lineHeight: 1.6,
              margin: 0
            }}
          >
            Akses publik ke halaman ini sedang dimatikan sementara oleh pemilik dan hanya dapat diakses secara lokal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PocketProvider>
      <PocketAppContent />
    </PocketProvider>
  );
}
