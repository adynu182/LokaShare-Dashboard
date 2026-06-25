import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function useLocations() {
  const [allLocations, setAllLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Menghubungkan...');

  useEffect(() => {
    setConnectionStatus('Menghubungkan...');

    const locRef = collection(db, 'locations');
    const q = query(locRef, orderBy('localTimestamp', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const locations = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAllLocations(locations);

        // Extract and sort unique users
        const uniqueUsers = [...new Set(locations.map(l => l.userName).filter(Boolean))].sort();
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
  }, []);

  return { allLocations, users, loading, error, connectionStatus };
}
