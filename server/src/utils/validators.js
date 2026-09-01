const mongoose = require('mongoose');

/**
 * Validate that a string is a valid MongoDB ObjectId.
 * Returns true if valid, false otherwise.
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);
};

/**
 * Middleware that validates a route parameter as a MongoDB ObjectId.
 * @param {string} paramName - The name of the route parameter to validate (default: 'id')
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    if (!isValidObjectId(req.params[paramName])) {
      return res.status(400).json({
        success: false,
        error: `Invalid ${paramName} format`,
      });
    }
    next();
  };
};

module.exports = { isValidObjectId, validateObjectId };
