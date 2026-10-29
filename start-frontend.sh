#!/bin/bash

echo "Starting Fake Review Detection Frontend..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start the Next.js development server
echo "Starting Next.js development server on http://localhost:3000"
npm run dev
