require('dotenv').config();

const required = (key) => {
  const value = process.env[key];
  if (!value) throw new Error('Missing required environment variable: ' + key);
  return value;
};

module.exports = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  supabaseUrl: required('SUPABASE_URL'),
  supabaseAnonKey: required('SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  speechApiKey: process.env.SPEECH_API_KEY || null,
  llmApiKey: process.env.LLM_API_KEY || null,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

