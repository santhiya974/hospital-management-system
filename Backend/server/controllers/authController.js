const User = require('../models/User');
const Patient = require('../models/Patient');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const generateToken = require('../utils/generateToken');

// Cookie options shared by login/register/logout
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// @desc    Register a new patient
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, dateOfBirth, gender } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  // Create base auth user — always 'patient' role on public registration
  const user = await User.create({ name, email, password, phone, role: 'patient' });

  // Create linked patient profile
  const patient = await Patient.create({
    userId: user._id,
    dateOfBirth,
    gender,
  });

  const token = generateToken(user._id, user.role);

  res
    .status(201)
    .cookie('token', token, cookieOptions)
    .json(
      new ApiResponse(
        201,
        {
          user: { id: user._id, name: user.name, email: user.email, role: user.role },
          patientId: patient._id,
          token,
        },
        'Registration successful'
      )
    );
});

// @desc    Login user (admin/doctor/patient)
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Contact admin.');
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id, user.role);

  res
    .status(200)
    .cookie('token', token, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: { id: user._id, name: user.name, email: user.email, role: user.role },
          token,
        },
        'Login successful'
      )
    );
});

// @desc    Logout user — clears auth cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie('token', cookieOptions);
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

// @desc    Get currently logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // req.user attached by authMiddleware.protect
  res.status(200).json(new ApiResponse(200, req.user, 'Current user fetched'));
});

// @desc    Change password for the currently logged-in user (any role)
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  user.password = newPassword; // pre('save') hook in User model re-hashes automatically
  await user.save();

  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});

module.exports = { registerUser, loginUser, logoutUser, getMe, changePassword };