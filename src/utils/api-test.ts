// API test utilities for development and debugging
// This file demonstrates how to use the new centralized API utilities

import { checkBackendHealth, generateDailyPlan, getApiInfo } from './api';

// Test backend health
export async function testBackendHealth() {
  console.log('🧪 Testing backend health...');
  try {
    const health = await checkBackendHealth();
    console.log('✅ Backend health check successful:', health);
    return health;
  } catch (error) {
    console.error('❌ Backend health check failed:', error);
    throw error;
  }
}

// Test daily planning
export async function testDailyPlanning() {
  console.log('🧪 Testing daily planning...');
  try {
    const plan = await generateDailyPlan({
      incompleteTasks: ['Test task 1', 'Test task 2'],
      currentDate: new Date().toISOString().split('T')[0],
      currentTime: new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      userContext: 'Testing the API integration'
    });
    console.log('✅ Daily planning successful:', plan);
    return plan;
  } catch (error) {
    console.error('❌ Daily planning failed:', error);
    throw error;
  }
}

// Test API information
export async function testApiInfo() {
  console.log('🧪 Testing API info...');
  try {
    const info = await getApiInfo();
    console.log('✅ API info retrieved:', info);
    return info;
  } catch (error) {
    console.error('❌ API info failed:', error);
    throw error;
  }
}

// Run all tests
export async function runAllApiTests() {
  console.log('🚀 Running all API tests...');
  
  try {
    await testBackendHealth();
    await testApiInfo();
    await testDailyPlanning();
    console.log('🎉 All API tests passed!');
  } catch (error) {
    console.error('💥 Some API tests failed:', error);
  }
}

// Example usage in browser console:
// import { runAllApiTests } from './utils/api-test';
// runAllApiTests();
