# 🚀 Vercel Backend Deployment Guide

This guide explains how to deploy your Personal Assistant Backend to Vercel.

## 🔧 What Was Fixed

The original error occurred because Vercel couldn't find a valid entry point. We've restructured the backend to use Vercel's preferred API routes structure.

## 📁 New Structure for Vercel

```
backend/
├── api/                    # Vercel API routes
│   ├── index.js           # Main API entry point
│   └── openai/
│       └── plan.js        # OpenAI planning endpoint
├── vercel.json            # Vercel configuration
├── package.json           # Dependencies and scripts
└── src/                   # Original TypeScript source (for local dev)
```

## 🚀 Deployment Steps

### 1. **Install Vercel CLI** (if not already installed)
```bash
npm i -g vercel
```

### 2. **Login to Vercel**
```bash
vercel login
```

### 3. **Deploy from Backend Directory**
```bash
cd backend
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
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
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

## 🛡️ Security Features

- ✅ **API Key Protection**: OpenAI key only accessible server-side
- ✅ **Rate Limiting**: 100 requests per 15 minutes per IP
- ✅ **CORS Protection**: Controlled cross-origin access
- ✅ **Input Validation**: Request data sanitization
- ✅ **Security Headers**: Helmet.js protection

## 🔄 Local Development vs Production

### **Local Development**
```bash
# Use the original TypeScript setup
npm run dev
npm run dev:bg
```

### **Vercel Production**
```bash
# Deploy to Vercel
vercel --prod

# Environment variables are set in Vercel dashboard
```

## 🚨 Troubleshooting

### **Build Still Failing**
1. **Check vercel.json**: Ensure it points to `api/**/*.js`
2. **Verify API structure**: Ensure `api/index.js` exists
3. **Check package.json**: Ensure all dependencies are listed

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
- **Functions**: Monitor API performance
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
- ✅ **Health endpoint responds** with status 200
- ✅ **Planning endpoint accepts** POST requests
- ✅ **Environment variables** are properly set
- ✅ **CORS works** from your frontend domain

## 🎯 Next Steps

1. **Deploy to Vercel** using the steps above
2. **Test all endpoints** to ensure they work
3. **Update frontend** with new backend URL
4. **Monitor performance** in Vercel dashboard
5. **Set up custom domain** if needed

---

**Your backend is now structured for Vercel deployment and should build successfully! 🚀**
