import React from 'react';
import LocationCard from './LocationCard';
import { getLocalDateKey, formatLocalDate } from '../utils/helpers';

export default function BottomPanel({ 
  locations, 
  panelState, 
  setPanelState, 
  onCardClick,
  loading 
}) {
  // panelState can be: 'collapsed' | 'peek' | 'expanded'
  
  const cycleState = () => {
    if (panelState === 'collapsed') {
      setPanelState('peek');
    } else if (panelState === 'peek') {
      setPanelState('expanded');
    } else {
      setPanelState('collapsed');
    }
  };

  // Group locations by local date key
  const groupedLocations = {};
  locations.forEach((loc, index) => {
    const dateKey = getLocalDateKey(loc.timestamp || loc.localTimestamp);
    if (!groupedLocations[dateKey]) {
      groupedLocations[dateKey] = [];
    }
    groupedLocations[dateKey].push({ loc, index });
  });

  // Sort dates descending (newest first)
  const sortedDates = Object.keys(groupedLocations).sort((a, b) => b.localeCompare(a));

  return (
    <div className={`bottom-panel ${panelState}`}>
      {/* Panel Handle & Header */}
      <div className="panel-header" onClick={cycleState}>
        <div className="panel-handle-bar">
          <div className="handle-line"></div>
        </div>
        <div className="panel-header-content">
          <div className="panel-title-wrapper">
            <span className="panel-title">📋 Riwayat Lokasi</span>
            <span className="panel-count">{locations.length} data</span>
          </div>
          <div className="panel-controls">
            <button 
              className={`panel-toggle-btn ${panelState === 'collapsed' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setPanelState('collapsed');
              }}
              title="Sembunyikan"
            >
              🔽
            </button>
            <button 
              className={`panel-toggle-btn ${panelState === 'peek' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setPanelState('peek');
              }}
              title="Sedang"
            >
              📊
            </button>
            <button 
              className={`panel-toggle-btn ${panelState === 'expanded' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setPanelState('expanded');
              }}
              title="Penuh"
            >
              🔼
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="panel-content">
        {loading ? (
          <div className="state-container">
            <div className="spinner"></div>
            <div className="state-title">Memuat data...</div>
            <div className="state-desc">Mengambil data lokasi dari server</div>
          </div>
        ) : locations.length === 0 ? (
          <div className="state-container">
            <div className="state-icon">📭</div>
            <div className="state-title">Belum ada data</div>
            <div className="state-desc">Data lokasi akan muncul di sini saat perangkat mulai mengirim</div>
          </div>
        ) : (
          <div className="list-scroll">
            {sortedDates.map((dateKey) => (
              <div key={dateKey} className="date-group-section">
                <div className="date-group-header">
                  📅 {formatLocalDate(dateKey)}
                </div>
                <div className="date-group-list">
                  {groupedLocations[dateKey].map(({ loc, index }) => (
                    <LocationCard
                      key={loc.id || index}
                      loc={loc}
                      index={index}
                      onClick={() => onCardClick(index)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
