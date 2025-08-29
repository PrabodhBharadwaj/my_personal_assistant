// AI Planning endpoint for Vercel API
// Handles /api/openai/plan requests

import { 
  setCorsHeaders, 
  handleCorsPreflight, 
  successResponse, 
  errorResponse, 
  validateRequiredFields,
  checkRateLimit,
  getClientIP 
} from '../_utils.js';

export default async function handler(req, res) {
  // Set CORS headers
  setCorsHeaders(res);

  // Handle preflight requests
  if (handleCorsPreflight(req, res)) {
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed. Use POST.');
  }

  try {
    // Rate limiting
    const clientIP = getClientIP(req);
    if (!checkRateLimit(clientIP)) {
      return errorResponse(res, 429, 'Too many requests. Please try again later.');
    }

    // Validate request body
    const { incompleteTasks, currentDate, currentTime } = req.body;
    
    const missing = validateRequiredFields(req.body, ['incompleteTasks', 'currentDate', 'currentTime']);
    if (missing.length > 0) {
      return errorResponse(res, 400, 'Missing required fields', { missingFields: missing });
    }

    // Validate incompleteTasks is array
    if (!Array.isArray(incompleteTasks)) {
      return errorResponse(res, 400, 'incompleteTasks must be an array');
    }

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return errorResponse(res, 500, 'OpenAI API key not configured');
    }

    // Make OpenAI API call
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a personal assistant AI that helps create daily plans. 
            Current date: ${currentDate}
            Current time: ${currentTime}
            
            Create a structured daily plan based on incomplete tasks. 
            Respond with a JSON object containing:
            - plannedTasks: array of tasks with time slots
            - recommendations: array of productivity tips
            - estimatedDuration: total time estimate
            
            Keep responses practical and time-conscious.`
          },
          {
            role: 'user',
            content: `Please create a daily plan for these incomplete tasks: ${incompleteTasks.join(', ')}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      return errorResponse(res, 500, 'AI service unavailable', { 
        status: openaiResponse.status 
      });
    }

    const aiResult = await openaiResponse.json();
    
    // Extract AI response
    const planContent = aiResult.choices?.[0]?.message?.content;
    
    if (!planContent) {
      return errorResponse(res, 500, 'Invalid AI response format');
    }

    // Try to parse AI response as JSON, fallback to text
    let parsedPlan;
    try {
      parsedPlan = JSON.parse(planContent);
    } catch (parseError) {
      // If AI didn't return JSON, create structured response
      parsedPlan = {
        plannedTasks: incompleteTasks.map((task, index) => ({
          task,
          timeSlot: `${9 + index}:00 AM`,
          duration: '1 hour'
        })),
        recommendations: ['Break tasks into smaller chunks', 'Take breaks every hour'],
        estimatedDuration: `${incompleteTasks.length} hours`,
        rawResponse: planContent
      };
    }

    return successResponse(res, {
      plan: parsedPlan,
      inputTasks: incompleteTasks,
      generatedAt: new Date().toISOString()
    }, 'Daily plan generated successfully');

  } catch (error) {
    console.error('Planning endpoint error:', error);
    return errorResponse(res, 500, 'Failed to generate plan', {
      message: error.message
    });
  }
}