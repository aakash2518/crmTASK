const User = require('../models/User');
const Module = require('../models/Module');
const asyncHandler = require('../utils/asyncHandler');
const { isValidObjectId } = require('../utils/validators');

// @desc    Get all managers
// @route   GET /api/admin/managers
// @access  Private/Admin
exports.getManagers = asyncHandler(async (req, res) => {
  const managers = await User.find({ role: 'MANAGER' })
    .populate('assignedModules', 'name slug isActive')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: managers.length, data: managers });
});

// @desc    Get single manager
// @route   GET /api/admin/managers/:id
// @access  Private/Admin
exports.getManager = asyncHandler(async (req, res) => {
  const manager = await User.findOne({ _id: req.params.id, role: 'MANAGER' })
    .populate('assignedModules', 'name slug isActive');

  if (!manager) {
    return res.status(404).json({ success: false, error: 'Manager not found' });
  }

  res.status(200).json({ success: true, data: manager });
});

// @desc    Create a manager
// @route   POST /api/admin/managers
// @access  Private/Admin
exports.createManager = asyncHandler(async (req, res) => {
  // Only allow explicit fields — prevent mass assignment of role/permissions
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
  }

  // Check for existing user with same email
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, error: 'A user with this email already exists' });
  }

  // Force role to MANAGER — never trust client-supplied role
  const manager = await User.create({
    name,
    email,
    password,
    role: 'MANAGER',
    assignedModules: [],
  });

  res.status(201).json({ success: true, data: manager });
});

// @desc    Update a manager (name, email, password only)
// @route   PUT /api/admin/managers/:id
// @access  Private/Admin
exports.updateManager = asyncHandler(async (req, res) => {
  const manager = await User.findOne({ _id: req.params.id, role: 'MANAGER' });

  if (!manager) {
    return res.status(404).json({ success: false, error: 'Manager not found' });
  }

  // Only allow explicit fields — block role, assignedModules, etc.
  const { name, email, password } = req.body;
  if (name !== undefined) manager.name = name;
  if (email !== undefined) manager.email = email;
  if (password !== undefined) {
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }
    manager.password = password;
  }

  await manager.save();

  res.status(200).json({ success: true, data: manager });
});

// @desc    Delete a manager
// @route   DELETE /api/admin/managers/:id
// @access  Private/Admin
exports.deleteManager = asyncHandler(async (req, res) => {
  const manager = await User.findOne({ _id: req.params.id, role: 'MANAGER' });

  if (!manager) {
    return res.status(404).json({ success: false, error: 'Manager not found' });
  }

  await manager.deleteOne();

  res.status(200).json({ success: true, data: {} });
});

// @desc    Assign modules to a manager
// @route   PUT /api/admin/managers/:id/permissions
// @access  Private/Admin
exports.assignModules = asyncHandler(async (req, res) => {
  const manager = await User.findOne({ _id: req.params.id, role: 'MANAGER' });

  if (!manager) {
    return res.status(404).json({ success: false, error: 'Manager not found' });
  }

  const { moduleIds } = req.body;

  if (!Array.isArray(moduleIds)) {
    return res.status(400).json({ success: false, error: 'moduleIds must be an array' });
  }

  // Validate every supplied ID is a valid ObjectId
  for (const id of moduleIds) {
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: `Invalid module ID: ${id}` });
    }
  }

  // Validate every supplied ID refers to a real, active module
  const validModules = await Module.find({ _id: { $in: moduleIds }, isActive: true });
  if (validModules.length !== moduleIds.length) {
    return res.status(400).json({ success: false, error: 'One or more module IDs are invalid or inactive' });
  }

  const updated = await User.findByIdAndUpdate(
    manager._id,
    { assignedModules: moduleIds },
    { new: true, runValidators: false }
  ).populate('assignedModules', 'name slug isActive');

  res.status(200).json({ success: true, data: updated });
});
