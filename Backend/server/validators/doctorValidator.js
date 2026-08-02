const { z } = require('zod');

const createDoctorSchema = z.object({
  // User (auth) fields
  name: z.string({ required_error: 'Name is required' }).trim().min(2).max(50),
  email: z.string({ required_error: 'Email is required' }).trim().email('Please provide a valid email'),
  password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
  phone: z.string().trim().optional(),

  // Doctor profile fields
  department: z.string({ required_error: 'Department is required' }).trim().min(1),
  specialization: z.string({ required_error: 'Specialization is required' }).trim().min(2),
  qualification: z.string({ required_error: 'Qualification is required' }).trim().min(2),
  experience: z.coerce.number({ required_error: 'Experience is required' }).min(0, 'Experience cannot be negative'),
  licenseNumber: z.string({ required_error: 'License number is required' }).trim().min(3),
  consultationFee: z.coerce.number({ required_error: 'Consultation fee is required' }).min(0),
  bio: z.string().trim().max(1000).optional(),
  availability: z
    .array(
      z.object({
        day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
        startTime: z.string(),
        endTime: z.string(),
      })
    )
    .optional(),
});

const updateDoctorSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  phone: z.string().trim().optional(),
  department: z.string().trim().min(1).optional(),
  specialization: z.string().trim().min(2).optional(),
  qualification: z.string().trim().min(2).optional(),
  experience: z.coerce.number().min(0).optional(),
  consultationFee: z.coerce.number().min(0).optional(),
  bio: z.string().trim().max(1000).optional(),
  isAvailable: z.boolean().optional(),
  isActive: z.boolean().optional(),
  availability: z
    .array(
      z.object({
        day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
        startTime: z.string(),
        endTime: z.string(),
      })
    )
    .optional(),
});

module.exports = { createDoctorSchema, updateDoctorSchema };