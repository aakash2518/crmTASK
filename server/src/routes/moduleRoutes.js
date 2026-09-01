const express = require('express');
const { getModules } = require('../controllers/moduleController');
const {
  getModuleData,
  createModuleData,
  updateModuleData,
  deleteModuleData,
} = require('../controllers/moduleDataController');
const { protect, requireModulePermission } = require('../middlewares/authMiddleware');
const { validateObjectId } = require('../utils/validators');

const router = express.Router();

// All module routes require authentication
router.use(protect);

// Get all modules the current user has access to
router.get('/', getModules);

// Module-specific data routes — requireModulePermission verifies access
router.route('/:slug/data')
  .get(requireModulePermission, getModuleData)
  .post(requireModulePermission, createModuleData);

router.route('/:slug/data/:id')
  .put(requireModulePermission, validateObjectId('id'), updateModuleData)
  .delete(requireModulePermission, validateObjectId('id'), deleteModuleData);

module.exports = router;
