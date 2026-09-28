import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'studybuddy_super_secure_jwt_secret_key_2026';

export const authController = {
  /**
   * POST /api/auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          error: 'Please provide all required fields: name, email, and password.',
        });
        return;
      }

      const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
      if (existingUser) {
        res.status(400).json({
          success: false,
          error: 'An account with this email address already exists. Please log in.',
        });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Default role to 'student' unless specifically admin (can allow admin registration if explicitly requested or matching admin email domain)
      const isDesignatedAdmin = email.trim().toLowerCase() === 'yyuvashree24916bscai@gmail.com';
      const userRole: 'student' | 'admin' = (role === 'admin' || isDesignatedAdmin) ? 'admin' : 'student';

      const newUser = await User.create({
        name: isDesignatedAdmin ? (name.trim() || 'Yuvashree (Administrator)') : name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: userRole,
      });

      // Log registration activity
      await ActivityLog.create({
        userId: newUser._id,
        activity: `New ${userRole} registration: ${newUser.name} (${newUser.email})`,
      });

      // Generate JWT
      const token = jwt.sign(
        { id: String(newUser._id), email: newUser.email, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        success: true,
        token,
        user: {
          _id: String(newUser._id),
          id: String(newUser._id),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt,
        },
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error during registration.',
      });
    }
  },

  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Please provide both email and password.',
        });
        return;
      }

      const cleanEmail = email.trim().toLowerCase();
      let user = await User.findOne({ email: cleanEmail });

      // Ensure designated admin credentials always succeed
      if (!user && cleanEmail === 'yyuvashree24916bscai@gmail.com' && password === 'yuvashree@@2006') {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('yuvashree@@2006', salt);
        user = await User.create({
          name: 'Yuvashree (Administrator)',
          email: 'yyuvashree24916bscai@gmail.com',
          password: hashedPassword,
          role: 'admin',
        });
      }

      // If user does not exist yet, automatically enroll them as a student
      // so anyone can log in directly using their email and password!
      if (!user) {
        // Enforce admin password check if trying to log in as the designated admin
        if (cleanEmail === 'yyuvashree24916bscai@gmail.com') {
          res.status(401).json({
            success: false,
            error: 'Invalid credentials. Incorrect password for administrator.',
          });
          return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Derive user-friendly display name from email (e.g. john.doe@school.edu -> John Doe)
        const localPart = cleanEmail.split('@')[0] || 'student';
        const formattedName = localPart
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (char: string) => char.toUpperCase())
          .trim();

        user = await User.create({
          name: formattedName || 'Student',
          email: cleanEmail,
          password: hashedPassword,
          role: 'student',
        });

        await ActivityLog.create({
          userId: user._id,
          activity: `New student auto-enrolled on login: ${user.name} (${user.email})`,
        });
      } else {
        // User already exists
        const isAdminAccount = cleanEmail === 'yyuvashree24916bscai@gmail.com' || user.role === 'admin';

        if (isAdminAccount) {
          const isMatch = (cleanEmail === 'yyuvashree24916bscai@gmail.com' && password === 'yuvashree@@2006') ||
            (await bcrypt.compare(password, user.password || ''));
          if (!isMatch) {
            res.status(401).json({
              success: false,
              error: 'Invalid credentials. Incorrect password for administrator.',
            });
            return;
          }
        } else {
          // Student account: verify password or update to newly entered password
          const isMatch = await bcrypt.compare(password, user.password || '');
          if (!isMatch) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
            await User.updateOne({ email: cleanEmail }, { $set: { password: hashedPassword } });
          }
        }
      }

      // Ensure designated admin role is enforced
      if (cleanEmail === 'yyuvashree24916bscai@gmail.com') {
        user.role = 'admin';
      }

      // Generate JWT
      const token = jwt.sign(
        { id: String(user._id), email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Log login activity
      await ActivityLog.create({
        userId: user._id,
        activity: `User logged in: ${user.name} (${user.role})`,
      });

      res.status(200).json({
        token,
        success: true,
        message: 'Login successful.',
        user: {
          _id: String(user._id),
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error during login.',
      });
    }
  },

  /**
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully. Please clear client-side token.',
    });
  },

  /**
   * GET /api/auth/me
   */
  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }
    res.status(200).json({
      success: true,
      user: req.user,
    });
  }
};
