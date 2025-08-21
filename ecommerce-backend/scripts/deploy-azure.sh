#!/bin/bash

set -e

echo "🚀 Starting Azure deployment for E-commerce Backend..."

if [ ! -f ".env.azure" ]; then
    echo "❌ Error: .env.azure file not found"
    echo "Please create .env.azure with your Azure configuration"
    exit 1
fi

echo "📋 Copying Azure environment configuration..."
cp .env.azure .env.local

echo "⚠️  IMPORTANT: Update .env.local with your actual Azure credentials"
echo "   Current DB_HOST: $(grep DB_HOST .env.local || echo 'Not found')"
echo "   Current DB_USER: $(grep DB_USER .env.local || echo 'Not found')"
echo "   Replace with your actual Azure SQL Database credentials"

read -p "Press Enter to continue after updating .env.local, or Ctrl+C to exit and update manually..."

echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building application..."
npm run build

echo "🧪 Running type check..."
npx tsc --noEmit

echo "✅ Build completed successfully!"
echo ""
echo "📋 Next steps for Azure deployment:"
echo "1. Create Azure App Service with Node.js 18 runtime"
echo "2. Configure environment variables in Azure portal:"
echo "   - NODE_ENV=production"
echo "   - PORT=8080"
echo "   - DB_HOST=your-sql-server.database.windows.net"
echo "   - DB_NAME=WSCEcommerceDB"
echo "   - DB_USER=your_db_user"
echo "   - DB_PASSWORD=your_db_password"
echo "   - JWT_SECRET=your_production_jwt_secret"
echo "   - FRONTEND_URL=https://your-frontend-app.azurewebsites.net"
echo "3. Deploy using Azure CLI, GitHub Actions, or ZIP deployment"
echo ""
echo "🔗 Useful commands:"
echo "   az webapp deployment source config-zip --resource-group <rg> --name <app-name> --src <zip-file>"
echo "   az webapp config appsettings set --resource-group <rg> --name <app-name> --settings @appsettings.json"
echo ""
echo "📊 Database setup:"
echo "   npm run db:migrate"
echo "   npm run db:seed"
