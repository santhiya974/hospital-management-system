const { z } = require('zod');

const updateMyPatientProfileSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  phone: z.string().trim().optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']).optional(),
  address: z
    .object({
      street: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      pincode: z.string().trim().optional(),
    })
    .optional(),
  emergencyContact: z
    .object({
      name: z.string().trim().optional(),
      phone: z.string().trim().optional(),
      relation: z.string().trim().optional(),
    })
    .optional(),
  allergies: z.array(z.string().trim()).optional(),
  chronicConditions: z.array(z.string().trim()).optional(),
});

module.exports = { updateMyPatientProfileSchema };