import React from 'react';
import { formatTimestamp, batteryClass, batteryIcon, formatCoords } from '../utils/helpers';

export default function LocationCard({ loc, index, onClick }) {
  const battCls = batteryClass(loc.battery);
  const battIcon = batteryIcon(loc.battery, loc.isCharging);
  const coordsStr = formatCoords(loc.latitude, loc.longitude);
  const timeStr = formatTimestamp(loc.timestamp || loc.localTimestamp);

  return (
    <div 
      className="loc-card" 
      onClick={onClick}
      style={{ animationDelay: `${Math.min(index * 0.02, 0.2)}s` }}
    >
      <div className="loc-card-index">{index + 1}</div>
      <div className="loc-card-body">
        <div className="loc-card-top">
          <span className="loc-card-user">{loc.userName || 'Unknown'}</span>
          <span className="loc-card-time">{timeStr}</span>
        </div>
        <div className="loc-card-coords">{coordsStr}</div>
        <div className="loc-card-meta">
          {loc.battery !== undefined && loc.battery !== null && (
            <span className={`meta-tag battery ${battCls}`}>
              {battIcon} {loc.battery}%
            </span>
          )}
          {loc.isCharging && <span className="meta-tag charging">⚡ Charging</span>}
          {loc.deviceModel && <span className="meta-tag device">📱 {loc.deviceModel}</span>}
          {loc.accuracy && <span className="meta-tag accuracy">🎯 {Math.round(loc.accuracy)}m</span>}
          {loc.source && <span className="meta-tag source-tag">📡 {loc.source}</span>}
        </div>
      </div>
    </div>
  );
}
