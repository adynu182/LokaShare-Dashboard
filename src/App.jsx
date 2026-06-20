import React, { useState, useMemo, useCallback } from 'react';
import { useLocations } from './hooks/useLocations';
import { deleteUserLocations } from './utils/deleteUserData';
import { getLocalDateKey } from './utils/helpers';
import StatsHeader from './components/StatsHeader';
import BottomNav from './components/BottomNav';
import MainSheet from './components/MainSheet';
import MapCanvas from './components/MapCanvas';
import PeopleView from './views/PeopleView';
import ManageView from './views/ManageView';
import HistoryView from './views/HistoryView';
import ModernToast from './components/ModernToast';
import './App.css';

export default function App() {
  const { allLocations, users, loading, connectionStatus } = useLocations();

  const [activeTab, setActiveTab]         = useState('map');
  const [activeIndex, setActiveIndex]     = useState(null);
  const [isSheetOpen, setIsSheetOpen]     = useState(false);
  const [toast, setToast]                 = useState({ message: '', type: 'info' });
  const [stationaryFilter, setStationaryFilter] = useState('all');

  // --- Filter baru: rentang tanggal { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // --- Filter baru: Set nama user yang tampil. null = semua tampil
  const [visibleUsers, setVisibleUsers] = useState(null);

  // Helper: apakah lokasi masuk rentang tanggal aktif?
  const inDateRange = useCallback((loc) => {
    const { from, to } = dateRange;
    if (!from) return true;
    const key = getLocalDateKey(loc.timestamp || loc.localTimestamp);
    if (!key) return false;
    return to ? (key >= from && key <= to) : key === from;
  }, [dateRange]);

  // Lokasi yang lolos semua filter (ditampilkan di peta + list)
  const filteredLocations = useMemo(() =>
    allLocations
      .filter(loc => !visibleUsers || visibleUsers.has(loc.userName))
      .filter(inDateRange)
      .filter(loc => {
        if (stationaryFilter === 'moving')     return loc.isStationary === false;
        if (stationaryFilter === 'stationary') return loc.isStationary === true;
        return true;
      }),
    [allLocations, visibleUsers, inDateRange, stationaryFilter]
  );

  // Jumlah per kategori stationary (tanpa filter stationary itu sendiri)
  const stationaryCounts = useMemo(() => {
    const base = allLocations
      .filter(loc => !visibleUsers || visibleUsers.has(loc.userName))
      .filter(inDateRange);
    return {
      all:        base.length,
      moving:     base.filter(loc => loc.isStationary === false).length,
      stationary: base.filter(loc => loc.isStationary === true).length,
    };
  }, [allLocations, visibleUsers, inDateRange]);

  // Untuk StatsHeader / MapCanvas polyline: ambil user tunggal jika hanya 1 tampil
  const primaryUser = useMemo(() =>
    visibleUsers?.size === 1 ? [...visibleUsers][0] : '',
    [visibleUsers]
  );

  const latestLocation = filteredLocations[0];

  // ─── Handlers ───────────────────────────────────────────────

  const triggerToast = (message, type = 'info') => setToast({ message, type });

  const handleCloseToast = useCallback(() => {
    setToast(prev => ({ ...prev, message: '' }));
  }, []);

  // Ubah rentang tanggal → auto-select semua user yang punya data di range itu
  const handleDateRange = useCallback((newRange) => {
    setDateRange(newRange);
    setActiveIndex(null);
    setStationaryFilter('all');

    if (!newRange.from) {
      // "Semua" → hapus filter user
      setVisibleUsers(null);
      return;
    }

    // Auto-pilih user yang punya data di rentang baru
    const usersInRange = new Set(
      allLocations
        .filter(loc => {
          const key = getLocalDateKey(loc.timestamp || loc.localTimestamp);
          if (!key) return false;
          const { from, to } = newRange;
          return to ? (key >= from && key <= to) : key === from;
        })
        .map(loc => loc.userName)
        .filter(Boolean)
    );
    setVisibleUsers(usersInRange);
  }, [allLocations]);

  // Toggle visibilitas satu user
  const handleToggleUser = useCallback((username) => {
    setVisibleUsers(prev => {
      if (!prev) {
        // null = semua tampil → sembunyikan satu user
        const all = new Set(allLocations.map(l => l.userName).filter(Boolean));
        all.delete(username);
        return all;
      }
      const next = new Set(prev);
      if (next.has(username)) next.delete(username);
      else next.add(username);
      return next;
    });
    setActiveIndex(null);
  }, [allLocations]);

  // Tampilkan semua / sembunyikan semua
  const handleSelectAllUsers = useCallback((usernames) => {
    setVisibleUsers(usernames.length === 0 ? new Set() : new Set(usernames));
    setActiveIndex(null);
  }, []);

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
      if (visibleUsers) {
        const next = new Set(visibleUsers);
        next.delete(userName);
        setVisibleUsers(next);
      }
    } else {
      triggerToast(`Gagal: ${result.error}`, 'error');
    }
  };

  // ─── Render ─────────────────────────────────────────────────

  return (
    <div className="app-container">
      <MapCanvas
        locations={filteredLocations}
        selectedUser={primaryUser}
        activeIndex={activeIndex}
        onMarkerClick={setActiveIndex}
      />

      <StatsHeader
        connectionStatus={connectionStatus}
        selectedUser={primaryUser}
        latestLocation={latestLocation}
      />

      <MainSheet
        isOpen={isSheetOpen}
        setIsOpen={setIsSheetOpen}
        title={
          activeTab === 'people'  ? 'Orang' :
          activeTab === 'manage'  ? 'Pengaturan' : 'Daftar Lokasi'
        }
      >
        {activeTab === 'map' && (
          <HistoryView
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
            allLocations={allLocations}
            dateRange={dateRange}
            onDateRange={handleDateRange}
            visibleUsers={visibleUsers}
            onToggleUser={handleToggleUser}
            onSelectAllUsers={handleSelectAllUsers}
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
