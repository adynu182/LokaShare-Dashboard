import React, { useMemo } from 'react';
import { User, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '../utils/cn';
import { getUserColor } from '../utils/markerColors';

export default function PeopleView({ users, selectedUser, onSelectUser, allLocations, selectedDate, onSelectDate }) {
  // Get unique dates for a specific user
  const getUserDates = (userName) => {
    const userLocs = allLocations.filter(loc => loc.userName === userName && loc.timestamp);
    const dates = userLocs.map(loc => 
      new Date(loc.timestamp.seconds * 1000).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    );
    return [...new Set(dates)];
  };

  return (
    <div className="view-container">
      <div className="user-list">
        {users.length === 0 ? (
          <div className="empty-state">
            <User size={48} className="text-muted-foreground" />
            <p>Tidak ada pengguna ditemukan</p>
          </div>
        ) : (
          users.map((user) => {
            const isSelected = selectedUser === user;
            const userDates = isSelected ? getUserDates(user) : [];
            
            const userColor = getUserColor(user);
            
            return (
              <div key={user} className="user-card-wrapper">
                <button
                  onClick={() => onSelectUser(user)}
                  className={cn("user-card", isSelected && "active")}
                  style={isSelected ? { borderColor: userColor } : {}}
                >
                  <div 
                    className="user-avatar" 
                    style={{ backgroundColor: userColor }}
                  >
                    {user.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user}</span>
                  </div>
                  <ChevronRight 
                    size={20} 
                    className={cn("transition-transform", isSelected && "rotate-90")} 
                    style={{ color: userColor }}
                  />
                </button>

                {/* Collapsible Date Filter */}
                {isSelected && (
                  <div className="date-filter-collapse">
                    <div className="date-filter-scroll">
                      <button
                        onClick={() => onSelectDate('')}
                        className={cn("date-pill", !selectedDate && "active")}
                        style={!selectedDate ? { backgroundColor: userColor, borderColor: userColor } : {}}
                      >
                        Semua
                      </button>
                      {userDates.map(date => (
                        <button
                          key={date}
                          onClick={() => onSelectDate(date)}
                          className={cn("date-pill", selectedDate === date && "active")}
                          style={selectedDate === date ? { backgroundColor: userColor, borderColor: userColor } : {}}
                        >
                          <Calendar size={14} />
                          {date}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
