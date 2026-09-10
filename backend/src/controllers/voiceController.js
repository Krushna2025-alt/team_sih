const { ok } = require('../utils/response');
const voiceService = require('../services/voiceService');

// POST /api/v1/voice/extract-listing - returns a DRAFT for confirmation. Never publishes.
async function extract(req, res, next) {
  try {
    const result = await voiceService.extractListing(req.body);
    return ok(res, result);
  } catch (err) { next(err); }
}

module.exports = { extract };

