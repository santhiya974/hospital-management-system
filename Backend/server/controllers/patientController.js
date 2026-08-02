const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');


// Helper: resolve the logged-in patient's Patient document from req.user.id
const getPatientProfileOrThrow = async (userId) => {
  const patient = await Patient.findOne({ userId });
  if (!patient) {
    throw new ApiError(404, 'Patient profile not found for this account');
  }
  return patient;
};

// @desc    Get own patient profile
// @route   GET /api/patient/profile
// @access  Private/Patient
const getMyProfile = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ userId: req.user._id }).populate(
    'userId',
    'name email phone avatar'
  );

  if (!patient) {
    throw new ApiError(404, 'Patient profile not found for this account');
  }

  res.status(200).json(new ApiResponse(200, patient, 'Profile fetched successfully'));
});

// @desc    Update own profile (address, emergency contact, allergies, etc.)
// @route   PUT /api/patient/profile
// @access  Private/Patient
const updateMyProfile = asyncHandler(async (req, res) => {
  const patient = await getPatientProfileOrThrow(req.user._id);

  const { name, phone, ...patientFields } = req.body;

  // Update linked User fields if provided
  if (name || phone) {
    const User = require('../models/User');
    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (phone) userUpdate.phone = phone;
    await User.findByIdAndUpdate(patient.userId, userUpdate, { runValidators: true });
  }

  Object.assign(patient, patientFields);
  await patient.save();

  const updatedPatient = await Patient.findById(patient._id).populate(
    'userId',
    'name email phone avatar'
  );

  res.status(200).json(new ApiResponse(200, updatedPatient, 'Profile updated successfully'));
});

// @desc    Book a new appointment
// @route   POST /api/patient/appointments
// @access  Private/Patient
const bookAppointment = asyncHandler(async (req, res) => {
  const patient = await getPatientProfileOrThrow(req.user._id);
  const { doctor, department, appointmentDate, timeSlot, reason } = req.body;

  const doctorDoc = await Doctor.findById(doctor);
  if (!doctorDoc) {
    throw new ApiError(404, 'Doctor not found');
  }
  if (!doctorDoc.isAvailable) {
    throw new ApiError(400, 'This doctor is currently not available for appointments');
  }

  const departmentDoc = await Department.findById(department);
  if (!departmentDoc) {
    throw new ApiError(404, 'Department not found');
  }

  // Prevent booking in the past
  if (new Date(appointmentDate) < new Date().setHours(0, 0, 0, 0)) {
    throw new ApiError(400, 'Cannot book an appointment in the past');
  }

  // Double-booking check (schema also has a unique index as a DB-level safeguard)
  const conflict = await Appointment.findOne({
    doctor,
    appointmentDate,
    timeSlot,
    status: { $ne: 'cancelled' },
  });
  if (conflict) {
    throw new ApiError(409, 'This time slot is already booked for the selected doctor');
  }

  const appointment = await Appointment.create({
    patient: patient._id,
    doctor,
    department,
    appointmentDate,
    timeSlot,
    reason,
  });

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate({ path: 'doctor', populate: { path: 'userId', select: 'name' } })
    .populate('department', 'name');

  res.status(201).json(new ApiResponse(201, populatedAppointment, 'Appointment booked successfully'));
});

// @desc    Get all appointments for the logged-in patient (optional status filter)
// @route   GET /api/patient/appointments?status=pending
// @access  Private/Patient
const getMyAppointments = asyncHandler(async (req, res) => {
  const patient = await getPatientProfileOrThrow(req.user._id);

  const filter = { patient: patient._id };
  if (req.query.status) filter.status = req.query.status;

  const appointments = await Appointment.find(filter)
    .populate({ path: 'doctor', populate: { path: 'userId', select: 'name' } })
    .populate('department', 'name')
    .sort({ appointmentDate: -1 });

  res.status(200).json(new ApiResponse(200, appointments, 'Appointments fetched successfully'));
});

// @desc    Cancel own appointment
// @route   PUT /api/patient/appointments/:id/cancel
// @access  Private/Patient
const cancelMyAppointment = asyncHandler(async (req, res) => {
  const patient = await getPatientProfileOrThrow(req.user._id);

  const appointment = await Appointment.findOne({ _id: req.params.id, patient: patient._id });
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found or does not belong to you');
  }

  if (['completed', 'cancelled'].includes(appointment.status)) {
    throw new ApiError(400, `Cannot cancel an appointment that is already ${appointment.status}`);
  }

  appointment.status = 'cancelled';
  appointment.cancellationReason = req.body.cancellationReason || 'Cancelled by patient';
  await appointment.save();

  res.status(200).json(new ApiResponse(200, appointment, 'Appointment cancelled successfully'));
});

// @desc    Get own medical history (completed appointments + prescriptions)
// @route   GET /api/patient/history
// @access  Private/Patient
const getMyMedicalHistory = asyncHandler(async (req, res) => {
  const patient = await getPatientProfileOrThrow(req.user._id);

  const appointments = await Appointment.find({ patient: patient._id, status: 'completed' })
    .populate({ path: 'doctor', populate: { path: 'userId', select: 'name' } })
    .sort({ appointmentDate: -1 });

  const prescriptions = await Prescription.find({ patient: patient._id })
    .populate({ path: 'doctor', populate: { path: 'userId', select: 'name' } })
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, { appointments, prescriptions }, 'Medical history fetched successfully'));
});

// @desc    Get a single prescription belonging to the logged-in patient
// @route   GET /api/patient/prescriptions/:id
// @access  Private/Patient
const getPrescriptionById = asyncHandler(async (req, res) => {
  const patient = await getPatientProfileOrThrow(req.user._id);

  const prescription = await Prescription.findOne({ _id: req.params.id, patient: patient._id })
    .populate({ path: 'doctor', populate: { path: 'userId', select: 'name' } })
    .populate({ path: 'appointment', select: 'appointmentDate reason' });

  if (!prescription) {
    throw new ApiError(404, 'Prescription not found or does not belong to you');
  }

  res.status(200).json(new ApiResponse(200, prescription, 'Prescription fetched successfully'));
});

// @desc    Get all departments (for booking dropdown)
// @route   GET /api/patient/departments
// @access  Private/Patient
const getDepartmentsList = asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true }).select('name description');
  res.status(200).json(new ApiResponse(200, departments, 'Departments fetched successfully'));
});

// @desc    Get available doctors, optionally filtered by department
// @route   GET /api/patient/doctors?department=<id>
// @access  Private/Patient
const getDoctorsList = asyncHandler(async (req, res) => {
  const filter = { isAvailable: true };
  if (req.query.department) filter.department = req.query.department;

  const doctors = await Doctor.find(filter)
    .populate('userId', 'name')
    .populate('department', 'name')
    .select('specialization consultationFee experience availability userId department');

  res.status(200).json(new ApiResponse(200, doctors, 'Doctors fetched successfully'));
});
module.exports = {
  getMyProfile,
  updateMyProfile,
  bookAppointment,
  getMyAppointments,
  cancelMyAppointment,
  getMyMedicalHistory,
  getPrescriptionById,
  getDepartmentsList,
  getDoctorsList,
};