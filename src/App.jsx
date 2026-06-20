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

  // FIX #15: Memoize filteredLocations agar tidak dihitung ulang tiap render
  // FIX #2: Gunakan getTimestampMs() agar aman untuk semua format timestamp Firestore
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
      }),
    [allLocations, selectedUser, selectedDate]
  );

  const latestLocation = filteredLocations[0];

  // FIX #1: Tambahkan selectedUser ke dependency array untuk cegah stale closure
  useEffect(() => {
    if (!loading) {
      if (!selectedUser && users.length > 0) setSelectedUser(users[0]);
    }
  }, [loading, users, selectedUser]);

  // Handlers
  const triggerToast = (message, type = 'info') => setToast({ message, type });

  // FIX #3: useCallback agar referensi onClose stabil → timer Toast tidak reset tiap render
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
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setActiveIndex(null);
    setActiveTab('map');
    setIsSheetOpen(true);
    if (date) {
      triggerToast(`Melihat lokasi tanggal ${date}`, 'info');
    } else {
      triggerToast(`Melihat semua lokasi ${selectedUser}`, 'info');
    }
  };

  const handleDeleteUser = async (userName) => {
    const result = await deleteUserLocations(userName);
    if (result.success) {
      triggerToast(`Berhasil menghapus data ${userName}`, 'success');
      // FIX #9: Reset selectedUser hanya jika user yang dihapus adalah yang sedang aktif
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
            activeTab === 'manage' ? 'Pengaturan' : 'Daftar Lokasi'
        }
      >
        {activeTab === 'map' && (
          <PetaView
            locations={filteredLocations}
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

      {/* Navigation Hub */}
      <BottomNav activeTab={activeTab} setActiveTab={(tab) => {
        setActiveTab(tab);
        setIsSheetOpen(true);
      }} />

      {/* FIX #3: Pakai handleCloseToast (useCallback) agar timer tidak reset tiap render */}
      <ModernToast
        message={toast.message}
        type={toast.type}
        onClose={handleCloseToast}
      />
    </div>
  );
}
