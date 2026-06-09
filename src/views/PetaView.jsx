import React from 'react';
import { Battery, Crosshair, MapPin } from 'lucide-react';

export default function PetaView({ locations, onSelectLocation }) {
  return (
    <div className="view-container">
      <div className="peta-header" style={{
        padding: '1rem',
        background: 'var(--primary)',
        color: 'white',
        borderRadius: '12px',
        marginBottom: '1rem',
        fontWeight: '700',
        textAlign: 'center'
      }}>
        Jumlah Lokasi Tercatat : {locations.length}
      </div>
      
      <div className="timeline-list">
        {locations.map((loc, index) => (
          <div 
            key={loc.id} 
            className="timeline-item" 
            onClick={() => onSelectLocation(index)}
            style={{ cursor: 'pointer', padding: '0.75rem 0' }}
          >
            <div className="timeline-content" style={{ padding: '0.75rem 1rem' }}>
              <div className="timeline-details" style={{ marginLeft: '1.5rem', marginTop: '6px' }}>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>Sumber:</span>
                    <span>{loc.source || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>Waktu:</span>
                    <span>{loc.localTimestamp 
                    ? (() => {
                        const date = new Date(loc.localTimestamp);
                        const dateStr = date.toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
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
                    <Battery size={14} />
                    <span>Baterai: {loc.battery !== undefined ? `${loc.battery}%` : 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <Crosshair size={14} />
                    <span>Akurasi: {loc.accuracy !== undefined ? `${Math.round(loc.accuracy)}m` : 'N/A'}</span>
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
