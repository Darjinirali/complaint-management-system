import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const API = '/auth';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/forgot/send-otp`, { email });
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
      const res = await axios.post(`${API}/forgot/verify-otp`, { email, otp });
      toast.success(res.data.message);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/forgot/reset-password`, { email, otp, newPassword });
      toast.success(res.data.message);
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = ['Forgot Password', 'Verify OTP', 'New Password'];
  const stepSubs = ['Enter your registered email', `OTP sent to ${email}`, 'Set your new password'];

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div style={{ width: 52, height: 52, background: 'var(--accent)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(233,69,96,0.4)' }}>
              <KeyRound size={26} color="white" />
            </div>
          </div>
          <h1 className="auth-title">{stepTitles[step - 1]}</h1>
          <p className="auth-subtitle">{stepSubs[step - 1]}</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <button type="submit" className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <><div className="spinner" />Sending...</> : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
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
              {loading ? <><div className="spinner" />Verifying...</> : 'Verify OTP'}
            </button>
            <button type="button" onClick={() => setStep(1)}
              style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>
              ← Back
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} className="form-input"
                  placeholder="Minimum 6 characters" value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required autoFocus style={{ paddingRight: 44 }} />
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
              {loading ? <><div className="spinner" />Resetting...</> : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="auth-link">
          Remember password? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}