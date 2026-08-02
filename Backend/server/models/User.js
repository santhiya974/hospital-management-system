const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'doctor', 'patient'],
      default: 'patient',
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },gender: {
  type: String,
  enum: ['male', 'female', 'other'],
},
dateOfBirth: {
  type: Date,
},
    avatar: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' }, // Cloudinary public_id for deletion
    },
    isActive: {
      type: Boolean,
      default: true, // admin can deactivate doctors/patients
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash password before saving (only if modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method: compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);