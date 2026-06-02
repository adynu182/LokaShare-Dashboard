import React from 'react';
import { User, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';
import { getUserColor } from '../utils/markerColors';

export default function PeopleView({ users, selectedUser, onSelectUser }) {
  return (
    <div className="view-container">
      <div className="user-list">
        {users.length === 0 ? (
          <div className="empty-state">
            <User size={48} className="text-muted-foreground" />
            <p>Tidak ada pengguna ditemukan</p>
          </div>
        ) : (
          users.map((user) => (
            <button
              key={user}
              onClick={() => onSelectUser(user)}
              className={cn("user-card", selectedUser === user && "active")}
            >
              <div 
                className="user-avatar" 
                style={{ backgroundColor: getUserColor(user) }}
              >
                {user.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user}</span>
                <span className="user-status">Klik untuk melihat lokasi</span>
              </div>
              <ChevronRight size={20} className="text-muted-foreground" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
