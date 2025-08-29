# 🚀 Personal AI Assistant

A comprehensive, AI-powered personal productivity assistant built with React, TypeScript, and Supabase. Features intelligent daily planning, context-aware recommendations, and multi-modal content management.

## ✨ **Features**

### **🤖 AI-Powered Planning**
- **Daily Planning**: "Plan my day" command with OpenAI integration
- **Context Awareness**: Mood and energy level tracking
- **Smart Recommendations**: AI-generated insights and suggestions
- **Template System**: Reusable workflow templates

### **📝 Universal Capture**
- **Multi-modal Input**: Text, voice, images, links, files
- **Smart Classification**: Automatic content categorization
- **Tag System**: Contextual tags for organization
- **Voice Input**: Speech-to-text for hands-free capture

### **🏗️ Advanced Architecture**
- **Real-time Database**: Supabase PostgreSQL with live updates
- **Secure Backend**: Vercel serverless functions for AI operations
- **Scalable Schema**: Production-ready database design
- **Performance Optimized**: Full-text search and semantic indexing
- **Type Safety**: Full TypeScript integration

### **📊 Analytics & Insights**
- **Pattern Recognition**: Track recurring themes and behaviors
- **Completion Analytics**: Monitor productivity trends
- **Knowledge Base**: Semantic search and recommendations
- **Mood Tracking**: Energy and context awareness

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- Supabase account
- OpenAI API key (configured in backend)

### **1. Clone & Install**
```bash
git clone https://github.com/PrabodhBharadwaj/my_personal_assistant.git
cd my_personal_assistant
npm install
cd backend && npm install
```

### **2. Environment Setup**
Create `.env` file in project root:
```bash
# Frontend Environment Variables
VITE_BACKEND_URL=https://your-backend-url.vercel.app

# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration (Optional)
VITE_APP_NAME=My Personal Assistant
VITE_ENABLE_DEBUG=true
```

**Note**: OpenAI API key is configured securely in the backend and never exposed to the frontend.

### **3. Backend Setup**
Follow the **backend/README.md** and **backend/VERCEL_DEPLOYMENT.md** to deploy your backend to Vercel.

### **4. Database Setup**
Follow the **SUPABASE_SETUP_GUIDE.md** to set up your database schema.

### **5. Start Development**
```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Start backend (for local development)
cd backend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

## 🌐 **Live Demo**

Visit the live application: [https://prabodhbharadwaj.github.io/my_personal_assistant](https://prabodhbharadwaj.github.io/my_personal_assistant)

## 🏗️ **Architecture**

### **Frontend**
- **React 19** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **ESLint + Prettier** for code quality

### **Backend (Vercel Serverless)**
- **Vercel Functions**: Serverless API endpoints
- **OpenAI Integration**: Secure server-side AI operations
- **Rate Limiting**: API abuse prevention
- **CORS Management**: Secure cross-origin requests

### **Database**
- **Supabase** PostgreSQL database
- **Real-time subscriptions** for live updates
- **Row Level Security** for data protection
- **Vector embeddings** for semantic search

### **AI Integration**
- **OpenAI GPT-4o-mini** for planning
- **Secure Backend**: API keys never exposed to client
- **Cost-optimized** API usage
- **Fallback planning** when AI unavailable
- **Context-aware** recommendations

## 📊 **Database Schema**

### **Core Tables**
- **`items`**: Universal content storage with rich metadata
- **`templates`**: Reusable workflow templates
- **`contexts`**: Project and context grouping
- **`daily_plans`**: AI-generated daily schedules
- **`knowledge_entries`**: Semantic search knowledge base

### **Analytics Tables**
- **`mood_entries`**: Energy and mood tracking
- **`activities`**: Activity and pattern recognition
- **`insights`**: AI-generated insights and trends

### **Performance Features**
- **Full-text search** with PostgreSQL
- **Vector embeddings** for semantic similarity
- **Optimized indexes** for fast queries
- **Materialized views** for common queries

## 🔧 **Development**

### **Available Scripts**
```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint --fix   # Fix linting issues

