const { supabaseAdmin } = require('../config/supabase');

const getFarmerByUser = async (userId) =>
  (await supabaseAdmin.from('farmers').select('*').eq('user_id', userId).single()).data;

const getBuyerByUser = async (userId) =>
  (await supabaseAdmin.from('buyers').select('*').eq('user_id', userId).single()).data;

module.exports = { getFarmerByUser, getBuyerByUser };

