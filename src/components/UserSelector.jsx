import React from 'react';
import { formatLocalDate } from '../utils/helpers';

export default function UserSelector({ 
  users, 
  selectedUser, 
  onSelectUser,
  dates,
  selectedDate,
  onSelectDate 
}) {
  return (
    <div className="selector-bar">
      <div className="selector-grid">
        {/* User Filter */}
        <div className="select-wrapper">
          <select 
            id="userSelect" 
            value={selectedUser} 
            onChange={(e) => onSelectUser(e.target.value)}
          >
            {users.map((user) => (
              <option key={user} value={user}>
                👤 {user}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="select-wrapper">
          <select 
            id="dateSelect" 
            value={selectedDate} 
            onChange={(e) => onSelectDate(e.target.value)}
          >
            {dates.map((dateKey) => (
              <option key={dateKey} value={dateKey}>
                📅 {formatLocalDate(dateKey)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
