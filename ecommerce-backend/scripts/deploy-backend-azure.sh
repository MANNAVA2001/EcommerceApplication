#!/bin/bash


set -e

echo "🚀 Starting Azure Backend Deployment Preparation..."

if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the backend directory."
    exit 1
fi

if [ ! -f ".env.azure" ]; then
    echo "❌ Error: .env.azure file not found. Please ensure it exists in the backend directory."
    exit 1
fi

echo "📦 Installing dependencies..."
npm ci

echo "🔧 Setting up Azure environment..."
cp .env.azure .env

echo "🏗️  Building the application..."
npm run build

echo "✅ Build completed successfully!"

echo "📋 Deployment checklist:"
echo "  ✅ Dependencies installed"
echo "  ✅ Environment configured for Azure"
echo "  ✅ TypeScript compiled to dist/"
echo "  ✅ Ready for Azure Web Apps deployment"

echo ""
echo "📝 Next steps:"
echo "1. Ensure your Azure App Service is created with Node.js 18 LTS runtime"
echo "2. Configure environment variables in Azure App Service (see AZURE_DEPLOYMENT.md)"
echo "3. Deploy using Git deployment or ZIP upload"
echo "4. The entry point is: dist/server.js (configured in web.config)"

echo ""
echo "🔗 Useful commands for Azure deployment:"
echo "  - Test locally: npm start"
echo "  - Check build: ls -la dist/"
echo "  - Verify environment: cat .env"

echo ""
echo "✨ Backend is ready for Azure deployment!"
