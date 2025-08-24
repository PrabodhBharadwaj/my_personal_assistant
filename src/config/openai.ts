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
        'You are a helpful personal productivity assistant. Create actionable, structured daily plans based on incomplete tasks and user context.';

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
    const { incompleteTasks, currentDate, userContext } = request;

    let prompt = `Create a structured daily plan for ${currentDate} based on these incomplete tasks:\n\n`;

    if (incompleteTasks.length === 0) {
      prompt +=
        'No incomplete tasks found. Suggest a productive day structure with general productivity tips.';
    } else {
      prompt += incompleteTasks
        .map((task, index) => `${index + 1}. ${task}`)
        .join('\n');
      prompt += '\n\nOrganize these into a realistic daily schedule with:';
      prompt += '\n- Morning priorities (most important tasks)';
      prompt += '\n- Afternoon focus areas';
      prompt += '\n- Evening wrap-up items';
      prompt += '\n- Time estimates for each section';
    }

    if (userContext) {
      prompt += `\n\nAdditional context: ${userContext}`;
    }

    prompt +=
      '\n\nProvide the plan in a clear, actionable format that can be easily followed.';

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
