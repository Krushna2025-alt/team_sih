// Rejects invalid data BEFORE business logic. 422 with field-level errors.
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const errors = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || source;
      (errors[key] = errors[key] || []).push(issue.message);
    }
    return res.status(422).json({ success: false, message: 'Validation failed.', errors });
  }
  if (source === 'body') req.body = result.data;
  else req.validatedQuery = result.data; // req.query is read-only in newer Express
  return next();
};

module.exports = { validate };

