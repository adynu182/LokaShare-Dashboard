import React, { useEffect, useState } from 'react';
import { Clock, Wifi, WifiOff } from 'lucide-react';
import { cn } from '../utils/cn';
import { formatTimeAgo, getTimestampMs } from '../utils/helpers';

// Di atas ambang ini, pill "Last Seen" ditandai stale (gaya sama dengan baterai kritis)
const STALE_THRESHOLD_MS = 30 * 60 * 1000; // 30 menit

export default function StatsHeader({ connectionStatus, selectedUser, latestLocation }) {
  const isOnline = connectionStatus === 'Terhubung';

  // "Sekarang" disimpan sebagai state (bukan Date.now() langsung saat render, agar
  // komponen tetap pure) dan diperbarui berkala supaya label "... Ago" terus berjalan
  // walau tidak ada data lokasi baru masuk.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  const lastSeenMs    = latestLocation ? getTimestampMs(latestLocation) : 0;
  const lastSeenLabel = lastSeenMs ? formatTimeAgo(lastSeenMs, now) : null;
  const isStale        = lastSeenMs ? (now - lastSeenMs) > STALE_THRESHOLD_MS : false;

  return (
    <header className="stats-header glass">
      <div className="status-group">
        <div className={cn("status-pill", isOnline ? "online" : "offline")}>
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{connectionStatus}</span>
        </div>
        {selectedUser && (
          <div className="user-pill">
            <span className="user-name">{selectedUser}</span>
          </div>
        )}
      </div>

      {lastSeenLabel && (
        <div className="stats-group">
          <div className={cn("stat-pill", isStale && "critical")}>
            <Clock size={14} />
            <span>Last Seen : {lastSeenLabel}</span>
          </div>
        </div>
      )}
    </header>
  );
}
