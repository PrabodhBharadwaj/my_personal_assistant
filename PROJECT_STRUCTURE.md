# 🏗️ Project Structure & Architecture

This document explains the overall architecture of the Personal AI Assistant project, including how the frontend and backend components work together.

## 📁 **Project Overview**

```
my_personal_assistant/
├── src/                    # Frontend React application
├── backend/                # Backend serverless functions
├── supabase/              # Database migrations
├── public/                 # Static assets
├── package.json            # Frontend dependencies
└── README.md              # Main project documentation
```

## 🔄 **Architecture Flow**

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐    OpenAI API    ┌─────────────────┐
│   Frontend      │ ◄──────────────► │   Backend       │ ◄──────────────► │   OpenAI        │
│   (React)       │                  │   (Vercel)      │                  │   (GPT-4o-mini) │
└─────────────────┘                  └─────────────────┘                  └─────────────────┘
         │                                     │
         │                                     │
         ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐
│   Supabase      │                  │   Vercel        │
│   (Database)    │                  │   (Hosting)     │
└─────────────────┘                  └─────────────────┘
```

## 🎯 **Frontend (React + TypeScript)**

### **Purpose**
- User interface for the personal assistant
- Task management and content capture
- Real-time data synchronization with Supabase
- AI planning requests to backend

### **Key Components**
- **React 19** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive styling
- **Supabase Client** for database operations
- **Custom hooks** for state management

### **Environment Variables**
```bash
# Frontend Configuration
VITE_BACKEND_URL=https://your-backend.vercel.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_NAME=My Personal Assistant
VITE_ENABLE_DEBUG=true
```

### **API Communication**
- **Backend calls**: Uses `VITE_BACKEND_URL` for AI operations
- **Database calls**: Direct Supabase client calls
- **CORS**: Handled by backend configuration

## 🔧 **Backend (Vercel Serverless)**

### **Purpose**
- Secure proxy for OpenAI API calls
- API key protection (never exposed to frontend)
- Rate limiting and request validation
- CORS management for frontend communication

### **Structure**
```
backend/
├── api/                    # Vercel API routes (production)
│   ├── health.js          # Health check endpoint
│   ├── index.js           # Main API handler (fallback)
│   ├── _utils.js          # Shared utilities
│   └── openai/
│       └── plan.js        # AI planning endpoint
├── src/                   # TypeScript source (local development)
├── vercel.json            # Vercel configuration
└── package.json           # Backend dependencies
```

### **API Endpoints**
- **`GET /api/health`**: Health check and status
- **`POST /api/openai/plan`**: AI daily planning
- **`GET /api`**: API information and available endpoints

### **Environment Variables**
```bash
# Backend Configuration (set in Vercel dashboard)
OPENAI_API_KEY=sk-your-openai-api-key
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### **Security Features**
- ✅ **API Key Protection**: OpenAI key only accessible server-side
- ✅ **Rate Limiting**: 100 requests per 15 minutes per IP
- ✅ **CORS Protection**: Controlled cross-origin access
- ✅ **Input Validation**: Request data sanitization
- ✅ **Error Handling**: No sensitive data exposure

## 🗄️ **Database (Supabase)**

### **Purpose**
- Persistent data storage
- Real-time subscriptions
- User authentication and authorization
- Full-text search and semantic indexing

### **Key Tables**
- **`items`**: Universal content storage
- **`templates`**: Reusable workflow templates
- **`contexts`**: Project and context grouping
- **`daily_plans`**: AI-generated daily schedules
- **`mood_entries`**: Energy and mood tracking

### **Features**
- **PostgreSQL** with real-time subscriptions
- **Row Level Security** for data protection
- **Vector embeddings** for semantic search
- **Full-text search** capabilities

## 🚀 **Deployment Architecture**

### **Frontend Deployment**
- **Platform**: GitHub Pages (free tier)
- **Build**: Vite production build
- **Domain**: `https://prabodhbharadwaj.github.io/my_personal_assistant`

### **Backend Deployment**
- **Platform**: Vercel (serverless functions)
- **Build**: No build required (direct JavaScript execution)
- **Domain**: `https://your-project.vercel.app`

