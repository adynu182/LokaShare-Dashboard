import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Now accepts optional filters: selectedUser and selectedDateKey (YYYY-MM-DD)
export function useLocations(selectedUser, selectedDateKey) {
  const [allLocations, setAllLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Menghubungkan...');

  useEffect(() => {
    setConnectionStatus('Menghubungkan...');

    const locRef = collection(db, 'locations');

    const buildQueryForDate = (dateKey, userName) => {
      if (!dateKey) return null;
      const parts = dateKey.split('-');
      if (parts.length !== 3) return null;
      const yyyy = parseInt(parts[0], 10);
      const mm = parseInt(parts[1], 10);
      const dd = parseInt(parts[2], 10);
      if (isNaN(yyyy) || isNaN(mm) || isNaN(dd)) return null;

      const start = new Date(yyyy, mm - 1, dd, 0, 0, 0);
      const end = new Date(yyyy, mm - 1, dd + 1, 0, 0, 0);

      const startTs = Timestamp && Timestamp.fromDate ? Timestamp.fromDate(start) : start.getTime();
      const endTs = Timestamp && Timestamp.fromDate ? Timestamp.fromDate(end) : end.getTime();

      const clauses = [where('timestamp', '>=', startTs), where('timestamp', '<', endTs)];
      if (userName) clauses.push(where('userName', '==', userName));

      return query(locRef, ...clauses, orderBy('timestamp', 'desc'));
    };

    const q = buildQueryForDate(selectedDateKey, selectedUser);

    if (!q) {
      // No date filter: avoid fetching entire collection. Return empty state.
      setAllLocations([]);
      setUsers([]);
      setLoading(false);
      setConnectionStatus('Terhubung');
      setError(null);
      return () => {};
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const locations = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAllLocations(locations);

        const uniqueUsers = [...new Set(locations.map((l) => l.userName).filter(Boolean))].sort();
        setUsers(uniqueUsers);

        setLoading(false);
        setConnectionStatus('Terhubung');
        setError(null);
      },
      (err) => {
        console.error('Firestore subscription error:', err);
        setError(err);
        setLoading(false);
        setConnectionStatus('Koneksi terputus');
      }
    );

    return () => unsubscribe();
  }, [selectedUser, selectedDateKey]);

  return { allLocations, users, loading, error, connectionStatus };
}
