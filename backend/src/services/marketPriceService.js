// Mocked Market Price Service for prototype
const logger = require('../utils/logger');

/**
 * Simulates fetching market prices and calculating fair price suggestions.
 * @param {string} productType - e.g., 'Wheat', 'Rice'
 * @param {string} variety - e.g., 'Basmati'
 * @param {string} location - e.g., 'Maharashtra'
 * @param {string} qualityGrade - e.g., 'A', 'B', 'C'
 * @returns {Promise<Object>} The pricing data
 */
exports.getFairPriceEstimate = async (productType, variety, location, qualityGrade) => {
    logger.info(`Fetching market price for ${productType} (${variety}) in ${location} at grade ${qualityGrade}.`);
    
    // Base prices in INR per Kg
    let baseMin = 20;
    let baseMax = 25;
    
    const product = (productType || '').toLowerCase();
    const varLower = (variety || '').toLowerCase();

    if (product.includes('rice')) {
        if (varLower.includes('basmati')) {
            baseMin = 80;
            baseMax = 110;
        } else {
            baseMin = 30;
            baseMax = 45;
        }
    } else if (product.includes('wheat')) {
        if (varLower.includes('sharbati')) {
            baseMin = 35;
            baseMax = 45;
        } else {
            baseMin = 22;
            baseMax = 28;
        }
    }

    // Adjust based on quality grade
    let multiplier = 1.0;
    if (qualityGrade === 'A') multiplier = 1.15;
    else if (qualityGrade === 'B') multiplier = 1.0;
    else if (qualityGrade === 'C') multiplier = 0.85;

    // Simulate location variance (+/- 5%)
    const locVariance = (Math.random() * 0.1) - 0.05;

    const finalMin = Math.round(baseMin * multiplier * (1 + locVariance));
    const finalMax = Math.round(baseMax * multiplier * (1 + locVariance));

    return {
        marketPriceMin: finalMin,
        marketPriceMax: finalMax,
        marketPriceSource: 'e-NAM Data (Mocked Reference)',
        suggestedPriceMin: Math.max(1, finalMin - 2), // slightly lower for competitive
        suggestedPriceMax: finalMax + 2
    };
};
