import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Wand2,
  Sparkles,
  CheckCircle2,
  Info,
  Sliders,
  ArrowUpRight,
} from 'lucide-react';
import {
  AI_TOOLS_LIST,
  Campaign,
  CreatorMatchResult,
  CREATOR_CATEGORIES,
} from '../types';
import { apiRequest } from '../lib/api';

export const AIMatchingStudioPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialCampaignId = searchParams.get('campaignId') || '';

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(initialCampaignId);
  const [mode, setMode] = useState<'campaign' | 'custom'>(initialCampaignId ? 'campaign' : 'custom');

  // Custom criteria state
  const [category, setCategory] = useState<string>('AI Video Generation');
  const [budgetMin, setBudgetMin] = useState<number>(500);
  const [budgetMax, setBudgetMax] = useState<number>(1600);
  const [selectedTools, setSelectedTools] = useState<string[]>([
    'Runway Gen-3 Alpha',
    'Flux.1 Pro',
    'ComfyUI',
  ]);
  const [keywords, setKeywords] = useState('Luxury skincare video commercial with custom product LoRA');

  const [matches, setMatches] = useState<CreatorMatchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiRequest<{ campaigns: Campaign[] }>('/api/campaigns').then((res) => {
      const openList = res.campaigns || [];
      setCampaigns(openList);
      if (!selectedCampaignId && openList[0]) {
        setSelectedCampaignId(openList[0].id);
      }
    });
  }, [selectedCampaignId]);

  const runMatching = async () => {
    setLoading(true);
    try {
      const payload =
        mode === 'campaign' && selectedCampaignId
          ? { campaignId: selectedCampaignId }
          : {
              title: keywords,
              description: keywords,
              category,
              required_skills: ['Cinematic AI Video', 'Custom LoRA Training', 'Product Commercials'],
              required_ai_tools: selectedTools,
              budget_min: budgetMin,
              budget_max: budgetMax,
            };

      const res = await apiRequest<{ matches: CreatorMatchResult[] }>('/api/ai/match-creators', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setMatches(res.matches || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runMatching();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedCampaignId]);

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#7C4DFF]/40 shadow-glow-purple">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C4DFF]/20 border border-[#7C4DFF]/40 text-xs font-semibold text-[#9D7BFF]">
              <Wand2 className="w-3.5 h-3.5 text-[#FF7A1A]" /> Transparent 6-Factor AI Creator Matching Engine
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
              Intelligent AI Creator Matching
            </h1>
            <p className="text-sm text-[#B9B3D0] max-w-2xl">
              Evaluate creators from 0–100 across Category Alignment (25pt), Skills & AI Tools (25pt), Portfolio Relevance (15pt), Budget Fit (15pt), Availability (10pt), and Verified Rating (10pt).
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0B081D]/80 border border-white/10 text-xs text-[#B9B3D0] max-w-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#FF7A1A] shrink-0 mt-0.5" />
            <span>
              <strong className="text-white">Transparency Notice:</strong> Match scores are deterministic weighted recommendations enhanced by AI analysis, not guarantees of campaign outcomes.
            </span>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="mt-6 pt-6 border-t border-white/10 space-y-5">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setMode('custom')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                mode === 'custom'
                  ? 'bg-[#7C4DFF] text-white'
                  : 'bg-[#0B081D] text-[#B9B3D0] border border-white/10'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 inline mr-1.5" />
              Match by Custom Campaign Requirements
            </button>
            <button
              onClick={() => setMode('campaign')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                mode === 'campaign'
                  ? 'bg-[#7C4DFF] text-white'
                  : 'bg-[#0B081D] text-[#B9B3D0] border border-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
              Match Against an Existing Published Brief
            </button>
          </div>

          {mode === 'campaign' ? (
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="input-dark flex-1 text-sm"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} — {c.category} (${c.budget_min}–${c.budget_max})
                  </option>
                ))}
              </select>
              <button onClick={runMatching} className="btn-primary-orange px-6 py-2.5 rounded-xl text-sm">
                Recalculate Matches
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5">
                  <label className="text-xs text-[#B9B3D0] block mb-1">Campaign Concept / Keywords</label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="input-dark w-full text-sm"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="text-xs text-[#B9B3D0] block mb-1">Target AI Specialization</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-dark w-full text-sm"
                  >
                    {CREATOR_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="text-xs text-[#B9B3D0] block mb-1">Max Budget ($ USD)</label>
                  <input
                    type="number"
                    min={200}
                    step={50}
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(Number(e.target.value))}
                    className="input-dark w-full text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#B9B3D0] block mb-1.5">Required AI Tools</label>
                <div className="flex flex-wrap gap-1.5">
                  {AI_TOOLS_LIST.slice(0, 10).map((tool) => {
                    const active = selectedTools.includes(tool);
                    return (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => toggleTool(tool)}
                        className={`px-3 py-1 rounded-lg text-xs border transition ${
                          active
                            ? 'bg-[#7C4DFF] text-white border-[#9D7BFF]'
                            : 'bg-[#0B081D] text-[#B9B3D0] border-white/10'
                        }`}
                      >
                        {tool}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={runMatching}
                disabled={loading}
                className="btn-primary-orange px-6 py-2.5 rounded-xl text-sm inline-flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                {loading ? 'Scoring Creators...' : 'Run AI Creator Matching'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= MATCH RESULTS LIST ================= */}
      <div className="space-y-5">
        {matches.map((m, idx) => {
          const c = m.creator;
          const cp = c.creator_profile;
          const b = m.breakdown;
          return (
            <div
              key={c.id}
              className="glass-card glass-card-hover rounded-3xl p-6 border border-white/15 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
            >
              {/* Left 4 Cols: Creator Summary & Score Ring */}
              <div className="lg:col-span-4 flex items-start gap-4">
                <div className="relative shrink-0">
                  <img
                    src={c.avatar_url}
                    alt={c.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#7C4DFF]"
                  />
                  <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#FF7A1A] text-white font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/creators/${c.id}`}
                      className="font-display font-bold text-lg text-white hover:text-[#9D7BFF]"
                    >
                      {c.name}
                    </Link>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-[#7C4DFF] to-[#FF7A1A] text-white">
                      {m.matchScore}% Match
                    </span>
                  </div>
                  <p className="text-xs text-[#9D7BFF] font-medium">{cp.title}</p>
                  <div className="flex items-center gap-3 text-xs text-[#B9B3D0] pt-1">
                    <span>Starting: <strong className="text-white">${cp.starting_price}</strong></span>
                    <span>•</span>
                    <span className="capitalize text-emerald-400">● {cp.availability}</span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">{cp.rating}★</span>
                  </div>
                </div>
              </div>

              {/* Middle 5 Cols: Match Explanation & 6-Factor Bars */}
              <div className="lg:col-span-5 space-y-3">
                <div className="p-3 rounded-2xl bg-[#0B081D]/80 border border-[#7C4DFF]/30 text-xs text-white leading-relaxed">
                  {m.summaryReason}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-[#0B081D]/50 border border-white/5">
                    <span className="text-[#B9B3D0] block">Category Fit</span>
                    <span className="font-bold text-white">{b.categoryScore}/25 pts</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0B081D]/50 border border-white/5">
                    <span className="text-[#B9B3D0] block">AI Tools & Skills</span>
                    <span className="font-bold text-white">{b.skillsToolsScore}/25 pts</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0B081D]/50 border border-white/5">
                    <span className="text-[#B9B3D0] block">Portfolio Match</span>
                    <span className="font-bold text-white">{b.portfolioScore}/15 pts</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0B081D]/50 border border-white/5">
                    <span className="text-[#B9B3D0] block">Budget Alignment</span>
                    <span className="font-bold text-emerald-400">{b.budgetScore}/15 ({m.budgetCompatibility})</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0B081D]/50 border border-white/5">
                    <span className="text-[#B9B3D0] block">Availability</span>
                    <span className="font-bold text-white">{b.availabilityScore}/10 pts</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0B081D]/50 border border-white/5">
                    <span className="text-[#B9B3D0] block">Reputation</span>
                    <span className="font-bold text-amber-400">{b.reputationScore}/10 pts</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {m.reasons.map((r, i) => (
                    <span key={i} className="text-[11px] text-[#B9B3D0] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right 3 Cols: Relevant Portfolio Sample & CTA */}
              <div className="lg:col-span-3 flex flex-col justify-between gap-3">
                {m.relevantProjects[0] && (
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#0B081D]/70 border border-white/10">
                    <img
                      src={m.relevantProjects[0].thumbnail_url}
                      alt={m.relevantProjects[0].title}
                      className="w-14 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] text-[#9D7BFF] uppercase block">Matched Sample</span>
                      <span className="text-xs font-semibold text-white truncate block">
                        {m.relevantProjects[0].title}
                      </span>
                    </div>
                  </div>
                )}

                <Link
                  to={`/creators/${c.id}`}
                  className="btn-electric py-2.5 px-4 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5"
                >
                  Inspect Portfolio & Invite <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
