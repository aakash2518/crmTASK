const Module = require('../models/Module');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all modules (Admin sees all, Manager sees assigned)
// @route   GET /api/admin/modules  AND  GET /api/modules
// @access  Private
exports.getModules = asyncHandler(async (req, res) => {
  let modules;

  if (req.user.role === 'ADMIN') {
    modules = await Module.find().sort({ createdAt: 1 });
  } else {
    // Manager: only return modules they are assigned to
    modules = await Module.find({
      _id: { $in: req.user.assignedModules },
      isActive: true,
    }).sort({ createdAt: 1 });
  }

  res.status(200).json({ success: true, count: modules.length, data: modules });
});

// @desc    Get single module by ID
// @route   GET /api/admin/modules/:id
// @access  Private/Admin
exports.getModule = asyncHandler(async (req, res) => {
  const mod = await Module.findById(req.params.id);

  if (!mod) {
    return res.status(404).json({ success: false, error: 'Module not found' });
  }

  res.status(200).json({ success: true, data: mod });
});

// @desc    Create a new module
// @route   POST /api/admin/modules
// @access  Private/Admin
exports.createModule = asyncHandler(async (req, res) => {
  // Only allow explicit fields — prevent mass assignment
  const { name, slug, description } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ success: false, error: 'Name and slug are required' });
  }

  // Check for duplicate name or slug
  const existing = await Module.findOne({ 
    $or: [
      { slug: slug.toLowerCase() },
      { name: new RegExp('^' + name + '$', 'i') }
    ]
  });
  
  if (existing) {
    if (existing.slug === slug.toLowerCase()) {
      return res.status(400).json({ success: false, error: 'A module with this slug already exists' });
    } else {
      return res.status(400).json({ success: false, error: 'A module with this name already exists' });
    }
  }

  const mod = await Module.create({
    name,
    slug: slug.toLowerCase(),
    description: description || '',
  });

  res.status(201).json({ success: true, data: mod });
});

// @desc    Update a module
// @route   PUT /api/admin/modules/:id
// @access  Private/Admin
exports.updateModule = asyncHandler(async (req, res) => {
  const mod = await Module.findById(req.params.id);

  if (!mod) {
    return res.status(404).json({ success: false, error: 'Module not found' });
  }

  // Only allow explicit fields
  const { name, description, isActive } = req.body;
  if (name !== undefined) mod.name = name;
  if (description !== undefined) mod.description = description;
  if (isActive !== undefined) mod.isActive = isActive;

  await mod.save();

  res.status(200).json({ success: true, data: mod });
});

// @desc    Delete a module
// @route   DELETE /api/admin/modules/:id
// @access  Private/Admin
exports.deleteModule = asyncHandler(async (req, res) => {
  const mod = await Module.findById(req.params.id);

  if (!mod) {
    return res.status(404).json({ success: false, error: 'Module not found' });
  }

  await mod.deleteOne();

  res.status(200).json({ success: true, data: {} });
});
