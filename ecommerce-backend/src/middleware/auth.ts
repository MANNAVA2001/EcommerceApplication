import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../config/database'; 
import { AuthRequest } from '../models/User';
// updated auth middleware to handle authentication and authorization
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('[Auth Middleware] Incoming Authorization Header:', authHeader);
  console.log('[Auth Middleware] Extracted Token:', token ? token.substring(0, 30) + '...' : 'No Token'); // Log first 30 chars

  if (!token) {
    console.debug('[Auth Middleware] No access token provided. Sending 401.');
    res.status(401).json({ message: 'Access token required' });
    return;
  }


    try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET environment variable is required') })()) as any;
    console.log('[Auth Middleware] Token decoded:', decoded);

    const user = await User.findByPk(decoded.userId);
    console.log('[Auth Middleware] User found by ID:', user ? `ID: ${user.id}, Email: ${user.email}` : 'No user found');
    
    if (!user) {
      console.debug('[Auth Middleware] User not found for decoded ID. Sending 401.');
      res.status(401).json({ message: 'Invalid token (user not found)' });
      return;
    }


    req.user = user;
    console.log('[Auth Middleware] Authentication successful. User attached to request.');
    next();
  } catch (error) {
    console.debug('[Auth Middleware] Token verification failed. Sending 403.');
    res.status(403).json({ message: 'Invalid token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }
  next();
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET environment variable is required') })()) as any;
      const user = await User.findByPk(decoded.userId);
      if (user) {
        req.user = user;
      console.log('[Auth Middleware] Optional authentication: User attached (ID: ' + user.id + ')');
      } else {
        console.log('[Auth Middleware] Optional authentication: User not found for decoded ID.');
      }
    } catch (error) {
      console.error('[Auth Middleware] Optional authentication: Token verification failed silently.', (error as Error).message);
    }
  } else {
    console.log('[Auth Middleware] Optional authentication: No token provided.');
  }
  
  next();
};
