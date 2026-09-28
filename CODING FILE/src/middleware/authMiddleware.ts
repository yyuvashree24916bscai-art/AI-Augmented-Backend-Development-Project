import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    id?: string;
    name: string;
    email: string;
    role: 'student' | 'admin';
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'studybuddy_super_secure_jwt_secret_key_2026';

export const verifyJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Access denied. Missing or invalid Authorization header.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access denied. Bearer token not found.',
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: 'student' | 'admin' };
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication failed. User account no longer exists.',
      });
      return;
    }

    req.user = {
      _id: String(user._id),
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token. Please log in again.',
    });
  }
};
