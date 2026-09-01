const express = require('express');
const {
  getManagers,
  getManager,
  createManager,
  updateManager,
  deleteManager,
  assignModules,
} = require('../controllers/managerController');
const {
  getModules,
  getModule,
  createModule,
  updateModule,
  deleteModule,
} = require('../controllers/moduleController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateObjectId } = require('../utils/validators');

const router = express.Router();

// All admin routes require authentication + ADMIN role
router.use(protect);
router.use(authorize('ADMIN'));

// Manager management
router.route('/managers')
  .get(getManagers)
  .post(createManager);

router.route('/managers/:id')
  .get(validateObjectId('id'), getManager)
  .put(validateObjectId('id'), updateManager)
  .delete(validateObjectId('id'), deleteManager);

router.put('/managers/:id/permissions', validateObjectId('id'), assignModules);

// Module management
router.route('/modules')
  .get(getModules)
  .post(createModule);

router.route('/modules/:id')
  .get(validateObjectId('id'), getModule)
  .put(validateObjectId('id'), updateModule)
  .delete(validateObjectId('id'), deleteModule);

module.exports = router;
