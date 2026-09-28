import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { User } from '../models/User.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { StudyMaterial } from '../models/StudyMaterial.js';
import { Summary } from '../models/Summary.js';
import { Flashcard } from '../models/Flashcard.js';
import { Quiz } from '../models/Quiz.js';
import { Chat } from '../models/Chat.js';
import { isConnectedToMongo, isUsingMemoryStore } from '../utils/db.js';

export const adminController = {
  /**
   * GET /api/admin/users
   * Admin only: List all registered users and their stats
   */
  async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const users = await User.find();
      const sanitizedUsers = await Promise.all(
        users.map(async (u: any) => {
          const materialCount = await StudyMaterial.countDocuments({ userId: u._id });
          return {
            id: String(u._id),
            name: u.name,
            email: u.email,
            role: u.role,
            materialsUploaded: materialCount,
            createdAt: u.createdAt,
          };
        })
      );

      res.status(200).json({
        success: true,
        count: sanitizedUsers.length,
        users: sanitizedUsers,
      });
    } catch (error: any) {
      console.error('Admin getUsers error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve system users.',
      });
    }
  },

  /**
   * GET /api/admin/activity
   * Admin only: List all system activities and AI usage
   */
  async getActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const logs = await ActivityLog.find();
      const totalUsers = await User.countDocuments();
      const totalMaterials = await StudyMaterial.countDocuments();
      const allSummaries = await Summary.find();
      const allFlashcards = await Flashcard.find();
      const allQuizzes = await Quiz.find();
      const allChats = await Chat.find();

      res.status(200).json({
        success: true,
        metrics: {
          totalUsers,
          totalMaterials,
          totalSummaries: allSummaries.length,
          totalFlashcards: allFlashcards.length,
          totalQuizzes: allQuizzes.length,
          totalAiQueries: allChats.length,
          databaseStatus: isConnectedToMongo ? 'MongoDB Atlas Connected' : 'Resilient In-Memory Mode',
          aiEngine: process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
            ? 'Google Gemini 2.5 Flash (Active)'
            : 'Gemini 2.5 Flash / Academic Engine (Ready)',
        },
        activityLogs: logs,
      });
    } catch (error: any) {
      console.error('Admin getActivity error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve application activity.',
      });
    }
  }
};
