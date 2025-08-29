// Main entry point for Vercel backend deployment
// This file serves as the root handler for all requests

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Health check endpoint
  if (req.url === '/api/health' || req.url === '/health') {
    return res.json({
      success: true,
      message: 'Personal Assistant Backend is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      port: 'vercel',
      corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    });
  }

  // Root endpoint
  if (req.url === '/' || req.url === '/api') {
    return res.json({
      message: 'Personal Assistant Backend API',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        planning: '/api/openai/plan',
      },
    });
  }

  // 404 handler for unmatched routes
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.url,
  });
};
