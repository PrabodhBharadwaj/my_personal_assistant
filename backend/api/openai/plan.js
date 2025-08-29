// Vercel API route for OpenAI planning
// This handles the /api/openai/plan endpoint

const OpenAI = require('openai');
const { setCorsHeaders, handleCorsPreflight, errorResponse, successResponse, validateRequiredFields, checkRateLimit } = require('../_utils');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false,
});

// Validate OpenAI API key
if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.startsWith('sk-')) {
  console.error('❌ Invalid or missing OPENAI_API_KEY');
  process.exit(1);
}

module.exports = async (req, res) => {
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
    // Check rate limiting
    const clientIP = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return errorResponse(res, 429, 'Too many requests. Please try again later.');
    }

    const { incompleteTasks, currentDate, currentTime, userContext, customSystemPrompt } = req.body;

    // Validate required fields
    const missingFields = validateRequiredFields(req.body, ['incompleteTasks', 'currentDate', 'currentTime']);
    if (missingFields.length > 0) {
      return errorResponse(res, 400, 'Missing required fields', { missingFields });
    }

    if (!Array.isArray(incompleteTasks)) {
      return errorResponse(res, 400, 'incompleteTasks must be an array');
    }

    // Build system prompt
    let systemPrompt = `You are a helpful personal productivity assistant. Create a daily plan based on the user's incomplete tasks and current context.

Current Date: ${currentDate}
Current Time: ${currentTime}

${userContext ? `User Context: ${userContext}\n` : ''}

Please create a structured daily plan that:
1. Prioritizes the most important tasks
2. Groups related tasks together
3. Suggests optimal time slots
4. Provides motivation and context
5. Is realistic and achievable

Format the response as a clear, actionable plan.`;

    if (customSystemPrompt) {
      systemPrompt = customSystemPrompt;
    }

    // Create user message
    const userMessage = `Here are my incomplete tasks: ${incompleteTasks.join(', ')}. Please help me plan my day.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const plan = completion.choices[0]?.message?.content;

    if (!plan) {
      throw new Error('No plan generated from OpenAI');
    }

    // Return success response
    return successResponse(res, {
      plan,
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens || 0,
        completion_tokens: completion.usage?.completion_tokens || 0,
        total_tokens: completion.usage?.total_tokens || 0,
      },
    }, 'Plan generated successfully');

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    return errorResponse(res, 500, 
      process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message
    );
  }
};
