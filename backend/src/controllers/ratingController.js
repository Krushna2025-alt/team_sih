const { created } = require('../utils/response');
const ratingService = require('../services/ratingService');

// POST /api/v1/ratings - buyer rates farmer / farmer rates buyer, AFTER delivery only.
async function create(req, res, next) {
  try { return created(res, await ratingService.submitRating(req.user.id, req.body)); }
  catch (err) { next(err); }
}

module.exports = { create };

