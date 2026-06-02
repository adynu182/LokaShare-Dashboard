import React from 'react';
import { Clock, Calendar, MapPin } from 'lucide-react';
import { cn } from '../utils/cn';
import { formatTimestamp, formatLocalDate } from '../utils/helpers';
import { getUserColor } from '../utils/markerColors';

export default function TimelineView({ locations, dates, selectedDate, onSelectDate, activeIndex, onCardClick }) {
  return (
    <div className="view-container">
      {/* Date Filter */}
      <div className="date-filter-scroll">
        {dates.map((date) => (
          <button
            key={date}
            onClick={() => onSelectDate(date)}
            className={cn("date-pill", selectedDate === date && "active")}
          >
            <Calendar size={14} />
            <span>{formatLocalDate(date)}</span>
          </button>
        ))}
      </div>

      <div className="timeline-list">
        {locations.length === 0 ? (
          <div className="empty-state">
            <Clock size={48} className="text-muted-foreground" />
            <p>Pilih orang dan tanggal untuk melihat riwayat</p>
          </div>
        ) : (
          locations.map((loc, i) => (
            <div 
              key={loc.id} 
              className={cn("timeline-item", activeIndex === i && "active")}
              onClick={() => onCardClick(i)}
            >
              <div className="timeline-marker">
                <div 
                  className="marker-line" 
                  style={{ backgroundColor: getUserColor(loc.userName) }} 
                />
                <div 
                  className="marker-dot-small" 
                  style={{ backgroundColor: getUserColor(loc.userName) }} 
                />
              </div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className="timeline-time">{formatTimestamp(loc.localTimestamp)}</span>
                  {i === 0 && <span className="latest-badge">Terbaru</span>}
                </div>
                <div className="timeline-details">
                  <div className="detail-item">
                    <MapPin size={12} />
                    <span>{loc.deviceModel || 'Perangkat tidak dikenal'}</span>
                  </div>
                  <div className="detail-item">
                    <span>Akurasi: {Math.round(loc.accuracy)}m</span>
                    {loc.battery !== undefined && (
                      <span> • Baterai: {loc.battery}%</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
