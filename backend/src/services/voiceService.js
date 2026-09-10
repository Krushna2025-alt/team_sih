const { supabaseAdmin } = require('../config/supabase');
const env = require('../config/env');
const logger = require('../config/logger');
const AppError = require('../utils/appError');

// Provider-agnostic. BHASHINI / Google / Azure plug in here - never in controllers.
const PRODUCT_ALIASES = {
  onion: ['onion', 'kanda', 'pyaaz', 'KANDA', 'PYAAJ'],
  potato: ['potato', 'aloo', 'aalu', 'batata', 'AALOO', 'BATAATA'],
  tomato: ['tomato', 'tamatar', 'TAMAATAR'],
  wheat: ['wheat', 'gehun', 'gahu', 'GEHOON', 'GAHOO'],
  rice: ['rice', 'chawal', 'bhaat', 'CHAAWAL', 'BHAAT'],
};
// NOTE: For real Devanagari matching, keep the actual script characters.
const PRODUCT_ALIASES_DEVANAGARI = {
  onion: '\u0915\u093e\u0902\u0926\u093e|\u092a\u094d\u092f\u093e\u091c',
  potato: '\u0906\u0932\u0942|\u092c\u091f\u093e\u091f\u093e',
  tomato: '\u091f\u092e\u093e\u091f\u0930',
  wheat: '\u0917\u0947\u0939\u0942\u0902|\u0917\u0939\u0942',
  rice: '\u091a\u093e\u0935\u0932|\u092d\u093e\u0924',
};

const detectLanguage = (text) => {
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // hi/mr share script; refine as needed
  return 'en';
};

const extractQuantity = (text) => {
  const m = text.match(/(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilo|kilos|kilograms?)/i);
  if (m) return parseFloat(m[1]);
  const n = text.match(/(?:^|\s)(\d{2,4})(?:\s|$)/);
  return n ? parseFloat(n[1]) : null;
};

const extractPrice = (text) => {
  const m = text.match(/(?:Rs\.?|INR|rupees?)\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:Rs\.?|INR|rupees?)/i);
  return m ? parseFloat(m[1] || m[2]) : null;
};

const extractDate = (text) => {
  const iso = text.match(/(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const d = new Date();
  if (/tomorrow/i.test(text)) d.setDate(d.getDate() + 1);
  else if (!/today/i.test(text)) return null;
  return d.toISOString().slice(0, 10);
};

async function speechToText(_audioBase64, _language) {
  if (!env.speechApiKey) throw new AppError('Voice processing is temporarily unavailable.', 503);
  try {
    // Plug BHASHINI / Google Speech / Azure Speech here using env.speechApiKey.
    throw new Error('speech provider not configured');
  } catch (e) {
    logger.warn({ msg: e.message }, 'speech provider failed');
    throw new AppError('Voice processing is temporarily unavailable.', 503);
  }
}

// Optional LLM enhancement. If it fails, rule-based extraction still runs. AI is never mandatory.
async function llmExtract(transcript, productNames) {
  if (!env.llmApiKey) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.llmApiKey },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Extract a produce listing from farmer speech. Return JSON: {"product": one of [' + productNames.join(', ') + '] or null, "quantity_kg": number or null, "price_per_kg": number or null, "location": string or null, "availability_date": "YYYY-MM-DD" or null}. No extra keys.' },
          { role: 'user', content: transcript },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return JSON.parse((await res.json()).choices[0].message.content);
  } catch (e) {
    logger.warn({ msg: e.message }, 'LLM extraction failed - falling back to rules');
    return null;
  }
}

async function extractListing({ transcript, audio_base64, language }) {
  let text = (transcript || '').trim();
  if (!text && audio_base64) text = (await speechToText(audio_base64, language)).trim();
  if (!text) throw new AppError('Provide a transcript or audio.', 400);

  const lang = language || detectLanguage(text);
  const { data: products } = await supabaseAdmin.from('products').select('id, name, unit');
  const lower = text.toLowerCase();

  let product = null;
  for (const p of products || []) {
    const aliases = PRODUCT_ALIASES[p.name] || [p.name.toLowerCase()];
    const deva = PRODUCT_ALIASES_DEVANAGARI[p.name];
    const hit = aliases.some((a) => lower.includes(a)) || (deva && new RegExp(deva).test(text));
    if (hit) { product = p; break; }
  }

  const llm = await llmExtract(text, (products || []).map((p) => p.name));
  if (!product && llm?.product) product = (products || []).find((p) => p.name === String(llm.product).toLowerCase()) || null;

  const draft = {
    product_id: product?.id ?? null,
    product_name: product?.name ?? llm?.product ?? null,
    quantity_kg: extractQuantity(text) ?? llm?.quantity_kg ?? null,
    unit: 'kg',
    price_per_kg: extractPrice(text) ?? llm?.price_per_kg ?? null,
    location: llm?.location ?? null,
    availability_date: extractDate(text) ?? llm?.availability_date ?? null,
  };

  const missing_fields = ['product_id', 'quantity_kg', 'price_per_kg', 'availability_date'].filter((k) => draft[k] == null);

  // NEVER publish automatically. Farmer confirms, then frontend calls POST /listings.
  return { draft, missing_fields, language_detected: lang, transcript: text, requires_confirmation: true };
}

module.exports = { extractListing };

