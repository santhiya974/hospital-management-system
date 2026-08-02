const { z } = require('zod');

const medicineSchema = z.object({
  name: z.string({ required_error: 'Medicine name is required' }).trim().min(1),
  dosage: z.string({ required_error: 'Dosage is required' }).trim().min(1),
  frequency: z.string({ required_error: 'Frequency is required' }).trim().min(1),
  duration: z.string({ required_error: 'Duration is required' }).trim().min(1),
  instructions: z.string().trim().optional(),
});

const createPrescriptionSchema = z.object({
  appointmentId: z.string({ required_error: 'Appointment ID is required' }).trim().min(1),
  diagnosis: z
    .string({ required_error: 'Diagnosis is required' })
    .trim()
    .min(2, 'Diagnosis must be at least 2 characters')
    .max(500, 'Diagnosis cannot exceed 500 characters'),
  medicines: z
    .array(medicineSchema)
    .min(1, 'At least one medicine is required'),
  advice: z.string().trim().max(500).optional(),
  followUpDate: z.coerce.date().optional(),
});

module.exports = { createPrescriptionSchema };