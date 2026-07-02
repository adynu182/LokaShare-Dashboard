import { AlertTriangle, Calendar, Check, ShieldCheck, Trash2, Users } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { getLocalDateKey } from '../utils/helpers';
import { getUserColor } from '../utils/markerColors';

// ── Helpers tanggal (pola sama dengan PeopleView, untuk konsistensi) ──
function toLocalKey(d) {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
const todayKey    = () => toLocalKey(new Date());
const daysAgoKey  = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return toLocalKey(d); };
const formatLabel = (key) => {
  if (!key) return '';
  const [y, m, d] = key.split('-');
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Tombol cepat pilih tanggal
const QUICK = [
  { label: 'Hari Ini',        from: todayKey(),   to: todayKey()   },
  { label: 'Kemarin',         from: daysAgoKey(1), to: daysAgoKey(1) },
  { label: '7 Hari Terakhir', from: daysAgoKey(6), to: todayKey()   },
  { label: 'Semua Tanggal',   from: '',            to: ''           },
];

// Apakah satu lokasi cocok dengan rentang tanggal yang dipilih untuk dihapus?
// - kosong semua      → semua tanggal (tidak difilter)
// - "dari" saja        → tepat satu hari itu
// - "sampai" saja       → semua data sampai (termasuk) tanggal itu — berguna utk bersih2 data lama
// - keduanya diisi      → rentang inklusif kedua ujung
function matchesDateRange(loc, { from, to }) {
  if (!from && !to) return true;
  const key = getLocalDateKey(loc.timestamp || loc.localTimestamp);
  if (!key) return false;
  if (from && to) return key >= from && key <= to;
  if (from && !to) return key === from;
  return key <= to;
}

export default function ManageView({ users = [], allLocations = [], onDeleteLocations }) {
  const [selectedUsers, setSelectedUsers] = useState([]);            // [] = semua pengguna
  const [dateRange, setDateRange]         = useState({ from: '', to: '' }); // kosong = semua tanggal
  const [confirming, setConfirming]       = useState(false);
  const [deleting, setDeleting]           = useState(false);

  const today = todayKey();
  const activeQuick = QUICK.find(q => q.from === dateRange.from && q.to === dateRange.to);

  const toggleUser = (name) => {
    setSelectedUsers(prev => (prev.includes(name) ? prev.filter(u => u !== name) : [...prev, name]));
    setConfirming(false);
  };

  const handleAllUsers = () => {
    setSelectedUsers([]);
    setConfirming(false);
  };

  const handleDateRange = (next) => {
    setDateRange(next);
    setConfirming(false);
  };

  // ── Hitung data yang cocok dengan filter saat ini (WHO × WHEN) ──
  const targetLocations = useMemo(() => (
    allLocations.filter(loc => {
      if (selectedUsers.length > 0 && !selectedUsers.includes(loc.userName)) return false;
      return matchesDateRange(loc, dateRange);
    })
  ), [allLocations, selectedUsers, dateRange]);

  const targetCount = targetLocations.length;

  const breakdown = useMemo(() => {
    const counts = {};
    targetLocations.forEach(loc => {
      if (!loc.userName) return;
      counts[loc.userName] = (counts[loc.userName] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [targetLocations]);

  const isAllUsersEffective = selectedUsers.length === 0 || selectedUsers.length === users.length;
  const isDeleteEverything  = isAllUsersEffective && !dateRange.from && !dateRange.to;

  const rangeLabel = useMemo(() => {
    const { from, to } = dateRange;
    if (!from && !to) return 'semua tanggal';
    if (from && to && from !== to) return `${formatLabel(from)} – ${formatLabel(to)}`;
    if (from && (!to || to === from)) return formatLabel(from);
    return `s/d ${formatLabel(to)}`;
  }, [dateRange]);

  const whoLabel = isAllUsersEffective
    ? 'semua pengguna'
    : selectedUsers.length === 1
      ? selectedUsers[0]
      : `${selectedUsers.length} pengguna terpilih`;

  const handleRequestDelete = () => {
    if (targetCount === 0) return;
    setConfirming(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    const ids = targetLocations.map(loc => loc.id);
    const message = `Berhasil menghapus ${ids.length.toLocaleString('id-ID')} titik data (${whoLabel} · ${rangeLabel})`;
    const result = await onDeleteLocations(ids, message);
    setDeleting(false);
    setConfirming(false);
    if (result?.success) {
      setSelectedUsers([]);
      setDateRange({ from: '', to: '' });
    }
  };

  if (users.length === 0) {
    return (
      <div className="view-container">
        <div className="mv-empty">
          <ShieldCheck size={36} strokeWidth={1.2} />
          <p>Belum ada data untuk dikelola</p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="mv-card">
        <p className="mv-card-title">
          <Trash2 size={13} strokeWidth={2.5} />
          Hapus Data Terperinci
        </p>
        <p className="section-desc" style={{ margin: 0 }}>
          Pilih pengguna dan/atau rentang tanggal, lalu hapus hanya data yang sesuai.
        </p>

        {/* ══ WHO : Pengguna ══ */}
        <div className="mv-block">
          <span className="mv-label"><Users size={12} strokeWidth={2.5} /> Pengguna</span>

          <div className="mv-chip-row">
            <button
              className={`mv-chip${selectedUsers.length === 0 ? ' active' : ''}`}
              onClick={handleAllUsers}
            >
              Semua Pengguna
            </button>
          </div>

          <div className="mv-user-grid">
            {users.map(name => {
              const active = selectedUsers.includes(name);
              const color  = getUserColor(name);
              return (
                <button
                  key={name}
                  className={`mv-user-chip${active ? ' active' : ''}`}
                  style={active ? { '--chip-color': color } : undefined}
                  onClick={() => toggleUser(name)}
                >
                  <span className="mv-user-dot" style={{ background: color }} />
                  <span className="mv-user-chip-name">{name}</span>
                  {active && <Check size={12} strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ══ WHEN : Rentang tanggal ══ */}
        <div className="mv-block">
          <span className="mv-label"><Calendar size={12} strokeWidth={2.5} /> Rentang Tanggal</span>

          <div className="pv-quick-row">
            {QUICK.map(q => (
              <button
                key={q.label}
                className={`pv-quick-btn${activeQuick?.label === q.label ? ' active' : ''}`}
                onClick={() => handleDateRange({ from: q.from, to: q.to })}
              >
                {q.label}
              </button>
            ))}
          </div>

          <div className="pv-date-grid">
            <div className="pv-date-field">
              <label className="pv-date-lbl">Dari</label>
              <input
                type="date"
                className="pv-date-inp"
                value={dateRange.from}
                max={dateRange.to || today}
                onChange={e => handleDateRange({ from: e.target.value, to: dateRange.to })}
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
                  onChange={e => handleDateRange({ from: dateRange.from, to: e.target.value })}
                />
                {(dateRange.from || dateRange.to) && (
                  <button
                    className="pv-clr-btn"
                    title="Reset tanggal"
                    onClick={() => handleDateRange({ from: '', to: '' })}
                  >×</button>
                )}
              </div>
            </div>
          </div>

          <span className="mv-hint">
            {!dateRange.from && !dateRange.to && 'Kosong = semua tanggal'}
            {dateRange.from && !dateRange.to && 'Hanya "Dari" diisi = satu hari itu saja'}
            {!dateRange.from && dateRange.to && 'Hanya "Sampai" diisi = semua data sampai tanggal itu'}
            {dateRange.from && dateRange.to && dateRange.from !== dateRange.to && 'Rentang tanggal, termasuk kedua ujungnya'}
          </span>
        </div>

        {/* ══ PREVIEW ══ */}
        <div className={`mv-preview${targetCount === 0 ? ' mv-preview--empty' : ''}`}>
          <AlertTriangle size={18} />
          <div className="mv-preview-text">
            <strong>{targetCount.toLocaleString('id-ID')}</strong> titik lokasi akan dihapus
            <span className="mv-preview-sub">dari {whoLabel} · {rangeLabel}</span>
          </div>
        </div>

        {breakdown.length > 1 && (
          <div className="mv-breakdown">
            {breakdown.slice(0, 6).map(([name, count]) => (
              <span key={name} className="mv-breakdown-chip" style={{ '--chip-color': getUserColor(name) }}>
                {name} · {count}
              </span>
            ))}
            {breakdown.length > 6 && (
              <span className="mv-breakdown-chip mv-breakdown-chip--more">+{breakdown.length - 6} lainnya</span>
            )}
          </div>
        )}

        {isDeleteEverything && targetCount > 0 && (
          <div className="mv-danger-banner">
            <AlertTriangle size={14} />
            Ini akan menghapus SELURUH data dari SEMUA pengguna, tanpa filter tanggal.
          </div>
        )}

        {/* ══ ACTION ══ */}
        {!confirming ? (
          <button
            className="mv-btn-delete"
            disabled={targetCount === 0}
            onClick={handleRequestDelete}
          >
            <Trash2 size={16} />
            {targetCount > 0 ? `Hapus ${targetCount.toLocaleString('id-ID')} Data` : 'Tidak Ada Data Cocok'}
          </button>
        ) : (
          <div className="mv-confirm-box">
            <p>
              Yakin ingin menghapus <strong>{targetCount.toLocaleString('id-ID')}</strong> titik data
              ({whoLabel} · {rangeLabel})? Aksi ini <strong>tidak bisa dibatalkan</strong>.
            </p>
            <div className="confirm-actions">
              <button className="btn-cancel" disabled={deleting} onClick={() => setConfirming(false)}>
                Batal
              </button>
              <button className="btn-delete-confirm" disabled={deleting} onClick={handleConfirmDelete}>
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="info-section glass">
        <ShieldCheck className="mv-shield-icon" size={24} />
        <div>
          <h4>Keamanan Data</h4>
          <p>Semua data disimpan di Firebase. Data yang sudah dihapus tidak dapat dikembalikan.</p>
        </div>
      </div>
    </div>
  );
}
