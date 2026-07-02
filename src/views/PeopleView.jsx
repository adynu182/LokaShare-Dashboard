import { Calendar, Eye, EyeOff, Users } from 'lucide-react';
import React, { useMemo } from 'react';

import { getLocalDateKey } from '../utils/helpers';
import { getUserColor } from '../utils/markerColors';

// ── Helpers tanggal ─────────────────────────────────────────────
function toLocalKey(d) {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
const todayKey     = () => toLocalKey(new Date());
const daysAgoKey   = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return toLocalKey(d); };
const formatLabel  = (key) => {
  if (!key) return '';
  const [y, m, d] = key.split('-');
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Tombol cepat pilih tanggal
const QUICK = [

  { label: 'Hari Ini', from: todayKey(),   to: todayKey()  },
  { label: 'Kemarin',  from: daysAgoKey(1), to: daysAgoKey(1) },
  { label: '2 Hari Lalu',  from: daysAgoKey(2), to: daysAgoKey(2) },
  { label: 'All',    from: '',           to: ''          },
];

// ── Komponen utama ───────────────────────────────────────────────
export default function PeopleView({
  allLocations,
  dateRange,
  onDateRange,
  visibleUsers,
  onToggleUser,
  onSelectAllUsers,
}) {
  const today = todayKey();

  // Cari tombol cepat yang aktif
  const activeQuick = QUICK.find(q => q.from === dateRange.from && q.to === dateRange.to);

  // User + jumlah titik berdasarkan rentang tanggal aktif
  const usersWithData = useMemo(() => {
    const counts = {};
    allLocations.forEach(loc => {
      const { from, to } = dateRange;
      if (from) {
        const key = getLocalDateKey(loc.timestamp || loc.localTimestamp);
        if (!key) return;
        const inRange = to ? (key >= from && key <= to) : key === from;
        if (!inRange) return;
      }
      if (!loc.userName) return;
      counts[loc.userName] = (counts[loc.userName] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [allLocations, dateRange]);

  const isVisible     = (name) => !visibleUsers || visibleUsers.has(name);
  const visibleCount  = usersWithData.filter(u => isVisible(u.name)).length;
  const allNames      = usersWithData.map(u => u.name);

  // Label rentang yang sedang aktif (untuk info kecil)
  const rangeLabel = useMemo(() => {
    if (!dateRange.from) return null;
    if (dateRange.from === dateRange.to || !dateRange.to)
      return formatLabel(dateRange.from);
    return `${formatLabel(dateRange.from)} – ${formatLabel(dateRange.to)}`;
  }, [dateRange]);

  return (
    <div className="pv-wrap">

      {/* ══ SECTION 1 : DAFTAR PENGGUNA ══ */}
      <div className="pv-card">
          <p className="pv-card-title" style={{ margin: 0 }}>
            <Users size={13} strokeWidth={2.5} />
            Pengguna
            {usersWithData.length > 0 && (
              <span className="pv-title-count">{visibleCount}/{usersWithData.length} tampil</span>
            )}
          </p>

        {/* Quick buttons */}
        <div className="pv-quick-row">
          {QUICK.map(q => (
            <button
              key={q.label}
              className={`pv-quick-btn${activeQuick?.label === q.label ? ' active' : ''}`}
              onClick={() => onDateRange({ from: q.from, to: q.to })}
            >
              {q.label}
            </button>
          ))}
        </div>

        <div className="pv-card-title-row">

          {usersWithData.length > 0 && (
            <div className="pv-bulk-actions">
              <button className="pv-bulk-btn" onClick={() => onSelectAllUsers(allNames)}>
                Tampilkan Semua
              </button>
              <span className="pv-sep">·</span>
              <button className="pv-bulk-btn pv-bulk-btn--dim" onClick={() => onSelectAllUsers([])}>
                Sembunyikan Semua
              </button>
            </div>
          )}
        </div>

        {usersWithData.length === 0 ? (
          <div className="pv-empty">
            <Users size={36} strokeWidth={1.2} />
            <p>{dateRange.from ? 'Tidak ada data di rentang ini' : 'Belum ada pengguna'}</p>
          </div>
        ) : (
          <div className="pv-user-list">
            {usersWithData.map(({ name, count }) => {
              const color   = getUserColor(name);
              const visible = isVisible(name);
              return (
                <button
                  key={name}
                  className={`pv-user-row${visible ? ' pv-row--on' : ' pv-row--off'}`}
                  style={visible ? { '--row-color': color } : {}}
                  onClick={() => onToggleUser(name)}
                >
                  {/* Avatar */}
                  <div
                    className="pv-avatar"
                    style={{ background: visible ? color : 'var(--muted-foreground)' }}
                  >
                    <span className="material-icons">person</span>
                  </div>

                  {/* Nama */}
                  <span className="pv-uname">{name}</span>

                  {/* Jumlah titik */}
                  <span className="pv-ptcount">{count} titik</span>

                  {/* Eye icon */}
                  <span className={`pv-eye${visible ? ' pv-eye--on' : ' pv-eye--off'}`}>
                    {visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>


      {/* ══ SECTION 2 : FILTER TANGGAL ══ */}
      <div className="pv-card">

        {/* Divider */}
        <div className="pv-or">Filter tanggal manual</div>

        {/* Manual date pickers */}
        <div className="pv-date-grid">
          <div className="pv-date-field">
            <label className="pv-date-lbl">Dari</label>
            <input
              type="date"
              className="pv-date-inp"
              value={dateRange.from}
              max={dateRange.to || today}
              onChange={e => onDateRange({ from: e.target.value, to: dateRange.to })}
            />
          </div>
          <div className="pv-date-field">
            <label className="pv-date-lbl">Sampai</label>
            <div className="pv-date-inp-row">
              <input
                type="date"
                className="pv-date-inp"
                value={dateRange.to}
                min={dateRange.from}
                max={today}
                placeholder="opsional"
                onChange={e => onDateRange({ from: dateRange.from, to: e.target.value })}
              />
              {dateRange.to && (
                <button
                  className="pv-clr-btn"
                  title="Hapus tanggal akhir"
                  onClick={() => onDateRange({ from: dateRange.from, to: '' })}
                >×</button>
              )}
            </div>
            {dateRange.from && !dateRange.to && (
              <span className="pv-hint">kosong = satu hari saja</span>
            )}
          </div>
        </div>

        {/* Rentang aktif */}
        {rangeLabel && (
          <div className="pv-range-badge">
            <Calendar size={12} />
            {rangeLabel}
          </div>
        )}
      </div>

    </div>
  );
}
