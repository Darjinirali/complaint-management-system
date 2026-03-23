import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(data.message);
      const role = data.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'officer' ? '/officer' : '/user');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      admin: { email: 'admin@demo.com', password: 'admin123' },
      officer: { email: 'officer@demo.com', password: 'officer123' },
      user: { email: 'user@demo.com', password: 'user123' },
    };
    setForm(creds[role]);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div style={{
              width: 52, height: 52, background: 'var(--accent)', borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(233,69,96,0.4)'
            }}>
              <Shield size={26} color="white" />
            </div>
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your ComplaintDesk account</p>
        </div>

        {/* Demo quick fill */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 24,
          padding: '10px 12px', background: 'rgba(255,255,255,0.03)',
          borderRadius: 8, border: '1px solid var(--border)'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: 4 }}>Demo:</span>
          {['admin', 'officer', 'user'].map(role => (
            <button
              key={role}
              onClick={() => fillDemo(role)}
              style={{
                padding: '4px 10px', fontSize: '0.72rem', fontWeight: 600,
                background: 'rgba(255,255,255,0.07)', border: '1px solid var(--border)',
                borderRadius: 6, color: 'var(--text-secondary)', cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >{role}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email" className="form-input" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              required autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} className="form-input"
                placeholder="Enter your password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex'
              }}>
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? <><div className="spinner" />Signing in...</> : <><LogIn size={17} />Sign In</>}
          </button>
        </form>

        <div className="auth-link">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}