import multer from 'multer';
import { Request } from 'express';

// Use memory storage for direct processing and embedding generation
const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'text/plain',
  'text/markdown',
  'application/json',
  'text/csv',
  'application/pdf',
  'application/octet-stream', // often text or custom notes
];

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow text, markdown, json, pdf, code, csv
  const extension = file.originalname.split('.').pop()?.toLowerCase();
  const validExtensions = ['txt', 'md', 'markdown', 'json', 'csv', 'pdf', 'doc', 'docx', 'py', 'js', 'ts', 'java', 'cpp'];

  if (validExtensions.includes(extension || '') || allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('text/')) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: .${extension}. Please upload text (.txt, .md), JSON, PDF, or document notes.`));
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum
  },
  fileFilter,
});
