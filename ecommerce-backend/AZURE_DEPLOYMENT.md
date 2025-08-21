# Azure App Service Deployment Guide - Backend

This guide provides step-by-step instructions for deploying the E-commerce Backend API to Azure App Service.

## Prerequisites

- Azure subscription
- Azure CLI installed and configured
- Node.js 18 or higher
- Azure SQL Database configured
- Redis Cache (optional but recommended)

## Azure Resources Setup

### 1. Create Resource Group

```bash
az group create --name rg-ecommerce-backend --location eastus
```

### 2. Create App Service Plan

```bash
az appservice plan create \
  --name plan-ecommerce-backend \
  --resource-group rg-ecommerce-backend \
  --sku B2 \
  --is-linux
```

### 3. Create Web App

```bash
az webapp create \
  --name your-backend-app-name \
  --resource-group rg-ecommerce-backend \
  --plan plan-ecommerce-backend \
  --runtime "NODE|18-lts"
```

## Database Setup

### 1. Create Azure SQL Database

```bash
az sql server create \
  --name your-sql-server \
  --resource-group rg-ecommerce-backend \
  --location eastus \
  --admin-user sqladmin \
  --admin-password YourSecurePassword123!

az sql db create \
  --resource-group rg-ecommerce-backend \
  --server your-sql-server \
  --name WSCEcommerceDB \
  --service-objective S1
```

### 2. Configure Firewall Rules

```bash
# Allow Azure services
az sql server firewall-rule create \
  --resource-group rg-ecommerce-backend \
  --server your-sql-server \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Allow your IP (for management)
az sql server firewall-rule create \
  --resource-group rg-ecommerce-backend \
  --server your-sql-server \
  --name AllowMyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP
```

## Cache Setup (Optional)

### 1. Create Redis Cache

```bash
az redis create \
  --name your-redis-cache \
  --resource-group rg-ecommerce-backend \
  --location eastus \
  --sku Basic \
  --vm-size c0
```

## Environment Configuration

### 1. Configure Application Settings

```bash
az webapp config appsettings set \
  --name your-backend-app-name \
  --resource-group rg-ecommerce-backend \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    DB_HOST=your-sql-server.database.windows.net \
    DB_NAME=WSCEcommerceDB \
    DB_USER=sqladmin \
    DB_PASSWORD=YourSecurePassword123! \
    DB_PORT=1433 \
    JWT_SECRET=your-super-secure-jwt-secret-key \
    JWT_EXPIRES_IN=7d \
    REDIS_HOST=your-redis-cache.redis.cache.windows.net \
    REDIS_PORT=6380 \
    REDIS_PASSWORD=your-redis-password \
    FRONTEND_URL=https://your-frontend-app.azurewebsites.net \
    SMTP_HOST=smtp.sendgrid.net \
    SMTP_PORT=587 \
    SMTP_USER=apikey \
    SMTP_PASS=your-sendgrid-api-key \
    SESSION_SECRET=your-session-secret \
    LOG_LEVEL=info
```

### 2. Configure Startup Command

```bash
az webapp config set \
  --name your-backend-app-name \
  --resource-group rg-ecommerce-backend \
  --startup-file "node dist/index.js"
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
   zip -r backend-deployment.zip dist node_modules package.json
   ```

3. **Deploy to Azure**:
   ```bash
   az webapp deployment source config-zip \
     --name your-backend-app-name \
     --resource-group rg-ecommerce-backend \
     --src backend-deployment.zip
   ```

### Method 2: GitHub Actions (Recommended)

1. **Create GitHub workflow** (`.github/workflows/azure-backend.yml`):

```yaml
name: Deploy Backend to Azure

on:
  push:
    branches: [ main ]
    paths: [ 'ecommerce-backend/**' ]

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
        cache-dependency-path: ecommerce-backend/package-lock.json
    
    - name: Install dependencies
      run: |
        cd ecommerce-backend
        npm ci
    
    - name: Build application
      run: |
        cd ecommerce-backend
        npm run build
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'your-backend-app-name'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE_BACKEND }}
        package: ecommerce-backend
```

2. **Configure GitHub Secrets**:
   - `AZURE_WEBAPP_PUBLISH_PROFILE_BACKEND`: Download from Azure portal

## Database Migration

### 1. Run Migrations

After deployment, run database migrations:

```bash
# Connect to your app via SSH or use Azure Cloud Shell
az webapp ssh --name your-backend-app-name --resource-group rg-ecommerce-backend

# Inside the app container
npm run db:migrate
npm run db:seed
```

### 2. Alternative: Use Azure Database Migration Service

For production environments, consider using Azure Database Migration Service for zero-downtime migrations.

## Monitoring and Logging

### 1. Enable Application Insights

```bash
az monitor app-insights component create \
  --app your-backend-insights \
  --location eastus \
  --resource-group rg-ecommerce-backend \
  --application-type web
```

### 2. Configure Logging

```bash
az webapp log config \
  --name your-backend-app-name \
  --resource-group rg-ecommerce-backend \
  --application-logging filesystem \
  --level information \
  --web-server-logging filesystem
```

### 3. View Logs

```bash
az webapp log tail \
  --name your-backend-app-name \
  --resource-group rg-ecommerce-backend
```

## API Management (Optional)

### 1. Create API Management Service

