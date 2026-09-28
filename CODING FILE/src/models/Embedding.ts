import mongoose, { Schema, Document } from 'mongoose';
import { isConnectedToMongo, memoryStore } from '../utils/db.js';

export interface IEmbedding extends Document {
  _id: any;
  documentId: any;
  vectorData: number[];
  textChunk: string;
  createdAt: Date;
}

const EmbeddingSchema = new Schema<IEmbedding>({
  documentId: { type: Schema.Types.ObjectId, ref: 'StudyMaterial', required: true },
  vectorData: [{ type: Number, required: true }],
  textChunk: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const EmbeddingModel = mongoose.models.Embedding || mongoose.model<IEmbedding>('Embedding', EmbeddingSchema);

export const Embedding = {
  async create(data: { documentId: any; vectorData: number[]; textChunk: string }) {
    if (isConnectedToMongo) {
      return EmbeddingModel.create(data);
    }
    const newEmb = {
      _id: '65f17' + Math.random().toString(16).substring(2, 12),
      documentId: String(data.documentId),
      vectorData: data.vectorData,
      textChunk: data.textChunk,
      createdAt: new Date(),
    };
    memoryStore.embeddings.push(newEmb);
    return newEmb;
  },

  async insertMany(items: Array<{ documentId: any; vectorData: number[]; textChunk: string }>) {
    if (isConnectedToMongo) {
      return EmbeddingModel.insertMany(items);
    }
    const created = items.map(d => ({
      _id: '65f17' + Math.random().toString(16).substring(2, 12),
      documentId: String(d.documentId),
      vectorData: d.vectorData,
      textChunk: d.textChunk,
      createdAt: new Date(),
    }));
    memoryStore.embeddings.push(...created);
    return created;
  },

  async find(filter: any = {}) {
    if (isConnectedToMongo) {
      return EmbeddingModel.find(filter);
    }
    let list = [...memoryStore.embeddings];
    if (filter.documentId) {
      list = list.filter(e => String(e.documentId) === String(filter.documentId));
    }
    return list;
  }
};
