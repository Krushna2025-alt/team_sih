// Defaults: page=1 limit=20, hard max 100. No huge uncontrolled queries.
const parsePagination = (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  return { page, limit, offset: (page - 1) * limit };
};

const paginationMeta = (total, page, limit) => ({ page, limit, total });

module.exports = { parsePagination, paginationMeta };

