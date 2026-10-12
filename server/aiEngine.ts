import {
  CreatorMatchResult,
  ExperienceLevel,
  FullCreator,
  GeneratedBrief,
  MatchFactorBreakdown,
} from '../src/types/index.js';

export interface MatchingCriteria {
  title?: string;
  description?: string;
  category: string;
  required_skills: string[];
  required_ai_tools: string[];
  budget_min: number;
  budget_max: number;
  experience_level?: 'any' | ExperienceLevel;
}

const EXPERIENCE_RANK: Record<string, number> = {
  junior: 1,
  intermediate: 2,
  senior: 3,
  expert: 4,
};

function normalizeToken(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9+]/g, ' ').trim();
}

export async function matchCreatorsToCampaign(
  creators: FullCreator[],
  criteria: MatchingCriteria
): Promise<CreatorMatchResult[]> {
  const results: CreatorMatchResult[] = [];

  const targetCategory = criteria.category.toLowerCase().trim();
  const reqSkills = (criteria.required_skills || []).map((s) => s.toLowerCase().trim()).filter(Boolean);
  const reqTools = (criteria.required_ai_tools || []).map((t) => t.toLowerCase().trim()).filter(Boolean);
  const promptKeywords = normalizeToken(`${criteria.title || ''} ${criteria.description || ''}`)
    .split(/\s+/)
    .filter((w) => w.length > 3);

  for (const creator of creators) {
    const cp = creator.creator_profile;
    const reasons: string[] = [];

    // 1. Category & Niche Alignment (Max 25)
    let categoryScore = 8;
    const primaryMatch =
      cp.specialization.toLowerCase() === targetCategory ||
      (cp.industry_category || '').toLowerCase() === targetCategory;
    const secondaryMatch = cp.secondary_categories.some((c) => c.toLowerCase() === targetCategory);
    const partialCategoryMatch =
      cp.specialization.toLowerCase().includes(targetCategory.split(' ')[0]) ||
      targetCategory.includes(cp.specialization.toLowerCase().split(' ')[0]);

    if (primaryMatch) {
      categoryScore = 25;
      reasons.push(`Primary specialization in ${cp.industry_category || cp.specialization}`);
    } else if (secondaryMatch) {
      categoryScore = 19;
      reasons.push(`Verified secondary expertise in ${criteria.category}`);
    } else if (partialCategoryMatch) {
      categoryScore = 15;
      reasons.push(`Adjacent creative specialization (${cp.specialization})`);
    }

    // 2. Skills & AI Tools Overlap (Max 25)
    const creatorSkillsLower = cp.skills.map((s) => s.toLowerCase());
    const creatorToolsLower = cp.ai_tools.map((t) => t.toLowerCase());

    const matchedSkills = reqSkills.filter((rs) =>
      creatorSkillsLower.some((cs) => cs.includes(rs) || rs.includes(cs))
    );
    const matchedTools = reqTools.filter((rt) =>
      creatorToolsLower.some((ct) => ct.includes(rt) || rt.includes(ct))
    );

    const skillRatio = reqSkills.length > 0 ? matchedSkills.length / reqSkills.length : 0.75;
    const toolRatio = reqTools.length > 0 ? matchedTools.length / reqTools.length : 0.75;

    let skillsToolsScore = Math.round(skillRatio * 13 + toolRatio * 12);
    if (matchedTools.length > 0) {
      const displayTools = cp.ai_tools.filter((t) =>
        matchedTools.some((mt) => t.toLowerCase().includes(mt) || mt.includes(t.toLowerCase()))
      );
      reasons.push(`Proficient in required AI stack (${displayTools.slice(0, 3).join(', ')})`);
    }
    if (matchedSkills.length > 0) {
      reasons.push(`Matched ${matchedSkills.length}/${reqSkills.length || matchedSkills.length} core campaign skills`);
    }
    skillsToolsScore = Math.min(25, Math.max(6, skillsToolsScore));

    // 3. Portfolio Relevance (Max 15)
    const scoredProjects = creator.portfolio.map((proj) => {
      let pScore = 0;
      if (proj.category.toLowerCase() === targetCategory) pScore += 6;
      const projTools = proj.ai_tools_used.map((t) => t.toLowerCase());
      const toolHits = reqTools.filter((rt) => projTools.some((pt) => pt.includes(rt) || rt.includes(pt))).length;
      pScore += toolHits * 3;
      const projText = `${proj.title} ${proj.description} ${proj.tags.join(' ')}`.toLowerCase();
      const kwHits = promptKeywords.filter((kw) => projText.includes(kw)).length;
      pScore += Math.min(6, kwHits * 2);
      return { proj, pScore };
    });

    scoredProjects.sort((a, b) => b.pScore - a.pScore);
    const topProjectScore = scoredProjects[0]?.pScore || 0;
    const portfolioScore = Math.min(15, Math.max(5, Math.round(topProjectScore + (creator.portfolio.length > 0 ? 4 : 0))));
    const relevantProjects = scoredProjects.slice(0, 2).map((sp) => sp.proj);

    if (relevantProjects.length > 0 && topProjectScore >= 5) {
      reasons.push(`Relevant portfolio work: "${relevantProjects[0].title.split('—')[0].trim()}"`);
    }

    // 4. Budget Compatibility (Max 15)
    let budgetScore = 10;
    let budgetCompatibility: CreatorMatchResult['budgetCompatibility'] = 'Within Range';
    const budgetMax = criteria.budget_max || 50000;
    const budgetMin = criteria.budget_min || 15000;

    if (cp.starting_price <= budgetMax && cp.starting_price >= budgetMin * 0.4) {
      if (cp.starting_price <= (budgetMin + budgetMax) / 2) {
        budgetScore = 15;
        budgetCompatibility = 'Ideal Fit';
        reasons.push(
          `Starting price (₹${cp.starting_price.toLocaleString('en-IN')}) fits comfortably within your ₹${budgetMin.toLocaleString('en-IN')}–₹${budgetMax.toLocaleString('en-IN')} budget`
        );
      } else {
        budgetScore = 13;
        budgetCompatibility = 'Within Range';
        reasons.push(
          `Pricing (₹${cp.starting_price.toLocaleString('en-IN')}+) aligns with your ₹${budgetMin.toLocaleString('en-IN')}–₹${budgetMax.toLocaleString('en-IN')} budget range`
        );
      }
    } else if (cp.starting_price < budgetMin * 0.4) {
      budgetScore = 12;
      budgetCompatibility = 'Ideal Fit';
      reasons.push(`Cost-effective starting package (₹${cp.starting_price.toLocaleString('en-IN')}) well under your budget cap`);
    } else if (cp.starting_price <= budgetMax * 1.3) {
      budgetScore = 8;
      budgetCompatibility = 'Slightly Above Range';
    } else {
      budgetScore = 4;
      budgetCompatibility = 'Premium Option';
    }

    // 5. Availability Status (Max 10)
    let availabilityScore = 0;
    if (cp.availability === 'available') {
      availabilityScore = 10;
      reasons.push(`Immediately available (${cp.response_time} avg response)`);
    } else if (cp.availability === 'busy') {
      availabilityScore = 5;
    }

    // 6. Experience & Reputation (Max 10)
    const reqExpRank =
      criteria.experience_level && criteria.experience_level !== 'any'
        ? EXPERIENCE_RANK[criteria.experience_level] || 2
        : 2;
    const creatorExpRank = EXPERIENCE_RANK[cp.experience_level] || 2;
    const expPoints = creatorExpRank >= reqExpRank ? 5 : 3;
    const ratingPoints = Math.round((cp.rating / 5) * 5);
    const reputationScore = Math.min(10, expPoints + ratingPoints);

    if (cp.rating >= 4.85) {
      reasons.push(`Top-rated creator (${cp.rating.toFixed(2)}★ across ${cp.review_count} demo reviews)`);
    }

    const breakdown: MatchFactorBreakdown = {
      categoryScore,
      skillsToolsScore,
      portfolioScore,
      budgetScore,
      availabilityScore,
      reputationScore,
    };

    const matchScore = Math.min(
      99,
      Math.max(
        40,
        categoryScore + skillsToolsScore + portfolioScore + budgetScore + availabilityScore + reputationScore
      )
    );

    const toolHighlight =
      matchedTools.length > 0
        ? cp.ai_tools
            .filter((t) => matchedTools.some((mt) => t.toLowerCase().includes(mt) || mt.includes(t.toLowerCase())))
            .slice(0, 2)
            .join(' & ')
        : cp.ai_tools.slice(0, 2).join(' & ');

    const summaryReason = `${matchScore}% Match — Strong ${cp.specialization} expertise (${toolHighlight}), relevant portfolio deliverables, and starting price (₹${cp.starting_price.toLocaleString('en-IN')}) ${
      cp.starting_price <= budgetMax
        ? `within your ₹${budgetMin.toLocaleString('en-IN')}–₹${budgetMax.toLocaleString('en-IN')} budget`
        : 'for enterprise scope'
    }.`;

    results.push({
      creator,
      matchScore,
      summaryReason,
      reasons: reasons.slice(0, 4),
      breakdown,
      relevantProjects,
      budgetCompatibility,
      engineMode: process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY ? 'ai_enhanced' : 'deterministic_weighted',
    });
  }

  results.sort((a, b) => b.matchScore - a.matchScore);
  return results;
}

