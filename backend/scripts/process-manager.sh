#!/bin/bash

# Personal Assistant Backend Process Manager
# This script provides robust process management for the backend server

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PID_FILE="$PROJECT_DIR/.pid"
LOG_FILE="$PROJECT_DIR/logs/server.log"
LOG_DIR="$(dirname "$LOG_FILE")"

# Ensure logs directory exists
mkdir -p "$LOG_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[PROCESS MANAGER]${NC} $1"
}

# Function to check if server is running
is_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        else
            # Process not running, clean up stale PID file
            rm -f "$PID_FILE"
            return 1
        fi
    fi
    return 1
}

# Function to start development server in background
start_dev() {
    print_header "Starting development server in background..."
    
    if is_running; then
        print_warning "Server is already running (PID: $(cat "$PID_FILE"))"
        return 1
    fi
    
    cd "$PROJECT_DIR"
    
    # Start ts-node-dev in background with proper logging
    nohup ts-node-dev --respawn --transpile-only -r dotenv/config src/server.ts > "$LOG_FILE" 2>&1 &
    local pid=$!
    
    # Save PID
    echo "$pid" > "$PID_FILE"
    
    # Wait a moment to check if it started successfully
    sleep 2
    
    if is_running; then
        print_status "Development server started successfully (PID: $pid)"
        print_status "Logs: $LOG_FILE"
        print_status "Health check: http://localhost:3001/api/health"
        return 0
    else
        print_error "Failed to start development server"
        rm -f "$PID_FILE"
        return 1
    fi
}

# Function to start production server in background
start_prod() {
    print_header "Starting production server in background..."
    
    if is_running; then
        print_warning "Server is already running (PID: $(cat "$PID_FILE"))"
        return 1
    fi
    
    cd "$PROJECT_DIR"
    
    # Build first
    print_status "Building TypeScript..."
    if ! npm run build; then
        print_error "Build failed"
        return 1
    fi
    
    # Start production server in background
    nohup node dist/server.js > "$LOG_FILE" 2>&1 &
    local pid=$!
    
    # Save PID
    echo "$pid" > "$PID_FILE"
    
    # Wait a moment to check if it started successfully
    sleep 2
    
    if is_running; then
        print_status "Production server started successfully (PID: $pid)"
        print_status "Logs: $LOG_FILE"
        print_status "Health check: http://localhost:3001/api/health"
        return 0
    else
        print_error "Failed to start production server"
        rm -f "$PID_FILE"
        return 1
    fi
}

# Function to stop server
stop() {
    print_header "Stopping server..."
    
    if ! is_running; then
        print_warning "Server is not running"
        return 0
    fi
    
    local pid=$(cat "$PID_FILE")
    print_status "Stopping server (PID: $pid)..."
    
    # Try graceful shutdown first
    kill "$pid"
    
    # Wait for graceful shutdown
    local count=0
    while [ $count -lt 10 ] && is_running; do
        sleep 1
        count=$((count + 1))
    done
    
    # Force kill if still running
    if is_running; then
        print_warning "Force killing server..."
        kill -9 "$pid"
        sleep 1
    fi
    
    # Clean up PID file
    rm -f "$PID_FILE"
    
    if ! is_running; then
        print_status "Server stopped successfully"
        return 0
    else
        print_error "Failed to stop server"
        return 1
    fi
}

# Function to restart server
restart() {
    print_header "Restarting server..."
    stop
    sleep 2
    start_dev
}

# Function to restart production server
restart_prod() {
    print_header "Restarting production server..."
    stop
    sleep 2
    start_prod
}

# Function to show server status
status() {
    print_header "Server Status"
    
    if is_running; then
        local pid=$(cat "$PID_FILE")
        print_status "Server is running (PID: $pid)"
        print_status "Log file: $LOG_FILE"
        print_status "Health check: http://localhost:3001/api/health"
        
        # Show process info
        echo ""
        print_status "Process details:"
        ps -p "$pid" -o pid,ppid,cmd,etime
    else
        print_warning "Server is not running"
    fi
}

# Function to show logs
logs() {
    if [ -f "$LOG_FILE" ]; then
        print_header "Server Logs (last 50 lines)"
        echo "Log file: $LOG_FILE"
        echo "----------------------------------------"
        tail -n 50 "$LOG_FILE"
        echo "----------------------------------------"
        print_status "Use 'npm run logs:tail' to follow logs in real-time"
    else
        print_warning "No log file found at $LOG_FILE"
    fi
}

# Function to follow logs in real-time
logs_tail() {
    if [ -f "$LOG_FILE" ]; then
        print_header "Following logs in real-time..."
        print_status "Press Ctrl+C to stop following logs"
        tail -f "$LOG_FILE"
    else
        print_warning "No log file found at $LOG_FILE"
    fi
}

# Function to clear logs
clear_logs() {
    print_header "Clearing log file..."
    if [ -f "$LOG_FILE" ]; then
        > "$LOG_FILE"
        print_status "Log file cleared"
    else
        print_warning "No log file found to clear"
    fi
}

# Function to show help
show_help() {
    echo "Personal Assistant Backend Process Manager"
    echo ""
    echo "Usage: $0 {start|start:prod|stop|restart|restart:prod|status|logs|logs:tail|clear-logs|help}"
    echo ""
    echo "Commands:"
    echo "  start         - Start development server in background"
    echo "  start:prod    - Build and start production server in background"
    echo "  stop          - Stop running server"
    echo "  restart       - Restart development server"
    echo "  restart:prod  - Restart production server"
    echo "  status        - Show server status"
    echo "  logs          - Show last 50 log lines"
    echo "  logs:tail     - Follow logs in real-time"
    echo "  clear-logs    - Clear log file"
    echo "  help          - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start      # Start dev server"
    echo "  $0 status     # Check status"
    echo "  $0 logs:tail  # Follow logs"
    echo "  $0 stop       # Stop server"
}

# Main script logic
case "${1:-help}" in
    start)
        start_dev
        ;;
    start:prod)
        start_prod
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    restart:prod)
        restart_prod
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    logs:tail)
        logs_tail
        ;;
    clear-logs)
        clear_logs
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
