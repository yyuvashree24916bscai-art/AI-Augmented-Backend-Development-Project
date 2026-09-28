import { Request, Response } from 'express';
import { Blog } from '../models/Blog.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const blogController = {
  /**
   * POST /api/blogs
   * Create a new blog post
   */
  async createBlog(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { title, name, content, body, description, text, author, category, tags } = req.body;

      const blogTitle = title || name;
      const blogContent = content || body || description || text;

      if (!blogTitle || !blogContent) {
        res.status(400).json({
          success: false,
          error: 'Title and content are required fields for creating a blog post.',
        });
        return;
      }

      const authorId = req.user ? req.user._id : (author || '65f1a0000000000000000002');
      const authorName = req.user ? req.user.name : (author || 'Student');
      const userId = req.user ? req.user._id : undefined;

      const newBlog = await Blog.create({
        userId,
        title: String(blogTitle).trim(),
        content: String(blogContent).trim(),
        author: String(authorId).trim(),
        authorName: String(authorName).trim(),
        category: category ? String(category).trim() : 'technology',
        tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : [],
      });

      const responsePayload: any = {
        _id: String(newBlog._id),
        title: newBlog.title,
        content: newBlog.content,
        category: newBlog.category,
        author: String(authorId),
        authorName: String(authorName),
        tags: newBlog.tags,
        createdAt: newBlog.createdAt,
        updatedAt: newBlog.updatedAt,
        success: true,
        message: 'Blog post created successfully!',
        blog: newBlog,
        data: newBlog,
      };

      res.status(201).json(responsePayload);
    } catch (error: any) {
      console.error('Error creating blog post:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create blog post.',
        details: error.message,
      });
    }
  },

  /**
   * GET /api/blogs
   * Retrieve all blog posts (with optional category filter)
   */
  async getBlogs(req: Request, res: Response): Promise<void> {
    try {
      const category = req.query.category as string | undefined;
      const filter = category ? { category } : {};
      const blogs = await Blog.find(filter);

      res.status(200).json({
        success: true,
        count: blogs.length,
        blogs,
        data: blogs,
      });
    } catch (error: any) {
      console.error('Error fetching blogs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve blogs.',
        details: error.message,
      });
    }
  },

  /**
   * GET /api/blogs/:id
   * Retrieve single blog post by ID
   */
  async getBlogById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const blog = await Blog.findById(id);

      if (!blog) {
        res.status(404).json({
          success: false,
          error: `Blog post with ID '${id}' not found.`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        blog,
        data: blog,
      });
    } catch (error: any) {
      console.error('Error fetching blog by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve blog post.',
        details: error.message,
      });
    }
  },

  /**
   * PUT /api/blogs/:id or PATCH /api/blogs/:id
   * Update existing blog post
   */
  async updateBlog(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, name, content, body, description, text, author, category, tags } = req.body;

      const updateData: any = {};
      if (title || name) updateData.title = String(title || name).trim();
      if (content || body || description || text) updateData.content = String(content || body || description || text).trim();
      if (author) updateData.author = String(author).trim();
      if (category) updateData.category = String(category).trim();
      if (tags !== undefined) {
        updateData.tags = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()) : [];
      }

      const updated = await Blog.findByIdAndUpdate(id, updateData);

      if (!updated) {
        res.status(404).json({
          success: false,
          error: `Blog post with ID '${id}' not found to update.`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Blog post updated successfully!',
        blog: updated,
        data: updated,
      });
    } catch (error: any) {
      console.error('Error updating blog post:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update blog post.',
        details: error.message,
      });
    }
  },

  /**
   * DELETE /api/blogs/:id
   * Delete a blog post
   */
  async deleteBlog(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await Blog.findByIdAndDelete(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: `Blog post with ID '${id}' not found to delete.`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Blog post deleted successfully!',
        deletedId: id,
      });
    } catch (error: any) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete blog post.',
        details: error.message,
      });
    }
  },
};
