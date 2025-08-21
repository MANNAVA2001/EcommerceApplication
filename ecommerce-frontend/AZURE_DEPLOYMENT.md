# Azure App Service Deployment Guide - Frontend

This guide provides step-by-step instructions for deploying the E-commerce Frontend to Azure App Service.

## Prerequisites

- Azure subscription
- Azure CLI installed and configured
- Node.js 18 or higher
- Backend API service deployed and accessible

## Azure Resources Setup

### 1. Create Resource Group

```bash
az group create --name rg-ecommerce-frontend --location eastus
```

### 2. Create App Service Plan

```bash
az appservice plan create \
  --name plan-ecommerce-frontend \
  --resource-group rg-ecommerce-frontend \
  --sku B1 \
  --is-linux
```

### 3. Create Web App

```bash
az webapp create \
  --name your-frontend-app-name \
  --resource-group rg-ecommerce-frontend \
  --plan plan-ecommerce-frontend \
  --runtime "NODE|18-lts"
```

## Environment Configuration

### 1. Configure Application Settings

```bash
az webapp config appsettings set \
  --name your-frontend-app-name \
  --resource-group rg-ecommerce-frontend \
  --settings \
    NODE_ENV=production \
    NEXT_PUBLIC_API_URL=https://your-backend-app.azurewebsites.net/api \
    NEXT_PUBLIC_RECOMMENDATION_URL=https://your-backend-app.azurewebsites.net/recommendations \
    NEXT_PUBLIC_ENVIRONMENT=azure \
    NEXT_PUBLIC_APP_NAME="E-Commerce Store" \
    NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 2. Configure Startup Command

```bash
az webapp config set \
  --name your-frontend-app-name \
  --resource-group rg-ecommerce-frontend \
  --startup-file "node server.js"
```

## Deployment Methods

### Method 1: ZIP Deployment

1. **Build the application locally**:
   ```bash
   npm install
   npm run build
   ```

2. **Create deployment package**:
   ```bash
   zip -r frontend-deployment.zip .next/standalone public package.json
   ```

3. **Deploy to Azure**:
   ```bash
   az webapp deployment source config-zip \
     --name your-frontend-app-name \
     --resource-group rg-ecommerce-frontend \
     --src frontend-deployment.zip
   ```

### Method 2: GitHub Actions (Recommended)

1. **Create GitHub workflow** (`.github/workflows/azure-frontend.yml`):

```yaml
name: Deploy Frontend to Azure

