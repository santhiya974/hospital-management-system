const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const cloudinary = require('../config/cloudinary');

// Helper: resolve the logged-in doctor's Doctor document from req.user.id
const getDoctorProfileOrThrow = async (userId) => {
  const doctor = await Doctor.findOne({ userId });
  if (!doctor) {
    throw new ApiError(404, 'Doctor profile not found for this account');
  }
  return doctor;
};

// @desc    Get own doctor profile
// @route   GET /api/doctor/profile
// @access  Private/Doctor
const getMyProfile = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ userId: req.user._id })
    .populate('userId', 'name email phone avatar gender dateOfBirth')
    .populate('department', 'name');

  if (!doctor) {
    throw new ApiError(404, 'Doctor profile not found for this account');
  }

  res.status(200).json(new ApiResponse(200, doctor, 'Profile fetched successfully'));
});

// @desc    Update own profile (bio, availability, fee, phone, languages — read-only fields blocked)
// @route   PUT /api/doctor/profile
// @access  Private/Doctor
const updateMyProfile = asyncHandler(async (req, res) => {
  const doctor = await getDoctorProfileOrThrow(req.user._id);

  // Doctor-document editable fields
  const doctorFields = ['bio', 'availability', 'consultationFee', 'isAvailable', 'languagesKnown', 'appointmentDuration'];
  const doctorUpdates = {};
  doctorFields.forEach((field) => {
    if (req.body[field] !== undefined) doctorUpdates[field] = req.body[field];
  });

  Object.assign(doctor, doctorUpdates);
  await doctor.save();

  // User-document editable field (phone only — name/email/gender/DOB stay read-only here)
  if (req.body.phone !== undefined) {
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, { phone: req.body.phone }, { runValidators: true });
  }

  const updatedDoctor = await Doctor.findById(doctor._id)
    .populate('userId', 'name email phone avatar gender dateOfBirth')
    .populate('department', 'name');

  res.status(200).json(new ApiResponse(200, updatedDoctor, 'Profile updated successfully'));
});

// @desc    Get today's appointments for the logged-in doctor
// @route   GET /api/doctor/appointments/today
// @access  Private/Doctor
const getTodaysAppointments = asyncHandler(async (req, res) => {
  const doctor = await getDoctorProfileOrThrow(req.user._id);

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const appointments = await Appointment.find({
    doctor: doctor._id,
    appointmentDate: { $gte: start, $lte: end },
  })
    .populate({ path: 'patient', populate: { path: 'userId', select: 'name email phone avatar' } })
    .sort({ timeSlot: 1 });

  res.status(200).json(new ApiResponse(200, appointments, "Today's appointments fetched successfully"));
});

// @desc    Get all appointments for the logged-in doctor (with optional status filter)
// @route   GET /api/doctor/appointments?status=pending
// @access  Private/Doctor
const getMyAppointments = asyncHandler(async (req, res) => {
  const doctor = await getDoctorProfileOrThrow(req.user._id);

  const filter = { doctor: doctor._id };
  if (req.query.status) filter.status = req.query.status;

  const appointments = await Appointment.find(filter)
    .populate({ path: 'patient', populate: { path: 'userId', select: 'name email phone avatar' } })
    .sort({ appointmentDate: -1 });

  res.status(200).json(new ApiResponse(200, appointments, 'Appointments fetched successfully'));
});

// @desc    Get a specific patient's medical history (past completed appointments + prescriptions)
// @route   GET /api/doctor/patients/:patientId/history
// @access  Private/Doctor
const getPatientMedicalHistory = asyncHandler(async (req, res) => {
  const doctor = await getDoctorProfileOrThrow(req.user._id);
  const { patientId } = req.params;

  // Security: doctor may only view history for a patient they have/had an appointment with
  const hasRelation = await Appointment.findOne({ doctor: doctor._id, patient: patientId });
  if (!hasRelation) {
    throw new ApiError(403, 'You are not authorized to view this patient\'s history');
  }

  const appointments = await Appointment.find({ patient: patientId, status: 'completed' })
    .populate({ path: 'doctor', populate: { path: 'userId', select: 'name' } })
    .sort({ appointmentDate: -1 });

  const prescriptions = await Prescription.find({ patient: patientId })
    .populate({ path: 'doctor', populate: { path: 'userId', select: 'name' } })
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, { appointments, prescriptions }, "Patient's medical history fetched successfully")
  );
});

