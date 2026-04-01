import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Shield, Eye, EyeOff, LogIn } from 'lucide-react';
import axios from 'axios';

const API = '/auth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=credentials, 2=otp
  const [form, setForm] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/login/send-otp`, form);
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
      const res = await axios.post(`${API}/login/verify-otp`, { email: form.email, otp });
      const { token, user } = res.data;
      login(token, user); // AuthContext mein token/user set karo
      toast.success(res.data.message);
      navigate(user.role === 'admin' ? '/admin' : user.role === 'officer' ? '/officer' : '/user');
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
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div style={{ width: 52, height: 52, background: 'var(--accent)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(233,69,96,0.4)' }}>
              <Shield size={26} color="white" />
            </div>
          </div>
          <h1 className="auth-title">{step === 1 ? 'Welcome Back' : 'Enter OTP'}</h1>
          <p className="auth-subtitle">{step === 1 ? 'Sign in to your ComplaintDesk account' : `OTP sent to ${form.email}`}</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} className="form-input"
                  placeholder="Enter your password" value={form.password}
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
            <div style={{ textAlign: 'right', marginBottom: 12 }}>
              <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--accent)' }}>Forgot Password?</Link>
            </div>
            <button type="submit" className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
              {loading ? <><div className="spinner" />Sending OTP...</> : <><LogIn size={17} />Send OTP</>}
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
              {loading ? <><div className="spinner" />Verifying...</> : <><LogIn size={17} />Verify & Login</>}
            </button>
            <button type="button" onClick={() => setStep(1)}
              style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>
              ← Back
            </button>
          </form>
        )}

        <div className="auth-link">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}