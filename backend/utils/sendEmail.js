const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (toEmail, otp, purpose = 'verification') => {
  const subjects = {
    register: 'Verify Your Email - ComplaintDesk',
    login: 'Login OTP - ComplaintDesk',
    forgot: 'Reset Password OTP - ComplaintDesk',
  };

  const mailOptions = {
    from: `"ComplaintDesk" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: subjects[purpose] || 'OTP - ComplaintDesk',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9f9f9;border-radius:12px;">
        <h2 style="color:#e94560;">ComplaintDesk</h2>
        <p style="font-size:15px;color:#333;">Your OTP code is:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#e94560;margin:16px 0;">${otp}</div>
        <p style="color:#666;font-size:13px;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOTPEmail;