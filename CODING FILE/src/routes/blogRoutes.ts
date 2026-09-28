import { Router, Request, Response, NextFunction } from 'express';
import { blogController } from '../controllers/blogController.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'studybuddy_super_secure_jwt_secret_key_2026';

// Optional auth helper: attaches user if token is provided, but does not reject if missing
const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: 'student' | 'admin' };
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = {
            _id: String(user._id),
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }
      }
    }
  } catch (err) {
    // Ignore invalid token to allow open testing in postman
  }
  next();
};

// Blog REST API Endpoints
router.post('/', optionalAuth, blogController.createBlog);
router.get('/', blogController.getBlogs);
router.get('/:id', blogController.getBlogById);
router.put('/:id', optionalAuth, blogController.updateBlog);
router.patch('/:id', optionalAuth, blogController.updateBlog);
router.delete('/:id', optionalAuth, blogController.deleteBlog);

export default router;
