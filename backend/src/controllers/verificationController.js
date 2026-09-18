const { supabaseAdmin } = require('../config/supabase');
const { ok, badRequest, notFound } = require('../utils/response');
const aiQualityService = require('../services/aiQualityService');
const marketPriceService = require('../services/marketPriceService');
const logger = require('../utils/logger');

async function createVerification(req, res, next) {
    try {
        const {
            farmerId,
            productId,
            productName,
            variety,
            quantityKg,
            location,
            expectedPrice,
            evidence // array of { type, url, value, unit }
        } = req.body;

        if (!farmerId || !productName || !quantityKg || !location) {
            return badRequest(res, 'Missing required fields.');
        }

        const images = evidence?.filter(e => e.type === 'image').map(e => e.url) || [];
        const video = evidence?.find(e => e.type === 'video')?.url;
        
        // 1. AI Analysis
        const aiResult = await aiQualityService.analyzeVisualQuality(images, video, productName, variety);

        // 2. Pricing Intelligence
        const pricing = await marketPriceService.getFairPriceEstimate(productName, variety, location, aiResult.visualGrade);

        // 3. Determine Level and Trust Score
        let level = 1; // Visual
        let baseTrust = aiResult.confidenceScore * 0.5; // Up to 50 pts from visual
        
        const hasMeasurement = evidence?.some(e => e.type === 'measurement');
        const hasLabReport = evidence?.some(e => e.type === 'lab_report');

        if (hasMeasurement) {
            level = 2;
            baseTrust += 20;
        }
        if (hasLabReport) {
            level = 3;
            baseTrust += 30; // Up to 100
        }

        const trustScore = Math.min(100, Math.round(baseTrust));

        // 4. Save to DB
        const { data: verifData, error: verifError } = await supabaseAdmin.from('quality_verifications').insert({
            farmer_id: farmerId,
            product_id: productId || null,
            product_name: productName,
            variety,
            quantity_kg: quantityKg,
            location,
            status: 'completed',
            visual_grade: aiResult.visualGrade,
            visual_score: aiResult.visualScore,
            issues: aiResult.issues,
            confidence_score: aiResult.confidenceScore,
            level,
            trust_score: trustScore,
            expected_price: expectedPrice,
            suggested_price_min: pricing.suggestedPriceMin,
            suggested_price_max: pricing.suggestedPriceMax,
            market_price_min: pricing.marketPriceMin,
            market_price_max: pricing.marketPriceMax,
            market_price_source: pricing.marketPriceSource
        }).select().single();

        if (verifError) throw verifError;

        // Save evidence
        if (evidence && evidence.length > 0) {
            const evRows = evidence.map(e => ({
                verification_id: verifData.id,
                type: e.type,
                url: e.url,
                value: e.value,
                unit: e.unit
            }));
            const { error: evError } = await supabaseAdmin.from('verification_evidence').insert(evRows);
            if (evError) logger.error(`Failed to insert evidence: ${evError.message}`);
        }

        // If a product ID was passed, link it to the listing
        if (productId) {
            await supabaseAdmin.from('listings').update({ verification_id: verifData.id }).eq('id', productId);
        }

        return ok(res, { ...verifData, ai_summary: aiResult.summary });
    } catch (err) {
        next(err);
    }
}

async function getVerification(req, res, next) {
    try {
        const { id } = req.params;
        const { data, error } = await supabaseAdmin
            .from('quality_verifications')
            .select(`
                *,
                verification_evidence (*)
            `)
            .eq('id', id)
            .single();

        if (error || !data) {
            return notFound(res, 'Verification not found');
        }

        return ok(res, data);
    } catch (err) {
        next(err);
    }
}

module.exports = { createVerification, getVerification };
