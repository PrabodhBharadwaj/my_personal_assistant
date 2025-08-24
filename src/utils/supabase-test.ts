import { supabaseManager } from '../config/supabase';

/**
 * Test Supabase connection and provide detailed status
 */
export async function testSupabaseConnection(): Promise<void> {
  console.log('🔍 Testing Supabase connection...');

  const status = supabaseManager.getStatus();
  console.log('📊 Configuration Status:', status);

  if (!status.configured) {
    console.error(
      '❌ Supabase not configured. Please check your environment variables.'
    );
    console.log('Required variables:');
    console.log('- VITE_SUPABASE_URL');
    console.log('- VITE_SUPABASE_ANON_KEY');
    return;
  }

  console.log('✅ Configuration found, testing connection...');

  try {
    const connectionTest = await supabaseManager.testConnection();

    if (connectionTest.success) {
      console.log('✅ Supabase connection successful!');

      // Test database structure
      const dbTest = await supabaseManager.initializeDatabase();
      if (dbTest.success) {
        console.log('✅ Database structure verified');
      } else {
        console.warn('⚠️ Database structure issue:', dbTest.error);
      }

      // Run comprehensive health check
      const health = await supabaseManager.getHealthCheck();
      console.log('🏥 Health Check Results:', health);
    } else {
      console.error('❌ Supabase connection failed:', connectionTest.error);
    }
  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

/**
 * Get a human-readable status summary
 */
export function getSupabaseStatusSummary(): string {
  const status = supabaseManager.getStatus();

  if (!status.configured) {
    return '❌ Supabase not configured';
  }

  if (!status.connected) {
    return `⚠️ Configured but not connected: ${status.error || 'Unknown error'}`;
  }

  return '✅ Supabase connected and ready';
}

/**
 * Check if Supabase is ready for use
 */
export function isSupabaseReady(): boolean {
  return supabaseManager.isAvailable();
}

/**
 * Get detailed connection information for debugging
 */
export function getConnectionInfo(): {
  configured: boolean;
  connected: boolean;
  url: string;
  hasKey: boolean;
  error: string | null;
} {
  const status = supabaseManager.getStatus();

  return {
    configured: status.configured,
    connected: status.connected,
    url: status.config.url,
    hasKey: !!status.config.anonKey,
    error: status.error,
  };
}
