const ModuleData = require('../models/ModuleData');
const asyncHandler = require('../utils/asyncHandler');
const { validateModuleData } = require('../utils/moduleValidators');

// @desc    Get all data records for a module
// @route   GET /api/modules/:slug/data
// @access  Private (requireModulePermission applied at route level)
exports.getModuleData = asyncHandler(async (req, res) => {
  const data = await ModuleData.find({ moduleId: req.module._id })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: data.length, data });
});

// @desc    Create a data record for a module
// @route   POST /api/modules/:slug/data
// @access  Private (requireModulePermission applied at route level)
exports.createModuleData = asyncHandler(async (req, res) => {
  // Only allow explicit fields
  const { title, description, status, data } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, error: 'Title is required' });
  }

  // Validate module specific data
  const validationResult = validateModuleData(req.module.slug, data || {});
  if (!validationResult.isValid) {
    return res.status(422).json({ success: false, error: validationResult.errors.join(', ') });
  }

  const record = await ModuleData.create({
    moduleId: req.module._id,
    title,
    description: description || '',
    status: status || 'active',
    data: validationResult.sanitizedData,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: record });
});

// @desc    Update a data record
// @route   PUT /api/modules/:slug/data/:id
// @access  Private (requireModulePermission applied at route level)
exports.updateModuleData = asyncHandler(async (req, res) => {
  const record = await ModuleData.findOne({
    _id: req.params.id,
    moduleId: req.module._id,
  });

  if (!record) {
    return res.status(404).json({ success: false, error: 'Record not found' });
  }

  // Only allow explicit fields — prevent moduleId/createdBy tampering
  const { title, description, status, data } = req.body;
  if (title !== undefined) record.title = title;
  if (description !== undefined) record.description = description;
  if (status !== undefined) record.status = status;
  
  if (data !== undefined) {
    const validationResult = validateModuleData(req.module.slug, data);
    if (!validationResult.isValid) {
      return res.status(422).json({ success: false, error: validationResult.errors.join(', ') });
    }
    record.data = validationResult.sanitizedData;
  }

  await record.save();

  res.status(200).json({ success: true, data: record });
});

// @desc    Delete a data record
// @route   DELETE /api/modules/:slug/data/:id
// @access  Private (requireModulePermission applied at route level)
exports.deleteModuleData = asyncHandler(async (req, res) => {
  const record = await ModuleData.findOne({
    _id: req.params.id,
    moduleId: req.module._id,
  });

  if (!record) {
    return res.status(404).json({ success: false, error: 'Record not found' });
  }

  await record.deleteOne();

  res.status(200).json({ success: true, data: {} });
});
