import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { StatusBadge, PriorityBadge, formatDate } from '../../components/Badges';
import { ClipboardList, Search, X } from 'lucide-react';

const STATUSES = ['', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'];
const CATEGORIES = ['', 'Technical', 'Billing', 'Service', 'Product', 'HR', 'Infrastructure', 'Other'];

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', search: '', page: 1 });
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [assigning, setAssigning] = useState({});

  useEffect(() => { fetchComplaints(); }, [filters]);
  useEffect(() => { fetchOfficers(); }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page);
      params.append('limit', 10);
      const { data } = await axios.get(`/admin/complaints?${params}`);
      setComplaints(data.complaints);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchOfficers = async () => {
    try {
      const { data } = await axios.get('/admin/officers');
      setOfficers(data.officers);
    } catch (err) { console.error(err); }
  };

  const handleAssign = async (complaintId, officerId) => {
    if (!officerId) return;
    setAssigning(prev => ({ ...prev, [complaintId]: true }));
    try {
      const { data } = await axios.put(`/admin/complaints/${complaintId}/assign`, { officerId });
      toast.success(data.message);
      fetchComplaints();
    } catch (err) { toast.error(err.response?.data?.message || 'Assignment failed.'); }
    finally { setAssigning(prev => ({ ...prev, [complaintId]: false })); }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>Manage Complaints</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>{total} total complaints in system</p>
      </div>

      <div className="filters-row" style={{ marginBottom: 20 }}>
        <div className="search-bar">
          <Search size={15} className="search-bar-icon" />
          <input type="text" className="form-input" placeholder="Search by title or ID..." value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))} style={{ paddingLeft: 38 }} />
        </div>
        {[
          { key: 'status', options: STATUSES, placeholder: 'All Status' },
          { key: 'category', options: CATEGORIES, placeholder: 'All Categories' },
        ].map(({ key, options, placeholder }) => (
          <select key={key} className="form-select" style={{ width: 'auto', padding: '8px 12px', fontSize: '0.83rem' }}
            value={filters[key]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value, page: 1 }))}>
            {options.map(o => <option key={o} value={o}>{o || placeholder}</option>)}
          </select>
        ))}
        {(filters.status || filters.category || filters.search) && (
          <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ status: '', category: '', search: '', page: 1 })}>
            <X size={13} /> Clear
          </button>
        )}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32, margin: '0 auto', borderWidth: 3 }} /></div>
        ) : complaints.length === 0 ? (
          <div className="empty-state"><ClipboardList size={56} className="empty-state-icon" /><h3>No complaints found</h3></div>
        ) : (
          <>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead><tr><th>ID</th><th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>Submitted By</th><th>Assign Officer</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>
                  {complaints.map(c => (
                    <tr key={c._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700 }}>{c.complaintId}</td>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)', maxWidth: 180 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div></td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{c.category}</td>
                      <td><PriorityBadge priority={c.priority} /></td>
                      <td><StatusBadge status={c.status} /></td>
                      <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{c.submittedBy?.name}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <select className="form-select" style={{ padding: '5px 8px', fontSize: '0.78rem', width: 130 }}
                            defaultValue={c.assignedTo?._id || ''}
                            onChange={e => handleAssign(c._id, e.target.value)}
                            disabled={assigning[c._id] || ['Resolved', 'Closed'].includes(c.status)}>
                            <option value="">Assign...</option>
                            {officers.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
                          </select>
                          {assigning[c._id] && <div className="spinner" style={{ width: 14, height: 14 }} />}
                        </div>
                        {c.assignedTo && <div style={{ fontSize: '0.72rem', color: 'var(--success)', marginTop: 3 }}>✓ {c.assignedTo.name}</div>}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{formatDate(c.createdAt)}</td>
                      <td><Link to={`/admin/complaints/${c._id}`} className="btn btn-secondary btn-sm">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`page-btn ${filters.page === p ? 'active' : ''}`}
                    onClick={() => setFilters(prev => ({ ...prev, page: p }))}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}