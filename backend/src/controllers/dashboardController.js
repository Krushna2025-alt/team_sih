const { ok } = require('../utils/response');
const dashboardService = require('../services/dashboardService');

const farmer = async (req, res, next) => {
  try { return ok(res, await dashboardService.farmerDashboard(req.user.id)); } catch (e) { next(e); }
};
const buyer = async (req, res, next) => {
  try { return ok(res, await dashboardService.buyerDashboard(req.user.id)); } catch (e) { next(e); }
};

module.exports = { farmer, buyer };

