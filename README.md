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
- OpenAI API key (optional, for AI features)

### **1. Clone & Install**
```bash
git clone https://github.com/YOUR_USERNAME/my_personal_assistant.git
cd my_personal_assistant
npm install
```

### **2. Environment Setup**
Create `.env` file in project root:
```bash
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI Configuration (Optional, for AI features)
VITE_OPENAI_API_KEY=sk-your-openai-key-here

# App Configuration (Optional)
VITE_APP_NAME=My Personal Assistant
VITE_ENABLE_DEBUG=true
```

### **3. Database Setup**
Follow the **SUPABASE_SETUP_GUIDE.md** to set up your database schema.

### **4. Start Development**
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

## 🌐 **Live Demo**

Visit the live application: [https://YOUR_USERNAME.github.io/my_personal_assistant](https://YOUR_USERNAME.github.io/my_personal_assistant)

## 🏗️ **Architecture**

### **Frontend**
- **React 19** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **ESLint + Prettier** for code quality

### **Backend**
- **Supabase** PostgreSQL database
- **Real-time subscriptions** for live updates
- **Row Level Security** for data protection
- **Vector embeddings** for semantic search

### **AI Integration**
- **OpenAI GPT-4o-mini** for planning
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
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint --fix   # Fix linting issues
```

### **Project Structure**
```
src/
├── config/          # Configuration files
│   ├── env.ts      # Environment variables
│   ├── openai.ts   # OpenAI client
│   └── supabase.ts # Supabase client
├── utils/           # Utility functions
│   └── supabase-test.ts
├── components/      # React components
├── App.tsx         # Main application
└── main.tsx        # Entry point
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
handleDailyPlanning(); // Triggers AI planning

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
- Check OpenAI API key is set
- Verify API key has sufficient credits
- Check browser console for errors
- Test with fallback planning

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
```

## 📈 **Performance & Scaling**

### **Free Tier Limits**
- **Supabase**: 500MB database, 50K API requests/month
- **OpenAI**: Pay-per-use (~$2-5/month for personal use)
- **Vercel/Netlify**: Free hosting for frontend

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
- **OpenAI** for AI capabilities
- **Vite** for the fast build tool
- **React** team for the excellent framework

---

**Built with ❤️ for personal productivity and AI exploration**

Your personal AI assistant is ready to help you capture, organize, and act on life's inputs effortlessly! 🎯
