export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface PlanningRequest {
  incompleteTasks: string[];
  currentDate: string;
  currentTime: string; // Add current time for context-aware planning
  userContext?: string;
  customSystemPrompt?: string; // Add custom system prompt support
}

export class OpenAIClient {
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateDailyPlan(request: PlanningRequest): Promise<string> {
    try {
      const prompt = this.buildPlanningPrompt(request);

      // Use custom system prompt if provided, otherwise use default
      const systemPrompt =
        request.customSystemPrompt ||
        'You are a helpful personal productivity assistant. Your job is to create actionable, structured daily plans based on the user\'s ACTUAL logged tasks and items. CRITICAL: You MUST use and reference the specific tasks the user has logged. Do not suggest generic activities like "exercise" or "read" unless they are explicitly in the user\'s task list. Consider the current time when planning - if it\'s already afternoon, don\'t suggest morning activities. Be specific and actionable, referencing the exact tasks the user has captured. If the user has no tasks, only then suggest general productivity tips.';

      console.log(
        'Using system prompt:',
        systemPrompt.substring(0, 100) + '...'
      );

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Using cheaper model for cost control
          messages: [
            {
              role: 'system',
              content: systemPrompt, // Use custom or default system prompt
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText}`
        );
      }

      const data: OpenAIResponse = await response.json();
      return data.choices[0]?.message?.content || 'Unable to generate plan';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  private buildPlanningPrompt(request: PlanningRequest): string {
    const { incompleteTasks, currentDate, currentTime, userContext } = request;

    let prompt = `Create a structured daily plan for ${currentDate} starting from ${currentTime} based on these incomplete tasks:\n\n`;

    if (incompleteTasks.length === 0) {
      prompt +=
        'No incomplete tasks found. Since you have no specific tasks, suggest a productive day structure with general productivity tips that makes sense for the current time.';
    } else {
      prompt += `You have ${incompleteTasks.length} incomplete tasks to work with:\n`;
      prompt += incompleteTasks
        .map((task, index) => `${index + 1}. ${task}`)
        .join('\n');
      
      prompt += '\n\nIMPORTANT: Your plan MUST use and reference these specific tasks. Do not suggest generic activities.';
      prompt += '\n\nOrganize these into a realistic daily schedule starting from the current time:';
      
      // Time-aware planning based on current time
      const currentHour = parseInt(currentTime.split(':')[0]);
      if (currentHour < 12) {
        prompt += '\n- Morning priorities (most important tasks from your list)';
        prompt += '\n- Afternoon focus areas (remaining tasks)';
        prompt += '\n- Evening wrap-up items';
      } else if (currentHour < 17) {
        prompt += '\n- Afternoon priorities (focus on your incomplete tasks)';
        prompt += '\n- Evening wrap-up items';
      } else {
        prompt += '\n- Evening focus (what you can realistically accomplish)';
        prompt += '\n- Tomorrow preparation';
      }
      
      prompt += '\n- Time estimates for each section';
      prompt += '\n- Specific task assignments to each time block';
    }

    if (userContext) {
      prompt += `\n\nAdditional context: ${userContext}`;
    }

    prompt +=
      '\n\nProvide the plan in a clear, actionable format that directly references your logged tasks. Be specific about which tasks go where and when.';

    return prompt;
  }
}

export function createOpenAIClient(): OpenAIClient | null {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    console.warn(
      'OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file.'
    );
    return null;
  }

  return new OpenAIClient(apiKey);
}
