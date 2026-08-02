const { z } = require('zod');

const changePasswordSchema = z.object({
  currentPassword: z.string({ required_error: 'Current password is required' }).min(1),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(6, 'New password must be at least 6 characters'),
});

module.exports = { changePasswordSchema };