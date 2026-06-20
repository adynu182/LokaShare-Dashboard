import { collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Delete all location records for a specific user from Firestore.
 * FIX #8: Pakai writeBatch (500 per batch) bukan sequential await →
 *         jauh lebih cepat untuk dataset besar.
 *
 * @param {string} userName - Nama user yang datanya akan dihapus
 * @returns {Promise<{success: boolean, deletedCount: number, error?: string}>}
 */
export async function deleteUserLocations(userName) {
  try {
    if (!userName || userName.trim() === '') {
      return { success: false, deletedCount: 0, error: 'Nama user tidak valid' };
    }

    const locRef = collection(db, 'locations');
    const q = query(locRef, where('userName', '==', userName));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: true, deletedCount: 0 };
    }

    // FIX #8: Batch delete — max 500 operasi per batch (limit Firestore)
    const BATCH_SIZE = 500;
    const docs = snapshot.docs;
    const batches = [];

    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      docs.slice(i, i + BATCH_SIZE).forEach(doc => batch.delete(doc.ref));
      batches.push(batch.commit());
    }

    await Promise.all(batches);

    return { success: true, deletedCount: docs.length };
  } catch (error) {
    console.error('Error deleting user locations:', error);
    return {
      success: false,
      deletedCount: 0,
      error: error.message || 'Gagal menghapus data user'
    };
  }
}
