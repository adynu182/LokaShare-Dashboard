import React from 'react';

export default function Header({ connectionStatus }) {
  const isConnected = connectionStatus === 'Terhubung';
  
  return (
    <header className="header">
      <div className="header-logo">
        <div className="logo-icon">📍</div>
        <span className="logo-text">LokaShare</span>
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
