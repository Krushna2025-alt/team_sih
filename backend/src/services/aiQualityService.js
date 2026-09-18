// Mocked AI Quality Service for prototype
const logger = require('../config/logger');

/**
 * Simulates analyzing product images and video using a Vision AI model.
 * @param {string[]} images - Array of image URLs
 * @param {string} video - Video URL
 * @param {string} productType - e.g., 'Wheat', 'Rice'
 * @param {string} variety - e.g., 'Basmati'
 * @returns {Promise<Object>} The mocked analysis result
 */
exports.analyzeVisualQuality = async (images, video, productType, variety) => {
    logger.info(`Analyzing visual quality for ${productType} (${variety}) with ${images?.length || 0} images.`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock logic based on product type
    const product = (productType || '').toLowerCase();
    
    let grade = 'B';
    let score = 75;
    let issues = ['Some impurities visible'];
    let confidence = 85;

    if (product.includes('rice') || product.includes('basmati')) {
        const rnd = Math.random();
        if (rnd > 0.6) {
            grade = 'A';
            score = 92;
            issues = ['Minor broken grains (<2%)'];
            confidence = 94;
        } else if (rnd > 0.2) {
            grade = 'B';
            score = 78;
            issues = ['Visible chalky grains', 'Slight color variation'];
            confidence = 88;
        } else {
            grade = 'C';
            score = 55;
            issues = ['High percentage of broken grains', 'Discolored grains detected'];
            confidence = 90;
        }
    } else if (product.includes('wheat')) {
        const rnd = Math.random();
        if (rnd > 0.6) {
            grade = 'A';
            score = 90;
            issues = ['Uniform size', 'Clean appearance'];
            confidence = 92;
        } else if (rnd > 0.2) {
            grade = 'B';
            score = 74;
            issues = ['Some shriveled grains detected', 'Minor dust/impurities'];
            confidence = 85;
        } else {
            grade = 'C';
            score = 58;
            issues = ['Evidence of pest damage on some grains', 'High impurities'];
            confidence = 89;
        }
    } else {
        // Generic fallback
        score = Math.floor(Math.random() * (95 - 60 + 1)) + 60;
        if (score >= 85) grade = 'A';
        else if (score >= 70) grade = 'B';
        else grade = 'C';
        
        issues = score >= 85 ? ['Good uniformity'] : ['Mixed sizes', 'Some foreign matter'];
        confidence = 80;
    }

    return {
        visualGrade: grade,
        visualScore: score,
        issues: issues,
        confidenceScore: confidence,
        summary: `AI Visual analysis complete. Based on submitted evidence, the product is graded as ${grade} with a score of ${score}/100. Note: This is a visual estimation and does not replace lab testing.`
    };
};
