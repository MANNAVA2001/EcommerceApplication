const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User').User;
const Category = require('../src/models/Category').Category;
const Product = require('../src/models/Product').Product;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/ecommerce?authSource=admin';

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });
    await adminUser.save();

    const userPassword = await bcrypt.hash('user123', 12);
    const regularUser = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'user@example.com',
      password: userPassword,
      role: 'user'
    });
    await regularUser.save();
    console.log('Created users');

    const laptopCategory = new Category({
      name: 'Laptops',
      description: 'Portable computers for work and entertainment',
      comparisonFields: [
        { name: 'processor', type: 'text', required: true, displayOrder: 1 },
        { name: 'ram', type: 'select', required: true, options: ['4GB', '8GB', '16GB', '32GB'], displayOrder: 2 },
        { name: 'storage', type: 'select', required: true, options: ['256GB SSD', '512GB SSD', '1TB SSD', '1TB HDD'], displayOrder: 3 },
        { name: 'screenSize', type: 'select', required: true, options: ['13"', '14"', '15"', '16"', '17"'], displayOrder: 4 },
        { name: 'weight', type: 'number', required: false, unit: 'kg', displayOrder: 5 },
        { name: 'batteryLife', type: 'number', required: false, unit: 'hours', displayOrder: 6 },
        { name: 'hasBacklitKeyboard', type: 'boolean', required: false, displayOrder: 7 }
      ]
    });
    await laptopCategory.save();

    const phoneCategory = new Category({
      name: 'Phones',
      description: 'Mobile phones with advanced features',
      comparisonFields: [
        { name: 'brand', type: 'select', required: true, options: ['Apple', 'Samsung', 'Google', 'OnePlus'], displayOrder: 1 },
        { name: 'storage', type: 'select', required: true, options: ['64GB', '128GB', '256GB', '512GB', '1TB'], displayOrder: 2 },
        { name: 'ram', type: 'select', required: true, options: ['4GB', '6GB', '8GB', '12GB', '16GB'], displayOrder: 3 },
        { name: 'screenSize', type: 'number', required: true, unit: 'inches', displayOrder: 4 },
        { name: 'cameraMP', type: 'number', required: false, unit: 'MP', displayOrder: 5 },
        { name: 'batteryCapacity', type: 'number', required: false, unit: 'mAh', displayOrder: 6 },
        { name: 'has5G', type: 'boolean', required: false, displayOrder: 7 },
        { name: 'isWaterproof', type: 'boolean', required: false, displayOrder: 8 }
      ]
    });
    await phoneCategory.save();

    const earphonesCategory = new Category({
      name: 'Earphones',
      description: 'Audio devices for music and calls',
      comparisonFields: [
        { name: 'type', type: 'select', required: true, options: ['Over-ear', 'On-ear', 'In-ear', 'Earbuds'], displayOrder: 1 },
        { name: 'connectivity', type: 'select', required: true, options: ['Wired', 'Wireless', 'Both'], displayOrder: 2 },
        { name: 'noiseCancellation', type: 'boolean', required: false, displayOrder: 3 },
        { name: 'batteryLife', type: 'number', required: false, unit: 'hours', displayOrder: 4 },
        { name: 'driverSize', type: 'number', required: false, unit: 'mm', displayOrder: 5 },
        { name: 'weight', type: 'number', required: false, unit: 'grams', displayOrder: 6 }
      ]
    });
    await earphonesCategory.save();

    const ipadCategory = new Category({
      name: 'iPads',
      description: 'Apple tablets for productivity and entertainment',
      comparisonFields: [
        { name: 'model', type: 'select', required: true, options: ['iPad', 'iPad Air', 'iPad Pro', 'iPad mini'], displayOrder: 1 },
        { name: 'storage', type: 'select', required: true, options: ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'], displayOrder: 2 },
        { name: 'screenSize', type: 'select', required: true, options: ['8.3"', '10.9"', '11"', '12.9"'], displayOrder: 3 },
        { name: 'connectivity', type: 'select', required: true, options: ['Wi-Fi', 'Wi-Fi + Cellular'], displayOrder: 4 },
        { name: 'processor', type: 'text', required: true, displayOrder: 5 },
        { name: 'supportsPencil', type: 'boolean', required: false, displayOrder: 6 },
        { name: 'hasKeyboardSupport', type: 'boolean', required: false, displayOrder: 7 }
      ]
    });
    await ipadCategory.save();
    console.log('Created categories');

    const laptops = [
      {
        name: 'MacBook Pro 14"',
        description: 'Apple MacBook Pro with M3 chip, perfect for professionals',
        price: 1999,
        categoryId: laptopCategory._id,
        features: {
          processor: 'Apple M3 Pro',
          ram: '16GB',
          storage: '512GB SSD',
          screenSize: '14"',
          weight: 1.6,
          batteryLife: 18,
          hasBacklitKeyboard: true
        },
        images: ['https://example.com/macbook-pro-14.jpg'],
        inStock: true,
        stockQuantity: 25
      },
      {
        name: 'Dell XPS 13',
        description: 'Ultra-portable laptop with stunning display',
        price: 1299,
        categoryId: laptopCategory._id,
        features: {
          processor: 'Intel Core i7-1360P',
          ram: '16GB',
          storage: '512GB SSD',
          screenSize: '13"',
          weight: 1.2,
          batteryLife: 12,
          hasBacklitKeyboard: true
        },
        images: ['https://example.com/dell-xps-13.jpg'],
        inStock: true,
        stockQuantity: 15
      },
      {
        name: 'ThinkPad X1 Carbon',
        description: 'Business laptop with exceptional keyboard',
        price: 1599,
        categoryId: laptopCategory._id,
        features: {
          processor: 'Intel Core i7-1365U',
          ram: '16GB',
          storage: '1TB SSD',
          screenSize: '14"',
          weight: 1.1,
          batteryLife: 15,
          hasBacklitKeyboard: true
        },
        images: ['https://example.com/thinkpad-x1.jpg'],
        inStock: true,
        stockQuantity: 20
      },
      {
        name: 'ASUS ROG Zephyrus G14',
        description: 'Gaming laptop with AMD Ryzen processor',
        price: 1799,
        categoryId: laptopCategory._id,
        features: {
          processor: 'AMD Ryzen 9 7940HS',
          ram: '32GB',
          storage: '1TB SSD',
          screenSize: '14"',
          weight: 1.7,
          batteryLife: 10,
          hasBacklitKeyboard: true
        },
        images: ['https://example.com/asus-rog-g14.jpg'],
        inStock: true,
        stockQuantity: 12
      }
    ];

    const phones = [
      {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with titanium design',
        price: 999,
        categoryId: phoneCategory._id,
        features: {
          brand: 'Apple',
          storage: '256GB',
          ram: '8GB',
          screenSize: 6.1,
          cameraMP: 48,
          batteryCapacity: 3274,
          has5G: true,
          isWaterproof: true
        },
        images: ['https://example.com/iphone-15-pro.jpg'],
        inStock: true,
        stockQuantity: 50
      },
      {
        name: 'Samsung Galaxy S24',
        description: 'Android flagship with AI features',
        price: 899,
        categoryId: phoneCategory._id,
        features: {
          brand: 'Samsung',
          storage: '256GB',
          ram: '8GB',
          screenSize: 6.2,
          cameraMP: 50,
          batteryCapacity: 4000,
          has5G: true,
          isWaterproof: true
        },
        images: ['https://example.com/galaxy-s24.jpg'],
        inStock: true,
        stockQuantity: 40
      },
      {
        name: 'Google Pixel 8',
        description: 'Pure Android experience with great camera',
        price: 699,
        categoryId: phoneCategory._id,
        features: {
          brand: 'Google',
          storage: '128GB',
          ram: '8GB',
          screenSize: 6.2,
          cameraMP: 50,
          batteryCapacity: 4575,
          has5G: true,
          isWaterproof: true
        },
        images: ['https://example.com/pixel-8.jpg'],
        inStock: true,
        stockQuantity: 30
      },
      {
        name: 'OnePlus 12',
        description: 'Flagship killer with fast charging',
        price: 799,
        categoryId: phoneCategory._id,
        features: {
          brand: 'OnePlus',
          storage: '256GB',
          ram: '12GB',
          screenSize: 6.8,
          cameraMP: 50,
          batteryCapacity: 5400,
          has5G: true,
          isWaterproof: true
        },
        images: ['https://example.com/oneplus-12.jpg'],
        inStock: true,
        stockQuantity: 25
      }
    ];

    const earphones = [
      {
        name: 'Sony WH-1000XM5',
        description: 'Industry-leading noise canceling headphones',
        price: 399,
        categoryId: earphonesCategory._id,
        features: {
          type: 'Over-ear',
          connectivity: 'Wireless',
          noiseCancellation: true,
          batteryLife: 30,
          driverSize: 30,
          weight: 250
        },
        images: ['https://example.com/sony-wh1000xm5.jpg'],
        inStock: true,
        stockQuantity: 35
      },
      {
        name: 'AirPods Pro 2',
        description: 'Apple wireless earbuds with spatial audio',
        price: 249,
        categoryId: earphonesCategory._id,
        features: {
          type: 'Earbuds',
          connectivity: 'Wireless',
          noiseCancellation: true,
          batteryLife: 6,
          driverSize: 11,
          weight: 5.3
        },
        images: ['https://example.com/airpods-pro-2.jpg'],
        inStock: true,
        stockQuantity: 60
      },
      {
        name: 'Sennheiser HD 660S2',
        description: 'Open-back audiophile headphones',
        price: 599,
        categoryId: earphonesCategory._id,
        features: {
          type: 'Over-ear',
          connectivity: 'Wired',
          noiseCancellation: false,
          batteryLife: null,
          driverSize: 38,
          weight: 260
        },
        images: ['https://example.com/sennheiser-hd660s2.jpg'],
        inStock: true,
        stockQuantity: 15
      },
      {
        name: 'Bose QuietComfort Earbuds',
        description: 'True wireless earbuds with noise cancellation',
        price: 279,
        categoryId: earphonesCategory._id,
        features: {
          type: 'Earbuds',
          connectivity: 'Wireless',
          noiseCancellation: true,
          batteryLife: 6,
          driverSize: 13,
          weight: 8.5
        },
        images: ['https://example.com/bose-qc-earbuds.jpg'],
        inStock: true,
        stockQuantity: 45
      }
    ];

    const ipads = [
      {
        name: 'iPad Pro 12.9"',
        description: 'Most advanced iPad with M2 chip',
        price: 1099,
        categoryId: ipadCategory._id,
        features: {
          model: 'iPad Pro',
          storage: '256GB',
          screenSize: '12.9"',
          connectivity: 'Wi-Fi',
          processor: 'Apple M2',
          supportsPencil: true,
          hasKeyboardSupport: true
        },
        images: ['https://example.com/ipad-pro-12.jpg'],
        inStock: true,
        stockQuantity: 20
      },
      {
        name: 'iPad Air',
        description: 'Powerful and versatile iPad for everyday use',
        price: 599,
        categoryId: ipadCategory._id,
        features: {
          model: 'iPad Air',
          storage: '128GB',
          screenSize: '10.9"',
          connectivity: 'Wi-Fi',
          processor: 'Apple M1',
          supportsPencil: true,
          hasKeyboardSupport: true
        },
        images: ['https://example.com/ipad-air.jpg'],
        inStock: true,
        stockQuantity: 35
      },
      {
        name: 'iPad mini',
        description: 'Compact iPad with full functionality',
        price: 499,
        categoryId: ipadCategory._id,
        features: {
          model: 'iPad mini',
          storage: '64GB',
          screenSize: '8.3"',
          connectivity: 'Wi-Fi',
          processor: 'Apple A15 Bionic',
          supportsPencil: true,
          hasKeyboardSupport: false
        },
        images: ['https://example.com/ipad-mini.jpg'],
        inStock: true,
        stockQuantity: 30
      },
      {
        name: 'iPad (10th generation)',
        description: 'Essential iPad for everyday tasks',
        price: 349,
        categoryId: ipadCategory._id,
        features: {
          model: 'iPad',
          storage: '64GB',
          screenSize: '10.9"',
          connectivity: 'Wi-Fi',
          processor: 'Apple A14 Bionic',
          supportsPencil: true,
          hasKeyboardSupport: true
        },
        images: ['https://example.com/ipad-10th.jpg'],
        inStock: true,
        stockQuantity: 40
      }
    ];

    await Product.insertMany([...laptops, ...phones, ...earphones, ...ipads]);
    console.log('Created products');

    console.log('Seed data created successfully!');
    console.log('Admin user: admin@example.com / admin123');
    console.log('Regular user: user@example.com / user123');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedData();
