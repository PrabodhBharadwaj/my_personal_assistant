// Centralized API configuration and utilities
// This file provides a consistent way to make API calls to the backend

// Use relative URLs for Vercel API routes (same domain)
// Override any VITE_BACKEND_URL environment variable to force relative URLs
const API_BASE = '';

// API endpoint paths
export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  PLAN: '/api/openai/plan',
  API_INFO: '/api',
} as const;

// Generic API call function
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
}

// Health check function
export async function checkBackendHealth() {
  return apiCall(API_ENDPOINTS.HEALTH);
}

// Daily planning function
export async function generateDailyPlan(request: {
  incompleteTasks: string[];
  currentDate: string;
  currentTime: string;
  userContext?: string;
  customSystemPrompt?: string;
}) {
  return apiCall(API_ENDPOINTS.PLAN, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// Get API information
export async function getApiInfo() {
  return apiCall(API_ENDPOINTS.API_INFO);
}

// Example usage:
// import { checkBackendHealth, generateDailyPlan } from '../utils/api';
// 
// // Health check
// checkBackendHealth()
//   .then(data => console.log('Backend health:', data))
//   .catch(error => console.error('Health check failed:', error));
// 
// // Generate plan
// generateDailyPlan({
//   incompleteTasks: ['Task 1', 'Task 2'],
//   currentDate: '2025-08-29',
//   currentTime: '15:30'
// })
//   .then(data => console.log('Plan generated:', data))
//   .catch(error => console.error('Plan generation failed:', error));
