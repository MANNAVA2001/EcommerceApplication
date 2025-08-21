import { Request, Response } from 'express';
import { User } from '../config/database'; // <--- THIS IS THE CORRECT IMPORT PATH FOR INITIALIZED MODELS
import bcrypt from 'bcryptjs'; // Still needed for password hashing (though Sequelize hooks handle it)

export const createSingleAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Check for existing admin
    // Sequelize uses findOne with a 'where' clause, not just a direct object.
    const existingAdmin = await User.findOne({ where: { email: 'admin@ecommerce.com' } });

    if (existingAdmin) {
      // Sequelize uses the destroy method on an instance or a static destroy with a where clause.
      // We can destroy the found instance directly.
      await existingAdmin.destroy();
      console.log('Deleted existing admin user');
    }

    // 2. Create the new admin user
    const saltRounds = 12;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      res.status(500).json({ message: 'Admin password not configured in environment variables' });
      return;
    }
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    
    const admin = await User.create({
      email: 'admin@ecommerce.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      username:'admin'
    });

    // 3. Verify the created admin (optional, create already returns the instance)
    // Sequelize uses findByPk (find by Primary Key) for finding by ID.
    // The primary key is 'id', not '_id' in Sequelize by default.
    const verifyAdmin = await User.findByPk(admin.id);

    res.json({
      message: 'Admin user created successfully',
      user: {
        email: verifyAdmin?.email,
        role: verifyAdmin?.role,
        firstName: verifyAdmin?.firstName,
        lastName: verifyAdmin?.lastName,
        id: verifyAdmin?.id // Use 'id' for Sequelize primary key
      },
      debug: {
        savedRole: admin.role, // Use 'admin' instance directly
        verifiedRole: verifyAdmin?.role
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
