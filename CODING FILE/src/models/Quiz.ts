import mongoose, { Schema, Document } from 'mongoose';
import { isConnectedToMongo, memoryStore } from '../utils/db.js';

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface IQuiz extends Document {
  _id: any;
  userId: any;
  materialId: any;
  title?: string;
  questions: IQuizQuestion[];
  createdAt: Date;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
}, { _id: false });

const QuizSchema = new Schema<IQuiz>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  materialId: { type: Schema.Types.ObjectId, ref: 'StudyMaterial' },
  title: { type: String },
  questions: [QuizQuestionSchema],
  createdAt: { type: Date, default: Date.now },
});

export const QuizModel = mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);

export const Quiz = {
  async find(filter: any = {}) {
    if (isConnectedToMongo) {
      return QuizModel.find(filter).sort({ createdAt: -1 });
    }
    let list = [...memoryStore.quizzes];
    if (filter.userId) {
      list = list.filter(q => String(q.userId) === String(filter.userId));
    }
    if (filter.materialId) {
      list = list.filter(q => String(q.materialId) === String(filter.materialId));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async findById(id: string) {
    if (isConnectedToMongo) {
      return QuizModel.findById(id);
    }
    return memoryStore.quizzes.find(q => String(q._id) === String(id)) || null;
  },

  async create(data: { userId: any; materialId?: any; title?: string; questions: IQuizQuestion[] }) {
    if (isConnectedToMongo) {
      return QuizModel.create(data);
    }
    const newQuiz = {
      _id: '65f1e' + Math.random().toString(16).substring(2, 12),
      userId: String(data.userId),
      materialId: data.materialId ? String(data.materialId) : null,
      title: data.title || 'Practice Quiz',
      questions: data.questions,
      createdAt: new Date(),
    };
    memoryStore.quizzes.push(newQuiz);
    return newQuiz;
  }
};
