import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration interface
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export interface DatabaseItem {
  id: string;
  content: string;
  content_type: string;
  item_type: string;
  category: string;
  priority: string;
  energy_level: string;
  mood_context: string;
  status: string;
  is_actionable: boolean;
  metadata: Record<string, unknown>;
  attachments: string[];
  due_date: string | null;
  estimated_duration: number | null;
  context_tags: string[];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  ai_generated: boolean;
  ai_confidence: number | null;
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  template_type: string;
  template_data: Record<string, unknown>;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface Context {
  id: string;
  name: string;
  description: string | null;
  context_type: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DailyPlan {
  id: string;
  plan_date: string;
  plan_content: Record<string, unknown>;
  focus_areas: string[];
  energy_budget: string;
  generated_at: string;
  modified_at: string | null;
  completion_status: Record<string, unknown>;
}

// Supabase client class with lazy initialization
export class SupabaseManager {
  private client: SupabaseClient | null = null;
  private config: SupabaseConfig | null = null;
  private isConnected: boolean = false;
  private connectionError: string | null = null;
  private isInitialized: boolean = false;

  constructor() {
    // Don't initialize immediately - wait for explicit initialization
  }

  /**
   * Initialize Supabase client when needed
   */
  initialize(): boolean {
    if (this.isInitialized) {
      return this.config?.isConfigured || false;
    }

    this.config = this.loadConfig();
    this.isInitialized = true;

    if (this.config.isConfigured) {
      this.initializeClient();
      return true;
    }

    return false;
  }

  /**
   * Load Supabase configuration from environment variables
   */
  private loadConfig(): SupabaseConfig {
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    const isConfigured = !!(url && anonKey);

    if (!isConfigured) {
      console.warn(
        'Supabase configuration not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file'
      );
    }

    return {
      url,
      anonKey,
      isConfigured,
    };
  }

  /**
   * Initialize the Supabase client
   */
  private initializeClient(): void {
    try {
      if (!this.config?.isConfigured) {
        throw new Error('Supabase not configured');
      }

      this.client = createClient(this.config.url, this.config.anonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });

      console.log('Supabase client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      this.connectionError =
        error instanceof Error ? error.message : 'Unknown error';
    }
  }

  /**
   * Get the Supabase client instance (lazy initialization)
   */
  getClient(): SupabaseClient | null {
    if (!this.isInitialized) {
      this.initialize();
    }
    return this.client;
  }

  /**
   * Check if Supabase is configured and connected
   */
  isAvailable(): boolean {
    if (!this.isInitialized) {
      this.initialize();
    }
    return this.config?.isConfigured || false;
  }

  /**
   * Test connection to Supabase
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized) {
      this.initialize();
    }

    if (!this.client) {
      return {
        success: false,
        error: 'Supabase client not initialized',
      };
    }

    try {
      // Test basic connectivity with a simple query
      const { error } = await this.client
        .from('items')
        .select('count')
        .limit(1);

      if (error) {
        // If table doesn't exist, that's okay - we just want to test connectivity
        if (error.code === '42P01') {
          // Table doesn't exist
          return { success: true };
        }
        throw error;
      }

      this.isConnected = true;
      this.connectionError = null;
      return { success: true };
    } catch (error) {
      this.isConnected = false;
      this.connectionError =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: this.connectionError,
      };
    }
  }

  /**
   * Get connection status and error information
   */
  getStatus(): {
    configured: boolean;
    connected: boolean;
    error: string | null;
    config: SupabaseConfig | null;
  } {
    if (!this.isInitialized) {
      this.initialize();
    }

    return {
      configured: this.config?.isConfigured || false,
      connected: this.isConnected,
      error: this.connectionError,
      config: this.config,
    };
  }

  /**
   * Initialize database tables if they don't exist
   */
  async initializeDatabase(): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized) {
      this.initialize();
    }

    if (!this.client) {
      return {
        success: false,
        error: 'Supabase client not initialized',
      };
    }

    try {
      // Test if the comprehensive schema exists
      const { error } = await this.client
        .from('items')
        .select(
          'id, content, item_type, category, status, is_actionable, created_at, updated_at'
        )
        .limit(1);

      if (error && error.code === '42P01') {
        console.warn(
          'Comprehensive database schema not found. Please run the migration from SUPABASE_SETUP_GUIDE.md'
        );
        return {
          success: false,
          error: 'Database schema not found. Please run the migration.',
        };
      }

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get health check information
   */
  async getHealthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    database: boolean;
    auth: boolean;
    realtime: boolean;
    error?: string;
  }> {
    if (!this.isInitialized) {
      this.initialize();
    }

    if (!this.client) {
      return {
        status: 'unhealthy',
        database: false,
        auth: false,
        realtime: false,
        error: 'Client not initialized',
      };
    }

    try {
      // Test database connection
      const dbTest = await this.testConnection();

      // Test auth (basic check)
      const authTest = !!this.client.auth;

      // Test realtime (basic check)
      const realtimeTest = !!this.client.realtime;

      return {
        status:
          dbTest.success && authTest && realtimeTest ? 'healthy' : 'unhealthy',
        database: dbTest.success,
        auth: authTest,
        realtime: realtimeTest,
        error: dbTest.error,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: false,
        auth: false,
        realtime: false,
        error: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get schema information (placeholder for future implementation)
   */
  async getSchemaInfo(): Promise<{
    tables: string[];
    views: string[];
    functions: string[];
  }> {
    // This is a placeholder implementation
    // In a real implementation, you would query the database schema
    return {
      tables: [
        'items',
        'templates',
        'contexts',
        'item_contexts',
        'insights',
        'knowledge_entries',
        'daily_plans',
        'time_blocks',
        'mood_entries',
        'activities',
      ],
      views: [],
      functions: [],
    };
  }
}

// Create and export a singleton instance
export const supabaseManager = new SupabaseManager();

// Export a function to get the client (lazy initialization)
export const getSupabaseClient = () => supabaseManager.getClient();

// Export the client for backward compatibility (lazy initialization)
// This will be properly typed and initialized when needed
export const supabase = supabaseManager.getClient() as any;

// Export types for external use
export type { SupabaseClient };
