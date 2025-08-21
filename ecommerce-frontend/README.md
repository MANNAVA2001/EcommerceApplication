# E-commerce Frontend

A modern React/Next.js frontend for the E-commerce application with product comparison features and admin dashboard.

## Features

- **User Interface**: Modern React with Next.js 14, Material-UI components
- **State Management**: Redux Toolkit with Redux Persist
- **Authentication**: JWT-based authentication with secure cookie storage
- **Product Management**: Browse products, categories, and comparison features
- **Shopping Cart**: Add/remove items, quantity management
- **Checkout Process**: Address management, payment processing
- **Admin Dashboard**: Product and category management, order tracking
- **Responsive Design**: Mobile-first design with Material-UI

## Technology Stack

- **Frontend Framework**: Next.js 14 with React 18
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form with Yup validation
- **Styling**: Emotion (CSS-in-JS)
- **Testing**: Jest with React Testing Library
- **TypeScript**: Full TypeScript support

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Backend API service running (see backend project)

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_RECOMMENDATION_URL=http://localhost:5001/recommendations
NEXT_PUBLIC_ENVIRONMENT=development
```

For Azure deployment, use `.env.azure`:

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-app.azurewebsites.net/api
NEXT_PUBLIC_RECOMMENDATION_URL=https://your-backend-app.azurewebsites.net/recommendations
NEXT_PUBLIC_ENVIRONMENT=azure
```

## Quick Start

### Development Mode

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**: Navigate to `http://localhost:3000`

### Docker Development

1. **Build and run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

2. **Access application**:
   - Frontend: `http://localhost:3000`
   - Nginx proxy: `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Next.js pages
├── store/              # Redux store configuration
├── services/           # API service functions
├── utils/              # Utility functions
├── config/             # Configuration files
├── shared/             # Shared constants and types
└── styles/             # Global styles
```

## API Integration

The frontend communicates with the backend API through:

- **Base URL**: Configured via `NEXT_PUBLIC_API_URL`
- **Authentication**: JWT tokens stored in secure cookies
- **Error Handling**: Automatic token refresh and error boundaries
- **Request Interceptors**: Automatic authorization headers

## Key Features

### Authentication
- User registration and login
- JWT token management
- Protected routes and components
- Role-based access control

### Product Management
- Product browsing with pagination
- Category filtering
- Product comparison features
- Search functionality

### Shopping Cart
- Add/remove products
- Quantity management
- Persistent cart state
- Checkout process

### Admin Dashboard
- Product CRUD operations
- Category management
- Order tracking
- User management

## Azure Deployment

### Prerequisites
- Azure subscription
- Azure App Service created
- Backend API service deployed

### Deployment Steps

1. **Update environment variables**:
   ```bash
   cp .env.azure .env.local
   # Update with your actual backend URL
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
NEXT_PUBLIC_API_URL=https://your-backend-app.azurewebsites.net/api
NEXT_PUBLIC_RECOMMENDATION_URL=https://your-backend-app.azurewebsites.net/recommendations
NEXT_PUBLIC_ENVIRONMENT=azure
```

## Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:coverage
```

### E2E Testing
- Ensure backend API is running
- Test user flows: registration, login, shopping, checkout
- Verify admin functionality

## Troubleshooting

### Common Issues

1. **API Connection Errors**:
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check backend service is running
   - Verify CORS configuration in backend

2. **Build Failures**:
   - Clear `.next` directory: `rm -rf .next`
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`

3. **Authentication Issues**:
   - Clear browser cookies
   - Check JWT token expiration
   - Verify backend authentication endpoints

### Development Tips

- Use browser dev tools for debugging
- Check Network tab for API requests
- Use Redux DevTools for state debugging
- Enable Next.js debug mode: `DEBUG=* npm run dev`

## Contributing

1. Follow existing code style and patterns
2. Add tests for new features
3. Update documentation as needed
4. Ensure TypeScript compliance
5. Test thoroughly before submitting

## License

MIT License - see LICENSE file for details
