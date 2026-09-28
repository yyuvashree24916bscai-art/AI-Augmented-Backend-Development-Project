import mongoose, { Schema, Document } from 'mongoose';
import { isConnectedToMongo, memoryStore } from '../utils/db.js';

export interface IActivityLog extends Document {
  _id: any;
  userId: any;
  activity: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  activity: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const ActivityLogModel = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

export const ActivityLog = {
  async create(data: { userId?: any; activity: string }) {
    if (isConnectedToMongo) {
      return ActivityLogModel.create({
        ...data,
        createdAt: new Date(),
      });
    }
    const newLog = {
      _id: '65f19' + Math.random().toString(16).substring(2, 12),
      userId: data.userId ? String(data.userId) : null,
      activity: data.activity,
      createdAt: new Date(),
    };
    memoryStore.activityLogs.unshift(newLog);
    return newLog;
  },

  async find(filter: any = {}) {
    if (isConnectedToMongo) {
      return ActivityLogModel.find(filter).sort({ createdAt: -1 }).limit(100);
    }
    let list = [...memoryStore.activityLogs];
    if (filter.userId) {
      list = list.filter(l => String(l.userId) === String(filter.userId));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 100);
  },

  async countDocuments() {
    if (isConnectedToMongo) {
      return ActivityLogModel.countDocuments();
    }
    return memoryStore.activityLogs.length;
  }
};
