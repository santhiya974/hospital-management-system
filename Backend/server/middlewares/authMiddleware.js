const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

// Verifies JWT and attaches user to req.user
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Token from HTTP-only cookie (preferred) or Authorization header
  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized. Please log in.');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(401, 'User belonging to this token no longer exists.');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Contact admin.');
  }

  req.user = user; // full user doc (password excluded by default via select:false)
  next();
});

// Restricts route access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `Role '${req.user.role}' is not authorized to access this resource.`);
    }
    next();
  };
};

module.exports = { protect, authorize };
