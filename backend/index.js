// Main entry point for Vercel backend deployment
// This satisfies Vercel's entrypoint requirement and routes to API functions

const { setCorsHeaders, handleCorsPreflight, successResponse, errorResponse } = require('./api/_utils');

module.exports = async (req, res) => {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle preflight requests
  if (handleCorsPreflight(req, res)) {
    return;
  }

  // Health check endpoint
  if (req.url === '/api/health' || req.url === '/health') {
    return successResponse(res, {
      message: 'Personal Assistant Backend is running',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      port: 'vercel',
      corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    }, 'Health check successful');
  }

  // Root endpoint
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

  // For all other routes, return 404
  return errorResponse(res, 404, 'Endpoint not found', { path: req.url });
};
