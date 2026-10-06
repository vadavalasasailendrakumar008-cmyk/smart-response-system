import { Router, Response } from 'express';
import { supabase, isSupabaseConfigured, mockDb } from '../config/supabase.js';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { LoginSchema, UserRegisterSchema } from '../../src/shared/schemas.js';
import { UserProfile, Responder } from '../../src/shared/types.js';

const router = Router();

// POST /api/v1/auth/login
router.post('/login', validateRequest(LoginSchema), async (req, res) => {
  const { email, password } = req.body;

  // 1. Check demo accounts
  if (email === 'citizen@rescuos.demo' && password === 'DemoPassword123!') {
    const profile = mockDb.profiles.find((p) => p.email === email) || mockDb.profiles[0];
    return res.json({
      token: 'demo-token-citizen',
      user: profile,
      isDemo: true,
    });
  }

  if (email === 'responder@rescuos.demo' && password === 'DemoPassword123!') {
    const profile = mockDb.profiles.find((p) => p.email === email) || mockDb.profiles[1];
    return res.json({
      token: 'demo-token-responder',
      user: profile,
      isDemo: true,
    });
  }

  if (email === 'admin@rescuos.demo' && password === 'DemoPassword123!') {
    const profile = mockDb.profiles.find((p) => p.email === email) || mockDb.profiles[2];
    return res.json({
      token: 'demo-token-admin',
      user: profile,
      isDemo: true,
    });
  }

  // 2. If real Supabase configured, attempt remote login
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        return res.json({
          token: data.session.access_token,
          user: profile || {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || 'User',
            role: data.user.user_metadata?.role || 'CITIZEN',
            phone: data.user.user_metadata?.phone || '',
          },
        });
      }
    } catch (err) {
      console.warn('Supabase remote login error:', err);
    }
  }

  // 3. Check mockDb registered profiles
  const matched = mockDb.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  if (matched) {
    return res.json({
      token: matched.id,
      user: matched,
    });
  }

  return res.status(401).json({
    error: 'Invalid credentials',
    message: 'The email or password provided is incorrect. For testing, use the Demo Account buttons.',
  });
});

// POST /api/v1/auth/register
router.post('/register', validateRequest(UserRegisterSchema), async (req, res) => {
  const {
    fullName,
    email,
    password,
    phone,
    emergencyContactName,
    emergencyContactPhone,
    role = 'CITIZEN',
    department,
    badgeNumber,
  } = req.body;

  // Check existing email
  if (mockDb.profiles.some((p) => p.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'A user with this email address already exists.',
    });
  }

  const newId = `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const newProfile: UserProfile = {
    id: newId,
    full_name: fullName,
    email,
    phone,
    role: role as any,
    emergency_contact_name: emergencyContactName,
    emergency_contact_phone: emergencyContactPhone,
    created_at: new Date().toISOString(),
  };

  mockDb.profiles.unshift(newProfile);

  if (role === 'RESPONDER') {
    const newResponder: Responder = {
      id: `resp-${Date.now().toString(36)}`,
      user_id: newId,
      department: department || 'General Emergency Dispatch',
      badge_number: badgeNumber || `R-${Math.floor(100 + Math.random() * 900)}`,
      is_available: true,
      current_latitude: 37.7749,
      current_longitude: -122.4194,
      profile: newProfile,
    };
    mockDb.responders.push(newResponder);
  }

  return res.status(201).json({
    token: newId,
    user: newProfile,
    message: 'Registration successful.',
  });
});

// GET /api/v1/auth/me
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const unreadNotifications = mockDb.notifications.filter(
    (n) => n.recipient_id === user.id && !n.is_read
  ).length;

  res.json({
    user,
    unreadNotifications,
  });
});

// GET /api/v1/auth/responders
router.get('/responders', requireAuth, (_req, res) => {
  res.json({
    responders: mockDb.responders.map((r) => ({
      ...r,
      profile: mockDb.profiles.find((p) => p.id === r.user_id),
    })),
  });
});

// GET /api/v1/auth/users (Admin only)
router.get('/users', requireAuth, requireRole('ADMIN'), (_req, res) => {
  res.json({
    users: mockDb.profiles,
  });
});

export default router;
