// Debug utility to check environment variables
// This will help us understand what's happening with the API configuration

export function debugEnvironmentVariables() {
  console.log('🔍 Environment Variables Debug:');
  console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
  console.log('MODE:', import.meta.env.MODE);
  console.log('DEV:', import.meta.env.DEV);
  console.log('PROD:', import.meta.env.PROD);
  
  // Test API_BASE resolution
  const API_BASE = import.meta.env.VITE_BACKEND_URL || '';
  console.log('API_BASE resolved to:', API_BASE || '(relative URLs - same domain)');
  
  // Test if we can make a simple fetch
  console.log('🧪 Testing API_BASE URL...');
  fetch(`${API_BASE}/api/health`)
    .then(response => {
      console.log('✅ API_BASE is working:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('📊 Backend response:', data);
    })
    .catch(error => {
      console.error('❌ API_BASE failed:', error);
    });
}

// Auto-run in development
if (import.meta.env.DEV) {
  debugEnvironmentVariables();
}