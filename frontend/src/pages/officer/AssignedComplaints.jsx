import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { StatusBadge, PriorityBadge, formatDate } from '../../components/Badges';
import { ClipboardList, Filter } from 'lucide-react';

export default function AssignedComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', page: 1 });
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchComplaints(); }, [filters]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      params.append('page', filters.page);
      const { data } = await axios.get(`/officer/complaints?${params}`);
      setComplaints(data.complaints);
      setTotal(data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>Assigned Complaints</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.87rem' }}>{total} complaint{total !== 1 ? 's' : ''} assigned to you</p>
      </div>

      <div className="filters-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.82rem' }}><Filter size={14} /> Filter:</div>
        {[
          { key: 'status', options: ['', 'Assigned', 'In Progress', 'Resolved', 'Closed'], placeholder: 'All Status' },
          { key: 'priority', options: ['', 'Low', 'Medium', 'High', 'Critical'], placeholder: 'All Priorities' },
        ].map(({ key, options, placeholder }) => (
          <select key={key} className="form-select" style={{ width: 'auto', padding: '8px 12px', fontSize: '0.83rem' }}
            value={filters[key]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value, page: 1 }))}>
            {options.map(o => <option key={o} value={o}>{o || placeholder}</option>)}
          </select>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32, margin: '0 auto', borderWidth: 3 }} /></div>
        ) : complaints.length === 0 ? (
          <div className="empty-state"><ClipboardList size={56} className="empty-state-icon" /><h3>No complaints found</h3></div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead><tr><th>ID</th><th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>User</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700 }}>{c.complaintId}</td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}><div style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{c.category}</td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{c.submittedBy?.name}{c.submittedBy?.phone && <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{c.submittedBy.phone}</div>}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{formatDate(c.createdAt)}</td>
                    <td><Link to={`/officer/complaints/${c._id}`} className="btn btn-primary btn-sm">Manage →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}