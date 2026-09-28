import { Router, Request, Response, NextFunction } from 'express';
import { aiController } from '../controllers/aiController.js';
import { verifyJWT, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'studybuddy_super_secure_jwt_secret_key_2026';

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
    // Ignore invalid token for testing ease
  }
  next();
};

router.post('/flashcards', verifyJWT, aiController.generateFlashcards);
router.post('/quiz', verifyJWT, aiController.generateQuiz);
router.post('/study-plan', verifyJWT, aiController.generateStudyPlan);
router.post('/chat', verifyJWT, aiController.chat);
router.post('/search', verifyJWT, aiController.search);
router.post('/summarize', optionalAuth, aiController.summarize);
router.post('/summarizeBlog', optionalAuth, aiController.summarize);
router.post('/summarize-blog', optionalAuth, aiController.summarize);
router.post('/summarize/:id', verifyJWT, aiController.summarizeMaterial);
router.post('/generate-blog', optionalAuth, aiController.generateBlog);
router.post('/generateblog', optionalAuth, aiController.generateBlog);
router.post('/blog', optionalAuth, aiController.generateBlog);

export default router;
