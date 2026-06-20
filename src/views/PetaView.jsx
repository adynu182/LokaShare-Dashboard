import React from 'react';
import { Crosshair, MapPin, Clock, Satellite, Navigation, ParkingSquare } from 'lucide-react';

// Format ageMs dari millisecond ke format yang mudah dibaca manusia
function formatAge(ageMs) {
  if (ageMs === undefined || ageMs === null) return 'N/A';
  if (ageMs < 1000) return `${ageMs}ms`;
  if (ageMs < 60000) return `${(ageMs / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ageMs / 60000);
  const seconds = Math.floor((ageMs % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

// Konfigurasi tombol filter
const FILTER_OPTIONS = [
  {
    value: 'all',
    label: 'Semua',
    icon: <MapPin size={13} />,
    colorClass: 'sf-all',
  },
  {
    value: 'moving',
    label: 'Bergerak',
    icon: <Navigation size={13} />,
    colorClass: 'sf-moving',
  },
  {
    value: 'stationary',
    label: 'Diam',
    icon: <ParkingSquare size={13} />,
    colorClass: 'sf-stationary',
  },
];

export default function PetaView({
  locations,
  stationaryFilter,
  stationaryCounts,
  onStationaryFilter,
  onSelectLocation
}) {
  return (
    <div className="view-container">

      {/* ── Filter Bar ── */}
      <div className="sf-bar">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`sf-pill ${opt.colorClass} ${stationaryFilter === opt.value ? 'sf-active' : ''}`}
            onClick={() => onStationaryFilter(opt.value)}
          >
            {opt.icon}
            <span>{opt.label}</span>
            <span className="sf-badge">{stationaryCounts?.[opt.value] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* ── Location List ── */}
      <div className="map-list">
        {locations.map((loc, index) => {
          const isMoving = loc.isStationary === false;
          const isDiam   = loc.isStationary === true;

          return (
            <div
              key={loc.id}
              className={`map-item loc-card ${isMoving ? 'loc-moving' : ''} ${isDiam ? 'loc-stationary' : ''}`}
              onClick={() => onSelectLocation(index)}
            >
              {/* Left accent bar */}
              <div className="loc-accent" />

              <div className="loc-body">
                {/* Row: nomor urut + badge status */}
                <div className="loc-row-top">
                  <span className="loc-seq">{locations.length - index}</span>
                  <span className={`loc-status-badge ${isMoving ? 'badge-moving' : isDiam ? 'badge-stationary' : 'badge-unknown'}`}>
                    {isMoving
                      ? <><Navigation size={11} /> Bergerak</>
                      : isDiam
                        ? <><ParkingSquare size={11} /> Diam</>
                        : <><MapPin size={11} /> N/A</>
                    }
                  </span>
                  <span className="loc-time">
                    {loc.localTimestamp
                      ? (() => {
                          const d = new Date(loc.localTimestamp);
                          return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/:/g, '.');
                        })()
                      : 'N/A'}
                  </span>
                </div>

                {/* Row: detail grid */}
                <div className="detail-grid">
                  <div className="detail-item">
                    <Crosshair size={13} />
                    <span>{loc.accuracy != null ? `${Math.round(loc.accuracy)}m` : 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={13} />
                    <span>{formatAge(loc.ageMs)}</span>
                  </div>
                  <div className="detail-item">
                    <Satellite size={13} />
                    <span>{loc.satellitesUsed ?? 'N/A'} sat</span>
                  </div>
                  <div className="detail-item">
                    <MapPin size={13} />
                    <span>{loc.source || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {locations.length === 0 && (
        <div className="empty-state">
          <MapPin size={48} />
          <p>
            {stationaryFilter === 'moving'
              ? 'Tidak ada titik bergerak'
              : stationaryFilter === 'stationary'
              ? 'Tidak ada titik diam'
              : 'Belum ada data lokasi tercatat'}
          </p>
        </div>
      )}
    </div>
  );
}
