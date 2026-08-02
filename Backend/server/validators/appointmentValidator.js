const { z } = require('zod');

const bookAppointmentSchema = z.object({
  doctor: z.string({ required_error: 'Doctor is required' }).trim().min(1),
  department: z.string({ required_error: 'Department is required' }).trim().min(1),
  appointmentDate: z.coerce.date({ required_error: 'Appointment date is required' }),
  timeSlot: z.string({ required_error: 'Time slot is required' }).trim().min(1),
  reason: z
    .string({ required_error: 'Reason for visit is required' })
    .trim()
    .min(3, 'Reason must be at least 3 characters')
    .max(500, 'Reason cannot exceed 500 characters'),
});

const updateAppointmentStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled'], {
    required_error: 'Status is required',
  }),
  cancellationReason: z.string().trim().max(500).optional(),
  doctorNotes: z.string().trim().max(1000).optional(),
});

module.exports = { bookAppointmentSchema, updateAppointmentStatusSchema };