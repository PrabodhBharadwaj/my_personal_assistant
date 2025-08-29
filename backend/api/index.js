// Main API handler for Vercel API routes
// This serves as a fallback for unmatched /api/* routes

const { setCorsHeaders, handleCorsPreflight, successResponse, errorResponse } = require('./_utils');

module.exports = async (req, res) => {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle preflight requests
  if (handleCorsPreflight(req, res)) {
    return;
  }

  // Root API endpoint
  if (req.url === '/' || req.url === '/api') {
    return successResponse(res, {
      message: 'Personal Assistant Backend API',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        planning: '/api/openai/plan',
      },
    }, 'API information');
  }

  // 404 handler for unmatched API routes
  return errorResponse(res, 404, 'API endpoint not found', { 
    path: req.url,
    availableEndpoints: ['/api/health', '/api/openai/plan']
  });
};
