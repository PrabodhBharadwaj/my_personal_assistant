export interface PlanningRequest {
  incompleteTasks: string[];
  currentDate: string;
  currentTime: string;
  userContext?: string;
  customSystemPrompt?: string;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
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

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}
