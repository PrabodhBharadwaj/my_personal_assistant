-- Personal AI Assistant - Robust Database Schema
-- Handles: Tasks, Ideas, Knowledge Hub, Context, Recommendations, Multi-modal Input

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Main items table - handles all types of content
CREATE TABLE items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text', -- 'text', 'voice', 'image', 'link', 'file'
    
    -- Classification & Organization
    item_type VARCHAR(50), -- 'task', 'idea', 'knowledge', 'experience', 'note'
    category VARCHAR(100), -- 'work', 'personal', 'health', 'travel', 'learning', etc.
    priority VARCHAR(20), -- 'urgent', 'high', 'medium', 'low'
    energy_level VARCHAR(20), -- 'high', 'medium', 'low' (for contextual recommendations)
    mood_context VARCHAR(50), -- 'creative', 'focused', 'social', 'relaxed', etc.
    
    -- Status & Lifecycle
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'archived', 'someday', 'cancelled'
    is_actionable BOOLEAN DEFAULT false, -- true for tasks, false for reference items
    
    -- Rich Content Support
    metadata JSONB DEFAULT '{}', -- Store rich data: links, tags, location, etc.
    attachments TEXT[], -- Array of file paths/URLs
    
    -- Context & Planning
    due_date TIMESTAMPTZ,
    estimated_duration INTEGER, -- minutes
    context_tags TEXT[], -- Array of contextual tags for recommendations
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    
    -- AI Enhancement
    ai_generated BOOLEAN DEFAULT false, -- Track AI-generated content
    ai_confidence DECIMAL(3,2), -- AI classification confidence (0.00-1.00)
    
    -- Search & Retrieval
    search_vector tsvector -- Full-text search support
);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CONTEXT & RECOMMENDATIONS TABLES
-- ============================================================================

-- Templates for common workflows (AI autofill source)
CREATE TABLE templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    template_type VARCHAR(50), -- 'task_list', 'planning', 'routine'
    template_data JSONB NOT NULL, -- Structured template content
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Context sessions for grouping related items
CREATE TABLE contexts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    context_type VARCHAR(50), -- 'project', 'trip', 'research', 'routine'
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Link items to contexts (many-to-many)
CREATE TABLE item_contexts (
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    context_id UUID REFERENCES contexts(id) ON DELETE CASCADE,
    relevance_score DECIMAL(3,2) DEFAULT 1.00,
    added_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (item_id, context_id)
);

-- ============================================================================
-- KNOWLEDGE & INSIGHTS TABLES
-- ============================================================================

-- Track recurring patterns and insights
CREATE TABLE insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    insight_type VARCHAR(50), -- 'pattern', 'trend', 'recommendation', 'reflection'
    confidence DECIMAL(3,2),
    related_items UUID[], -- Array of related item IDs
    metadata JSONB DEFAULT '{}',
    generated_at TIMESTAMPTZ DEFAULT now(),
    valid_until TIMESTAMPTZ -- Insights can expire
);

-- Knowledge base for semantic search and recommendations
CREATE TABLE knowledge_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(300),
    content TEXT NOT NULL,
    source_type VARCHAR(50), -- 'user_input', 'ai_generated', 'external_api'
    source_item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    category VARCHAR(100),
    tags TEXT[],
    embedding vector(1536), -- For semantic search (OpenAI embeddings)
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- PLANNING & SCHEDULING TABLES
-- ============================================================================

-- Daily plans generated by AI
CREATE TABLE daily_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_date DATE NOT NULL,
    plan_content JSONB NOT NULL, -- Structured daily plan
    focus_areas TEXT[],
    energy_budget VARCHAR(20), -- 'high', 'medium', 'low'
    generated_at TIMESTAMPTZ DEFAULT now(),
    modified_at TIMESTAMPTZ,
    completion_status JSONB DEFAULT '{}' -- Track what was actually completed
);

