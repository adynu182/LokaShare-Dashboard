import React, { useState } from 'react';
import { formatTimestamp, batteryClass, batteryIcon, formatCoords } from '../utils/helpers';

export default function LocationCard({ loc, index, onClick }) {
  const [address, setAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const battCls = batteryClass(loc.battery);
  const battIcon = batteryIcon(loc.battery, loc.isCharging);
  const coordsStr = formatCoords(loc.latitude, loc.longitude);
  const timeStr = formatTimestamp(loc.localTimestamp);

  const fetchAddress = async (e) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
    if (loadingAddress || address) return;

    setLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=geojson&lat=${loc.latitude}&lon=${loc.longitude}&layer=address`
      );
      const data = await response.json();
      
      if (data && data.features && data.features.length > 0) {
        setAddress(data.features[0].properties.display_name);
      } else {
        setAddress('Alamat tidak ditemukan');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setAddress('Gagal mengambil alamat');
    } finally {
      setLoadingAddress(false);
    }
  };

  return (
    <div 
      className="loc-card" 
      onClick={onClick}
      style={{ animationDelay: `${Math.min(index * 0.02, 0.2)}s` }}
    >
      <div className="loc-card-index">{index + 1}</div>
      <div className="loc-card-body">
        <div className="loc-card-top">
          <span className="panel-card">Waktu:</span> <span className="loc-card-time">{timeStr}</span>
        </div>
        <div className="loc-card-coords">
          <span className="panel-card">Lokasi:</span> {coordsStr}
        </div>
        
        {/* Reverse Geocoding Section */}
        <div className="loc-card-address-container">
          {!address && !loadingAddress && (
            <button className="address-btn" onClick={fetchAddress}>
              📍 Lihat Alamat
            </button>
          )}
          {loadingAddress && (
            <div className="address-loading">
              <span className="address-spinner"></span> Mencari alamat...
            </div>
          )}
          {address && (
            <div className="address-text">
              <span className="panel-card">Alamat:</span> {address}
            </div>
          )}
        </div>

        <div className="loc-card-meta">
          {loc.battery !== undefined && loc.battery !== null && (
            <span className={`meta-tag battery ${battCls}`}>
              {battIcon} {loc.battery}%
            </span>
          )}
          {loc.isCharging && <span className="meta-tag charging">⚡ Charging</span>}
          {loc.accuracy && <span className="meta-tag accuracy">🎯 {Math.round(loc.accuracy)}m</span>}
          {loc.source && <span className="meta-tag source-tag">📡 {loc.source}</span>}
        </div>
      </div>
    </div>
  );
}
