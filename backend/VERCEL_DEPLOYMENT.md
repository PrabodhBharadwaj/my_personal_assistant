# 🚀 Vercel Backend Deployment Guide

This guide explains how to deploy your Personal Assistant Backend to Vercel as serverless functions.

## 🔧 Current Structure

The backend is now properly structured for Vercel deployment using the API Routes pattern:

```
backend/
├── api/                    # Vercel API routes (production)
│   ├── health.js          # Health check endpoint
│   ├── index.js           # Main API handler (fallback)
│   ├── _utils.js          # Shared utilities
│   └── openai/
│       └── plan.js        # AI planning endpoint
├── vercel.json            # Vercel configuration
├── package.json           # Dependencies and scripts
└── src/                   # TypeScript source (for local development)
```

## 🚀 Deployment Steps

### 1. **Install Vercel CLI** (if not already installed)
```bash
npm i vercel
```

### 2. **Login to Vercel**
```bash
vercel login
```

### 3. **Deploy from Project Root**
```bash
# Deploy from the main project directory (not from backend/)
vercel
```

### 4. **Set Environment Variables**
In your Vercel dashboard:
- Go to your project settings
- Navigate to "Environment Variables"
- Add these variables:

```bash
OPENAI_API_KEY=sk-your-actual-openai-key-here
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### 5. **Redeploy After Environment Variables**
```bash
vercel --prod
```

## 🔍 API Endpoints

### **Health Check**
```
GET https://your-vercel-domain.vercel.app/api/health
```

### **OpenAI Planning**
```
POST https://your-vercel-domain.vercel.app/api/openai/plan
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

### **API Fallback**
```
GET https://your-vercel-domain.vercel.app/api
```
Returns API information and available endpoints.

## 🛡️ Security Features

- ✅ **API Key Protection**: OpenAI key only accessible server-side
- ✅ **Rate Limiting**: 100 requests per 15 minutes per IP (configurable)
- ✅ **CORS Protection**: Controlled cross-origin access
- ✅ **Input Validation**: Request data sanitization
- ✅ **Security Headers**: Protection against common vulnerabilities

## 🔄 Local Development vs Production

### **Local Development**
```bash
# Use the original TypeScript setup
cd backend
npm run dev
npm run dev:bg
```

### **Vercel Production**
```bash
# Deploy to Vercel from project root
vercel --prod

# Environment variables are set in Vercel dashboard
```

## 🚨 Troubleshooting

### **Functions Tab Missing**
If you don't see the Functions tab in Vercel dashboard:
1. **Check Root Directory**: Should be set to `.` (single dot) in project settings
2. **Check Framework Preset**: Should be set to "Other"
3. **Check Build Command**: Should be set to `echo "No build needed"`
4. **Check Output Directory**: Should be empty

### **404 Errors After Deployment**
1. **Verify vercel.json**: Ensure it's in the correct location
2. **Check API structure**: Ensure all files are in `api/` directory
3. **Verify deployment**: Check build logs for success
4. **Test endpoints**: Use Postman or curl to test

### **Environment Variables Not Working**
1. **Set in Vercel Dashboard**: Project → Settings → Environment Variables
2. **Redeploy**: `vercel --prod`
3. **Check API logs**: Vercel dashboard → Functions → Logs

### **CORS Issues**
1. **Update CORS_ORIGIN**: Set to your frontend domain
2. **Include protocol**: Use `https://yourdomain.com` not just `yourdomain.com`
3. **Redeploy**: After changing environment variables

## 📊 Monitoring

### **Vercel Dashboard**
- **Functions**: Monitor API performance (should appear after successful deployment)
- **Logs**: View request/response logs
- **Analytics**: Track usage and errors

### **Health Check**
```bash
curl https://your-vercel-domain.vercel.app/api/health
```

## 🔄 Updating Frontend

After successful deployment, update your frontend `.env`:

```bash
VITE_BACKEND_URL=https://your-vercel-domain.vercel.app
```

## ✅ Success Indicators

- ✅ **Build succeeds** in Vercel dashboard
- ✅ **Functions tab appears** in Vercel dashboard
- ✅ **Health endpoint responds** with status 200
- ✅ **Planning endpoint accepts** POST requests
- ✅ **Environment variables** are properly set
- ✅ **CORS works** from your frontend domain

## 🎯 Next Steps

1. **Deploy to Vercel** using the steps above
2. **Verify Functions tab** appears in dashboard
3. **Test all endpoints** to ensure they work
4. **Update frontend** with new backend URL
5. **Monitor performance** in Vercel dashboard
6. **Set up custom domain** if needed

## 🔍 Debugging Deployment Issues

### **Check vercel.json Location**
Ensure `vercel.json` is in the `backend/` directory, not in `backend/src/`.

### **Verify API Directory Structure**
All serverless functions must be in the `api/` directory:
- `api/health.js` ✅
- `api/index.js` ✅
- `api/openai/plan.js` ✅

### **Check Package.json Scripts**
Ensure no conflicting build scripts:
```json
{
  "scripts": {
    "build:local": "tsc",
    "vercel-build": "echo 'No build needed for Vercel serverless functions'"
  }
}
```

---

**Your backend is now properly structured for Vercel deployment and should work correctly! 🚀**
