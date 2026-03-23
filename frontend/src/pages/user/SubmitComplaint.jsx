import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Send, Paperclip, X, FileText, AlertTriangle } from 'lucide-react';

const CATEGORIES = ['Technical', 'Billing', 'Service', 'Product', 'HR', 'Infrastructure', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: '', priority: 'Medium' });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = (selected) => {
    const valid = selected.filter(f => f.size <= 10 * 1024 * 1024);
    if (valid.length < selected.length) toast.error('Some files exceed 10MB limit.');
    setFiles(prev => {
      const names = prev.map(f => f.name);
      return [...prev, ...valid.filter(f => !names.includes(f.name))].slice(0, 5);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.category) {
      toast.error('Please fill all required fields.'); return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach(f => fd.append('attachments', f));
      const { data } = await axios.post('/complaints', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(data.message);
      navigate(`/user/complaints/${data.complaint._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally { setLoading(false); }
  };

  const priorityColors = { Low: '#00b894', Medium: '#fdcb6e', High: '#e94560', Critical: '#ff4757' };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>
          Submit a Complaint
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          Describe your issue clearly for faster resolution.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-group">
            <label className="form-label">Complaint Title *</label>
            <input type="text" className="form-input" placeholder="Brief title describing the issue..."
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} maxLength={100} required />
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>{form.title.length}/100</div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority *</label>
              <select className="form-select" value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <div style={{ marginTop: 6 }}>
                {PRIORITIES.map(p => (
                  <button key={p} type="button" onClick={() => setForm({ ...form, priority: p })} style={{
                    padding: '3px 9px', fontSize: '0.72rem', fontWeight: 600, marginRight: 5, marginTop: 4,
                    border: `1px solid ${priorityColors[p]}40`, borderRadius: 20, cursor: 'pointer',
                    background: form.priority === p ? `${priorityColors[p]}20` : 'transparent',
                    color: priorityColors[p]
                  }}>{p}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Description *</label>
            <textarea className="form-textarea"
              placeholder="Describe your complaint in detail..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ minHeight: 140 }} required />
          </div>
        </div>

        {/* File upload */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 className="card-title" style={{ fontSize: '0.92rem', marginBottom: 16 }}>
            <Paperclip size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            Supporting Documents <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>(Optional — max 5 files)</span>
          </h3>
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(Array.from(e.dataTransfer.files)); }}
            onClick={() => document.getElementById('file-upload').click()}
          >
            <div className="upload-zone-icon"><Paperclip size={36} /></div>
            <p><strong>Click to upload</strong> or drag and drop</p>
            <p style={{ fontSize: '0.75rem', marginTop: 4, color: 'var(--text-muted)' }}>Images, PDF, DOC — Max 10MB</p>
            <input id="file-upload" type="file" multiple
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.xlsx,.xls"
              onChange={e => addFiles(Array.from(e.target.files))} style={{ display: 'none' }} />
          </div>

          {files.length > 0 && (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {files.map((file, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8
                }}>
                  <FileText size={16} color="var(--accent)" />
                  <span style={{ flex: 1, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(0)} KB</span>
                  <button type="button" onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {(form.priority === 'High' || form.priority === 'Critical') && (
          <div style={{
            display: 'flex', gap: 10, padding: '12px 16px',
            background: 'rgba(233,69,96,0.08)', border: '1px solid rgba(233,69,96,0.25)',
            borderRadius: 8, marginBottom: 20
          }}>
            <AlertTriangle size={17} color="var(--accent)" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.82rem', color: 'var(--accent-soft)' }}>
              <strong>{form.priority} priority</strong> complaints are escalated immediately for faster resolution.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/user')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
            {loading ? <><div className="spinner" />Submitting...</> : <><Send size={16} />Submit Complaint</>}
          </button>
        </div>
      </form>
    </div>
  );
}