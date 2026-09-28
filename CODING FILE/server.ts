/**
 * AI StudyBuddy - Server Entry Point
 * 
 * Modular MVC Architecture with Express.js, MongoDB/Mongoose, JWT Authentication,
 * Role-Based Access Control, Multer File Uploads, and Google Gemini AI Service.
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, isConnectedToMongo } from './src/utils/db.js';
import authRoutes from './src/routes/authRoutes.js';
import materialRoutes from './src/routes/materialRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import blogRoutes from './src/routes/blogRoutes.js';
import { aiController } from './src/controllers/aiController.js';
import { authController } from './src/controllers/authController.js';
import { verifyJWT } from './src/middleware/authMiddleware.js';

import fs from 'fs';

// 1. Load environment variables
dotenv.config();

const getDirname = () => {
  try {
    if (import.meta && import.meta.url) {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch {
    // ignore
  }
  return typeof __dirname !== 'undefined' ? __dirname : process.cwd();
};

const appDir = getDirname();
const publicPath = fs.existsSync(path.join(appDir, 'public'))
  ? path.join(appDir, 'public')
  : path.join(process.cwd(), 'public');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// 2. Configure Express middlewares
// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// JSON & URL-encoded parsing
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logger to easily diagnose Postman requests in the console
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoints
const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    appName: 'AI StudyBuddy',
    database: isConnectedToMongo ? 'MongoDB Atlas' : 'In-Memory Resilient Store',
    timestamp: new Date(),
  });
};
app.get('/api/health', healthCheck);
app.get('/health', healthCheck);

// 3. Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/material', materialRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/blog', blogRoutes);

// Explicit StudyBuddy specification for POST /api/materials/:id/summarize
app.post('/api/materials/:id/summarize', verifyJWT, aiController.summarizeMaterial);

// Developer friendly aliases (supports requests with or without '/api' prefix)
app.use('/auth', authRoutes);
app.use('/material', materialRoutes);
app.use('/materials', materialRoutes);
app.use('/ai', aiRoutes);
app.use('/admin', adminRoutes);
app.use('/blogs', blogRoutes);
app.use('/blog', blogRoutes);
app.post('/api/login', authController.login);
app.post('/api/register', authController.register);
app.post('/login', authController.login);
app.post('/register', authController.register);

app.post('/api/blogs/generate', aiController.generateBlog);
app.post('/blogs/generate', aiController.generateBlog);
app.post('/api/generate-blog', aiController.generateBlog);
app.post('/generate-blog', aiController.generateBlog);
app.post('/api/summarize', aiController.summarize);
app.post('/summarize', aiController.summarize);
app.post('/api/ai/summarizeBlog', aiController.summarize);
app.post('/api/ai/summarize-blog', aiController.summarize);

// 4. Serve Frontend Static Files
app.use(express.static(publicPath));

// Fallback to index.html for root or SPA paths
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// 404 Not Found Handler for unknown API / POST requests
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`,
    message: 'The requested route was not found. Please verify the URL and HTTP method.',
    tip: 'Ensure baseUrl is http://localhost:3000/api or http://localhost:5000/api and check your route path.',
    availableRoutes: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/logout',
      'GET  /api/auth/me',
      'POST /api/materials/upload',
      'GET  /api/materials',
      'GET  /api/materials/:id',
      'POST /api/materials/:id/summarize',
      'POST /api/ai/flashcards',
      'POST /api/ai/quiz',
      'POST /api/ai/study-plan',
      'POST /api/ai/chat',
      'POST /api/ai/search',
      'POST /api/ai/generate-blog',
      'POST /api/ai/summarize',
      'POST /api/blogs',
      'GET  /api/blogs',
      'GET  /api/blogs/:id',
      'PUT  /api/blogs/:id',
      'DELETE /api/blogs/:id'
    ]
  });
});

// 5. Centralized Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error occurred.',
  });
});

// 6. Connect to Database and start listening
async function startServer() {
  try {
    console.log('🔄 Initializing AI StudyBuddy database...');
    await connectDB();
    console.log('✅ Database layer operational.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 AI StudyBuddy server running on http://0.0.0.0:${PORT}`);
      console.log(`📚 Frontend interface available at http://0.0.0.0:${PORT}/`);
      console.log(`🔑 Admin account: yyuvashree24916bscai@gmail.com (Password: yuvashree@@2006)`);
      console.log(`🎓 Student account: student@studybuddy.com (Password: student123)`);
    });

    // If main port is not 5000, also bind port 5000 for seamless compatibility with college videos
    if (PORT !== 5000) {
      try {
        const secondaryApp = app.listen(5000, '0.0.0.0', () => {
          console.log(`⚡ College Testing Compatibility: Also listening on http://0.0.0.0:5000`);
        });
        secondaryApp.on('error', () => {
          // Port 5000 already occupied, ignore silently
        });
      } catch {
        // ignore
      }
    }
  } catch (error) {
    console.error('❌ Fatal error during server startup:', error);
    process.exit(1);
  }
}

startServer();

export default app;