```bash
az apim create \
  --name your-api-management \
  --resource-group rg-ecommerce-backend \
  --location eastus \
  --publisher-email admin@yourcompany.com \
  --publisher-name "Your Company" \
  --sku-name Developer
```

### 2. Import API

```bash
az apim api import \
  --resource-group rg-ecommerce-backend \
  --service-name your-api-management \
  --api-id ecommerce-api \
  --path /api \
  --specification-url https://your-backend-app-name.azurewebsites.net/api/swagger.json \
  --specification-format OpenApi
```

## Security Configuration

### 1. Enable Managed Identity

```bash
az webapp identity assign \
  --name your-backend-app-name \
  --resource-group rg-ecommerce-backend
```

### 2. Configure Key Vault (Recommended)

```bash
az keyvault create \
  --name your-key-vault \
  --resource-group rg-ecommerce-backend \
  --location eastus

# Store secrets
az keyvault secret set \
  --vault-name your-key-vault \
  --name "JWT-SECRET" \
  --value "your-super-secure-jwt-secret-key"

az keyvault secret set \
  --vault-name your-key-vault \
  --name "DB-PASSWORD" \
  --value "YourSecurePassword123!"
```

### 3. Grant App Access to Key Vault

```bash
az keyvault set-policy \
  --name your-key-vault \
  --object-id $(az webapp identity show --name your-backend-app-name --resource-group rg-ecommerce-backend --query principalId -o tsv) \
  --secret-permissions get list
```

## Scaling Configuration

### 1. Configure Auto-scaling

```bash
az monitor autoscale create \
  --resource-group rg-ecommerce-backend \
  --resource /subscriptions/{subscription-id}/resourceGroups/rg-ecommerce-backend/providers/Microsoft.Web/serverfarms/plan-ecommerce-backend \
  --name autoscale-backend \
  --min-count 2 \
  --max-count 10 \
  --count 3
```

### 2. Add Scaling Rules

```bash
# Scale out when CPU > 70%
az monitor autoscale rule create \
  --resource-group rg-ecommerce-backend \
  --autoscale-name autoscale-backend \
  --condition "Percentage CPU > 70 avg 5m" \
  --scale out 2

# Scale in when CPU < 30%
az monitor autoscale rule create \
  --resource-group rg-ecommerce-backend \
  --autoscale-name autoscale-backend \
  --condition "Percentage CPU < 30 avg 10m" \
  --scale in 1
```

## Backup and Disaster Recovery

### 1. Configure App Service Backup

```bash
az webapp config backup create \
  --resource-group rg-ecommerce-backend \
  --webapp-name your-backend-app-name \
  --backup-name daily-backup \
  --storage-account-url "https://yourstorageaccount.blob.core.windows.net/backups?sv=..." \
  --frequency 1440 \
  --retention 30
```

### 2. Database Backup

```bash
# Automated backups are enabled by default for Azure SQL Database
# Configure long-term retention if needed
az sql db ltr-policy set \
  --resource-group rg-ecommerce-backend \
  --server your-sql-server \
  --database WSCEcommerceDB \
  --weekly-retention P4W \
  --monthly-retention P12M \
  --yearly-retention P5Y
```

## Performance Optimization

### 1. Enable Connection Pooling

Update your database configuration to use connection pooling:

```typescript
// In your database config
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: 'mssql',
  pool: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000
  }
});
```

### 2. Configure CDN for Static Assets

```bash
az cdn profile create \
  --name cdn-ecommerce-backend \
  --resource-group rg-ecommerce-backend \
  --sku Standard_Microsoft

az cdn endpoint create \
  --name your-backend-cdn \
  --profile-name cdn-ecommerce-backend \
  --resource-group rg-ecommerce-backend \
  --origin your-backend-app-name.azurewebsites.net
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Check firewall rules
   - Verify connection string
   - Test connectivity from App Service

2. **Memory Issues**:
   - Monitor memory usage
   - Consider upgrading App Service plan
   - Optimize database queries

3. **Performance Issues**:
   - Enable Application Insights
   - Monitor database performance
   - Check Redis cache hit rates

### Useful Commands

```bash
# Check app status
az webapp show --name your-backend-app-name --resource-group rg-ecommerce-backend

# View metrics
az monitor metrics list \
  --resource /subscriptions/{subscription-id}/resourceGroups/rg-ecommerce-backend/providers/Microsoft.Web/sites/your-backend-app-name \
  --metric "CpuPercentage"

# Scale manually
az webapp scale --name your-backend-app-name --resource-group rg-ecommerce-backend --instance-count 5
```

## Cost Optimization

1. **Right-sizing**: Choose appropriate App Service plan based on load
2. **Reserved Instances**: Use reserved capacity for predictable workloads
3. **Auto-scaling**: Configure based on actual usage patterns
4. **Database DTU**: Monitor and adjust database performance tier

## Security Checklist

- [ ] Enable HTTPS only
- [ ] Configure proper CORS settings
- [ ] Use managed identity for Azure services
- [ ] Store secrets in Key Vault
- [ ] Enable SQL Database auditing
- [ ] Configure network security groups
- [ ] Enable DDoS protection
- [ ] Set up monitoring and alerts

This deployment guide ensures your E-commerce Backend is secure, scalable, and production-ready on Azure App Service.
