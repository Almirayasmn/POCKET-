import React, { useState, useEffect, useRef } from 'react';
import { usePocket } from '../context/PocketContext';
import { formatIdr, formatCny } from '../utils/formatters';
import UserAvatar from './UserAvatar';
import { X, Upload, Trash2, Check, Camera, User } from 'lucide-react';

export default function EditProfileModal({ isOpen, onClose, targetUserId = 'yasmeen' }) {
  const { users, updateUser, exchangeRate } = usePocket();
  const user = users[targetUserId] || users.yasmeen;

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarImage, setAvatarImage] = useState(null);
  const [fundIdr, setFundIdr] = useState('');
  const [reserveVal, setReserveVal] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setBio(user.bio || '');
      setAvatarImage(user.avatarImage || null);
      if (targetUserId === 'adziima') {
        setFundIdr((user.initialFundIdr || 0).toString());
        setReserveVal((user.emergencyReserveIdr || 0).toString());
      } else {
        setFundIdr((user.initialFundIdr || 10000000).toString());
        setReserveVal((user.emergencyReserveCny || 1000).toString());
      }
    }
  }, [user, isOpen, targetUserId]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran foto maksimal 2MB ya!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = (e) => {
    e.preventDefault();

    const initials = name.trim().split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'US';

    if (targetUserId === 'adziima') {
      const parsedIdr = parseFloat(fundIdr) || 0;
      updateUser('adziima', {
        name,
        bio,
        avatarImage,
        avatarInitials: initials,
        initialFundIdr: parsedIdr,
        emergencyReserveIdr: parseFloat(reserveVal) || 0
      });
    } else {
      const parsedIdr = parseFloat(fundIdr) || 0;
      const parsedReserve = parseFloat(reserveVal) || 0;
      updateUser('yasmeen', {
        name,
        bio,
        avatarImage,
        avatarInitials: initials,
        initialFundIdr: parsedIdr,
        initialFundCny: Math.round((parsedIdr / exchangeRate) * 100) / 100,
        emergencyReserveCny: parsedReserve,
        emergencyReserveIdr: Math.round(parsedReserve * exchangeRate)
      });
    }

    onClose();
  };

  const isPink = targetUserId === 'yasmeen';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} color={isPink ? '#db2777' : '#0284c7'} />
            <h3>Edit Profil & Foto {user.name}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          {/* Avatar Photo Upload Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--bg-subtle)', padding: '1.2rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ position: 'relative', marginBottom: '0.8rem' }}>
              <UserAvatar
                user={{ ...user, name, avatarImage }}
                size={88}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  background: isPink ? '#f472b6' : '#38bdf8',
                  color: 'white',
                  border: '2px solid white',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
                title="Ganti Foto"
              >
                <Camera size={15} />
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                type="button"
                className="btn-back-home"
                onClick={() => fileInputRef.current?.click()}
                style={{ fontSize: '0.78rem', background: '#fff' }}
              >
                <Upload size={13} />
                <span>Upload Foto Profil</span>
              </button>

              {avatarImage && (
                <button
                  type="button"
                  className="btn-back-home"
                  onClick={handleRemovePhoto}
                  style={{ fontSize: '0.78rem', color: '#f43f5e', background: '#fff' }}
                >
                  <Trash2 size={13} />
                  <span>Hapus Foto</span>
                </button>
              )}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
              Format JPG / PNG / WEBP, maksimal 2MB
            </div>
          </div>

          {/* Name Input */}
          <div className="form-group">
            <label className="form-label">Nama Panggilan *</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Bio / Status */}
          <div className="form-group">
            <label className="form-label">Bio / Status Singkat</label>
            <input
              type="text"
              className="form-input"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Bio singkat (opsional)"
            />
          </div>

          {/* Initial Fund & Reserve */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                {targetUserId === 'adziima' ? 'Total Uang Pribadi (Rp)' : 'Modal Awal (Rp)'}
              </label>
              <input
                type="number"
                className="form-input"
                value={fundIdr}
                onChange={(e) => setFundIdr(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {targetUserId === 'adziima' ? 'Cadangan Aman (Rp)' : 'Dana Cadangan (¥)'}
              </label>
              <input
                type="number"
                className="form-input"
                value={reserveVal}
                onChange={(e) => setReserveVal(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`submit-btn ${isPink ? 'pink' : 'blue'}`}
          >
            <Check size={18} />
            <span>Simpan Perubahan Profil</span>
          </button>
        </form>
      </div>
    </div>
  );
}
