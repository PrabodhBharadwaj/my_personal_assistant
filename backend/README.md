# Personal Assistant Backend

Secure backend proxy for OpenAI API calls. This service handles all AI planning requests server-side, keeping your OpenAI API key secure.

## 🚀 Features

- **Secure OpenAI Integration**: API key never exposed to frontend
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
- `PORT`: Server port (default: 3001)
- `CORS_ORIGIN`: Frontend origin (default: http://localhost:5173)

### 3. Development
```bash
npm run dev
```

### 4. Production Build
```bash
npm run build
npm start
```

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
  "plan": "Your daily plan...",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 200,
    "total_tokens": 350
  }
}
```

## 🔒 Security Features

- **API Key Protection**: OpenAI key only accessible server-side
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Request data sanitization
- **CORS Protection**: Controlled cross-origin access
- **Security Headers**: Helmet.js protection
- **Error Handling**: No sensitive data exposure

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Environment Variables
Ensure these are set in production:
- `NODE_ENV=production`
- `OPENAI_API_KEY=your_key_here`
- `CORS_ORIGIN=https://yourdomain.com`

## 📊 Monitoring

The service logs:
- All API requests with response times
- OpenAI API usage (token counts)
- Validation errors
- Rate limit violations

## 🔧 Configuration

### Rate Limiting
- Window: 15 minutes (configurable)
- Max requests: 100 per window (configurable)

### CORS
- Origin: Configurable via `CORS_ORIGIN`
- Credentials: Enabled
- Methods: GET, POST

## 🚨 Error Handling

All errors return consistent JSON responses:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE" // Optional
}
```

## 📝 Development

### Project Structure
```
backend/
├── src/
│   ├── server.ts          # Main server
│   ├── routes.ts          # API routes
│   ├── openai-service.ts  # OpenAI integration
│   ├── middleware.ts      # Security & validation
│   └── types.ts           # TypeScript types
├── dist/                  # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

### Adding New Endpoints
1. Add route in `routes.ts`
2. Add validation in `middleware.ts`
3. Update types in `types.ts`
4. Test with appropriate validation

## 🔍 Troubleshooting

### Common Issues
1. **CORS errors**: Check `CORS_ORIGIN` in `.env`
2. **Rate limiting**: Check request frequency
3. **OpenAI errors**: Verify API key and quota
4. **Validation errors**: Check request body format

### Debug Mode
Set `NODE_ENV=development` for detailed error messages.
