import { generateDailyPlan as apiGenerateDailyPlan } from '../utils/api';

export interface PlanningRequest {
  incompleteTasks: string[];
  currentDate: string;
  currentTime: string;
  userContext?: string;
  customSystemPrompt?: string;
}

export interface PlanningResponse {
  success: boolean;
  plan?: string;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIClient {
  async generateDailyPlan(request: PlanningRequest): Promise<string> {
    try {
      const result: PlanningResponse = await apiGenerateDailyPlan(request);
      
      if (result.success && result.plan) {
        // Log usage information if available
        if (result.usage) {
          console.log('OpenAI API usage:', result.usage);
        }
        return result.plan;
      } else {
        throw new Error(result.error || 'Backend returned error');
      }
    } catch (error) {
      console.error('Backend API error:', error);
      
      if (error instanceof Error) {
        throw new Error(`Backend error: ${error.message}`);
      }
      
      throw new Error('Unknown error occurred while calling backend');
    }
  }
}

export function createOpenAIClient(): OpenAIClient | null {
  // Always return client since backend handles OpenAI
  return new OpenAIClient();
}
