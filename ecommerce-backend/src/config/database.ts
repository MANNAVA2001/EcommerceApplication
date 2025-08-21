// backend/src/config/database.ts

// Import Sequelize as a class, DataTypes as an object/value, Model as a class, Optional as a type helper
import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { User, AuthRequest, UserAttributes, UserCreationAttributes } from '../models/User';
import { Product, ProductAttributes, ProductCreationAttributes } from '../models/Product';
import { Category, IComparisonField, CategoryAttributes, CategoryCreationAttributes } from '../models/Category';
import { ComparisonField, ComparisonFieldAttributes, ComparisonFieldCreationAttributes } from '../models/ComparisonField';
import { Order, Address, OrderProduct, IOrderProduct, OrderAttributes, OrderCreationAttributes, AddressAttributes, AddressCreationAttributes, OrderProductAttributes, OrderProductCreationAttributes } from '../models/Order';
import { EmailDeliveryStatus, EmailDeliveryStatusAttributes, EmailDeliveryStatusCreationAttributes } from '../models/EmailDeliveryStatus';
import { DummyCardInfo, Payment, DummyCardInfoAttributes, DummyCardInfoCreationAttributes, PaymentAttributes, PaymentCreationAttributes } from '../models/Payment';
import sequelize from 'sequelize';
// import { Apple, AppleAttributes, AppleCreationAttributes } from '../models/brands/Apple';
// import { Samsung, SamsungAttributes, SamsungCreationAttributes } from '../models/brands/Samsung';
// import { Sony, SonyAttributes, SonyCreationAttributes } from '../models/brands/Sony';

let sequelizeInstance: Sequelize;


export const getSequelizeInstance = (): Sequelize => {
    if (!sequelizeInstance) {
        console.log("DEBUG: Initializing Sequelize instance now within getSequelizeInstance...");
        
        if (!process.env.DB_HOST) {
            sequelizeInstance = new Sequelize({
                dialect: 'sqlite',
                storage: './database.sqlite',
                logging: false,
            });
            console.log("DEBUG: Using SQLite for local development");
        } else {
            sequelizeInstance = new Sequelize(
                process.env.DB_NAME!,
                process.env.DB_USER!,
                process.env.DB_PASSWORD!,
                {
                    dialect: 'mssql',
                    host: process.env.DB_HOST!,
                    port: parseInt(process.env.DB_PORT || '1433'),
                    logging: false,
                    dialectOptions: {
                        options: {
                            server: process.env.DB_HOST!,
                            encrypt: true,
                            trustServerCertificate: false,
                        },
                    },
                    pool: {
                        max: 10,
                        min: 0,
                        acquire: 30000,
                        idle: 10000
                    }
                }
            );
        }
        console.log("DEBUG: Sequelize instance created.");
    }
    return sequelizeInstance;
};

// Define AppModels using typeof the imported classes
interface AppModels {
    User: typeof User;
    Product: typeof Product;
    Category: typeof Category;
    ComparisonField: typeof ComparisonField;
    Address: typeof Address;
    Order: typeof Order;
    OrderProduct: typeof OrderProduct;
    EmailDeliveryStatus: typeof EmailDeliveryStatus;
    DummyCardInfo: typeof DummyCardInfo;
    Payment: typeof Payment;
    // Apple: typeof Apple;
    // Samsung: typeof Samsung;
    // Sony: typeof Sony;
}

const models: AppModels = {
  User,
  Product,
  Category,
  ComparisonField,
  Address,
  Order,
  OrderProduct,
  EmailDeliveryStatus,
  DummyCardInfo,
  Payment,
  // Apple,
  // Samsung,
  // Sony,
};

