import mongoose, { Schema, Document } from 'mongoose';
import { isConnectedToMongo, memoryStore } from '../utils/db.js';

export interface IFlashcard extends Document {
  _id: any;
  userId: any;
  materialId: any;
  question: string;
  answer: string;
  createdAt: Date;
}

const FlashcardSchema = new Schema<IFlashcard>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  materialId: { type: Schema.Types.ObjectId, ref: 'StudyMaterial' },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const FlashcardModel = mongoose.models.Flashcard || mongoose.model<IFlashcard>('Flashcard', FlashcardSchema);

export const Flashcard = {
  async find(filter: any = {}) {
    if (isConnectedToMongo) {
      return FlashcardModel.find(filter).sort({ createdAt: -1 });
    }
    let list = [...memoryStore.flashcards];
    if (filter.userId) {
      list = list.filter(f => String(f.userId) === String(filter.userId));
    }
    if (filter.materialId) {
      list = list.filter(f => String(f.materialId) === String(filter.materialId));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async insertMany(cards: Array<{ userId: any; materialId?: any; question: string; answer: string }>) {
    if (isConnectedToMongo) {
      return FlashcardModel.insertMany(cards);
    }
    const created = cards.map(c => ({
      _id: '65f1d' + Math.random().toString(16).substring(2, 12),
      userId: String(c.userId),
      materialId: c.materialId ? String(c.materialId) : null,
      question: c.question,
      answer: c.answer,
      createdAt: new Date(),
    }));
    memoryStore.flashcards.push(...created);
    return created;
  },

  async findByIdAndDelete(id: string) {
    if (isConnectedToMongo) {
      return FlashcardModel.findByIdAndDelete(id);
    }
    const idx = memoryStore.flashcards.findIndex(f => String(f._id) === String(id));
    if (idx !== -1) {
      return memoryStore.flashcards.splice(idx, 1)[0];
    }
    return null;
  }
};
