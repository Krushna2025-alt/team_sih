const { fail } = require('../utils/response');

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !req.user.id) return fail(res, 'Authentication required.', 401);
  if (!req.user.role) return fail(res, 'Complete your profile first via POST /api/v1/auth/profile.', 403);
  if (!roles.includes(req.user.role)) {
    return fail(res, 'You do not have permission to perform this action.', 403);
  }
  return next();
};

module.exports = { requireRole };

