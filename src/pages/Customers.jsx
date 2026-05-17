import { useState, useEffect } from 'react';
import { getUsers } from '../api';
import { Users as UsersIcon } from 'lucide-react';

export default function Customers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data.users);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="toolbar">
        <div style={{ fontSize: '14px', color: 'var(--warm-gray)' }}>
          {users.length} registered user{users.length !== 1 ? 's' : ''}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--warm-gray)' }}>Loading customers...</div>
      ) : users.length === 0 ? (
        <div className="card empty-state">
          <UsersIcon />
          <h3>No Customers Yet</h3>
          <p>Registered customers will appear here.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td style={{ fontWeight: 600 }}>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.number || '-'}</td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'badge-active' : 'badge-confirmed'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--warm-gray)' }}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
