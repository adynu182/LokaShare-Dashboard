import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UserSelector from './components/UserSelector';
import MapView from './components/MapView';
import BottomPanel from './components/BottomPanel';
import Toast from './components/Toast';
import { useLocations } from './hooks/useLocations';
import { getTimestampMs, getLocalDateKey, formatLocalDate } from './utils/helpers';
import './App.css';

export default function App() {
  const { allLocations, users, loading, error, connectionStatus } = useLocations();
  
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [panelState, setPanelState] = useState('peek'); // 'collapsed' | 'peek' | 'expanded'
  const [activeMapIndex, setActiveMapIndex] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Auto toast on new location records or filter change
  useEffect(() => {
    if (allLocations.length > 0 && !loading) {
      triggerToast(`${allLocations.length} titik lokasi aktif dimuat`);
    }
  }, [allLocations.length, loading]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setActiveMapIndex(null); // Reset focus
    if (user) {
      triggerToast(`Menampilkan lokasi: ${user}`);
    } else {
      triggerToast('Menampilkan semua user');
    }
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setActiveMapIndex(null); // Reset focus
    if (date) {
      triggerToast(`Menampilkan tanggal: ${formatLocalDate(date)}`);
    } else {
      triggerToast('Menampilkan semua tanggal');
    }
  };

  const triggerToast = (message) => {
    setToastMessage(message);
  };

  const handleCardClick = (index) => {
    setActiveMapIndex(index);
    // Bring panel down slightly to view map comfortably on click
    if (panelState === 'expanded') {
      setPanelState('peek');
    }
  };

  // Generate unique date keys from all locations
  const dates = [
    ...new Set(
      allLocations.map((loc) => getLocalDateKey(loc.timestamp || loc.localTimestamp)).filter(Boolean)
    ),
  ].sort((a, b) => b.localeCompare(a));

  // Filter locations
  let filteredLocations = [...allLocations];
  if (selectedUser) {
    filteredLocations = filteredLocations.filter(loc => loc.userName === selectedUser);
  }
  if (selectedDate) {
    filteredLocations = filteredLocations.filter(
      loc => getLocalDateKey(loc.timestamp || loc.localTimestamp) === selectedDate
    );
  }

  // Sort locations: Newest first
  filteredLocations.sort((a, b) => getTimestampMs(b) - getTimestampMs(a));

  return (
    <div className="app-container">
      {/* Top Header Overlay */}
      <Header connectionStatus={connectionStatus} />

      {/* Floating User & Date Filters */}
      <UserSelector 
        users={users} 
        selectedUser={selectedUser} 
        onSelectUser={handleSelectUser}
        dates={dates}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
      />

      {/* Fullscreen Map Background */}
      <MapView 
        locations={filteredLocations}
        selectedUser={selectedUser}
        onMarkerClick={handleCardClick}
        activeMapIndex={activeMapIndex}
      />

      {/* Collapsible Bottom Panel */}
      <BottomPanel 
        locations={filteredLocations}
        panelState={panelState}
        setPanelState={setPanelState}
        onCardClick={handleCardClick}
        loading={loading}
      />

      {/* Notification Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}
