import { FullCreator } from '../../src/types/index.js';

export interface MatchingCriteria {
  title?: string;
  description?: string;
  category?: string;
  required_skills?: string[];
  required_ai_tools?: string[];
  budget_min?: number;
  budget_max?: number;
  experience_level?: string;
  availability?: string;
}

export interface FactorBreakdown {
  skillsScore: number;       // out of 30
  portfolioScore: number;    // out of 30
  budgetScore: number;       // out of 20
  toolsScore: number;        // out of 10
  availabilityScore: number; // out of 10
}

export interface CreatorMatchResult {
  creator: FullCreator;
  matchScore: number; // 0 - 100
  factors: FactorBreakdown;
  matchSummary: string;
  relevantPortfolioIds: string[];
  budgetCompatibility: 'optimal' | 'within_range' | 'above_budget';
  availability: string;
}

export function computeRecommendations(
  creators: FullCreator[],
  criteria: MatchingCriteria,
  limit = 12
): CreatorMatchResult[] {
  const reqCategory = (criteria.category || '').toLowerCase().trim();
  const reqSkills = (criteria.required_skills || []).map((s) => s.toLowerCase().trim()).filter(Boolean);
  const reqTools = (criteria.required_ai_tools || []).map((t) => t.toLowerCase().trim()).filter(Boolean);
  const budgetMin = criteria.budget_min || 0;
  const budgetMax = criteria.budget_max || 100000;
  const reqDesc = `${criteria.title || ''} ${criteria.description || ''}`.toLowerCase();

  const results: CreatorMatchResult[] = creators.map((creator) => {
    const cp = creator.creator_profile;

    // 1. Skills & Specialization Alignment (30 pts)
    let skillsScore = 0;
    const catMatch =
      reqCategory &&
      (cp.specialization.toLowerCase() === reqCategory ||
        (cp.industry_category && cp.industry_category.toLowerCase() === reqCategory) ||
        cp.secondary_categories.some((c) => c.toLowerCase() === reqCategory));

    if (catMatch) skillsScore += 16;
    else if (!reqCategory || reqCategory === 'all') skillsScore += 12;

    const creatorSkills = cp.skills.map((s) => s.toLowerCase());
    let matchedSkillsCount = 0;
    if (reqSkills.length > 0) {
      reqSkills.forEach((rs) => {
        if (creatorSkills.some((cs) => cs.includes(rs) || rs.includes(cs))) {
          matchedSkillsCount++;
        }
      });
      skillsScore += Math.min(14, (matchedSkillsCount / reqSkills.length) * 14);
    } else {
      skillsScore += Math.min(14, cp.skills.length * 3.5);
    }
    skillsScore = Math.min(30, Math.round(skillsScore));

    // 2. Portfolio Relevance (30 pts)
    let portfolioScore = 0;
    const relevantIds: string[] = [];

    creator.portfolio.forEach((proj) => {
      let isRelevant = false;
      const projCat = proj.category.toLowerCase();
      if (reqCategory && (projCat.includes(reqCategory) || reqCategory.includes(projCat))) {
        isRelevant = true;
      }
      if (reqDesc) {
        const projText = `${proj.title} ${proj.description} ${proj.tags.join(' ')}`.toLowerCase();
        const overlap = reqSkills.some((s) => projText.includes(s));
        if (overlap) isRelevant = true;
      }
      if (isRelevant) {
        relevantIds.push(proj.id);
      }
    });

    if (creator.portfolio.length > 0) {
      const matchRatio = relevantIds.length > 0 ? relevantIds.length / creator.portfolio.length : 0.4;
      portfolioScore = Math.min(30, Math.round(15 + matchRatio * 15));
    } else {
      portfolioScore = 10;
    }

    // 3. Budget Compatibility (20 pts)
    let budgetScore = 0;
    let budgetCompatibility: 'optimal' | 'within_range' | 'above_budget' = 'within_range';
    const startingPrice = cp.starting_price;

    if (startingPrice >= budgetMin && startingPrice <= budgetMax) {
      budgetScore = 20;
      budgetCompatibility = 'optimal';
    } else if (startingPrice < budgetMin) {
      budgetScore = 18;
      budgetCompatibility = 'within_range';
    } else if (startingPrice <= budgetMax * 1.25) {
      budgetScore = 12;
      budgetCompatibility = 'within_range';
    } else {
      budgetScore = 6;
      budgetCompatibility = 'above_budget';
    }

    // 4. Required AI Tools Overlap (10 pts)
    let toolsScore = 0;
    const creatorTools = cp.ai_tools.map((t) => t.toLowerCase());
    if (reqTools.length > 0) {
      let toolOverlap = 0;
      reqTools.forEach((rt) => {
        if (creatorTools.some((ct) => ct.includes(rt) || rt.includes(ct))) {
          toolOverlap++;
        }
      });
      toolsScore = Math.min(10, Math.round((toolOverlap / reqTools.length) * 10));
    } else {
      toolsScore = Math.min(10, Math.round(cp.ai_tools.length * 2.5));
    }

    // 5. Availability & Responsiveness (10 pts)
    let availabilityScore = 0;
    if (cp.availability === 'available') {
      availabilityScore = 10;
    } else if (cp.availability === 'busy') {
      availabilityScore = 6;
    } else {
      availabilityScore = 2;
    }

    // Total 100-point normalized score
    const totalScore = Math.min(100, Math.max(0, skillsScore + portfolioScore + budgetScore + toolsScore + availabilityScore));

    const matchSummaryParts: string[] = [];
    if (catMatch) matchSummaryParts.push(`Direct ${cp.industry_category || cp.specialization} specialist`);
    if (matchedSkillsCount > 0) matchSummaryParts.push(`Mastery in ${matchedSkillsCount} requested skills`);
    if (budgetCompatibility === 'optimal') matchSummaryParts.push(`Starting price within budget`);
    if (cp.availability === 'available') matchSummaryParts.push('Available immediately');

    return {
      creator,
      matchScore: totalScore,
      factors: {
        skillsScore,
        portfolioScore,
        budgetScore,
        toolsScore,
        availabilityScore,
      },
      matchSummary: matchSummaryParts.join(' • ') || 'Verified AI creative portfolio match',
      relevantPortfolioIds: relevantIds.length > 0 ? relevantIds : creator.portfolio.map((p) => p.id),
      budgetCompatibility,
      availability: cp.availability,
    };
  });

  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
}
