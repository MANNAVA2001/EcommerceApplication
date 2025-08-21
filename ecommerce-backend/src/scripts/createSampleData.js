const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
  comparisonFields: [{
    name: String,
    type: String,
    required: Boolean,
    displayOrder: Number
  }]
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  images: [String],
  inStock: Boolean,
  stockQuantity: Number,
  features: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);

async function createSampleData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecommerce');
    
    const electronics = new Category({
      name: 'Electronics',
      description: 'Electronic devices and gadgets',
      comparisonFields: [
        { name: 'Brand', type: 'text', required: true, displayOrder: 0 },
        { name: 'Screen Size', type: 'text', required: false, displayOrder: 1 },
        { name: 'Battery Life', type: 'text', required: false, displayOrder: 2 },
        { name: 'Storage', type: 'text', required: false, displayOrder: 3 }
      ]
    });
    await electronics.save();
    console.log('Electronics category created');
    
    const products = [
      {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with advanced camera system and A17 Pro chip for professional photography and performance.',
        price: 999.99,
        categoryId: electronics._id,
        images: ['https://via.placeholder.com/400x300/007bff/ffffff?text=iPhone+15+Pro'],
        inStock: true,
        stockQuantity: 50,
        features: {
          'Brand': 'Apple',
          'Screen Size': '6.1 inches',
          'Battery Life': '23 hours',
          'Storage': '128GB'
        }
      },
      {
        name: 'Samsung Galaxy S24',
        description: 'Premium Android smartphone with AI-powered features and exceptional camera quality.',
        price: 899.99,
        categoryId: electronics._id,
        images: ['https://via.placeholder.com/400x300/28a745/ffffff?text=Galaxy+S24'],
        inStock: true,
        stockQuantity: 30,
        features: {
          'Brand': 'Samsung',
          'Screen Size': '6.2 inches',
          'Battery Life': '25 hours',
          'Storage': '256GB'
        }
      },
      {
        name: 'MacBook Pro M3',
        description: 'Professional laptop designed for creators and developers with the powerful M3 chip.',
        price: 1999.99,
        categoryId: electronics._id,
        images: ['https://via.placeholder.com/400x300/6c757d/ffffff?text=MacBook+Pro'],
        inStock: true,
        stockQuantity: 20,
        features: {
          'Brand': 'Apple',
          'Screen Size': '14 inches',
          'Battery Life': '18 hours',
          'Storage': '512GB'
        }
      },
      {
        name: 'Dell XPS 13',
        description: 'Ultra-portable Windows laptop with premium build quality and excellent performance.',
        price: 1299.99,
        categoryId: electronics._id,
        images: ['https://via.placeholder.com/400x300/dc3545/ffffff?text=Dell+XPS+13'],
        inStock: true,
        stockQuantity: 15,
        features: {
          'Brand': 'Dell',
          'Screen Size': '13.4 inches',
          'Battery Life': '12 hours',
          'Storage': '512GB'
        }
      }
    ];
    
    for (const productData of products) {
      const product = new Product(productData);
      await product.save();
      console.log(`Created product: ${product.name}`);
    }
    
    console.log(`Successfully created ${products.length} products in Electronics category`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating sample data:', error);
    process.exit(1);
  }
}

createSampleData();
