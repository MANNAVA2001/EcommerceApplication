#!/bin/bash

set -e

echo "🚀 Starting Azure deployment for E-commerce Frontend..."

if [ ! -f ".env.azure" ]; then
    echo "❌ Error: .env.azure file not found"
    echo "Please create .env.azure with your Azure configuration"
    exit 1
fi

echo "📋 Copying Azure environment configuration..."
cp .env.azure .env.local

echo "⚠️  IMPORTANT: Update .env.local with your actual Azure backend URL"
echo "   Current NEXT_PUBLIC_API_URL: $(grep NEXT_PUBLIC_API_URL .env.local || echo 'Not found')"
echo "   Replace with your actual Azure App Service backend URL"

read -p "Press Enter to continue after updating .env.local, or Ctrl+C to exit and update manually..."

echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building application..."
npm run build

echo "🧪 Running type check..."
npm run type-check

echo "✅ Build completed successfully!"
echo ""
echo "📋 Next steps for Azure deployment:"
echo "1. Create Azure App Service with Node.js 18 runtime"
echo "2. Configure environment variables in Azure portal:"
echo "   - NODE_ENV=production"
echo "   - NEXT_PUBLIC_API_URL=https://your-backend-app.azurewebsites.net/api"
echo "   - NEXT_PUBLIC_RECOMMENDATION_URL=https://your-backend-app.azurewebsites.net/recommendations"
echo "   - NEXT_PUBLIC_ENVIRONMENT=azure"
echo "3. Deploy using Azure CLI, GitHub Actions, or ZIP deployment"
echo ""
echo "🔗 Useful commands:"
echo "   az webapp deployment source config-zip --resource-group <rg> --name <app-name> --src <zip-file>"
echo "   az webapp config appsettings set --resource-group <rg> --name <app-name> --settings @appsettings.json"
