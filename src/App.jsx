import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocations } from './hooks/useLocations';
import { deleteUserLocations } from './utils/deleteUserData';
import { getTimestampMs } from './utils/helpers';
import StatsHeader from './components/StatsHeader';
import BottomNav from './components/BottomNav';
import MainSheet from './components/MainSheet';
import MapCanvas from './components/MapCanvas';
import PeopleView from './views/PeopleView';
import ManageView from './views/ManageView';
import PetaView from './views/PetaView';
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

  // Filter titik bergerak vs diam — 'all' | 'moving' | 'stationary'
  const [stationaryFilter, setStationaryFilter] = useState('all');

  const filteredLocations = useMemo(() =>
    allLocations
      .filter(loc => !selectedUser || loc.userName === selectedUser)
      .filter(loc => {
        if (!selectedDate) return true;
        const ms = getTimestampMs(loc);
        if (!ms) return false;
        const date = new Date(ms).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        return date === selectedDate;
      })
      // Filter bergerak vs diam
      .filter(loc => {
        if (stationaryFilter === 'all') return true;
        if (stationaryFilter === 'moving') return loc.isStationary === false;
        if (stationaryFilter === 'stationary') return loc.isStationary === true;
        return true;
      }),
    [allLocations, selectedUser, selectedDate, stationaryFilter]
  );

  // Hitung jumlah titik per kategori (dari lokasi sebelum filter stationary)
  const stationaryCounts = useMemo(() => {
    const base = allLocations
      .filter(loc => !selectedUser || loc.userName === selectedUser)
      .filter(loc => {
        if (!selectedDate) return true;
        const ms = getTimestampMs(loc);
        if (!ms) return false;
        const date = new Date(ms).toLocaleDateString('id-ID', {
          day: 'numeric', month: 'long', year: 'numeric'
        });
        return date === selectedDate;
      });

    return {
      all: base.length,
      moving: base.filter(loc => loc.isStationary === false).length,
      stationary: base.filter(loc => loc.isStationary === true).length,
    };
  }, [allLocations, selectedUser, selectedDate]);

  const latestLocation = filteredLocations[0];

  useEffect(() => {
    if (!loading) {
      if (!selectedUser && users.length > 0) setSelectedUser(users[0]);
    }
  }, [loading, users, selectedUser]);

  const triggerToast = (message, type = 'info') => setToast({ message, type });

  const handleCloseToast = useCallback(() => {
    setToast(prev => ({ ...prev, message: '' }));
  }, []);

  const handleSelectUser = (user) => {
    if (selectedUser === user) {
      setSelectedUser('');
    } else {
      setSelectedUser(user);
    }
    setSelectedDate('');
    setActiveIndex(null);
    setStationaryFilter('all'); // Reset filter saat ganti user
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setActiveIndex(null);
    setActiveTab('map');
    setIsSheetOpen(true);
    setStationaryFilter('all'); // Reset filter saat ganti tanggal
    if (date) {
      triggerToast(`Melihat lokasi tanggal ${date}`, 'info');
    } else {
      triggerToast(`Melihat semua lokasi ${selectedUser}`, 'info');
    }
  };

  const handleStationaryFilter = useCallback((value) => {
    setStationaryFilter(value);
    setActiveIndex(null);
    const label = value === 'moving' ? 'Bergerak' : value === 'stationary' ? 'Diam' : 'Semua';
    triggerToast(`Filter: ${label} (${stationaryCounts[value]} titik)`, 'info');
  }, [stationaryCounts]);

  const handleDeleteUser = async (userName) => {
    const result = await deleteUserLocations(userName);
    if (result.success) {
      triggerToast(`Berhasil menghapus data ${userName}`, 'success');
      if (selectedUser === userName) setSelectedUser('');
    } else {
      triggerToast(`Gagal: ${result.error}`, 'error');
    }
  };

  const handleMarkerClick = (index) => {
    setActiveIndex(index);
  };

  return (
    <div className="app-container">
      <MapCanvas
        locations={filteredLocations}
        selectedUser={selectedUser}
        activeIndex={activeIndex}
        onMarkerClick={handleMarkerClick}
      />

      <StatsHeader
        connectionStatus={connectionStatus}
        selectedUser={selectedUser}
        latestLocation={latestLocation}
      />

      <MainSheet
        isOpen={isSheetOpen}
        setIsOpen={setIsSheetOpen}
        title={
          activeTab === 'people' ? 'Daftar Orang' :
            activeTab === 'manage' ? 'Pengaturan' : 'Daftar Lokasi'
        }
      >
        {activeTab === 'map' && (
          <PetaView
            locations={filteredLocations}
            stationaryFilter={stationaryFilter}
            stationaryCounts={stationaryCounts}
            onStationaryFilter={handleStationaryFilter}
            onSelectLocation={(index) => {
              setActiveIndex(index);
              setIsSheetOpen(false);
            }}
          />
        )}
        {activeTab === 'people' && (
          <PeopleView
            users={users}
            selectedUser={selectedUser}
            onSelectUser={handleSelectUser}
            allLocations={allLocations}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        )}
        {activeTab === 'manage' && (
          <ManageView
            users={users}
            onDeleteUser={handleDeleteUser}
          />
        )}
      </MainSheet>

      <BottomNav activeTab={activeTab} setActiveTab={(tab) => {
        setActiveTab(tab);
        setIsSheetOpen(true);
      }} />

      <ModernToast
        message={toast.message}
        type={toast.type}
        onClose={handleCloseToast}
      />
    </div>
  );
}
