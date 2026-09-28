import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware.js';

/**
 * Role-Based Access Control (RBAC) middleware
 * Enforces role authorization (e.g. requireRole('admin')).
 * Non-matching roles receive a strict 403 Forbidden response.
 */
export const requireRole = (allowedRole: 'admin' | 'student') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required prior to role verification.',
      });
      return;
    }

    if (req.user.role !== allowedRole) {
      res.status(403).json({
        success: false,
        error: `Access denied. Requires ${allowedRole} role privileges.`,
      });
      return;
    }

    next();
  };
};
