export const azureConfig = {
  port: process.env.PORT || process.env.WEBSITES_PORT || 5000,
  
  database: {
    host: process.env.DB_HOST || (() => { throw new Error('DB_HOST environment variable is required') })(),
    port: parseInt(process.env.DB_PORT || '1433'),
    name: process.env.DB_NAME || (() => { throw new Error('DB_NAME environment variable is required') })(),
    user: process.env.DB_USER || (() => { throw new Error('DB_USER environment variable is required') })(),
    password: process.env.DB_PASSWORD || (() => { throw new Error('DB_PASSWORD environment variable is required') })(),
    options: {
      encrypt: true,
      trustServerCertificate: false,
      enableArithAbort: true,
    },
  },

  jwt: {
    secret: process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET environment variable is required') })(),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASS || '',
    },
    backup: {
      host: process.env.SMTP_HOST_BACKUP || '',
      port: parseInt(process.env.SMTP_PORT_BACKUP || '587'),
      user: process.env.SMTP_USER_BACKUP || '',
      password: process.env.SMTP_PASS_BACKUP || '',
    },
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
    uploadPath: process.env.UPLOAD_PATH || 'uploads/',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  azure: {
    websiteSiteName: process.env.WEBSITE_SITE_NAME || '',
    websiteResourceGroup: process.env.WEBSITE_RESOURCE_GROUP || '',
    websiteOwnerName: process.env.WEBSITE_OWNER_NAME || '',
    
    logging: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      enableConsole: true,
      enableFile: false, // Azure handles file logging
    },
  },

  isProduction: process.env.NODE_ENV === 'production',
  isAzure: !!(process.env.WEBSITE_SITE_NAME || process.env.WEBSITES_PORT),
};

export default azureConfig;
