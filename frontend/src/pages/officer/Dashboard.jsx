import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge, formatDate } from '../../components/Badges';
import { ClipboardList, Clock, CheckCircle, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

export default function OfficerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ complaints: [], stats: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        axios.get('/officer/complaints?limit=6'),
        axios.get('/officer/stats')
      ]);
      setData({ complaints: cRes.data.complaints, stats: sRes.data.stats });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const { stats } = data;

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, rgba(116,185,255,0.12) 100%)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px 32px', marginBottom: 28
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(116,185,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(116,185,255,0.3)' }}>
            <UserCheck size={24} color="var(--info)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Support Officer</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{user?.name}</h2>
            {user?.department && <p style={{ color: 'var(--info)', fontSize: '0.8rem', marginTop: 2 }}>📌 {user.department} Department</p>}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Assigned', value: stats.total || 0, icon: ClipboardList, color: '#74b9ff', iconBg: 'rgba(116,185,255,0.12)' },
          { label: 'Pending', value: stats.pending || 0, icon: Clock, color: '#fdcb6e', iconBg: 'rgba(253,203,110,0.12)' },
          { label: 'In Progress', value: stats.inProgress || 0, icon: AlertCircle, color: '#e94560', iconBg: 'rgba(233,69,96,0.12)' },
          { label: 'Resolved', value: stats.resolved || 0, icon: CheckCircle, color: '#00b894', iconBg: 'rgba(0,184,148,0.12)' },
        ].map(({ label, value, icon: Icon, color, iconBg }) => (
          <div key={label} className="stat-card" style={{ '--accent-color': color }}>
            <div className="stat-icon" style={{ background: iconBg }}><Icon size={20} color={color} /></div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Assigned Complaints</h3>
          <Link to="/officer/complaints" className="btn btn-secondary btn-sm">View All <ArrowRight size={14} /></Link>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ width: 28, height: 28, margin: '0 auto' }} /></div>
        ) : data.complaints.length === 0 ? (
          <div className="empty-state"><ClipboardList size={56} className="empty-state-icon" /><h3>No complaints assigned</h3></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>ID</th><th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>User</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                {data.complaints.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700 }}>{c.complaintId}</td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}><div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{c.category}</td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{c.submittedBy?.name}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{formatDate(c.createdAt)}</td>
                    <td><Link to={`/officer/complaints/${c._id}`} className="btn btn-secondary btn-sm">Manage</Link></td>
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