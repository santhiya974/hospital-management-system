const { z } = require('zod');

const updateMyProfileSchema = z.object({
  phone: z.string().trim().min(7, 'Enter a valid phone number').max(15).optional(),
  bio: z.string().trim().max(300, 'Bio cannot exceed 300 characters').optional(),
  consultationFee: z.coerce.number().positive('Fee must be greater than 0').optional(),
  isAvailable: z.boolean().optional(),
  languagesKnown: z.array(z.string().trim()).optional(),
  availability: z
    .array(
      z.object({
        day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
        startTime: z.string(),
        endTime: z.string(),
      })
    )
    .optional(),
  appointmentDuration: z.coerce.number().refine((v) => [15, 20, 30].includes(v), {
    message: 'Appointment duration must be 15, 20, or 30 minutes',
  }).optional(),
});

module.exports = { updateMyProfileSchema };