# Backend
cd backend
npm run dev          # Start backend server
npm run build:local  # Build TypeScript
npm start            # Start production build
```

### **Project Structure**
```
my_personal_assistant/
├── src/                    # Frontend React application
│   ├── config/            # Configuration files
│   │   ├── env.ts        # Environment variables
│   │   ├── openai.ts     # OpenAI client (frontend)
│   │   └── supabase.ts   # Supabase client
│   ├── utils/             # Utility functions
│   ├── components/        # React components
│   ├── App.tsx           # Main application
│   └── main.tsx          # Entry point
├── backend/               # Backend serverless functions
│   ├── api/              # Vercel API routes
│   │   ├── health.js     # Health check endpoint
│   │   ├── index.js      # Main API handler
│   │   ├── _utils.js     # Shared utilities
│   │   └── openai/
│   │       └── plan.js   # AI planning endpoint
│   ├── src/              # TypeScript source (local dev)
│   ├── vercel.json       # Vercel configuration
│   └── package.json      # Backend dependencies
├── supabase/             # Database migrations
└── package.json          # Frontend dependencies
```

### **Code Quality**
- **ESLint** with TypeScript rules
- **Prettier** for consistent formatting
- **Type safety** throughout the codebase
- **Error handling** and graceful degradation

## 🌟 **Usage Examples**

### **Basic Capture**
```typescript
// Add a simple task
addItem("Buy groceries for dinner", "task");

// Add with context
addItem("Review design system updates #work #priority", "task");
```

### **AI Planning**
```typescript
// Generate daily plan
handleDailyPlanning(); // Triggers AI planning via backend

// Custom planning prompts
"Plan my day with focus on creative work"
"What should I focus on this afternoon?"
```

### **Database Operations**
```typescript
import { supabase } from './config/supabase';

// Insert item
const { data, error } = await supabase
  .from('items')
  .insert({
    content: 'New task',
    item_type: 'task',
    category: 'work',
    is_actionable: true
  });

// Query with filters
const { data: tasks } = await supabase
  .from('items')
  .select('*')
  .eq('item_type', 'task')
  .eq('status', 'active');
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Supabase Connection Failed**
- Verify environment variables in `.env`
- Check Supabase project is active
- Ensure database schema is created
- Restart development server

#### **AI Planning Not Working**
- Check backend is deployed and accessible
- Verify `VITE_BACKEND_URL` is set correctly
- Check browser console for CORS errors
- Test backend health endpoint

#### **Backend API Errors**
- Check Vercel deployment status
- Verify environment variables in Vercel
- Check API logs in Vercel dashboard
- Test endpoints with Postman/curl

#### **Database Errors**
- Run schema verification queries
- Check table permissions
- Verify extensions are enabled
- Review Supabase dashboard logs

### **Debug Commands**
```typescript
// Test Supabase connection
import { testSupabaseConnection } from './utils/supabase-test';
await testSupabaseConnection();

// Check environment config
import { config } from './config/env';
console.log('Config:', config);

// Test backend connection
fetch(`${config.backendUrl}/api/health`)
  .then(res => res.json())
  .then(data => console.log('Backend health:', data));
```

## 📈 **Performance & Scaling**

### **Free Tier Limits**
- **Supabase**: 500MB database, 50K API requests/month
- **Vercel**: 100GB bandwidth, 100 serverless function executions/day
- **OpenAI**: Pay-per-use (~$2-5/month for personal use)

### **Optimization Tips**
- Use database indexes effectively
- Implement pagination for large datasets
- Cache frequently accessed data
- Monitor API usage and costs

## 🔮 **Roadmap**

### **Phase 1: Core MVP** ✅
- [x] Universal capture system
- [x] AI-powered daily planning
- [x] Supabase database integration
- [x] Basic task management
- [x] Secure backend deployment

### **Phase 2: Enhanced Features** 🚧
- [ ] Real-time collaboration
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] API integrations (calendar, email)

### **Phase 3: Advanced AI** 📋
- [ ] Semantic search and recommendations
- [ ] Pattern recognition and insights
- [ ] Predictive planning
- [ ] Natural language processing

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 **Acknowledgments**

- **Supabase** for the amazing backend platform
- **Vercel** for serverless function hosting
- **OpenAI** for AI capabilities
- **Vite** for the fast build tool
- **React** team for the excellent framework

---

**Built with ❤️ for personal productivity and AI exploration**

Your personal AI assistant is ready to help you capture, organize, and act on life's inputs effortlessly! 🎯

---

> **📢 Repository Status**: This repository is now public to enable GitHub Pages deployment.
> **🔒 Security**: OpenAI API keys are securely stored in the backend and never exposed to the client.
