const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Module = require('../models/Module');

/**
 * Protect routes — verifies JWT and attaches user to req.
 * Returns 401 for missing/invalid/expired tokens.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User no longer exists' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
});

/**
 * Role-based authorization — restricts access to specified roles.
 * Must be used AFTER protect middleware.
 * Does NOT leak the user's actual role in the error message.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};

/**
 * Module-level permission check — verifies that a Manager has been
 * assigned the module identified by :slug in the route params.
 *
 * Admins pass through automatically.
 * Managers are checked against their assignedModules array.
 * Must be used AFTER protect middleware.
 */
const requireModulePermission = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  // Look up the module to ensure it exists
  const mod = await Module.findOne({ slug });
  if (!mod) {
    return res.status(404).json({ success: false, error: 'Module not found' });
  }

  // Check if the module is active
  if (!mod.isActive) {
    return res.status(403).json({ success: false, error: 'This module is currently inactive' });
  }

  // Attach the resolved module to the request for downstream use
  req.module = mod;

  // Admins have unrestricted access to all modules
  if (req.user.role === 'ADMIN') {
    return next();
  }

  // Managers: check assignedModules array
  const hasPermission = req.user.assignedModules.some(
    (assignedId) => assignedId.toString() === mod._id.toString()
  );

  if (!hasPermission) {
    return res.status(403).json({
      success: false,
      error: 'You do not have permission to access this module',
    });
  }

  next();
});

module.exports = { protect, authorize, requireModulePermission };
