# Supabase Setup Guide for Personal AI Assistant

This guide will help you set up Supabase as the backend for your personal AI assistant, replacing localStorage with a real database.

## 🚀 **Quick Start**

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose a name (e.g., "personal-ai-assistant")
4. Set a secure database password
5. Choose a region close to you
6. Wait for project setup (2-3 minutes)

### 2. Get Your Project Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

### 3. Update Environment Variables

Add these to your `.env` file:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Existing OpenAI configuration
VITE_OPENAI_API_KEY=sk-your-openai-key-here
```

### 4. Run Database Migration

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase/migrations/001_create_items_table.sql`
3. Paste and run the SQL
4. Verify the `items` table was created

### 5. Test Connection

1. Restart your development server: `npm run dev`
2. Open browser console (F12)
3. Look for Supabase connection logs
4. You should see: "✅ Supabase connected and ready"

## 🏗️ **Architecture Overview**

### **Current Setup (localStorage)**
```
React App → localStorage → Browser Storage
```

### **New Setup (Supabase)**
```
React App → Supabase Client → PostgreSQL Database
                ↓
        Real-time subscriptions
        Row Level Security
        Automatic backups
```

## 📊 **Database Schema**

### **Items Table Structure**
```sql
items (
  id: UUID (Primary Key)
  text: TEXT (Required)
  timestamp: TIMESTAMPTZ
  completed: BOOLEAN
  type: 'capture' | 'plan'
  tags: TEXT[]
  archived: BOOLEAN
  user_id: UUID (Future multi-user)
  created_at: TIMESTAMPTZ
  updated_at: TIMESTAMPTZ
)
```

### **Indexes for Performance**
- User ID lookups
- Type filtering (capture vs plan)
- Completion status
- Timestamp sorting
- Tag searching (GIN index)

## 🔧 **Configuration Details**

### **Environment Variables**
- `VITE_SUPABASE_URL`: Your project's API endpoint
- `VITE_SUPABASE_ANON_KEY`: Public API key for client-side access

### **Security Features**
- **Row Level Security (RLS)**: Enabled for future user isolation
- **Public Access**: Currently open for development (can be restricted later)
- **API Key**: Public key is safe to expose in client code

### **Real-time Features**
- **WebSocket Connections**: Automatic reconnection
- **Event Rate Limiting**: 10 events per second max
- **Session Persistence**: Tokens stored securely

## 🧪 **Testing & Debugging**

### **Connection Test**
```typescript
import { testSupabaseConnection } from './utils/supabase-test';

// Test in browser console
await testSupabaseConnection();
```

### **Status Check**
```typescript
import { getSupabaseStatusSummary } from './utils/supabase-test';

// Get human-readable status
console.log(getSupabaseStatusSummary());
```

### **Health Check**
```typescript
import { supabaseManager } from './config/supabase';

// Comprehensive health check
const health = await supabaseManager.getHealthCheck();
console.log(health);
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **"Supabase not configured"**
- Check `.env` file exists in project root
- Verify environment variable names start with `VITE_`
- Restart development server after adding `.env`

#### **"Connection failed"**
- Verify project URL is correct
- Check if project is active in Supabase dashboard
- Ensure database password is set

#### **"Table not found"**
- Run the SQL migration in Supabase SQL Editor
- Check table name matches exactly: `items`
- Verify permissions are set correctly

#### **"Permission denied"**
- Check RLS policies in Supabase dashboard
- Verify anon key permissions
- Check if table grants are set correctly

### **Debug Commands**
```bash
# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Verify .env file
cat .env | grep SUPABASE

# Check Supabase project status
# Go to supabase.com dashboard
```

## 🔄 **Migration from localStorage**

### **Data Export**
1. Use existing export feature in your app
2. Data is already in JSON format
3. Can be imported into Supabase later

### **Gradual Migration**
1. Start with Supabase for new items
2. Keep localStorage as fallback
3. Migrate existing data when ready

## 📈 **Performance & Scaling**

### **Free Tier Limits**
- **Database**: 500MB storage
- **API Requests**: 50,000/month
- **Real-time**: 2 concurrent connections
- **Bandwidth**: 2GB/month

### **Optimization Tips**
- Use indexes for frequent queries
- Implement pagination for large datasets
- Cache frequently accessed data
- Monitor API usage in dashboard

## 🔮 **Future Enhancements**

### **Multi-user Support**
- User authentication with Supabase Auth
- Row-level security per user
- Shared workspaces and collaboration

### **Advanced Features**
- Real-time collaboration
- Data analytics and insights
- Automated backups and versioning
- API endpoints for external integrations

## 📚 **Additional Resources**

- [Supabase Documentation](https://supabase.com/docs)
- [JavaScript Client Reference](https://supabase.com/docs/reference/javascript)
- [Database Design Best Practices](https://supabase.com/docs/guides/database/design)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🎯 **Next Steps**

1. ✅ **Install Supabase client** - Done
2. ✅ **Create configuration** - Done  
3. ✅ **Set up database schema** - Done
4. 🔄 **Test connection** - Ready to test
5. 🔄 **Integrate with app** - Next step
6. 🔄 **Migrate data** - Future step

Your Supabase backend is now configured and ready for testing! 🚀
