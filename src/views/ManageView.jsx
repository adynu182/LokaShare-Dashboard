import React, { useState } from 'react';
import { Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '../utils/cn';

export default function ManageView({ users, onDeleteUser }) {
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleDelete = (user) => {
    onDeleteUser(user);
    setConfirmDelete(null);
  };

  return (
    <div className="view-container">
      <div className="manage-section">
        <h3 className="section-title">Manajemen Data</h3>
        <p className="section-desc">Hapus riwayat lokasi untuk pengguna tertentu.</p>
        
        <div className="delete-list">
          {users.map((user) => (
            <div key={user} className="delete-card">
              <span className="user-name">{user}</span>
              {confirmDelete === user ? (
                <div className="confirm-actions">
                  <button 
                    onClick={() => setConfirmDelete(null)}
                    className="btn-cancel"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={() => handleDelete(user)}
                    className="btn-delete-confirm"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setConfirmDelete(user)}
                  className="btn-delete"
                >
                  <Trash2 size={18} />
                  <span>Hapus</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="info-section glass">
        <ShieldCheck className="text-primary" size={24} />
        <div>
          <h4>Keamanan Data</h4>
          <p>Semua data disimpan di Firebase dan dapat dihapus kapan saja oleh admin.</p>
        </div>
      </div>
    </div>
  );
}
