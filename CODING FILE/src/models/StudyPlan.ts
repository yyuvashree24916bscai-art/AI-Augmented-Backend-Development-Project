import mongoose, { Schema, Document } from 'mongoose';
import { isConnectedToMongo, memoryStore } from '../utils/db.js';

export interface IStudyPlan extends Document {
  _id: any;
  userId: any;
  studyPlan: string;
  examDate?: string;
  createdAt: Date;
}

const StudyPlanSchema = new Schema<IStudyPlan>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  studyPlan: { type: String, required: true },
  examDate: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const StudyPlanModel = mongoose.models.StudyPlan || mongoose.model<IStudyPlan>('StudyPlan', StudyPlanSchema);

export const StudyPlan = {
  async find(filter: any = {}) {
    if (isConnectedToMongo) {
      return StudyPlanModel.find(filter).sort({ createdAt: -1 });
    }
    let list = [...memoryStore.studyPlans];
    if (filter.userId) {
      list = list.filter(p => String(p.userId) === String(filter.userId));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async create(data: { userId: any; studyPlan: string; examDate?: string }) {
    if (isConnectedToMongo) {
      return StudyPlanModel.create(data);
    }
    const newPlan = {
      _id: '65f1f' + Math.random().toString(16).substring(2, 12),
      userId: String(data.userId),
      studyPlan: data.studyPlan,
      examDate: data.examDate || '',
      createdAt: new Date(),
    };
    memoryStore.studyPlans.push(newPlan);
    return newPlan;
  }
};
