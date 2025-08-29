// Main API handler for Vercel API routes
// Serves as a fallback for unmatched /api/* routes

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Root API endpoint info
    if (req.url === '/' || req.url === '/api' || req.url === '/api/') {
      return res.status(200).json({
        success: true,
        message: 'API information',
        data: {
          message: 'Personal Assistant Backend API',
          version: '1.0.0',
          endpoints: {
            health: '/api/health',
            planning: '/api/openai/plan',
          },
          timestamp: new Date().toISOString(),
        }
      });
    }

    // 404 handler for unmatched API routes
    return res.status(404).json({
      success: false,
      error: 'API endpoint not found',
      details: { 
        path: req.url,
        availableEndpoints: ['/api/health', '/api/openai/plan']
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}