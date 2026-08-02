const ApiError = require('../utils/ApiError');

// source: 'body' | 'query' | 'params' — defaults to 'body'
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      throw new ApiError(400, 'Validation failed', errors);
    }

    // Overwrite with parsed/coerced data (e.g., dateOfBirth string -> Date)
    req[source] = result.data;
    next();
  };
};

module.exports = validate;