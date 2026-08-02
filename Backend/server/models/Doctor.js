const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, 'Experience (in years) is required'],
      min: [0, 'Experience cannot be negative'],
    },
    licenseNumber: {
      type: String,
      required: [true, 'Medical license number is required'],
      unique: true,
      trim: true,
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Fee cannot be negative'],
    },
    availability: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
        startTime: String, // e.g., "09:00"
        endTime: String, // e.g., "17:00"
      },
    ],
    languagesKnown: [{ type: String, trim: true }],
hospitalBranch: {
  type: String,
  trim: true,
  default: 'Main Branch',
},
roomNumber: {
  type: String,
  trim: true,
},
appointmentDuration: {
  type: Number,
  enum: [15, 20, 30],
  default: 30,
},
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    isAvailable: {
      type: Boolean,
      default: true, // toggle for leave/unavailability
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);