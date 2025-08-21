// src/controllers/authController.test.ts

import { Request, Response } from 'express';
import { register, login, getProfile, updateProfile } from '../authController';
import { AuthRequest} from '../../types'; // Assuming UserAttributes from types or models/User
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { User, UserAttributes } from '../../models/User'; 


jest.mock('../../models/User', () => {
  const mockUserInstance = {
    id: 123, // Changed from _id to id for Sequelize
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(), // Added updatedAt
    save: jest.fn().mockResolvedValue(true),
    comparePassword: jest.fn(),
    toJSON: jest.fn(function() { // Mock toJSON to remove password
      const {
        password,
        ...rest
      } = this as any;
      return rest;
    }),
  };


  // Mock User constructor/model that mimics static Sequelize methods
  const mockUserConstructor = jest.fn().mockImplementation((data) => ({
    ...mockUserInstance,
    ...data,
    toJSON: jest.fn(function() { // Ensure toJSON is on instance created by constructor
      const {
        password,
        ...rest
      } = this as any;
      return rest;
    }),
  }))
  // Assign static methods to the constructor mock
  const mockUser = Object.assign(mockUserConstructor, {
    findOne: jest.fn(),
    findByPk: jest.fn(), // Added findByPk for getProfile/updateProfile
    update: jest.fn(), // Added update for updateProfile
    create: jest.fn(),
  });

  return {
    User: mockUser
  }
})

jest.mock('jsonwebtoken');
jest.mock('express-validator');

const mockJwt = jwt as jest.Mocked<typeof jwt>;
const mockValidationResult = validationResult as jest.MockedFunction<typeof validationResult>;

const { User: mockUser } = require('../../models/User'); // Import the mocked User

