import mongoose, { Schema, Document } from 'mongoose';
import { isConnectedToMongo, memoryStore } from '../utils/db.js';

export interface IChat extends Document {
  _id: any;
  userId: any;
  prompt: string;
  response: string;
  timestamp: Date;
}

const ChatSchema = new Schema<IChat>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const ChatModel = mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema);

export const Chat = {
  async create(data: { userId: any; prompt: string; response: string }) {
    if (isConnectedToMongo) {
      return ChatModel.create({
        ...data,
        timestamp: new Date(),
      });
    }
    const newChat = {
      _id: '65f18' + Math.random().toString(16).substring(2, 12),
      userId: String(data.userId),
      prompt: data.prompt,
      response: data.response,
      timestamp: new Date(),
    };
    memoryStore.chats.push(newChat);
    return newChat;
  },

  async find(filter: any = {}) {
    if (isConnectedToMongo) {
      return ChatModel.find(filter).sort({ timestamp: -1 });
    }
    let list = [...memoryStore.chats];
    if (filter.userId) {
      list = list.filter(c => String(c.userId) === String(filter.userId));
    }
    return list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
};
