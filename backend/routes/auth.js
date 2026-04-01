const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const sendOTPEmail = require('../utils/sendEmail');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─────────────────────────────────────────────
// REGISTER - Step 1: Send OTP
// POST /api/auth/register/send-otp
// ─────────────────────────────────────────────
router.post('/register/send-otp', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });

    const existing = await User.findOne({ email });
    if (existing && existing.isVerified)
      return res.status(400).json({ success: false, message: 'Email already registered.' });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Save temp user (unverified) or update existing unverified
    let user = existing || new User({ email });
    user.tempName = name;
    user.tempPhone = phone;
    user.tempPassword = password; // will be hashed on final save
    user.name = name;
    user.phone = phone;
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpPurpose = 'register';
    user.isVerified = false;

    // Bypass password hash for temp save
    user.$locals.skipHash = true;
    await User.updateOne(
      { email },
      {
        $set: {
          name, phone, otp, otpExpiry,
          otpPurpose: 'register', isVerified: false,
          tempName: name, tempPhone: phone, tempPassword: password
        }
      },
      { upsert: true }
    );

    await sendOTPEmail(email, otp, 'register');
    res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// REGISTER - Step 2: Verify OTP
// POST /api/auth/register/verify-otp
// ─────────────────────────────────────────────
router.post('/register/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    if (Date.now() > new Date(user.otpExpiry).getTime())
      return res.status(400).json({ success: false, message: 'OTP expired. Please resend.' });

    // Set real password and mark verified
    user.password = user.tempPassword;
    user.isVerified = true;
    user.role = 'user';
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpPurpose = undefined;
    user.tempPassword = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Account created successfully!',
      token: generateToken(user._id),
      user: user.toJSON()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// LOGIN - Step 1: Send OTP
// POST /api/auth/login/send-otp
// ─────────────────────────────────────────────
router.post('/login/send-otp', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });

    const user = await User.findOne({ email });
    if (!user || !user.isVerified)
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact admin.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otpPurpose = 'login';
    await User.updateOne({ email }, { $set: { otp, otpExpiry: user.otpExpiry, otpPurpose: 'login' } });

    await sendOTPEmail(email, otp, 'login');
    res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// LOGIN - Step 2: Verify OTP
// POST /api/auth/login/verify-otp
// ─────────────────────────────────────────────
router.post('/login/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    if (Date.now() > new Date(user.otpExpiry).getTime())
      return res.status(400).json({ success: false, message: 'OTP expired. Please resend.' });

    await User.updateOne({ email }, { $unset: { otp: '', otpExpiry: '', otpPurpose: '' } });

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token: generateToken(user._id),
      user: user.toJSON()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// FORGOT PASSWORD - Step 1: Send OTP
// POST /api/auth/forgot/send-otp
// ─────────────────────────────────────────────
router.post('/forgot/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.isVerified)
      return res.status(404).json({ success: false, message: 'No account found with this email.' });

    const otp = generateOTP();
    await User.updateOne({ email }, {
      $set: { otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000), otpPurpose: 'forgot' }
    });

    await sendOTPEmail(email, otp, 'forgot');
    res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// FORGOT PASSWORD - Step 2: Verify OTP
// POST /api/auth/forgot/verify-otp
// ─────────────────────────────────────────────
router.post('/forgot/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    if (Date.now() > new Date(user.otpExpiry).getTime())
      return res.status(400).json({ success: false, message: 'OTP expired. Please resend.' });

    res.json({ success: true, message: 'OTP verified. Set your new password.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// FORGOT PASSWORD - Step 3: Reset Password
// POST /api/auth/forgot/reset-password
// ─────────────────────────────────────────────
router.post('/forgot/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    if (Date.now() > new Date(user.otpExpiry).getTime())
      return res.status(400).json({ success: false, message: 'OTP expired. Please resend.' });

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpPurpose = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully! Please login.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// Existing routes (unchanged)
// ─────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated.', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;