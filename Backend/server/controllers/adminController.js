const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');


// @desc    Create a new department
// @route   POST /api/admin/departments
// @access  Private/Admin
const createDepartment = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const existing = await Department.findOne({ name: name.trim() });
  if (existing) {
    throw new ApiError(409, 'A department with this name already exists');
  }

  const department = await Department.create({ name, description });

  res.status(201).json(new ApiResponse(201, department, 'Department created successfully'));
});

// @desc    Get all departments
// @route   GET /api/admin/departments
// @access  Private/Admin
const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, departments, 'Departments fetched successfully'));
});

// @desc    Get single department by ID
// @route   GET /api/admin/departments/:id
// @access  Private/Admin
const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    throw new ApiError(404, 'Department not found');
  }
  res.status(200).json(new ApiResponse(200, department, 'Department fetched successfully'));
});

// @desc    Update a department
// @route   PUT /api/admin/departments/:id
// @access  Private/Admin
const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    throw new ApiError(404, 'Department not found');
  }

  if (req.body.name && req.body.name.trim() !== department.name) {
    const duplicate = await Department.findOne({ name: req.body.name.trim() });
    if (duplicate) {
      throw new ApiError(409, 'A department with this name already exists');
    }
  }

  Object.assign(department, req.body);
  await department.save();

  res.status(200).json(new ApiResponse(200, department, 'Department updated successfully'));
});

// @desc    Delete a department
// @route   DELETE /api/admin/departments/:id
// @access  Private/Admin
const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    throw new ApiError(404, 'Department not found');
  }

  await department.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Department deleted successfully'));
});

// @desc    Create a new doctor (User + Doctor profile)
// @route   POST /api/admin/doctors
// @access  Private/Admin
const createDoctor = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    department,
    specialization,
    qualification,
    experience,
    licenseNumber,
    consultationFee,
    bio,
    availability,
  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const dept = await Department.findById(department);
  if (!dept) {
    throw new ApiError(404, 'Department not found');
  }

  const existingLicense = await Doctor.findOne({ licenseNumber });
  if (existingLicense) {
    throw new ApiError(409, 'A doctor with this license number already exists');
  }

  const user = await User.create({ name, email, password, phone, role: 'doctor' });

  const doctor = await Doctor.create({
    userId: user._id,
    department,
    specialization,
    qualification,
    experience,
    licenseNumber,
    consultationFee,
    bio,
    availability,
  });

  const populatedDoctor = await Doctor.findById(doctor._id)
    .populate('userId', 'name email phone')
    .populate('department', 'name');

  res.status(201).json(new ApiResponse(201, populatedDoctor, 'Doctor created successfully'));
});

// @desc    Get all doctors
// @route   GET /api/admin/doctors
// @access  Private/Admin
const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find()
    .populate('userId', 'name email phone isActive avatar')
    .populate('department', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, doctors, 'Doctors fetched successfully'));
});

// @desc    Get single doctor by ID
// @route   GET /api/admin/doctors/:id
// @access  Private/Admin
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate('userId', 'name email phone isActive avatar')
    .populate('department', 'name');

  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  res.status(200).json(new ApiResponse(200, doctor, 'Doctor fetched successfully'));
});

// @desc    Update a doctor (splits fields between User and Doctor docs)
// @route   PUT /api/admin/doctors/:id
// @access  Private/Admin
const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  const { name, phone, isActive, ...doctorFields } = req.body;

  // Update linked User fields if provided
  if (name || phone || isActive !== undefined) {
    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (phone) userUpdate.phone = phone;
    if (isActive !== undefined) userUpdate.isActive = isActive;
    await User.findByIdAndUpdate(doctor.userId, userUpdate, { runValidators: true });
  }

  // Validate department if being changed
  if (doctorFields.department) {
    const dept = await Department.findById(doctorFields.department);
    if (!dept) {
      throw new ApiError(404, 'Department not found');
    }
  }

  Object.assign(doctor, doctorFields);
  await doctor.save();

  const updatedDoctor = await Doctor.findById(doctor._id)
    .populate('userId', 'name email phone isActive avatar')
    .populate('department', 'name');

  res.status(200).json(new ApiResponse(200, updatedDoctor, 'Doctor updated successfully'));
});

// @desc    Delete a doctor (removes Doctor profile + linked User)
// @route   DELETE /api/admin/doctors/:id
// @access  Private/Admin
const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    throw new ApiError(404, 'Doctor not found');
  }

  await User.findByIdAndDelete(doctor.userId);
  await doctor.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Doctor deleted successfully'));
});

// @desc    Get all patients
// @route   GET /api/admin/patients
// @access  Private/Admin
const getPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find()
    .populate('userId', 'name email phone isActive avatar lastLogin')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, patients, 'Patients fetched successfully'));
});

// @desc    Get single patient by ID
// @route   GET /api/admin/patients/:id
// @access  Private/Admin
const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id).populate(
    'userId',
    'name email phone isActive avatar lastLogin'
  );

  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  res.status(200).json(new ApiResponse(200, patient, 'Patient fetched successfully'));
});

// @desc    Update a patient (splits fields between User and Patient docs)
// @route   PUT /api/admin/patients/:id
// @access  Private/Admin
const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  const { name, phone, isActive, ...patientFields } = req.body;

  if (name || phone || isActive !== undefined) {
    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (phone) userUpdate.phone = phone;
    if (isActive !== undefined) userUpdate.isActive = isActive;
    await User.findByIdAndUpdate(patient.userId, userUpdate, { runValidators: true });
  }

  Object.assign(patient, patientFields);
  await patient.save();

  const updatedPatient = await Patient.findById(patient._id).populate(
    'userId',
    'name email phone isActive avatar lastLogin'
  );

  res.status(200).json(new ApiResponse(200, updatedPatient, 'Patient updated successfully'));
});

