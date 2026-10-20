import React from 'react';

export default function UserAvatar({ user, size = 48, className = '', onClick = null }) {
  if (!user) return null;

  const isPink = user.id === 'yasmeen';
  const bgColor = isPink ? '#fdf2f8' : '#f0f9ff';
  const textColor = isPink ? '#db2777' : '#0284c7';
  const borderColor = isPink ? '#fbcfe8' : '#bae6fd';

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: bgColor,
        color: textColor,
        border: `2px solid ${borderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: `${size * 0.38}px`,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        position: 'relative'
      }}
      title={onClick ? 'Klik untuk edit profil & foto' : user.name}
    >
      {user.avatarImage ? (
        <img
          src={user.avatarImage}
          alt={user.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span>{user.avatarInitials || user.name?.substring(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
}
