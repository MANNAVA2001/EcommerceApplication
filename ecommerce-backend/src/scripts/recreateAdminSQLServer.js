const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize({
  dialect: 'mssql',
  host: process.env.DB_HOST || (() => { throw new Error('DB_HOST environment variable is required') })(),
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME || (() => { throw new Error('DB_NAME environment variable is required') })(),
  username: process.env.DB_USER || (() => { throw new Error('DB_USER environment variable is required') })(),
  password: process.env.DB_PASSWORD || (() => { throw new Error('DB_PASSWORD environment variable is required') })(),
  logging: false,
  dialectOptions: {
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
  },
});

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' },
  firstName: { type: DataTypes.STRING, allowNull: true },
  lastName: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
}, { 
  sequelize, 
  modelName: 'User', 
  tableName: 'Ecom_Customers', 
  timestamps: true,
  indexes: [
    { unique: true, fields: ['username'] },
    { unique: true, fields: ['email'] }
  ]
});

async function recreateAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Connected to SQL Server database');
    
    const existingAdmin = await User.findOne({ where: { email: 'admin@ecommerce.com' } });
    if (existingAdmin) {
      await existingAdmin.destroy();
      console.log('Deleted existing admin user: SUCCESS');
    } else {
      console.log('No existing admin user found');
    }
    
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('AdminPass2024!', saltRounds);
    
    const admin = await User.create({
      email: 'admin@ecommerce.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      username: 'admin'
    });
    
    console.log('Created new admin user:');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('ID:', admin.id);
    console.log('Username:', admin.username);
    
    await sequelize.close();
    console.log('Admin recreation completed successfully');
  } catch (error) {
    console.error('Error recreating admin:', error.message);
    process.exit(1);
  }
}

recreateAdmin();