// @desc    Delete a patient (removes Patient profile + linked User)
// @route   DELETE /api/admin/patients/:id
// @access  Private/Admin
const deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  await User.findByIdAndDelete(patient.userId);
  await patient.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Patient deleted successfully'));
});

// @desc    Get all appointments (with optional status/date filters)
// @route   GET /api/admin/appointments?status=pending&date=2026-07-28
// @access  Private/Admin
const getAllAppointments = asyncHandler(async (req, res) => {
  const { status, date } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    filter.appointmentDate = { $gte: start, $lt: end };
  }

  const appointments = await Appointment.find(filter)
    .populate({ path: 'patient', populate: { path: 'userId', select: 'name email phone' } })
    .populate({ path: 'doctor', populate: { path: 'userId', select: 'name email' } })
    .populate('department', 'name')
    .sort({ appointmentDate: -1 });

  res.status(200).json(new ApiResponse(200, appointments, 'Appointments fetched successfully'));
});

// @desc    Get single appointment by ID
// @route   GET /api/admin/appointments/:id
// @access  Private/Admin
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate({ path: 'patient', populate: { path: 'userId', select: 'name email phone' } })
    .populate({ path: 'doctor', populate: { path: 'userId', select: 'name email' } })
    .populate('department', 'name');

  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  res.status(200).json(new ApiResponse(200, appointment, 'Appointment fetched successfully'));
});

// @desc    Admin override: update appointment status
// @route   PUT /api/admin/appointments/:id/status
// @access  Private/Admin
const updateAppointmentStatusByAdmin = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  Object.assign(appointment, req.body);
  await appointment.save();

  res.status(200).json(new ApiResponse(200, appointment, 'Appointment status updated successfully'));
});

// @desc    Delete an appointment
// @route   DELETE /api/admin/appointments/:id
// @access  Private/Admin
const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  await appointment.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Appointment deleted successfully'));
});

// @desc    Get dashboard summary stats (counts + today's snapshot)
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const [
    totalDoctors,
    totalPatients,
    totalDepartments,
    totalAppointments,
    todaysAppointments,
    statusBreakdown,
  ] = await Promise.all([
    Doctor.countDocuments(),
    Patient.countDocuments(),
    Department.countDocuments(),
    Appointment.countDocuments(),
    Appointment.countDocuments({ appointmentDate: { $gte: start, $lte: end } }),
    Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  // Convert [{_id: 'pending', count: 5}, ...] into {pending: 5, confirmed: 2, ...}
  const statusCounts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
  statusBreakdown.forEach((item) => {
    statusCounts[item._id] = item.count;
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalDoctors,
        totalPatients,
        totalDepartments,
        totalAppointments,
        todaysAppointments,
        statusCounts,
      },
      'Dashboard stats fetched successfully'
    )
  );
});

// @desc    Get appointment trends over a date range (daily counts)
// @route   GET /api/admin/dashboard/appointment-trends?startDate=2026-07-01&endDate=2026-07-28
// @access  Private/Admin
const getAppointmentTrends = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  const trends = await Appointment.aggregate([
    { $match: { appointmentDate: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json(new ApiResponse(200, trends, 'Appointment trends fetched successfully'));
});

// @desc    Get revenue report grouped by department (based on completed appointments' doctor fee)
// @route   GET /api/admin/dashboard/revenue-report
// @access  Private/Admin
const getRevenueReport = asyncHandler(async (req, res) => {
  const revenueByDepartment = await Appointment.aggregate([
    { $match: { status: 'completed' } },
    {
      $lookup: {
        from: 'doctors',
        localField: 'doctor',
        foreignField: '_id',
        as: 'doctorInfo',
      },
    },
    { $unwind: '$doctorInfo' },
    {
      $lookup: {
        from: 'departments',
        localField: 'department',
        foreignField: '_id',
        as: 'departmentInfo',
      },
    },
    { $unwind: '$departmentInfo' },
    {
      $group: {
        _id: '$departmentInfo.name',
        totalRevenue: { $sum: '$doctorInfo.consultationFee' },
        completedAppointments: { $sum: 1 },
      },
    },
    { $sort: { totalRevenue: -1 } },
  ]);

  const totalRevenue = revenueByDepartment.reduce((sum, dept) => sum + dept.totalRevenue, 0);

  res
    .status(200)
    .json(
      new ApiResponse(200, { totalRevenue, revenueByDepartment }, 'Revenue report fetched successfully')
    );
});

// @desc    Get top doctors by number of completed appointments
// @route   GET /api/admin/dashboard/top-doctors
// @access  Private/Admin
const getTopDoctors = asyncHandler(async (req, res) => {
  const topDoctors = await Appointment.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$doctor', completedCount: { $sum: 1 } } },
    { $sort: { completedCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'doctors',
        localField: '_id',
        foreignField: '_id',
        as: 'doctorInfo',
      },
    },
    { $unwind: '$doctorInfo' },
    {
      $lookup: {
        from: 'users',
        localField: 'doctorInfo.userId',
        foreignField: '_id',
        as: 'userInfo',
      },
    },
    { $unwind: '$userInfo' },
    {
      $project: {
        _id: 0,
        doctorId: '$doctorInfo._id',
        name: '$userInfo.name',
        specialization: '$doctorInfo.specialization',
        completedCount: 1,
      },
    },
  ]);

  res.status(200).json(new ApiResponse(200, topDoctors, 'Top doctors fetched successfully'));
});
module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatusByAdmin,
  deleteAppointment,
  getDashboardStats,
  getAppointmentTrends,
  getRevenueReport,
  getTopDoctors,
};