# Personal Assistant Backend

Secure backend proxy for OpenAI API calls deployed as Vercel serverless functions. This service handles all AI planning requests server-side, keeping your OpenAI API key secure.

## 🚀 Features

- **Secure OpenAI Integration**: API key never exposed to frontend
- **Vercel Serverless**: Auto-scaling, zero maintenance infrastructure
- **Rate Limiting**: Prevents abuse and controls costs
- **Request Validation**: Ensures data integrity
- **CORS Configuration**: Secure cross-origin requests
- **Security Headers**: Protection against common vulnerabilities
- **Request Logging**: Monitor usage and debug issues

## 🛠️ Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy `env.example` to `.env` and configure:
```bash
cp env.example .env
```

Required environment variables:
- `OPENAI_API_KEY`: Your OpenAI API key (never expose to frontend)
- `CORS_ORIGIN`: Frontend origin (default: http://localhost:5173)
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per window (default: 100)
- `RATE_LIMIT_WINDOW_MS`: Rate limit window in milliseconds (default: 900000)

### 3. Local Development
```bash
npm run dev
```

### 4. Production Deployment
Follow **VERCEL_DEPLOYMENT.md** for detailed deployment instructions.

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Daily Planning
```
POST /api/openai/plan
```

**Request Body:**
```json
{
  "incompleteTasks": ["Task 1", "Task 2"],
  "currentDate": "2024-01-15",
  "currentTime": "14:30",
  "userContext": "Optional context",
  "customSystemPrompt": "Optional custom prompt"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "plan": "Your daily plan...",
    "usage": {
      "prompt_tokens": 150,
      "completion_tokens": 200,
      "total_tokens": 350
    }
  },
  "message": "Plan generated successfully",
  "timestamp": "2024-01-15T14:30:00.000Z"
}
```

## 🔒 Security Features

- **API Key Protection**: OpenAI key only accessible server-side
- **Rate Limiting**: 100 requests per 15 minutes per IP (configurable)
- **Input Validation**: Request data sanitization
- **CORS Protection**: Controlled cross-origin access
- **Security Headers**: Protection against common vulnerabilities
- **Error Handling**: No sensitive data exposure

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Vercel Production
```bash
# Deploy to Vercel
vercel --prod

# Environment variables are set in Vercel dashboard
```

### Environment Variables
Ensure these are set in Vercel production:
- `NODE_ENV=production`
- `OPENAI_API_KEY=your_key_here`
- `CORS_ORIGIN=https://yourdomain.com`
- `RATE_LIMIT_MAX_REQUESTS=100`
- `RATE_LIMIT_WINDOW_MS=900000`

## 📊 Monitoring

The service logs:
- All API requests with response times
- OpenAI API usage (token counts)
- Validation errors
- Rate limit violations

## 🔧 Configuration

### Rate Limiting
- Window: 15 minutes (configurable via `RATE_LIMIT_WINDOW_MS`)
- Max requests: 100 per window (configurable via `RATE_LIMIT_MAX_REQUESTS`)

### CORS
- Origin: Configurable via `CORS_ORIGIN`
- Credentials: Enabled
- Methods: GET, POST, OPTIONS

## 🚨 Error Handling

All errors return consistent JSON responses:
```json
{
  "success": false,
  "error": "Error message",
  "details": {}, // Optional additional details
  "timestamp": "2024-01-15T14:30:00.000Z"
}
```

## 📝 Development

### Project Structure
```
backend/
├── api/                   # Vercel API routes (production)
│   ├── health.js         # Health check endpoint
│   ├── index.js          # Main API handler
│   ├── _utils.js         # Shared utilities
│   └── openai/
│       └── plan.js       # AI planning endpoint
├── src/                   # TypeScript source (local development)
│   ├── server.ts         # Main server
│   ├── routes.ts         # API routes
│   ├── openai-service.ts # OpenAI integration
│   ├── middleware.ts     # Security & validation
│   └── types.ts          # TypeScript types
├── dist/                  # Compiled output (local builds)
├── vercel.json            # Vercel configuration
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Endpoints
1. Add route in `src/routes.ts` (for local development)
2. Create corresponding file in `api/` directory (for Vercel)
3. Add validation in `src/middleware.ts`
4. Update types in `src/types.ts`
5. Test with appropriate validation

## 🔍 Troubleshooting

### Common Issues
1. **CORS errors**: Check `CORS_ORIGIN` in environment variables
2. **Rate limiting**: Check request frequency and limits
3. **OpenAI errors**: Verify API key and quota
4. **Validation errors**: Check request body format
5. **Vercel deployment issues**: Check build logs and configuration

### Debug Mode
Set `NODE_ENV=development` for detailed error messages.

### Vercel Dashboard
- Check Functions tab for deployed endpoints
- Review build logs for deployment issues
- Monitor function execution and performance
- Set environment variables in project settings

## 🔄 Local vs Production

### **Local Development**
- Uses `src/` TypeScript files
- Runs on local port (default: 3001)
- Hot reloading with `ts-node-dev`
- Direct environment variable access

### **Vercel Production**
- Uses `api/` JavaScript files
- Serverless function execution
- Environment variables from Vercel dashboard
- Auto-scaling based on demand

## 📚 Related Documentation

- **VERCEL_DEPLOYMENT.md**: Detailed deployment guide
- **Main README.md**: Frontend setup and integration
- **SUPABASE_SETUP_GUIDE.md**: Database configuration
