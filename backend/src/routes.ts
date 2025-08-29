import { Router, Request, Response } from 'express';
import { OpenAIService } from './openai-service';
import { PlanningRequest } from './types';
import { 
  validatePlanningRequest, 
  handleValidationErrors,
  rateLimiter 
} from './middleware';

const router = Router();
const openaiService = new OpenAIService();

import { env } from './config/environment';

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Personal Assistant Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: env.NODE_ENV,
    port: env.PORT,
    corsOrigin: env.CORS_ORIGIN,
  });
});

// Configuration test endpoint (development only)
router.get('/config', (req: Request, res: Response) => {
  if (env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Configuration endpoint not available in production',
    });
  }

  res.json({
    success: true,
    message: 'Configuration loaded successfully',
    config: {
      environment: env.NODE_ENV,
      port: env.PORT,
      corsOrigin: env.CORS_ORIGIN,
      rateLimit: {
        windowMs: env.RATE_LIMIT_WINDOW_MS,
        maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
      },
      openai: {
        apiKeyConfigured: !!env.OPENAI_API_KEY,
        apiKeyPrefix: env.OPENAI_API_KEY.substring(0, 7) + '...',
      },
    },
  });
});

// Daily planning endpoint with rate limiting and validation
router.post(
  '/openai/plan',
  rateLimiter,
  validatePlanningRequest,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const planningRequest: PlanningRequest = req.body;
      
      console.log('Planning request received:', {
        taskCount: planningRequest.incompleteTasks.length,
        currentTime: planningRequest.currentTime,
        hasCustomPrompt: !!planningRequest.customSystemPrompt,
      });

      const result = await openaiService.generateDailyPlan(planningRequest);
      
      if (result.success) {
        console.log('Plan generated successfully, tokens used:', result.usage?.total_tokens);
        res.json(result);
      } else {
        console.error('Failed to generate plan:', result.error);
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Unexpected error in planning endpoint:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

export default router;
