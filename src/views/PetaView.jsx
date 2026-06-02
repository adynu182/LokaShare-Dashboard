import React from 'react';
import { MapPin } from 'lucide-react';

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
              <div className="timeline-header" style={{ display: 'flex', gap: '8px' }}>
                <span className="timeline-time" style={{ fontWeight: '700' }}>
                  {locations.length - index}.
                </span>
                <span className="timeline-time">
                  {loc.timestamp?.seconds 
                    ? (() => {
                        const date = new Date(loc.timestamp.seconds * 1000);
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
                    : 'N/A'}
                </span>
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
