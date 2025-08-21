db = db.getSiblingDB(process.env.MONGO_DB_NAME || 'ecommerce');

db.createUser({
  user: process.env.MONGO_USER || 'ecommerce_user',
  pwd: process.env.MONGO_PASSWORD || 'ecommerce_password',
  roles: [
    {
      role: 'readWrite',
      db: process.env.MONGO_DB_NAME || 'ecommerce'
    }
  ]
});

db.createCollection('users');
db.createCollection('categories');
db.createCollection('products');

db.users.createIndex({ email: 1 }, { unique: true });
db.categories.createIndex({ name: 1 }, { unique: true });
db.products.createIndex({ name: "text", description: "text" });
db.products.createIndex({ categoryId: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ inStock: 1 });

print('MongoDB initialization completed');
