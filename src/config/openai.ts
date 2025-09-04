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
  message?: string;
  data?: {
    plan: {
      plannedTasks: Array<{
        task: string;
        time?: string;
        timeSlot?: string;
        duration?: string;
      }>;
      recommendations: string[];
      estimatedDuration: string;
      rawResponse?: string;
    };
    inputTasks: string[];
    generatedAt: string;
  };
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
      
      if (result.success && result.data?.plan) {
        // Log usage information if available
        if (result.usage) {
          console.log('OpenAI API usage:', result.usage);
        }
        
        // Convert structured plan to readable string format
        const plan = result.data.plan;
        let planText = `📅 Daily Plan (${new Date().toLocaleDateString()})\n\n`;
        
        // Add planned tasks
        if (plan.plannedTasks && plan.plannedTasks.length > 0) {
          planText += '📋 Planned Tasks:\n';
          plan.plannedTasks.forEach((task, index) => {
            const time = task.time || task.timeSlot || `${9 + index}:00 AM`;
            planText += `• ${time}: ${task.task}\n`;
          });
          planText += '\n';
        }
        
        // Add recommendations
        if (plan.recommendations && plan.recommendations.length > 0) {
          planText += '💡 Recommendations:\n';
          plan.recommendations.forEach(rec => {
            planText += `• ${rec}\n`;
          });
          planText += '\n';
        }
        
        // Add estimated duration
        if (plan.estimatedDuration) {
          planText += `⏱️ Estimated Duration: ${plan.estimatedDuration}\n`;
        }
        
        // Add raw response if available (fallback)
        if (plan.rawResponse && !plan.plannedTasks?.length) {
          planText += `\n📝 AI Response:\n${plan.rawResponse}`;
        }
        
        return planText;
      } else {
        throw new Error(result.error || result.message || 'Backend returned error');
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
