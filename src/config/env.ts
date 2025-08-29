// Environment configuration
// This file loads environment variables and provides them to the application

export const config = {
  // Backend API configuration
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
  
  // Supabase configuration
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',

  // App configuration
  appName: import.meta.env.VITE_APP_NAME || 'My Personal Assistant',
  environment: import.meta.env.MODE || 'development',

  // Feature flags
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  enableAI: true, // Always enabled since backend handles OpenAI
  enableSupabase: !!(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  ),
};

// Log configuration in development mode
if (import.meta.env.DEV) {
  console.log('Environment Configuration:', config);
  console.log('🌐 Backend URL:', config.backendUrl);
  console.log('🔧 Environment:', config.environment);

  // Test backend connection if available
  if (config.backendUrl && config.backendUrl !== 'http://localhost:3001') {
    console.log('🧪 Testing backend connection...');
    import('../utils/api').then(({ checkBackendHealth }) => {
      checkBackendHealth()
        .then(() => console.log('✅ Backend connection successful'))
        .catch(() => console.log('⚠️ Backend connection failed - check URL'));
    });
  }

  // Test Supabase connection if enabled
  if (config.enableSupabase) {
    import('../utils/supabase-test').then(({ testSupabaseConnection }) => {
      console.log('🧪 Testing Supabase connection...');
      testSupabaseConnection();
    });
  }
}
