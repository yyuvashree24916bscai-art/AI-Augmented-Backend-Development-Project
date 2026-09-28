import mongoose, { Schema, Document } from 'mongoose';
import { isConnectedToMongo, memoryStore } from '../utils/db.js';

export interface ISummary extends Document {
  _id: any;
  userId: any;
  materialId: any;
  summary: string;
  createdAt: Date;
}

const SummarySchema = new Schema<ISummary>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  materialId: { type: Schema.Types.ObjectId, ref: 'StudyMaterial', required: true, unique: true },
  summary: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const SummaryModel = mongoose.models.Summary || mongoose.model<ISummary>('Summary', SummarySchema);

export const Summary = {
  async findOne(filter: { materialId?: any; userId?: any }) {
    if (isConnectedToMongo) {
      return SummaryModel.findOne(filter);
    }
    return memoryStore.summaries.find(s => 
      (!filter.materialId || String(s.materialId) === String(filter.materialId)) &&
      (!filter.userId || String(s.userId) === String(filter.userId))
    ) || null;
  },

  async create(data: { userId: any; materialId: any; summary: string }) {
    if (isConnectedToMongo) {
      return SummaryModel.findOneAndUpdate(
        { materialId: data.materialId },
        { ...data, createdAt: new Date() },
        { upsert: true, new: true }
      );
    }
    const existingIdx = memoryStore.summaries.findIndex(s => String(s.materialId) === String(data.materialId));
    const newSummary = {
      _id: existingIdx !== -1 ? memoryStore.summaries[existingIdx]._id : '65f1c' + Math.random().toString(16).substring(2, 12),
      userId: String(data.userId),
      materialId: String(data.materialId),
      summary: data.summary,
      createdAt: new Date(),
    };
    if (existingIdx !== -1) {
      memoryStore.summaries[existingIdx] = newSummary;
    } else {
      memoryStore.summaries.push(newSummary);
    }
    return newSummary;
  },

  async find(filter: any = {}) {
    if (isConnectedToMongo) {
      return SummaryModel.find(filter).sort({ createdAt: -1 });
    }
    let list = [...memoryStore.summaries];
    if (filter.userId) {
      list = list.filter(s => String(s.userId) === String(filter.userId));
    }
    return list;
  }
};
