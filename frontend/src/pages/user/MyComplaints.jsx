import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { StatusBadge, PriorityBadge, formatDate } from '../../components/Badges';
import { FileText, Filter, PlusCircle } from 'lucide-react';

const STATUSES = ['', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'];
const CATEGORIES = ['', 'Technical', 'Billing', 'Service', 'Product', 'HR', 'Infrastructure', 'Other'];

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', page: 1 });
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  useEffect(() => { fetchComplaints(); }, [filters]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      params.append('page', filters.page);
      params.append('limit', 10);
      const { data } = await axios.get(`/complaints/my?${params}`);
      setComplaints(data.complaints);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>My Complaints</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>{total} complaint{total !== 1 ? 's' : ''} submitted</p>
        </div>
        <Link to="/user/submit" className="btn btn-primary"><PlusCircle size={16} /> New Complaint</Link>
      </div>

      <div className="filters-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          <Filter size={14} /> Filter:
        </div>
        <select className="form-select" style={{ width: 'auto', padding: '8px 12px', fontSize: '0.83rem' }}
          value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto', padding: '8px 12px', fontSize: '0.83rem' }}
          value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value, page: 1 }))}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
        </select>
        {(filters.status || filters.category) && (
          <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ status: '', category: '', page: 1 })}>Clear</button>
        )}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto', borderWidth: 3 }} />
          </div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <FileText size={56} className="empty-state-icon" />
            <h3>No complaints found</h3>
            <Link to="/user/submit" className="btn btn-primary" style={{ marginTop: 16 }}><PlusCircle size={15} /> Submit Complaint</Link>
          </div>
        ) : (
          <>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr><th>ID</th><th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>Assigned To</th><th>Submitted</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {complaints.map(c => (
                    <tr key={c._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700 }}>{c.complaintId}</td>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        <div style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                      </td>
                      <td><span style={{ fontSize: '0.75rem', padding: '3px 8px', background: 'rgba(255,255,255,0.06)', borderRadius: 6, color: 'var(--text-secondary)' }}>{c.category}</span></td>
                      <td><PriorityBadge priority={c.priority} /></td>
                      <td><StatusBadge status={c.status} /></td>
                      <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                        {c.assignedTo ? c.assignedTo.name : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{formatDate(c.createdAt)}</td>
                      <td><Link to={`/user/complaints/${c._id}`} className="btn btn-secondary btn-sm">Track →</Link></td>
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