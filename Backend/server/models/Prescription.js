const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    dosage: {
      type: String, // e.g., "500mg"
      required: [true, 'Dosage is required'],
      trim: true,
    },
    frequency: {
      type: String, // e.g., "Twice a day"
      required: [true, 'Frequency is required'],
      trim: true,
    },
    duration: {
      type: String, // e.g., "5 days"
      required: [true, 'Duration is required'],
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true, // one prescription per appointment
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true,
      maxlength: [500, 'Diagnosis cannot exceed 500 characters'],
    },
    medicines: {
      type: [medicineSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one medicine is required',
      },
    },
    advice: {
      type: String,
      trim: true,
      maxlength: [500, 'Advice cannot exceed 500 characters'],
    },
    followUpDate: {
      type: Date,
    },
    pdfUrl: {
      type: String, // Cloudinary URL if generated as downloadable PDF
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
