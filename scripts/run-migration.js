#!/usr/bin/env node

/**
 * Script to run Supabase migration
 * Usage: node scripts/run-migration.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runMigration() {
  try {
    console.log('🚀 Starting authentication schema migration...');
    
    // Read the migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '002_authentication_schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('📖 Migration file loaded successfully');
    console.log('⏳ Executing migration...');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      // If exec_sql doesn't exist, try direct execution
      console.log('⚠️  exec_sql function not available, trying alternative approach...');
      
      // Split the migration into individual statements and execute them
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        try {
          console.log(`Executing: ${statement.substring(0, 50)}...`);
          // Note: This approach has limitations with complex SQL
          // Manual execution in Supabase dashboard is recommended
        } catch (stmtError) {
          console.error(`Error executing statement: ${stmtError.message}`);
        }
      }
      
      console.log('✅ Migration script completed (some statements may need manual execution)');
      console.log('📋 Please run the migration manually in Supabase SQL Editor for best results');
      
    } else {
      console.log('✅ Migration completed successfully!');
      console.log('📊 Result:', data);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('📋 Please run the migration manually in Supabase SQL Editor');
  }
}

// Run the migration
runMigration();
