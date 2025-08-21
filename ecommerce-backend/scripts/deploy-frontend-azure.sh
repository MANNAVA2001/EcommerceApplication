#!/bin/bash


set -e

echo "🚀 Starting Azure Frontend Deployment Preparation..."

if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

if [ ! -f ".env.azure" ]; then
    echo "❌ Error: .env.azure file not found. Please ensure it exists in the frontend directory."
    exit 1
fi

echo "📦 Installing dependencies..."
npm ci

echo "🔧 Setting up Azure environment..."
cp .env.azure .env.local

echo "⚠️  IMPORTANT: Update .env.local with your actual Azure backend URL"
echo "   Current NEXT_PUBLIC_API_URL: $(grep NEXT_PUBLIC_API_URL .env.local || echo 'Not found')"
echo "   Replace <YOUR_BACKEND_APP_NAME> with your actual Azure App Service name"

read -p "Press Enter to continue after updating .env.local, or Ctrl+C to exit and update manually..."

echo "🏗️  Building the application..."
npm run build

echo "✅ Build completed successfully!"

echo "📋 Deployment checklist:"
echo "  ✅ Dependencies installed"
echo "  ✅ Environment configured for Azure"
echo "  ✅ Next.js built for production"
echo "  ✅ Static files generated"
echo "  ✅ Ready for Azure Web Apps deployment"

echo ""
echo "📝 Next steps:"
echo "1. Ensure your Azure App Service is created with Node.js 18 LTS runtime"
echo "2. Configure environment variables in Azure App Service (see AZURE_DEPLOYMENT.md)"
echo "3. Deploy using Git deployment or ZIP upload"
echo "4. The entry point is: server.js (configured in web.config)"

echo ""
echo "🔗 Useful commands for Azure deployment:"
echo "  - Test locally: npm run dev"
echo "  - Check build: ls -la .next/"
echo "  - Verify environment: cat .env.local"

echo ""
echo "✨ Frontend is ready for Azure deployment!"
