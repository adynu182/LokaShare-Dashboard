import React, { useState, useEffect } from 'react';
import { useLocations } from './hooks/useLocations';
import { getLocalDateKey } from './utils/helpers';
import { deleteUserLocations } from './utils/deleteUserData';
import StatsHeader from './components/StatsHeader';
import BottomNav from './components/BottomNav';
import MainSheet from './components/MainSheet';
import MapCanvas from './components/MapCanvas';
import PeopleView from './views/PeopleView';
import TimelineView from './views/TimelineView';
import ManageView from './views/ManageView';
import ModernToast from './components/ModernToast';
import './App.css';

export default function App() {
  const { allLocations, users, loading, error, connectionStatus } = useLocations();
  
  // State
  const [activeTab, setActiveTab] = useState('map');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [activeIndex, setActiveIndex] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  // Computed
  const dates = [
    ...new Set(
      allLocations.map((loc) => getLocalDateKey(loc.localTimestamp)).filter(Boolean)
    ),
  ].sort((a, b) => b.localeCompare(a));

  const filteredLocations = allLocations
    .filter(loc => !selectedUser || loc.userName === selectedUser)
    .filter(loc => !selectedDate || getLocalDateKey(loc.localTimestamp) === selectedDate);

  const latestLocation = filteredLocations[0];

  // Auto-select initial data
  useEffect(() => {
    if (!loading) {
      if (!selectedUser && users.length > 0) setSelectedUser(users[0]);
      if (!selectedDate && dates.length > 0) setSelectedDate(dates[0]);
    }
  }, [loading, users, dates]);

  // Handlers
  const triggerToast = (message, type = 'info') => setToast({ message, type });

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setActiveIndex(null);
    setActiveTab('map');
    setIsSheetOpen(false);
    triggerToast(`Melihat lokasi ${user}`, 'info');
  };

  const handleDeleteUser = async (userName) => {
    const result = await deleteUserLocations(userName);
    if (result.success) {
      triggerToast(`Berhasil menghapus data ${userName}`, 'success');
      setSelectedUser('');
    } else {
      triggerToast(`Gagal: ${result.error}`, 'error');
    }
  };

  const handleMarkerClick = (index) => {
    setActiveIndex(index);
    if (!isSheetOpen) setIsSheetOpen(true);
    setActiveTab('timeline');
  };

  return (
    <div className="app-container">
      {/* Background Map */}
      <MapCanvas 
        locations={filteredLocations}
        selectedUser={selectedUser}
        activeIndex={activeIndex}
        onMarkerClick={handleMarkerClick}
      />

      {/* Floating Header */}
      <StatsHeader 
        connectionStatus={connectionStatus}
        selectedUser={selectedUser}
        latestLocation={latestLocation}
      />

      {/* Interactive Bottom Sheet */}
      <MainSheet 
        isOpen={isSheetOpen} 
        setIsOpen={setIsSheetOpen}
        title={
          activeTab === 'people' ? 'Daftar Orang' :
          activeTab === 'timeline' ? `Riwayat ${selectedUser}` :
          activeTab === 'manage' ? 'Pengaturan' : 'Detail Lokasi'
        }
      >
        {activeTab === 'people' && (
          <PeopleView 
            users={users} 
            selectedUser={selectedUser} 
            onSelectUser={handleSelectUser} 
          />
        )}
        {(activeTab === 'timeline' || activeTab === 'map') && (
          <TimelineView 
            locations={filteredLocations}
            dates={dates}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            activeIndex={activeIndex}
            onCardClick={setActiveIndex}
          />
        )}
        {activeTab === 'manage' && (
          <ManageView 
            users={users} 
            onDeleteUser={handleDeleteUser} 
          />
        )}
      </MainSheet>

      {/* Navigation Hub */}
      <BottomNav activeTab={activeTab} setActiveTab={(tab) => {
        setActiveTab(tab);
        if (tab !== 'map') setIsSheetOpen(true);
      }} />

      {/* Notifications */}
      <ModernToast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, message: '' })} 
      />
    </div>
  );
}
