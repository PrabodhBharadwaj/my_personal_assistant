// Entry point for Vercel deployment
// This file serves as a bridge to the TypeScript server

const { spawn } = require('child_process');
const path = require('path');

// Check if we're in development or production
if (process.env.NODE_ENV === 'production') {
  // In production, run the built JavaScript
  require('./dist/server.js');
} else {
  // In development, run TypeScript directly
  const tsNode = spawn('npx', ['ts-node', 'src/server.ts'], {
    stdio: 'inherit',
    shell: true
  });
  
  tsNode.on('error', (error) => {
    console.error('Failed to start development server:', error);
    process.exit(1);
  });
}
