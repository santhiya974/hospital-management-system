const { z } = require('zod');

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
  phone: z.string().trim().optional(),
  // Public registration is patient-only; admin/doctor accounts are created by Admin
  dateOfBirth: z.coerce.date({ required_error: 'Date of birth is required' }),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Gender is required',
  }),
});

const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required' }).trim().email('Please provide a valid email'),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

module.exports = { registerSchema, loginSchema };