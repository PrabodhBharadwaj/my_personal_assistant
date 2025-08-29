// Shared utilities for Vercel API functions
// Note: Since we're using ES6 modules, imports must use import syntax

// CORS configuration
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};

// Set CORS headers on response
export function setCorsHeaders(res) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
}

// Handle CORS preflight requests
export function handleCorsPreflight(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true; // Indicates preflight was handled
  }
  return false; // Indicates preflight was not handled
}

// Standard error response
export function errorResponse(res, statusCode, message, details = null) {
  const response = {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  };
  
  if (details) {
    response.details = details;
  }
  
  res.status(statusCode).json(response);
}

// Success response wrapper
export function successResponse(res, data, message = 'Success') {
  res.json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
}

// Validate required fields in request body
export function validateRequiredFields(body, requiredFields) {
  const missing = [];
  
  requiredFields.forEach(field => {
    if (!body[field] || (Array.isArray(body[field]) && body[field].length === 0)) {
      missing.push(field);
    }
  });
  
  return missing;
}

// Rate limiting helper (simple in-memory)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

export function checkRateLimit(ip) {
  const now = Date.now();
  const userRequests = requestCounts.get(ip) || [];
  
  // Remove old requests outside the window
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT_MAX) {
    return false; // Rate limited
  }
  
  // Add current request
  recentRequests.push(now);
  requestCounts.set(ip, recentRequests);
  
  return true; // Not rate limited
}

// Get client IP address
export function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         'unknown';
}