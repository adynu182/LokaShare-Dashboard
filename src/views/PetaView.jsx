import React from 'react';
import { Battery, Crosshair, MapPin, Clock, Satellite, Car } from 'lucide-react';

// FIX #14: Format ageMs dari millisecond ke format yang mudah dibaca manusia
function formatAge(ageMs) {
  if (ageMs === undefined || ageMs === null) return 'N/A';
  if (ageMs < 1000) return `${ageMs}ms`;
  if (ageMs < 60000) return `${(ageMs / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ageMs / 60000);
  const seconds = Math.floor((ageMs % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export default function PetaView({ locations, onSelectLocation }) {
  return (
    <div className="view-container">
      <div className="map-list">
        {locations.map((loc, index) => (
          <div
            key={loc.id}
            className="map-item"
            onClick={() => onSelectLocation(index)}
            style={{ cursor: 'pointer', padding: '0.75rem 0' }}
          >
            <div className="map-content" style={{ padding: '0.75rem 1rem' }}>
              <div className="map-header" style={{ display: 'flex', gap: '8px' }}>
                <span className="map-time" style={{ fontWeight: '700', display: 'flex', alignItems: 'center' }}>
                  {locations.length - index}.
                </span>
                <div className="map-details" style={{ marginTop: '6px' }}>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span>{loc.source || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span>{loc.localTimestamp
                        ? (() => {
                          const date = new Date(loc.localTimestamp);
                          const dateStr = date.toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: '2-digit'
                          });
                          const timeStr = date.toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }).replace(/:/g, '.');
                          return `${dateStr}, ${timeStr}`;
                        })()
                        : 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <Car size={14} />
                      <span>Park: {loc.isStationary !== undefined ? `${loc.isStationary}` : 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <Crosshair size={14} />
                      <span>Akurasi: {loc.accuracy !== undefined ? `${Math.round(loc.accuracy)}m` : 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <Clock size={14} />
                      {/* FIX #14: Tampilkan ageMs dalam format human-readable */}
                      <span>Age: {formatAge(loc.ageMs)}</span>
                    </div>
                    <div className="detail-item">
                      <Satellite size={14} />
                      <span>Satelit: {loc.satellitesUsed !== undefined ? loc.satellitesUsed : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {locations.length === 0 && (
        <div className="empty-state">
          <MapPin size={48} />
          <p>Belum ada data lokasi tercatat</p>
        </div>
      )}
    </div>
  );
}
