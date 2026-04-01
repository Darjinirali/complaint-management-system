import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { StatusBadge, PriorityBadge, formatDateTime } from '../../components/Badges';
import { ArrowLeft, Paperclip, Clock, User, CheckCircle } from 'lucide-react';

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ rating: 0, comment: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  //data fetching

  useEffect(() => { fetchComplaint(); }, [id]);

  const fetchComplaint = async () => {
    try {
      const { data } = await axios.get(`/complaints/${id}`);
      setComplaint(data.complaint);
    } catch {
      toast.error('Complaint not found.');
      navigate('/user/complaints');
    } finally { setLoading(false); }
  };

  const submitFeedback = async () => {
    if (!feedback.rating) { toast.error('Please select a rating.'); return; }
    setSubmittingFeedback(true);
    try {
      const { data } = await axios.post(`/complaints/${id}/feedback`, feedback);
      toast.success(data.message);
      setComplaint(data.complaint);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally { setSubmittingFeedback(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', paddingTop: 80 }}><div className="spinner" style={{ width: 36, height: 36, margin: '0 auto', borderWidth: 3 }} /></div>;
  if (!complaint) return null;

  const canGiveFeedback = ['Resolved', 'Closed'].includes(complaint.status) && !complaint.feedback?.rating;

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        <ArrowLeft size={15} /> Back
      </button>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, background: 'var(--accent-muted)', padding: '3px 10px', borderRadius: 6 }}>{complaint.complaintId}</span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>{complaint.title}</h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span>📂 {complaint.category}</span>
              <span>📅 {formatDateTime(complaint.createdAt)}</span>
              {complaint.resolvedAt && <span>✅ Resolved: {formatDateTime(complaint.resolvedAt)}</span>}
            </div>
          </div>
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
              <h3 className="card-title" style={{ marginBottom: 14, fontSize: '0.92rem' }}>
                <Paperclip size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Attachments ({complaint.attachments.length})
              </h3>
              {complaint.attachments.map((att, idx) => (
                <a key={idx} href={att.path} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', marginBottom: 6,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--info)', textDecoration: 'none', fontSize: '0.85rem'
                }}>
                  <Paperclip size={14} /> {att.originalName}
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(att.size / 1024).toFixed(0)} KB</span>
                </a>
              ))}
            </div>
          )}

          {complaint.resolutionDetails && (
            <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(0,184,148,0.3)' }}>
              <h3 className="card-title" style={{ marginBottom: 14, fontSize: '0.92rem', color: 'var(--success)' }}>
                <CheckCircle size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Resolution Details
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9rem' }}>{complaint.resolutionDetails}</p>
            </div>
          )}

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 20, fontSize: '0.92rem' }}>
              <Clock size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              Status Timeline
            </h3>
            <div className="timeline">
              {[...complaint.statusHistory].reverse().map((h, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-dot" style={{ background: h.status === 'Resolved' || h.status === 'Closed' ? 'var(--success)' : 'var(--accent)' }} />
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
            <h3 className="card-title" style={{ marginBottom: 14, fontSize: '0.88rem' }}>
              <User size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              Assigned Officer
            </h3>
            {complaint.assignedTo ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="user-avatar" style={{ width: 38, height: 38 }}>
                  {complaint.assignedTo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.87rem' }}>{complaint.assignedTo.name}</div>
                  {complaint.assignedTo.department && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{complaint.assignedTo.department}</div>}
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>⏳ Awaiting assignment</div>
            )}
          </div>

          {canGiveFeedback && (
            <div className="card" style={{ borderColor: 'rgba(253,203,110,0.3)' }}>
              <h3 className="card-title" style={{ marginBottom: 14, fontSize: '0.88rem', color: 'var(--warning)' }}>⭐ Rate Resolution</h3>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem' }}>
                    {star <= feedback.rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
              <textarea className="form-textarea" placeholder="Share your feedback..."
                value={feedback.comment} onChange={e => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                style={{ minHeight: 80, fontSize: '0.83rem', marginBottom: 10 }} />
              <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}
                onClick={submitFeedback} disabled={submittingFeedback}>
                {submittingFeedback ? <div className="spinner" /> : 'Submit Feedback'}
              </button>
            </div>
          )}

          {complaint.feedback?.rating && (
            <div className="card" style={{ borderColor: 'rgba(0,184,148,0.3)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{'⭐'.repeat(complaint.feedback.rating)}</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{complaint.feedback.comment || 'Thank you for your feedback!'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}