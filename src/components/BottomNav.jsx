import React from 'react';
import { Map, Users, Settings, List, History } from 'lucide-react';
import { cn } from '../utils/cn';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'map', icon: History, label: 'History' },
    { id: 'people', icon: Users, label: 'Orang' },
    { id: 'manage', icon: Settings, label: 'Atur' },
  ];

  return (
    <nav className="bottom-nav glass">
      {tabs.map(({ id, icon: Icon, label }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn("nav-item", isActive && "active")}
          >
            <div className="icon-wrapper">
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="nav-label">{label}</span>
            {isActive && <div className="active-indicator" />}
          </button>
        );
      })}
    </nav>
  );
}