const initializeDatabase = async () => {
  try {
    const sequelize = getSequelizeInstance(); // <<<--- ADD THIS LINE
    initializeModels(); // Now initializeModels will use the correctly set instance

    await sequelize.authenticate();
    console.log('Connection to database has been established successfully.');
    await sequelize.sync({ force: false });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};
// index.ts (This will now work with the above change in database.ts)
// src/config/database.ts (Example of default export)
export const connectDatabase = async () => {
    try {
        const sequelize = getSequelizeInstance(); // <<<--- ADD THIS LINE
        initializeModels(); // Now initializeModels will use the correctly set instance

        await sequelize.authenticate();
        console.log('Connected to SQL Server database via Sequelize');

        await sequelize.sync({ force: false });
        console.log('All models were synchronized successfully.');
    }
    catch (error) {
        console.error('Failed to connect to SQL Server:', error);
        process.exit(1);
    }
};

const initializeModels = () => { // This function should be called before sequelize.sync
  // Pass sequelize instance to init
  const sequelize = getSequelizeInstance();
  User.init(
    {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' },
    firstName: { type: DataTypes.STRING, allowNull: true },
    lastName: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    resetToken: { type: DataTypes.STRING, allowNull: true },
    resetTokenExpiry: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: 'User', tableName: 'Ecom_Customers', timestamps: true,
    indexes: [
      { unique: true, fields: ['username'] },
      { unique: true, fields: ['email'] }
    ]
  }
);
  Product.init(
    {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Ecom_Categories', key: 'id' },
    },
    features: {
      type: DataTypes.TEXT,
      allowNull: false, // Assuming never null, default is '{}'
      defaultValue: '{}',
      get(this: Product): { [key: string]: any } { // Explicitly return object
          const rawValue = this.getDataValue('features');
          try {
            // Ensure rawValue is treated as string if it's not null/undefined
            return (typeof rawValue === 'string' && rawValue.length > 0) ? JSON.parse(rawValue) : {};
          } catch (e) {
            console.error("Failed to parse features JSON:", rawValue, e);
            return {};
          }
        },
      set(this: Product, value: { [key: string]: any }) { // Type '{ [key: string]: any } | null' for setter
        // Ensure value is handled for null if you intend to allow null in DB
        this.setDataValue('features', JSON.stringify(value));
      }
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: true, // Images are now optional
      defaultValue: '[]',
       get(this: Product): string[] {
        const rawValue = this.getDataValue('images');
        console.log("Product images getter - rawValue:", rawValue, "type:", typeof rawValue);
        try {
          if (rawValue === null || rawValue === undefined || rawValue === '') {
            console.log("Product images getter - returning empty array for null/undefined/empty");
            return [];
          }
          // Ensure rawValue is a string before parsing
          if (typeof rawValue === 'string' && rawValue.length > 0) {
            const parsed = JSON.parse(rawValue);
            console.log("Product images getter - parsed:", parsed);
            return Array.isArray(parsed) ? parsed : [];
          }
          console.log("Product images getter - returning empty array for non-string");
          return [];
        } catch (e) {
          console.error("Failed to parse images JSON:", rawValue, e);
          return [];
        }
      },
      set(this: Product, value: string[]) { // Type 'string[] | null' for setter
        // Ensure value is handled for null if you intend to allow null in DB
        this.setDataValue('images', JSON.stringify(value));
      }
    },
    stockQuantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    inStock: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { sequelize, modelName: 'Product', tableName: 'Ecom_Products', timestamps: true }
);

  Category.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    comparisonFields: {
      type: DataTypes.TEXT,
      allowNull: false, // Assuming it's never null, default is '[]'
      defaultValue: '[]',
      get(this: Category): IComparisonField[] { // Removed the extra { here
        const rawValue = this.getDataValue('comparisonFields');
        try {
          return (typeof rawValue === 'string' && rawValue.length > 0) ? JSON.parse(rawValue) : [];
        } catch (e) {
          console.error("Failed to parse comparisonFields JSON:", rawValue, e);
          return [];
        }
      },
      set(this: Category, value: IComparisonField[]) { // Value should be non-null array type
        // Ensure we always stringify an array, not null/undefined
        this.setDataValue('comparisonFields', JSON.stringify(value || [])); // FIX: Handles null/undefined explicitly
      },
    },
  },
  { sequelize, modelName: 'Category', tableName: 'Ecom_Categories', timestamps: true,
    indexes: [{ unique: true, fields: ['name'] }]
  }
);

  ComparisonField.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Ecom_Categories', key: 'id' },
    },
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false }, // 'text', 'number', 'boolean', 'select', 'multiselect'
    required: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    options: {
      type: DataTypes.TEXT, // Store as JSON string
      allowNull: true, // Options might not be present for all types (e.g., text, number)
      get(this: ComparisonField): string[] | null {
        const rawValue = this.getDataValue('options');
        try {
          // Ensure rawValue is a string before parsing
          return (typeof rawValue === 'string' && rawValue.length > 0) ? JSON.parse(rawValue) : null;
        } catch (e) {
          console.error("Failed to parse options JSON in ComparisonField getter:", rawValue, e);
          return null;
        }
      },
      set(this: ComparisonField, value: string[] | null) { // Type 'string[] | null' for setter
        // Ensure value is handled for null if you intend to allow null in DB
        this.setDataValue('options',  JSON.stringify(value));
      }
    },
    unit: { type: DataTypes.STRING, allowNull: true },
    displayOrder: { type: DataTypes.INTEGER, allowNull: true },
  },
  { sequelize, modelName: 'ComparisonField', tableName: 'Ecom_ComparisonFields', timestamps: true }
);
  Address.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Ecom_Customers', key: 'id' },
    },
    street: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    zipCode: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: false, defaultValue: 'United States' },
    isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  { sequelize, modelName: 'Address', tableName: 'Ecom_Addresses', timestamps: true }
);


  Order.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Ecom_Customers', key: 'id' },
    },
    orderDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
    shippingAddressId: {
      type: DataTypes.INTEGER,
      allowNull: true, // This allows a null value if an address isn't linked, or use allowNull: false if always required
      references: { model: 'Ecom_Addresses', key: 'id' },
    },
    paymentMethod: { // <--- Added paymentMethod here based on OrderAttributes
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, modelName: 'Order', tableName: 'Ecom_Orders', timestamps: true }
);

  OrderProduct.init({
     id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Ecom_Orders', key: 'id' },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Ecom_Products', key: 'id' },
    },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  },
  { sequelize, modelName: 'OrderProduct', tableName: 'Ecom_OrderProducts', timestamps: true }
);

  EmailDeliveryStatus.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Ecom_Orders', key: 'id' },
    },
    jobId: { type: DataTypes.STRING, allowNull: false },
    status: { 
      type: DataTypes.ENUM('pending', 'sent', 'delivered', 'failed', 'bounced'),
      allowNull: false,
      defaultValue: 'pending'
    },
    provider: { type: DataTypes.STRING, allowNull: true },
    messageId: { type: DataTypes.STRING, allowNull: true },
    error: { type: DataTypes.TEXT, allowNull: true },
    attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    lastAttempt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: 'EmailDeliveryStatus', tableName: 'Ecom_EmailDeliveryStatuses', timestamps: true }
);

  DummyCardInfo.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Ecom_Customers', key: 'id' },
    },
    cardNumber: { type: DataTypes.STRING(16), allowNull: false },
    expMonth: { type: DataTypes.INTEGER, allowNull: false },
    expYear: { type: DataTypes.INTEGER, allowNull: false },
    cvv: { type: DataTypes.STRING(4), allowNull: false },
  },
  { sequelize, modelName: 'DummyCardInfo', tableName: 'Ecom_DummyCardInfo', timestamps: true }
);

  Payment.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Ecom_Customers', key: 'id' },
    },
    dummyCardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Ecom_DummyCardInfo', key: 'id' },
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Ecom_Orders', key: 'id' },
    },
    amountCents: { type: DataTypes.INTEGER, allowNull: false },
    currency: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'USD' },
    transactionId: { type: DataTypes.STRING(255), allowNull: false },
    status: { type: DataTypes.STRING(50), allowNull: false },
  },
  { sequelize, modelName: 'Payment', tableName: 'Ecom_Payments', timestamps: true }
);

  // Apple.init({
  //   id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  //   productId: {
  //     type: DataTypes.INTEGER,
  //     allowNull: false,
  //     references: { model: 'Ecom_Products', key: 'id' },
  //   },
  //   model: { type: DataTypes.STRING, allowNull: true },
  //   storage: { type: DataTypes.STRING, allowNull: true },
  //   color: { type: DataTypes.STRING, allowNull: true },
  //   retailerPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  //   retailerUrl: { type: DataTypes.STRING(500), allowNull: true },
  //   availability: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  //   createdAt: { type: DataTypes.DATE, allowNull: false },
  //   updatedAt: { type: DataTypes.DATE, allowNull: false },
  // },
  // { sequelize, modelName: 'Apple', tableName: 'Ecom_Apple', timestamps: true }
  // );

  // Samsung.init({
  //   id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  //   productId: {
  //     type: DataTypes.INTEGER,
  //     allowNull: false,
  //     references: { model: 'Ecom_Products', key: 'id' },
  //   },
  //   model: { type: DataTypes.STRING, allowNull: true },
  //   storage: { type: DataTypes.STRING, allowNull: true },
  //   color: { type: DataTypes.STRING, allowNull: true },
  //   screenSize: { type: DataTypes.STRING, allowNull: true },
  //   retailerPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  //   retailerUrl: { type: DataTypes.STRING(500), allowNull: true },
  //   availability: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  //   createdAt: { type: DataTypes.DATE, allowNull: false },
  //   updatedAt: { type: DataTypes.DATE, allowNull: false },
  // },
  // { sequelize, modelName: 'Samsung', tableName: 'Ecom_Samsung', timestamps: true }
  // );

  // Sony.init({
  //   id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  //   productId: {
  //     type: DataTypes.INTEGER,
  //     allowNull: false,
  //     references: { model: 'Ecom_Products', key: 'id' },
  //   },
  //   model: { type: DataTypes.STRING, allowNull: true },
  //   type: { type: DataTypes.STRING, allowNull: true },
  //   color: { type: DataTypes.STRING, allowNull: true },
  //   retailerPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  //   retailerUrl: { type: DataTypes.STRING(500), allowNull: true },
  //   availability: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  //   createdAt: { type: DataTypes.DATE, allowNull: false },
  //   updatedAt: { type: DataTypes.DATE, allowNull: false },
  // },
  // { sequelize, modelName: 'Sony', tableName: 'Ecom_Sony', timestamps: true }
  // );

  const GiftRegistry = sequelize.define('GiftRegistry', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Ecom_Customers',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shareableUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: 'Ecom_GiftRegistries',
    timestamps: true,
  });

  const GiftRegistryItem = sequelize.define('GiftRegistryItem', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    registryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Ecom_GiftRegistries',
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Ecom_Products',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium',
    },
  }, {
    tableName: 'Ecom_GiftRegistryItems',
    timestamps: true,
  });

  const GiftCard = sequelize.define('GiftCard', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    purchasedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Ecom_Customers',
        key: 'id',
      },
    },
    recipientEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'Ecom_GiftCards',
    timestamps: true,
  });

  const GiftCardTransaction = sequelize.define('GiftCardTransaction', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    giftCardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Ecom_GiftCards',
        key: 'id',
      },
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Ecom_Orders',
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('purchase', 'redemption'),
      allowNull: false,
    },
  }, {
    tableName: 'Ecom_GiftCardTransactions',
    timestamps: true,
  });

  const NotificationModel = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Ecom_Customers',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('order_status', 'gift_card_received', 'gift_card_shared', 'gift_registry_shared'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    relatedId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'Ecom_Notifications',
    timestamps: true,
  });

  GiftRegistry.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  GiftRegistry.hasMany(GiftRegistryItem, { foreignKey: 'registryId', as: 'items' });
  
  GiftRegistryItem.belongsTo(GiftRegistry, { foreignKey: 'registryId', as: 'registry' });
  GiftRegistryItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
  
  GiftCard.belongsTo(User, { foreignKey: 'purchasedBy', as: 'purchaser' });
  GiftCard.hasMany(GiftCardTransaction, { foreignKey: 'giftCardId', as: 'transactions' });
  
  GiftCardTransaction.belongsTo(GiftCard, { foreignKey: 'giftCardId', as: 'giftCard' });
  GiftCardTransaction.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
  
  NotificationModel.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  Object.values(sequelize.models).forEach(model => {
  if (typeof (model as any).associate === 'function') {
    (model as any).associate(sequelize.models);
  }
});
}





export { initializeDatabase, User, Product, Category, ComparisonField, Order, OrderProduct, Address, EmailDeliveryStatus, DummyCardInfo, Payment };
// getSequelizeInstance is already exported above
