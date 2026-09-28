import mongoose, { Schema, Document } from 'mongoose';
import { isConnectedToMongo, memoryStore } from '../utils/db.js';

export interface IBlog extends Document {
  _id: any;
  userId?: any;
  title: string;
  content: string;
  author: string;
  authorName?: string;
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: String, default: 'Anonymous Author' },
    authorName: { type: String, default: 'Anonymous' },
    category: { type: String, default: 'General' },
    tags: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

// Atlas full-text search
BlogSchema.index({ title: 'text', content: 'text', category: 'text' });

export const BlogModel = mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);

export const Blog = {
  async create(data: {
    userId?: any;
    title: string;
    content: string;
    author?: string;
    authorName?: string;
    category?: string;
    tags?: string[];
  }) {
    if (isConnectedToMongo) {
      return BlogModel.create(data);
    }
    const newBlog = {
      _id: '65f1c' + Math.random().toString(16).substring(2, 12) + Date.now().toString(16).substring(4),
      userId: data.userId ? String(data.userId) : '65f1a0000000000000000002',
      title: data.title,
      content: data.content,
      author: data.author || (data.userId ? String(data.userId) : '65f1a0000000000000000002'),
      authorName: data.authorName || 'Student',
      category: data.category || 'General',
      tags: Array.isArray(data.tags) ? data.tags : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.blogs.push(newBlog);
    return newBlog;
  },

  async find(filter: any = {}) {
    if (isConnectedToMongo) {
      return BlogModel.find(filter).sort({ createdAt: -1 });
    }
    let list = [...(memoryStore.blogs || [])];
    if (filter.userId) {
      list = list.filter((b) => String(b.userId) === String(filter.userId));
    }
    if (filter.category) {
      list = list.filter(
        (b) => b.category && b.category.toLowerCase() === String(filter.category).toLowerCase()
      );
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async findById(id: string) {
    if (isConnectedToMongo) {
      return BlogModel.findById(id);
    }
    return (memoryStore.blogs || []).find((b) => String(b._id) === String(id)) || null;
  },

  async findByIdAndUpdate(id: string, updateData: any) {
    if (isConnectedToMongo) {
      return BlogModel.findByIdAndUpdate(id, updateData, { new: true });
    }
    const blog = (memoryStore.blogs || []).find((b) => String(b._id) === String(id));
    if (!blog) return null;

    if (updateData.title !== undefined) blog.title = updateData.title;
    if (updateData.content !== undefined) blog.content = updateData.content;
    if (updateData.author !== undefined) blog.author = updateData.author;
    if (updateData.category !== undefined) blog.category = updateData.category;
    if (updateData.tags !== undefined) blog.tags = updateData.tags;
    blog.updatedAt = new Date();

    return blog;
  },

  async findByIdAndDelete(id: string) {
    if (isConnectedToMongo) {
      return BlogModel.findByIdAndDelete(id);
    }
    const idx = (memoryStore.blogs || []).findIndex((b) => String(b._id) === String(id));
    if (idx !== -1) {
      return memoryStore.blogs.splice(idx, 1)[0];
    }
    return null;
  },

  async countDocuments(filter: any = {}) {
    if (isConnectedToMongo) {
      return BlogModel.countDocuments(filter);
    }
    return (memoryStore.blogs || []).length;
  },
};
