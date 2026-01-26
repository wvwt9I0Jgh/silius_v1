import { deleteUserAsAdmin, getAllUsersAsAdmin } from '@/lib/admin-operations';
import { useState, useEffect } from 'react';

export function AdminUserPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Kullanıcıları yükle
  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const allUsers = await getAllUsersAsAdmin();
      setUsers(allUsers);
    } catch (error) {
      alert('❌ Kullanıcılar yüklenemedi: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Kullanıcı silme
  async function handleDeleteUser(userId: string, userEmail: string) {
    if (!confirm(`${userEmail} kullanıcısını silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      setLoading(true);
      await deleteUserAsAdmin(userId);
      alert('✅ Kullanıcı silindi');
      loadUsers(); // Listeyi yenile
    } catch (error) {
      alert('❌ Silme başarısız: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-panel">
      <h2>Kullanıcı Yönetimi</h2>
      
      <button onClick={loadUsers} disabled={loading}>
        {loading ? '⏳ Yükleniyor...' : '🔄 Yenile'}
      </button>

      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Oluşturulma Tarihi</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{new Date(user.created_at).toLocaleDateString('tr-TR')}</td>
              <td>
                <button 
                  onClick={() => handleDeleteUser(user.id, user.email)}
                  className="btn-danger"
                  disabled={loading}
                >
                  🗑️ Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}