// @desc    Update status of an appointment belonging to the logged-in doctor
// @route   PUT /api/doctor/appointments/:id/status
// @access  Private/Doctor
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const doctor = await getDoctorProfileOrThrow(req.user._id);

  const appointment = await Appointment.findOne({ _id: req.params.id, doctor: doctor._id });
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found or does not belong to you');
  }

  const { status, cancellationReason, doctorNotes } = req.body;

  appointment.status = status;
  if (cancellationReason !== undefined) appointment.cancellationReason = cancellationReason;
  if (doctorNotes !== undefined) appointment.doctorNotes = doctorNotes;

  await appointment.save();

  res.status(200).json(new ApiResponse(200, appointment, 'Appointment status updated successfully'));
});

// @desc    Create a prescription for a completed appointment
// @route   POST /api/doctor/prescriptions
// @access  Private/Doctor
const createPrescription = asyncHandler(async (req, res) => {
  const doctor = await getDoctorProfileOrThrow(req.user._id);
  const { appointmentId, diagnosis, medicines, advice, followUpDate } = req.body;

  const appointment = await Appointment.findOne({ _id: appointmentId, doctor: doctor._id });
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found or does not belong to you');
  }

  if (appointment.status !== 'completed') {
    throw new ApiError(400, 'Prescriptions can only be created for completed appointments');
  }

  const existing = await Prescription.findOne({ appointment: appointmentId });
  if (existing) {
    throw new ApiError(409, 'A prescription already exists for this appointment');
  }

  const prescription = await Prescription.create({
    appointment: appointmentId,
    doctor: doctor._id,
    patient: appointment.patient,
    diagnosis,
    medicines,
    advice,
    followUpDate,
  });

  res.status(201).json(new ApiResponse(201, prescription, 'Prescription created successfully'));
});

// @desc    Get a single prescription created by the logged-in doctor
// @route   GET /api/doctor/prescriptions/:id
// @access  Private/Doctor
const getPrescriptionById = asyncHandler(async (req, res) => {
  const doctor = await getDoctorProfileOrThrow(req.user._id);

  const prescription = await Prescription.findOne({ _id: req.params.id, doctor: doctor._id }).populate(
    'patient',
    'userId'
  );

  if (!prescription) {
    throw new ApiError(404, 'Prescription not found or does not belong to you');
  }

  res.status(200).json(new ApiResponse(200, prescription, 'Prescription fetched successfully'));
});

// @desc    Get all prescriptions created by the logged-in doctor
// @route   GET /api/doctor/prescriptions
// @access  Private/Doctor
const getMyPrescriptions = asyncHandler(async (req, res) => {
  const doctor = await getDoctorProfileOrThrow(req.user._id);

  const prescriptions = await Prescription.find({ doctor: doctor._id })
    .populate({ path: 'patient', populate: { path: 'userId', select: 'name' } })
    .populate('appointment', 'appointmentDate reason')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, prescriptions, 'Prescriptions fetched successfully'));
});

// @desc    Upload/update own avatar (Cloudinary)
// @route   POST /api/doctor/profile/avatar
// @access  Private/Doctor
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No image file provided');
  }

  const User = require('../models/User');

  // Upload buffer to Cloudinary using a stream
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
  { folder: 'hms/avatars', resource_type: 'image', timeout: 60000 },
  (error, result) => {
    if (error) reject(error);
    else resolve(result);
  }
);
    stream.end(req.file.buffer);
  });

  await User.findByIdAndUpdate(req.user._id, {
    avatar: { url: uploadResult.secure_url, publicId: uploadResult.public_id },
  });

  res.status(200).json(new ApiResponse(200, { url: uploadResult.secure_url }, 'Avatar uploaded successfully'));
});
module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  getTodaysAppointments,
  getMyAppointments,
  getPatientMedicalHistory,
  updateAppointmentStatus,
  createPrescription,
  getPrescriptionById,
  getMyPrescriptions,
};