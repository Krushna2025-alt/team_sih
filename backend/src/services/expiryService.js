const { supabaseAdmin } = require('../config/supabase');
const logger = require('../config/logger');

// Simple maintenance via DB function + interval. Queries ALSO check expiry at read time,
// so core functionality never depends on this worker.
async function runExpiryChecks() {
  const { error } = await supabaseAdmin.rpc('fn_expire_entities');
  if (error) logger.error({ msg: error.message }, 'expiry job failed');
  else logger.debug('expiry job completed');
}

function startExpiryScheduler() {
  runExpiryChecks();
  const timer = setInterval(runExpiryChecks, 60 * 60 * 1000); // hourly
  timer.unref();
}

module.exports = { runExpiryChecks, startExpiryScheduler };

