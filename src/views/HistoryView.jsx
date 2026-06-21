import { Clock, Crosshair, MapPin, Navigation, ParkingSquare, Satellite } from 'lucide-react';
import React, { useMemo } from 'react';

import { formatLocalDate, getLocalDateKey } from '../utils/helpers';
import { getUserColor } from '../utils/markerColors';

// ── Helpers ──────────────────────────────────────────────────────

function formatAge(ageMs) {
  if (ageMs == null) return 'N/A';
  if (ageMs < 1000)  return `${ageMs}ms`;
  if (ageMs < 60000) return `${(ageMs / 1000).toFixed(1)}s`;
  return `${Math.floor(ageMs / 60000)}m ${Math.floor((ageMs % 60000) / 1000)}s`;
}

// Konversi hex warna ke rgba dengan alpha tertentu
function rgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Filter bar config (sama dengan PetaView) ─────────────────────

const FILTERS = [
  { value: 'all',        label: 'All',    icon: <MapPin size={13} />,       colorClass: 'sf-all'        },
  { value: 'moving',     label: 'Gerak', icon: <Navigation size={13} />,   colorClass: 'sf-moving'     },
  { value: 'stationary', label: 'Diam',     icon: <ParkingSquare size={13} />, colorClass: 'sf-stationary' },
];

// ── Komponen ─────────────────────────────────────────────────────
export default function HistoryView({
  locations,
  stationaryFilter,
  stationaryCounts,
  onStationaryFilter,
  onSelectLocation,
}) {
  // Hitung nomor urut per-user dari array yang sudah difilter
  // Array urutan: index 0 = terbaru, index n = terlama
  // Seq: 1 = titik tertua user, n = titik terbaru user
  const locsWithSeq = useMemo(() => {
    // Pass 1: hitung total titik per user dalam view saat ini
    const totals = {};
    locations.forEach(loc => {
      if (loc.userName) totals[loc.userName] = (totals[loc.userName] || 0) + 1;
    });

    // Pass 2: assign seq number (count down dari total → 1)
    const seen = {};
    return locations.map(loc => {
      const name = loc.userName || '?';
      seen[name] = (seen[name] || 0) + 1;
      const seq = (totals[name] || 1) - seen[name] + 1;
      return { ...loc, _seq: seq, _total: totals[name] || 1 };
    });
  }, [locations]);

  return (
    <div className="view-container">

      {/* ── Stationary Filter Bar ── */}
      <div className="sf-bar">
        {FILTERS.map(opt => (
          <button
            key={opt.value}
            className={`sf-pill ${opt.colorClass}${stationaryFilter === opt.value ? ' sf-active' : ''}`}
            onClick={() => onStationaryFilter(opt.value)}
          >
            {opt.icon}
            <span>{opt.label}</span>
            <span className="sf-badge">{stationaryCounts?.[opt.value] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* ── History List ── */}
      {locations.length === 0 ? (
        <div className="empty-state">
          <MapPin size={48} strokeWidth={1.2} />
          <p>
            {stationaryFilter === 'moving'   ? 'Tidak ada titik bergerak'  :
             stationaryFilter === 'stationary'? 'Tidak ada titik diam'       :
                                               'Belum ada data lokasi tercatat'}
          </p>
        </div>
      ) : (
        <div className="hv-list">
          {locsWithSeq.map((loc, index) => {
            const color    = getUserColor(loc.userName);
            const isMoving = loc.isStationary === false;
            const isDiam   = loc.isStationary === true;
            const initial  = (loc.userName || '?').charAt(0).toUpperCase();

            // Tanggal untuk separator
            const dateKey  = getLocalDateKey(loc.timestamp || loc.localTimestamp);
            const prevKey  = index > 0
              ? getLocalDateKey(locsWithSeq[index - 1].timestamp || locsWithSeq[index - 1].localTimestamp)
              : null;
            const showSep  = dateKey && dateKey !== prevKey;

            // Waktu singkat (jam.menit)
            const timeStr  = loc.localTimestamp
              ? new Date(loc.localTimestamp)
                  .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                  .replace(':', '.')
              : null;

            return (
              <React.Fragment key={loc.id || index}>

                {/* ── Date separator ── */}
                {showSep && (
                  <div className="hv-date-sep">
                    <span>{formatLocalDate(dateKey)}</span>
                  </div>
                )}

                {/* ── Location card ── */}
                <div
                  className="hv-card"
                  style={{
                    background:    rgba(color, 0.07),
                    borderColor:   rgba(color, 0.35),
                    borderLeftColor: color,
                  }}
                  onClick={() => onSelectLocation(index)}
                >
                  {/* Row 1: user chip · nama · status · seq · waktu */}
                  <div className="hv-row-top">

                    {/* User initial chip */}
                    <div className="hv-chip" style={{ background: color }}>
                      {initial}
                    </div>

                    {/* Username */}
                    <span className="hv-uname" style={{ color }}>
                      {loc.userName || 'Unknown'}
                    </span>

                    {/* Status */}
                    <span className={`hv-badge ${isMoving ? 'hv-badge--moving' : isDiam ? 'hv-badge--diam' : 'hv-badge--na'}`}>
                      {isMoving
                        ? <><Navigation size={10} />Gerak</>
                        : isDiam
                        ? <><ParkingSquare size={10} />Diam</>
                        : <><MapPin size={10} />N/A</>
                      }
                    </span>

                    {/* Sequence + waktu (kanan) */}
                    <div className="hv-right">
                      <span className="hv-seq" style={{ color, background: rgba(color, 0.13) }}>
                        #{loc._seq}
                      </span>
                      {timeStr && <span className="hv-time">{timeStr}</span>}
                    </div>
                  </div>

                  {/* Row 2: detail teknis */}
                  <div className="hv-row-detail">
                    <span className="hv-dt">
                      <Crosshair size={11} />
                      {loc.accuracy != null ? `${Math.round(loc.accuracy)}m` : 'N/A'}
                    </span>
                    <span className="hv-dt">
                      <Clock size={11} />
                      {formatAge(loc.ageMs)}
                    </span>
                    <span className="hv-dt">
                      <Satellite size={11} />
                      {loc.satellitesUsed ?? 'N/A'} sat
                    </span>
                    <span className="hv-dt">
                      <MapPin size={11} />
                      {loc.source || 'N/A'}
                    </span>
                  </div>
                </div>

              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
