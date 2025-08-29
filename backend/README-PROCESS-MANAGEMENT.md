# 🔧 Backend Process Management Guide

This guide explains how to use the robust process management system for the Personal Assistant Backend server.

## 🚀 Quick Start

### **Development Mode (Background)**
```bash
# Start development server in background with auto-restart
npm run dev:bg

# Check status
npm run status

# View logs
npm run logs

# Follow logs in real-time
npm run logs:tail
```

### **Production Mode (Background)**
```bash
# Build and start production server in background
npm run start:bg

# Check status
npm run status
```

## 📋 Available Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run dev:bg` | Start dev server in background | Development with auto-restart |
| `npm run start:bg` | Start production server in background | Production deployment |
| `npm run stop` | Stop running server | Stop server |
| `npm run restart` | Restart development server | Restart after changes |
| `npm run restart:prod` | Restart production server | Production restart |
| `npm run status` | Check server status | Monitor server state |
| `npm run logs` | View last 50 log lines | Quick log review |
| `npm run logs:tail` | Follow logs in real-time | Live monitoring |
| `npm run logs:clear` | Clear log file | Clean logs |

## 🔍 Process Management Features

### **✅ What's Fixed:**
1. **Background Execution**: Server now runs properly in background
2. **Process Persistence**: Server stays running until manually stopped
3. **PID Management**: Automatic process ID tracking
4. **Logging**: All output captured to `logs/server.log`
5. **Auto-restart**: Development mode restarts on file changes
6. **Graceful Shutdown**: Proper cleanup on stop

### **🛡️ Robust Features:**
- **Process Validation**: Checks if server actually started
- **Stale PID Cleanup**: Removes orphaned PID files
- **Graceful Shutdown**: SIGTERM handling before force kill
- **Error Handling**: Comprehensive error reporting
- **Status Monitoring**: Real-time process status

## 📁 File Structure

```
backend/
├── scripts/
│   └── process-manager.sh    # Main process manager
├── logs/
│   └── server.log           # Server logs
├── .pid                     # Process ID file (auto-generated)
└── package.json             # NPM scripts
```

## 🚨 Troubleshooting

### **Server Won't Start in Background**
```bash
# Check if port 3001 is already in use
lsof -i :3001

# Kill any existing processes
npm run stop

# Try starting again
npm run dev:bg
```

### **Can't Stop Server**
```bash
# Force kill by PID
ps aux | grep ts-node-dev
kill -9 <PID>

# Or use the process manager
npm run stop
```

### **Logs Not Showing**
```bash
# Check if logs directory exists
ls -la logs/

# Clear and restart
npm run logs:clear
npm run restart
```

### **Permission Issues**
```bash
# Make script executable
chmod +x scripts/process-manager.sh

# Check script permissions
ls -la scripts/process-manager.sh
```

## 🔧 Advanced Usage

### **Direct Script Usage**
```bash
# Use the process manager directly
./scripts/process-manager.sh start
./scripts/process-manager.sh status
./scripts/process-manager.sh stop
```

### **Custom Log Location**
```bash
# Edit scripts/process-manager.sh
LOG_FILE="/custom/path/server.log"
```

### **Environment-Specific Configuration**
```bash
# Development
NODE_ENV=development npm run dev:bg

# Production
NODE_ENV=production npm run start:bg
```

## 📊 Monitoring

### **Check Server Health**
```bash
# View status
npm run status

# Check logs
npm run logs

# Monitor in real-time
npm run logs:tail
```

### **Process Information**
```bash
# Show running processes
ps aux | grep ts-node-dev

# Check port usage
lsof -i :3001

# View system resources
top -p $(cat .pid)
```

## 🚀 Deployment Workflow

### **Development Cycle**
```bash
# 1. Start server
npm run dev:bg

# 2. Make changes to code
# (Server auto-restarts)

# 3. Check status
npm run status

# 4. View logs
npm run logs:tail

# 5. Stop when done
npm run stop
```

### **Production Deployment**
```bash
# 1. Build and start
npm run start:bg

# 2. Verify status
npm run status

# 3. Monitor logs
npm run logs:tail

# 4. Restart if needed
npm run restart:prod
```

## 🔒 Security Notes

- **PID File**: Contains only the process ID
- **Logs**: No sensitive information logged
- **Process Isolation**: Each instance runs independently
- **Cleanup**: Automatic cleanup on shutdown

## 📝 Log Format

Logs include:
- Server startup messages
- Request/response logging
- Error messages
- Environment information
- Health check results

## 🆘 Support

If you encounter issues:

1. **Check status**: `npm run status`
2. **View logs**: `npm run logs`
3. **Restart server**: `npm run restart`
4. **Check permissions**: Ensure script is executable
5. **Verify port**: Check if port 3001 is available

---

**🎯 The process management system ensures your backend server runs reliably in the background with proper logging, monitoring, and control capabilities.**
