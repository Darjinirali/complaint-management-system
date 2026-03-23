import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge, formatDate } from '../../components/Badges';
import { FileText, Clock, CheckCircle, AlertCircle, PlusCircle, ArrowRight } from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const { data } = await axios.get('/complaints/my?limit=5');
      setComplaints(data.complaints);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => ['Assigned', 'In Progress'].includes(c.status)).length,
    resolved: complaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length,
  };

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, rgba(233,69,96,0.15) 100%)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', right: -20, top: -20, width: 180, height: 180,
          background: 'rgba(233,69,96,0.1)', borderRadius: '50%', filter: 'blur(40px)'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 4 }}>Good day,</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 10 }}>
            {user?.name} 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 18 }}>
            Track your complaints and get timely resolutions.
          </p>
          <Link to="/user/submit" className="btn btn-primary">
            <PlusCircle size={16} /> Submit New Complaint
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Total Submitted', value: stats.total, icon: FileText, color: '#74b9ff', iconBg: 'rgba(116,185,255,0.12)' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: '#fdcb6e', iconBg: 'rgba(253,203,110,0.12)' },
          { label: 'In Progress', value: stats.inProgress, icon: AlertCircle, color: '#e94560', iconBg: 'rgba(233,69,96,0.12)' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: '#00b894', iconBg: 'rgba(0,184,148,0.12)' },
        ].map(({ label, value, icon: Icon, color, iconBg }) => (
          <div key={label} className="stat-card" style={{ '--accent-color': color }}>
            <div className="stat-icon" style={{ background: iconBg }}><Icon size={20} color={color} /></div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent complaints */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Complaints</h3>
          <Link to="/user/complaints" className="btn btn-secondary btn-sm">View All <ArrowRight size={14} /></Link>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner" style={{ width: 28, height: 28, margin: '0 auto' }} />
          </div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <FileText size={56} className="empty-state-icon" />
            <h3>No complaints yet</h3>
            <p>Submit your first complaint to get started.</p>
            <Link to="/user/submit" className="btn btn-primary" style={{ marginTop: 16 }}>
              <PlusCircle size={15} /> Submit Complaint
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Title</th><th>Category</th>
                  <th>Priority</th><th>Status</th><th>Submitted</th><th></th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent)' }}>{c.complaintId}</td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)', maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                    </td>
                    <td><span style={{ fontSize: '0.75rem', padding: '3px 8px', background: 'rgba(255,255,255,0.06)', borderRadius: 6, color: 'var(--text-secondary)' }}>{c.category}</span></td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{formatDate(c.createdAt)}</td>
                    <td><Link to={`/user/complaints/${c._id}`} className="btn btn-secondary btn-sm">View</Link></td>
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