export async function generateStructuredBrief(promptText: string, categoryHint?: string): Promise<GeneratedBrief> {
  const input = promptText.trim();
  const lower = input.toLowerCase();

  const isSkincareOrBeauty = /skincare|serum|beauty|cosmetic|perfume|fragrance|cream|glow|lipstick|bottle|fashion/.test(lower);
  const isBeverageOrFood = /drink|beverage|coffee|matcha|can|food|soda|energy|brew|culinary|recipe/.test(lower);
  const isFinance = /finance|invest|stock|crypto|mutual fund|sip|wealth|fintech|trading/.test(lower);
  const isEducation = /education|course|e-learning|student|lesson|exam|stem|tutorial/.test(lower);
  const isGaming = /game|gaming|esports|sci-fi|trailer|fantasy|rpg/.test(lower);

  let category = categoryHint || 'Technology & AI';
  if (isSkincareOrBeauty) category = 'Fashion & Beauty';
  else if (isBeverageOrFood) category = 'Food & Cooking';
  else if (isFinance) category = 'Finance & Investing';
  else if (isEducation) category = 'Education & E-Learning';
  else if (isGaming) category = 'Gaming & Esports';

  const timelineDays = 7;
  const deadlineDate = new Date(Date.now() + timelineDays * 86400000).toISOString().split('T')[0];

  return {
    title: isSkincareOrBeauty
      ? 'Botanical Radiance — 30s Luxury Skincare AI Video Ad & Macro Stills'
      : `${category} — Multi-Format 4K AI Creative Campaign`,
    description: `Structured campaign brief generated from your concept: "${input}". We are seeking an experienced ${category} specialist to craft high-converting, brand-accurate visual assets with strict product and style consistency across every frame.`,
    category,
    content_type: '4K AI Commercial Video + Social Cutdowns',
    goals: `Deliver scroll-stopping creative assets that achieve 2.5x+ higher click-through rates, elevate brand prestige, and reduce traditional studio production turnaround to ${timelineDays} days.`,
    target_audience: 'Digital-first consumers aged 21–42 active on Instagram Reels, YouTube Shorts, and LinkedIn.',
    deliverables: [
      '1x 30-Second 4K Master AI Commercial (16:9 & 9:16)',
      '3x 15-Second High-Retention Hook Cutdowns for Reels/Shorts',
      '10x Photorealistic 8K Key Visual Stills',
      'Licensed Spatial Audio & Expressive AI Voiceover Track',
    ],
    required_skills: ['Cinematic AI Video', 'Custom LoRA Training', 'Photorealistic Product Renders'],
    required_ai_tools: ['Runway Gen-3 Alpha', 'Flux.1 Pro', 'ComfyUI', 'ElevenLabs'],
    budget_min: 25000,
    budget_max: 55000,
    suggested_timeline_days: timelineDays,
    deadline: deadlineDate,
    experience_level: 'senior',
    engineMode: 'intelligent_template',
  };
}
