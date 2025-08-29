import OpenAI from 'openai';
import { PlanningRequest, PlanningResponse } from './types';

import { OPENAI_API_KEY } from './config/environment';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: OPENAI_API_KEY,
      dangerouslyAllowBrowser: false, // Ensure this is never true
    });
  }

  async generateDailyPlan(request: PlanningRequest): Promise<PlanningResponse> {
    try {
      const prompt = this.buildPlanningPrompt(request);
      
      const systemPrompt = request.customSystemPrompt || 
        'You are a helpful personal productivity assistant. Your job is to create actionable, structured daily plans based on the user\'s ACTUAL logged tasks and items. CRITICAL: You MUST use and reference the specific tasks the user has logged. Do not suggest generic activities like "exercise" or "read" unless they are explicitly in the user\'s task list. Consider the current time when planning - if it\'s already afternoon, don\'t suggest morning activities. Be specific and actionable, referencing the exact tasks the user has captured. If the user has no tasks, only then suggest general productivity tips.';

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const plan = response.choices[0]?.message?.content;
      
      if (!plan) {
        return {
          success: false,
          error: 'No plan generated from OpenAI',
        };
      }

      return {
        success: true,
        plan,
        usage: {
          prompt_tokens: response.usage?.prompt_tokens || 0,
          completion_tokens: response.usage?.completion_tokens || 0,
          total_tokens: response.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      
      if (error instanceof Error) {
        return {
          success: false,
          error: `OpenAI API error: ${error.message}`,
        };
      }
      
      return {
        success: false,
        error: 'Unknown error occurred while generating plan',
      };
    }
  }

  private buildPlanningPrompt(request: PlanningRequest): string {
    const { incompleteTasks, currentDate, currentTime, userContext } = request;

    let prompt = `Create a structured daily plan for ${currentDate} starting from ${currentTime} based on these incomplete tasks:\n\n`;

    if (incompleteTasks.length === 0) {
      prompt += 'No incomplete tasks found. Since you have no specific tasks, suggest a productive day structure with general productivity tips that makes sense for the current time.';
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

    prompt += '\n\nProvide the plan in a clear, actionable format that directly references your logged tasks. Be specific about which tasks go where and when.';

    return prompt;
  }
}
