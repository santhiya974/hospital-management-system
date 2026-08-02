const { z } = require('zod');

const createDepartmentSchema = z.object({
  name: z
    .string({ required_error: 'Department name is required' })
    .trim()
    .min(2, 'Department name must be at least 2 characters')
    .max(50, 'Department name cannot exceed 50 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
});

const updateDepartmentSchema = createDepartmentSchema.partial().extend({
  isActive: z.boolean().optional(),
});

module.exports = { createDepartmentSchema, updateDepartmentSchema };