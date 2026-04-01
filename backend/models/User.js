const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  password: { type: String, required: [true, 'Password is required'], minlength: 6 },
  role: { type: String, enum: ['user', 'officer', 'admin'], default: 'user' },
  phone: { type: String, trim: true },
  department: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  avatar: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },

  // OTP fields
  otp: { type: String },
  otpExpiry: { type: Date },
  otpPurpose: { type: String, enum: ['register', 'login', 'forgot'] },
  
  // Temp register data
  tempName: { type: String },
  tempPhone: { type: String },
  tempPassword: { type: String },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  delete obj.tempPassword;
  return obj;
};

module.exports = mongoose.model('User', userSchema);