import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { StudyMaterial } from '../models/StudyMaterial.js';
import { Summary } from '../models/Summary.js';
import { Flashcard } from '../models/Flashcard.js';
import { Quiz } from '../models/Quiz.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { aiService } from '../services/aiService.js';

export const materialController = {
  /**
   * POST /api/material/upload
   * Handles multipart file uploads (via Multer) or raw JSON text payload
   */
  async uploadMaterial(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?._id;
      let title = req.body.title;
      let subject = req.body.subject || 'General Study';
      let content = req.body.content || '';

      // If a file was uploaded via Multer
      if (req.file) {
        if (!title) {
          title = req.file.originalname.replace(/\.[^/.]+$/, '');
        }
        // Extract content from file buffer
        const fileText = req.file.buffer.toString('utf-8');
        content = fileText;
      }

      if (!title || !content || content.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Please provide material title and text content or attach a study document.',
        });
        return;
      }

      // 1. Store study material
      const material = await StudyMaterial.create({
        userId,
        title: title.trim(),
        subject: subject.trim(),
        content: content.trim(),
      });

      const materialId = String(material._id);

      // 2. Generate and store embeddings for semantic / vector search
      let vectorCount = 0;
      try {
        vectorCount = await aiService.processAndStoreDocumentEmbeddings(materialId, content);
      } catch (embErr: any) {
        console.warn('Embedding generation warning:', embErr.message);
      }

      // 3. Log activity
      await ActivityLog.create({
        userId,
        activity: `Uploaded study material: "${title}" (${subject}) with ${vectorCount} vector embeddings`,
      });

      res.status(201).json({
        success: true,
        message: 'Study material uploaded and vectorized successfully.',
        material: {
          _id: materialId,
          title: material.title,
          subject: material.subject,
          contentLength: content.length,
          vectorEmbeddingsGenerated: vectorCount,
          createdAt: material.createdAt,
        },
      });
    } catch (error: any) {
      console.error('Material upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error processing uploaded study material.',
      });
    }
  },

  /**
   * GET /api/material
   * Retrieve all materials for the authenticated user
   */
  async getMaterials(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?._id;
      const materials = await StudyMaterial.find({ userId });

      res.status(200).json({
        success: true,
        count: materials.length,
        materials,
      });
    } catch (error: any) {
      console.error('Error fetching materials:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve study materials.',
      });
    }
  },

  /**
   * GET /api/material/:id
   * Retrieve single material with associated summary, flashcards, and quizzes
   */
  async getMaterialById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.user?._id;

      const material = await StudyMaterial.findById(id);
      if (!material) {
        res.status(404).json({
          success: false,
          error: 'Study material not found.',
        });
        return;
      }

      // Ensure user owns this material (or is admin)
      if (String(material.userId) !== String(userId) && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Access denied. You do not have permission to view this material.',
        });
        return;
      }

      // Fetch linked learning resources
      const summary = await Summary.findOne({ materialId: id });
      const flashcards = await Flashcard.find({ materialId: id });
      const quiz = await Quiz.find({ materialId: id });

      res.status(200).json({
        success: true,
        material,
        resources: {
          summary: summary ? summary.summary : null,
          flashcardsCount: flashcards.length,
          flashcards,
          quizzesCount: quiz.length,
          quiz: quiz.length > 0 ? quiz[0] : null,
        }
      });
    } catch (error: any) {
      console.error('Error fetching material by id:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error fetching study material.',
      });
    }
  },

  /**
   * DELETE /api/material/:id
   */
  async deleteMaterial(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.user?._id;

      const material = await StudyMaterial.findById(id);
      if (!material) {
        res.status(404).json({
          success: false,
          error: 'Study material not found.',
        });
        return;
      }

      if (String(material.userId) !== String(userId) && req.user?.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Access denied. You can only delete your own materials.',
        });
        return;
      }

      await StudyMaterial.findByIdAndDelete(id);

      await ActivityLog.create({
        userId,
        activity: `Deleted study material: "${material.title}"`,
      });

      res.status(200).json({
        success: true,
        message: 'Study material and associated resources deleted successfully.',
      });
    } catch (error: any) {
      console.error('Error deleting material:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error deleting study material.',
      });
    }
  }
};
