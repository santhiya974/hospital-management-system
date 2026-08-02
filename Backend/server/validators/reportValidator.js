const { z } = require('zod');

const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

module.exports = { dateRangeSchema };