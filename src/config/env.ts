// Environment configuration
// This file loads environment variables and provides them to the application

export const config = {
  // API configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  apiKey: import.meta.env.VITE_API_KEY || '',
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',

  // Supabase configuration
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',

  // App configuration
  appName: import.meta.env.VITE_APP_NAME || 'My Personal Assistant',
  environment: import.meta.env.MODE || 'development',

  // Feature flags
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  enableAI: !!import.meta.env.VITE_OPENAI_API_KEY,
  enableSupabase: !!(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  ),
};

// Log configuration in development mode
if (import.meta.env.DEV) {
  console.log('Environment Configuration:', config);

  // Test Supabase connection if enabled
  if (config.enableSupabase) {
    import('../utils/supabase-test').then(({ testSupabaseConnection }) => {
      console.log('🧪 Testing Supabase connection...');
      testSupabaseConnection();
    });
  }
}
