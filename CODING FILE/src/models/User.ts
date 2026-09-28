import mongoose, { Schema, Document } from 'mongoose';
import { isConnectedToMongo, memoryStore } from '../utils/db.js';

export interface IUser extends Document {
  _id: any;
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'admin';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// Model abstraction supporting both MongoDB and Memory store
export const User = {
  async findOne(filter: { email?: string; _id?: string }) {
    if (isConnectedToMongo) {
      return UserModel.findOne(filter);
    }
    if (filter.email) {
      return memoryStore.users.find(u => u.email.toLowerCase() === filter.email?.toLowerCase()) || null;
    }
    if (filter._id) {
      return memoryStore.users.find(u => String(u._id) === String(filter._id)) || null;
    }
    return null;
  },

  async findById(id: string) {
    if (isConnectedToMongo) {
      return UserModel.findById(id);
    }
    return memoryStore.users.find(u => String(u._id) === String(id)) || null;
  },

  async create(data: { name: string; email: string; password?: string; role?: 'student' | 'admin' }) {
    if (isConnectedToMongo) {
      return UserModel.create(data);
    }
    const newUser = {
      _id: '65f1a' + Math.random().toString(16).substring(2, 12) + Date.now().toString(16).substring(4),
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      role: data.role || 'student',
      createdAt: new Date(),
    };
    memoryStore.users.push(newUser);
    return newUser;
  },

  async find(filter: any = {}) {
    if (isConnectedToMongo) {
      return UserModel.find(filter).sort({ createdAt: -1 });
    }
    return [...memoryStore.users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async countDocuments() {
    if (isConnectedToMongo) {
      return UserModel.countDocuments();
    }
    return memoryStore.users.length;
  },

  async updateOne(filter: { email?: string; _id?: string }, update: any) {
    if (isConnectedToMongo) {
      return UserModel.updateOne(filter, update);
    }
    const user = await this.findOne(filter);
    if (user) {
      Object.assign(user, update.$set || update);
    }
    return { modifiedCount: 1 };
  }
};
