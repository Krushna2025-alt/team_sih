// Success: { success:true, data } | Lists add pagination | Errors: { success:false, message, errors }
const ok = (res, data, status = 200, pagination = null) => {
  const body = { success: true, data };
  if (pagination) body.pagination = pagination;
  return res.status(status).json(body);
};

const created = (res, data) => ok(res, data, 201);

const fail = (res, message, status = 400, errors = {}) =>
  res.status(status).json({ success: false, message, errors });

module.exports = { ok, created, fail };

