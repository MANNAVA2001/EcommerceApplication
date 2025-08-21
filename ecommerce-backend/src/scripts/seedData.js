const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
  comparisonFields: mongoose.Schema.Types.Mixed
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

async function seedData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecommerce');
    
    console.log('Checking for existing data...');
    
    let electronics = await Category.findOne({ name: 'Electronics' });
    if (!electronics) {
      electronics = new Category({
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
      console.log('Created Electronics category');
    } else {
      console.log('Electronics category already exists');
    }
    
    const products = [
      {
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with advanced camera system and A17 Pro chip',
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
        description: 'Premium Android smartphone with AI features',
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
        description: 'Professional laptop for creators and developers',
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
        description: 'Ultra-portable Windows laptop',
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
    
    let createdCount = 0;
    let existingCount = 0;
    
    for (const productData of products) {
      const existingProduct = await Product.findOne({ name: productData.name });
      if (!existingProduct) {
        const product = new Product(productData);
        await product.save();
        createdCount++;
      } else {
        existingCount++;
      }
    }
    
    console.log('Sample data processing completed');
    console.log(`Created ${createdCount} new products, ${existingCount} products already existed in Electronics category`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
