import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, UserPlus, Search, X } from 'lucide-react';
import { formatDate } from '../../components/Badges';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('user');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toggling, setToggling] = useState({});
  const [officerForm, setOfficerForm] = useState({ name: '', email: '', password: '', phone: '', department: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchUsers(); }, [tab, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ role: tab, limit: 50 });
      if (search) params.append('search', search);
      const { data } = await axios.get(`/admin/users?${params}`);
      setUsers(data.users);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleUser = async (userId) => {
    setToggling(prev => ({ ...prev, [userId]: true }));
    try {
      const { data } = await axios.put(`/admin/users/${userId}/toggle`);
      toast.success(data.message);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed.'); }
    finally { setToggling(prev => ({ ...prev, [userId]: false })); }
  };

  const createOfficer = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await axios.post('/admin/officers', officerForm);
      toast.success(data.message);
      setShowModal(false);
      setOfficerForm({ name: '', email: '', password: '', phone: '', department: '' });
      if (tab === 'officer') fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Creation failed.'); }
    finally { setCreating(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>Manage Users</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>Manage all users and support officers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><UserPlus size={16} /> Add Officer</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[{ value: 'user', label: 'Users' }, { value: 'officer', label: 'Support Officers' }].map(({ value, label }) => (
          <button key={value} onClick={() => setTab(value)} style={{
            padding: '9px 18px', borderRadius: 8, border: '1px solid',
            borderColor: tab === value ? 'var(--accent)' : 'var(--border)',
            background: tab === value ? 'var(--accent-muted)' : 'transparent',
            color: tab === value ? 'var(--accent)' : 'var(--text-secondary)',
            fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
          }}>{label}</button>
        ))}
      </div>

      <div className="search-bar" style={{ marginBottom: 20, maxWidth: 300 }}>
        <Search size={15} className="search-bar-icon" />
        <input type="text" className="form-input" placeholder={`Search ${tab}s...`} value={search}
          onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32, margin: '0 auto', borderWidth: 3 }} /></div>
        ) : users.length === 0 ? (
          <div className="empty-state"><Users size={56} className="empty-state-icon" /><h3>No {tab}s found</h3></div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th>{tab === 'officer' && <th>Department</th>}<th>Status</th><th>Joined</th><th>Action</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem', flexShrink: 0 }}>
                          {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.87rem', color: 'var(--text-primary)' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{u.phone || '—'}</td>
                    {tab === 'officer' && <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{u.department || '—'}</td>}
                    <td><span className={`badge ${u.isActive ? 'badge-resolved' : 'badge-rejected'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
                    <td>
                      <button className={`btn btn-sm ${u.isActive ? 'btn-secondary' : 'btn-success'}`}
                        onClick={() => toggleUser(u._id)} disabled={toggling[u._id]} style={{ fontSize: '0.78rem' }}>
                        {toggling[u._id] ? <div className="spinner" style={{ width: 12, height: 12 }} /> : u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Officer Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title"><UserPlus size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />Add Support Officer</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={createOfficer}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input type="text" className="form-input" placeholder="Officer name" value={officerForm.name}
                      onChange={e => setOfficerForm({ ...officerForm, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input type="text" className="form-input" placeholder="e.g. Technical Support" value={officerForm.department}
                      onChange={e => setOfficerForm({ ...officerForm, department: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input type="email" className="form-input" placeholder="officer@company.com" value={officerForm.email}
                    onChange={e => setOfficerForm({ ...officerForm, email: e.target.value })} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input type="password" className="form-input" placeholder="Min 6 characters" value={officerForm.password}
                      onChange={e => setOfficerForm({ ...officerForm, password: e.target.value })} required minLength={6} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input type="tel" className="form-input" placeholder="Contact number" value={officerForm.phone}
                      onChange={e => setOfficerForm({ ...officerForm, phone: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? <><div className="spinner" />Creating...</> : <><UserPlus size={15} />Create Officer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}