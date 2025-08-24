# Personal AI Assistant - Cursor Context

## Project Overview
Building a personal AI assistant from scratch using Supabase as the backend. This is a personal productivity tool (N=1) with potential to scale later.

## Tech Stack
- **Frontend**: Vanilla JavaScript (no frameworks for simplicity)
- **Backend**: Supabase (PostgreSQL + Auth + API)
- **AI**: OpenAI API for daily planning
- **Hosting**: GitHub Pages (frontend) + Supabase (backend)
- **Development**: Cursor AI-assisted coding

## Database Schema
```sql
-- Main items table
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_completed BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  input_method VARCHAR(10) DEFAULT 'text', -- 'text' or 'voice'
  metadata JSONB DEFAULT '{}'
);
```

## Core Features to Build
1. **Authentication**: Simple email/password login
2. **Item Management**: Create, read, update, delete personal items
3. **Search**: Full-text search through all items
4. **AI Planning**: "Plan my day" command using OpenAI
5. **Voice Input**: Speech-to-text for quick capture

## Architecture Principles
- **Simple First**: Avoid over-engineering for personal use
- **Progressive Enhancement**: Start basic, add features incrementally  
- **Offline Capable**: Cache data locally when possible
- **Cost Conscious**: Stay within Supabase free tier ($0/month)
- **Mobile Friendly**: Responsive design for phone use

## Environment Variables Needed
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-key
```

## Code Style Preferences
- Use async/await for all async operations
- Descriptive function names (e.g., `saveItemToDatabase`, `getUserItems`)
- Always include error handling with user-friendly messages
- Comment complex logic
- Keep functions small and focused

## Current Development Status
Starting fresh - no existing localStorage data to migrate. Building everything from scratch with Supabase as the primary backend.

## Success Criteria
- Can capture thoughts/tasks instantly (< 2 seconds)
- Daily planning takes < 5 seconds and provides useful output
- Search finds relevant items quickly (< 1 second)
- Works reliably on mobile and desktop
- Stays within free tier limits ($0/month)