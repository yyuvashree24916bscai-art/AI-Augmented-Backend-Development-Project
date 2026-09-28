import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { StudyMaterial } from '../models/StudyMaterial.js';
import { Summary } from '../models/Summary.js';
import { Flashcard } from '../models/Flashcard.js';
import { Quiz } from '../models/Quiz.js';
import { StudyPlan } from '../models/StudyPlan.js';
import { Chat } from '../models/Chat.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { Blog } from '../models/Blog.js';
import { aiService } from '../services/aiService.js';

export const aiController = {
  /**
   * POST /api/materials/:id/summarize
   * Generates AI summary for a specific study material
   */
  async summarizeMaterial(req: AuthenticatedRequest, res: Response): Promise<void> {
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
          error: 'Access denied. You do not own this material.',
        });
        return;
      }

      // Generate summary via AI Service Layer
      const generatedSummaryText = await aiService.createSummary(material.content, material.subject);

      // Store in Summary collection
      const summaryDoc = await Summary.create({
        userId,
        materialId: id,
        summary: generatedSummaryText,
      });

      // Log activity
      await ActivityLog.create({
        userId,
        activity: `Generated AI Summary for material: "${material.title}"`,
      });

      res.status(200).json({
        success: true,
        message: 'Summary generated successfully.',
        materialTitle: material.title,
        summary: summaryDoc.summary,
        summaryId: summaryDoc._id,
      });
    } catch (error: any) {
      console.error('Summarize error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate study summary.',
      });
    }
  },

  /**
   * POST /api/ai/flashcards
   * Generates flashcards from materialId or custom content
   */
  async generateFlashcards(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?._id;
      const { materialId, content, count } = req.body;

      let textToProcess = content;
      let targetMaterialId = materialId;

      if (materialId) {
        const material = await StudyMaterial.findById(materialId);
        if (!material) {
          res.status(404).json({ success: false, error: 'Material not found.' });
          return;
        }
        textToProcess = material.content;
      }

      if (!textToProcess || textToProcess.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Please provide materialId or text content to generate flashcards.',
        });
        return;
      }

      const numCards = Number(count) || 5;
      const flashcardsData = await aiService.createFlashcards(textToProcess, numCards);

      // Save to Flashcard collection
      const toSave = flashcardsData.map(f => ({
        userId,
        materialId: targetMaterialId || null,
        question: f.question,
        answer: f.answer,
      }));

      const savedCards = await Flashcard.insertMany(toSave);

      await ActivityLog.create({
        userId,
        activity: `Generated ${savedCards.length} flashcards`,
      });

      res.status(200).json({
        success: true,
        count: savedCards.length,
        flashcards: savedCards,
      });
    } catch (error: any) {
      console.error('Flashcard generation error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate flashcards.',
      });
    }
  },

  /**
   * POST /api/ai/quiz
   * Generates multiple-choice quiz
   */
  async generateQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?._id;
      const { materialId, content, count, title } = req.body;

      let textToProcess = content;
      let quizTitle = title || 'Custom Quiz';

      if (materialId) {
        const material = await StudyMaterial.findById(materialId);
        if (!material) {
          res.status(404).json({ success: false, error: 'Material not found.' });
          return;
        }
        textToProcess = material.content;
        quizTitle = `Quiz: ${material.title}`;
      }

      if (!textToProcess || textToProcess.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Please provide materialId or content for quiz generation.',
        });
        return;
      }

      const numQuestions = Number(count) || 4;
      const quizQuestions = await aiService.createQuiz(textToProcess, numQuestions);

      const createdQuiz = await Quiz.create({
        userId,
        materialId: materialId || null,
        title: quizTitle,
        questions: quizQuestions,
      });

      await ActivityLog.create({
        userId,
        activity: `Generated Practice Quiz: "${quizTitle}" with ${quizQuestions.length} questions`,
      });

      res.status(200).json({
        success: true,
        quiz: createdQuiz,
        questions: quizQuestions,
      });
    } catch (error: any) {
      console.error('Quiz generation error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate quiz.',
      });
    }
  },

  /**
   * POST /api/ai/study-plan
   * Generates personalized study plan
   */
  async generateStudyPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?._id;
      const { subject, topics, examDate, dailyHours } = req.body;

      if (!subject) {
        res.status(400).json({
          success: false,
          error: 'Please provide the subject for your study plan.',
        });
        return;
      }

      const planText = await aiService.createStudyPlan(
        subject,
        topics || 'Core curriculum and uploaded materials',
        examDate || 'Next 2 Weeks',
        dailyHours ? Number(dailyHours) : 2
      );

      const savedPlan = await StudyPlan.create({
        userId,
        studyPlan: planText,
        examDate: examDate || '',
      });

      await ActivityLog.create({
        userId,
        activity: `Generated Personalized Study Plan for "${subject}" (Exam: ${examDate || 'TBD'})`,
      });

      res.status(200).json({
        success: true,
        studyPlan: savedPlan,
        plan: planText,
      });
    } catch (error: any) {
      console.error('Study plan generation error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate study plan.',
      });
    }
  },

  /**
   * POST /api/ai/chat
   * RAG-Augmented AI Chat Assistant & Document Q&A
   */
  async chat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?._id;
      const { prompt, materialId, history } = req.body;

      if (!prompt || prompt.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Please provide a prompt/question for the AI assistant.',
        });
        return;
      }

      // Fetch recent user chat history if not explicitly provided
      let chatHistory = history;
      if (!chatHistory || !Array.isArray(chatHistory)) {
        const recentChats = await Chat.find({ userId });
        chatHistory = recentChats.slice(-4).map((c: any) => ({
          prompt: c.prompt,
          response: c.response,
        }));
      }

      // Invoke AI service with RAG
      const { response: aiResponse, contextSources } = await aiService.chatWithRAG(
        prompt.trim(),
        userId,
        materialId,
        chatHistory
      );

      // Store in Chat collection
      const storedChat = await Chat.create({
        userId,
        prompt: prompt.trim(),
        response: aiResponse,
      });

      await ActivityLog.create({
        userId,
        activity: `AI Chat Query: "${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}"`,
      });

      res.status(200).json({
        success: true,
        prompt,
        response: aiResponse,
        reply: aiResponse,
        contextSources,
        timestamp: storedChat.timestamp,
      });
    } catch (error: any) {
      console.error('Chat error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'AI Chat Assistant failed to process response.',
      });
    }
  },

  /**
   * POST /api/ai/search
   * Semantic Vector Search + Atlas Full-Text Search
   */
  async search(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?._id;
      const { query } = req.body;

      if (!query || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Please provide a search query.',
        });
        return;
      }

      const searchResult = await aiService.performSemanticSearch(query.trim(), userId, 5);

      await ActivityLog.create({
        userId,
        activity: `Semantic Vector Search: "${query.slice(0, 40)}"`,
      });

      res.status(200).json({
        success: true,
        ...searchResult,
      });
    } catch (error: any) {
      console.error('Search error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to perform semantic search.',
      });
    }
  },

  /**
   * POST /api/ai/generate-blog
   * Generate an engaging AI Blog post using Google Gemini
   */
  async generateBlog(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?._id;
      const {
        topic,
        title,
        prompt,
        subject,
        keywords,
        tags,
        category,
        context,
        materialId,
        saveToDatabase,
      } = req.body;

      const blogTopic = topic || title || prompt || subject;

      if (!blogTopic || String(blogTopic).trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Please provide a topic, title, or prompt for the blog post.',
        });
        return;
      }

      let extraContext = context || '';
      if (materialId) {
        const mat = await StudyMaterial.findById(materialId);
        if (mat && mat.content) {
          extraContext = (extraContext ? extraContext + '\n\n' : '') + mat.content;
        }
      }

      const blogCategory = category || 'Technology';
      const blogKeywords = Array.isArray(keywords)
        ? keywords
        : Array.isArray(tags)
        ? tags
        : typeof keywords === 'string'
        ? keywords.split(',').map((k: string) => k.trim())
        : [];

      const generated = await aiService.createBlogPost(
        String(blogTopic).trim(),
        blogKeywords,
        extraContext,
        String(blogCategory).trim()
      );

      const authorId = req.user ? req.user._id : '65f1a0000000000000000002';
      const authorName = req.user ? req.user.name : 'Student';

      // Auto-save to blog collection
      const savedBlogDoc = await Blog.create({
        userId: req.user?._id,
        title: generated.title,
        content: generated.content,
        author: String(authorId),
        authorName: String(authorName),
        category: String(blogCategory || 'technology').toLowerCase(),
        tags: generated.tags,
      });

      if (userId) {
        await ActivityLog.create({
          userId,
          activity: `Generated AI Blog Post: "${generated.title}"`,
        });
      }

      const responsePayload: any = {
        _id: String(savedBlogDoc._id),
        title: generated.title,
        content: generated.content,
        category: String(blogCategory || 'technology').toLowerCase(),
        author: String(authorId),
        authorName: String(authorName),
        tags: generated.tags,
        createdAt: savedBlogDoc.createdAt,
        updatedAt: savedBlogDoc.updatedAt,
        summary: generated.summary,
        success: true,
        message: 'AI Blog post generated successfully!',
        blog: savedBlogDoc,
        data: savedBlogDoc,
      };

      res.status(201).json(responsePayload);
    } catch (error: any) {
      console.error('Generate blog error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate AI blog post.',
      });
    }
  },

  /**
   * POST /api/ai/summarize
   * Direct content summarization endpoint (matching college video)
   */
  async summarize(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { content, text, body, prompt, subject } = req.body;
      const textToSummarize = content || text || body || prompt;

      if (!textToSummarize || String(textToSummarize).trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Please provide content to summarize.',
        });
        return;
      }

      const summaryText = await aiService.createSummary(String(textToSummarize).trim(), subject);

      res.status(200).json({
        summary: summaryText,
        success: true,
      });
    } catch (error: any) {
      console.error('Summarize error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate summary.',
      });
    }
  },
};
