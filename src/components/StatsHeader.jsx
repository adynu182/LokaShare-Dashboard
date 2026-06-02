import React from 'react';
import { Battery, BatteryCharging, Zap, Wifi, WifiOff } from 'lucide-react';
import { cn } from '../utils/cn';

export default function StatsHeader({ connectionStatus, selectedUser, latestLocation }) {
  const isOnline = connectionStatus === 'Terhubung';
  const battery = latestLocation?.battery;
  const isCharging = latestLocation?.isCharging;
  const accuracy = latestLocation?.accuracy;

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

      {latestLocation && (
        <div className="stats-group">
          {accuracy && (
            <div className="stat-pill">
              <Zap size={14} className="text-primary" />
              <span>{Math.round(accuracy)}m</span>
            </div>
          )}
          {battery !== undefined && (
            <div className={cn("stat-pill", battery <= 15 && !isCharging && "critical")}>
              {isCharging ? <BatteryCharging size={14} /> : <Battery size={14} />}
              <span>{battery}%</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