on:
  push:
    branches: [ main ]
    paths: [ 'ecommerce-frontend/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: ecommerce-frontend/package-lock.json
    
    - name: Install dependencies
      run: |
        cd ecommerce-frontend
        npm ci
    
    - name: Build application
      run: |
        cd ecommerce-frontend
        npm run build
      env:
        NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
        NEXT_PUBLIC_RECOMMENDATION_URL: ${{ secrets.NEXT_PUBLIC_RECOMMENDATION_URL }}
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'your-frontend-app-name'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ecommerce-frontend
```

2. **Configure GitHub Secrets**:
   - `AZURE_WEBAPP_PUBLISH_PROFILE`: Download from Azure portal
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
   - `NEXT_PUBLIC_RECOMMENDATION_URL`: Your recommendation service URL

### Method 3: Azure CLI with Local Git

1. **Configure local Git deployment**:
   ```bash
   az webapp deployment source config-local-git \
     --name your-frontend-app-name \
     --resource-group rg-ecommerce-frontend
   ```

2. **Add Azure remote and deploy**:
   ```bash
   git remote add azure <git-clone-url-from-previous-command>
   git push azure main
   ```

## Custom Domain and SSL

### 1. Add Custom Domain

```bash
az webapp config hostname add \
  --webapp-name your-frontend-app-name \
  --resource-group rg-ecommerce-frontend \
  --hostname your-domain.com
```

### 2. Enable SSL

```bash
az webapp config ssl bind \
  --name your-frontend-app-name \
  --resource-group rg-ecommerce-frontend \
  --certificate-thumbprint <certificate-thumbprint> \
  --ssl-type SNI
```

## Monitoring and Logging

### 1. Enable Application Insights

```bash
az monitor app-insights component create \
  --app your-frontend-insights \
  --location eastus \
  --resource-group rg-ecommerce-frontend \
  --application-type web
```

### 2. Configure Logging

```bash
az webapp log config \
  --name your-frontend-app-name \
  --resource-group rg-ecommerce-frontend \
  --application-logging filesystem \
  --level information
```

### 3. View Logs

```bash
az webapp log tail \
  --name your-frontend-app-name \
  --resource-group rg-ecommerce-frontend
```

## Performance Optimization

### 1. Enable Compression

```bash
az webapp config set \
  --name your-frontend-app-name \
  --resource-group rg-ecommerce-frontend \
  --use-32bit-worker-process false \
  --web-sockets-enabled true
```

### 2. Configure CDN (Optional)

```bash
az cdn profile create \
  --name cdn-ecommerce-frontend \
  --resource-group rg-ecommerce-frontend \
  --sku Standard_Microsoft

az cdn endpoint create \
  --name your-frontend-cdn \
  --profile-name cdn-ecommerce-frontend \
  --resource-group rg-ecommerce-frontend \
  --origin your-frontend-app-name.azurewebsites.net
```

## Scaling Configuration

### 1. Configure Auto-scaling

```bash
az monitor autoscale create \
  --resource-group rg-ecommerce-frontend \
  --resource /subscriptions/{subscription-id}/resourceGroups/rg-ecommerce-frontend/providers/Microsoft.Web/serverfarms/plan-ecommerce-frontend \
  --name autoscale-frontend \
  --min-count 1 \
  --max-count 5 \
  --count 2
```

### 2. Add Scaling Rules

```bash
az monitor autoscale rule create \
  --resource-group rg-ecommerce-frontend \
  --autoscale-name autoscale-frontend \
  --condition "Percentage CPU > 70 avg 5m" \
  --scale out 1
```

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify environment variables are set correctly
   - Review build logs in Azure portal

2. **Runtime Errors**:
   - Check application logs: `az webapp log tail`
   - Verify API connectivity to backend
   - Check CORS configuration

3. **Performance Issues**:
   - Enable Application Insights
   - Monitor resource usage
   - Consider upgrading App Service plan

### Useful Commands

```bash
# Check deployment status
az webapp deployment list --name your-frontend-app-name --resource-group rg-ecommerce-frontend

# Restart application
az webapp restart --name your-frontend-app-name --resource-group rg-ecommerce-frontend

# View configuration
az webapp config show --name your-frontend-app-name --resource-group rg-ecommerce-frontend

# Stream logs
az webapp log tail --name your-frontend-app-name --resource-group rg-ecommerce-frontend
```

## Security Best Practices

1. **Environment Variables**: Store sensitive data in App Service application settings
2. **HTTPS Only**: Enable HTTPS-only mode
3. **Authentication**: Configure Azure AD if needed
4. **Network Security**: Use Virtual Network integration for enhanced security
5. **Monitoring**: Enable security monitoring and alerts

## Cost Optimization

1. **Right-sizing**: Choose appropriate App Service plan
2. **Auto-scaling**: Configure based on actual usage patterns
3. **Reserved Instances**: Consider reserved capacity for production
4. **Monitoring**: Use Azure Cost Management to track expenses

## Backup and Recovery

1. **Automated Backups**: Configure App Service backup
2. **Source Control**: Maintain code in version control
3. **Deployment Slots**: Use staging slots for zero-downtime deployments

```bash
# Create deployment slot
az webapp deployment slot create \
  --name your-frontend-app-name \
  --resource-group rg-ecommerce-frontend \
  --slot staging

# Swap slots
az webapp deployment slot swap \
  --name your-frontend-app-name \
  --resource-group rg-ecommerce-frontend \
  --slot staging \
  --target-slot production
```

This deployment guide ensures your E-commerce Frontend is properly configured, secure, and scalable on Azure App Service.
