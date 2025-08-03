#!/bin/bash

echo "🔒 Starting HTTPS development servers..."
echo ""

# Start backend in background
echo "📡 Starting HTTPS backend on port 3001..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "🌐 Starting HTTPS frontend on port 5173..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Servers started!"
echo "📱 Access from any device: https://192.168.1.15:5173"
echo "🖥️  Access locally: https://localhost:5173"
echo ""
echo "⚠️  You'll need to accept certificate warnings in your browser"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait