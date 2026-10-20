import React, { useState } from 'react';
import { PocketProvider, usePocket } from './context/PocketContext';
import LandingPage from './components/LandingPage';
import YasmeenView from './components/YasmeenView';
import AdziimaView from './components/AdziimaView';
import GoldSavingsView from './components/GoldSavingsView';
import QuickAddModal from './components/QuickAddModal';
import EditProfileModal from './components/EditProfileModal';
import { Heart, Plus, Home } from 'lucide-react';

function PocketAppContent() {
  const { activeView, setActiveView } = usePocket();

  // Sync active view to document body for pure pastel background switching
  React.useEffect(() => {
    document.body.className = `view-${activeView}`;
  }, [activeView]);

  // Add & Edit Transaction Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [modalDefaultType, setModalDefaultType] = useState('Keluar');

  // Edit Profile & Photo Modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [targetProfileUser, setTargetProfileUser] = useState('yasmeen');

  const handleOpenAdd = (defaultType = 'Keluar') => {
    setEditingTx(null);
    setModalDefaultType(defaultType || 'Keluar');
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
        />
      )}

      {activeView === 'yasmeen' && (
        <YasmeenView
          onOpenAdd={handleOpenAdd}
          onEditTx={handleEditTx}
          onOpenEditProfile={() => handleOpenEditProfile('yasmeen')}
        />
      )}

      {activeView === 'adziima' && (
        <AdziimaView
          onOpenAdd={handleOpenAdd}
          onEditTx={handleEditTx}
          onOpenEditProfile={() => handleOpenEditProfile('adziima')}
        />
      )}

      {/* Footer */}
      <footer style={{ marginTop: '3.5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
        <span>Pocket Duo · Yasmeen & Adziima</span>
        <Heart size={13} color="#f472b6" fill="#f472b6" />
        <span>Pelacak Keuangan Pribadi</span>
      </footer>

      {/* Quick Add / Edit Transaction Modal */}
      <QuickAddModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTx(null);
        }}
        editingTx={editingTx}
        defaultType={modalDefaultType}
      />

      {/* Edit Profile & Photo Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        targetUserId={targetProfileUser}
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
