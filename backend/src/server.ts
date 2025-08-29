// Import environment configuration FIRST - this validates all required variables
import './config/environment';

import express from 'express';
import cors from 'cors';
import routes from './routes';
import { 
  corsOptions, 
  securityMiddleware, 
  errorHandler,
  requestLogger 
} from './middleware';
import { PORT } from './config/environment';

const app = express();

// Security middleware
app.use(securityMiddleware);

// CORS
app.use(cors(corsOptions));

// Request parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging
app.use(requestLogger);

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Personal Assistant Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      planning: '/api/openai/plan',
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Personal Assistant Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Planning endpoint: http://localhost:${PORT}/api/openai/plan`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌍 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