-- Time blocks for detailed scheduling
CREATE TABLE time_blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID REFERENCES daily_plans(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    title VARCHAR(200),
    description TEXT,
    block_type VARCHAR(50), -- 'focus', 'break', 'meeting', 'routine'
    related_items UUID[], -- Items scheduled in this block
    status VARCHAR(50) DEFAULT 'planned',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- ANALYTICS & TRACKING TABLES
-- ============================================================================

-- Mood and energy tracking for contextual recommendations
CREATE TABLE mood_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    mood VARCHAR(50),
    mood_tags TEXT[],
    notes TEXT,
    context VARCHAR(100), -- What prompted this entry
    recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Activity tracking for pattern recognition
CREATE TABLE activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_type VARCHAR(100), -- 'task_completed', 'plan_generated', 'search_performed'
    activity_data JSONB,
    duration_minutes INTEGER,
    success_rating INTEGER CHECK (success_rating >= 1 AND success_rating <= 5),
    performed_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Core search and filtering
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_item_type ON items(item_type);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_created_at ON items(created_at DESC);
CREATE INDEX idx_items_due_date ON items(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_items_actionable ON items(is_actionable);

-- Full-text search
CREATE INDEX idx_items_search ON items USING gin(search_vector);
CREATE OR REPLACE FUNCTION items_search_trigger() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', COALESCE(NEW.content, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER items_search_update 
    BEFORE INSERT OR UPDATE ON items 
    FOR EACH ROW 
    EXECUTE FUNCTION items_search_trigger();

-- Context and recommendation queries
CREATE INDEX idx_items_context_tags ON items USING gin(context_tags);
CREATE INDEX idx_items_metadata ON items USING gin(metadata);
CREATE INDEX idx_items_energy_mood ON items(energy_level, mood_context);

-- Knowledge base semantic search
CREATE INDEX idx_knowledge_embedding ON knowledge_entries USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100); -- Requires pgvector extension

-- Planning and scheduling
CREATE INDEX idx_daily_plans_date ON daily_plans(plan_date);
CREATE INDEX idx_time_blocks_time ON time_blocks(start_time, end_time);

-- Analytics
CREATE INDEX idx_activities_type_time ON activities(activity_type, performed_at);
CREATE INDEX idx_mood_entries_time ON mood_entries(recorded_at);

-- ============================================================================
-- USEFUL VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active tasks with context
CREATE VIEW active_tasks AS
SELECT 
    i.*,
    array_agg(DISTINCT c.name) as context_names
FROM items i
LEFT JOIN item_contexts ic ON i.id = ic.item_id
LEFT JOIN contexts c ON ic.context_id = c.id
WHERE i.is_actionable = true 
  AND i.status = 'active'
GROUP BY i.id, i.content, i.content_type, i.item_type, i.category, 
         i.priority, i.energy_level, i.mood_context, i.status, 
         i.is_actionable, i.metadata, i.attachments, i.due_date, 
         i.estimated_duration, i.context_tags, i.created_at, 
         i.updated_at, i.completed_at, i.ai_generated, 
         i.ai_confidence, i.search_vector;

-- Recent items by type
CREATE VIEW recent_items_by_type AS
SELECT 
    item_type,
    COUNT(*) as count,
    MAX(created_at) as last_created,
    AVG(CASE WHEN status = 'completed' THEN 1.0 ELSE 0.0 END) as completion_rate
FROM items 
WHERE created_at > now() - interval '30 days'
GROUP BY item_type;

-- Knowledge hub summary
CREATE VIEW knowledge_summary AS
SELECT 
    category,
    COUNT(*) as total_entries,
    COUNT(*) FILTER (WHERE item_type = 'knowledge') as knowledge_items,
    COUNT(*) FILTER (WHERE item_type = 'idea') as ideas,
    MAX(created_at) as last_updated
FROM items 
WHERE status != 'archived'
GROUP BY category;

-- ============================================================================
-- SAMPLE DATA FUNCTIONS
-- ============================================================================

-- Function to add sample data for testing
CREATE OR REPLACE FUNCTION add_sample_data() RETURNS void AS $$
BEGIN
    -- Sample templates
    INSERT INTO templates (name, template_type, template_data) VALUES 
    ('Daily Review', 'routine', '{"steps": ["Review completed tasks", "Plan tomorrow", "Note insights"]}'),
    ('Travel Planning', 'task_list', '{"tasks": ["Book flights", "Reserve accommodation", "Research activities", "Pack essentials"]}'),
    ('Weekly Reflection', 'planning', '{"prompts": ["What went well?", "What could improve?", "Key learnings"]}');

    -- Sample contexts
    INSERT INTO contexts (name, context_type, description) VALUES 
    ('Personal Development', 'project', 'Learning and self-improvement activities'),
    ('Health & Fitness', 'routine', 'Exercise, nutrition, and wellness tracking'),
    ('Work Projects', 'project', 'Professional tasks and deliverables');

    RAISE NOTICE 'Sample data added successfully';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MAINTENANCE FUNCTIONS
-- ============================================================================

-- Clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data() RETURNS void AS $$
BEGIN
    -- Archive completed items older than 6 months
    UPDATE items 
    SET status = 'archived' 
    WHERE status = 'completed' 
      AND completed_at < now() - interval '6 months';
    
    -- Delete expired insights
    DELETE FROM insights 
    WHERE valid_until IS NOT NULL 
      AND valid_until < now();
    
    -- Clean up old mood entries (keep 1 year)
    DELETE FROM mood_entries 
    WHERE recorded_at < now() - interval '1 year';
    
    RAISE NOTICE 'Cleanup completed';
END;
$$ LANGUAGE plpgsql;
