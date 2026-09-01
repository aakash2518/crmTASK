/**
 * Async handler wrapper for Express 5+.
 * Express 5 natively catches rejected promises from async handlers,
 * so this wrapper is a lightweight safety net that ensures `next` is called.
 */
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
