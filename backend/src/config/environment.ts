import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.server file
const envPath = path.resolve(process.cwd(), '.env.server');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Failed to load .env.server file:', result.error.message);
  console.error('📁 Expected path:', envPath);
  console.error('💡 Make sure .env.server exists in the backend directory');
  process.exit(1);
}

// Environment variable interface
interface EnvironmentConfig {
  // Server Configuration
  NODE_ENV: string;
  PORT: number;
  
  // OpenAI Configuration
  OPENAI_API_KEY: string;
  
  // Security Configuration
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
}

// Validation function
function validateEnvironment(): EnvironmentConfig {
  const requiredVars = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
  };

  const missingVars: string[] = [];
  
  // Check for missing required variables
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value) {
      missingVars.push(key);
    }
  });

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('💡 Please check your .env.server file');
    process.exit(1);
  }

  // Validate and parse numeric values
  const port = parseInt(process.env.PORT!);
  if (isNaN(port) || port < 1 || port > 65535) {
    console.error('❌ Invalid PORT value:', process.env.PORT);
    console.error('💡 PORT must be a number between 1 and 65535');
    process.exit(1);
  }

  const rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW_MS!);
  if (isNaN(rateLimitWindow) || rateLimitWindow < 1000) {
    console.error('❌ Invalid RATE_LIMIT_WINDOW_MS value:', process.env.RATE_LIMIT_WINDOW_MS);
    console.error('💡 RATE_LIMIT_WINDOW_MS must be a number >= 1000 (1 second)');
    process.exit(1);
  }

  const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS!);
  if (isNaN(rateLimitMax) || rateLimitMax < 1) {
    console.error('❌ Invalid RATE_LIMIT_MAX_REQUESTS value:', process.env.RATE_LIMIT_MAX_REQUESTS);
    console.error('💡 RATE_LIMIT_MAX_REQUESTS must be a number >= 1');
    process.exit(1);
  }

  // Validate OpenAI API key format
  if (!process.env.OPENAI_API_KEY!.startsWith('sk-')) {
    console.error('❌ Invalid OPENAI_API_KEY format');
    console.error('💡 OpenAI API keys should start with "sk-"');
    process.exit(1);
  }

  console.log('✅ Environment variables loaded successfully');
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🚀 Port: ${port}`);
  console.log(`🔒 CORS Origin: ${process.env.CORS_ORIGIN}`);
  console.log(`⏱️  Rate Limit: ${rateLimitMax} requests per ${rateLimitWindow / 1000}s`);

  return {
    NODE_ENV: process.env.NODE_ENV!,
    PORT: port,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    CORS_ORIGIN: process.env.CORS_ORIGIN!,
    RATE_LIMIT_WINDOW_MS: rateLimitWindow,
    RATE_LIMIT_MAX_REQUESTS: rateLimitMax,
  };
}

// Export validated environment configuration
export const env = validateEnvironment();

// Export individual variables for convenience
export const {
  NODE_ENV,
  PORT,
  OPENAI_API_KEY,
  CORS_ORIGIN,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
} = env;

// Export validation function for testing
export { validateEnvironment };
