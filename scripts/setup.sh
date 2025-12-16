#!/bin/bash

# MicroFE Setup Script

echo "🚀 Setting up MicroFE Component Manager..."

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p components
mkdir -p cdn
mkdir -p uploads

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build WordPress plugin if it exists
if [ -d "wordpress-plugin" ]; then
    echo "🔌 Building WordPress plugin..."
    cd wordpress-plugin
    if [ -f "package.json" ]; then
        npm install
        npm run build
    fi
    cd ..
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Open http://localhost:3000"
echo "3. Upload your first component!"


