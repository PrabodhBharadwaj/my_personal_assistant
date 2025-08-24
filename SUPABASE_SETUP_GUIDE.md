# 🚀 Supabase Setup Guide - Manual Execution

Since the CLI installation had permission issues, here's your complete manual setup guide to execute in the Supabase dashboard.

## 📋 **Prerequisites**

1. **Supabase Account**: [supabase.com](https://supabase.com)
2. **New Project Created**: Named "personal-ai-assistant"
3. **Project URL & API Key**: From Settings → API

## 🎯 **Step-by-Step Execution**

### **Step 1: Access SQL Editor**

1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

### **Step 2: Enable Required Extensions**

**Run this first:**
```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
```

**Expected Result**: ✅ Extensions enabled successfully

### **Step 3: Execute Complete Schema**

**Copy and paste the entire schema from:**
`supabase/migrations/001_create_items_table.sql`

**Click "Run" (▶️ button)**

**Expected Result**: ✅ All tables, indexes, views, and functions created

### **Step 4: Verify Table Creation**

**Run this verification query:**
```sql
-- List all created tables
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected Tables:**
- ✅ items
- ✅ templates  
- ✅ contexts
- ✅ item_contexts
- ✅ insights
- ✅ knowledge_entries
- ✅ daily_plans
- ✅ time_blocks
- ✅ mood_entries
- ✅ activities

### **Step 5: Test Sample Data**

**Run the sample data function:**
```sql
-- Add sample data
SELECT add_sample_data();

-- Verify templates were added
SELECT * FROM templates LIMIT 3;

-- Verify contexts were added  
SELECT * FROM contexts LIMIT 3;
```

**Expected Result**: ✅ Sample data inserted successfully

### **Step 6: Test Basic Operations**

**Test insert:**
```sql
-- Insert a test item
INSERT INTO items (content, item_type, category, is_actionable) 
VALUES ('Test AI planning task', 'task', 'work', true);

-- Query the item
SELECT * FROM items WHERE item_type = 'task';
```

**Expected Result**: ✅ Item inserted and retrieved successfully

### **Step 7: Verify Indexes**

**Check performance indexes:**
```sql
-- List all indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Expected Result**: ✅ Multiple indexes created for performance

### **Step 8: Test Views**

**Test the created views:**
```sql
-- Test active_tasks view
SELECT * FROM active_tasks LIMIT 5;

-- Test recent_items_by_type view
SELECT * FROM recent_items_by_type;

-- Test knowledge_summary view
SELECT * FROM knowledge_summary;
```

**Expected Result**: ✅ Views return data correctly

## 🔧 **Environment Variables Setup**

After successful database setup, update your `.env` file:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Existing OpenAI configuration
VITE_OPENAI_API_KEY=sk-your-openai-key-here
```

## 🧪 **Test in Your App**

1. **Restart development server**: `npm run dev`
2. **Check browser console** for Supabase connection logs
3. **Look for**: "✅ Supabase connected and ready"
4. **Test database operations** in your app

## 🚨 **Troubleshooting Common Issues**

### **Extension Errors**
```sql
-- If pgvector extension fails
CREATE EXTENSION IF NOT EXISTS vector;

-- If uuid extension fails  
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### **Permission Errors**
```sql
-- Grant permissions if needed
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
```

### **Table Already Exists**
```sql
-- Drop and recreate if needed (BE CAREFUL!)
DROP TABLE IF EXISTS items CASCADE;
-- Then run your CREATE TABLE statement again
```

## 📊 **What You've Built**

Your database now supports:

- **Multi-modal Content**: Text, voice, images, links, files
- **AI-Powered Planning**: Daily plans, time blocks, energy management
- **Context Awareness**: Mood tracking, energy levels, contextual recommendations
- **Knowledge Management**: Semantic search, insights, pattern recognition
- **Advanced Analytics**: Activity tracking, completion rates, trends
- **Scalable Architecture**: Proper indexing, views, maintenance functions

## 🎉 **Success Indicators**

- ✅ All tables created without errors
- ✅ Sample data inserted successfully
- ✅ Indexes created for performance
- ✅ Views working correctly
- ✅ App connects to Supabase
- ✅ No console errors

## 🔮 **Next Steps**

1. **Test basic CRUD operations** in your app
2. **Implement data migration** from localStorage
3. **Add real-time subscriptions** for live updates
4. **Implement advanced features** like semantic search
5. **Add user authentication** when ready

Your Supabase backend is now production-ready! 🚀

## 📞 **Need Help?**

If you encounter any specific errors:
1. Copy the exact error message
2. Note which step failed
3. Check the Supabase dashboard logs
4. Verify your project is active and has sufficient resources

This schema gives you a powerful foundation for a professional-grade personal AI assistant! 🎯
