// Health check endpoint for Vercel API
// Handles /api/health requests

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

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET.',
    });
  }

  try {
    // Return health check response
    return res.status(200).json({
      success: true,
      message: 'Health check successful',
      data: {
        message: 'Personal Assistant Backend is running',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        platform: 'vercel',
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}