const express = require('express');
const router = express.Router();

const {
  getMyProfile,
  updateMyProfile,
  bookAppointment,
  getMyAppointments,
  cancelMyAppointment,
  getMyMedicalHistory,
  getPrescriptionById,
  getDepartmentsList,
  getDoctorsList,
} = require('../controllers/patientController');

const { protect, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { updateMyPatientProfileSchema } = require('../validators/patientProfileValidator');
const { bookAppointmentSchema } = require('../validators/appointmentValidator');

// All routes below require a logged-in patient
router.use(protect, authorize('patient'));
router.get('/departments', getDepartmentsList);
router.get('/doctors', getDoctorsList);
router
  .route('/profile')
  .get(getMyProfile)
  .put(validate(updateMyPatientProfileSchema), updateMyProfile);

router
  .route('/appointments')
  .post(validate(bookAppointmentSchema), bookAppointment)
  .get(getMyAppointments);

router.put('/appointments/:id/cancel', cancelMyAppointment);

router.get('/history', getMyMedicalHistory);

router.get('/prescriptions/:id', getPrescriptionById);

module.exports = router;