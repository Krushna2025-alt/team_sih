const { ok, created } = require('../utils/response');
const orderService = require('../services/orderService');

async function create(req, res, next) {
  try { return created(res, await orderService.createOrder(req.user.id, req.body)); }
  catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    const { data, pagination } = await orderService.listOrders(req.user, req.validatedQuery || {});
    return ok(res, data, 200, pagination);
  } catch (err) { next(err); }
}

async function updateStatus(req, res, next) {
  try { return ok(res, await orderService.updateStatus(req.params.id, req.user, req.body.status)); }
  catch (err) { next(err); }
}

module.exports = { create, list, updateStatus };

