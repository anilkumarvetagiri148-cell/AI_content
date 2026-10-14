import { Router, Request, Response } from 'express';
import { db } from '../../db.js';

const router = Router();

// GET /api/v1/creators
router.get('/', (req: Request, res: Response) => {
  const allCreators = db.getAllFullCreators();

  // Compute category counts across all 24 categories
  const categoryCounts: Record<string, number> = { 'All Creators': allCreators.length };
  for (const c of allCreators) {
    const cat = c.creator_profile.industry_category || c.creator_profile.specialization;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  let creators = [...allCreators];

  const search = String(req.query.search || '').toLowerCase().trim();
  const category = String(req.query.category || '').trim();
  const tool = String(req.query.tool || '').toLowerCase().trim();
  const skill = String(req.query.skill || '').toLowerCase().trim();
  const minBudget = req.query.minBudget ? Number(req.query.minBudget) : undefined;
  const maxBudget = req.query.maxBudget ? Number(req.query.maxBudget) : undefined;
  const minRating = req.query.minRating ? Number(req.query.minRating) : undefined;
  const availability = String(req.query.availability || '').trim();
  const experience = String(req.query.experience || '').trim();
  const format = String(req.query.format || '').toLowerCase().trim();
  const sort = String(req.query.sort || 'recommended').trim();

  // Pagination parameters
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 24));

  if (search) {
    creators = creators.filter((c) => {
      const haystack = [
        c.name,
        c.bio,
        c.location,
        c.creator_profile.title,
        c.creator_profile.industry_category || '',
        c.creator_profile.specialization,
        ...c.creator_profile.secondary_categories,
        ...c.creator_profile.skills,
        ...c.creator_profile.ai_tools,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  if (category && category !== 'All' && category !== 'All Creators') {
    creators = creators.filter(
      (c) =>
        c.creator_profile.industry_category === category ||
        c.creator_profile.specialization === category ||
        c.creator_profile.secondary_categories.includes(category)
    );
  }

  if (tool && tool !== 'all') {
    creators = creators.filter((c) =>
      c.creator_profile.ai_tools.some((t) => t.toLowerCase().includes(tool))
    );
  }

  if (skill && skill !== 'all') {
    creators = creators.filter((c) =>
      c.creator_profile.skills.some((s) => s.toLowerCase().includes(skill)) ||
      c.creator_profile.specialization.toLowerCase().includes(skill)
    );
  }

  if (minBudget !== undefined && !isNaN(minBudget) && minBudget > 0) {
    creators = creators.filter((c) => c.creator_profile.starting_price >= minBudget);
  }

  if (maxBudget !== undefined && !isNaN(maxBudget) && maxBudget > 0) {
    creators = creators.filter((c) => c.creator_profile.starting_price <= maxBudget);
  }

  if (minRating !== undefined && !isNaN(minRating) && minRating > 0) {
    creators = creators.filter((c) => c.creator_profile.rating >= minRating);
  }

  if (availability && availability !== 'all') {
    creators = creators.filter((c) => c.creator_profile.availability === availability);
  }

  if (experience && experience !== 'all') {
    creators = creators.filter((c) => c.creator_profile.experience_level === experience);
  }

  if (format && format !== 'all') {
    creators = creators.filter(
      (c) =>
        (c.creator_profile.content_formats &&
          c.creator_profile.content_formats.includes(format as any)) ||
        c.portfolio.some((p) => p.media_type === format)
    );
  }

  // Sorting
  if (sort === 'rating') {
    creators.sort((a, b) => b.creator_profile.rating - a.creator_profile.rating);
  } else if (sort === 'price_asc') {
    creators.sort((a, b) => a.creator_profile.starting_price - b.creator_profile.starting_price);
  } else if (sort === 'price_desc') {
    creators.sort((a, b) => b.creator_profile.starting_price - a.creator_profile.starting_price);
  } else if (sort === 'newest') {
    creators.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sort === 'relevance') {
    creators.sort(
      (a, b) =>
        b.creator_profile.review_count * b.creator_profile.rating -
        a.creator_profile.review_count * a.creator_profile.rating
    );
  } else {
    // Recommended
    creators.sort((a, b) => {
      if (a.creator_profile.featured !== b.creator_profile.featured) {
        return a.creator_profile.featured ? -1 : 1;
      }
      return b.creator_profile.rating - a.creator_profile.rating;
    });
  }

  const total = creators.length;
  const paginatedCreators = req.query.page ? creators.slice((page - 1) * limit, page * limit) : creators;

  res.json({
    creators: paginatedCreators,
    total,
    totalCount: total,
    page,
    limit,
    categoryCounts,
  });
});

// GET /api/v1/creators/:id
router.get('/:id', (req: Request, res: Response) => {
  const creatorId = String(req.params.id);
  const creator = db.getFullCreator(creatorId);
  if (!creator) {
    res.status(404).json({ error: 'Creator profile not found.' });
    return;
  }

  // Increment profile views
  const state = db.getState();
  const cp = state.creator_profiles.find((c) => c.creator_id === creatorId);
  if (cp) {
    cp.profile_views += 1;
    db.save();
  }

  res.json({ creator: db.getFullCreator(creatorId) });
});

export default router;
