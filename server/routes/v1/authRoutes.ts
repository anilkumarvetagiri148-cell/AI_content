import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db, hashPassword, verifyPassword, signToken } from '../../db.js';
import { dbService } from '../../services/dbService.js';
import { requireAuth, AuthRequest } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validation.js';
import { signupSchema, loginSchema, resetPasswordSchema, updateProfileSchema } from '../../validation/schemas.js';
import { Profile } from '../../../src/types/index.js';

const router = Router();

// POST /api/v1/auth/signup
router.post('/signup', validateBody(signupSchema), (req: Request, res: Response) => {
  const { email, password, name, role, company_name, specialization, location } = req.body;
  const state = db.getState();

  const normalizedEmail = email.toLowerCase().trim();
  if (state.users.some((u) => u.email === normalizedEmail)) {
    res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    return;
  }

  const userId = `${role}-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  const newProfile: Profile = {
    id: userId,
    email: normalizedEmail,
    name: name.trim(),
    role: role || 'creator',
    avatar_url:
      role === 'creator'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
        : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    bio:
      role === 'creator'
        ? `AI Content Creator specializing in ${specialization || 'AI Video Generation'}.`
        : `${company_name || name} — commissioning AI-native creative campaigns.`,
    location: location || 'Remote / Global',
    languages: ['English'],
    company_name: company_name || (role === 'brand' ? `${name} Brand Studio` : `${name} AI Studio`),
    website: '',
    social_links: {},
    verified: false,
    created_at: now,
  };

  state.users.push({
    userId,
    email: normalizedEmail,
    passwordHash: hashPassword(password),
  });
  state.profiles.push(newProfile);

  if (role === 'creator') {
    state.creator_profiles.push({
      creator_id: userId,
      title: `${specialization || 'AI Video'} Specialist`,
      industry_category: specialization || 'Technology & AI',
      specialization: specialization || 'Technology & AI',
      secondary_categories: ['Technology & AI'],
      skills: ['Cinematic AI Video', 'Custom LoRA Training', 'Photorealistic Product Renders'],
      ai_tools: ['Midjourney v6', 'Runway Gen-3 Alpha', 'Flux.1 Pro'],
      content_formats: ['video', 'image'],
      starting_price: 18500,
      packages: [
        {
          name: 'Starter',
          price: 18500,
          deliveryDays: 4,
          revisions: 2,
          description: 'Starter AI creative package tailored to your brand brief.',
          deliverables: ['5x High-Res AI Visuals or 1x 15s Video', '2 Revisions', 'Commercial Rights'],
        },
      ],
      availability: 'available',
      experience_years: 2,
      experience_level: 'intermediate',
      rating: 5.0,
      review_count: 0,
      completed_campaigns: 0,
      profile_views: 1,
      featured: false,
      response_time: '< 2 hours',
    });
  }

  dbService.createNotification({
    id: `notif-${crypto.randomUUID().slice(0, 8)}`,
    recipient_id: userId,
    type: 'system',
    title: 'Welcome to CreatorConnect AI!',
    message: role === 'creator' ? 'Your creator studio is live!' : 'Welcome aboard! Launch your first Campaign Brief.',
    link: role === 'creator' ? '/dashboard/creator' : '/dashboard/brand',
    read_status: false,
    created_at: now,
  });

  db.save();

  const token = signToken({ userId, role: newProfile.role, email: normalizedEmail });
  res.status(201).json({
    token,
    user: newProfile,
    creatorProfile: role === 'creator' ? db.getFullCreator(userId)?.creator_profile : null,
  });
});

// POST /api/v1/auth/login
router.post('/login', validateBody(loginSchema), (req: Request, res: Response) => {
  const { email, password } = req.body;
  const state = db.getState();
  const normalizedEmail = email.toLowerCase().trim();

  const userCred = state.users.find((u) => u.email === normalizedEmail);
  if (!userCred || !verifyPassword(password, userCred.passwordHash)) {
    res.status(401).json({ error: 'Invalid email or password. Try a demo account or check your credentials.' });
    return;
  }

  const profile = db.getProfileById(userCred.userId);
  if (!profile) {
    res.status(404).json({ error: 'User profile not found.' });
    return;
  }

  const token = signToken({ userId: profile.id, role: profile.role, email: profile.email });
  res.json({
    token,
    user: profile,
    creatorProfile: profile.role === 'creator' ? db.getFullCreator(profile.id)?.creator_profile : null,
  });
});

// POST /api/v1/auth/reset-password
router.post('/reset-password', validateBody(resetPasswordSchema), (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  const state = db.getState();
  const normalizedEmail = email.toLowerCase().trim();

  const userCred = state.users.find((u) => u.email === normalizedEmail);
  if (!userCred) {
    res.json({ message: 'If an account matches that email, password reset instructions have been processed.' });
    return;
  }

  if (newPassword && newPassword.length >= 6) {
    userCred.passwordHash = hashPassword(newPassword);
    db.save();
    res.json({ message: 'Your password has been updated. You can now sign in with your new password.' });
    return;
  }

  res.json({ message: 'Password reset verified. Provide a new password (min 6 chars) to complete reset.' });
});

// GET /api/v1/auth/me
router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  const profile = db.getProfileById(req.user!.userId);
  if (!profile) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }
  const fullCreator = profile.role === 'creator' ? db.getFullCreator(profile.id) : null;
  res.json({
    user: profile,
    creatorProfile: fullCreator?.creator_profile || null,
    portfolio: fullCreator?.portfolio || [],
  });
});

// PUT /api/v1/auth/profile
router.put('/profile', requireAuth, validateBody(updateProfileSchema), (req: AuthRequest, res: Response) => {
  const profile = dbService.updateProfile(req.user!.userId, req.body);
  if (!profile) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }

  if (profile.role === 'creator') {
    dbService.updateCreatorProfile(profile.id, req.body);
  }

  res.json({
    user: profile,
    creatorProfile: profile.role === 'creator' ? db.getFullCreator(profile.id)?.creator_profile : null,
  });
});

export default router;
