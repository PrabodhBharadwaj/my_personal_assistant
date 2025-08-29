// Example API usage patterns
// This file demonstrates how to use the centralized API utilities

import { checkBackendHealth, generateDailyPlan, getApiInfo } from '../utils/api';

// Example 1: Health check
export async function exampleHealthCheck() {
  try {
    const health = await checkBackendHealth();
    console.log('Backend is healthy:', health);
    return health;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}

// Example 2: Generate daily plan
export async function exampleDailyPlanning() {
  try {
    const plan = await generateDailyPlan({
      incompleteTasks: ['Review code', 'Write documentation', 'Team meeting'],
      currentDate: '2025-08-29',
      currentTime: '15:30',
      userContext: 'Working on personal assistant project'
    });
    console.log('Daily plan generated:', plan);
    return plan;
  } catch (error) {
    console.error('Daily planning failed:', error);
    throw error;
  }
}

// Example 3: Get API information
export async function exampleApiInfo() {
  try {
    const info = await getApiInfo();
    console.log('API information:', info);
    return info;
  } catch (error) {
    console.error('API info failed:', error);
    throw error;
  }
}

// Example 4: Using the API_BASE directly (if needed)
export function getApiBaseUrl() {
  const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  return API_BASE;
}

// Example 5: Custom API call
export async function customApiCall(endpoint: string, options: RequestInit = {}) {
  const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
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
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
}

// Usage examples:
// 
// // In your component or hook:
// import { exampleHealthCheck, exampleDailyPlanning } from '../examples/api-usage';
// 
// // Health check
// exampleHealthCheck()
//   .then(health => console.log('Backend status:', health))
//   .catch(error => console.error('Backend unavailable:', error));
// 
// // Daily planning
// exampleDailyPlanning()
//   .then(plan => console.log('Your plan:', plan))
//   .catch(error => console.error('Planning failed:', error));
