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

export function getPreferredTimestamp(loc) {
  return loc?.localTimestamp ?? loc?.timestamp ?? null;
}

export function getTimestampMs(loc) {
  const ts = getPreferredTimestamp(loc);
  if (!ts) return 0;
  if (ts.toDate) return ts.toDate().getTime();
  if (ts.seconds) return ts.seconds * 1000;
  if (typeof ts === 'number') return ts;
  return new Date(ts).getTime() || 0;
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

