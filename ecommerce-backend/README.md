# E-commerce Backend

A robust Node.js/Express backend API for the E-commerce application with user authentication, product management, order processing, and recommendation services.

## Features

- **RESTful API**: Express.js with TypeScript
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Database**: SQL Server with Sequelize ORM
- **Caching**: Redis for session management and caching
- **Search**: Elasticsearch for product search functionality
- **Recommendations**: FastAPI microservice with MongoDB
- **File Upload**: Multer for product image uploads
- **Email**: Nodemailer for transactional emails
- **Security**: Helmet, CORS, rate limiting, input validation
- **Logging**: Winston for structured logging

## Technology Stack

- **Runtime**: Node.js 18 with TypeScript
- **Framework**: Express.js
- **Database**: SQL Server (Azure SQL Database)
- **ORM**: Sequelize
- **Cache**: Redis
- **Search**: Elasticsearch
- **Recommendations**: FastAPI + MongoDB
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator
- **Logging**: Winston
- **Testing**: Jest

## Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose
- Access to Azure SQL Database
- npm or yarn package manager

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
NODE_ENV=development
PORT=5001

# Database Configuration
DB_HOST=your-sql-server.database.windows.net
DB_NAME=WSCEcommerceDB
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_PORT=1433

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Search Configuration
ELASTICSEARCH_HOST=localhost
ELASTICSEARCH_PORT=9200

# Recommendations Configuration
MONGODB_URI=mongodb://localhost:27017/ecommerce_recommendations
```

For Azure deployment, use `.env.azure` with production values.

## Quick Start

### Development Mode

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start supporting services**:
   ```bash
   docker-compose up -d redis elasticsearch mongodb
   ```

3. **Run database migrations**:
   ```bash
   npm run db:migrate
   ```

4. **Seed database with sample data**:
   ```bash
   npm run db:seed
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **API will be available at**: `http://localhost:5001`

### Docker Development

1. **Build and run all services**:
   ```bash
   docker-compose up --build
   ```

2. **Access services**:
   - Backend API: `http://localhost:5001`
   - Recommendation API: `http://localhost:8000`
   - Redis: `localhost:6379`
   - Elasticsearch: `http://localhost:9200`
   - MongoDB: `localhost:27017`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database (drop, create, migrate, seed)

## Project Structure

```
src/
├── config/             # Configuration files
│   ├── database.ts     # Database connection and models
│   └── redis.ts        # Redis configuration
├── controllers/        # Route controllers
│   ├── auth.ts         # Authentication endpoints
│   ├── products.ts     # Product management
│   ├── orders.ts       # Order processing
│   └── users.ts        # User management
├── middleware/         # Express middleware
│   ├── auth.ts         # Authentication middleware
│   ├── validation.ts   # Input validation
│   └── errorHandler.ts # Error handling
├── models/             # Sequelize models
│   ├── User.ts         # User model
│   ├── Product.ts      # Product model
│   ├── Order.ts        # Order model
│   └── Category.ts     # Category model
├── routes/             # Express routes
├── services/           # Business logic services
├── utils/              # Utility functions
├── shared/             # Shared constants and types
└── index.ts            # Application entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products (with pagination)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `GET /api/products/search` - Search products

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (admin)

### Recommendations
- `GET /api/recommendations/products/:id` - Get product recommendations
- `GET /api/recommendations/user/:id` - Get user-based recommendations

## Database Schema

The application uses the following main entities:

- **Users**: User accounts with authentication
- **Products**: Product catalog with categories
- **Categories**: Product categorization
- **Orders**: Order management with line items
- **Payments**: Payment processing records
- **EmailDeliveryStatus**: Email tracking

## Authentication & Security

- **JWT Tokens**: Secure authentication with configurable expiration
- **Password Hashing**: bcrypt with salt rounds
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Request rate limiting to prevent abuse
- **Input Validation**: express-validator for request validation
- **Security Headers**: Helmet for security headers
- **Session Management**: Redis-backed sessions

## Caching Strategy

- **Redis**: Session storage and API response caching
- **Database**: Sequelize query caching
- **Static Assets**: Nginx caching for uploaded files

## Error Handling & Logging

- **Winston**: Structured logging with multiple transports
- **Error Middleware**: Centralized error handling
- **Request Logging**: Morgan for HTTP request logging
- **Log Rotation**: Daily log files with rotation

## Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:coverage
```

### API Testing
Use tools like Postman or curl to test endpoints:

```bash
# Register user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get products
curl -X GET http://localhost:5001/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Azure Deployment

### Prerequisites
- Azure subscription
- Azure App Service created
- Azure SQL Database configured
- Azure Cache for Redis (optional)

### Deployment Steps

1. **Update environment variables**:
   ```bash
   cp .env.azure .env.local
   # Update with your actual Azure credentials
   ```

2. **Build application**:
   ```bash
   npm run build
   ```

3. **Deploy to Azure App Service**:
   - Use Azure CLI or GitHub Actions
   - Configure App Service with Node.js 18 runtime
   - Set environment variables in Azure portal

### Azure Configuration

In Azure App Service, configure these application settings:

```
NODE_ENV=production
PORT=8080
DB_HOST=your-sql-server.database.windows.net
DB_NAME=WSCEcommerceDB
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://your-frontend-app.azurewebsites.net
```

## Monitoring & Performance

- **Health Checks**: `/api/health` endpoint for monitoring
- **Metrics**: Request/response time tracking
- **Database Monitoring**: Connection pool monitoring
- **Redis Monitoring**: Cache hit/miss ratios
- **Error Tracking**: Structured error logging

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify Azure SQL Database credentials
   - Check firewall rules and IP whitelist
   - Ensure database exists and is accessible

2. **Redis Connection Issues**:
   - Verify Redis is running: `docker ps`
   - Check Redis logs: `docker logs ecommerce_redis`
   - Test connection: `redis-cli ping`

3. **Authentication Failures**:
   - Check JWT secret configuration
   - Verify token expiration settings
   - Clear browser cookies and try again

4. **File Upload Issues**:
   - Check upload directory permissions
   - Verify file size limits
   - Ensure multer configuration is correct

### Development Tips

- Use `npm run dev` for hot reload during development
- Check logs in `logs/app.log` for debugging
- Use Redis CLI to inspect cached data
- Monitor database queries with Sequelize logging
- Test API endpoints with Postman collection

## Contributing

1. Follow existing code style and patterns
2. Add tests for new features
3. Update documentation as needed
4. Ensure TypeScript compliance
5. Test thoroughly before submitting

## License

MIT License - see LICENSE file for details
