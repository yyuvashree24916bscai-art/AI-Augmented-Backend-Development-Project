import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { verifyJWT } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', verifyJWT, authController.me);

export default router;
