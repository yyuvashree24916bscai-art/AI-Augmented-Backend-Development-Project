/**
 * AI Service Layer
 * 
 * Centralized service layer that abstracts all Gemini AI interactions.
 * Controllers invoke methods on this service rather than calling Gemini directly.
 */

import {
  generateSummary as geminiGenerateSummary,
  generateFlashcards as geminiGenerateFlashcards,
  generateQuiz as geminiGenerateQuiz,
  generateStudyPlan as geminiGenerateStudyPlan,
  generateChatResponse as geminiGenerateChatResponse,
  generateEmbeddings as geminiGenerateEmbeddings,
  generateBlogPost as geminiGenerateBlogPost,
  calculateCosineSimilarity,
} from '../utils/gemini.js';
import { Embedding } from '../models/Embedding.js';
import { StudyMaterial } from '../models/StudyMaterial.js';

export const aiService = {
  /**
   * Generates AI blog post from topic/prompt
   */
  async createBlogPost(topic: string, keywords: string[] = [], context: string = '', category: string = 'Technology') {
    if (!topic || topic.trim().length === 0) {
      throw new Error('Topic is required to generate a blog post.');
    }
    return geminiGenerateBlogPost(topic, keywords, context, category);
  },

  /**
   * Generates summary for study material
   */
  async createSummary(content: string, subject?: string): Promise<string> {
    if (!content || content.trim().length === 0) {
      throw new Error('Study content is required to generate a summary.');
    }
    return geminiGenerateSummary(content, subject);
  },

  /**
   * Generates flashcards from content
   */
  async createFlashcards(content: string, count: number = 5): Promise<Array<{ question: string; answer: string }>> {
    if (!content || content.trim().length === 0) {
      throw new Error('Content is required to generate flashcards.');
    }
    return geminiGenerateFlashcards(content, count);
  },

  /**
   * Generates quiz questions from content
   */
  async createQuiz(content: string, count: number = 4): Promise<Array<{ question: string; options: string[]; correctAnswer: string }>> {
    if (!content || content.trim().length === 0) {
      throw new Error('Content is required to generate a quiz.');
    }
    return geminiGenerateQuiz(content, count);
  },

  /**
   * Generates personalized study plan
   */
  async createStudyPlan(subject: string, topics: string, examDate: string, dailyHours: number = 2): Promise<string> {
    if (!subject || subject.trim().length === 0) {
      throw new Error('Subject is required to generate a study plan.');
    }
    return geminiGenerateStudyPlan(subject, topics, examDate, dailyHours);
  },

  /**
   * Generates embeddings and splits content into indexed chunks
   */
  async processAndStoreDocumentEmbeddings(materialId: string, content: string): Promise<number> {
    // Chunk content into ~500 character paragraphs with slight overlap
    const paragraphs = content
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 20);

    const chunks: string[] = [];
    for (const p of paragraphs) {
      if (p.length > 800) {
        // Sub-chunk long paragraphs
        const sentences = p.split(/(?<=[.?!])\s+/);
        let curr = '';
        for (const s of sentences) {
          if ((curr + ' ' + s).length > 600) {
            if (curr) chunks.push(curr.trim());
            curr = s;
          } else {
            curr = curr ? curr + ' ' + s : s;
          }
        }
        if (curr) chunks.push(curr.trim());
      } else {
        chunks.push(p);
      }
    }

    if (chunks.length === 0 && content.trim().length > 0) {
      chunks.push(content.trim().slice(0, 1000));
    }

    const itemsToInsert: Array<{ documentId: any; vectorData: number[]; textChunk: string }> = [];

    for (const chunk of chunks) {
      const vector = await geminiGenerateEmbeddings(chunk);
      itemsToInsert.push({
        documentId: materialId,
        vectorData: vector,
        textChunk: chunk,
      });
    }

    if (itemsToInsert.length > 0) {
      await Embedding.insertMany(itemsToInsert);
    }

    return itemsToInsert.length;
  },

  /**
   * Semantic Vector Search & RAG retrieval
   */
  async performSemanticSearch(query: string, userId?: string, topK: number = 3): Promise<{
    query: string;
    results: Array<{
      materialId: string;
      materialTitle: string;
      materialSubject: string;
      textChunk: string;
      similarityScore: number;
    }>;
    aiInsight?: string;
  }> {
    const queryVector = await geminiGenerateEmbeddings(query);
    
    // Retrieve user materials to limit search scope
    const userMaterials = await StudyMaterial.find(userId ? { userId } : {});
    const materialMap = new Map<string, any>();
    userMaterials.forEach((m: any) => materialMap.set(String(m._id), m));

    // Retrieve embeddings
    const allEmbeddings = await Embedding.find();
    
    // Calculate similarities
    const scored = allEmbeddings
      .filter((e: any) => materialMap.has(String(e.documentId)))
      .map((e: any) => {
        const sim = calculateCosineSimilarity(queryVector, e.vectorData);
        const mat = materialMap.get(String(e.documentId));
        return {
          materialId: String(e.documentId),
          materialTitle: mat ? mat.title : 'Study Document',
          materialSubject: mat ? mat.subject : 'General',
          textChunk: e.textChunk,
          similarityScore: Math.round(sim * 10000) / 100, // percentage e.g. 89.45%
        };
      })
      .sort((a: any, b: any) => b.similarityScore - a.similarityScore)
      .slice(0, topK);

    let aiInsight = '';
    if (scored.length > 0) {
      const context = scored.map(s => s.textChunk).join('\n---\n');
      aiInsight = await geminiGenerateChatResponse(
        `Summarize the key findings from these retrieved chunks relevant to: "${query}"`,
        [context]
      );
    }

    return {
      query,
      results: scored,
      aiInsight,
    };
  },

  /**
   * RAG Chat: Retrieves context chunks, then passes to Gemini
   */
  async chatWithRAG(
    prompt: string,
    userId?: string,
    materialId?: string,
    chatHistory: Array<{ prompt: string; response: string }> = []
  ): Promise<{ response: string; contextSources: string[] }> {
    let contextChunks: string[] = [];

    // Retrieve context chunks
    if (materialId) {
      const embeddings = await Embedding.find({ documentId: materialId });
      if (embeddings.length > 0) {
        const queryVector = await geminiGenerateEmbeddings(prompt);
        const scored = embeddings.map((e: any) => ({
          chunk: e.textChunk,
          score: calculateCosineSimilarity(queryVector, e.vectorData),
        }))
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 3);

        contextChunks = scored.map((s: any) => s.chunk);
      } else {
        const mat = await StudyMaterial.findById(materialId);
        if (mat && mat.content) {
          contextChunks.push(mat.content.slice(0, 2000));
        }
      }
    } else {
      // Global search across student's materials
      const searchRes = await this.performSemanticSearch(prompt, userId, 3);
      contextChunks = searchRes.results.map(r => `From "${r.materialTitle}": ${r.textChunk}`);
    }

    const aiResponse = await geminiGenerateChatResponse(prompt, contextChunks, chatHistory);

    return {
      response: aiResponse,
      contextSources: contextChunks,
    };
  }
};
