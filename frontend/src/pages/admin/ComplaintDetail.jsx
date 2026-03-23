import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { StatusBadge, PriorityBadge, formatDateTime } from '../../components/Badges';
import { ArrowLeft, UserCheck, Clock, Paperclip } from 'lucide-react';

export default function AdminComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState('');

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [cRes, oRes] = await Promise.all([
        axios.get(`/complaints/${id}`),
        axios.get('/admin/officers')
      ]);
      setComplaint(cRes.data.complaint);
      setOfficers(oRes.data.officers);
      setSelectedOfficer(cRes.data.complaint.assignedTo?._id || '');
    } catch { toast.error('Not found.'); navigate('/admin/complaints'); }
    finally { setLoading(false); }
  };

  const handleAssign = async () => {
    if (!selectedOfficer) { toast.error('Select an officer.'); return; }
    setAssigning(true);
    try {
      const { data } = await axios.put(`/admin/complaints/${id}/assign`, { officerId: selectedOfficer });
      toast.success(data.message);
      setComplaint(data.complaint);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setAssigning(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', paddingTop: 80 }}><div className="spinner" style={{ width: 36, height: 36, margin: '0 auto', borderWidth: 3 }} /></div>;
  if (!complaint) return null;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}><ArrowLeft size={15} /> Back</button>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, background: 'var(--accent-muted)', padding: '3px 10px', borderRadius: 6 }}>{complaint.complaintId}</span>
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
          <span style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 6, color: 'var(--text-secondary)' }}>{complaint.category}</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>{complaint.title}</h2>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Submitted by <strong style={{ color: 'var(--text-secondary)' }}>{complaint.submittedBy?.name}</strong> · {formatDateTime(complaint.createdAt)}
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
              <h3 className="card-title" style={{ marginBottom: 12, fontSize: '0.92rem' }}><Paperclip size={14} style={{ display: 'inline', marginRight: 6 }} />Attachments</h3>
              {complaint.attachments.map((att, idx) => (
                <a key={idx} href={att.path} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', marginBottom: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--info)', textDecoration: 'none', fontSize: '0.83rem' }}>
                  <Paperclip size={13} /> {att.originalName}
                  <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.74rem' }}>{(att.size / 1024).toFixed(0)} KB</span>
                </a>
              ))}
            </div>
          )}

          {complaint.resolutionDetails && (
            <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(0,184,148,0.3)' }}>
              <h3 className="card-title" style={{ marginBottom: 12, fontSize: '0.92rem', color: 'var(--success)' }}>✓ Resolution Details</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9rem' }}>{complaint.resolutionDetails}</p>
            </div>
          )}

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 18, fontSize: '0.92rem' }}><Clock size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />Full Status History</h3>
            <div className="timeline">
              {[...complaint.statusHistory].reverse().map((h, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-dot" style={{ background: h.status === 'Resolved' ? 'var(--success)' : h.status === 'Closed' ? 'var(--text-muted)' : 'var(--accent)' }} />
                  <div className="timeline-content">
                    <div className="timeline-status"><StatusBadge status={h.status} /></div>
                    {h.comment && <div className="timeline-comment" style={{ marginTop: 6 }}>{h.comment}</div>}
                    <div className="timeline-meta">{h.updatedBy?.name && `By ${h.updatedBy.name} (${h.updatedBy.role}) · `}{formatDateTime(h.updatedAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16, borderColor: 'rgba(116,185,255,0.3)' }}>
            <h3 className="card-title" style={{ marginBottom: 14, fontSize: '0.88rem', color: 'var(--info)' }}><UserCheck size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />Assign Officer</h3>
            <select className="form-select" value={selectedOfficer} onChange={e => setSelectedOfficer(e.target.value)}
              style={{ marginBottom: 10 }} disabled={['Resolved', 'Closed'].includes(complaint.status)}>
              <option value="">Select officer...</option>
              {officers.map(o => <option key={o._id} value={o._id}>{o.name}{o.department ? ` (${o.department})` : ''}</option>)}
            </select>
            {!['Resolved', 'Closed'].includes(complaint.status) && (
              <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleAssign} disabled={assigning || !selectedOfficer}>
                {assigning ? <div className="spinner" /> : <><UserCheck size={14} />Assign</>}
              </button>
            )}
            {complaint.assignedTo && (
              <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(0,184,148,0.08)', border: '1px solid rgba(0,184,148,0.2)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--success)' }}>
                ✓ Currently assigned to <strong>{complaint.assignedTo.name}</strong>
              </div>
            )}
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <h3 className="card-title" style={{ marginBottom: 12, fontSize: '0.88rem' }}>Submitted By</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="user-avatar" style={{ width: 38, height: 38 }}>{complaint.submittedBy?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.87rem' }}>{complaint.submittedBy?.name}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{complaint.submittedBy?.email}</div>
                {complaint.submittedBy?.phone && <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{complaint.submittedBy.phone}</div>}
              </div>
            </div>
          </div>

          {complaint.feedback?.rating && (
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>User Rating</div>
              <div style={{ fontSize: '1.3rem' }}>{'⭐'.repeat(complaint.feedback.rating)}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{complaint.feedback.rating}/5</div>
              {complaint.feedback.comment && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 8, fontStyle: 'italic' }}>"{complaint.feedback.comment}"</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}