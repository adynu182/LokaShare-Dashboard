import React from 'react';
import { MapPin } from 'lucide-react';

export default function PetaView({ locations }) {
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
          <div key={loc.id} className="timeline-item">
            <div className="timeline-marker">
              <div className="marker-dot-small" style={{ background: 'var(--primary)' }} />
              {index < locations.length - 1 && <div className="marker-line" />}
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <span className="timeline-time">
                  {index + 1}.
                </span>
                <span className="timeline-time">
                  {loc.timestamp?.seconds 
                    ? new Date(loc.timestamp.seconds * 1000).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'N/A'}
                </span>
              </div>
              <div className="timeline-details">
                <div className="detail-item">
                  <MapPin size={12} />
                  <span>{loc.userName || 'Anonymous'}</span>
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
