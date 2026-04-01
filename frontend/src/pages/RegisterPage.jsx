import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5001/api/auth';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=form, 2=otp
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/register/send-otp`, form);
      toast.success(res.data.message);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/register/verify-otp`, { email: form.email, otp });
      const { token, user } = res.data;
      login(token, user);
      toast.success(res.data.message);
      navigate('/user');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />
      <div className="auth-card" style={{ maxWidth: 460 }}>
        <div className="auth-header">
          <div className="auth-logo">
            <div style={{ width: 52, height: 52, background: 'var(--accent)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(233,69,96,0.4)' }}>
              <UserPlus size={26} color="white" />
            </div>
          </div>
          <h1 className="auth-title">{step === 1 ? 'Create Account' : 'Verify Email'}</h1>
          <p className="auth-subtitle">{step === 1 ? 'Join ComplaintDesk to submit and track complaints' : `OTP sent to ${form.email}`}</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className="form-input" placeholder="John Doe"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" className="form-input" placeholder="+91 98765 43210"
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} className="form-input"
                  placeholder="Minimum 6 characters" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex'
                }}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <><div className="spinner" />Sending OTP...</> : <><UserPlus size={17} />Send OTP</>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <input type="text" className="form-input" placeholder="6-digit OTP"
                value={otp} onChange={e => setOtp(e.target.value)}
                maxLength={6} required autoFocus
                style={{ fontSize: '1.4rem', letterSpacing: '8px', textAlign: 'center' }} />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>Valid for 10 minutes</p>
            </div>
            <button type="submit" className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <><div className="spinner" />Verifying...</> : <><UserPlus size={17} />Verify & Register</>}
            </button>
            <button type="button" onClick={() => setStep(1)}
              style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>
              ← Back
            </button>
          </form>
        )}

        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}