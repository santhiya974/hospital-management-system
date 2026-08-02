const express = require('express');
const router = express.Router();

const {
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

} = require('../controllers/adminController');

const { protect, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const {
  createDepartmentSchema,
  updateDepartmentSchema,
} = require('../validators/departmentValidator');
const {
  createDoctorSchema,
  updateDoctorSchema,
} = require('../validators/doctorValidator');
const { updatePatientSchema } = require('../validators/patientValidator');
const { updateAppointmentStatusSchema } = require('../validators/appointmentValidator');
const { dateRangeSchema } = require('../validators/reportValidator');

// All routes below require a logged-in admin
router.use(protect, authorize('admin'));
// const { updatePatientSchema } = require('../validators/patientValidator');

// Department routes
router
  .route('/departments')
  .post(validate(createDepartmentSchema), createDepartment)
  .get(getDepartments);

router
  .route('/departments/:id')
  .get(getDepartmentById)
  .put(validate(updateDepartmentSchema), updateDepartment)
  .delete(deleteDepartment);


// Doctor routes
router
  .route('/doctors')
  .post(validate(createDoctorSchema), createDoctor)
  .get(getDoctors);

router
  .route('/doctors/:id')
  .get(getDoctorById)
  .put(validate(updateDoctorSchema), updateDoctor)
  .delete(deleteDoctor);

// Patient routes
router.route('/patients').get(getPatients);

router
  .route('/patients/:id')
  .get(getPatientById)
  .put(validate(updatePatientSchema), updatePatient)
  .delete(deletePatient);
  
// Appointment routes
router.route('/appointments').get(getAllAppointments);

router.route('/appointments/:id').get(getAppointmentById).delete(deleteAppointment);

router
  .route('/appointments/:id/status')
  .put(validate(updateAppointmentStatusSchema), updateAppointmentStatusByAdmin);

// Dashboard / Reports / Analytics routes
router.get('/dashboard/stats', getDashboardStats);
router.get(
  '/dashboard/appointment-trends',
  validate(dateRangeSchema, 'query'),
  getAppointmentTrends
);
router.get('/dashboard/revenue-report', getRevenueReport);
router.get('/dashboard/top-doctors', getTopDoctors);

module.exports = router;