describe('AuthController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockAuthReq: Partial<AuthRequest>;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    mockAuthReq = { // For authenticated routes
      body: {},
      params: {},
      user: {
        id: 1, // Changed from _id to id
        email: 'auth@example.com',
        firstName: 'Auth',
        lastName: 'User',
        role: 'user',
        //createdAt: new Date(),
        //updatedAt: new Date(),
      },
    };
    mockValidationResult.mockClear();
    (validationResult as unknown as jest.Mock).mockClear();
    //(validationResult as jest.Mock).mockClear();
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        username: 'newuser',
      };

      mockReq.body = userData;
      mockValidationResult.mockReturnValue({ isEmpty: () => true } as any);
  
      const createdUserMock = {
        id: 123, // Changed from _id to id
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: jest.fn(function() {
          const {
            password,
            ...rest
          } = this as any;
          return rest;
        }),
      };
      mockUser.create.mockResolvedValue(createdUserMock); // FIX: Ensure create returns a mock instance with 'save'

      (mockJwt.sign as jest.Mock).mockReturnValue('mocked_jwt_token'); 

      await register(mockReq as Request, mockRes as Response);

      expect(mockUser.create).toHaveBeenCalledWith(expect.objectContaining({
         email: userData.email,
        username: userData.username,
      }));
      expect(mockJwt.sign).toHaveBeenCalledWith({
        userId: createdUserMock.id
      }, expect.any(String), expect.any(Object));
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        token: 'mocked_jwt_token',
        user: expect.objectContaining({
          id: createdUserMock.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          username: userData.username,
          role: 'user',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      });
    });
    it('should return 500 for server error', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => true
      } as any);
      mockUser.create.mockRejectedValue(new Error('Database error'));

      await register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
    });
  });

    it('should return 400 if validation fails', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{
          msg: 'Email is required'
        }]
      } as any);

      await register(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: expect.any(Array)
      });
    });

    it('should return 400 if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
        username: 'existinguser',
      };
      mockReq.body = userData;

      mockValidationResult.mockReturnValue({
        isEmpty: () => true
      } as any);
      mockUser.findOne.mockResolvedValue(true); // User already exists

      await register(mockReq as Request, mockRes as Response);

      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: {
          email: userData.email
        }
      });
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User already exists with this email'
      });
    });

    

  describe('login', () => {
    it('should log in a user successfully', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' };
      mockReq.body = loginData;
      mockValidationResult.mockReturnValue({ isEmpty: () => true } as any);

      const existingUserMock = {
        id: 1, // Changed from _id to id
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        comparePassword: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn(function() {
          const {
            password,
            ...rest
          } = this as any;
          return rest;
        }),
      };

      mockUser.findOne.mockResolvedValue(existingUserMock);
      //mockJwt.sign.mockReturnValue('mocked_jwt_token');
      (mockJwt.sign as jest.Mock).mockReturnValue('mocked_jwt_token'); 

      await login(mockReq as Request, mockRes as Response);

      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: {
          email: loginData.email
        }
      });
      expect(existingUserMock.comparePassword).toHaveBeenCalledWith(loginData.password);
      expect(mockRes.status).toHaveBeenCalledWith(200); // Corrected expectation
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Logged in successfully',
        token: 'mocked_jwt_token',
        user: expect.objectContaining({
          id: 1,
          email: loginData.email,
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          role: 'user',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          // password should not be in response, so this line is correctly removed
        }),
      });
    });
    
    it('should return 401 for invalid credentials (user not found)', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      mockReq.body = loginData;

      mockValidationResult.mockReturnValue({
        isEmpty: () => true
      } as any);
      mockUser.findOne.mockResolvedValue(null);

      await login(mockReq as Request, mockRes as Response);

      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: {
          email: loginData.email
        }
      });
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });
    it('should return 401 for invalid credentials (password mismatch)', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      mockReq.body = loginData;

      mockValidationResult.mockReturnValue({
        isEmpty: () => true
      } as any);
      const existingUserMock = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        comparePassword: jest.fn().mockResolvedValue(false),
        toJSON: jest.fn(function() {
          const {
            password,
            ...rest
          } = this as any;
          return rest;
        }),
      };
      mockUser.findOne.mockResolvedValue(existingUserMock);

      await login(mockReq as Request, mockRes as Response);

      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: {
          email: loginData.email
        }
      });
      expect(existingUserMock.comparePassword).toHaveBeenCalledWith(loginData.password);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });

    it('should return 400 if validation fails', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{
          msg: 'Email is required'
        }]
      } as any);

      await login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: expect.any(Array)
      });
    });

    it('should return 401 for invalid credentials (user not found)', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      mockReq.body = loginData;

      mockValidationResult.mockReturnValue({
        isEmpty: () => true
      } as any);
      mockUser.findOne.mockResolvedValue(null); // User not found

      await login(mockReq as Request, mockRes as Response);

      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: {
          email: loginData.email
        }
      });
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });

    it('should return 401 for invalid credentials (password mismatch)', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      mockReq.body = loginData;

      mockValidationResult.mockReturnValue({
        isEmpty: () => true
      } as any);
      const existingUserMock = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        comparePassword: jest.fn().mockResolvedValue(false), // Password mismatch
        toJSON: jest.fn(function() {
          const {
            password,
            ...rest
          } = this as any;
          return rest;
        }),
      };
      mockUser.findOne.mockResolvedValue(existingUserMock);

      await login(mockReq as Request, mockRes as Response);

      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: {
          email: loginData.email
        }
      });
      expect(existingUserMock.comparePassword).toHaveBeenCalledWith(loginData.password);
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid credentials'
      });
    });

    it('should return 500 for server error', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => true
      } as any);
      mockUser.findOne.mockRejectedValue(new Error('Database error'));

      await login(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      const userProfile = {
        id: 1, // Changed from _id to id
        email: 'auth@example.com',
        firstName: 'Authenticated',
        lastName: 'User',
        username: 'authuser',
        role: 'user',
        phone: '123-456-7890',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
        toJSON: jest.fn(function() {
          const {
            password,
            ...rest
          } = this as any;
          return rest;
        }),
      };
      mockUser.findByPk.mockResolvedValue(userProfile);

      await getProfile(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockUser.findByPk).toHaveBeenCalledWith(mockAuthReq.user?.id);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        user: expect.objectContaining({
          id: userProfile.id,
          email: userProfile.email,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          username: userProfile.username,
          phone: userProfile.phone,
          role: userProfile.role,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      });
    });

    it('should return 401 if user not authenticated', async () => {
      mockAuthReq.user = undefined

      await getProfile(mockAuthReq as AuthRequest, mockRes as Response)

      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User not authenticated',
      })
    })

    it('should return 404 if user not found after authentication', async () => {
      mockUser.findByPk.mockResolvedValue(null); // User not found in DB

      await getProfile(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User profile not found'
      });
    });

    it('should return 500 for server error', async () => {
      mockUser.findByPk.mockRejectedValue(new Error('Database error'));

      await getProfile(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'jane.smith',
        phone: '987-654-3210'
      };

      mockAuthReq.body = updateData;
      mockAuthReq.user = {
        id: 1 // Changed from _id to id
      } as any

      mockUser.update.mockResolvedValue([1]); // Indicating 1 row affected

      // Mock findByPk to return the updated user after the static update call
      const mockUpdatedUser = {
        id: 1, // Changed from _id to id
        email: 'test@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'jane.smith',
        phone: '987-654-3210',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: jest.fn(function() {
          const {
            password,
            ...rest
          } = this as any;
          return rest;
        }),
      }

      mockUser.findByPk.mockResolvedValue(mockUpdatedUser); 

      await updateProfile(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockUser.update).toHaveBeenCalledWith(
        expect.objectContaining(updateData), {
          where: {
            id: mockAuthReq.user?.id
          }
        }
      );
      expect(mockUser.findByPk).toHaveBeenCalledWith(mockAuthReq.user?.id); // Should fetch the user again
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Profile updated successfully',
        user: expect.objectContaining({
          id: mockUpdatedUser.id,
          firstName: mockUpdatedUser.firstName,
          lastName: mockUpdatedUser.lastName,
          username: mockUpdatedUser.username,
          phone: mockUpdatedUser.phone,
          email: mockUpdatedUser.email,
          role: mockUpdatedUser.role,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          // password should not be in response, so remove: password: undefined,
        }),
      });
    });

    it('should return error for unauthenticated user', async () => {
      mockAuthReq.user = undefined

      await updateProfile(mockAuthReq as AuthRequest, mockRes as Response)

      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User not authenticated',
      })
    })

    it('should return 404 if user not found or no changes made', async () => {
      mockAuthReq.user = {
        id: 999
      } as any; // Mock a user ID that won't be found
      mockReq.body = {
        firstName: 'No',
        lastName: 'Change'
      };

      mockUser.update.mockResolvedValue([0]); // 0 affected rows

      await updateProfile(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockUser.update).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User not found or no changes made'
      });
    });

    it('should return 500 for server error', async () => {
      mockAuthReq.user = {
        id: 1
      } as any;
      mockReq.body = {
        firstName: 'Error',
        lastName: 'User'
      };

      mockUser.update.mockRejectedValue(new Error('Database error'));

      await updateProfile(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
    });
  });
});
