import mongoose, { Schema, Document } from 'mongoose';
import { isConnectedToMongo, memoryStore } from '../utils/db.js';

export interface IStudyMaterial extends Document {
  _id: any;
  userId: any;
  title: string;
  subject: string;
  content: string;
  createdAt: Date;
}

const StudyMaterialSchema = new Schema<IStudyMaterial>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// For Atlas full-text search
StudyMaterialSchema.index({ title: 'text', subject: 'text', content: 'text' });

export const StudyMaterialModel = mongoose.models.StudyMaterial || mongoose.model<IStudyMaterial>('StudyMaterial', StudyMaterialSchema);

export const StudyMaterial = {
  async create(data: { userId: any; title: string; subject: string; content: string }) {
    if (isConnectedToMongo) {
      return StudyMaterialModel.create(data);
    }
    const newMaterial = {
      _id: '65f1b' + Math.random().toString(16).substring(2, 12) + Date.now().toString(16).substring(4),
      userId: String(data.userId),
      title: data.title,
      subject: data.subject,
      content: data.content,
      createdAt: new Date(),
    };
    memoryStore.materials.push(newMaterial);
    return newMaterial;
  },

  async find(filter: any = {}) {
    if (isConnectedToMongo) {
      return StudyMaterialModel.find(filter).sort({ createdAt: -1 });
    }
    let list = [...memoryStore.materials];
    if (filter.userId) {
      list = list.filter(m => String(m.userId) === String(filter.userId));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async findById(id: string) {
    if (isConnectedToMongo) {
      return StudyMaterialModel.findById(id);
    }
    return memoryStore.materials.find(m => String(m._id) === String(id)) || null;
  },

  async findByIdAndDelete(id: string) {
    if (isConnectedToMongo) {
      return StudyMaterialModel.findByIdAndDelete(id);
    }
    const idx = memoryStore.materials.findIndex(m => String(m._id) === String(id));
    if (idx !== -1) {
      const deleted = memoryStore.materials.splice(idx, 1)[0];
      // Also delete associated summary, flashcards, quiz, embeddings
      memoryStore.summaries = memoryStore.summaries.filter(s => String(s.materialId) !== String(id));
      memoryStore.flashcards = memoryStore.flashcards.filter(f => String(f.materialId) !== String(id));
      memoryStore.quizzes = memoryStore.quizzes.filter(q => String(q.materialId) !== String(id));
      memoryStore.embeddings = memoryStore.embeddings.filter(e => String(e.documentId) !== String(id));
      return deleted;
    }
    return null;
  },

  async countDocuments(filter: any = {}) {
    if (isConnectedToMongo) {
      return StudyMaterialModel.countDocuments(filter);
    }
    if (filter.userId) {
      return memoryStore.materials.filter(m => String(m.userId) === String(filter.userId)).length;
    }
    return memoryStore.materials.length;
  }
};
