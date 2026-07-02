export function formatTimestamp(ts) {
  if (!ts) return '—';
  let date;
  
  if (ts.toDate) {
    date = ts.toDate();
  } else if (ts.seconds) {
    date = new Date(ts.seconds * 1000);
  } else if (typeof ts === 'number') {
    date = new Date(ts);
  } else {
    date = new Date(ts);
  }
  
  if (isNaN(date.getTime())) return '—';
  
  return date.toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

export function getTimestampMs(loc) {
  const ts = loc.localTimestamp;
  if (!ts) return 0;
  if (ts.toDate) return ts.toDate().getTime();
  if (ts.seconds) return ts.seconds * 1000;
  if (typeof ts === 'number') return ts;
  return new Date(ts).getTime() || 0;
}

/**
 * Ubah selisih waktu (ms) menjadi label relatif berbahasa Inggris untuk info
 * "Last Seen" di floating panel atas, misal "1 Minute Ago" / "3 Hours Ago" / "1 Day Ago".
 *
 * @param {number} ms - Timestamp (epoch ms) dari data lokasi
 * @param {number} nowMs - Waktu "sekarang" (default: Date.now())
 * @returns {string|null} label relatif, atau null jika ms tidak valid
 */
export function formatTimeAgo(ms, nowMs = Date.now()) {
  if (!ms || isNaN(ms)) return null;

  const diffMs = Math.max(0, nowMs - ms);
  const sec   = Math.floor(diffMs / 1000);
  const min   = Math.floor(sec / 60);
  const hour  = Math.floor(min / 60);
  const day   = Math.floor(hour / 24);
  const week  = Math.floor(day / 7);
  const month = Math.floor(day / 30);
  const year  = Math.floor(day / 365);

  const unit = (n, label) => `${n} ${label}${n !== 1 ? 's' : ''} Ago`;

  if (sec < 10)   return 'Just Now';
  if (sec < 60)   return unit(sec, 'Second');
  if (min < 60)   return unit(min, 'Minute');
  if (hour < 24)  return unit(hour, 'Hour');
  if (day < 7)    return unit(day, 'Day');
  if (week < 5)   return unit(week, 'Week');
  if (month < 12) return unit(month, 'Month');
  return unit(year, 'Year');
}

export function batteryClass(level) {
  if (level === undefined || level === null) return '';
  if (level <= 15) return 'critical';
  if (level <= 30) return 'low';
  return '';
}

export function batteryIcon(level, charging) {
  if (charging) return '⚡';
  if (level === undefined || level === null) return '🔋';
  if (level <= 15) return '🪫';
  if (level <= 30) return '🔋';
  return '🔋';
}
export function formatCoords(lat, lng) {
  if (lat === undefined || lat === null || lng === undefined || lng === null) return '—';
  return `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;
}

export function getLocalDateKey(ts) {
  if (!ts) return '';
  let date;
  if (ts.toDate) {
    date = ts.toDate();
  } else if (ts.seconds) {
    date = new Date(ts.seconds * 1000);
  } else if (typeof ts === 'number') {
    date = new Date(ts);
  } else {
    date = new Date(ts);
  }
  if (isNaN(date.getTime())) return '';
  
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatLocalDate(dateKey) {
  if (!dateKey) return 'Tanggal Tidak Diketahui';
  const [yyyy, mm, dd] = dateKey.split('-');
  const date = new Date(yyyy, mm - 1, dd);
  if (isNaN(date.getTime())) return dateKey;

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday = today.getFullYear() === date.getFullYear() &&
                  today.getMonth() === date.getMonth() &&
                  today.getDate() === date.getDate();
                  
  const isYesterday = yesterday.getFullYear() === date.getFullYear() &&
                      yesterday.getMonth() === date.getMonth() &&
                      yesterday.getDate() === date.getDate();

  if (isToday) return 'Hari Ini';
  if (isYesterday) return 'Kemarin';

  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