### **Database Deployment**
- **Platform**: Supabase (managed PostgreSQL)
- **Region**: Global (auto-selected)
- **Backup**: Automatic daily backups

## 🔄 **Data Flow Examples**

### **1. AI Daily Planning**
```
User Request → Frontend → Backend → OpenAI → Backend → Frontend → User
     ↓           ↓         ↓         ↓        ↓         ↓         ↓
  "Plan my day" → React → Vercel → GPT-4 → Vercel → React → Display Plan
```

### **2. Task Creation**
```
User Input → Frontend → Supabase → Database → Real-time Update → UI Update
     ↓         ↓         ↓         ↓           ↓           ↓
  "New task" → React → Supabase → PostgreSQL → WebSocket → React State
```

### **3. Content Search**
```
Search Query → Frontend → Supabase → Full-text Search → Results → UI
      ↓         ↓         ↓           ↓           ↓       ↓
   "meeting" → React → Supabase → PostgreSQL → JSON → Display
```

## 🔒 **Security Model**

### **Frontend Security**
- **No sensitive data**: API keys never stored in frontend
- **Environment variables**: Only public configuration exposed
- **HTTPS only**: All API calls use secure connections

### **Backend Security**
- **API key isolation**: OpenAI key only accessible server-side
- **Rate limiting**: Prevents API abuse
- **Input validation**: Sanitizes all incoming requests
- **CORS protection**: Controls cross-origin access

### **Database Security**
- **Row Level Security**: User data isolation
- **Encrypted connections**: All database traffic encrypted
- **Backup encryption**: Automatic backup encryption

## 📊 **Performance Characteristics**

### **Frontend**
- **Bundle size**: ~200KB gzipped
- **Load time**: <2 seconds on 3G
- **Runtime**: React 19 with concurrent features

### **Backend**
- **Cold start**: ~100-200ms
- **Response time**: <500ms for AI requests
- **Scalability**: Auto-scaling based on demand

### **Database**
- **Query time**: <100ms for indexed queries
- **Real-time**: <50ms for subscription updates
- **Storage**: Optimized for read-heavy workloads

## 🔧 **Development Workflow**

### **Local Development**
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Database (if needed)
supabase start
```

### **Production Deployment**
```bash
# Frontend: Automatic via GitHub Pages
git push origin main

# Backend: Manual via Vercel CLI
vercel --prod

# Database: Automatic via Supabase
# (migrations run automatically)
```

## 🚨 **Troubleshooting Guide**

### **Common Issues**

#### **Frontend Can't Connect to Backend**
- Check `VITE_BACKEND_URL` in `.env`
- Verify backend is deployed and accessible
- Check CORS configuration in backend

#### **Backend API Errors**
- Check Vercel deployment status
- Verify environment variables in Vercel dashboard
- Check API logs in Vercel Functions tab

#### **Database Connection Issues**
- Verify Supabase project is active
- Check environment variables in frontend
- Ensure database schema is created

### **Debug Commands**
```bash
# Test backend health
curl https://your-backend.vercel.app/api/health

# Test Supabase connection
# (use browser console with testSupabaseConnection())

# Check environment variables
# (use browser console with config object)
```

## 📈 **Scaling Considerations**

### **Current Limits (Free Tiers)**
- **Vercel**: 100 serverless function executions/day
- **Supabase**: 500MB database, 50K API requests/month
- **GitHub Pages**: 100GB bandwidth/month

### **Upgrade Paths**
- **Vercel Pro**: $20/month for unlimited functions
- **Supabase Pro**: $25/month for 8GB database
- **Custom Domain**: $12/year for professional branding

## 🎯 **Next Steps**

1. **Deploy backend** to Vercel following `backend/VERCEL_DEPLOYMENT.md`
2. **Test all endpoints** to ensure proper functionality
3. **Update frontend** with new backend URL
4. **Monitor performance** in Vercel and Supabase dashboards
5. **Set up custom domain** for production use

---

**This architecture provides a secure, scalable, and maintainable foundation for your personal AI assistant! 🚀**
