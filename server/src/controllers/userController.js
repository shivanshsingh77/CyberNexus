import User from '../models/User.js';

/**
 * @route   GET /api/users/profile
 * @desc    Get authenticated user's private profile
 * @access  Private
 */
export const getProfile = async (req, res) => {
  // Real dynamic attributes
  const accountAgeDays = Math.floor(
    (Date.now() - new Date(req.user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      lastLogin: req.user.lastLogin,
      createdAt: req.user.createdAt,
      accountAgeDays,
      authMethod: 'Bcrypt Hashing (12 Salt Rounds)',
      sessionSecurity: 'HTTP-Only SameSite=Lax Cookie Active',
    },
  });
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update username or settings
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { username } = req.body;

    if (!username || username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long.',
      });
    }

    // Check if new username is taken
    const existing = await User.findOne({
      username: username.trim(),
      _id: { $ne: req.user._id },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Username is already taken by another user.',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { username: username.trim() },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
