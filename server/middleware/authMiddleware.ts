import { Request, Response, NextFunction } from 'express';
import { supabase, isSupabaseConfigured, mockDb } from '../config/supabase.js';
import { UserProfile, UserRole } from '../../src/shared/types.js';

export interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1]?.trim();
  if (!token) {
    return next();
  }

  // Check demo tokens first for zero-friction hackathon testing
  if (token === 'demo-token-citizen') {
    req.user = mockDb.profiles.find((p) => p.role === 'CITIZEN') || mockDb.profiles[0];
    return next();
  }
  if (token === 'demo-token-responder') {
    req.user = mockDb.profiles.find((p) => p.role === 'RESPONDER') || mockDb.profiles[1];
    return next();
  }
  if (token === 'demo-token-admin') {
    req.user = mockDb.profiles.find((p) => p.role === 'ADMIN') || mockDb.profiles[2];
    return next();
  }

  // If real Supabase is connected
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user && !error) {
        // Fetch user profile from public.profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          req.user = profile as UserProfile;
          return next();
        } else {
          // Fallback profile from user metadata if profile row isn't yet created
          req.user = {
            id: user.id,
            email: user.email || 'user@rescuos.local',
            full_name: user.user_metadata?.full_name || 'Verified User',
            phone: user.user_metadata?.phone || '',
            role: (user.user_metadata?.role as UserRole) || 'CITIZEN',
            created_at: user.created_at,
          };
          return next();
        }
      }
    } catch (err) {
      console.warn('⚠️ Supabase token verification failed, falling back to local user check:', err);
    }
  }

  // Local token fallback: token can be a user ID or custom local token
  const matchedProfile = mockDb.profiles.find((p) => p.id === token || p.email === token);
  if (matchedProfile) {
    req.user = matchedProfile;
  }

  return next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication token is required to access this resource.',
    });
  }
  return next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
      });
    }

    return next();
  };
}
