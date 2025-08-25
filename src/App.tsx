import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { createOpenAIClient } from './config/openai';
import type { PlanningRequest } from './config/openai';
import { config } from './config/env';
import { supabase } from './config/supabase';
import type { DatabaseItem } from './config/supabase';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/Auth/AuthPage';
import UserProfile from './components/UserProfile';

interface CapturedItem {
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

// Main App Content Component (wrapped with authentication)
function AppContent() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<CapturedItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'active' | 'completed' | 'archived'
  >('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isPlanning, setIsPlanning] = useState(false);
  const [planningError, setPlanningError] = useState<string | null>(null);

  // Custom System Prompt State Variables
  const [customSystemPrompt, setCustomSystemPrompt] = useState<string>('');
  const [showPromptEditor, setShowPromptEditor] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user needs email confirmation
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  // Load custom system prompt from localStorage
  const loadCustomSystemPrompt = () => {
    const savedPrompt = localStorage.getItem('customSystemPrompt');
    if (savedPrompt) {
      setCustomSystemPrompt(savedPrompt);
    }
  };

  // Save custom system prompt to localStorage
  const saveCustomSystemPrompt = (prompt: string) => {
    localStorage.setItem('customSystemPrompt', prompt);
    setCustomSystemPrompt(prompt);
    setShowPromptEditor(false);
    console.log('Custom system prompt saved:', prompt);
  };

  // Load items from Supabase or localStorage
  const loadItemsFromSupabase = async () => {
    if (config.enableSupabase && supabase && user) {
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading from Supabase:', error);
          // Fallback to localStorage
          loadItemsFromLocalStorage();
        } else {
          console.log('Items loaded from Supabase:', data);
          setItems(data || []);
        }
      } catch (error) {
        console.error('Error loading from Supabase:', error);
        loadItemsFromLocalStorage();
      }
    } else {
      loadItemsFromLocalStorage();
    }
  };

  const loadItemsFromLocalStorage = () => {
    const savedItems = localStorage.getItem('personalAssistantItems');
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems).map(
          (item: Record<string, unknown>) => ({
          ...item,
            timestamp: new Date(item.timestamp as string),
          })
        );
        setItems(parsedItems);
      } catch {
        console.error('Error loading saved items');
      }
    }
  };

  // Show welcome screen for new users (first time after signup)
  const [showWelcome, setShowWelcome] = useState(() => {
    // Check if this is the first time the user is accessing the app
    if (user && user.id) {
      const hasSeenWelcome = localStorage.getItem(`welcome-${user.id}`);
      return !hasSeenWelcome;
    }
    return false;
  });

  // Load items and custom prompt on component mount
  useEffect(() => {
    if (user && !loading) {
      loadItemsFromSupabase();
      loadCustomSystemPrompt();
      
      // Check if user needs email confirmation
      if (user && !user.email_confirmed_at) {
        setNeedsEmailConfirmation(true);
      } else {
        setNeedsEmailConfirmation(false);
      }
    }
  }, [user, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save items to localStorage whenever items change
  useEffect(() => {
    if (user && !loading) {
      localStorage.setItem('personalAssistantItems', JSON.stringify(items));
    }
  }, [items, user, loading]);

  // Authentication check
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your assistant...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  // Check if user needs email confirmation
  if (needsEmailConfirmation) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="email-confirmation-icon">
              <div className="icon">📧</div>
            </div>
            <h2 className="auth-title">Email Confirmation Required</h2>
            <p className="auth-subtitle">
              Please check your email and click the confirmation link to continue.
            </p>
          </div>
          
          <div className="email-confirmation-content">
            <p className="confirmation-message">
              We've sent a confirmation email to <strong>{user.email}</strong>. 
              Please check your inbox and click the confirmation link to verify your account.
            </p>
            
            <div className="confirmation-actions">
              <button
                onClick={() => window.location.reload()}
                className="auth-button primary"
              >
                I've Confirmed My Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="auth-container">
        <div className="auth-card welcome-card">
          <div className="welcome-header">
            <div className="welcome-icon">✓</div>
          </div>
          
          <h2 className="welcome-title">
            Welcome to Personal Assistant!
          </h2>
          
          <p className="welcome-subtitle">
            Your account has been created successfully. Here's what you can do:
          </p>
          
          <div className="welcome-features">
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div>
                <h3 className="feature-title">Capture Anything</h3>
                <p className="feature-description">
                  Use voice input or text to capture thoughts, tasks, and ideas with smart hashtag organization
                </p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div>
                <h3 className="feature-title">AI-Powered Planning</h3>
                <p className="feature-description">
                  Get intelligent daily plans with commands like "plan my day" using customizable AI behavior
                </p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div>
                <h3 className="feature-title">Cross-Device Sync</h3>
                <p className="feature-description">
                  Access your data anywhere with real-time sync, bulk operations, and smart organization tools
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              localStorage.setItem(`welcome-${user.id}`, 'true');
              setShowWelcome(false);
            }}
            className="auth-button primary full-width"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }



  const extractTags = (text: string): string[] => {
    const tagRegex = /#(\w+)/g;
    const matches = text.match(tagRegex);
    return matches ? matches.map((tag) => tag.substring(1).toLowerCase()) : [];
  };

  const addItem = async (
    text: string,
    type: 'capture' | 'plan' = 'capture'
  ) => {
    if (text.trim()) {
      const tags = extractTags(text);
      const newItem: Partial<DatabaseItem> = {
        content: text.trim(),
        content_type: 'text',
        item_type: type === 'plan' ? 'plan' : 'task',
        category: 'personal',
        priority: 'medium',
        energy_level: 'medium',
        mood_context: 'focused',
        status: 'active',
        is_actionable: type === 'capture',
        metadata: { tags },
        attachments: [],
        context_tags: tags,
        ai_generated: false,
      };

      try {
        if (config.enableSupabase && supabase && user) {
          // Save to Supabase with user authentication
          const itemWithUser = {
            ...newItem,
            user_id: user.id,
            created_by: user.id,
            updated_by: user.id,
          };
          
          const { data, error } = await supabase
            .from('items')
            .insert(itemWithUser)
            .select()
            .single();

          if (error) {
            console.error('Supabase insert error:', error);
            // Fallback to localStorage
            const fallbackItem: CapturedItem = {
              id: Date.now().toString(),
              content: text.trim(),
              content_type: 'text',
              item_type: type === 'plan' ? 'plan' : 'task',
              category: 'personal',
              priority: 'medium',
              energy_level: 'medium',
              mood_context: 'focused',
              status: 'active',
              is_actionable: type === 'capture',
              metadata: { tags },
              attachments: [],
              due_date: null,
              estimated_duration: null,
              context_tags: tags,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              completed_at: null,
              ai_generated: false,
              ai_confidence: null,
            };
            setItems((prev) => [fallbackItem, ...prev]);
          } else {
            // Successfully saved to Supabase
            console.log('Item saved to Supabase:', data);
            // Refresh items from database
            await loadItemsFromSupabase();
          }
        } else {
          // Supabase not available, use localStorage fallback
          const fallbackItem: CapturedItem = {
            id: Date.now().toString(),
            content: text.trim(),
            content_type: 'text',
            item_type: type === 'plan' ? 'plan' : 'task',
            category: 'personal',
            priority: 'medium',
            energy_level: 'medium',
            mood_context: 'focused',
            status: 'active',
            is_actionable: type === 'capture',
            metadata: { tags },
            attachments: [],
            due_date: null,
            estimated_duration: null,
            context_tags: tags,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            completed_at: null,
            ai_generated: false,
            ai_confidence: null,
          };
          setItems((prev) => [fallbackItem, ...prev]);
        }
      } catch (error) {
        console.error('Error adding item:', error);
        // Fallback to localStorage
        const fallbackItem: CapturedItem = {
          id: Date.now().toString(),
          content: text.trim(),
          content_type: 'text',
          item_type: type === 'plan' ? 'plan' : 'task',
          category: 'personal',
          priority: 'medium',
          energy_level: 'medium',
          mood_context: 'focused',
          status: 'active',
          is_actionable: type === 'capture',
          metadata: { tags },
          attachments: [],
          due_date: null,
          estimated_duration: null,
          context_tags: tags,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: null,
          ai_generated: false,
          ai_confidence: null,
        };
        setItems((prev) => [fallbackItem, ...prev]);
      }

      setInputText('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if this is a planning command
    const planCommands = [
      'plan my day',
      'what should i focus on',
      'plan today',
      'daily plan',
    ];
    const isPlanning = planCommands.some((cmd) =>
      inputText.toLowerCase().includes(cmd)
    );

    if (isPlanning) {
      handleDailyPlanning();
    } else {
      addItem(inputText);
    }
  };

  const handleDailyPlanning = async () => {
    if (!config.enableAI) {
      // Fallback to simple planning if AI is not available
      const incompleteItems = items.filter(
        (item) => item.status !== 'completed' && item.item_type === 'capture'
      );
    
    if (incompleteItems.length === 0) {
        addItem(
          "Great! You have a clean slate today. Consider what you'd like to accomplish.",
          'plan'
        );
      return;
    }

    const planText = `Daily Plan (${new Date().toLocaleDateString()}):

Morning:
• ${incompleteItems
        .slice(0, 2)
        .map((item) => item.content)
        .join('\n• ')}

Afternoon: 
• ${incompleteItems
        .slice(2, 4)
        .map((item) => item.content)
        .join('\n• ')}

${incompleteItems.length > 4 ? `\nRemaining items: ${incompleteItems.length - 4} tasks to schedule` : ''}`;

    addItem(planText, 'plan');
    setInputText('');
      return;
    }

    setIsPlanning(true);
    setPlanningError(null);

    try {
      const openaiClient = createOpenAIClient();
      if (!openaiClient) {
        throw new Error('OpenAI client not available');
      }

      const incompleteItems = items.filter(
        (item) => item.status !== 'completed' && item.item_type === 'capture'
      );
      const currentDate = new Date().toLocaleDateString();

      const planningRequest: PlanningRequest = {
        incompleteTasks: incompleteItems.map((item) => item.content),
        currentDate,
        userContext:
          incompleteItems.length === 0
            ? 'No incomplete tasks found'
            : undefined,
        customSystemPrompt: customSystemPrompt || undefined, // Add custom prompt
      };

      const aiPlan = await openaiClient.generateDailyPlan(planningRequest);

      // Add the AI-generated plan
      addItem(aiPlan, 'plan');
      setInputText('');
    } catch (error) {
      console.error('AI planning failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setPlanningError(`AI planning failed: ${errorMessage}`);

      // Fallback to simple planning
      const incompleteItems = items.filter(
        (item) => item.status !== 'completed' && item.item_type === 'capture'
      );
      if (incompleteItems.length > 0) {
        const fallbackPlan = `Daily Plan (${new Date().toLocaleDateString()}) - AI Unavailable:

Morning:
• ${incompleteItems
          .slice(0, 2)
          .map((item) => item.content)
          .join('\n• ')}

Afternoon: 
• ${incompleteItems
          .slice(2, 4)
          .map((item) => item.content)
          .join('\n• ')}

${incompleteItems.length > 4 ? `\nRemaining items: ${incompleteItems.length - 4} tasks to schedule` : ''}`;

        addItem(fallbackPlan, 'plan');
      }
    } finally {
      setIsPlanning(false);
    }
  };

  const toggleComplete = async (id: string) => {
    const newStatus = items.find(item => item.id === id)?.status === 'completed' ? 'active' : 'completed';
    
    // Update local state immediately for responsive UI
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );

    // Sync with Supabase if available
    if (config.enableSupabase && supabase && user) {
      try {
        const { error } = await supabase
          .from('items')
          .update({ 
            status: newStatus,
            updated_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating item in Supabase:', error);
          // Revert local state on error
          setItems((prev) =>
            prev.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: newStatus === 'completed' ? 'active' : 'completed',
                  }
                : item
            )
          );
        }
      } catch (error) {
        console.error('Error syncing with Supabase:', error);
      }
    }
  };

  const deleteItem = async (id: string) => {
    // Remove from local state immediately for responsive UI
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItems((prev) => {
      const newSelected = new Set(prev);
      newSelected.delete(id);
      return newSelected;
    });

    // Sync with Supabase if available
    if (config.enableSupabase && supabase && user) {
      try {
        const { error } = await supabase
          .from('items')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error deleting item from Supabase:', error);
          // Could add error handling UI here
        }
      } catch (error) {
        console.error('Error syncing with Supabase:', error);
      }
    }
  };

  const editItem = async (id: string, newText: string) => {
    if (newText.trim()) {
      const tags = extractTags(newText);
      const updatedItem = { 
        content: newText.trim(), 
        context_tags: tags,
        updated_at: new Date().toISOString()
      };
      
      // Update local state immediately for responsive UI
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, ...updatedItem }
            : item
        )
      );

      // Sync with Supabase if available
      if (config.enableSupabase && supabase && user) {
        try {
          const { error } = await supabase
            .from('items')
            .update({ 
              ...updatedItem,
              updated_by: user.id
            })
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) {
            console.error('Error updating item in Supabase:', error);
            // Could add error handling UI here
          }
        } catch (error) {
          console.error('Error syncing with Supabase:', error);
        }
      }
    }
    setEditingId(null);
    setEditText('');
  };

  const archiveItem = async (id: string) => {
    const newStatus = items.find(item => item.id === id)?.status === 'archived' ? 'active' : 'archived';
    
    // Update local state immediately for responsive UI
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );

    // Sync with Supabase if available
    if (config.enableSupabase && supabase && user) {
      try {
        const { error } = await supabase
          .from('items')
          .update({ 
            status: newStatus,
            updated_by: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating item in Supabase:', error);
          // Could add error handling UI here
        }
      } catch (error) {
        console.error('Error syncing with Supabase:', error);
      }
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  };

  const bulkDeleteSelected = async () => {
    const selectedIds = Array.from(selectedItems);
    if (
      selectedIds.length > 0 &&
      window.confirm(`Delete ${selectedIds.length} selected items?`)
    ) {
      // Update local state immediately for responsive UI
      setItems((prev) => prev.filter((item) => !selectedItems.has(item.id)));
      setSelectedItems(new Set());

      // Sync with Supabase if available
      if (config.enableSupabase && supabase && user) {
        try {
          const { error } = await supabase
            .from('items')
            .delete()
            .in('id', selectedIds)
            .eq('user_id', user.id);

          if (error) {
            console.error('Error bulk deleting items from Supabase:', error);
            // Could add error handling UI here
          }
        } catch (error) {
          console.error('Error syncing with Supabase:', error);
        }
      }
    }
  };

  const bulkArchiveSelected = async () => {
    const selectedIds = Array.from(selectedItems);
    if (selectedIds.length > 0) {
      // Update local state immediately for responsive UI
      setItems((prev) =>
        prev.map((item) =>
          selectedItems.has(item.id) ? { ...item, status: 'archived' } : item
        )
      );
      setSelectedItems(new Set());

      // Sync with Supabase if available
      if (config.enableSupabase && supabase && user) {
        try {
          const { error } = await supabase
            .from('items')
            .update({ 
              status: 'archived',
              updated_by: user.id,
              updated_at: new Date().toISOString()
            })
            .in('id', selectedIds)
            .eq('user_id', user.id);

          if (error) {
            console.error('Error bulk archiving items in Supabase:', error);
            // Could add error handling UI here
          }
        } catch (error) {
          console.error('Error syncing with Supabase:', error);
        }
      }
    }
  };

  const startVoiceCapture = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        (window as Record<string, unknown>).webkitSpeechRecognition ||
        (window as Record<string, unknown>).SpeechRecognition;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new (SpeechRecognition as any)();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: Record<string, unknown>) => {
        const results = event.results as Record<string, unknown>[];
        const result = results[0] as Record<string, unknown>;
        const alternative = result[0] as Record<string, unknown>;
        const transcript = alternative.transcript as string;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        alert('Voice recognition failed. Please try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Voice recognition not supported in this browser.');
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `personal-assistant-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result === 'string') {
            const importedData = JSON.parse(result);
            if (Array.isArray(importedData)) {
              const processedData = importedData.map(
                (item: Record<string, unknown>) => ({
                  id: (item.id as string) || Date.now().toString(),
                  content: (item.text || item.content || '') as string,
                  content_type: 'text',
                  item_type: item.type === 'plan' ? 'plan' : 'task',
                  category: 'personal',
                  priority: 'medium',
                  energy_level: 'medium',
                  mood_context: 'focused',
                  status: item.completed ? 'completed' : 'active',
                  is_actionable: item.type === 'capture',
                  metadata: { tags: item.tags || [] },
                  attachments: [],
                  due_date: null,
                  estimated_duration: null,
                  context_tags: (item.tags || []) as string[],
                  created_at: item.timestamp
                    ? new Date(item.timestamp as string).toISOString()
                    : new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  completed_at: item.completed
                    ? new Date().toISOString()
                    : null,
                  ai_generated: false,
                  ai_confidence: null,
                })
              ) as CapturedItem[];

              if (
                window.confirm(
                  `Import ${processedData.length} items? This will merge with existing data.`
                )
              ) {
                setItems((prev) => [...processedData, ...prev]);
              }
            }
          }
        } catch {
          alert('Error importing file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Enhanced filtering with search, tags, and status
  const filteredItems = items.filter((item) => {
    // Status filter
    if (
      filterStatus === 'active' &&
      (item.status === 'completed' || item.status === 'archived')
    )
      return false;
    if (filterStatus === 'completed' && item.status !== 'completed')
      return false;
    if (filterStatus === 'archived' && item.status !== 'archived') return false;

    // Search filter (text + tags)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const textMatch = item.content.toLowerCase().includes(searchLower);
      const tagMatch = item.context_tags.some((tag) =>
        tag.includes(searchLower)
      );
      return textMatch || tagMatch;
    }

    return true;
  });

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-text">
        <h1>Personal Assistant</h1>
        <p>Capture thoughts, get daily plans</p>
          </div>
          <div className="header-actions">
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Custom System Prompt Section */}
      <div className="prompt-section">
        <button
          onClick={() => setShowPromptEditor(!showPromptEditor)}
          className="prompt-toggle-btn"
        >
          {showPromptEditor ? 'Hide' : 'Customize'} AI Assistant
        </button>

        {customSystemPrompt && !showPromptEditor && (
          <p className="prompt-preview">
            Current prompt: {customSystemPrompt.substring(0, 100)}...
          </p>
        )}

        {showPromptEditor && (
          <div className="prompt-editor">
            <h3>Customize AI Assistant Behavior</h3>
            <p className="prompt-description">
              Customize how your AI assistant responds and plans your day. Be
              specific about your preferences, style, and priorities.
            </p>
            <textarea
              value={customSystemPrompt}
              onChange={(e) => setCustomSystemPrompt(e.target.value)}
              placeholder={`Enter custom instructions for your AI assistant...

Examples:
- Focus on productivity and time management
- Prioritize health and wellness tasks
- Use a more casual, friendly tone
- Include specific time blocks for different activities
- Consider my energy levels throughout the day
- Be more detailed in task breakdown`}
              className="prompt-textarea"
              rows={8}
            />
            <div className="prompt-actions">
              <button
                onClick={() => saveCustomSystemPrompt(customSystemPrompt)}
                className="save-prompt-btn"
              >
                Save & Apply
              </button>
              <button
                onClick={() => setShowPromptEditor(false)}
                className="cancel-prompt-btn"
              >
                Cancel
              </button>
              <button
                onClick={() => setCustomSystemPrompt('')}
                className="clear-prompt-btn"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="input-section">
        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-group">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Capture anything... try #tags or 'plan my day'"
              className="text-input"
            />
            <button
              type="button"
              onClick={startVoiceCapture}
              disabled={isListening}
              className={`voice-btn ${isListening ? 'listening' : ''}`}
              aria-label="Voice input"
            >
              🎤
            </button>
            <button type="submit" className="submit-btn">
              Add
            </button>
          </div>
        </form>

        {isListening && (
          <div className="listening-indicator">🔴 Listening... speak now</div>
        )}

        {isPlanning && (
          <div className="planning-indicator">
            🤖 AI is planning your day... please wait
          </div>
        )}

        {planningError && (
          <div className="planning-error">
            ⚠️ {planningError}
            <button
              onClick={() => setPlanningError(null)}
              className="error-dismiss"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div className="controls">
        <div className="search-controls">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items and tags..."
          className="search-input"
        />
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(
                e.target.value as 'all' | 'active' | 'completed' | 'archived'
              )
            }
            className="filter-select"
          >
            <option value="all">All Items</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="bulk-controls">
          {selectedItems.size > 0 && (
            <>
              <button onClick={bulkDeleteSelected} className="bulk-delete-btn">
                Delete Selected ({selectedItems.size})
              </button>
              <button
                onClick={bulkArchiveSelected}
                className="bulk-archive-btn"
              >
                Archive Selected ({selectedItems.size})
              </button>
            </>
          )}
        </div>

        <div className="data-controls">
        <button onClick={exportData} className="export-btn">
          Export Data
        </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={importData}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="import-btn"
          >
            Import Data
          </button>
        </div>
      </div>

      <div className="items-container">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <p>No items found. Start by capturing your first thought!</p>
          </div>
        ) : (
          <div className="items-list">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`item ${item.status === 'completed' ? 'completed' : ''} ${item.status === 'archived' ? 'archived' : ''} ${item.item_type} ${selectedItems.has(item.id) ? 'selected' : ''}`}
              >
                <div className="item-header">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                    className="item-checkbox"
                  />
                <div className="item-content">
                    {editingId === item.id ? (
                      <div className="item-edit">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              editItem(item.id, editText);
                            } else if (e.key === 'Escape') {
                              setEditingId(null);
                              setEditText('');
                            }
                          }}
                          onBlur={() => {
                            editItem(item.id, editText);
                          }}
                          autoFocus
                          className="edit-input"
                        />
                      </div>
                    ) : (
                      <div className="item-display">
                        <div className="item-text">
                          {item.item_type === 'plan' ? (
                            <pre className="plan-text">{item.content}</pre>
                          ) : (
                            <span>
                              {item.content
                                .split(/(#\w+)/g)
                                .map((part, index) =>
                                  part.startsWith('#') ? (
                                    <span key={index} className="tag-inline">
                                      {part}
                                    </span>
                                  ) : (
                                    part
                                  )
                                )}
                            </span>
                          )}
                        </div>
                        {item.context_tags.length > 0 && (
                          <div className="item-tags">
                            {item.context_tags.map((tag) => (
                              <span key={tag} className="tag">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                  <div className="item-meta">
                    <div className="meta-info">
                      <span className="timestamp">
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                      <span className={`type-badge ${item.item_type}`}>
                        {item.item_type}
                      </span>
                      {item.status === 'archived' && (
                        <span className="archived-badge">archived</span>
                      )}
                    </div>

                    <div className="item-actions">
                      {item.item_type === 'capture' &&
                        item.status !== 'archived' && (
                          <button
                            onClick={() => toggleComplete(item.id)}
                            className="complete-btn"
                            title={
                              item.status === 'completed'
                                ? 'Mark incomplete'
                                : 'Mark complete'
                            }
                          >
                            {item.status === 'completed' ? '↺' : '✓'}
                          </button>
                        )}
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setEditText(item.content);
                        }}
                        className="edit-btn"
                        title="Edit item"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => archiveItem(item.id)}
                        className="archive-btn"
                        title={
                          item.status === 'archived' ? 'Unarchive' : 'Archive'
                        }
                      >
                        {item.status === 'archived' ? '📤' : '📦'}
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="delete-btn"
                        title="Delete item"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      <div className="stats">
        <p>
          Total: {items.length} | Active:{' '}
          {
            items.filter(
              (i) =>
                i.status !== 'completed' &&
                i.status !== 'archived' &&
                i.item_type === 'capture'
            ).length
          }{' '}
          | Completed: {items.filter((i) => i.status === 'completed').length} |
          Archived: {items.filter((i) => i.status === 'archived').length}
          {selectedItems.size > 0 && ` | Selected: ${selectedItems.size}`}
        </p>
      </div>
    </div>
  );
}

// Main App Component with Authentication Provider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
