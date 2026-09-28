import { Router } from 'express';
import { materialController } from '../controllers/materialController.js';
import { aiController } from '../controllers/aiController.js';
import { verifyJWT } from '../middleware/authMiddleware.js';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';

const router = Router();

// Material management endpoints
router.post('/upload', verifyJWT, uploadMiddleware.single('file'), materialController.uploadMaterial);
router.get('/', verifyJWT, materialController.getMaterials);
router.get('/:id', verifyJWT, materialController.getMaterialById);
router.delete('/:id', verifyJWT, materialController.deleteMaterial);

// Direct summarize route alias
router.post('/:id/summarize', verifyJWT, aiController.summarizeMaterial);

export default router;
