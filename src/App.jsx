import React, { useState } from 'react';
import { PocketProvider, usePocket } from './context/PocketContext';
import LandingPage from './components/LandingPage';
import YasmeenView from './components/YasmeenView';
import AdziimaView from './components/AdziimaView';
import GoldSavingsView from './components/GoldSavingsView';
import QuickAddModal from './components/QuickAddModal';
import EditProfileModal from './components/EditProfileModal';
import CloudSyncModal from './components/CloudSyncModal';
import PinLockScreen from './components/PinLockScreen';
import ChangePinModal from './components/ChangePinModal';
import { getLocalDateString } from './utils/formatters';
import {
  LayoutGrid,
  Coins,
  Cloud,
  RefreshCw,
  FolderUp,
  KeyRound,
  Lock
} from 'lucide-react';

function PocketAppContent() {
  const {
    activeView,
    setActiveView,
    setSelectedMonth,
    isAppUnlocked,
    unlockApp,
    lockApp,
    securityPin,
    users,
    isCloudConnected,
    isCloudSyncing,
    googleDriveUrl
  } = usePocket();

  React.useEffect(() => {
    document.body.className = `view-${activeView}`;
  }, [activeView]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [modalDefaultType, setModalDefaultType] = useState('Keluar');
  const [modalInitialData, setModalInitialData] = useState(null);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [targetProfileUser, setTargetProfileUser] = useState('yasmeen');

  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);

  if (!isAppUnlocked) {
    return (
      <PinLockScreen
        onUnlock={unlockApp}
        correctPin={securityPin || '123456'}
        users={users}
      />
    );
  }

  const navigateToView = (view) => {
    if (view === 'yasmeen' || view === 'adziima') {
      const curMonth = getLocalDateString().slice(0, 7);
      if (setSelectedMonth && curMonth >= '2026-10') {
        setSelectedMonth(curMonth);
      }
    }
    setActiveView(view);
  };

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

  const driveHref =
    googleDriveUrl ||
    'https://drive.google.com/drive/folders/1G5Mm3lnpdx_4T3QYqODurGBZdK1Kv5CX?usp=sharing';

  const navItems = [
    { id: 'landing', label: 'Ringkasan', activeClass: 'active', dotColor: null, icon: LayoutGrid },
    { id: 'yasmeen', label: 'Yasmeen', activeClass: 'active-pink', dotColor: '#db2777', icon: null },
    { id: 'adziima', label: 'Adziima', activeClass: 'active-blue', dotColor: '#0284c7', icon: null },
    { id: 'gold', label: 'Emas 24K', activeClass: 'active-gold', dotColor: '#d97706', icon: Coins }
  ];

  const renderNavTabs = () =>
    navItems.map((item) => {
      const isActive = activeView === item.id;
      const IconComp = item.icon;
      return (
        <button
          key={item.id}
          type="button"
          onClick={() => navigateToView(item.id)}
          className={`hq-nav-tab ${isActive ? item.activeClass : ''}`}
        >
          {item.dotColor ? (
            <span className="hq-nav-dot" style={{ background: item.dotColor }} />
          ) : (
            IconComp && <IconComp size={15} />
          )}
          <span>{item.label}</span>
        </button>
      );
    });

  return (
    <div className="hq-shell">
      {/* Persistent Full-Width Edge-to-Edge Sticky Topbar */}
      <nav className="hq-topbar">
        <div className="hq-topbar-inner">
          <div className="hq-topbar-left">
            <button
              type="button"
              className="hq-brand"
              onClick={() => navigateToView('landing')}
              title="Kembali ke Ringkasan"
            >
              <span className="hq-brand-mark">Z</span>
              <span className="hq-brand-text">Zimeira</span>
              <span className="hq-brand-sub">Adziima & Yasmeen</span>
            </button>

            <div className="hq-nav-tabs">{renderNavTabs()}</div>
          </div>

          <div className="hq-topbar-right">
            <button
              type="button"
              onClick={() => setIsCloudModalOpen(true)}
              className="hq-btn"
              title="Sinkronisasi Cloud Multi-Device"
            >
              {isCloudSyncing ? (
                <RefreshCw size={14} className="animate-spin" color="#059669" />
              ) : (
                <span className={`hq-status-dot ${isCloudConnected ? 'online' : 'offline'}`} />
              )}
              <Cloud size={14} />
              <span className="hq-topbar-utility-label">
                {isCloudConnected ? 'Cloud' : 'Sync'}
              </span>
            </button>

            <a
              href={driveHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hq-btn"
              title="Buka Folder Google Drive Rekapan Bulanan"
            >
              <FolderUp size={14} color="#059669" />
              <span className="hq-topbar-utility-label">Drive</span>
            </a>

            <button
              type="button"
              onClick={() => setIsChangePinOpen(true)}
              className="hq-btn hq-btn-ghost"
              title="Ubah PIN Keamanan"
            >
              <KeyRound size={14} />
              <span className="hq-topbar-utility-label">PIN</span>
            </button>

            <button
              type="button"
              onClick={lockApp}
              className="hq-btn hq-btn-ghost"
              title="Kunci Aplikasi Sekarang"
            >
              <Lock size={14} />
              <span className="hq-topbar-utility-label">Kunci</span>
            </button>
          </div>
        </div>

        {/* Mobile Full-Width Sub-Navigation Strip */}
        <div className="hq-mobile-nav">{renderNavTabs()}</div>
      </nav>

      {/* Full-Width Edge-to-Edge Main Workspace */}
      <main className="hq-main">
        {activeView === 'landing' && (
          <LandingPage
            onOpenEditProfile={handleOpenEditProfile}
            onOpenCloudModal={() => setIsCloudModalOpen(true)}
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
          <GoldSavingsView onOpenCloudModal={() => setIsCloudModalOpen(true)} />
        )}
      </main>

      {/* Minimal Edge-to-Edge Footer */}
      <footer className="hq-footer">
        <span>Zimeira · Keuangan Pribadi Adziima & Yasmeen</span>
        <span>{isCloudConnected ? 'Tersinkronisasi otomatis ke Cloud' : 'Mode penyimpanan lokal'}</span>
      </footer>

      {/* Modals */}
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

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        targetUserId={targetProfileUser}
      />

      <CloudSyncModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
      />

      <ChangePinModal
        isOpen={isChangePinOpen}
        onClose={() => setIsChangePinOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <PocketProvider>
      <PocketAppContent />
    </PocketProvider>
  );
}
