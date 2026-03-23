import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { StatusBadge, PriorityBadge, formatDateTime } from '../../components/Badges';
import { ArrowLeft, Send, Paperclip, Clock, User, CheckCircle } from 'lucide-react';

export default function OfficerComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({ status: '', comment: '', resolutionDetails: '' });

  useEffect(() => { fetchComplaint(); }, [id]);

  const fetchComplaint = async () => {
    try {
      const { data } = await axios.get(`/complaints/${id}`);
      setComplaint(data.complaint);
      setForm(f => ({ ...f, status: data.complaint.status }));
    } catch { toast.error('Not found.'); navigate('/officer/complaints'); }
    finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    if (!form.status) { toast.error('Select a status.'); return; }
    setUpdating(true);
    try {
      const { data } = await axios.put(`/officer/complaints/${id}/status`, form);
      toast.success(data.message);
      setComplaint(data.complaint);
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed.'); }
    finally { setUpdating(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', paddingTop: 80 }}><div className="spinner" style={{ width: 36, height: 36, margin: '0 auto', borderWidth: 3 }} /></div>;
  if (!complaint) return null;

  const canUpdate = !['Closed', 'Rejected'].includes(complaint.status);

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}><ArrowLeft size={15} /> Back</button>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, background: 'var(--accent-muted)', padding: '3px 10px', borderRadius: 6 }}>{complaint.complaintId}</span>
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>📂 {complaint.category}</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>{complaint.title}</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="user-avatar" style={{ width: 26, height: 26, fontSize: '0.68rem' }}>
              {complaint.submittedBy?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <span style={{ color: 'var(--text-secondary)' }}>{complaint.submittedBy?.name}</span>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>· {formatDateTime(complaint.createdAt)}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 className="card-title" style={{ marginBottom: 14, fontSize: '0.92rem' }}>Description</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{complaint.description}</p>
          </div>

          {complaint.attachments?.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 className="card-title" style={{ marginBottom: 12, fontSize: '0.92rem' }}><Paperclip size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />Attachments</h3>
              {complaint.attachments.map((att, idx) => (
                <a key={idx} href={att.path} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', marginBottom: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--info)', textDecoration: 'none', fontSize: '0.83rem' }}>
                  <Paperclip size={13} /> {att.originalName}
                </a>
              ))}
            </div>
          )}

          {canUpdate && (
            <div className="card" style={{ borderColor: 'rgba(233,69,96,0.25)', marginBottom: 20 }}>
              <h3 className="card-title" style={{ marginBottom: 16, fontSize: '0.92rem' }}><Send size={14} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />Update Status</h3>
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  {['Assigned', 'In Progress', 'Resolved', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {(form.status === 'Resolved' || form.status === 'Closed') && (
                <div className="form-group">
                  <label className="form-label">Resolution Details *</label>
                  <textarea className="form-textarea" placeholder="How was this complaint resolved..." value={form.resolutionDetails} onChange={e => setForm({ ...form, resolutionDetails: e.target.value })} style={{ minHeight: 90 }} />
                </div>
              )}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Comment / Note</label>
                <textarea className="form-textarea" placeholder="Add a note..." value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} style={{ minHeight: 80 }} />
              </div>
              <div style={{ marginTop: 14 }}>
                <button className="btn btn-primary" onClick={handleUpdate} disabled={updating}>
                  {updating ? <><div className="spinner" />Updating...</> : <><Send size={15} />Update Status</>}
                </button>
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 18, fontSize: '0.92rem' }}><Clock size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />Activity Timeline</h3>
            <div className="timeline">
              {[...complaint.statusHistory].reverse().map((h, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-dot" style={{ background: h.status === 'Resolved' ? 'var(--success)' : 'var(--accent)' }} />
                  <div className="timeline-content">
                    <div className="timeline-status"><StatusBadge status={h.status} /></div>
                    {h.comment && <div className="timeline-comment" style={{ marginTop: 6 }}>{h.comment}</div>}
                    <div className="timeline-meta">{h.updatedBy?.name && `By ${h.updatedBy.name} · `}{formatDateTime(h.updatedAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 className="card-title" style={{ marginBottom: 14, fontSize: '0.88rem' }}><User size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />Complainant</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="user-avatar" style={{ width: 38, height: 38 }}>{complaint.submittedBy?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.87rem' }}>{complaint.submittedBy?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{complaint.submittedBy?.email}</div>
                {complaint.submittedBy?.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{complaint.submittedBy.phone}</div>}
              </div>
            </div>
          </div>

          {complaint.resolutionDetails && (
            <div className="card" style={{ borderColor: 'rgba(0,184,148,0.3)' }}>
              <h3 className="card-title" style={{ marginBottom: 12, fontSize: '0.88rem', color: 'var(--success)' }}><CheckCircle size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />Resolution</h3>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{complaint.resolutionDetails}</p>
            </div>
          )}

          {complaint.feedback?.rating && (
            <div className="card" style={{ marginTop: 16, textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>User Feedback</div>
              <div style={{ fontSize: '1.3rem' }}>{'⭐'.repeat(complaint.feedback.rating)}</div>
              {complaint.feedback.comment && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6 }}>"{complaint.feedback.comment}"</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}