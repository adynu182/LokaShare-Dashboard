import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Delete all location records for a specific user from Firestore
 * @param {string} userName - The name of the user whose data should be deleted
 * @returns {Promise<{success: boolean, deletedCount: number, error?: string}>}
 */
export async function deleteUserLocations(userName) {
  try {
    if (!userName || userName.trim() === '') {
      return { success: false, deletedCount: 0, error: 'Nama user tidak valid' };
    }

    // Query all locations with the specified userName
    const locRef = collection(db, 'locations');
    const q = query(locRef, where('userName', '==', userName));
    
    const snapshot = await getDocs(q);
    let deletedCount = 0;

    // Delete each document
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
      deletedCount++;
    }

    return { success: true, deletedCount };
  } catch (error) {
    console.error('Error deleting user locations:', error);
    return { 
      success: false, 
      deletedCount: 0, 
      error: error.message || 'Gagal menghapus data user' 
    };
  }
}
