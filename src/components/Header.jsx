import React, { useState } from 'react';

export default function Header({ connectionStatus, selectedUser, onDeleteUser, deviceModel }) {
  const isConnected = connectionStatus === 'Terhubung';
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = async () => {
    if (!selectedUser) {
      alert('Silakan pilih user terlebih dahulu');
      return;
    }

    const confirmed = confirm(
      `Apakah Anda yakin ingin menghapus semua data lokasi untuk user: ${selectedUser}?\n\nAksi ini tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDeleteUser(selectedUser);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <header className="header">
      <div className="header-logo">
        <div className="logo-icon">📍</div>
        <div className="logo-text-wrap">
          <span className="logo-text">LokaShare</span>
          {deviceModel && <span className="logo-subtitle">{deviceModel}</span>}
        </div>
      </div>
      <div className="header-actions">
        <button 
          className="header-delete-btn"
          onClick={handleDeleteClick}
          disabled={!selectedUser || isDeleting}
          title={selectedUser ? `Hapus data ${selectedUser}` : 'Pilih user untuk menghapus'}
        >
          {isDeleting ? '⏳' : '🗑️'}
        </button>
      </div>
      <div className="header-status">
        <span 
          className="status-dot" 
          style={{ 
            backgroundColor: isConnected ? 'var(--accent-green)' : 'var(--accent-red)',
            animation: isConnected ? 'pulse-dot 2s ease-in-out infinite' : 'none'
          }}
        ></span>
        <span>{connectionStatus}</span>
      </div>
    </header>
  );
}
