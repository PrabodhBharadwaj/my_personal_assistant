// Health check endpoint for Vercel API
// This handles /api/health requests

const { setCorsHeaders, handleCorsPreflight, successResponse } = require('./_utils');

module.exports = async (req, res) => {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle preflight requests
  if (handleCorsPreflight(req, res)) {
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET.',
    });
  }

  // Return health check response
  return successResponse(res, {
    message: 'Personal Assistant Backend is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: 'vercel',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    timestamp: new Date().toISOString(),
  }, 'Health check successful');
};
