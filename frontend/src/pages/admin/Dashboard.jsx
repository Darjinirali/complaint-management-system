import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, ClipboardList, CheckCircle, Clock, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';

const COLORS = ['#e94560', '#74b9ff', '#00b894', '#fdcb6e', '#a29bfe', '#fd79a8'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentComplaints, setRecentComplaints] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        axios.get('/admin/stats'),
        axios.get('/admin/complaints?limit=5')
      ]);
      setStats(sRes.data.stats);
      setRecentComplaints(cRes.data.complaints);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyData = stats?.monthlyTrend?.map(m => ({ month: monthNames[m._id.month - 1], Complaints: m.count })) || [];
  const categoryData = stats?.categoryStats?.map(c => ({ name: c._id, value: c.count })) || [];
  const tooltipStyle = { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f0f0f5', fontSize: 13 };

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e, rgba(233,69,96,0.12))', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px 32px', marginBottom: 28 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 4 }}>System Overview</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 }}>Admin Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Monitor complaints, manage users, and track resolution performance.</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        {[
          { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: '#74b9ff', iconBg: 'rgba(116,185,255,0.12)' },
          { label: 'Total Officers', value: stats?.totalOfficers, icon: Users, color: '#a29bfe', iconBg: 'rgba(162,155,254,0.12)' },
          { label: 'Total Complaints', value: stats?.totalComplaints, icon: ClipboardList, color: '#e94560', iconBg: 'rgba(233,69,96,0.12)' },
          { label: 'Pending', value: stats?.pendingComplaints, icon: Clock, color: '#fdcb6e', iconBg: 'rgba(253,203,110,0.12)' },
          { label: 'In Progress', value: stats?.inProgressComplaints, icon: AlertCircle, color: '#fd79a8', iconBg: 'rgba(253,121,168,0.12)' },
          { label: 'Resolved', value: stats?.resolvedComplaints, icon: CheckCircle, color: '#00b894', iconBg: 'rgba(0,184,148,0.12)' },
        ].map(({ label, value, icon: Icon, color, iconBg }) => (
          <div key={label} className="stat-card" style={{ '--accent-color': color }}>
            <div className="stat-icon" style={{ background: iconBg }}><Icon size={20} color={color} /></div>
            <div className="stat-value">{loading ? '—' : value ?? '—'}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><TrendingUp size={15} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />Monthly Complaints</h3>
          </div>
          {loading ? <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" style={{ width: 28, height: 28 }} /></div> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="Complaints" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">By Category</h3></div>
          {loading ? <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner" style={{ width: 28, height: 28 }} /></div> : categoryData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={70} dataKey="value" labelLine={false}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend formatter={v => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Complaints</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/admin/users" className="btn btn-secondary btn-sm">Manage Users</Link>
            <Link to="/admin/complaints" className="btn btn-primary btn-sm">All Complaints <ArrowRight size={14} /></Link>
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ width: 28, height: 28, margin: '0 auto' }} /></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>ID</th><th>Title</th><th>Category</th><th>Status</th><th>Assigned To</th><th>Submitted By</th><th>Action</th></tr></thead>
              <tbody>
                {recentComplaints.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700 }}>{c.complaintId}</td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}><div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div></td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{c.category}</td>
                    <td><span className={`badge badge-${c.status.toLowerCase().replace(' ', '')}`}>{c.status}</span></td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{c.assignedTo?.name || <span style={{ color: 'var(--accent)', fontSize: '0.78rem' }}>⚠ Unassigned</span>}</td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>{c.submittedBy?.name}</td>
                    <td><Link to={`/admin/complaints/${c._id}`} className="btn btn-secondary btn-sm">View</Link></td>
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