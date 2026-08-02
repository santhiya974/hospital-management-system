const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const {
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
} = require('../controllers/doctorController');

const { protect, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { updateMyProfileSchema } = require('../validators/doctorProfileValidator');
const { updateAppointmentStatusSchema } = require('../validators/appointmentValidator');
const { createPrescriptionSchema } = require('../validators/prescriptionValidator');

// All routes below require a logged-in doctor
router.use(protect, authorize('doctor'));

router.route('/profile').get(getMyProfile).put(validate(updateMyProfileSchema), updateMyProfile);
router.post('/profile/avatar', upload.single('avatar'), uploadAvatar);

router.get('/appointments/today', getTodaysAppointments);
router.get('/appointments', getMyAppointments);

router.get('/patients/:patientId/history', getPatientMedicalHistory);



router
  .route('/appointments/:id/status')
  .put(validate(updateAppointmentStatusSchema), updateAppointmentStatus);

router.get('/prescriptions', getMyPrescriptions);
router.post('/prescriptions', validate(createPrescriptionSchema), createPrescription);
router.get('/prescriptions/:id', getPrescriptionById);

module.exports = router;