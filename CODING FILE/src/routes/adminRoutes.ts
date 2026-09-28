import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { verifyJWT } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// Protect both routes using JWT authentication + admin role authorization
router.get('/users', verifyJWT, requireRole('admin'), adminController.getUsers);
router.get('/activity', verifyJWT, requireRole('admin'), adminController.getActivity);

export default router;
